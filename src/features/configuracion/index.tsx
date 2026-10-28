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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputField, SubmitButton, TimeField } from '@/components/form-fields'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import {
  type Configuracion as ConfiguracionData,
  useActualizarConfiguracion,
  useConfiguracion,
} from './api'

const precio = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Ingrese un monto válido (hasta 2 decimales).')
  .refine((valor) => Number(valor) > 0, 'Debe ser mayor que cero.')

const formSchema = z.object({
  horaLimite: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingrese una hora válida (HH:MM).'),
  minimoPension: z
    .string()
    .regex(/^[1-9]\d*$/, 'Debe ser un número entero mayor que cero.'),
  precioPorDia: precio,
  precioPension: precio,
})

function aFormulario(data: ConfiguracionData): ConfiguracionForm {
  return {
    horaLimite: data.horaLimite,
    minimoPension: String(data.minimoPension),
    precioPorDia: String(data.precioPorDia),
    precioPension: String(data.precioPension),
  }
}

type ConfiguracionForm = z.infer<typeof formSchema>

function ConfiguracionFormCard({ data }: { data: ConfiguracionData }) {
  const actualizar = useActualizarConfiguracion()
  const form = useForm<ConfiguracionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: aFormulario(data),
  })

  function onSubmit(values: ConfiguracionForm) {
    actualizar.mutate(
      {
        horaLimite: values.horaLimite,
        minimoPension: Number(values.minimoPension),
        precioPorDia: Number(values.precioPorDia),
        precioPension: Number(values.precioPension),
      },
      {
        onSuccess: (saved) => {
          toast.success('Configuración actualizada.')
          form.reset(aFormulario(saved))
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4'
        noValidate
      >
        <Tabs defaultValue='reservas' className='gap-4'>
          <TabsList>
            <TabsTrigger value='reservas'>Reservas</TabsTrigger>
            <TabsTrigger value='pension'>Pensión</TabsTrigger>
          </TabsList>

          {/* Se montan siempre para que la validación encuentre ambos campos. */}
          <TabsContent
            value='reservas'
            forceMount
            className='grid gap-4 data-[state=inactive]:hidden sm:grid-cols-2'
          >
            <TimeField
              control={form.control}
              name='horaLimite'
              label='Hora límite'
              description='Hasta esta hora del día anterior se puede reservar o cancelar.'
            />
            <InputField
              control={form.control}
              name='precioPorDia'
              label='Precio por día (Bs)'
              type='number'
              inputMode='decimal'
              min={0.01}
              step={0.01}
              description='Precio del almuerzo reservado por día.'
            />
          </TabsContent>
          <TabsContent
            value='pension'
            forceMount
            className='grid gap-4 data-[state=inactive]:hidden sm:grid-cols-2'
          >
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
            <InputField
              control={form.control}
              name='precioPension'
              label='Precio de pensión (Bs)'
              type='number'
              inputMode='decimal'
              min={0.01}
              step={0.01}
              description='Precio de cada almuerzo bajo pensión.'
            />
          </TabsContent>
        </Tabs>

        <div className='flex gap-2'>
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
          description='Reglas y precios de reservas y pensión. Los cambios se aplican de inmediato.'
        />
        <Card className='max-w-2xl'>
          <CardHeader>
            <CardTitle>Reservas y pensión</CardTitle>
            <CardDescription>
              Hora límite, mínimo de almuerzos y precios por día y de pensión.
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
