import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { desplazarMes } from '@/features/dashboard/fechas'
import { formatearMes } from '../format'

export function SelectorMes({
  mes,
  onCambiar,
}: {
  mes: string
  onCambiar: (mes: string) => void
}) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='icon'
        aria-label='Mes anterior'
        onClick={() => onCambiar(desplazarMes(mes, -1))}
      >
        <ChevronLeft />
      </Button>
      <span
        aria-live='polite'
        className='min-w-36 text-center text-sm font-medium first-letter:uppercase'
      >
        {formatearMes(`${mes}-01`)}
      </span>
      <Button
        variant='outline'
        size='icon'
        aria-label='Mes siguiente'
        onClick={() => onCambiar(desplazarMes(mes, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
