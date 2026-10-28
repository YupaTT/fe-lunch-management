import { useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { modalidadOptions } from './columns'
import { type Ingreso } from './schema'

export function TablaIngresos({
  filas,
  columnas,
  emptyMessage,
  isFetching,
}: {
  filas: Ingreso[]
  columnas: ColumnDef<Ingreso>[]
  emptyMessage: string
  isFetching?: boolean
}) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    titular: false,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filas,
    columns: columnas,
    state: { globalFilter, columnFilters, columnVisibility },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className='flex flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar por nombre...'
        filters={[
          {
            columnId: 'modalidad',
            title: 'Modalidad',
            options: modalidadOptions,
          },
        ]}
      />
      <DataTable
        table={table}
        isFetching={isFetching}
        emptyMessage={emptyMessage}
      />
      <DataTablePagination table={table} />
    </div>
  )
}
