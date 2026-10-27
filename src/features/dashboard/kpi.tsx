import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type KpiCardProps = {
  titulo: string
  icon: LucideIcon
  valor?: number | string
  detalle?: string
  cargando?: boolean
}

// Degradado sutil de la marca; en móvil se oculta el ícono para que quepan varias tarjetas
export function KpiCard({
  titulo,
  icon: Icon,
  valor,
  detalle,
  cargando,
}: KpiCardProps) {
  return (
    <div className='flex items-start gap-3 rounded-2xl border border-primary/10 bg-linear-to-br from-primary/10 via-transparent to-transparent p-4 transition-shadow hover:shadow-sm sm:gap-4 sm:p-5'>
      <div className='hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex'>
        <Icon className='size-6' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-semibold sm:text-sm'>{titulo}</p>
        {cargando ? (
          <Skeleton className='mt-2 h-8 w-16' />
        ) : (
          <p className='mt-1 text-2xl font-bold sm:text-3xl'>{valor ?? '—'}</p>
        )}
        {detalle && (
          <p className='mt-1 text-xs text-muted-foreground'>{detalle}</p>
        )}
      </div>
    </div>
  )
}
