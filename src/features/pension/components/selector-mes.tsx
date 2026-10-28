import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { desplazarMes, hoyBolivia, mesDe } from '@/features/dashboard/fechas'
import { formatearMes } from '../format'

// Desplegable de meses alrededor del actual. La pensión rige desde el mes
// siguiente, por eso se ofrecen también meses futuros.
export function SelectorMes({
  mes,
  onCambiar,
  anteriores = 12,
  posteriores = 2,
}: {
  mes: string
  onCambiar: (mes: string) => void
  anteriores?: number
  posteriores?: number
}) {
  const actual = mesDe(hoyBolivia())
  const meses = Array.from({ length: anteriores + posteriores + 1 }, (_, i) =>
    desplazarMes(actual, posteriores - i)
  )
  if (!meses.includes(mes)) meses.push(mes)

  return (
    <Select value={mes} onValueChange={onCambiar}>
      <SelectTrigger size='sm' className='w-44' aria-label='Mes'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {meses.map((valor) => (
          <SelectItem
            key={valor}
            value={valor}
            className='first-letter:uppercase'
          >
            {formatearMes(`${valor}-01`)}
            {valor === actual && ' (actual)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
