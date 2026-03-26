import { useTranslation } from 'react-i18next'
import { FileText, Upload, FolderOpen } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ProjectFilesPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('project.files', 'Файлы')}</h1>
          <p className="text-sm text-muted-foreground">{t('project.filesDesc', 'Документы и файлы проекта')}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">
          <Upload className="h-4 w-4" />
          {t('project.uploadFile', 'Загрузить')}
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card p-12">
        <EmptyState
          icon={FolderOpen}
          title={t('project.noFiles', 'Нет файлов')}
          description={t('project.noFilesDesc', 'Загрузите файлы проекта или перетащите их сюда')}
          action={
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <Upload className="h-4 w-4" />
              {t('project.selectFiles', 'Выбрать файлы')}
            </button>
          }
        />
      </div>
    </div>
  )
}
