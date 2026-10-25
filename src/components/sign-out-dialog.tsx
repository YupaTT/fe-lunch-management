import { useNavigate, useLocation } from '@tanstack/react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLogout } from '@/features/auth/api'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useLogout()

  const handleSignOut = () => {
    const currentPath = location.href
    logout.mutate(undefined, {
      onSettled: () =>
        navigate({
          to: '/sign-in',
          search: { redirect: currentPath },
          replace: true,
        }),
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
