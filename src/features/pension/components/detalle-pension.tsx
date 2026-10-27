import { useState } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { formatearMonto } from '@/lib/moneda'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { formatearFecha } from '@/features/dashboard/fechas'
import { useCancelarReserva } from '@/features/reservas/api'
import { useCancelarPension } from '../api'
import { formatearMes, vigencia } from '../format'
import { type DiaPension, type Pension, type ResumenMes } from '../schema'
import { DiasPension } from './dias-pension'
import { EstadoPension } from './estado-pension'
import { SelectorMes } from './selector-mes'

type DetallePensionProps = {
  titulo: string
  subtitulo: string
  mes: string
  onCambiarMes: (mes: string) => void
  datos?: ResumenMes & { pension: Pension }
  cargando: boolean
  // Datos del mes anterior mientras llega el elegido
  actualizando?: boolean
  error: Error | null
  onReintentar: () => void
  // Último mes cubierto si se cancela ahora; sin él no se ofrece cancelar
  finSiCancela?: string
  // Solo el empleado lo recibe, para explicar por qué no puede cancelar más días
  minimo?: number
  onCerrar: () => void
}

function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className='text-muted-foreground'>{etiqueta}</p>
      <div className='font-medium'>{children}</div>
    </div>
  )
}

export function DetallePension({
  titulo,
  subtitulo,
  mes,
  onCambiarMes,
  datos,
  cargando,
  actualizando,
  error,
  onReintentar,
  finSiCancela,
  minimo,
  onCerrar,
}: DetallePensionProps) {
  const cancelarPension = useCancelarPension()
  const cancelarDia = useCancelarReserva()
  const [confirmarPension, setConfirmarPension] = useState(false)
  const [diaACancelar, setDiaACancelar] = useState<DiaPension | null>(null)

  const pension = datos?.pension
  const puedeCancelar = pension?.mesFin === null && finSiCancela !== undefined

  return (
    <Sheet open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <SheetContent className='w-full sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{titulo}</SheetTitle>
          <SheetDescription>{subtitulo}</SheetDescription>
        </SheetHeader>

        <div
          className={cn(
            'flex flex-col gap-4 overflow-y-auto px-4 pb-4 transition-opacity',
            actualizando && 'opacity-60'
          )}
        >
          {cargando ? (
            <Skeleton className='h-64 w-full' />
          ) : error || !datos || !pension ? (
            <div className='flex flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center'>
              <p className='text-destructive'>
                {getApiErrorMessage(error, 'No se pudo cargar la pensión.')}
              </p>
              <Button variant='outline' size='sm' onClick={onReintentar}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm'>
                <Dato etiqueta='Estado'>
                  <EstadoPension estado={pension.estado} />
                </Dato>
                <Dato etiqueta='Vigencia'>{vigencia(pension)}</Dato>
                <Dato etiqueta='Almuerzos del mes'>{datos.comprometidos}</Dato>
                <Dato etiqueta='Monto del mes'>
                  {formatearMonto(datos.monto)}
                </Dato>
              </div>

              {puedeCancelar && (
                <Button
                  variant='outline'
                  className='self-start text-destructive hover:text-destructive'
                  onClick={() => setConfirmarPension(true)}
                >
                  Cancelar pensión
                </Button>
              )}

              <div className='flex items-center justify-between gap-2'>
                <h3 className='font-medium'>Días del mes</h3>
                <SelectorMes mes={mes} onCambiar={onCambiarMes} />
              </div>
              {minimo !== undefined &&
                datos.cancelables === 0 &&
                datos.dias.some((dia) => dia.estado === 'RESERVADO') && (
                  <p className='text-sm text-muted-foreground'>
                    Debe conservar al menos {minimo} almuerzos en el mes.
                  </p>
                )}
              <DiasPension
                dias={datos.dias}
                onCancelar={setDiaACancelar}
                cancelando={cancelarDia.isPending || actualizando}
              />
            </>
          )}
        </div>
      </SheetContent>

      {pension && finSiCancela && (
        <ConfirmDialog
          open={confirmarPension}
          onOpenChange={setConfirmarPension}
          title='Cancelar pensión'
          desc={
            finSiCancela < pension.mesInicio
              ? 'La pensión no llegará a empezar.'
              : `Cubre hasta ${formatearMes(finSiCancela)}.`
          }
          confirmText='Cancelar pensión'
          cancelBtnText='Volver'
          destructive
          isLoading={cancelarPension.isPending}
          handleConfirm={() =>
            cancelarPension.mutate(pension.id, {
              onSuccess: () => {
                toast.success('Pensión cancelada.')
                setConfirmarPension(false)
              },
            })
          }
        />
      )}

      {diaACancelar && (
        <ConfirmDialog
          open
          onOpenChange={() => setDiaACancelar(null)}
          title='Cancelar almuerzo'
          desc={`Se cancelará el almuerzo del ${formatearFecha(diaACancelar.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}.`}
          confirmText='Cancelar almuerzo'
          cancelBtnText='Volver'
          destructive
          isLoading={cancelarDia.isPending}
          handleConfirm={() =>
            cancelarDia.mutate(diaACancelar.id, {
              onSuccess: () => {
                toast.success('Almuerzo cancelado.')
                setDiaACancelar(null)
              },
            })
          }
        />
      )}
    </Sheet>
  )
}
