import { useState } from 'react'
import { Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { getNombreCompleto } from '@/lib/persona'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCambiarEstadoFamiliar, useFamiliares } from '../api'
import { type Familiar, type FamiliarEstado, parentescoLabels } from '../schema'
import { FamiliarFormDialog } from './familiar-form-dialog'

type FamiliaresSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  titular: { id: string; nombre: string }
}

type Accion = { tipo: 'crear' } | { tipo: 'editar' | 'estado'; row: Familiar }

const estadoStyles: Record<FamiliarEstado, string> = {
  ACTIVO: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  INACTIVO: 'bg-rose-100/40 text-rose-900 dark:text-rose-200 border-rose-200',
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8'
          onClick={onClick}
        >
          {children}
          <span className='sr-only'>{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function FamiliaresSheet({
  open,
  onOpenChange,
  titular,
}: FamiliaresSheetProps) {
  const [accion, setAccion] = useState<Accion | null>(null)
  const { data, isPending, isError, error, isFetching, refetch } =
    useFamiliares(titular.id)
  const cambiarEstado = useCambiarEstadoFamiliar()

  const filas = data?.filas ?? []
  const seleccionado = accion && accion.tipo !== 'crear' ? accion.row : null
  const activo = seleccionado?.estado === 'ACTIVO'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-2xl'>
        <SheetHeader className='text-start'>
          <SheetTitle>Familiares</SheetTitle>
          <SheetDescription>
            Familiares de primer grado de <strong>{titular.nombre}</strong>.
          </SheetDescription>
        </SheetHeader>
        <div className='flex flex-col gap-4 overflow-y-auto px-4 pb-4'>
          <Button
            className='self-end'
            onClick={() => setAccion({ tipo: 'crear' })}
          >
            <Plus />
            Registrar familiar
          </Button>

          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))
          ) : isError ? (
            <div className='flex flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center'>
              <p className='text-destructive'>{getApiErrorMessage(error)}</p>
              <Button variant='outline' size='sm' onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : filas.length ? (
            <ul
              className={cn(
                'overflow-hidden rounded-md border transition-opacity',
                isFetching && 'opacity-60'
              )}
            >
              {filas.map((f) => {
                const estaActivo = f.estado === 'ACTIVO'
                return (
                  <li
                    key={f.id}
                    className='flex items-center justify-between gap-2 border-b border-dashed p-3 last:border-b-0'
                  >
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='font-medium'>
                          {getNombreCompleto(f.persona)}
                        </span>
                        <Badge
                          variant='outline'
                          className={estadoStyles[f.estado]}
                        >
                          {estaActivo ? 'Activo' : 'De baja'}
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {parentescoLabels[f.parentesco]} ·{' '}
                        {f.persona.nroDocumento ?? 'Sin documento'}
                      </p>
                    </div>
                    <div className='flex shrink-0'>
                      <IconAction
                        label='Editar'
                        onClick={() => setAccion({ tipo: 'editar', row: f })}
                      >
                        <Pencil />
                      </IconAction>
                      <IconAction
                        label={estaActivo ? 'Dar de baja' : 'Reactivar'}
                        onClick={() => setAccion({ tipo: 'estado', row: f })}
                      >
                        {estaActivo ? (
                          <PowerOff className='text-rose-700 dark:text-rose-400' />
                        ) : (
                          <Power className='text-teal-700 dark:text-teal-300' />
                        )}
                      </IconAction>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
              Este empleado aún no tiene familiares registrados.
            </p>
          )}
        </div>
      </SheetContent>

      {accion?.tipo === 'crear' && (
        <FamiliarFormDialog
          open
          onOpenChange={() => setAccion(null)}
          idUsuarioTitular={titular.id}
        />
      )}
      {accion?.tipo === 'editar' && (
        <FamiliarFormDialog
          key={accion.row.id}
          open
          onOpenChange={() => setAccion(null)}
          idUsuarioTitular={titular.id}
          currentRow={accion.row}
        />
      )}
      {accion?.tipo === 'estado' && seleccionado && (
        <ConfirmDialog
          open
          onOpenChange={() => setAccion(null)}
          title={activo ? 'Dar de baja al familiar' : 'Reactivar familiar'}
          desc={
            activo
              ? `Se cancelarán sin cobro las reservas futuras y los días restantes de pensión de ${getNombreCompleto(seleccionado.persona)}. Su historial se conserva.`
              : `${getNombreCompleto(seleccionado.persona)} podrá volver a recibir reservas.`
          }
          confirmText={activo ? 'Dar de baja' : 'Reactivar'}
          cancelBtnText='Cancelar'
          destructive={activo}
          isLoading={cambiarEstado.isPending}
          handleConfirm={() =>
            cambiarEstado.mutate(
              { id: seleccionado.id, activar: !activo },
              {
                onSuccess: () => {
                  toast.success(
                    activo ? 'Familiar dado de baja.' : 'Familiar reactivado.'
                  )
                  setAccion(null)
                },
              }
            )
          }
          className='sm:max-w-md'
        />
      )}
    </Sheet>
  )
}
