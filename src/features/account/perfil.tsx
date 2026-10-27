import { Link } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/api/client'
import {
  getNombreCompleto,
  generoOptions,
  tipoDocumentoOptions,
} from '@/lib/persona'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { formatearFecha } from '@/features/dashboard/fechas'
import { type Perfil as PerfilData, usePerfil } from './api'

const estadoLabels = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  PENDIENTE: 'Pendiente',
} as const

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className='text-sm text-muted-foreground'>{etiqueta}</dt>
      <dd className='font-medium'>{valor}</dd>
    </div>
  )
}

function PerfilTabs({ perfil }: { perfil: PerfilData }) {
  const { persona } = perfil

  return (
    <Tabs defaultValue='datos' className='max-w-2xl gap-4'>
      <TabsList>
        <TabsTrigger value='datos'>Datos personales</TabsTrigger>
        <TabsTrigger value='cuenta'>Cuenta</TabsTrigger>
      </TabsList>

      <TabsContent value='datos'>
        <Card>
          <CardHeader>
            <CardTitle>{getNombreCompleto(persona)}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4 sm:grid-cols-2'>
              <Dato
                etiqueta='Documento'
                valor={
                  persona.nroDocumento
                    ? `${tipoDocumentoOptions.find((o) => o.value === persona.tipoDocumento)?.label ?? ''} ${persona.nroDocumento}`
                    : 'Sin documento'
                }
              />
              <Dato
                etiqueta='Fecha de nacimiento'
                valor={
                  persona.fechaNacimiento
                    ? formatearFecha(persona.fechaNacimiento, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'No registrada'
                }
              />
              <Dato
                etiqueta='Género'
                valor={
                  generoOptions.find((o) => o.value === persona.genero)
                    ?.label ?? 'No registrado'
                }
              />
            </dl>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='cuenta'>
        <Card>
          <CardHeader>
            <CardTitle>Datos de la cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-4 sm:grid-cols-2'>
              <Dato
                etiqueta='Correo electrónico'
                valor={perfil.correoElectronico}
              />
              <Dato
                etiqueta='Rol'
                valor={
                  perfil.roles.map((rol) => rol.nombre).join(', ') || 'Sin rol'
                }
              />
              <Dato etiqueta='Estado' valor={estadoLabels[perfil.estado]} />
            </dl>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export function Perfil() {
  const perfil = usePerfil()

  return (
    <>
      <AppHeader fixed />
      <Main className='flex flex-col gap-6'>
        <PageHeader
          title='Mi perfil'
          description='Datos de su cuenta. Para modificarlos, contacte al administrador.'
          actions={
            <Button variant='outline' asChild>
              <Link to='/cuenta/contrasena'>Cambiar contraseña</Link>
            </Button>
          }
        />

        {perfil.isPending ? (
          <Skeleton className='h-64 w-full max-w-2xl' />
        ) : perfil.isError ? (
          <Alert variant='destructive' className='max-w-2xl'>
            <AlertDescription className='flex items-center justify-between gap-2'>
              {getApiErrorMessage(perfil.error, 'No se pudo cargar el perfil.')}
              <Button
                variant='outline'
                size='sm'
                onClick={() => perfil.refetch()}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <PerfilTabs perfil={perfil.data} />
        )}
      </Main>
    </>
  )
}
