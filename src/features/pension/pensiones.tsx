import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { getApiErrorMessage } from '@/api/client'
import { formatearMonto } from '@/lib/moneda'
import { getNombreCompleto } from '@/lib/persona'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { hoyBolivia, mesDe } from '@/features/dashboard/fechas'
import { useDetallePension, usePensionados } from './api'
import { DetallePension } from './components/detalle-pension'
import { EstadoPension } from './components/estado-pension'
import { SelectorMes } from './components/selector-mes'
import { parentescoDe, vigencia } from './format'
import { type FilaPensionado, estadoPensionLabels } from './schema'

const estadoOptions = Object.entries(estadoPensionLabels).map(
  ([value, label]) => ({ value, label })
)

function nombreTitular(fila: FilaPensionado) {
  return getNombreCompleto({
    nombres: fila.titularNombres,
    primerApellido: fila.titularPrimerApellido,
    segundoApellido: fila.titularSegundoApellido,
  })
}

function DetallePensionado({
  fila,
  mes,
  onCambiarMes,
  onCerrar,
}: {
  fila: FilaPensionado
  mes: string
  onCambiarMes: (mes: string) => void
  onCerrar: () => void
}) {
  const detalle = useDetallePension(fila.idSuscripcion, mes)
  const datos = detalle.data

  return (
    <DetallePension
      titulo={getNombreCompleto(fila)}
      subtitulo={
        fila.parentesco
          ? `${parentescoDe(fila)} de ${nombreTitular(fila)}`
          : 'Titular'
      }
      mes={mes}
      onCambiarMes={onCambiarMes}
      datos={datos && { ...datos, pension: datos }}
      cargando={detalle.isPending}
      actualizando={detalle.isPlaceholderData}
      error={detalle.error}
      onReintentar={() => detalle.refetch()}
      finSiCancela={datos?.finSiCancela}
      onCerrar={onCerrar}
    />
  )
}

export function Pensiones() {
  const [mes, setMes] = useState(() => mesDe(hoyBolivia()))
  const pensionados = usePensionados(mes)
  const [seleccionado, setSeleccionado] = useState<FilaPensionado | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columnas = useMemo<ColumnDef<FilaPensionado>[]>(
    () => [
      {
        id: 'persona',
        header: 'Persona',
        accessorFn: getNombreCompleto,
        cell: ({ row, getValue }) => (
          <div className='flex flex-col'>
            <span className='font-medium'>{getValue<string>()}</span>
            <span className='text-xs text-muted-foreground'>
              {parentescoDe(row.original)}
            </span>
          </div>
        ),
        enableHiding: false,
      },
      { id: 'titular', header: 'Titular', accessorFn: nombreTitular },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <EstadoPension estado={row.original.estado} />,
        filterFn: 'arrIncludesSome',
        enableGlobalFilter: false,
      },
      {
        id: 'vigencia',
        header: 'Vigencia',
        cell: ({ row }) => vigencia(row.original),
        meta: { className: 'text-nowrap' },
      },
      {
        id: 'comprometidos',
        header: 'Almuerzos',
        cell: ({ row }) => row.original.comprometidos,
        meta: { className: 'text-right tabular-nums' },
      },
      {
        id: 'cancelados',
        header: 'Cancelados',
        cell: ({ row }) => row.original.cancelados,
        meta: { className: 'text-right tabular-nums' },
      },
      {
        id: 'monto',
        header: 'Monto',
        cell: ({ row }) => formatearMonto(row.original.monto),
        meta: { className: 'text-right tabular-nums' },
      },
      {
        id: 'ver',
        cell: ({ row }) => (
          <Button
            variant='outline'
            size='sm'
            aria-label={`Ver pensión de ${getNombreCompleto(row.original)}`}
            onClick={() => setSeleccionado(row.original)}
          >
            Ver
          </Button>
        ),
        enableHiding: false,
        meta: { className: 'text-right' },
      },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: pensionados.data ?? [],
    columns: columnas,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-4'>
        <PageHeader
          title='Pensiones'
          description='Empleados y familiares con pensión en el mes. Abra una fila para ver sus días o cancelarla.'
          actions={<SelectorMes mes={mes} onCambiar={setMes} />}
        />
        <DataTableToolbar
          table={table}
          searchPlaceholder='Buscar por persona o titular...'
          filters={[
            { columnId: 'estado', title: 'Estado', options: estadoOptions },
          ]}
        />
        <DataTable
          table={table}
          isLoading={pensionados.isPending}
          isFetching={pensionados.isFetching}
          error={
            pensionados.isError ? getApiErrorMessage(pensionados.error) : null
          }
          onRetry={() => pensionados.refetch()}
          emptyMessage='No hay pensiones en este mes.'
        />
        <DataTablePagination table={table} className='mt-auto' />
      </Main>

      {seleccionado && (
        <DetallePensionado
          key={seleccionado.idSuscripcion}
          fila={seleccionado}
          mes={mes}
          onCambiarMes={setMes}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </>
  )
}
