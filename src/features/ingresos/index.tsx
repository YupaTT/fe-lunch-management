import { useState } from 'react'
import {
  CalendarCheck,
  CircleCheck,
  Search,
  Undo2,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { getNombreCompleto } from '@/lib/persona'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { formatearFecha, hoyBolivia } from '@/features/dashboard/fechas'
import { KpiCard } from '@/features/dashboard/kpi'
import { parentescoLabels } from '@/features/familiares/schema'
import { useAnularIngreso, useListaIngreso, useRegistrarIngreso } from './api'
import { type Ingreso, modalidadLabels } from './schema'

function horaDeIngreso(fechaIngreso: string) {
  return new Date(fechaIngreso).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/La_Paz',
  })
}

function FilaIngreso({
  ingreso,
  children,
}: {
  ingreso: Ingreso
  children: React.ReactNode
}) {
  const relacion = ingreso.parentesco
    ? `${parentescoLabels[ingreso.parentesco]} de ${getNombreCompleto(ingreso.titular)}`
    : 'Titular'

  return (
    <li className='flex items-center justify-between gap-3 border-b border-dashed p-3 last:border-b-0'>
      <div className='min-w-0'>
        <p className='font-medium'>{getNombreCompleto(ingreso)}</p>
        <p className='text-sm text-muted-foreground'>
          {relacion} · {modalidadLabels[ingreso.modalidad]}
        </p>
      </div>
      <div className='flex shrink-0 items-center gap-2'>{children}</div>
    </li>
  )
}

function ListaVacia({ texto }: { texto: string }) {
  return (
    <p className='rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground'>
      {texto}
    </p>
  )
}

export function ListaIngreso() {
  const hoy = hoyBolivia()
  const lista = useListaIngreso(hoy)
  const registrar = useRegistrarIngreso()
  const anular = useAnularIngreso()
  const [busqueda, setBusqueda] = useState('')
  const [aAnular, setAAnular] = useState<Ingreso | null>(null)

  const termino = busqueda.trim().toLowerCase()
  const filtrar = (filas: Ingreso[]) =>
    filas.filter((ingreso) =>
      getNombreCompleto(ingreso).toLowerCase().includes(termino)
    )

  function registrarIngreso(ingreso: Ingreso) {
    registrar.mutate(ingreso.id, {
      onSuccess: () =>
        toast.success(`Ingreso registrado: ${getNombreCompleto(ingreso)}.`),
    })
  }

  function confirmarAnulacion() {
    if (!aAnular) return
    anular.mutate(aAnular.id, {
      onSuccess: () => {
        toast.success('Ingreso anulado.')
        setAAnular(null)
      },
    })
  }

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-6'>
        <PageHeader
          title='Lista de ingreso'
          description={formatearFecha(hoy, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        />

        {lista.isPending ? (
          <Skeleton className='h-96 w-full' />
        ) : lista.isError ? (
          <Alert variant='destructive'>
            <AlertDescription className='flex items-center justify-between gap-2'>
              {getApiErrorMessage(lista.error, 'No se pudo cargar la lista.')}
              <Button
                variant='outline'
                size='sm'
                onClick={() => lista.refetch()}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className='grid grid-cols-3 gap-3 sm:gap-4'>
              <KpiCard
                titulo='Raciones'
                icon={UsersRound}
                valor={lista.data.totalRaciones}
              />
              <KpiCard
                titulo='Ingresaron'
                icon={CircleCheck}
                valor={lista.data.ingresaron.total}
              />
              <KpiCard
                titulo='Faltan'
                icon={CalendarCheck}
                valor={lista.data.faltan.total}
              />
            </div>

            <Tabs defaultValue='faltan' className='gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <TabsList>
                  <TabsTrigger value='faltan'>
                    Faltan ({lista.data.faltan.total})
                  </TabsTrigger>
                  <TabsTrigger value='ingresaron'>
                    Ingresaron ({lista.data.ingresaron.total})
                  </TabsTrigger>
                </TabsList>
                <div className='relative w-full sm:max-w-xs'>
                  <Search className='absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-8'
                    placeholder='Buscar por nombre'
                    aria-label='Buscar por nombre'
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                  />
                </div>
              </div>

              <TabsContent value='faltan'>
                <FilasFaltantes
                  filas={filtrar(lista.data.faltan.filas)}
                  hayFaltantes={lista.data.faltan.total > 0}
                  registrandoId={
                    registrar.isPending ? registrar.variables : undefined
                  }
                  onRegistrar={registrarIngreso}
                />
              </TabsContent>

              <TabsContent value='ingresaron'>
                <FilasIngresaron
                  filas={filtrar(lista.data.ingresaron.filas)}
                  hayIngresos={lista.data.ingresaron.total > 0}
                  onAnular={setAAnular}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </Main>

      {aAnular && (
        <ConfirmDialog
          open
          onOpenChange={() => setAAnular(null)}
          title='Anular ingreso'
          desc={`Se anulará el ingreso de ${getNombreCompleto(aAnular)} y volverá a figurar como faltante.`}
          confirmText='Anular ingreso'
          cancelBtnText='Cancelar'
          destructive
          isLoading={anular.isPending}
          handleConfirm={confirmarAnulacion}
        />
      )}
    </>
  )
}

function FilasFaltantes({
  filas,
  hayFaltantes,
  registrandoId,
  onRegistrar,
}: {
  filas: Ingreso[]
  hayFaltantes: boolean
  registrandoId?: string
  onRegistrar: (ingreso: Ingreso) => void
}) {
  if (!filas.length) {
    return (
      <ListaVacia
        texto={
          hayFaltantes
            ? 'No hay personas con ese nombre pendientes de ingreso.'
            : 'Todas las raciones de hoy registraron ingreso.'
        }
      />
    )
  }
  return (
    <ul className='overflow-hidden rounded-md border'>
      {filas.map((ingreso) => (
        <FilaIngreso key={ingreso.id} ingreso={ingreso}>
          <Button
            size='sm'
            disabled={registrandoId === ingreso.id}
            onClick={() => onRegistrar(ingreso)}
          >
            <CircleCheck />
            Registrar ingreso
          </Button>
        </FilaIngreso>
      ))}
    </ul>
  )
}

function FilasIngresaron({
  filas,
  hayIngresos,
  onAnular,
}: {
  filas: Ingreso[]
  hayIngresos: boolean
  onAnular: (ingreso: Ingreso) => void
}) {
  if (!filas.length) {
    return (
      <ListaVacia
        texto={
          hayIngresos
            ? 'No hay personas con ese nombre que hayan ingresado.'
            : 'Todavía no se registró ningún ingreso hoy.'
        }
      />
    )
  }
  return (
    <ul className='overflow-hidden rounded-md border'>
      {filas.map((ingreso) => (
        <FilaIngreso key={ingreso.id} ingreso={ingreso}>
          {ingreso.fechaIngreso && (
            <span className='text-sm text-muted-foreground'>
              {horaDeIngreso(ingreso.fechaIngreso)}
            </span>
          )}
          <Button variant='outline' size='sm' onClick={() => onAnular(ingreso)}>
            <Undo2 />
            Anular
          </Button>
        </FilaIngreso>
      ))}
    </ul>
  )
}
