import { type ColumnDef } from '@tanstack/react-table'
import { formatearMonto } from '@/lib/moneda'
import { getNombreCompleto } from '@/lib/persona'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { ZONA_BOLIVIA, formatearFecha } from '@/features/dashboard/fechas'
import { parentescoDe } from '@/features/pension/format'
import {
  type EstadoReserva,
  type Reserva,
  estadoReservaLabels,
} from '@/features/reservas/schema'

const badgeDeEstado: Record<EstadoReserva, string> = {
  ASISTIO: 'border-green-600 text-green-700 dark:text-green-400',
  NO_ASISTIO: 'border-destructive text-destructive',
  CANCELADO: 'text-muted-foreground',
  RESERVADO: '',
}

function horaDeIngreso(fechaIngreso: string) {
  return new Date(fechaIngreso).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_BOLIVIA,
  })
}

export const asistenciaColumns: ColumnDef<Reserva>[] = [
  {
    accessorKey: 'fecha',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-nowrap first-letter:uppercase'>
        {formatearFecha(row.original.fecha, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })}
      </span>
    ),
    // El selector de mes filtra esta columna con un valor YYYY-MM
    filterFn: (row, _id, mes: string) =>
      !mes || row.original.fecha.startsWith(mes),
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { label: 'Fecha' },
  },
  {
    id: 'persona',
    accessorFn: (reserva) => getNombreCompleto(reserva),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Persona' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{getNombreCompleto(row.original)}</span>
        <span className='text-xs text-muted-foreground'>
          {parentescoDe(row.original)}
        </span>
      </div>
    ),
    enableHiding: false,
    meta: { label: 'Persona' },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant='outline' className={badgeDeEstado[row.original.estado]}>
        {estadoReservaLabels[row.original.estado]}
      </Badge>
    ),
    filterFn: 'arrIncludesSome',
    enableGlobalFilter: false,
    meta: { label: 'Estado' },
  },
  {
    accessorKey: 'fechaIngreso',
    header: 'Hora de ingreso',
    cell: ({ row }) =>
      row.original.fechaIngreso ? (
        horaDeIngreso(row.original.fechaIngreso)
      ) : (
        <span className='text-muted-foreground'>—</span>
      ),
    enableGlobalFilter: false,
    meta: { label: 'Hora de ingreso', className: 'tabular-nums' },
  },
  {
    accessorKey: 'precio',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Precio'
        className='justify-end'
      />
    ),
    cell: ({ row }) => formatearMonto(Number(row.original.precio)),
    sortingFn: (a, b) => Number(a.original.precio) - Number(b.original.precio),
    enableGlobalFilter: false,
    meta: { label: 'Precio', className: 'text-right tabular-nums' },
  },
]
