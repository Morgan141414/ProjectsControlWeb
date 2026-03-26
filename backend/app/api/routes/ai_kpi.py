import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.routes.reports import compute_org_kpi_report
from app.core.deps import get_current_user, get_db, get_org_membership, MANAGEMENT_ROLES
from app.core.time import utc_now_naive
from app.models.ai_score import AIScoreSnapshot
from app.models.enums import ScorePeriod
from app.models.user import User
from app.schemas.ai_kpi import AIKPIAnomaly, AIKPIReport, AIKPIUserScore
from app.schemas.ai_score import (
    AIDriverImpact,
    AIChangeReason,
    AIInterpretation,
    AIScoreBaseline,
    AIScoreRebuildResponse,
    AIScoreSnapshotResponse,
    AIScoreTrendPoint,
    AIScorecard,
)

router = APIRouter(prefix="/orgs/{org_id}/ai", tags=["ai"])


def _safe_ratio(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def _score_user(row) -> tuple[int, float]:
    active_ratio = _safe_ratio(row.active_seconds, row.observed_seconds)
    tasks_factor = min(row.tasks_done / 5, 1.0) if row.tasks_done else 0.0
    score = int(round(100 * (0.45 * row.completion_rate + 0.35 * active_ratio + 0.2 * tasks_factor)))
    score = max(0, min(score, 100))
    return score, active_ratio


def _median(values: list[int]) -> float:
    if not values:
        return 0.0
    values_sorted = sorted(values)
    mid = len(values_sorted) // 2
    if len(values_sorted) % 2 == 1:
        return float(values_sorted[mid])
    return (values_sorted[mid - 1] + values_sorted[mid]) / 2.0


def _period_bounds(as_of: date, period: ScorePeriod) -> tuple[date, date]:
    if period == ScorePeriod.weekly:
        start = as_of - timedelta(days=as_of.weekday())
        end = start + timedelta(days=6)
        return start, end
    return as_of, as_of


def _iter_periods(start_date: date, end_date: date, period: ScorePeriod) -> list[tuple[date, date]]:
    if start_date > end_date:
        return []

    periods: list[tuple[date, date]] = []
    if period == ScorePeriod.weekly:
        current_start = start_date - timedelta(days=start_date.weekday())
        while current_start <= end_date:
            current_end = current_start + timedelta(days=6)
            if current_end < start_date:
                current_start += timedelta(days=7)
                continue
            periods.append((max(current_start, start_date), min(current_end, end_date)))
            current_start += timedelta(days=7)
        return periods

    current_day = start_date
    while current_day <= end_date:
        periods.append((current_day, current_day))
        current_day += timedelta(days=1)
    return periods


def _tasks_factor(tasks_done: int) -> float:
    if tasks_done <= 0:
        return 0.0
    return min(tasks_done / 5, 1.0)


def _upsert_snapshot(
    db: Session,
    org_id: str,
    period_type: ScorePeriod,
    period_start: date,
    period_end: date,
    user_row,
) -> AIScoreSnapshot:
    score, active_ratio = _score_user(user_row)
    drivers_json = json.dumps({}, ensure_ascii=True)
    existing = (
        db.query(AIScoreSnapshot)
        .filter(
            AIScoreSnapshot.org_id == org_id,
            AIScoreSnapshot.user_id == user_row.user_id,
            AIScoreSnapshot.period_type == period_type,
            AIScoreSnapshot.period_start == period_start,
            AIScoreSnapshot.period_end == period_end,
        )
        .first()
    )

    if existing:
        snapshot = existing
    else:
        snapshot = AIScoreSnapshot(
            org_id=org_id,
            user_id=user_row.user_id,
            period_type=period_type,
            period_start=period_start,
            period_end=period_end,
            score=score,
            completion_rate=user_row.completion_rate,
            active_ratio=active_ratio,
            tasks_total=user_row.tasks_total,
            tasks_done=user_row.tasks_done,
            observed_seconds=user_row.observed_seconds,
            idle_seconds=user_row.idle_seconds,
            active_seconds=user_row.active_seconds,
            sessions_count=user_row.sessions_count,
            drivers_json=drivers_json,
        )
        db.add(snapshot)

    snapshot.score = score
    snapshot.completion_rate = user_row.completion_rate
    snapshot.active_ratio = active_ratio
    snapshot.tasks_total = user_row.tasks_total
    snapshot.tasks_done = user_row.tasks_done
    snapshot.observed_seconds = user_row.observed_seconds
    snapshot.idle_seconds = user_row.idle_seconds
    snapshot.active_seconds = user_row.active_seconds
    snapshot.sessions_count = user_row.sessions_count
    snapshot.drivers_json = drivers_json
    snapshot.generated_at = utc_now_naive()

    return snapshot


def _load_trend(
    db: Session,
    org_id: str,
    user_id: str,
    period_type: ScorePeriod,
    period_start: date,
    limit: int,
) -> list[AIScoreTrendPoint]:
    if limit <= 0:
        return []

    snapshots = (
        db.query(AIScoreSnapshot)
        .filter(
            AIScoreSnapshot.org_id == org_id,
            AIScoreSnapshot.user_id == user_id,
            AIScoreSnapshot.period_type == period_type,
            AIScoreSnapshot.period_start <= period_start,
        )
        .order_by(AIScoreSnapshot.period_start.desc())
        .limit(limit)
        .all()
    )
    snapshots.reverse()
    return [AIScoreTrendPoint(period_start=item.period_start, score=item.score) for item in snapshots]


def _load_baseline(
    db: Session,
    org_id: str,
    user_id: str,
    period_type: ScorePeriod,
    period_start: date,
) -> AIScoreBaseline | None:
    baseline_limit = 7 if period_type == ScorePeriod.daily else 4
    snapshots = (
        db.query(AIScoreSnapshot)
        .filter(
            AIScoreSnapshot.org_id == org_id,
            AIScoreSnapshot.user_id == user_id,
            AIScoreSnapshot.period_type == period_type,
            AIScoreSnapshot.period_start < period_start,
        )
        .order_by(AIScoreSnapshot.period_start.desc())
        .limit(baseline_limit)
        .all()
    )

    if not snapshots:
        return None

    avg_score = sum(item.score for item in snapshots) / len(snapshots)
    avg_completion = sum(item.completion_rate for item in snapshots) / len(snapshots)
    avg_active = sum(item.active_ratio for item in snapshots) / len(snapshots)
    avg_tasks = sum(item.tasks_done for item in snapshots) / len(snapshots)

    return AIScoreBaseline(
        avg_score=avg_score,
        avg_completion_rate=avg_completion,
        avg_active_ratio=avg_active,
        avg_tasks_done=avg_tasks,
    )


def _build_reasons(current: AIScoreSnapshot, baseline: AIScoreBaseline | None) -> list[AIChangeReason]:
    if not baseline:
        return []

    completion_delta = current.completion_rate - baseline.avg_completion_rate
    tasks_delta = _tasks_factor(current.tasks_done) - _tasks_factor(int(round(baseline.avg_tasks_done)))

    completion_points = completion_delta * 100 * 0.45
    tasks_points = tasks_delta * 100 * 0.2

    reasons = [
        AIChangeReason(
            code="completion_rate",
            title="Завершение задач",
            detail=f"Изменение доли выполненных задач на {completion_delta * 100:.1f}%.",
            delta=completion_points,
        ),
        AIChangeReason(
            code="task_volume",
            title="Объем задач",
            detail=f"Изменение выполненных задач на {current.tasks_done - baseline.avg_tasks_done:.1f}.",
            delta=tasks_points,
        ),
    ]

    threshold = 1.5
    filtered = [item for item in reasons if abs(item.delta) >= threshold]
    filtered.sort(key=lambda item: abs(item.delta), reverse=True)
    return filtered[:3]


def _trend_summary(points: list[AIScoreTrendPoint]) -> tuple[str, str]:
    if len(points) < 3:
        return "Недостаточно данных для тренда.", "низкая"

    recent = points[-3:]
    earlier = points[:-3]
    recent_avg = sum(point.score for point in recent) / len(recent)
    earlier_avg = sum(point.score for point in earlier) / len(earlier) if earlier else recent_avg
    delta = recent_avg - earlier_avg

    stability = "высокая"
    if abs(delta) >= 8:
        stability = "умеренная"
    if abs(delta) >= 15:
        stability = "низкая"

    if delta >= 8:
        return "Наблюдается устойчивый рост относительно предыдущих периодов.", stability
    if delta <= -8:
        return "Есть устойчивое снижение относительно предыдущих периодов.", stability
    return "Показатели остаются стабильными, без выраженного тренда.", stability


def _build_interpretation(
    scorecard: AIScoreSnapshot,
    baseline: AIScoreBaseline | None,
    trend_points: list[AIScoreTrendPoint],
    mode: str,
    team_median_score: float | None,
) -> AIInterpretation:
    score = scorecard.score
    if baseline and baseline.avg_score:
        delta_pct = ((score - baseline.avg_score) / baseline.avg_score) * 100
        vs_baseline = f"{delta_pct:+.0f}% относительно собственной нормы."
        if delta_pct > 0:
            vs_baseline = f"Рост на {abs(delta_pct):.0f}% относительно собственной нормы."
        elif delta_pct < 0:
            vs_baseline = f"Снижение на {abs(delta_pct):.0f}% относительно собственной нормы."
    else:
        delta_pct = None
        vs_baseline = "Недостаточно данных для расчета собственной нормы."

    trend_text, stability = _trend_summary(trend_points)

    summary_lines = [
        f"Текущий score: {score}.",
        vs_baseline,
        trend_text,
    ]

    suggestion = None
    if delta_pct is not None:
        if delta_pct <= -8:
            suggestion = "Опционально: можно сократить параллельные задачи и выделить фокус-блоки в расписании."
        elif delta_pct >= 8:
            suggestion = "Опционально: полезно сохранить текущие практики распределения задач и времени."
        else:
            suggestion = "Опционально: можно продолжать текущий ритм, наблюдая за стабильностью тренда."

    overload_risk = None
    if mode == "executive":
        overload_risk = "не выявлен"

        if team_median_score is not None:
            summary_lines.append(f"Медиана команды: {team_median_score:.0f}.")
        summary_lines.append(f"Стабильность: {stability}.")
        if overload_risk:
            summary_lines.append(f"Риск перегрузки: {overload_risk}.")

    executive_summary = " ".join(summary_lines)

    return AIInterpretation(
        mode=mode,
        executive_summary=executive_summary,
        vs_baseline=vs_baseline,
        primary_drivers=[],
        trend=trend_text,
        suggestion=suggestion,
        stability=stability if mode == "executive" else None,
        team_median_score=team_median_score if mode == "executive" else None,
        overload_risk=overload_risk if mode == "executive" else None,
    )


@router.get("/kpi", response_model=AIKPIReport)
def ai_kpi(
    org_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    team_id: str | None = None,
    project_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIKPIReport:
    membership = get_org_membership(org_id, current_user, db)

    report = compute_org_kpi_report(
        db,
        org_id,
        start_date=start_date,
        end_date=end_date,
        team_id=team_id,
        project_id=project_id,
    )

    if membership.role not in MANAGEMENT_ROLES:
        report.users = [row for row in report.users if row.user_id == current_user.id]

    anomalies: list[AIKPIAnomaly] = []
    user_scores: list[AIKPIUserScore] = []

    for row in report.users:
        score, active_ratio = _score_user(row)

        if row.tasks_total >= 3 and row.completion_rate < 0.3:
            anomalies.append(
                AIKPIAnomaly(
                    code="low_completion",
                    severity="high",
                    title="Низкое завершение задач",
                    detail=f"Выполнено {row.tasks_done} из {row.tasks_total} задач.",
                    user_id=row.user_id,
                )
            )

        user_scores.append(
            AIKPIUserScore(
                user_id=row.user_id,
                full_name=row.full_name,
                sessions_count=row.sessions_count,
                tasks_total=row.tasks_total,
                tasks_done=row.tasks_done,
                completion_rate=row.completion_rate,
                observed_seconds=row.observed_seconds,
                idle_seconds=row.idle_seconds,
                active_seconds=row.active_seconds,
                active_ratio=active_ratio,
                score=score,
            )
        )

    org_score = int(round(sum(item.score for item in user_scores) / len(user_scores))) if user_scores else 0

    return AIKPIReport(
        org_id=org_id,
        start_date=report.start_date,
        end_date=report.end_date,
        team_id=team_id,
        project_id=project_id,
        generated_at=utc_now_naive(),
        org_score=org_score,
        users=user_scores,
        anomalies=anomalies,
    )


@router.post("/scorecards/rebuild", response_model=AIScoreRebuildResponse)
def rebuild_scorecards(
    org_id: str,
    start_date: date,
    end_date: date,
    period: ScorePeriod = ScorePeriod.daily,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIScoreRebuildResponse:
    membership = get_org_membership(org_id, current_user, db)
    if membership.role not in MANAGEMENT_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed")

    snapshots_count = 0
    periods = _iter_periods(start_date, end_date, period)
    for period_start, period_end in periods:
        report = compute_org_kpi_report(
            db,
            org_id,
            start_date=period_start,
            end_date=period_end,
        )
        for row in report.users:
            _upsert_snapshot(
                db,
                org_id=org_id,
                period_type=period,
                period_start=period_start,
                period_end=period_end,
                user_row=row,
            )
            snapshots_count += 1

    db.commit()
    return AIScoreRebuildResponse(
        org_id=org_id,
        period_type=period.value,
        start_date=start_date,
        end_date=end_date,
        snapshots_count=snapshots_count,
    )


@router.get("/scorecards", response_model=list[AIScorecard])
def scorecards(
    org_id: str,
    period: ScorePeriod = ScorePeriod.daily,
    as_of: date | None = None,
    user_id: str | None = None,
    mode: str = "employee",
    role_profile: str = "developer",
    trend_limit: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AIScorecard]:
    membership = get_org_membership(org_id, current_user, db)
    if membership.role not in MANAGEMENT_ROLES:
        user_id = current_user.id

    if as_of is None:
        as_of = date.today()

    mode = mode.strip().lower()
    if mode not in {"employee", "executive"}:
        raise HTTPException(status_code=400, detail="Invalid mode")

    period_start, period_end = _period_bounds(as_of, period)
    report = compute_org_kpi_report(
        db,
        org_id,
        start_date=period_start,
        end_date=period_end,
    )

    if user_id:
        report.users = [row for row in report.users if row.user_id == user_id]

    snapshots: dict[str, AIScoreSnapshot] = {}
    for row in report.users:
        snapshots[row.user_id] = _upsert_snapshot(
            db,
            org_id=org_id,
            period_type=period,
            period_start=period_start,
            period_end=period_end,
            user_row=row,
        )

    db.commit()

    result: list[AIScorecard] = []
    team_median_score = None
    if mode == "executive" and report.users:
        scores = [snapshots[row.user_id].score for row in report.users]
        scores_sorted = sorted(scores)
        mid = len(scores_sorted) // 2
        if len(scores_sorted) % 2 == 1:
            team_median_score = float(scores_sorted[mid])
        else:
            team_median_score = (scores_sorted[mid - 1] + scores_sorted[mid]) / 2.0

    for row in report.users:
        snapshot = snapshots[row.user_id]
        baseline = _load_baseline(db, org_id, row.user_id, period, period_start)
        reasons = _build_reasons(snapshot, baseline)
        trend = _load_trend(db, org_id, row.user_id, period, period_start, trend_limit)
        interpretation = _build_interpretation(
            snapshot,
            baseline,
            trend,
            mode,
            team_median_score,
        )
        delta_score = None
        if baseline:
            delta_score = snapshot.score - baseline.avg_score

        result.append(
            AIScorecard(
                org_id=org_id,
                user_id=row.user_id,
                full_name=row.full_name,
                period_type=period.value,
                period_start=period_start,
                period_end=period_end,
                current=AIScoreSnapshotResponse.model_validate(snapshot),
                baseline=baseline,
                delta_score=delta_score,
                trend=trend,
                reasons=reasons,
                interpretation=interpretation,
            )
        )

    return result
