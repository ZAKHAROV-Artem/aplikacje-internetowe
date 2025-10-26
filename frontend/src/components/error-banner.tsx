// Key functionality: Standardized error banner to display API and validation errors.
import { cn } from '@/lib/utils'

export default function ErrorBanner({ error, className }: { error?: string | null; className?: string }) {
  if (!error) return null
  return (
    <div className={cn('rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive', className)}>
      {error}
    </div>
  )
}


