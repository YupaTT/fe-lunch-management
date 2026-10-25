import { type ColumnDef } from '@tanstack/react-table'
import { getNombreCompleto } from '@/lib/persona'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { estadoLabels, estadoStyles } from '../data/data'
import { type Usuario } from '../data/schema'
import { UsersRowActions } from './users-row-actions'

const baseColumns: ColumnDef<Usuario>[] = [
  {
    id: 'nombres',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Empleado' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <LongText className='max-w-56 font-medium'>
          {getNombreCompleto(row.original.persona)}
        </LongText>
        <span className='text-xs text-muted-foreground'>
          {row.original.correoElectronico}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    id: 'nroDocumento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Documento' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>{row.original.persona.nroDocumento}</div>
    ),
  },
  {
    id: 'rol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-1'>
        {row.original.usuarioRol.map(({ id, rol }) => (
          <Badge key={id} variant='secondary' className='capitalize'>
            {rol.rol.toLowerCase()}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'cantidadFamiliares',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Familiares' />
    ),
    cell: ({ row }) => (
      <div className='text-center tabular-nums'>
        {row.original.cantidadFamiliares ?? 0}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { estado } = row.original
      return (
        <Badge variant='outline' className={cn(estadoStyles.get(estado))}>
          {estadoLabels[estado] ?? estado}
        </Badge>
      )
    },
    enableHiding: false,
  },
]

export const usersColumns = baseColumns

export const usersColumnsWithActions: ColumnDef<Usuario>[] = [
  ...baseColumns,
  {
    id: 'actions',
    cell: UsersRowActions,
    meta: { className: 'w-12' },
  },
]
