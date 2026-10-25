import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { getApiErrorMessage } from '@/api/client'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { Rol, useHasRole } from '@/features/auth/roles'
import { useRoles, useUsuarios } from '../api'
import { estadoOptions } from '../data/data'
import { usersColumns, usersColumnsWithActions } from './users-columns'

const TODOS = 'todos'

type UsersTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function UsersTable({ search, navigate }: UsersTableProps) {
  const canManage = useHasRole(Rol.ADMINISTRADOR)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filtro' },
    columnFilters: [
      { columnId: 'rol', searchKey: 'rol', type: 'array' },
      { columnId: 'estado', searchKey: 'estado', type: 'string' },
    ],
  })

  const filtro = useDebouncedValue(globalFilter)
  const [sort] = sorting
  const rol = columnFilters.find((f) => f.id === 'rol')?.value as
    | string[]
    | undefined
  const estado = columnFilters.find((f) => f.id === 'estado')?.value as
    | string
    | undefined

  const roles = useRoles()
  const { data, isPending, isError, error, isFetching, refetch } = useUsuarios({
    pagina: pagination.pageIndex + 1,
    limite: pagination.pageSize,
    filtro: filtro || undefined,
    orden: sort ? `${sort.desc ? '-' : ''}${sort.id}` : undefined,
    rol: rol?.length ? rol.join(',') : undefined,
    estado: estado || undefined,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.filas ?? [],
    columns: canManage ? usersColumnsWithActions : usersColumns,
    rowCount: data?.total ?? 0,
    state: {
      sorting,
      pagination,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableMultiSort: false,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  const estadoColumn = table.getColumn('estado')

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar por nombre, documento o correo...'
        filters={[
          {
            columnId: 'rol',
            title: 'Rol',
            options: (roles.data ?? []).map((r) => ({
              label: r.nombre,
              value: r.id,
            })),
          },
        ]}
      >
        <Select
          value={estado || TODOS}
          onValueChange={(value) =>
            estadoColumn?.setFilterValue(value === TODOS ? undefined : value)
          }
        >
          <SelectTrigger size='sm' className='w-40' aria-label='Estado'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            {estadoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataTableToolbar>
      <DataTable
        table={table}
        isLoading={isPending}
        isFetching={isFetching}
        error={isError ? getApiErrorMessage(error) : null}
        onRetry={() => refetch()}
        emptyMessage='No se encontraron empleados.'
      />
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
