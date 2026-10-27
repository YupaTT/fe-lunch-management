import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { getUserDisplayName } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldDescription } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import {
  InputField,
  PasswordField,
  SubmitButton,
} from '@/components/form-fields'
import { useLogin } from '../../api'

const formSchema = z.object({
  correoElectronico: z
    .string()
    .trim()
    .min(1, 'Ingrese su correo electrónico.')
    .pipe(z.email('Ingrese un correo electrónico válido.')),
  contrasena: z.string().min(1, 'Ingrese su contraseña.'),
})

interface UserAuthFormProps extends React.ComponentProps<'div'> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const login = useLogin()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correoElectronico: '',
      contrasena: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    login.mutate(data, {
      onSuccess: (user) => {
        toast.success(`Bienvenido, ${getUserDisplayName(user)}`)
        navigate({
          to: user.requiereCambioContrasena
            ? '/cambiar-contrasena'
            : redirectTo || '/',
          replace: true,
        })
      },
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Bienvenido</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='grid gap-6'
              noValidate
            >
              {login.isError && (
                <Alert variant='destructive'>
                  <AlertDescription>
                    {getApiErrorMessage(login.error)}
                  </AlertDescription>
                </Alert>
              )}
              <InputField
                control={form.control}
                name='correoElectronico'
                label='Correo electrónico'
                type='email'
                placeholder='nombre@institucion.com'
                autoComplete='email'
                autoFocus
              />
              <PasswordField
                control={form.control}
                name='contrasena'
                label='Contraseña'
                autoComplete='current-password'
              />
              <SubmitButton loading={login.isPending}>
                Iniciar sesión
              </SubmitButton>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className='px-6 text-center'>
        Si no tiene acceso, contacte al administrador del sistema.
      </FieldDescription>
    </div>
  )
}
