import { useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { useOrgStore } from '@/stores/orgStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BoardView } from '@/components/board/BoardView'
import { ListView } from '@/components/board/ListView'
import { SummaryView } from '@/components/board/SummaryView'
import { CalendarView } from '@/components/board/CalendarView'
import { TimelineView } from '@/components/board/TimelineView'
import { CreateColumnModal } from '@/components/board/CreateColumnModal'
import { CreateTaskModal } from '@/components/board/CreateTaskModal'
import { TaskDetailModal } from '@/components/board/TaskDetailModal'
import type { BoardTask } from '@/types'
import {
  useProject,
  useColumns,
  useCreateColumn,
  useProjectTasks,
  useCreateProjectTask,
  useReorderTasks,
  useProjectStats,
} from '@/hooks/useBoard'

export default function ProjectDetailPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const orgId = useOrgStore((s) => s.activeOrgId)

  const { data: project, isLoading: projectLoading } = useProject(orgId, projectId ?? null)
  const { data: columns = [] } = useColumns(orgId, projectId ?? null)
  const { data: tasks = [] } = useProjectTasks(orgId, projectId ?? null)
  const { data: stats, isLoading: statsLoading } = useProjectStats(orgId, projectId ?? null)

  const createColumn = useCreateColumn(orgId!, projectId!)
  const createTask = useCreateProjectTask(orgId!, projectId!)
  const reorderTasks = useReorderTasks(orgId!, projectId!)

  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskModalColumnId, setTaskModalColumnId] = useState<string | undefined>()
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null)

  const handleReorder = useCallback(
    (taskId: string, columnId: string, position: number) => {
      reorderTasks.mutate({ task_id: taskId, column_id: columnId, position })
    },
    [reorderTasks],
  )

  const handleAddTask = useCallback((columnId: string) => {
    setTaskModalColumnId(columnId)
    setShowTaskModal(true)
  }, [])

  if (!orgId || !projectId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('board.project')} />
        <p className="text-sm text-muted-foreground">{t('admin.noOrg')}</p>
      </div>
    )
  }

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="page-enter space-y-4">
      <PageHeader
        title={project?.name ?? t('board.project')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/projects')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.back')}
            </Button>
            <Button size="sm" onClick={() => { setTaskModalColumnId(undefined); setShowTaskModal(true) }}>
              <Plus className="h-4 w-4 mr-1" />
              {t('board.createTask')}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="summary">{t('board.summary')}</TabsTrigger>
          <TabsTrigger value="list">{t('board.list')}</TabsTrigger>
          <TabsTrigger value="board">{t('board.board')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('board.calendar')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('board.timeline')}</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryView stats={stats} isLoading={statsLoading} />
        </TabsContent>

        <TabsContent value="list">
          <ListView tasks={tasks} onTaskClick={setSelectedTask} />
        </TabsContent>

        <TabsContent value="board">
          <BoardView
            columns={columns}
            tasks={tasks}
            onReorderTask={handleReorder}
            onTaskClick={setSelectedTask}
            onAddTask={handleAddTask}
            onAddColumn={() => setShowColumnModal(true)}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView tasks={tasks} onTaskClick={setSelectedTask} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView tasks={tasks} onTaskClick={setSelectedTask} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateColumnModal
        open={showColumnModal}
        onOpenChange={setShowColumnModal}
        isLoading={createColumn.isPending}
        onSubmit={(data) => {
          createColumn.mutate(data, {
            onSuccess: () => {
              setShowColumnModal(false)
              toast.success('OK')
            },
          })
        }}
      />

      <CreateTaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        isLoading={createTask.isPending}
        defaultColumnId={taskModalColumnId}
        onSubmit={(data) => {
          createTask.mutate(data, {
            onSuccess: () => {
              setShowTaskModal(false)
              toast.success('OK')
            },
          })
        }}
      />

      <TaskDetailModal
        open={!!selectedTask}
        onOpenChange={(open) => { if (!open) setSelectedTask(null) }}
        task={selectedTask}
        orgId={orgId}
        projectId={projectId}
      />
    </div>
  )
}
