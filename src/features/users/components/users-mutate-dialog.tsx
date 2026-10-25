import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  emptyPersona,
  getNombreCompleto,
  personaSchema,
  toPersonaFormValues,
  toPersonaPayload,
} from '@/lib/persona'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { FormDialog } from '@/components/form-dialog'
import { InputField, SelectField } from '@/components/form-fields'
import { PersonaFields } from '@/components/persona-fields'
import { Rol } from '@/features/auth/roles'
import { useActualizarUsuario, useCrearUsuario, useRoles } from '../api'
import { type Usuario } from '../data/schema'

const formSchema = z.object({
  correoElectronico: z
    .string()
    .trim()
    .min(1, 'Ingrese el correo institucional.')
    .pipe(z.email('Ingrese un correo electrónico válido.')),
  rol: z.string().min(1, 'Seleccione el rol.'),
  persona: personaSchema({ documentoRequerido: true, generoRequerido: true }),
})

type UsuarioForm = z.infer<typeof formSchema>

const ROLES_EMPLEADO: string[] = [Rol.EMPLEADO, Rol.ENCARGADO]

type UsersMutateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Usuario
  onCreated?: (nombre: string, contrasenaTemporal: string) => void
}

export function UsersMutateDialog({
  open,
  onOpenChange,
  currentRow,
  onCreated,
}: UsersMutateDialogProps) {
  const isUpdate = !!currentRow
  const roles = useRoles()
  const crear = useCrearUsuario()
  const actualizar = useActualizarUsuario()

  const rolOptions = (roles.data ?? [])
    .filter((r) => ROLES_EMPLEADO.includes(r.rol))
    .map((r) => ({ label: r.nombre, value: r.id }))
  const rolEmpleado = roles.data?.find((r) => r.rol === Rol.EMPLEADO)?.id ?? ''

  const form = useForm<UsuarioForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          correoElectronico: currentRow.correoElectronico,
          rol: currentRow.usuarioRol[0]?.rol.id ?? '',
          persona: toPersonaFormValues(currentRow.persona),
        }
      : { correoElectronico: '', rol: rolEmpleado, persona: emptyPersona },
  })

  function onSubmit(values: UsuarioForm) {
    const payload = {
      correoElectronico: values.correoElectronico,
      roles: [values.rol],
      persona: toPersonaPayload(values.persona),
    }

    if (currentRow) {
      actualizar.mutate(
        { id: currentRow.id, payload },
        {
          onSuccess: () => {
            toast.success('Empleado actualizado.')
            onOpenChange(false)
          },
        }
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: ({ contrasenaTemporal }) => {
        onOpenChange(false)
        onCreated?.(getNombreCompleto(values.persona), contrasenaTemporal)
      },
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isUpdate ? 'Editar empleado' : 'Registrar empleado'}
      description={
        isUpdate
          ? 'El nuevo rol se aplica desde el siguiente ingreso del empleado.'
          : 'Se generará una contraseña temporal para el primer ingreso.'
      }
      formId='usuario-form'
      isLoading={crear.isPending || actualizar.isPending}
      className='sm:max-w-2xl'
    >
      <Form {...form}>
        <form
          id='usuario-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='-mx-1 grid max-h-[65svh] gap-4 overflow-y-auto px-1 py-1'
          noValidate
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <InputField
              control={form.control}
              name='correoElectronico'
              label='Correo institucional'
              type='email'
              placeholder='nombre@institucion.com'
            />
            <SelectField
              control={form.control}
              name='rol'
              label='Rol'
              options={rolOptions}
              isLoading={roles.isPending}
            />
          </div>
          <Separator />
          <PersonaFields control={form.control} generoRequerido />
        </form>
      </Form>
    </FormDialog>
  )
}
