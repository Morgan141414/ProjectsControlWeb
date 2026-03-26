import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Users, Shield, Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useOrgStore } from '@/stores/orgStore'
import { useTeams } from '@/hooks/useTeams'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingState'

export default function ProjectMembersPage() {
  const { t } = useTranslation()
  const { id: projectId } = useParams()
  const { activeOrgId } = useOrgStore()
  const { data: teams, isLoading } = useTeams(activeOrgId ?? '')
  const [search, setSearch] = useState('')

  const projectTeams = (teams ?? []).filter((team: any) => team.project_id === projectId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('project.members', 'Участники')}</h1>
          <p className="text-sm text-muted-foreground">{t('project.membersDesc', 'Команда и участники проекта')}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">
          <UserPlus className="h-4 w-4" />
          {t('project.addMember', 'Добавить')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : projectTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('project.noMembers', 'Нет участников')}
          description={t('project.noMembersDesc', 'Добавьте участников в проект для начала совместной работы')}
        />
      ) : (
        <div className="space-y-4">
          {projectTeams.map((team: any) => (
            <div key={team.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(team.members ?? []).length} {t('project.participants', 'участников')}
                  </p>
                </div>
              </div>
              {(team.members ?? []).length > 0 && (
                <div className="space-y-1.5">
                  {team.members.map((member: any) => (
                    <div key={member.user_id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          U
                        </div>
                        <span className="text-sm text-foreground">{member.user_id}</span>
                      </div>
                      {member.role && (
                        <span className="flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-600">
                          <Shield className="h-3 w-3" />
                          {member.role}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
