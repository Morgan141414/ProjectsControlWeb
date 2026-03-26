import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Send, MessageSquare, X, ImagePlus, Search,
  Trash2, Check, ChevronLeft, Plus, Headphones,
  AlertCircle, CheckCircle, XCircle, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useOrgStore } from '@/stores/orgStore'
import { useAuthStore } from '@/stores/authStore'
import {
  createSupportThread,
  deleteSupportThread,
  getSupportThread,
  listSupportThreads,
  sendSupportMessage,
  updateSupportThreadStatus,
  listPersonalThreads,
  createPersonalThread,
  getPersonalThread,
  sendPersonalMessage,
  deletePersonalThread,
} from '@/api/support'
import type { SupportThread } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function getStatusMap(t: (key: string) => string) {
  return {
    open: { label: t('support.statusOpen'), color: 'text-red-500', bg: 'bg-red-500/10 border-red-200 dark:border-red-500/30', dot: 'bg-red-500', icon: AlertCircle },
    answered: { label: t('support.statusAnswered'), color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500', icon: CheckCircle },
    closed: { label: t('support.statusClosed'), color: 'text-muted-foreground', bg: 'bg-muted border-border', dot: 'bg-muted-foreground', icon: XCircle },
  } as Record<string, { label: string; color: string; bg: string; dot: string; icon: typeof AlertCircle }>
}

function getRoleLabels(t: (key: string) => string) {
  return {
    member: t('support.roleMember'),
    manager: t('support.roleManager'),
    admin: t('support.roleAdmin'),
  } as Record<string, string>
}

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name[0].toUpperCase()
}

function formatTime(dateStr: string, t: (key: string) => string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return t('support.yesterday')
    if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

function formatMsgTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDateSeparator(dateStr: string, t: (key: string) => string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return t('support.today')
    if (days === 1) return t('support.yesterday')
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function shouldShowDateSep(messages: { created_at: string }[], index: number) {
  if (index === 0) return true
  const cur = new Date(messages[index].created_at).toDateString()
  const prev = new Date(messages[index - 1].created_at).toDateString()
  return cur !== prev
}

export default function SupportPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.activeOrgId)
  const { activeOrg } = useOrgStore()
  const orgRole = activeOrg()?.role ?? null
  const currentUserId = useAuthStore((s) => s.userId)

  const STATUS_MAP = getStatusMap(t)
  const ROLE_LABELS = getRoleLabels(t)

  const [conversations, setConversations] = useState<SupportThread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<SupportThread | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSidebar, setShowMobileSidebar] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // New chat form
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [creating, setCreating] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newFileInputRef = useRef<HTMLInputElement>(null)

  // Personal mode = no org selected
  const isPersonal = !orgId
  const isAdmin = !isPersonal && (orgRole === 'superadmin' || orgRole === 'sysadmin')
  const canCreate = isPersonal || (!!orgRole && orgRole !== 'superadmin' && orgRole !== 'sysadmin')
  const canOpenSupport = isPersonal || !!orgRole
  const isChatClosed = selectedChat && selectedChat.status === 'closed'
  const isChatClosedForRequester = !isAdmin && isChatClosed

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    try {
      let data: SupportThread[]
      if (isPersonal) {
        const res = await listPersonalThreads()
        data = res.data
      } else {
        const res = await listSupportThreads(orgId!)
        data = res.data
      }
      setConversations((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) return data
        return prev
      })
      setSelectedChat((prev) => {
        if (data.length === 0) return null
        if (!prev) return isAdmin ? null : data[0]
        const fresh = data.find((c) => c.id === prev.id)
        if (!fresh) return isAdmin ? null : data[0]
        return fresh
      })
    } catch {
      toast.error(t('support.loadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, isAdmin, isPersonal, t])

  useEffect(() => {
    if (!canOpenSupport) return
    loadConversations()
    const interval = setInterval(loadConversations, 5000)
    return () => clearInterval(interval)
  }, [loadConversations, canOpenSupport])

  useEffect(() => {
    if (selectedChat) scrollToBottom()
  }, [selectedChat, selectedChat?.messages, scrollToBottom])

  // ── Handlers ──
  const handleSelectChat = async (chat: SupportThread) => {
    try {
      let data: SupportThread
      if (isPersonal) {
        const res = await getPersonalThread(chat.id)
        data = res.data
      } else {
        const res = await getSupportThread(orgId!, chat.id)
        data = res.data
      }
      setSelectedChat(data)
      setConversations((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, unread_count: 0 } : c)),
      )
      setShowMobileSidebar(false)
      setTimeout(scrollToBottom, 100)
    } catch {
      toast.error(t('support.openError'))
    }
  }

  const handleCreateChat = async () => {
    if (!newSubject.trim()) {
      toast.error(t('support.subjectRequired'))
      return
    }
    if (!newBody.trim() && newFiles.length === 0) {
      toast.error(t('support.bodyRequired'))
      return
    }

    setCreating(true)
    try {
      let data: SupportThread
      if (isPersonal) {
        const res = await createPersonalThread({
          subject: newSubject.trim(),
          body: newBody.trim(),
          files: newFiles,
        })
        data = res.data
      } else {
        const res = await createSupportThread(orgId!, {
          subject: newSubject.trim(),
          body: newBody.trim(),
          files: newFiles,
        })
        data = res.data
      }
      setNewSubject('')
      setNewBody('')
      setNewFiles([])
      await loadConversations()
      setSelectedChat(data)
      setShowMobileSidebar(false)
      toast.success(t('support.chatCreated'))
    } catch {
      toast.error(t('support.createError'))
    } finally {
      setCreating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChat) return
    if (!messageInput.trim() && !selectedImage) return
    setSending(true)
    try {
      const files = selectedImage ? [selectedImage] : undefined
      if (isPersonal) {
        await sendPersonalMessage(selectedChat.id, {
          body: messageInput.trim(),
          files,
        })
      } else {
        await sendSupportMessage(orgId!, selectedChat.id, {
          body: messageInput.trim(),
          files,
        })
      }

      setMessageInput('')
      setSelectedImage(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      let data: SupportThread
      if (isPersonal) {
        const res = await getPersonalThread(selectedChat.id)
        data = res.data
      } else {
        const res = await getSupportThread(orgId!, selectedChat.id)
        data = res.data
      }
      setSelectedChat(data)
      setConversations((prev) => {
        const others = prev.filter((c) => c.id !== data.id)
        return [{ ...data, unread_count: 0 }, ...others]
      })
      setTimeout(scrollToBottom, 100)
    } catch {
      toast.error(t('support.sendError'))
    } finally {
      setSending(false)
    }
  }

  const handleCloseChat = async () => {
    if (!orgId || !selectedChat) return
    try {
      const { data } = await updateSupportThreadStatus(orgId, selectedChat.id, 'closed')
      setSelectedChat(data)
      setConversations((prev) => prev.map((c) => (c.id === data.id ? data : c)))
      toast.success(t('support.chatClosedSuccess'))
    } catch {
      toast.error(t('support.closeError'))
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      if (isPersonal) {
        await deletePersonalThread(chatId)
      } else {
        await deleteSupportThread(orgId!, chatId)
      }
      setConversations((prev) => prev.filter((c) => c.id !== chatId))
      if (selectedChat?.id === chatId) setSelectedChat(null)
      setShowDeleteConfirm(null)
      toast.success(t('support.chatDeleted'))
    } catch {
      toast.error(t('support.deleteError'))
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(t('support.fileTooLarge'))
        return
      }
      setSelectedImage(file)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((c) => {
    if (filter !== 'all') {
      if (filter === 'closed') {
        if (c.status !== 'closed') return false
      } else if (c.status !== filter) return false
    }
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.subject.toLowerCase().includes(q) ||
      c.requester_name.toLowerCase().includes(q) ||
      (c.last_message_preview || '').toLowerCase().includes(q)
    )
  })

  // ── No access ──
  if (!canOpenSupport) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 text-muted-foreground">
        <Headphones className="h-12 w-12" />
        <p>{t('support.noAccess')}</p>
      </div>
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 text-muted-foreground">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p>{t('support.loadingChats')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-2xl border border-border bg-card">
      {/* ── SIDEBAR ── */}
      <aside className={`w-[360px] min-w-[360px] bg-muted/30 border-r border-border flex flex-col overflow-hidden max-md:fixed max-md:inset-0 max-md:w-full max-md:min-w-full max-md:z-20 max-md:bg-background max-md:transition-transform max-md:duration-250 ${showMobileSidebar ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <Headphones className="h-5 w-5 text-primary" />
            <span>{t('support.title')}</span>
          </div>
        </div>

        {/* Search (admin only) */}
        {isAdmin && (
          <div className="relative px-4 pb-3">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t('support.searchChats')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filters (admin only) */}
        {isAdmin && (
          <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
            {[
              { key: 'all', label: t('support.filterAll') },
              { key: 'open', label: t('support.filterOpen') },
              { key: 'answered', label: t('support.filterAnswered') },
              { key: 'closed', label: t('support.filterClosed') },
            ].map((f) => (
              <button
                key={f.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  filter === f.key
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-transparent border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {f.key !== 'all' && (
                  <span className={`text-[11px] font-semibold px-1.5 rounded-md ${
                    filter === f.key ? 'bg-primary/15' : 'bg-muted'
                  }`}>
                    {conversations.filter((c) =>
                      f.key === 'closed' ? c.status === 'closed' : c.status === f.key,
                    ).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Create form (non-admin only) */}
        {!isAdmin && canCreate && (
          <div className="px-4 pb-3">
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder={t('support.subjectPlaceholder')}
              />
              <Textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder={t('support.describeProblem')}
                rows={2}
                className="min-h-[56px]"
              />
              <input
                ref={newFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const images = Array.from(e.target.files).filter((f) =>
                      f.type.startsWith('image/'),
                    )
                    setNewFiles((prev) => [...prev, ...images])
                  }
                  e.currentTarget.value = ''
                }}
              />
              {newFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {newFiles.map((f, i) => (
                    <button
                      key={`${f.name}-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] hover:bg-destructive/15 hover:text-destructive transition-colors"
                      onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      {f.name} <X className="h-2.5 w-2.5" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => newFileInputRef.current?.click()}
                  title={t('support.attachPhoto')}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={handleCreateChat}
                  disabled={creating}
                >
                  {creating ? t('support.creating') : t('support.createChat')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {(isAdmin ? filteredConversations : conversations).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-foreground/50 text-center gap-3">
              <MessageSquare className="h-10 w-10" />
              <p className="text-sm">{searchQuery ? t('support.nothingFound') : (isAdmin ? t('support.noChats') : t('support.noRequests'))}</p>
            </div>
          ) : (
            (isAdmin ? filteredConversations : conversations).map((chat) => {
              const st = STATUS_MAP[chat.status] || STATUS_MAP.open
              return (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-colors border-l-3 ${
                    selectedChat?.id === chat.id
                      ? 'bg-primary/5 border-l-primary'
                      : 'border-l-transparent hover:bg-accent/50'
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar size="lg">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {isAdmin ? getInitials(chat.requester_name || '?') : <Headphones className="h-4.5 w-4.5" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${st.dot}`} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {isAdmin ? (chat.requester_name || t('support.user')) : chat.subject}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(chat.updated_at, t)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[13px] text-muted-foreground truncate">
                        {isAdmin ? (
                          <>
                            <span className="opacity-70 font-medium">{chat.subject}</span>
                            {chat.last_message_preview
                              ? ` — ${chat.last_message_preview.length > 35
                                  ? chat.last_message_preview.substring(0, 35) + '...'
                                  : chat.last_message_preview}`
                              : ''}
                          </>
                        ) : (
                          chat.last_message_preview
                            ? (chat.last_message_preview.length > 45
                                ? chat.last_message_preview.substring(0, 45) + '...'
                                : chat.last_message_preview)
                            : t('support.noMessages')
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isAdmin && chat.requester_role && (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {ROLE_LABELS[chat.requester_role] || chat.requester_role}
                          </Badge>
                        )}
                        {!isAdmin && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${st.dot}`}>
                            {st.label}
                          </span>
                        )}
                        {chat.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-primary rounded-full">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* ── CHAT AREA ── */}
      <main className="flex-1 flex flex-col bg-background min-w-0">
        {selectedChat ? (
          <>
            {/* Header */}
            <header className="flex items-center gap-3.5 px-5 py-3.5 bg-muted/30 border-b border-border">
              <button
                className="hidden max-md:flex items-center justify-center h-9 w-9 rounded-full bg-muted text-foreground hover:bg-accent"
                onClick={() => {
                  setShowMobileSidebar(true)
                  setSelectedChat(null)
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <Avatar size="lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {isAdmin
                    ? getInitials(selectedChat.requester_name || '?')
                    : <Headphones className="h-4.5 w-4.5" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold truncate text-foreground">
                    {isAdmin ? selectedChat.requester_name : selectedChat.subject}
                  </h3>
                  {isAdmin && selectedChat.requester_role && (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      {ROLE_LABELS[selectedChat.requester_role] || selectedChat.requester_role}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  {(() => {
                    const st = STATUS_MAP[selectedChat.status] || STATUS_MAP.open
                    const Icon = st.icon
                    return (
                      <span className={`inline-flex items-center gap-1 font-medium ${st.color}`}>
                        <Icon className="h-3 w-3" />
                        {st.label}
                      </span>
                    )
                  })()}
                  <span className="opacity-30">&middot;</span>
                  <span>{isAdmin ? selectedChat.subject : t('support.supportService')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin && selectedChat.status !== 'closed' && (
                  <Button variant="outline" size="sm" onClick={handleCloseChat} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10">
                    <Check className="h-4 w-4" />
                    <span className="max-md:hidden">{t('support.closeChat')}</span>
                  </Button>
                )}
                {(isAdmin || isPersonal) && (
                  <div className="relative">
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      title={t('support.deleteChat')}
                      onClick={() => setShowDeleteConfirm(selectedChat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {showDeleteConfirm === selectedChat.id && (
                      <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] rounded-xl border border-destructive/20 bg-card p-4 shadow-lg z-50 animate-in fade-in slide-in-from-top-1">
                        <p className="text-[13px] text-foreground mb-3 text-center">{t('support.deleteConfirm')}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDeleteChat(selectedChat.id)}
                          >
                            {t('common.delete')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            {t('support.cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-0.5 max-w-[800px] mx-auto w-full">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((msg, index) => {
                    const isOwn = msg.author_id === currentUserId
                    const showDateSep = shouldShowDateSep(selectedChat.messages, index)
                    const prevMsg = index > 0 ? selectedChat.messages[index - 1] : null
                    const isGrouped = prevMsg && prevMsg.author_id === msg.author_id && !showDateSep

                    return (
                      <div key={msg.id}>
                        {showDateSep && (
                          <div className="flex justify-center py-3">
                            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-3.5 py-1 rounded-full">
                              {formatDateSeparator(msg.created_at, t)}
                            </span>
                          </div>
                        )}
                        <div className={`flex gap-2 max-w-[75%] max-md:max-w-[88%] mb-0.5 ${isOwn ? 'self-end flex-row-reverse' : 'self-start'} ${isGrouped ? '-mt-0.5' : ''}`}>
                          {!isOwn && !isGrouped && (
                            <Avatar size="sm">
                              <AvatarFallback className="bg-primary/80 text-primary-foreground text-[11px] font-bold">
                                {msg.author_role === 'admin' ? <Headphones className="h-3 w-3" /> : getInitials(msg.author_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isOwn && isGrouped && <div className="w-6 flex-shrink-0" />}
                          <div className={`relative px-3 py-2 rounded-2xl min-w-[60px] ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          } ${isGrouped && isOwn ? 'rounded-tr-sm' : ''} ${isGrouped && !isOwn ? 'rounded-tl-sm' : ''}`}>
                            {!isGrouped && (
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-xs font-semibold ${isOwn ? 'text-primary-foreground/85' : 'text-primary'}`}>
                                  {msg.author_name}
                                </span>
                                {msg.author_role === 'admin' && (
                                  <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-px rounded bg-primary/20 text-primary-foreground/70">
                                    {t('support.supportBadge')}
                                  </span>
                                )}
                              </div>
                            )}
                            {msg.body && (
                              <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isOwn ? 'text-primary-foreground/92' : ''}`}>
                                {msg.body}
                              </div>
                            )}
                            {msg.attachments?.map((att) => (
                              <div key={att.id} className="mt-1.5 rounded-lg overflow-hidden max-w-[320px]">
                                <a href={att.url} target="_blank" rel="noreferrer">
                                  <img src={att.url} alt={att.file_name} loading="lazy" className="w-full h-auto block" />
                                </a>
                              </div>
                            ))}
                            <div className={`flex items-center gap-1 justify-end text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/40' : 'text-muted-foreground'}`}>
                              {formatMsgTime(msg.created_at)}
                              {isOwn && <Check className="h-3 w-3 text-primary-foreground/60" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
                      <MessageSquare className="h-12 w-12" />
                    </div>
                    <p className="text-muted-foreground">{t('support.noMessages')}</p>
                    <span className="text-sm text-muted-foreground/60 mt-1">{t('support.startDialog')}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="px-5 py-3 bg-muted/30 border-t border-border">
              {isChatClosedForRequester && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted border border-border text-muted-foreground text-[13px] mb-3">
                  <X className="h-4 w-4" />
                  {t('support.chatClosedBanner')}
                </div>
              )}
              {selectedImage && (
                <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg border border-border mb-2.5">
                  <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                  <button
                    className="h-7 w-7 rounded-full bg-destructive/15 text-destructive flex items-center justify-center hover:bg-destructive/25 flex-shrink-0"
                    onClick={() => {
                      setSelectedImage(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground truncate flex-1">{selectedImage.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!isChatClosedForRequester}
                  title={t('support.attachImage')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={!!isChatClosedForRequester}
                />
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isChatClosedForRequester ? t('support.chatClosed') : t('support.messagePlaceholder')}
                  className="flex-1 h-10 px-4 rounded-full border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!!isChatClosedForRequester}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!!isChatClosedForRequester || sending || (!messageInput.trim() && !selectedImage)}
                  title={t('support.send')}
                  className="rounded-full"
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Headphones className="h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('support.title')}</h2>
            <p className="text-muted-foreground max-w-[320px]">
              {isAdmin ? t('support.selectChat') : t('support.writeUs')}
            </p>
            {canCreate && conversations.length === 0 && (
              <Button
                className="mt-6"
                size="lg"
                onClick={() => setShowMobileSidebar(true)}
              >
                <Plus className="h-5 w-5" />
                {t('support.startChat')}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
