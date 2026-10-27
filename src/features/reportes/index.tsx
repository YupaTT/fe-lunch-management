import { getRouteApi } from '@tanstack/react-router'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import {
  desplazarMes,
  hoyBolivia,
  mesDe,
  rangoDelMes,
} from '@/features/dashboard/fechas'
import { type TipoReporte, useAbrirPdf } from './api'
import { ReporteAsistencia } from './asistencia'
import { ReportePlanilla } from './planilla'
import { errorRango } from './rango'
import { type FiltrosReporte } from './schema'

const route = getRouteApi('/_authenticated/reportes')

const titulos: Record<TipoReporte, string> = {
  asistencia: 'Asistencia',
  planilla: 'Planilla de descuentos',
}

function CampoFecha({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
}) {
  return (
    <div className='grid gap-1'>
      <Label htmlFor={id} className='text-xs text-muted-foreground'>
        {label}
      </Label>
      <Input
        id={id}
        type='date'
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        className='w-40'
      />
    </div>
  )
}

export function Reportes() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const abrirPdf = useAbrirPdf()

  const mesActual = mesDe(hoyBolivia())
  const tipo = search.tipo ?? 'asistencia'
  const filtros: FiltrosReporte = {
    desde: search.desde ?? rangoDelMes(mesActual).desde,
    hasta: search.hasta ?? rangoDelMes(mesActual).hasta,
  }
  const error = errorRango(filtros)

  const cambiar = (cambios: Partial<typeof search>) =>
    navigate({ search: (previo) => ({ ...previo, ...cambios }) })
  const irAlMes = (mes: string) => cambiar(rangoDelMes(mes))

  function descargar() {
    abrirPdf.mutate(
      { tipo, filtros },
      {
        onError: (e) =>
          toast.error(getApiErrorMessage(e, 'No se pudo generar el PDF.')),
      }
    )
  }

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-1 flex-col gap-6'>
        <PageHeader
          title='Reportes'
          description='Asistencia por día y persona, y planilla de descuentos por empleado en un rango de fechas.'
          actions={
            <Button
              onClick={descargar}
              disabled={!!error || abrirPdf.isPending}
            >
              <FileDown />
              {abrirPdf.isPending ? 'Generando...' : 'Descargar PDF'}
            </Button>
          }
        />

        <div className='flex flex-wrap items-end gap-3'>
          <Tabs
            value={tipo}
            onValueChange={(valor) => cambiar({ tipo: valor as TipoReporte })}
          >
            <TabsList>
              {Object.entries(titulos).map(([valor, titulo]) => (
                <TabsTrigger key={valor} value={valor}>
                  {titulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className='flex flex-wrap items-end gap-2 sm:ms-auto'>
            <CampoFecha
              id='desde'
              label='Desde'
              value={filtros.desde}
              onChange={(desde) => cambiar({ desde })}
            />
            <CampoFecha
              id='hasta'
              label='Hasta'
              value={filtros.hasta}
              onChange={(hasta) => cambiar({ hasta })}
            />
            <Button
              variant='outline'
              onClick={() => irAlMes(desplazarMes(mesDe(filtros.desde), -1))}
            >
              Mes anterior
            </Button>
            <Button variant='outline' onClick={() => irAlMes(mesActual)}>
              Mes actual
            </Button>
          </div>
        </div>

        {error ? (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        ) : tipo === 'asistencia' ? (
          <ReporteAsistencia filtros={filtros} />
        ) : (
          <ReportePlanilla filtros={filtros} />
        )}
      </Main>
    </>
  )
}
