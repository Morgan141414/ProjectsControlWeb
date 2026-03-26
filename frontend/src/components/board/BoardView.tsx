import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import type { TaskColumn, BoardTask } from '@/types'
import { BoardColumn } from './BoardColumn'
import { BoardTaskCard } from './BoardTaskCard'

interface Props {
  columns: TaskColumn[]
  tasks: BoardTask[]
  onReorderTask: (taskId: string, columnId: string, position: number) => void
  onTaskClick?: (task: BoardTask) => void
  onAddTask?: (columnId: string) => void
  onAddColumn?: () => void
}

export function BoardView({ columns, tasks, onReorderTask, onTaskClick, onAddTask, onAddColumn }: Props) {
  const { t } = useTranslation()
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const tasksByColumn = useMemo(() => {
    const map: Record<string, BoardTask[]> = {}
    for (const col of columns) {
      map[col.id] = []
    }
    map['__unassigned'] = []
    for (const task of tasks) {
      const key = task.column_id && map[task.column_id] ? task.column_id : '__unassigned'
      map[key].push(task)
    }
    // Sort within each column by position
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.position - b.position)
    }
    return map
  }, [columns, tasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }, [tasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    // Determine target column: over could be a column or another task
    let targetColumnId = over.id as string
    let position = 0

    // Check if over is a column
    const isColumn = columns.some((c) => c.id === targetColumnId)
    if (!isColumn) {
      // over is a task, find its column
      const overTask = tasks.find((t) => t.id === targetColumnId)
      if (overTask && overTask.column_id) {
        targetColumnId = overTask.column_id
        position = overTask.position
      }
    } else {
      // Dropped on column directly — put at end
      const colTasks = tasksByColumn[targetColumnId] || []
      position = colTasks.length
    }

    onReorderTask(taskId, targetColumnId, position)
  }, [columns, tasks, tasksByColumn, onReorderTask])

  const unassigned = tasksByColumn['__unassigned'] || []

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id] || []}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}

        {unassigned.length > 0 && (
          <BoardColumn
            column={{ id: '__unassigned', org_id: '', project_id: '', name: t('board.unassigned'), position: 999, created_at: '' }}
            tasks={unassigned}
            onTaskClick={onTaskClick}
          />
        )}

        <DragOverlay>
          {activeTask && <BoardTaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      {onAddColumn && (
        <button
          onClick={onAddColumn}
          className="flex h-10 w-72 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('board.addColumn')}
        </button>
      )}
    </div>
  )
}
