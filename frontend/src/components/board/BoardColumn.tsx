import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { TaskColumn, BoardTask } from '@/types'
import { BoardTaskCard } from './BoardTaskCard'

interface Props {
  column: TaskColumn
  tasks: BoardTask[]
  onTaskClick?: (task: BoardTask) => void
  onAddTask?: (columnId: string) => void
}

export function BoardColumn({ column, tasks, onTaskClick, onAddTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          {column.color && (
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          )}
          <span className="text-sm font-medium text-foreground">{column.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <button
            onClick={() => onAddTask(column.id)}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 p-2 min-h-[100px] transition-colors ${isOver ? 'bg-primary/5' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <BoardTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
