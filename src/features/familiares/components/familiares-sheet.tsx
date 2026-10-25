import { useState } from 'react'
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { getNombreCompleto } from '@/lib/persona'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table'
import { useCambiarEstadoFamiliar, useFamiliares } from '../api'
import { type Familiar, parentescoLabels } from '../schema'
import { FamiliarFormDialog } from './familiar-form-dialog'

type FamiliaresSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  titular: { id: string; nombre: string }
}

type Accion = { tipo: 'crear' } | { tipo: 'editar' | 'estado'; row: Familiar }

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

function getColumns(onAction: (accion: Accion) => void): ColumnDef<Familiar>[] {
  return [
    {
      id: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className='font-medium'>
          {getNombreCompleto(row.original.persona)}
        </span>
      ),
    },
    {
      id: 'parentesco',
      header: 'Parentesco',
      cell: ({ row }) => parentescoLabels[row.original.parentesco],
    },
    {
      id: 'documento',
      header: 'Documento',
      cell: ({ row }) => row.original.persona.nroDocumento ?? '—',
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.estado === 'ACTIVO' ? (
          <Badge variant='outline'>Activo</Badge>
        ) : (
          <Badge variant='secondary'>De baja</Badge>
        ),
    },
    {
      id: 'acciones',
      meta: { className: 'w-24 text-end' },
      cell: ({ row }) => {
        const activo = row.original.estado === 'ACTIVO'
        return (
          <div className='flex justify-end'>
            <IconAction
              label='Editar'
              onClick={() => onAction({ tipo: 'editar', row: row.original })}
            >
              <Pencil />
            </IconAction>
            <IconAction
              label={activo ? 'Dar de baja' : 'Reactivar'}
              onClick={() => onAction({ tipo: 'estado', row: row.original })}
            >
              {activo ? <PowerOff /> : <Power />}
            </IconAction>
          </div>
        )
      },
    },
  ]
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.filas ?? [],
    columns: getColumns(setAccion),
    getCoreRowModel: getCoreRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 3 } },
  })

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
          <DataTable
            table={table}
            isLoading={isPending}
            isFetching={isFetching}
            error={isError ? getApiErrorMessage(error) : null}
            onRetry={() => refetch()}
            emptyMessage='Este empleado aún no tiene familiares registrados.'
          />
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
