import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { Rol, useHasRole } from '@/features/auth/roles'
import { DashboardAdministrativo } from './administrativo'
import { CalendarioEmpleado } from './calendario'
import { formatearFecha, hoyBolivia } from './fechas'

export function Dashboard() {
  const administrativo = useHasRole(Rol.ADMINISTRADOR, Rol.ENCARGADO)

  return (
    <>
      <AppHeader />

      <Main>
        <PageHeader
          title={administrativo ? 'Resumen del día' : 'Calendario de almuerzos'}
          description={
            administrativo
              ? formatearFecha(hoyBolivia(), {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : undefined
          }
          className='mb-4'
        />
        {administrativo ? <DashboardAdministrativo /> : <CalendarioEmpleado />}
      </Main>
    </>
  )
}
