import { useState } from 'react'
import { toast } from 'sonner'
import { getNombreCompleto } from '@/lib/persona'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { FamiliaresSheet } from '@/features/familiares/components/familiares-sheet'
import { useCambiarEstadoUsuario, useRestaurarContrasena } from '../api'
import { TemporaryPasswordDialog } from './temporary-password-dialog'
import { UsersMutateDialog } from './users-mutate-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  const [temporal, setTemporal] = useState<{
    nombre: string
    contrasena: string
  } | null>(null)
  const cambiarEstado = useCambiarEstadoUsuario()
  const restaurar = useRestaurarContrasena()

  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 300)
  }

  const nombre = currentRow ? getNombreCompleto(currentRow.persona) : ''
  const isInactive = currentRow?.estado === 'INACTIVO'

  return (
    <>
      {open === 'create' && (
        <UsersMutateDialog
          open
          onOpenChange={() => setOpen(null)}
          onCreated={(nombre, contrasena) =>
            setTemporal({ nombre, contrasena })
          }
        />
      )}

      <TemporaryPasswordDialog
        data={temporal}
        onClose={() => setTemporal(null)}
      />

      {currentRow && (
        <>
          <UsersMutateDialog
            key={`usuario-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={close}
            currentRow={currentRow}
          />

          <FamiliaresSheet
            key={`familiares-${currentRow.id}`}
            open={open === 'familiares'}
            onOpenChange={close}
            titular={{ id: currentRow.id, nombre }}
          />

          <ConfirmDialog
            open={open === 'toggle-status'}
            onOpenChange={close}
            title={isInactive ? 'Activar cuenta' : 'Desactivar cuenta'}
            desc={
              isInactive
                ? `${nombre} podrá volver a ingresar al sistema. Los almuerzos cancelados por la desactivación no se restauran.`
                : `${nombre} no podrá ingresar. Se cancelarán sin cobro sus reservas futuras y los días restantes de su pensión y la de sus familiares. Su historial se conserva.`
            }
            confirmText={isInactive ? 'Activar' : 'Desactivar'}
            cancelBtnText='Cancelar'
            destructive={!isInactive}
            isLoading={cambiarEstado.isPending}
            handleConfirm={() =>
              cambiarEstado.mutate(
                { id: currentRow.id, activar: isInactive },
                {
                  onSuccess: () => {
                    toast.success(
                      isInactive ? 'Cuenta activada.' : 'Cuenta desactivada.'
                    )
                    close()
                  },
                }
              )
            }
            className='sm:max-w-md'
          />

          <ConfirmDialog
            open={open === 'restore-password'}
            onOpenChange={close}
            title='Restablecer contraseña'
            desc={`Se generará una contraseña temporal para ${nombre}, la anterior dejará de ser válida y se cerrarán sus sesiones abiertas.`}
            confirmText='Restablecer'
            cancelBtnText='Cancelar'
            isLoading={restaurar.isPending}
            handleConfirm={() =>
              restaurar.mutate(currentRow.id, {
                onSuccess: ({ contrasenaTemporal }) => {
                  close()
                  setTemporal({ nombre, contrasena: contrasenaTemporal })
                },
              })
            }
            className='sm:max-w-md'
          />
        </>
      )}
    </>
  )
}
