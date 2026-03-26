import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PieChart, Users, FileText, Building2, Inbox, Upload,
  Plus, Edit3, Trash2, Eye, Download, ChevronDown, ChevronRight,
  TrendingUp, Calendar, Shield, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

interface Founder {
  id: string
  name: string
  sharePercent: number
  basis: string
  status: 'active' | 'pending' | 'exited'
  joinDate: string
  taxId?: string
  role: string
}

interface OwnershipEvent {
  id: string
  date: string
  type: 'share_change' | 'founder_added' | 'founder_exited' | 'charter_update'
  description: string
  initiator: string
}

const DEMO_FOUNDERS: Founder[] = [
  { id: '1', name: 'Николаев Андрей Викторович', sharePercent: 51, basis: 'Устав от 15.01.2024', status: 'active', joinDate: '2024-01-15', taxId: '7712345678', role: 'Генеральный директор' },
  { id: '2', name: 'Смирнова Елена Павловна', sharePercent: 30, basis: 'Устав от 15.01.2024', status: 'active', joinDate: '2024-01-15', taxId: '7798765432', role: 'Финансовый директор' },
  { id: '3', name: 'Козлов Игорь Романович', sharePercent: 19, basis: 'Договор купли-продажи от 10.06.2025', status: 'active', joinDate: '2025-06-10', role: 'Инвестор' },
]

const DEMO_EVENTS: OwnershipEvent[] = [
  { id: '1', date: '2025-06-10', type: 'founder_added', description: 'Вступление нового учредителя Козлов И.Р. с долей 19%', initiator: 'Николаев А.В.' },
  { id: '2', date: '2025-06-10', type: 'share_change', description: 'Перераспределение долей: Николаев А.В. 60% → 51%, Смирнова Е.П. 40% → 30%', initiator: 'Николаев А.В.' },
  { id: '3', date: '2024-01-15', type: 'charter_update', description: 'Регистрация устава компании. Учредители: Николаев А.В. (60%), Смирнова Е.П. (40%)', initiator: 'Николаев А.В.' },
]

interface CharterDoc {
  name: string
  status: 'uploaded' | 'not_uploaded' | 'expired'
  uploadedAt?: string
  fileSize?: string
}

const DEMO_CHARTER_DOCS: CharterDoc[] = [
  { name: 'Устав компании', status: 'uploaded', uploadedAt: '15.01.2024', fileSize: '2.4 MB' },
  { name: 'Договор аренды', status: 'uploaded', uploadedAt: '20.01.2024', fileSize: '1.1 MB' },
  { name: 'Приказ об учреждении', status: 'uploaded', uploadedAt: '15.01.2024', fileSize: '0.8 MB' },
  { name: 'Свидетельство о регистрации', status: 'uploaded', uploadedAt: '18.01.2024', fileSize: '0.5 MB' },
  { name: 'Лицензия на деятельность', status: 'not_uploaded' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  active: { label: 'Активен', variant: 'success' },
  pending: { label: 'Ожидание', variant: 'warning' },
  exited: { label: 'Вышел', variant: 'error' },
}

const eventTypeConfig: Record<string, { label: string; color: string; icon: typeof TrendingUp }> = {
  share_change: { label: 'Изменение долей', color: 'text-blue-500 bg-blue-500/10', icon: TrendingUp },
  founder_added: { label: 'Новый учредитель', color: 'text-emerald-500 bg-emerald-500/10', icon: Plus },
  founder_exited: { label: 'Выход учредителя', color: 'text-red-500 bg-red-500/10', icon: Trash2 },
  charter_update: { label: 'Обновление устава', color: 'text-amber-500 bg-amber-500/10', icon: FileText },
}

export default function OwnershipPage() {
  const { t } = useTranslation()
  const { activeOrg } = useOrgStore()
  const current = activeOrg()
  const [showTimeline, setShowTimeline] = useState(false)

  const totalShare = DEMO_FOUNDERS.reduce((sum, f) => sum + f.sharePercent, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('governance.ownership')}</h1>
          <p className="text-sm text-muted-foreground">{t('governance.ownershipDesc')}</p>
        </div>
      </div>

      {/* Share distribution visual */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PieChart className="h-5 w-5 text-amber-500" />
            <h3 className="text-[15px] font-semibold text-foreground">
              {t('governance.shareStructure', 'Структура владения')}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">{current?.orgName}</span>
        </div>

        {/* Visual share bar */}
        <div className="mb-4">
          <div className="flex h-8 rounded-lg overflow-hidden border border-border">
            {DEMO_FOUNDERS.map((f, i) => {
              const colors = ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500']
              return (
                <div
                  key={f.id}
                  className={`${colors[i % colors.length]} flex items-center justify-center text-xs font-bold text-white transition-all`}
                  style={{ width: `${f.sharePercent}%` }}
                  title={`${f.name}: ${f.sharePercent}%`}
                >
                  {f.sharePercent >= 10 && `${f.sharePercent}%`}
                </div>
              )
            })}
            {totalShare < 100 && (
              <div
                className="bg-muted flex items-center justify-center text-xs text-muted-foreground"
                style={{ width: `${100 - totalShare}%` }}
              >
                {100 - totalShare}%
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            {DEMO_FOUNDERS.map((f, i) => {
              const colors = ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500']
              return (
                <div key={f.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`h-2.5 w-2.5 rounded-sm ${colors[i % colors.length]}`} />
                  <span>{f.name.split(' ')[0]} — {f.sharePercent}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Founders table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('governance.founder', 'Учредитель')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('governance.sharePercent', 'Доля, %')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  Роль
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  {t('governance.basis', 'Основание')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  Дата вступления
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t('governance.status', 'Статус')}
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_FOUNDERS.map((f) => {
                const sc = statusConfig[f.status]
                return (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{f.name}</p>
                        {f.taxId && <p className="text-xs text-muted-foreground">ИНН: {f.taxId}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-foreground">{f.sharePercent}%</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{f.role}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{f.basis}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(f.joinDate).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ownership timeline */}
      <div className="rounded-xl border border-border bg-card p-5">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-500" />
            <h3 className="text-[15px] font-semibold text-foreground">
              История изменений владения
            </h3>
          </div>
          {showTimeline ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showTimeline && (
          <div className="mt-4 space-y-0">
            {DEMO_EVENTS.map((event, i) => {
              const ec = eventTypeConfig[event.type]
              const Icon = ec.icon
              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${ec.color.split(' ')[1]} shrink-0`}>
                      <Icon className={`h-3.5 w-3.5 ${ec.color.split(' ')[0]}`} />
                    </div>
                    {i < DEMO_EVENTS.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-muted-foreground">{new Date(event.date).toLocaleDateString('ru-RU')}</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${ec.color}`}>{ec.label}</span>
                    </div>
                    <p className="text-sm text-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Инициатор: {event.initiator}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Charter documents */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-amber-500" />
            <h3 className="text-[15px] font-semibold text-foreground">
              {t('governance.charterDocuments', 'Уставные документы')}
            </h3>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Загрузить
          </button>
        </div>
        <div className="space-y-2">
          {DEMO_CHARTER_DOCS.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className={`h-4 w-4 shrink-0 ${doc.status === 'uploaded' ? 'text-amber-500' : 'text-muted-foreground/30'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  {doc.uploadedAt && (
                    <p className="text-xs text-muted-foreground">Загружен: {doc.uploadedAt} | {doc.fileSize}</p>
                  )}
                </div>
              </div>
              {doc.status === 'uploaded' ? (
                <div className="flex items-center gap-1">
                  <StatusBadge variant="success">Загружен</StatusBadge>
                  <button className="rounded-md p-1.5 hover:bg-accent transition-colors" title="Скачать">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button className="rounded-md p-1.5 hover:bg-accent transition-colors" title="Просмотр">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <StatusBadge variant="default">{t('governance.notUploaded', 'Не загружен')}</StatusBadge>
                  <button className="rounded-md border border-dashed border-border p-1.5 hover:bg-accent transition-colors" title="Загрузить">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
