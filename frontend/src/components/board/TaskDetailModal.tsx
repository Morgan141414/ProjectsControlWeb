import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckSquare, MessageSquare, Paperclip, Plus, Send, Square, Trash2, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { BoardTask } from '@/types'
import {
  useComments,
  useCreateComment,
  useChecklist,
  useToggleChecklistItem,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useUpdateProjectTask,
} from '@/hooks/useBoard'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: BoardTask | null
  orgId: string
  projectId: string
}

export function TaskDetailModal({ open, onOpenChange, task, orgId, projectId }: Props) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <TaskDetailContent task={task} orgId={orgId} projectId={projectId} />
      </DialogContent>
    </Dialog>
  )
}

function TaskDetailContent({ task, orgId, projectId }: { task: BoardTask; orgId: string; projectId: string }) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit state
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description ?? '')
  const [editPriority, setEditPriority] = useState(task.priority ?? '')
  const [editDueDate, setEditDueDate] = useState(task.due_date ?? '')
  const updateTask = useUpdateProjectTask(orgId, projectId)

  // Comments
  const { data: comments = [] } = useComments(orgId, task.id)
  const createComment = useCreateComment(orgId, task.id)
  const [commentText, setCommentText] = useState('')

  // Checklist
  const { data: checklist = [] } = useChecklist(orgId, task.id)
  const toggleItem = useToggleChecklistItem(orgId, task.id)
  const addItem = useCreateChecklistItem(orgId, task.id)
  const deleteItem = useDeleteChecklistItem(orgId, task.id)
  const [newItemText, setNewItemText] = useState('')

  // Attachments
  const { data: attachments = [] } = useAttachments(orgId, task.id)
  const uploadAtt = useUploadAttachment(orgId, task.id)
  const deleteAtt = useDeleteAttachment(orgId, task.id)

  function handleSave() {
    updateTask.mutate({
      taskId: task.id,
      title: editTitle,
      description: editDesc || undefined,
      priority: editPriority || undefined,
      due_date: editDueDate || undefined,
    }, {
      onSuccess: () => toast.success(t('common.save') + ' OK'),
    })
  }

  function handleAddComment() {
    if (!commentText.trim()) return
    createComment.mutate(commentText.trim(), {
      onSuccess: () => setCommentText(''),
    })
  }

  function handleAddChecklistItem() {
    if (!newItemText.trim()) return
    addItem.mutate(newItemText.trim(), {
      onSuccess: () => setNewItemText(''),
    })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadAtt.mutate(file)
    e.target.value = ''
  }

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">{t('board.details')}</TabsTrigger>
        <TabsTrigger value="checklist">
          <CheckSquare className="h-3.5 w-3.5 mr-1" />
          {checklist.length}
        </TabsTrigger>
        <TabsTrigger value="comments">
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          {comments.length}
        </TabsTrigger>
        <TabsTrigger value="attachments">
          <Paperclip className="h-3.5 w-3.5 mr-1" />
          {attachments.length}
        </TabsTrigger>
      </TabsList>

      {/* Details */}
      <TabsContent value="details">
        <div className="space-y-3 pt-3">
          <div>
            <Label>{t('board.title')}</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </div>
          <div>
            <Label>{t('board.description')}</Label>
            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('board.priority')}</Label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <Label>{t('board.dueDate')}</Label>
              <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t('board.status')}: {task.status}</span>
            <span>|</span>
            <span>{t('board.created')}: {task.created_at?.slice(0, 10)}</span>
          </div>
          <Button onClick={handleSave} disabled={updateTask.isPending}>
            {t('common.saveChanges')}
          </Button>
        </div>
      </TabsContent>

      {/* Checklist */}
      <TabsContent value="checklist">
        <div className="space-y-2 pt-3">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <button onClick={() => toggleItem.mutate({ itemId: item.id, is_done: !item.is_done })}>
                {item.is_done
                  ? <CheckSquare className="h-4 w-4 text-primary" />
                  : <Square className="h-4 w-4 text-muted-foreground" />
                }
              </button>
              <span className={`flex-1 text-sm ${item.is_done ? 'line-through text-muted-foreground' : ''}`}>
                {item.text}
              </span>
              <button
                onClick={() => deleteItem.mutate(item.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={t('board.addChecklistItem')}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleAddChecklistItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* Comments */}
      <TabsContent value="comments">
        <div className="space-y-3 pt-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="font-medium text-foreground">{c.user_id.slice(0, 8)}</span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm">{c.text}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('board.addComment')}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddComment} disabled={createComment.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* Attachments */}
      <TabsContent value="attachments">
        <div className="space-y-2 pt-3">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-2">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{a.filename}</span>
                <span className="text-xs text-muted-foreground">({(a.size_bytes / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => deleteAtt.mutate(a.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAtt.isPending}
          >
            <Upload className="h-4 w-4 mr-1" />
            {t('board.uploadAttachment')}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
