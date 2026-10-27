import { UserCheck, UserX, Users, Utensils } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListaIngreso } from '@/features/ingresos/api'
import { usePensionados } from '@/features/pension/api'
import { useUsuarios } from '@/features/users/api'
import { hoyBolivia, mesDe } from './fechas'
import { KpiCard } from './kpi'

const estiloTooltip = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}

// Porcentaje entero de una parte del total; sin total no hay base para calcularlo
function porcentaje(parte?: number, total?: number) {
  if (parte === undefined || !total) return undefined
  return Math.round((parte / total) * 100)
}

export function DashboardAdministrativo() {
  const hoy = hoyBolivia()
  const ingresos = useListaIngreso(hoy)
  const pensionados = usePensionados(mesDe(hoy))
  const empleados = useUsuarios({ pagina: 1, limite: 10, estado: 'ACTIVO' })

  const { data, error } = ingresos
  const total = data?.totalRaciones
  const ingresaron = data?.ingresaron.total
  const faltan = data?.faltan.total
  const pctIngresaron = porcentaje(ingresaron, total)
  const pctFaltan = porcentaje(faltan, total)

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <KpiCard
          titulo='Raciones de hoy'
          icon={Utensils}
          valor={total}
          cargando={ingresos.isLoading}
          detalle={error ? getApiErrorMessage(error) : 'Reservas no canceladas'}
        />
        <KpiCard
          titulo='Ingresaron'
          icon={UserCheck}
          valor={ingresaron}
          cargando={ingresos.isLoading}
          detalle={
            pctIngresaron !== undefined
              ? `${pctIngresaron} % de las raciones`
              : undefined
          }
        />
        <KpiCard
          titulo='Faltan'
          icon={UserX}
          valor={faltan}
          cargando={ingresos.isLoading}
          detalle={
            pctFaltan !== undefined
              ? `${pctFaltan} % sin registrar ingreso`
              : undefined
          }
        />
        <KpiCard
          titulo='Empleados activos'
          icon={Users}
          valor={empleados.data?.total}
          cargando={empleados.isLoading}
          detalle={
            empleados.error
              ? getApiErrorMessage(empleados.error)
              : 'Cuentas con estado activo'
          }
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='rounded-2xl lg:col-span-2'>
          <CardHeader>
            <CardTitle className='font-sans text-base'>
              Estado de las raciones de hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ingresos.isLoading && (
              <Skeleton className='h-[150px] w-full rounded-xl' />
            )}
            {error && (
              <p className='text-sm text-muted-foreground'>
                {getApiErrorMessage(error)}
              </p>
            )}
            {data && (
              <ResponsiveContainer width='100%' height={150}>
                <BarChart
                  data={[
                    {
                      hoy: 'Hoy',
                      ingresaron: data.ingresaron.total,
                      faltan: data.faltan.total,
                    },
                  ]}
                  layout='vertical'
                  margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                >
                  <XAxis
                    type='number'
                    hide
                    domain={[
                      0,
                      Math.max(
                        data.totalRaciones,
                        data.ingresaron.total + data.faltan.total,
                        1
                      ),
                    ]}
                  />
                  <YAxis type='category' dataKey='hoy' hide />
                  <Tooltip cursor={false} contentStyle={estiloTooltip} />
                  <Legend
                    iconType='circle'
                    wrapperStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar
                    dataKey='ingresaron'
                    name='Ingresaron'
                    stackId='raciones'
                    fill='var(--primary)'
                    stroke='var(--card)'
                    strokeWidth={2}
                    barSize={24}
                    radius={4}
                  />
                  <Bar
                    dataKey='faltan'
                    name='Faltan'
                    stackId='raciones'
                    fill='var(--muted-foreground)'
                    stroke='var(--card)'
                    strokeWidth={2}
                    barSize={24}
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className='rounded-2xl'>
          <CardHeader>
            <CardTitle className='font-sans text-base'>Asistencia</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-4xl font-bold'>
              {pctIngresaron !== undefined ? `${pctIngresaron} %` : '—'}
            </p>
            <div className='h-3 overflow-hidden rounded-full bg-primary/15'>
              <div
                className='h-full rounded-full bg-primary transition-[width]'
                style={{ width: `${pctIngresaron ?? 0}%` }}
              />
            </div>
            <p className='text-sm text-muted-foreground'>
              {ingresaron ?? '—'} de {total ?? '—'} raciones registraron ingreso
            </p>
            <div className='flex items-center justify-between border-t pt-3 text-sm'>
              <span className='text-muted-foreground'>Pensionados del mes</span>
              <span className='font-semibold'>
                {pensionados.data?.length ?? '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
