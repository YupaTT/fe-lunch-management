import { useState } from 'react'
import {
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { getNombreCompleto } from '@/lib/persona'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { parentescoLabels } from '@/features/familiares/schema'
import { useMenus } from '@/features/menu/api'
import {
  type EstadoMenu,
  estadoMenuLabels,
  type MenuDia,
} from '@/features/menu/schema'
import {
  useBeneficiarios,
  useCancelarReserva,
  useCrearReserva,
  useReservas,
} from '@/features/reservas/api'
import {
  type Beneficiario,
  type EstadoReserva,
  estadoReservaLabels,
  type Reserva,
} from '@/features/reservas/schema'
import {
  desplazarMes,
  diasDelMes,
  formatearFecha,
  hoyBolivia,
  mesDe,
  rangoDelMes,
} from './fechas'
import { KpiCard } from './kpi'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const estadoMenuStyles: Record<EstadoMenu, string> = {
  DISPONIBLE: 'border-teal-200 bg-teal-100/40 text-teal-900 dark:text-teal-200',
  SIN_SERVICIO: 'border-neutral-300 bg-neutral-300/40',
  PENDIENTE: 'border-sky-300 bg-sky-200/40 text-sky-900 dark:text-sky-100',
  FUERA_DE_ATENCION: 'bg-muted/50 text-muted-foreground',
}

export function CalendarioEmpleado() {
  const [mes, setMes] = useState(() => mesDe(hoyBolivia()))
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(
    null
  )
  const { desde, hasta } = rangoDelMes(mes)
  const menus = useMenus(desde, hasta)
  const reservas = useReservas(desde, hasta)
  const beneficiarios = useBeneficiarios()

  const menuPorFecha = new Map(
    (menus.data ?? []).map((menu) => [menu.fecha.slice(0, 10), menu])
  )
  const reservasPorFecha = agruparPorFecha(reservas.data ?? [])
  const hoy = hoyBolivia()
  const error = menus.error ?? reservas.error ?? beneficiarios.error
  const conteo = (estado: EstadoReserva) =>
    reservas.data?.filter((reserva) => reserva.estado === estado).length

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-3 gap-3 sm:gap-4'>
        <KpiCard
          titulo='Reservados este mes'
          icon={CalendarCheck}
          valor={conteo('RESERVADO')}
          cargando={reservas.isLoading}
        />
        <KpiCard
          titulo='Asistencias'
          icon={CircleCheck}
          valor={conteo('ASISTIO')}
          cargando={reservas.isLoading}
        />
        <KpiCard
          titulo='Canceladas'
          icon={CalendarX}
          valor={conteo('CANCELADO')}
          cargando={reservas.isLoading}
        />
      </div>
      <Card>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between gap-2'>
            <Button
              variant='outline'
              size='icon'
              aria-label='Mes anterior'
              onClick={() => setMes(desplazarMes(mes, -1))}
            >
              <ChevronLeft />
            </Button>
            <h2 className='text-lg font-semibold first-letter:uppercase'>
              {formatearFecha(`${mes}-01`, { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant='outline'
              size='icon'
              aria-label='Mes siguiente'
              onClick={() => setMes(desplazarMes(mes, 1))}
            >
              <ChevronRight />
            </Button>
          </div>

          {error && (
            <p className='text-sm text-destructive'>
              {getApiErrorMessage(error, 'No se pudo cargar el calendario.')}
            </p>
          )}

          <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground'>
            {DIAS_SEMANA.map((dia) => (
              <div key={dia}>{dia}</div>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-1'>
            {diasDelMes(mes).map((fecha, indice) =>
              fecha === null ? (
                <div key={`vacio-${indice}`} />
              ) : (
                <DiaCelda
                  key={fecha}
                  fecha={fecha}
                  menu={menuPorFecha.get(fecha)}
                  reservas={reservasPorFecha.get(fecha) ?? []}
                  esHoy={fecha === hoy}
                  onSeleccionar={() => setFechaSeleccionada(fecha)}
                />
              )
            )}
          </div>
        </CardContent>

        <DetalleDia
          fecha={fechaSeleccionada}
          menu={
            fechaSeleccionada ? menuPorFecha.get(fechaSeleccionada) : undefined
          }
          reservas={
            fechaSeleccionada
              ? (reservasPorFecha.get(fechaSeleccionada) ?? [])
              : []
          }
          beneficiarios={beneficiarios.data ?? []}
          cargandoBeneficiarios={beneficiarios.isPending}
          onCerrar={() => setFechaSeleccionada(null)}
        />
      </Card>
    </div>
  )
}

function agruparPorFecha(reservas: Reserva[]) {
  const porFecha = new Map<string, Reserva[]>()
  reservas.forEach((reserva) => {
    const fecha = reserva.fecha.slice(0, 10)
    porFecha.set(fecha, [...(porFecha.get(fecha) ?? []), reserva])
  })
  return porFecha
}

// Reserva vigente de una persona en el día: las canceladas no cuentan
function reservaVigente(reservas: Reserva[], idPersona: string) {
  return reservas.find(
    (reserva) =>
      reserva.idPersona === idPersona && reserva.estado === 'RESERVADO'
  )
}

// Resume las reservas del día: con una persona muestra su estado; con varias, la cantidad
function resumenDia(reservas: Reserva[]) {
  const activas = reservas.filter((reserva) => reserva.estado !== 'CANCELADO')
  if (activas.length === 0) {
    return reservas.length
      ? { texto: estadoReservaLabels.CANCELADO, estado: 'CANCELADO' as const }
      : undefined
  }
  if (activas.length === 1) {
    return {
      texto: estadoReservaLabels[activas[0].estado],
      estado: activas[0].estado,
    }
  }
  return { texto: `${activas.length} reservas`, estado: 'RESERVADO' as const }
}

type DiaCeldaProps = {
  fecha: string
  menu?: MenuDia
  reservas: Reserva[]
  esHoy: boolean
  onSeleccionar: () => void
}

function DiaCelda({
  fecha,
  menu,
  reservas,
  esHoy,
  onSeleccionar,
}: DiaCeldaProps) {
  const resumen = resumenDia(reservas)

  return (
    <button
      type='button'
      onClick={onSeleccionar}
      aria-label={`${formatearFecha(fecha, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })}${resumen ? `, ${resumen.texto}` : ''}`}
      className={cn(
        'flex min-h-14 flex-col items-start gap-1 rounded-md border p-1.5 text-start text-sm transition hover:ring-2 hover:ring-ring sm:min-h-20',
        menu ? estadoMenuStyles[menu.estado] : 'bg-muted/30',
        esHoy && 'ring-2 ring-primary'
      )}
    >
      <span className='font-semibold'>{Number(fecha.slice(8))}</span>
      {menu && (
        <span className='hidden text-xs sm:block'>
          {estadoMenuLabels[menu.estado]}
        </span>
      )}
      {resumen && (
        <>
          {/* En móvil no cabe el texto: el punto indica la reserva y el aria-label dice el estado */}
          <span
            className={cn(
              'mt-auto size-1.5 rounded-full sm:hidden',
              resumen.estado === 'RESERVADO'
                ? 'bg-primary'
                : 'bg-muted-foreground'
            )}
          />
          <span className='mt-auto hidden rounded bg-background/80 px-1 text-xs font-medium sm:block'>
            {resumen.texto}
          </span>
        </>
      )}
    </button>
  )
}

type DetalleDiaProps = {
  fecha: string | null
  menu?: MenuDia
  reservas: Reserva[]
  beneficiarios: Beneficiario[]
  cargandoBeneficiarios: boolean
  onCerrar: () => void
}

function DetalleDia({
  fecha,
  menu,
  reservas,
  beneficiarios,
  cargandoBeneficiarios,
  onCerrar,
}: DetalleDiaProps) {
  const crearReserva = useCrearReserva()
  const cancelarReserva = useCancelarReserva()
  const puedeCambiar = menu?.estado === 'DISPONIBLE' && menu.reservable === true

  function reservar(idPersona: string) {
    if (!fecha) return
    crearReserva.mutate(
      { fecha, idPersona },
      {
        onSuccess: () => toast.success('Reserva registrada.'),
      }
    )
  }

  function cancelar(id: string) {
    cancelarReserva.mutate(id, {
      onSuccess: () => toast.success('Reserva cancelada.'),
    })
  }

  return (
    <Dialog
      open={fecha !== null}
      onOpenChange={(abierto) => !abierto && onCerrar()}
    >
      <DialogContent>
        {fecha && (
          <>
            <DialogHeader>
              <DialogTitle className='first-letter:uppercase'>
                {formatearFecha(fecha, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </DialogTitle>
              <DialogDescription>{descripcionMenu(menu)}</DialogDescription>
            </DialogHeader>

            {cargandoBeneficiarios ? (
              <p className='text-sm text-muted-foreground'>
                Cargando personas...
              </p>
            ) : (
              <ul className='overflow-hidden rounded-md border'>
                {beneficiarios.map((beneficiario) => {
                  const activa = reservaVigente(
                    reservas,
                    beneficiario.idPersona
                  )
                  const ultima = reservas.find(
                    (reserva) => reserva.idPersona === beneficiario.idPersona
                  )
                  const reservando =
                    crearReserva.isPending &&
                    crearReserva.variables?.idPersona === beneficiario.idPersona
                  const cancelando =
                    cancelarReserva.isPending &&
                    cancelarReserva.variables === activa?.id

                  return (
                    <li
                      key={beneficiario.idPersona}
                      className='flex items-center justify-between gap-3 border-b border-dashed p-3 last:border-b-0'
                    >
                      <div className='min-w-0'>
                        <p className='font-medium'>
                          {getNombreCompleto(beneficiario)}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {beneficiario.parentesco
                            ? parentescoLabels[beneficiario.parentesco]
                            : 'Titular'}
                          {' · '}
                          {ultima
                            ? estadoReservaLabels[ultima.estado]
                            : 'Sin reserva'}
                        </p>
                      </div>
                      {puedeCambiar && activa && (
                        <Button
                          variant='destructive'
                          size='sm'
                          disabled={cancelando}
                          onClick={() => cancelar(activa.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                      {puedeCambiar && !activa && (
                        <Button
                          size='sm'
                          disabled={reservando}
                          onClick={() => reservar(beneficiario.idPersona)}
                        >
                          Reservar
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function descripcionMenu(menu?: MenuDia) {
  if (!menu) return 'No hay información de menú para este día.'
  if (menu.estado === 'DISPONIBLE') {
    const descripcion = menu.descripcion ?? 'Servicio disponible.'
    return menu.reservable === false
      ? `${descripcion} Ya no se puede reservar ni cancelar este día.`
      : descripcion
  }
  if (menu.estado === 'SIN_SERVICIO') {
    return menu.detalleMotivo ?? 'Sin servicio ese día.'
  }
  if (menu.estado === 'PENDIENTE') return 'El menú todavía no está publicado.'
  return 'Día fuera de atención.'
}
