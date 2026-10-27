import {
  Ban,
  CalendarCheck,
  CalendarX,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatearFecha } from '@/features/dashboard/fechas'
import { estadoReservaLabels } from '@/features/reservas/schema'
import { type DiaPension } from '../schema'

const COLOR_POSITIVO =
  'bg-teal-100/60 text-teal-900 dark:bg-teal-400/15 dark:text-teal-200'

// Los días cancelados por "sin servicio" del menú no fueron decisión de la persona
function esSinServicio(dia: DiaPension) {
  return dia.estado === 'CANCELADO' && dia.motivoCancelacion === 'SIN_SERVICIO'
}

// Ícono y color por estado, para leer la lista de un vistazo
function iconoDia(dia: DiaPension) {
  if (esSinServicio(dia)) {
    return {
      Icon: Ban,
      className:
        'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200',
    }
  }
  switch (dia.estado) {
    case 'RESERVADO':
      return { Icon: CalendarCheck, className: COLOR_POSITIVO }
    case 'ASISTIO':
      return { Icon: CircleCheck, className: COLOR_POSITIVO }
    case 'NO_ASISTIO':
      return {
        Icon: CircleX,
        className:
          'bg-rose-100/60 text-rose-900 dark:bg-rose-400/15 dark:text-rose-200',
      }
    default:
      return { Icon: CalendarX, className: 'bg-muted text-muted-foreground' }
  }
}

export function DiasPension({
  dias,
  onCancelar,
  cancelando,
}: {
  dias: DiaPension[]
  onCancelar: (dia: DiaPension) => void
  cancelando?: boolean
}) {
  if (!dias.length) {
    return (
      <p className='rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground'>
        Sin almuerzos de pensión este mes.
      </p>
    )
  }
  return (
    <ul className='overflow-hidden rounded-xl border'>
      {dias.map((dia) => {
        const { Icon, className } = iconoDia(dia)
        const fecha = formatearFecha(dia.fecha, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
        return (
          <li
            key={dia.id}
            className='flex items-center gap-3 border-b border-dashed p-3 text-sm last:border-b-0'
          >
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full',
                className
              )}
            >
              <Icon className='size-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='font-medium first-letter:uppercase'>{fecha}</p>
              <p className='truncate text-muted-foreground'>
                {dia.menu ?? 'Sin menú'}
              </p>
            </div>
            <Badge variant='outline' className='shrink-0'>
              {esSinServicio(dia)
                ? 'Sin servicio'
                : estadoReservaLabels[dia.estado]}
            </Badge>
            {dia.cancelable && (
              <Button
                variant='ghost'
                size='sm'
                className='shrink-0 text-destructive hover:text-destructive'
                disabled={cancelando}
                aria-label={`Cancelar almuerzo del ${fecha}`}
                onClick={() => onCancelar(dia)}
              >
                Cancelar
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
