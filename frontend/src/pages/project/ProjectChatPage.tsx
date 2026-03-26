import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ProjectChatPage() {
  const { t } = useTranslation()
  const { id: projectId } = useParams()
  const [message, setMessage] = useState('')

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">{t('project.chat', 'Чат проекта')}</h1>
        <p className="text-sm text-muted-foreground">{t('project.chatDesc', 'Общение участников проекта')}</p>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyState
            icon={MessageSquare}
            title={t('project.noMessages', 'Нет сообщений')}
            description={t('project.noMessagesDesc', 'Начните общение с участниками проекта')}
          />
        </div>

        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('project.typeMessage', 'Введите сообщение...')}
              className="flex-1 h-10 rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <button
              disabled={!message.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
