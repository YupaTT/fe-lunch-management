import { Fragment, useState } from 'react'
import { CalendarClock, Plus, Wallet } from 'lucide-react'
import { getApiErrorMessage } from '@/api/client'
import { formatearMonto } from '@/lib/moneda'
import { getNombreCompleto } from '@/lib/persona'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { desplazarMes, hoyBolivia, mesDe } from '@/features/dashboard/fechas'
import { KpiCard } from '@/features/dashboard/kpi'
import { usePensionHogar } from './api'
import { ActivarPensionDialog } from './components/activar-pension-dialog'
import { DetallePension } from './components/detalle-pension'
import { EstadoPension } from './components/estado-pension'
import { HistorialPension } from './components/historial-pension'
import {
  esActivable,
  formatearCierre,
  formatearMes,
  parentescoDe,
  vigencia,
} from './format'
import { type PensionHogar, type PersonaHogar } from './schema'

// Datos que rigen la pensión, cada uno con su explicación en un tooltip
function ReglasPension({ datos }: { datos: PensionHogar }) {
  const reglas = [
    {
      texto: `${formatearMonto(datos.precio)} por almuerzo`,
      ayuda: 'Se descuenta por planilla.',
    },
    {
      texto: `Mínimo ${datos.minimo} al mes`,
      ayuda: 'Almuerzos que cada persona debe conservar en el mes.',
    },
    {
      texto: `Activar o cancelar hasta: ${formatearCierre(datos.cierre)}`,
      ayuda: 'El cambio rige desde el próximo mes.',
    },
  ]
  return (
    <p className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
      {reglas.map(({ texto, ayuda }, indice) => (
        <Fragment key={texto}>
          {indice > 0 && <span aria-hidden>·</span>}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className='cursor-help underline decoration-dotted underline-offset-4'
              >
                {texto}
              </span>
            </TooltipTrigger>
            <TooltipContent>{ayuda}</TooltipContent>
          </Tooltip>
        </Fragment>
      ))}
    </p>
  )
}

// Texto que explica en una línea la situación de la persona
function situacion(persona: PersonaHogar) {
  const { pension } = persona
  if (!pension) return 'Nunca tuvo pensión.'
  const desde = formatearMes(pension.mesInicio)
  if (pension.estado === 'PROGRAMADA') return `Empieza en ${desde}.`
  if (pension.estado === 'ACTIVA') return `Activa desde ${desde}.`
  if (pension.mesFin && pension.mesFin < pension.mesInicio) {
    return 'Se canceló antes de empezar.'
  }
  const hasta = pension.mesFin ? formatearMes(pension.mesFin) : ''
  if (pension.estado === 'POR_TERMINAR') return `Último mes: ${hasta}.`
  return `Tuvo pensión de ${desde} a ${hasta}.`
}

function TarjetaPersona({
  persona,
  onVer,
  onActivar,
}: {
  persona: PersonaHogar
  onVer: () => void
  onActivar: () => void
}) {
  const { pension } = persona
  return (
    <div className='flex flex-col gap-3 rounded-xl border p-4'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='truncate font-medium'>{getNombreCompleto(persona)}</p>
          <p className='text-xs text-muted-foreground'>
            {parentescoDe(persona)}
          </p>
        </div>
        <EstadoPension estado={pension?.estado} />
      </div>
      <dl className='grid grid-cols-2 gap-x-3 gap-y-1 text-sm'>
        <dt className='text-muted-foreground'>Vigencia</dt>
        <dd className='text-nowrap'>{pension ? vigencia(pension) : '—'}</dd>
        <dt className='text-muted-foreground'>Este mes</dt>
        <dd className='tabular-nums'>
          {persona.comprometidos} almuerzos · {formatearMonto(persona.monto)}
        </dd>
      </dl>
      <p className='text-sm text-muted-foreground first-letter:uppercase'>
        {situacion(persona)}
      </p>
      <div className='mt-auto flex gap-2'>
        {pension && (
          <Button variant='outline' size='sm' onClick={onVer}>
            Ver días
          </Button>
        )}
        {esActivable(pension) && (
          <Button size='sm' onClick={onActivar}>
            {pension ? 'Renovar' : 'Registrar'}
          </Button>
        )}
      </div>
    </div>
  )
}

export function MiPension() {
  const mesActual = mesDe(hoyBolivia())
  const hogar = usePensionHogar(mesActual)
  const proximo = usePensionHogar(desplazarMes(mesActual, 1))
  // undefined: diálogo cerrado; null: abierto sin persona preseleccionada
  const [aActivar, setAActivar] = useState<PersonaHogar | null | undefined>()
  const [idDetalle, setIdDetalle] = useState<string | null>(null)
  const [mesDetalle, setMesDetalle] = useState(mesActual)
  const hogarDetalle = usePensionHogar(mesDetalle, undefined, !!idDetalle)

  const datos = hogar.data
  const personas = datos?.personas ?? []
  const hayActivables = personas.some((p) => esActivable(p.pension))
  const detalle = hogarDetalle.data?.personas.find(
    (p) => p.idPersona === idDetalle
  )

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-6'>
        <PageHeader
          title='Pensión'
          description='Gestiona las pensiones mensuales.'
          actions={
            datos && (
              <Button
                disabled={!hayActivables}
                onClick={() => setAActivar(null)}
              >
                <Plus />
                Registrar pensión
              </Button>
            )
          }
        />
        {datos && <ReglasPension datos={datos} />}

        {hogar.isPending ? (
          <Skeleton className='h-48 w-full' />
        ) : hogar.isError ? (
          <div className='flex flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center'>
            <p className='text-destructive'>
              {getApiErrorMessage(hogar.error, 'No se pudo cargar la pensión.')}
            </p>
            <Button variant='outline' size='sm' onClick={() => hogar.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-3 sm:gap-4'>
              <KpiCard
                titulo='Descuento de este mes'
                icon={Wallet}
                valor={formatearMonto(datos?.total ?? 0)}
                detalle={formatearMes(`${mesActual}-01`)}
              />
              <KpiCard
                titulo='Próximo mes'
                icon={CalendarClock}
                cargando={proximo.isPending}
                valor={formatearMonto(proximo.data?.total ?? 0)}
                detalle={formatearMes(`${desplazarMes(mesActual, 1)}-01`)}
              />
            </div>

            <section className='flex flex-col gap-3'>
              <h2 className='font-semibold'>Personas de mi hogar</h2>
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {personas.map((persona) => (
                  <TarjetaPersona
                    key={persona.idPersona}
                    persona={persona}
                    onVer={() => {
                      setMesDetalle(mesActual)
                      setIdDetalle(persona.idPersona)
                    }}
                    onActivar={() => setAActivar(persona)}
                  />
                ))}
              </div>
            </section>

            <HistorialPension />
          </>
        )}
      </Main>

      {idDetalle && (
        <DetallePension
          titulo={detalle ? getNombreCompleto(detalle) : 'Pensión'}
          subtitulo={detalle ? parentescoDe(detalle) : ''}
          mes={mesDetalle}
          onCambiarMes={setMesDetalle}
          datos={
            detalle?.pension
              ? { ...detalle, pension: detalle.pension }
              : undefined
          }
          cargando={hogarDetalle.isPending}
          actualizando={hogarDetalle.isPlaceholderData}
          error={hogarDetalle.error}
          onReintentar={() => hogarDetalle.refetch()}
          finSiCancela={hogarDetalle.data?.finSiCancela}
          minimo={hogarDetalle.data?.minimo}
          onCerrar={() => setIdDetalle(null)}
        />
      )}

      {aActivar !== undefined && datos && (
        <ActivarPensionDialog
          datos={datos}
          inicial={aActivar}
          onOpenChange={(open) => !open && setAActivar(undefined)}
        />
      )}
    </>
  )
}
