import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, CheckSquare, MessageSquare } from 'lucide-react'
import type { BoardTask } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-600 border-red-200',
  high: 'bg-orange-500/10 text-orange-600 border-orange-200',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  low: 'bg-blue-500/10 text-blue-600 border-blue-200',
}

interface Props {
  task: BoardTask
  onClick?: () => void
}

export function BoardTaskCard({ task, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-2"
    >
      <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {task.priority && (
          <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[task.priority] ?? 'bg-muted text-muted-foreground'}`}>
            {task.priority}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {task.due_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {task.due_date}
          </span>
        )}
        {task.checklist_total > 0 && (
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            {task.checklist_done}/{task.checklist_total}
          </span>
        )}
        {task.comments_count > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {task.comments_count}
          </span>
        )}
      </div>
    </div>
  )
}
