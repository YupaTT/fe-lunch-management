import { type ColumnDef } from '@tanstack/react-table'
import { getNombreCompleto } from '@/lib/persona'
import { parentescoLabels } from '@/features/familiares/schema'
import { type Ingreso, modalidadLabels } from './schema'

export const modalidadOptions = Object.entries(modalidadLabels).map(
  ([value, label]) => ({ value, label })
)

// Columnas comunes a las pestañas Faltan e Ingresaron
export const columnasBase: ColumnDef<Ingreso>[] = [
  {
    id: 'persona',
    accessorFn: (ingreso) => getNombreCompleto(ingreso),
    header: 'Persona',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{getNombreCompleto(row.original)}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.parentesco
            ? `${parentescoLabels[row.original.parentesco]} de ${getNombreCompleto(row.original.titular)}`
            : 'Titular'}
        </span>
      </div>
    ),
    enableHiding: false,
    meta: { label: 'Persona' },
  },
  {
    id: 'titular',
    accessorFn: (ingreso) => getNombreCompleto(ingreso.titular),
    header: 'Titular',
    cell: ({ row }) => getNombreCompleto(row.original.titular),
    meta: { label: 'Titular' },
  },
  {
    accessorKey: 'modalidad',
    header: 'Modalidad',
    cell: ({ row }) => modalidadLabels[row.original.modalidad],
    filterFn: 'arrIncludesSome',
    enableGlobalFilter: false,
    meta: { label: 'Modalidad' },
  },
]
