import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen, FileText, Upload, Search, Download, Eye,
  Trash2, Calendar, User, Filter, FolderOpen, File,
  MoreHorizontal, ChevronRight, Clock,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

interface GovernanceDocument {
  id: string
  name: string
  category: string
  categoryKey: string
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  fileType: string
  version: number
  status: 'active' | 'archived' | 'draft'
}

const DEMO_DOCUMENTS: GovernanceDocument[] = [
  { id: '1', name: 'Устав ООО "Компания" (ред. 2)', category: 'Устав компании', categoryKey: 'charter', uploadedBy: 'Николаев А.В.', uploadedAt: '2025-06-10', fileSize: '2.4 MB', fileType: 'PDF', version: 2, status: 'active' },
  { id: '2', name: 'Учредительный договор', category: 'Учредительные договоры', categoryKey: 'contracts', uploadedBy: 'Николаев А.В.', uploadedAt: '2024-01-15', fileSize: '1.8 MB', fileType: 'PDF', version: 1, status: 'active' },
  { id: '3', name: 'Приказ о назначении CEO №1', category: 'Приказы', categoryKey: 'orders', uploadedBy: 'Николаев А.В.', uploadedAt: '2024-01-15', fileSize: '0.5 MB', fileType: 'PDF', version: 1, status: 'active' },
  { id: '4', name: 'Протокол собрания учредителей №3', category: 'Протоколы собраний', categoryKey: 'protocols', uploadedBy: 'Смирнова Е.П.', uploadedAt: '2025-06-08', fileSize: '1.2 MB', fileType: 'DOCX', version: 1, status: 'active' },
  { id: '5', name: 'Протокол собрания учредителей №2', category: 'Протоколы собраний', categoryKey: 'protocols', uploadedBy: 'Николаев А.В.', uploadedAt: '2025-03-15', fileSize: '0.9 MB', fileType: 'PDF', version: 1, status: 'active' },
  { id: '6', name: 'Договор аренды офиса', category: 'Договоры аренды', categoryKey: 'leases', uploadedBy: 'Смирнова Е.П.', uploadedAt: '2024-01-20', fileSize: '3.1 MB', fileType: 'PDF', version: 1, status: 'active' },
  { id: '7', name: 'Приказ о распределении долей', category: 'Приказы', categoryKey: 'orders', uploadedBy: 'Николаев А.В.', uploadedAt: '2025-06-10', fileSize: '0.4 MB', fileType: 'PDF', version: 1, status: 'active' },
  { id: '8', name: 'Устав ООО "Компания" (ред. 1)', category: 'Устав компании', categoryKey: 'charter', uploadedBy: 'Николаев А.В.', uploadedAt: '2024-01-15', fileSize: '2.1 MB', fileType: 'PDF', version: 1, status: 'archived' },
]

const CATEGORIES = [
  { key: 'all', label: 'Все', icon: FolderOpen },
  { key: 'charter', label: 'Устав', icon: FileText },
  { key: 'contracts', label: 'Учредительные', icon: FileText },
  { key: 'orders', label: 'Приказы', icon: FileText },
  { key: 'protocols', label: 'Протоколы', icon: FileText },
  { key: 'leases', label: 'Аренда', icon: FileText },
  { key: 'other', label: 'Прочее', icon: File },
]

export default function GovernanceDocumentsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [dragOver, setDragOver] = useState(false)

  const filtered = DEMO_DOCUMENTS.filter((doc) => {
    if (categoryFilter !== 'all' && doc.categoryKey !== categoryFilter) return false
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.key === 'all' ? DEMO_DOCUMENTS.length : DEMO_DOCUMENTS.filter((d) => d.categoryKey === cat.key).length,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('governance.documents')}</h1>
          <p className="text-sm text-muted-foreground">{t('governance.documentsDesc')}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
          <Upload className="h-4 w-4" />
          {t('governance.uploadDocument', 'Загрузить')}
        </button>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {categoryCounts.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              categoryFilter === cat.key ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20' : 'border-border bg-card hover:bg-accent/30'
            }`}
          >
            <cat.icon className={`h-4 w-4 mb-1.5 ${categoryFilter === cat.key ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <p className="text-xs font-medium text-foreground truncate">{cat.label}</p>
            <p className="text-lg font-bold text-foreground">{cat.count}</p>
          </button>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск документов..."
            className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'all' as const, label: 'Все' },
            { key: 'active' as const, label: 'Действующие' },
            { key: 'archived' as const, label: 'Архив' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                statusFilter === f.key ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Нет документов"
          description="Загрузите первый документ нажав кнопку «Загрузить»"
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Документ</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Категория</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Загрузил</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Дата</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                        <FileText className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.fileType} | {doc.fileSize} | v{doc.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{doc.category}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{doc.uploadedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={doc.status === 'active' ? 'success' : doc.status === 'archived' ? 'default' : 'warning'}>
                      {doc.status === 'active' ? 'Действует' : doc.status === 'archived' ? 'Архив' : 'Черновик'}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 hover:bg-accent transition-colors" title="Просмотр">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button className="rounded-md p-1.5 hover:bg-accent transition-colors" title="Скачать">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-border bg-card'
        }`}
      >
        <Upload className={`h-10 w-10 mx-auto mb-3 ${dragOver ? 'text-amber-500' : 'text-muted-foreground/20'}`} />
        <p className="text-sm font-medium text-foreground mb-1">
          {t('governance.dragDrop', 'Перетащите файлы сюда')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('governance.supportedFormats', 'PDF, DOC, DOCX до 10MB')}
        </p>
      </div>
    </div>
  )
}
