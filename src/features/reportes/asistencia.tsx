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
import { CalendarCheck, CalendarX, UserCheck, UserX } from 'lucide-react'
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getApiErrorMessage } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { formatearFecha } from '@/features/dashboard/fechas'
import { KpiCard } from '@/features/dashboard/kpi'
import { textoPlano } from '@/features/menu/markdown'
import {
  estadoMenuLabels,
  motivoSinServicioLabels,
} from '@/features/menu/schema'
import { parentescoDe } from '@/features/pension/format'
import { useReporteAsistencia } from './api'
import {
  type Conteo,
  type DiaAsistencia,
  type FiltrosReporte,
  type Modalidades,
  type PersonaAsistencia,
  sumar,
  tipoPersonaLabels,
} from './schema'

const estiloTooltip = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}

const tipoOptions = Object.entries(tipoPersonaLabels).map(([value, label]) => ({
  value,
  label,
}))

const numero = { meta: { className: 'text-right tabular-nums' } }

// Columnas de conteo compartidas por las tablas de días y personas
function columnasConteo<T extends Modalidades<Conteo>>(): ColumnDef<T>[] {
  const celda = (clave: keyof Conteo) => ({
    id: clave,
    cell: ({ row }: { row: { original: T } }) => sumar(row.original)[clave],
    ...numero,
  })
  return [
    { header: 'Reservados', ...celda('reservados') },
    { header: 'Asistieron', ...celda('asistieron') },
    { header: 'No asistieron', ...celda('noAsistieron') },
    { header: 'Cancelados', ...celda('cancelados') },
  ]
}

function descripcionDia(dia: DiaAsistencia) {
  if (dia.estado !== 'SIN_SERVICIO') return textoPlano(dia.descripcion ?? '')
  const motivo = dia.motivoSinServicio
    ? motivoSinServicioLabels[dia.motivoSinServicio]
    : 'Sin servicio'
  return dia.detalleMotivo ? `${motivo}: ${dia.detalleMotivo}` : motivo
}

function GraficoDias({ dias }: { dias: DiaAsistencia[] }) {
  const datos = dias.map((dia) => ({
    dia: formatearFecha(dia.fecha, { day: 'numeric', month: 'short' }),
    ...sumar(dia),
  }))
  return (
    <Card className='rounded-2xl'>
      <CardHeader>
        <CardTitle className='font-sans text-base'>
          Asistencia por día
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={220}>
          <BarChart
            data={datos}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          >
            <XAxis dataKey='dia' fontSize={12} tickLine={false} />
            <YAxis allowDecimals={false} fontSize={12} width={28} />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              contentStyle={estiloTooltip}
            />
            <Legend
              iconType='circle'
              wrapperStyle={{ color: 'var(--foreground)' }}
            />
            <Bar
              dataKey='asistieron'
              name='Asistieron'
              stackId='a'
              fill='var(--primary)'
            />
            <Bar
              dataKey='noAsistieron'
              name='No asistieron'
              stackId='a'
              fill='var(--destructive)'
            />
            <Bar
              dataKey='cancelados'
              name='Cancelados'
              stackId='a'
              fill='var(--muted-foreground)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function TablaPersonas({ personas }: { personas: PersonaAsistencia[] }) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columnas = useMemo<ColumnDef<PersonaAsistencia>[]>(
    () => [
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
        enableHiding: false,
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ getValue }) => tipoPersonaLabels[getValue<'EMPLEADO'>()],
        filterFn: 'arrIncludesSome',
        enableGlobalFilter: false,
      },
      { accessorKey: 'titular', header: 'Titular' },
      ...columnasConteo<PersonaAsistencia>(),
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: personas,
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
    <div className='flex flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar por persona o titular...'
        filters={[{ columnId: 'tipo', title: 'Tipo', options: tipoOptions }]}
      />
      <DataTable
        table={table}
        emptyMessage='Nadie tuvo almuerzos en el rango.'
      />
      <DataTablePagination table={table} />
    </div>
  )
}

function TablaDias({ dias }: { dias: DiaAsistencia[] }) {
  const columnas = useMemo<ColumnDef<DiaAsistencia>[]>(
    () => [
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: ({ getValue }) => (
          <span className='text-nowrap first-letter:uppercase'>
            {formatearFecha(getValue<string>(), {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </span>
        ),
      },
      {
        id: 'servicio',
        header: 'Servicio',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Badge variant='outline' className='w-fit'>
              {estadoMenuLabels[row.original.estado]}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              {descripcionDia(row.original)}
            </span>
          </div>
        ),
      },
      ...columnasConteo<DiaAsistencia>(),
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: dias,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 31 } },
  })

  return (
    <div className='flex flex-col gap-4'>
      <DataTable
        table={table}
        emptyMessage='No hay días publicados en el rango.'
      />
      <DataTablePagination table={table} />
    </div>
  )
}

export function ReporteAsistencia({ filtros }: { filtros: FiltrosReporte }) {
  const reporte = useReporteAsistencia(filtros)

  if (reporte.isPending) return <Skeleton className='h-96 w-full' />
  if (reporte.isError) {
    return (
      <p role='alert' className='text-sm text-destructive'>
        {getApiErrorMessage(reporte.error, 'No se pudo cargar el reporte.')}
      </p>
    )
  }

  const { totales, dias, personas } = reporte.data
  const total = sumar(totales)

  return (
    <div
      className={`flex flex-col gap-6 transition-opacity ${reporte.isPlaceholderData ? 'opacity-60' : ''}`}
    >
      <div className='grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4'>
        <KpiCard
          titulo='Asistieron'
          icon={UserCheck}
          valor={total.asistieron}
          detalle={`${totales.pension.asistieron} de pensión`}
        />
        <KpiCard
          titulo='No asistieron'
          icon={UserX}
          valor={total.noAsistieron}
          detalle='Se cobran igual'
        />
        <KpiCard
          titulo='Cancelados'
          icon={CalendarX}
          valor={total.cancelados}
        />
        <KpiCard
          titulo='Reservados'
          icon={CalendarCheck}
          valor={total.reservados}
          detalle='Días futuros'
        />
      </div>
      {dias.length > 0 && <GraficoDias dias={dias} />}
      <Tabs defaultValue='dias' className='gap-4'>
        <TabsList>
          <TabsTrigger value='dias'>Por día</TabsTrigger>
          <TabsTrigger value='personas'>Por persona</TabsTrigger>
        </TabsList>
        <TabsContent value='dias'>
          <TablaDias dias={dias} />
        </TabsContent>
        <TabsContent value='personas'>
          <TablaPersonas personas={personas} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
