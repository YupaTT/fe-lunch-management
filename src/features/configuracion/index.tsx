import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { InputField, SubmitButton } from '@/components/form-fields'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import {
  type Configuracion as ConfiguracionData,
  useActualizarConfiguracion,
  useConfiguracion,
} from './api'

const formSchema = z.object({
  horaLimite: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingrese una hora válida (HH:MM).'),
  minimoPension: z
    .string()
    .regex(/^[1-9]\d*$/, 'Debe ser un número entero mayor que cero.'),
})

type ConfiguracionForm = z.infer<typeof formSchema>

function ConfiguracionFormCard({ data }: { data: ConfiguracionData }) {
  const actualizar = useActualizarConfiguracion()
  const form = useForm<ConfiguracionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      horaLimite: data.horaLimite,
      minimoPension: String(data.minimoPension),
    },
  })

  function onSubmit(values: ConfiguracionForm) {
    actualizar.mutate(
      {
        horaLimite: values.horaLimite,
        minimoPension: Number(values.minimoPension),
      },
      {
        onSuccess: (saved) => {
          toast.success('Configuración actualizada.')
          form.reset({
            horaLimite: saved.horaLimite,
            minimoPension: String(saved.minimoPension),
          })
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid gap-4 sm:grid-cols-2'
        noValidate
      >
        <InputField
          control={form.control}
          name='horaLimite'
          label='Hora límite'
          type='time'
          description='Hasta esta hora del día anterior se puede reservar o cancelar.'
        />
        <InputField
          control={form.control}
          name='minimoPension'
          label='Mínimo de almuerzos de la pensión'
          type='number'
          inputMode='numeric'
          min={1}
          step={1}
          description='Cantidad mínima de almuerzos por mes.'
        />
        <div className='flex gap-2 sm:col-span-2'>
          <SubmitButton
            loading={actualizar.isPending}
            disabled={!form.formState.isDirty}
          >
            Guardar cambios
          </SubmitButton>
          {form.formState.isDirty && (
            <Button
              type='button'
              variant='ghost'
              disabled={actualizar.isPending}
              onClick={() => form.reset()}
            >
              Descartar
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

export function Configuracion() {
  const { data, isPending, isError, error, refetch } = useConfiguracion()

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-6'>
        <PageHeader
          title='Configuración'
          description='Reglas de reservas y pensión. Los cambios se aplican de inmediato.'
        />
        <Card className='max-w-2xl'>
          <CardHeader>
            <CardTitle>Reservas y pensión</CardTitle>
            <CardDescription>
              Valores iniciales: 21:00 y 10 almuerzos por mes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className='grid gap-4 sm:grid-cols-2'>
                <Skeleton className='h-16' />
                <Skeleton className='h-16' />
              </div>
            ) : isError ? (
              <Alert variant='destructive'>
                <AlertDescription className='flex items-center justify-between gap-2'>
                  {getApiErrorMessage(error)}
                  <Button variant='outline' size='sm' onClick={() => refetch()}>
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <ConfiguracionFormCard data={data} />
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
