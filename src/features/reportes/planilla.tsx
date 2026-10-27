import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Receipt, Utensils, Wallet } from 'lucide-react'
import { getApiErrorMessage } from '@/api/client'
import { formatearMonto } from '@/lib/moneda'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { KpiCard } from '@/features/dashboard/kpi'
import { parentescoDe } from '@/features/pension/format'
import { useReportePlanilla } from './api'
import {
  type EmpleadoPlanilla,
  type FiltrosReporte,
  type PersonaPlanilla,
} from './schema'

// Una fila por persona con su empleado titular, para buscar y paginar
type FilaPlanilla = PersonaPlanilla & { empleado: string }

const numero = { meta: { className: 'text-right tabular-nums' } }

function aplanar(empleados: EmpleadoPlanilla[]): FilaPlanilla[] {
  return empleados.flatMap((empleado) =>
    empleado.personas.map((persona) => ({
      ...persona,
      empleado: empleado.nombre,
    }))
  )
}

export function ReportePlanilla({ filtros }: { filtros: FiltrosReporte }) {
  const reporte = useReportePlanilla(filtros)
  const [globalFilter, setGlobalFilter] = useState('')
  const filas = useMemo(
    () => aplanar(reporte.data?.empleados ?? []),
    [reporte.data]
  )

  const columnas = useMemo<ColumnDef<FilaPlanilla>[]>(
    () => [
      { accessorKey: 'empleado', header: 'Empleado', enableHiding: false },
      {
        accessorKey: 'nombre',
        header: 'Persona',
        cell: ({ row, getValue }) => (
          <div className='flex flex-col'>
            <span className='font-medium'>{getValue<string>()}</span>
            <span className='text-xs text-muted-foreground'>
              {parentescoDe(row.original)}
            </span>
          </div>
        ),
      },
      {
        id: 'porDia',
        header: 'Por día',
        cell: ({ row }) =>
          `${row.original.porDia.cantidad} · ${formatearMonto(row.original.porDia.monto)}`,
        ...numero,
      },
      {
        id: 'pension',
        header: 'Pensión',
        cell: ({ row }) =>
          `${row.original.pension.cantidad} · ${formatearMonto(row.original.pension.monto)}`,
        ...numero,
      },
      {
        id: 'monto',
        header: 'Total',
        cell: ({ row }) => (
          <span className='font-medium'>
            {formatearMonto(row.original.monto)}
          </span>
        ),
        ...numero,
      },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filas,
    columns: columnas,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (reporte.isPending) return <Skeleton className='h-96 w-full' />
  if (reporte.isError) {
    return (
      <p role='alert' className='text-sm text-destructive'>
        {getApiErrorMessage(reporte.error, 'No se pudo cargar el reporte.')}
      </p>
    )
  }

  const { total, empleados } = reporte.data

  return (
    <div
      className={`flex flex-col gap-6 transition-opacity ${reporte.isPlaceholderData ? 'opacity-60' : ''}`}
    >
      <div className='grid grid-cols-3 gap-3 sm:gap-4'>
        <KpiCard
          titulo='Por día'
          icon={Utensils}
          valor={total.porDia.cantidad}
          detalle={formatearMonto(total.porDia.monto)}
        />
        <KpiCard
          titulo='Pensión'
          icon={Receipt}
          valor={total.pension.cantidad}
          detalle={formatearMonto(total.pension.monto)}
        />
        <KpiCard
          titulo='Total a descontar'
          icon={Wallet}
          valor={formatearMonto(total.monto)}
          detalle={`${empleados.length} empleado(s)`}
        />
      </div>
      <p className='text-sm text-muted-foreground'>
        Se cobran los almuerzos con asistencia o inasistencia; los cancelados a
        tiempo no se descuentan. El descuento se aplica fuera del sistema.
      </p>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar por empleado o persona...'
      />
      <DataTable
        table={table}
        emptyMessage='No hay consumos cobrables en el rango.'
      />
      <DataTablePagination table={table} />
    </div>
  )
}
