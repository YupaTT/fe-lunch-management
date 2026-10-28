import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import {
  CalendarCheck,
  CircleCheck,
  Lock,
  Undo2,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/client'
import { getNombreCompleto } from '@/lib/persona'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { Rol, useHasRole } from '@/features/auth/roles'
import {
  ZONA_BOLIVIA,
  formatearFecha,
  hoyBolivia,
} from '@/features/dashboard/fechas'
import { KpiCard } from '@/features/dashboard/kpi'
import { estadoReservaLabels } from '@/features/reservas/schema'
import {
  useAnularIngreso,
  useCerrarDia,
  useListaIngreso,
  useRegistrarIngreso,
} from './api'
import { columnasBase } from './columns'
import { type Ingreso } from './schema'
import { TablaIngresos } from './tabla-ingresos'

function horaDeIngreso(fechaIngreso: string) {
  return new Date(fechaIngreso).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_BOLIVIA,
  })
}

export function ListaIngreso() {
  const hoy = hoyBolivia()
  const lista = useListaIngreso(hoy)
  const registrar = useRegistrarIngreso()
  const anular = useAnularIngreso()
  const cerrar = useCerrarDia()
  const puedeCerrar = useHasRole(Rol.ADMINISTRADOR, Rol.ENCARGADO)
  const [aAnular, setAAnular] = useState<Ingreso | null>(null)
  const [confirmarCierre, setConfirmarCierre] = useState(false)
  const pendientes =
    lista.data?.faltan.filas.filter((f) => f.estado === 'RESERVADO').length ?? 0

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

  function cerrarDia() {
    cerrar.mutate(undefined, {
      onSuccess: ({ noAsistieron }) => {
        toast.success(
          noAsistieron
            ? `Día cerrado. ${noAsistieron} persona(s) marcadas como No asistió.`
            : 'Día cerrado. No había personas pendientes.'
        )
        setConfirmarCierre(false)
      },
    })
  }

  const registrandoId = registrar.isPending ? registrar.variables : undefined

  const columnasFaltan = useMemo<ColumnDef<Ingreso>[]>(
    () => [
      ...columnasBase,
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge
            variant='outline'
            className={
              row.original.estado === 'NO_ASISTIO'
                ? 'border-destructive text-destructive'
                : ''
            }
          >
            {estadoReservaLabels[row.original.estado]}
          </Badge>
        ),
        enableGlobalFilter: false,
        meta: { label: 'Estado' },
      },
      {
        id: 'accion',
        cell: ({ row }) =>
          row.original.estado === 'RESERVADO' && (
            <Button
              size='sm'
              disabled={registrandoId === row.original.id}
              onClick={() => registrarIngreso(row.original)}
            >
              <CircleCheck />
              Registrar ingreso
            </Button>
          ),
        enableHiding: false,
        meta: { className: 'w-0 text-right' },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registrandoId]
  )

  const columnasIngresaron = useMemo<ColumnDef<Ingreso>[]>(
    () => [
      ...columnasBase,
      {
        accessorKey: 'fechaIngreso',
        header: 'Hora de ingreso',
        cell: ({ row }) =>
          row.original.fechaIngreso && horaDeIngreso(row.original.fechaIngreso),
        enableGlobalFilter: false,
        meta: { label: 'Hora de ingreso', className: 'tabular-nums' },
      },
      {
        id: 'accion',
        cell: ({ row }) => (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setAAnular(row.original)}
          >
            <Undo2 />
            Anular
          </Button>
        ),
        enableHiding: false,
        meta: { className: 'w-0 text-right' },
      },
    ],
    []
  )

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
          actions={
            puedeCerrar &&
            lista.isSuccess && (
              <Button
                variant='outline'
                disabled={pendientes === 0}
                onClick={() => setConfirmarCierre(true)}
              >
                <Lock />
                Cerrar día
              </Button>
            )
          }
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
              <TabsList>
                <TabsTrigger value='faltan'>
                  Faltan ({lista.data.faltan.total})
                </TabsTrigger>
                <TabsTrigger value='ingresaron'>
                  Ingresaron ({lista.data.ingresaron.total})
                </TabsTrigger>
              </TabsList>
              <TabsContent value='faltan'>
                <TablaIngresos
                  filas={lista.data.faltan.filas}
                  columnas={columnasFaltan}
                  isFetching={lista.isFetching}
                  emptyMessage='Todas las raciones de hoy registraron ingreso.'
                />
              </TabsContent>
              <TabsContent value='ingresaron'>
                <TablaIngresos
                  filas={lista.data.ingresaron.filas}
                  columnas={columnasIngresaron}
                  isFetching={lista.isFetching}
                  emptyMessage='Todavía no se registró ningún ingreso hoy.'
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </Main>

      <ConfirmDialog
        open={confirmarCierre}
        onOpenChange={setConfirmarCierre}
        title='Cerrar día'
        desc={`Se marcarán como No asistió las ${pendientes} persona(s) que faltan. Esta acción no se puede deshacer. ¿Cerrar el día?`}
        confirmText='Cerrar día'
        cancelBtnText='Cancelar'
        destructive
        isLoading={cerrar.isPending}
        handleConfirm={cerrarDia}
      />

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
