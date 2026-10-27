import { type Parentesco } from '@/features/familiares/schema'
import { type EstadoReserva } from '@/features/reservas/schema'

// Lo calcula el backend respecto del mes actual de Bolivia
export type EstadoPension =
  | 'ACTIVA'
  | 'PROGRAMADA'
  | 'POR_TERMINAR'
  | 'FINALIZADA'

export const estadoPensionLabels: Record<EstadoPension, string> = {
  ACTIVA: 'Activa',
  PROGRAMADA: 'Programada',
  POR_TERMINAR: 'Por terminar',
  FINALIZADA: 'Finalizada',
}

export const estadoPensionStyles: Record<EstadoPension, string> = {
  ACTIVA: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  PROGRAMADA: 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300',
  POR_TERMINAR:
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-200',
  FINALIZADA: 'bg-neutral-300/40 border-neutral-300',
}

export type Pension = {
  id: string
  mesInicio: string
  // Primer día del último mes cubierto; null mientras la pensión está vigente
  mesFin: string | null
  estado: EstadoPension
}

export type DiaPension = {
  id: string
  fecha: string
  menu: string | null
  estado: EstadoReserva
  motivoCancelacion: string | null
  precio: string
  cancelable: boolean
}

export type ResumenMes = {
  comprometidos: number
  cancelables: number
  monto: number
  dias: DiaPension[]
}

type NombrePersona = {
  idPersona: string
  nombres: string
  primerApellido: string | null
  segundoApellido: string | null
  parentesco: Parentesco | null
}

type NombreTitular = {
  idUsuarioTitular: string
  titularNombres: string
  titularPrimerApellido: string | null
  titularSegundoApellido: string | null
}

export type PersonaHogar = ResumenMes &
  NombrePersona & {
    pension: Pension | null
  }

export type PensionHogar = {
  mes: string
  minimo: number
  precio: number
  // Hora límite para activar o cancelar con efecto en inicioSiActiva
  cierre: string
  inicioSiActiva: string
  finSiCancela: string
  total: number
  personas: PersonaHogar[]
}

export type FilaPensionado = NombrePersona &
  NombreTitular & {
    idSuscripcion: string
    mesInicio: string
    mesFin: string | null
    estado: EstadoPension
    comprometidos: number
    cancelados: number
    monto: number
  }

export type DetallePension = ResumenMes &
  Pension &
  NombrePersona &
  NombreTitular & {
    finSiCancela: string
  }
