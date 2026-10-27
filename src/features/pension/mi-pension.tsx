import { Fragment, useState } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { formatearMonto } from '@/lib/moneda'
import { getNombreCompleto } from '@/lib/persona'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { hoyBolivia, mesDe } from '@/features/dashboard/fechas'
import { useActivarPension, usePensionHogar } from './api'
import { DetallePension } from './components/detalle-pension'
import { EstadoPension } from './components/estado-pension'
import { SelectorMes } from './components/selector-mes'
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

export function MiPension() {
  const [mes, setMes] = useState(() => mesDe(hoyBolivia()))
  const hogar = usePensionHogar(mes)
  const activar = useActivarPension()
  const [aActivar, setAActivar] = useState<PersonaHogar | null>(null)
  const [idDetalle, setIdDetalle] = useState<string | null>(null)

  const datos = hogar.data
  const personas = datos?.personas ?? []
  const detalle = personas.find((p) => p.idPersona === idDetalle)

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-4'>
        <PageHeader
          title='Mi pensión'
          actions={<SelectorMes mes={mes} onCambiar={setMes} />}
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
          <div
            className={cn(
              'overflow-hidden rounded-md border transition-opacity',
              hogar.isPlaceholderData && 'opacity-60'
            )}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className='text-right'>Almuerzos</TableHead>
                  <TableHead className='text-right'>Monto</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.map((persona) => {
                  const { pension } = persona
                  return (
                    <TableRow
                      key={persona.idPersona}
                      className={cn(pension && 'cursor-pointer')}
                      onClick={() => pension && setIdDetalle(persona.idPersona)}
                    >
                      <TableCell>
                        <p className='font-medium'>
                          {getNombreCompleto(persona)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {parentescoDe(persona)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <EstadoPension estado={pension?.estado} />
                      </TableCell>
                      <TableCell className='text-nowrap'>
                        {pension ? vigencia(pension) : '—'}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {persona.comprometidos}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatearMonto(persona.monto)}
                      </TableCell>
                      <TableCell className='space-x-2 text-right text-nowrap'>
                        {pension && (
                          <Button
                            variant='outline'
                            size='sm'
                            aria-label={`Ver pensión de ${getNombreCompleto(persona)}`}
                          >
                            Ver
                          </Button>
                        )}
                        {esActivable(pension) && (
                          <Button
                            size='sm'
                            aria-label={`Activar pensión de ${getNombreCompleto(persona)}`}
                            onClick={(evento) => {
                              evento.stopPropagation()
                              setAActivar(persona)
                            }}
                          >
                            Activar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>Total del mes</TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatearMonto(datos?.total ?? 0)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </Main>

      {detalle?.pension && datos && (
        <DetallePension
          titulo={getNombreCompleto(detalle)}
          subtitulo={parentescoDe(detalle)}
          mes={mes}
          onCambiarMes={setMes}
          datos={{ ...detalle, pension: detalle.pension }}
          cargando={false}
          actualizando={hogar.isPlaceholderData}
          error={null}
          onReintentar={() => hogar.refetch()}
          finSiCancela={datos.finSiCancela}
          minimo={datos.minimo}
          onCerrar={() => setIdDetalle(null)}
        />
      )}

      {aActivar && datos && (
        <ConfirmDialog
          open
          onOpenChange={() => setAActivar(null)}
          title='Activar pensión'
          desc={`La pensión de ${getNombreCompleto(aActivar)} empieza en ${formatearMes(datos.inicioSiActiva)}.`}
          confirmText='Activar'
          cancelBtnText='Volver'
          isLoading={activar.isPending}
          handleConfirm={() =>
            activar.mutate(
              { idPersona: aActivar.idPersona },
              {
                onSuccess: () => {
                  toast.success('Pensión activada.')
                  setAActivar(null)
                },
              }
            )
          }
        />
      )}
    </>
  )
}
