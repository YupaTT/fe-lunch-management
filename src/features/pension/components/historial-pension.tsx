import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { getApiErrorMessage } from '@/api/client'
import { formatearMonto } from '@/lib/moneda'
import { getNombreCompleto } from '@/lib/persona'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { mesDe } from '@/features/dashboard/fechas'
import { useReservas } from '@/features/reservas/api'
import { type Reserva } from '@/features/reservas/schema'
import { formatearMes, parentescoDe } from '../format'

type FilaHistorial = {
  mes: string
  idPersona: string
  persona: string
  parentesco: string
  almuerzos: number
  asistio: number
  noAsistio: number
  pendientes: number
  costo: number
}

// Agrupa las reservas de pensión por mes y persona
function agrupar(reservas: Reserva[]) {
  const filas = new Map<string, FilaHistorial>()
  for (const r of reservas) {
    if (r.modalidad !== 'PENSION' || r.estado === 'CANCELADO') continue
    const mes = mesDe(r.fecha)
    const clave = `${mes}|${r.idPersona}`
    const fila = filas.get(clave) ?? {
      mes,
      idPersona: r.idPersona,
      persona: getNombreCompleto(r),
      parentesco: parentescoDe(r),
      almuerzos: 0,
      asistio: 0,
      noAsistio: 0,
      pendientes: 0,
      costo: 0,
    }
    fila.almuerzos++
    fila.costo += Number(r.precio)
    if (r.estado === 'ASISTIO') fila.asistio++
    else if (r.estado === 'NO_ASISTIO') fila.noAsistio++
    else fila.pendientes++
    filas.set(clave, fila)
  }
  return [...filas.values()]
}

const columnas: ColumnDef<FilaHistorial>[] = [
  {
    accessorKey: 'mes',
    header: 'Mes',
    cell: ({ row }) => (
      <span className='font-medium text-nowrap first-letter:uppercase'>
        {formatearMes(`${row.original.mes}-01`)}
      </span>
    ),
    filterFn: 'arrIncludesSome',
    enableGlobalFilter: false,
    enableHiding: false,
    meta: { label: 'Mes' },
  },
  {
    accessorKey: 'persona',
    header: 'Persona',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.original.persona}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.parentesco}
        </span>
      </div>
    ),
    filterFn: 'arrIncludesSome',
    enableHiding: false,
    meta: { label: 'Persona' },
  },
  {
    accessorKey: 'almuerzos',
    header: 'Almuerzos',
    enableGlobalFilter: false,
    meta: { label: 'Almuerzos', className: 'text-right tabular-nums' },
  },
  {
    accessorKey: 'asistio',
    header: 'Asistió',
    enableGlobalFilter: false,
    meta: { label: 'Asistió', className: 'text-right tabular-nums' },
  },
  {
    accessorKey: 'noAsistio',
    header: 'No asistió',
    enableGlobalFilter: false,
    meta: { label: 'No asistió', className: 'text-right tabular-nums' },
  },
  {
    accessorKey: 'pendientes',
    header: 'Pendientes',
    enableGlobalFilter: false,
    meta: { label: 'Pendientes', className: 'text-right tabular-nums' },
  },
  {
    accessorKey: 'costo',
    header: 'Costo',
    cell: ({ row }) => formatearMonto(row.original.costo),
    enableGlobalFilter: false,
    meta: { label: 'Costo', className: 'text-right tabular-nums' },
  },
]

// Historial completo de la pensión del hogar, mes a mes, sin filtro obligatorio
export function HistorialPension() {
  const reservas = useReservas(undefined, undefined, { select: agrupar })
  const filas = useMemo(() => reservas.data ?? [], [reservas.data])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'mes', desc: true },
  ])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filas,
    columns: columnas,
    state: { columnFilters, sorting },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const meses = [...new Set(filas.map((f) => f.mes))]
    .sort((a, b) => b.localeCompare(a))
    .map((mes) => ({ value: mes, label: formatearMes(`${mes}-01`) }))
  const personas = [...new Set(filas.map((f) => f.persona))].map((p) => ({
    value: p,
    label: p,
  }))

  return (
    <section className='flex flex-col gap-4'>
      <div>
        <h2 className='font-semibold'>Historial por mes</h2>
        <p className='text-sm text-muted-foreground'>
          Almuerzos de pensión de cada persona, lo que asistió y lo que se
          descuenta en planilla. Los meses futuros aparecen cuando se publica el
          menú.
        </p>
      </div>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar persona...'
        filters={[
          { columnId: 'mes', title: 'Mes', options: meses },
          { columnId: 'persona', title: 'Persona', options: personas },
        ]}
      />
      <DataTable
        table={table}
        isLoading={reservas.isPending}
        isFetching={reservas.isFetching}
        error={reservas.isError ? getApiErrorMessage(reservas.error) : null}
        onRetry={() => reservas.refetch()}
        emptyMessage='Todavía no hay almuerzos de pensión registrados.'
      />
      <DataTablePagination table={table} />
    </section>
  )
}
