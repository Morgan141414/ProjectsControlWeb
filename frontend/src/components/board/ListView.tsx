import { useTranslation } from 'react-i18next'
import type { BoardTask } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-blue-600',
}

interface Props {
  tasks: BoardTask[]
  onTaskClick?: (task: BoardTask) => void
}

export function ListView({ tasks, onTaskClick }: Props) {
  const { t } = useTranslation()

  if (tasks.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">{t('board.noTasks')}</p>
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('board.title')}</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('board.status')}</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('board.priority')}</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t('board.dueDate')}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className="border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer"
            >
              <td className="px-4 py-2 font-medium text-foreground">{task.title}</td>
              <td className="px-4 py-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{task.status}</span>
              </td>
              <td className="px-4 py-2">
                {task.priority && (
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? ''}`}>
                    {task.priority}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{task.due_date ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
