import { useNavigate } from '@tanstack/react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLogout } from '@/features/auth/api'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const logout = useLogout()

  const handleSignOut = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/sign-in', replace: true }),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Cerrar sesión'
      desc='¿Está seguro de que desea cerrar sesión? Deberá ingresar nuevamente para acceder al sistema.'
      cancelBtnText='Cancelar'
      confirmText='Cerrar sesión'
      destructive
      isLoading={logout.isPending}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
