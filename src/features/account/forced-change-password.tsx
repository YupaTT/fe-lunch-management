import { useNavigate } from '@tanstack/react-router'
import { UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useLogout } from '@/features/auth/api'
import { PasswordChangeForm } from './change-password'

// Pantalla fuera del sistema: sin menú ni navegación hasta cambiar la contraseña temporal
export function ForcedChangePassword() {
  const navigate = useNavigate()
  const logout = useLogout()

  function cerrarSesion() {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/sign-in', replace: true }),
    })
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-md flex-col gap-6'>
        <div className='flex items-center gap-2 self-center font-medium'>
          <div className='flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
            <UtensilsCrossed className='size-4' />
          </div>
          Gestión de Almuerzos
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>
              Debe cambiar su contraseña
            </CardTitle>
            <CardDescription>
              Ingresó con una contraseña temporal. Defina una nueva contraseña
              para continuar usando el sistema. Use al menos 8 caracteres, con
              letras y números.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <PasswordChangeForm
              temporal
              onSuccess={() => navigate({ to: '/', replace: true })}
            />
            <Button
              variant='ghost'
              className='justify-self-center'
              disabled={logout.isPending}
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
