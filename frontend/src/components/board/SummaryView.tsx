import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProjectStats } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  done: '#22c55e',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#3b82f6',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

interface Props {
  stats: ProjectStats | undefined
  isLoading: boolean
}

export function SummaryView({ stats, isLoading }: Props) {
  const { t } = useTranslation()

  if (isLoading || !stats) {
    return <p className="text-center text-sm text-muted-foreground py-8">{t('common.loading')}</p>
  }

  const statusData = Object.entries(stats.by_status).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(stats.by_priority).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card size="sm">
          <CardHeader><CardTitle>{t('board.totalTasks')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total_tasks}</p></CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle>{t('board.overdue')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-500">{stats.overdue}</p></CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle>{t('board.storyPoints')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total_story_points}</p></CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle>{t('board.done')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">{stats.by_status.done ?? 0}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Status pie chart */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t('board.byStatus')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Priority bar chart */}
        {priorityData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t('board.byPriority')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
