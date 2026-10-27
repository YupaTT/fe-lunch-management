import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { PasswordField, SubmitButton } from '@/components/form-fields'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { useChangePassword } from '@/features/auth/api'

// Misma política que el backend (RNF07)
const passwordPolicy = z
  .string()
  .min(8, 'Debe tener al menos 8 caracteres.')
  .regex(/[a-zA-Z]/, 'Debe incluir al menos una letra.')
  .regex(/\d/, 'Debe incluir al menos un número.')

const formSchema = z
  .object({
    contrasenaActual: z.string().min(1, 'Ingrese su contraseña actual.'),
    contrasenaNueva: passwordPolicy,
    confirmacion: z.string().min(1, 'Confirme la nueva contraseña.'),
  })
  .refine((data) => data.contrasenaNueva === data.confirmacion, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmacion'],
  })
  .refine((data) => data.contrasenaNueva !== data.contrasenaActual, {
    message: 'La nueva contraseña debe ser distinta a la actual.',
    path: ['contrasenaNueva'],
  })

type ChangePasswordValues = z.infer<typeof formSchema>

type PasswordChangeFormProps = {
  // Con contraseña temporal el primer campo se llama "Contraseña temporal"
  temporal?: boolean
  onSuccess?: () => void
}

export function PasswordChangeForm({
  temporal = false,
  onSuccess,
}: PasswordChangeFormProps) {
  const changePassword = useChangePassword()

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contrasenaActual: '',
      contrasenaNueva: '',
      confirmacion: '',
    },
  })

  function onSubmit({
    contrasenaActual,
    contrasenaNueva,
  }: ChangePasswordValues) {
    changePassword.mutate(
      { contrasenaActual, contrasenaNueva },
      {
        onSuccess: () => {
          toast.success('Contraseña actualizada.')
          form.reset()
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid gap-4'
        noValidate
      >
        <PasswordField
          control={form.control}
          name='contrasenaActual'
          label={temporal ? 'Contraseña temporal' : 'Contraseña actual'}
          autoComplete='current-password'
        />
        <PasswordField
          control={form.control}
          name='contrasenaNueva'
          label='Nueva contraseña'
          autoComplete='new-password'
        />
        <PasswordField
          control={form.control}
          name='confirmacion'
          label='Confirmar nueva contraseña'
          autoComplete='new-password'
        />
        <SubmitButton
          className='justify-self-start'
          loading={changePassword.isPending}
        >
          Guardar contraseña
        </SubmitButton>
      </form>
    </Form>
  )
}

export function ChangePassword() {
  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-6'>
        <PageHeader
          title='Cambiar contraseña'
          description='Use al menos 8 caracteres, con letras y números.'
        />
        <Card className='max-w-xl'>
          <CardHeader>
            <CardTitle>Nueva contraseña</CardTitle>
            <CardDescription>
              Primero confirme su contraseña actual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
