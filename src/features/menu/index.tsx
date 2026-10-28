import { useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, CircleCheck, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { InputField, SelectField, SubmitButton } from '@/components/form-fields'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import {
  desplazarMes,
  diasSemanaSiguiente,
  formatearFecha,
  hoyBolivia,
  mesDe,
  rangoDelMes,
} from '@/features/dashboard/fechas'
import {
  type DiaPublicar,
  useActualizarDescripcion,
  useMenus,
  usePublicarMenu,
} from './api'
import { esPlantillaVacia, limpiarMenu } from './markdown'
import { MenuMarkdown, MenuMarkdownField } from './menu-markdown'
import {
  estadoMenuLabels,
  motivoSinServicioLabels,
  type MenuDia,
  type MotivoSinServicio,
} from './schema'

const motivoOptions = Object.entries(motivoSinServicioLabels).map(
  ([value, label]) => ({ value, label })
)

const formSchema = z
  .object({
    dias: z.array(
      z.object({
        estado: z.enum(['DISPONIBLE', 'SIN_SERVICIO']),
        descripcion: z.string().trim().max(500, 'Máximo 500 caracteres.'),
        motivoSinServicio: z.string(),
        detalleMotivo: z.string().trim().max(255, 'Máximo 255 caracteres.'),
      })
    ),
  })
  .superRefine(({ dias }, ctx) => {
    dias.forEach((dia, indice) => {
      if (
        dia.estado === 'DISPONIBLE' &&
        (!dia.descripcion || esPlantillaVacia(dia.descripcion))
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['dias', indice, 'descripcion'],
          message: 'Ingrese la descripción del menú.',
        })
      }
      if (dia.estado === 'SIN_SERVICIO' && !dia.motivoSinServicio) {
        ctx.addIssue({
          code: 'custom',
          path: ['dias', indice, 'motivoSinServicio'],
          message: 'Seleccione el motivo.',
        })
      }
      if (
        dia.estado === 'SIN_SERVICIO' &&
        dia.motivoSinServicio === 'OTRO' &&
        !dia.detalleMotivo
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['dias', indice, 'detalleMotivo'],
          message: 'Describa el motivo.',
        })
      }
    })
  })

type MenuForm = z.infer<typeof formSchema>

function toDiaPublicar(
  fecha: string,
  dia: MenuForm['dias'][number]
): DiaPublicar {
  if (dia.estado === 'DISPONIBLE') {
    return {
      fecha,
      estado: 'DISPONIBLE',
      descripcion: limpiarMenu(dia.descripcion),
    }
  }
  const motivo = dia.motivoSinServicio as MotivoSinServicio
  return {
    fecha,
    estado: 'SIN_SERVICIO',
    motivoSinServicio: motivo,
    ...(motivo === 'OTRO' && { detalleMotivo: dia.detalleMotivo }),
  }
}

function DiaPublicarFields({
  control,
  indice,
  fecha,
}: {
  control: Control<MenuForm>
  indice: number
  fecha: string
}) {
  const estado = useWatch({ control, name: `dias.${indice}.estado` })
  const motivo = useWatch({ control, name: `dias.${indice}.motivoSinServicio` })

  return (
    <fieldset className='grid gap-4 rounded-lg border p-4 sm:grid-cols-2'>
      <legend className='px-1 text-sm font-semibold first-letter:uppercase'>
        {formatearFecha(fecha, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </legend>
      <SelectField
        control={control}
        name={`dias.${indice}.estado`}
        label='Estado'
        options={[
          { value: 'DISPONIBLE', label: 'Disponible' },
          { value: 'SIN_SERVICIO', label: 'Sin servicio' },
        ]}
      />
      {estado === 'DISPONIBLE' ? (
        <MenuMarkdownField
          control={control}
          name={`dias.${indice}.descripcion`}
          label='Menú'
          placeholder='Ej.: Sopa de verduras, arroz, pollo al horno y jugo'
          className='sm:col-span-2'
        />
      ) : (
        <SelectField
          control={control}
          name={`dias.${indice}.motivoSinServicio`}
          label='Motivo'
          options={motivoOptions}
          className='sm:col-span-2'
        />
      )}
      {estado === 'SIN_SERVICIO' && motivo === 'OTRO' && (
        <InputField
          control={control}
          name={`dias.${indice}.detalleMotivo`}
          label='Detalle del motivo'
          className='sm:col-span-2'
        />
      )}
    </fieldset>
  )
}

function PublicarSemana({ fechas }: { fechas: string[] }) {
  const publicar = usePublicarMenu()
  const [porPublicar, setPorPublicar] = useState<DiaPublicar[] | null>(null)
  const form = useForm<MenuForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dias: fechas.map(() => ({
        estado: 'DISPONIBLE',
        descripcion: '',
        motivoSinServicio: '',
        detalleMotivo: '',
      })),
    },
  })

  function onSubmit({ dias }: MenuForm) {
    setPorPublicar(
      dias.map((dia, indice) => toDiaPublicar(fechas[indice], dia))
    )
  }

  function confirmar() {
    if (!porPublicar) return
    publicar.mutate(porPublicar, {
      onSuccess: () => toast.success('Menú publicado.'),
      onSettled: () => setPorPublicar(null),
    })
  }

  const sinServicio = porPublicar?.filter(
    (dia) => dia.estado === 'SIN_SERVICIO'
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicar la semana</CardTitle>
        <CardDescription>
          Defina cada día como disponible o sin servicio. Después de publicar
          solo podrá editar la descripción de los días disponibles, hasta la
          hora límite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4'
            noValidate
          >
            {publicar.isError && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {getApiErrorMessage(publicar.error)}
                </AlertDescription>
              </Alert>
            )}
            {fechas.map((fecha, indice) => (
              <DiaPublicarFields
                key={fecha}
                control={form.control}
                indice={indice}
                fecha={fecha}
              />
            ))}
            <Alert>
              <AlertDescription>
                Si un día queda sin servicio, las reservas y los días de pensión
                de ese día se cancelan al publicar.
              </AlertDescription>
            </Alert>
            <SubmitButton
              className='justify-self-start'
              loading={publicar.isPending}
            >
              Publicar menú
            </SubmitButton>
          </form>
        </Form>
      </CardContent>
      <ConfirmDialog
        open={!!porPublicar}
        onOpenChange={(abierto) => !abierto && setPorPublicar(null)}
        title='¿Publicar el menú de la semana?'
        desc={
          sinServicio
            ? `Después no podrá cambiar el estado de los días. ${sinServicio} día(s) sin servicio cancelarán sus reservas y días de pensión.`
            : 'Después no podrá cambiar el estado de los días, solo la descripción hasta la hora límite.'
        }
        cancelBtnText='Cancelar'
        confirmText='Publicar'
        isLoading={publicar.isPending}
        handleConfirm={confirmar}
      />
    </Card>
  )
}

function descripcionDia(dia: MenuDia) {
  if (dia.estado === 'DISPONIBLE') return dia.descripcion ?? ''
  const motivo = dia.motivoSinServicio
    ? motivoSinServicioLabels[dia.motivoSinServicio]
    : 'Sin servicio'
  return dia.detalleMotivo ? `${motivo}: ${dia.detalleMotivo}` : motivo
}

const descripcionSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(1, 'Ingrese la descripción del menú.')
    .max(500, 'Máximo 500 caracteres.')
    .refine((texto) => !esPlantillaVacia(texto), {
      message: 'Ingrese la descripción del menú.',
    }),
})

function EditarDescripcion({
  id,
  descripcion,
  onCerrar,
}: {
  id: string
  descripcion: string
  onCerrar: () => void
}) {
  const actualizar = useActualizarDescripcion()
  const form = useForm({
    resolver: zodResolver(descripcionSchema),
    defaultValues: { descripcion },
  })

  function onSubmit(values: z.infer<typeof descripcionSchema>) {
    actualizar.mutate(
      { id, descripcion: limpiarMenu(values.descripcion) },
      {
        onSuccess: () => {
          toast.success('Descripción actualizada.')
          onCerrar()
        },
      }
    )
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent>
        <DialogHeader className='text-start'>
          <DialogTitle>Editar descripción del menú</DialogTitle>
          <DialogDescription>
            Se puede editar hasta la hora límite del día anterior.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='editar-descripcion'
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4'
            noValidate
          >
            {actualizar.isError && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {getApiErrorMessage(actualizar.error)}
                </AlertDescription>
              </Alert>
            )}
            <MenuMarkdownField
              control={form.control}
              name='descripcion'
              label='Menú'
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={onCerrar}>
            Cancelar
          </Button>
          <SubmitButton
            form='editar-descripcion'
            loading={actualizar.isPending}
          >
            Guardar
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SemanaPublicada({
  titulo,
  dias,
}: {
  titulo: string
  dias: MenuDia[]
}) {
  const [editando, setEditando] = useState<MenuDia | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>
          Los días publicados no cambian de estado. Puede editar la descripción
          de los días disponibles hasta la hora límite.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-3'>
        {dias.map((dia) => (
          <div
            key={dia.fecha}
            className='flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='min-w-0 space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='font-medium first-letter:uppercase'>
                  {formatearFecha(dia.fecha, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                <Badge variant='outline'>{estadoMenuLabels[dia.estado]}</Badge>
                {dia.estado === 'DISPONIBLE' && !dia.reservable && (
                  <Badge variant='secondary'>Cerrado</Badge>
                )}
              </div>
              {dia.estado === 'DISPONIBLE' ? (
                <MenuMarkdown texto={dia.descripcion ?? ''} />
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {descripcionDia(dia)}
                </p>
              )}
            </div>
            {dia.id && dia.estado === 'DISPONIBLE' && dia.reservable && (
              <Button
                variant='outline'
                size='sm'
                className='self-start sm:self-center'
                onClick={() => setEditando(dia)}
              >
                <Pencil />
                Editar descripción
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      {editando?.id && (
        <EditarDescripcion
          key={editando.id}
          id={editando.id}
          descripcion={editando.descripcion ?? ''}
          onCerrar={() => setEditando(null)}
        />
      )}
    </Card>
  )
}

// Semanas (lunes a jueves) con al menos un día de servicio dentro del mes
function semanasDelMes(mes: string) {
  const { desde, hasta } = rangoDelMes(mes)
  const semanaAntes = new Date(
    Date.parse(`${desde}T00:00:00Z`) - 7 * 86_400_000
  )
  const semanas: string[][] = []
  let semana = diasSemanaSiguiente(semanaAntes.toISOString().slice(0, 10))
  while (semana[0] <= hasta) {
    if (semana[3] >= desde) semanas.push(semana)
    semana = diasSemanaSiguiente(semana[0])
  }
  return semanas
}

function etiquetaSemana(fechas: string[]) {
  return `${formatearFecha(fechas[0], { day: 'numeric' })}–${formatearFecha(fechas[3], { day: 'numeric', month: 'short' })}`
}

function ContenidoSemana({
  fechas,
  dias,
  futura,
}: {
  fechas: string[]
  dias: MenuDia[]
  futura: boolean
}) {
  if (dias.some((dia) => dia.estado !== 'PENDIENTE')) {
    return (
      <SemanaPublicada
        titulo={`Semana del ${etiquetaSemana(fechas)}`}
        dias={dias}
      />
    )
  }
  if (futura) return <PublicarSemana fechas={fechas} />
  return (
    <Alert>
      <AlertDescription>
        Esta semana no tiene menú publicado y ya no se puede publicar.
      </AlertDescription>
    </Alert>
  )
}

export function MenuDelDia() {
  const lunesSiguiente = diasSemanaSiguiente(hoyBolivia())[0]
  const [mes, setMes] = useState(() => mesDe(lunesSiguiente))
  const [seleccionada, setSeleccionada] = useState<string>()
  const semanas = semanasDelMes(mes)
  const menus = useMenus(semanas[0][0], semanas[semanas.length - 1][3])
  const menuPorFecha = new Map(
    (menus.data ?? []).map((dia) => [dia.fecha.slice(0, 10), dia])
  )
  const diasDe = (fechas: string[]) =>
    fechas.flatMap((fecha) => menuPorFecha.get(fecha) ?? [])
  const publicada = (fechas: string[]) =>
    diasDe(fechas).some((dia) => dia.estado !== 'PENDIENTE')
  // Por defecto, la primera semana futura del mes
  const activa = semanas.some((semana) => semana[0] === seleccionada)
    ? seleccionada
    : (semanas.find((semana) => semana[0] >= lunesSiguiente) ?? semanas[0])[0]

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-6'>
        <PageHeader
          title='Menú del día'
          description='Publique el menú de cada semana futura, de lunes a jueves. Una vez publicado, solo se edita la descripción hasta la hora límite.'
        />
        <div className='flex items-center justify-between gap-2'>
          <Button
            variant='outline'
            size='icon'
            aria-label='Mes anterior'
            onClick={() => setMes(desplazarMes(mes, -1))}
          >
            <ChevronLeft />
          </Button>
          <h2 className='text-lg font-semibold first-letter:uppercase'>
            {formatearFecha(`${mes}-01`, { month: 'long', year: 'numeric' })}
          </h2>
          <Button
            variant='outline'
            size='icon'
            aria-label='Mes siguiente'
            onClick={() => setMes(desplazarMes(mes, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        {menus.isPending ? (
          <Skeleton className='h-96 w-full' />
        ) : menus.isError ? (
          <Alert variant='destructive'>
            <AlertDescription className='flex items-center justify-between gap-2'>
              {getApiErrorMessage(menus.error, 'No se pudo cargar el menú.')}
              <Button
                variant='outline'
                size='sm'
                onClick={() => menus.refetch()}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activa} onValueChange={setSeleccionada}>
            <TabsList className='max-w-full justify-start overflow-x-auto'>
              {semanas.map((semana) => (
                <TabsTrigger key={semana[0]} value={semana[0]}>
                  {publicada(semana) && <CircleCheck aria-label='Publicada' />}
                  {etiquetaSemana(semana)}
                </TabsTrigger>
              ))}
            </TabsList>
            {semanas.map((semana) => (
              // forceMount conserva lo escrito al cambiar de pestaña
              <TabsContent
                key={semana[0]}
                value={semana[0]}
                forceMount
                className='data-[state=inactive]:hidden'
              >
                <ContenidoSemana
                  fechas={semana}
                  dias={diasDe(semana)}
                  futura={semana[0] >= lunesSiguiente}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </Main>
    </>
  )
}
