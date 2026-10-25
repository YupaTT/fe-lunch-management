import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            ¿Olvidó su contraseña?
          </CardTitle>
          <CardDescription>
            Solicite al Administrador del sistema que restablezca su contraseña.
            Le entregará una contraseña temporal que deberá cambiar al ingresar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant='outline' className='w-full'>
            <Link to='/sign-in'>
              <ArrowLeft />
              Volver a iniciar sesión
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
