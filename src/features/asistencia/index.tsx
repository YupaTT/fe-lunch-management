import { useState } from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CalendarX2, CircleCheck, UsersRound } from 'lucide-react'
import { getApiErrorMessage } from '@/api/client'
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
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { desplazarMes, hoyBolivia, mesDe } from '@/features/dashboard/fechas'
import { KpiCard } from '@/features/dashboard/kpi'
import { formatearMes } from '@/features/pension/format'
import { useReservas } from '@/features/reservas/api'
import {
  type EstadoReserva,
  estadoReservaLabels,
} from '@/features/reservas/schema'
import { asistenciaColumns } from './columns'

const TODOS = 'todos'

// En el historial no hay pendientes
const estadoOptions = Object.entries(estadoReservaLabels)
  .filter(([value]) => value !== 'RESERVADO')
  .map(([value, label]) => ({ value, label }))

export function MisAsistencias() {
  // Historial: solo hasta hoy y sin reservas pendientes
  const reservas = useReservas(undefined, hoyBolivia(), {
    select: (filas) => filas.filter((r) => r.estado !== 'RESERVADO'),
  })
  // Últimos 12 meses, del actual hacia atrás, tengan o no registros
  const mesActual = mesDe(hoyBolivia())
  const meses = Array.from({ length: 12 }, (_, i) =>
    desplazarMes(mesActual, -i)
  )

  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fecha', desc: false },
  ])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: reservas.data ?? [],
    columns: asistenciaColumns,
    state: { globalFilter, columnFilters, columnVisibility, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const contar = (estado: EstadoReserva) =>
    reservas.data?.filter((r) => r.estado === estado).length ?? 0
  const mesColumn = table.getColumn('fecha')
  const mes = (mesColumn?.getFilterValue() as string | undefined) ?? TODOS

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-4'>
        <PageHeader
          title='Mis asistencias'
          description='Almuerzos de días pasados, tuyos y de tus familiares.'
        />

        <div className='grid grid-cols-3 gap-3 sm:gap-4'>
          <KpiCard
            titulo='Reservas'
            icon={UsersRound}
            valor={reservas.data?.length ?? 0}
          />
          <KpiCard
            titulo='Asistió'
            icon={CircleCheck}
            valor={contar('ASISTIO')}
          />
          <KpiCard
            titulo='No asistió'
            icon={CalendarX2}
            valor={contar('NO_ASISTIO')}
          />
        </div>

        <DataTableToolbar
          table={table}
          searchPlaceholder='Buscar por persona...'
          filters={[
            { columnId: 'estado', title: 'Estado', options: estadoOptions },
          ]}
        >
          <Select
            value={mes}
            onValueChange={(valor) =>
              mesColumn?.setFilterValue(valor === TODOS ? undefined : valor)
            }
          >
            <SelectTrigger size='sm' className='w-44' aria-label='Mes'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los meses</SelectItem>
              {meses.map((valor) => (
                <SelectItem
                  key={valor}
                  value={valor}
                  className='first-letter:uppercase'
                >
                  {formatearMes(`${valor}-01`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DataTableToolbar>
        <DataTable
          table={table}
          isLoading={reservas.isPending}
          isFetching={reservas.isFetching}
          error={reservas.isError ? getApiErrorMessage(reservas.error) : null}
          onRetry={() => reservas.refetch()}
          emptyMessage={
            mes === TODOS
              ? 'Todavía no tienes asistencias registradas.'
              : 'Sin datos en este mes.'
          }
        />
        <DataTablePagination table={table} className='mt-auto' />
      </Main>
    </>
  )
}
