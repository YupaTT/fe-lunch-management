import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  emptyPersona,
  personaSchema,
  toPersonaFormValues,
  toPersonaPayload,
} from '@/lib/persona'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { FormDialog } from '@/components/form-dialog'
import { SelectField } from '@/components/form-fields'
import { PersonaFields } from '@/components/persona-fields'
import { useActualizarFamiliar, useCrearFamiliar } from '../api'
import { type Familiar, parentescoOptions } from '../schema'

const formSchema = z.object({
  parentesco: z.string().min(1, 'Seleccione el parentesco.'),
  persona: personaSchema({ documentoRequerido: false, generoRequerido: false }),
})

type FamiliarForm = z.infer<typeof formSchema>

type FamiliarFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  idUsuarioTitular: string
  currentRow?: Familiar
}

export function FamiliarFormDialog({
  open,
  onOpenChange,
  idUsuarioTitular,
  currentRow,
}: FamiliarFormDialogProps) {
  const crear = useCrearFamiliar()
  const actualizar = useActualizarFamiliar()

  const form = useForm<FamiliarForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          parentesco: currentRow.parentesco,
          persona: toPersonaFormValues(currentRow.persona),
        }
      : { parentesco: '', persona: emptyPersona },
  })

  function onSubmit(values: FamiliarForm) {
    const payload = {
      parentesco: values.parentesco,
      persona: toPersonaPayload(values.persona),
    }
    const onSuccess = () => {
      toast.success(
        currentRow ? 'Familiar actualizado.' : 'Familiar registrado.'
      )
      onOpenChange(false)
    }

    if (currentRow) {
      actualizar.mutate({ id: currentRow.id, payload }, { onSuccess })
    } else {
      crear.mutate({ ...payload, idUsuarioTitular }, { onSuccess })
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={currentRow ? 'Editar familiar' : 'Registrar familiar'}
      description='Solo familiares de primer grado. El CI es opcional.'
      formId='familiar-form'
      isLoading={crear.isPending || actualizar.isPending}
      className='sm:max-w-2xl'
    >
      <Form {...form}>
        <form
          id='familiar-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='-mx-1 grid max-h-[65svh] gap-4 overflow-y-auto px-1 py-1'
          noValidate
        >
          <SelectField
            control={form.control}
            name='parentesco'
            label='Parentesco'
            options={parentescoOptions}
            className='sm:max-w-xs'
          />
          <Separator />
          <PersonaFields control={form.control} />
        </form>
      </Form>
    </FormDialog>
  )
}
