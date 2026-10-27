import { type Parentesco } from '@/features/familiares/schema'
import { type EstadoMenu, type MotivoSinServicio } from '@/features/menu/schema'

export type FiltrosReporte = {
  desde: string
  hasta: string
}

export type Conteo = {
  reservados: number
  asistieron: number
  noAsistieron: number
  cancelados: number
}

export type Modalidades<T> = { porDia: T; pension: T }

export type DiaAsistencia = Modalidades<Conteo> & {
  fecha: string
  estado: EstadoMenu
  descripcion: string | null
  motivoSinServicio: MotivoSinServicio | null
  detalleMotivo: string | null
}

export type TipoPersona = 'EMPLEADO' | 'FAMILIAR'

export type PersonaAsistencia = Modalidades<Conteo> & {
  idPersona: string
  idUsuarioTitular: string
  nombre: string
  parentesco: Parentesco | null
  tipo: TipoPersona
  titular: string
}

export type ReporteAsistencia = FiltrosReporte & {
  totales: Modalidades<Conteo>
  dias: DiaAsistencia[]
  personas: PersonaAsistencia[]
}

export type Cobro = { cantidad: number; monto: number }

export type Resumen = Modalidades<Cobro> & { monto: number }

export type PersonaPlanilla = Resumen & {
  idPersona: string
  nombre: string
  parentesco: Parentesco | null
}

export type EmpleadoPlanilla = Resumen & {
  idUsuarioTitular: string
  nombre: string
  personas: PersonaPlanilla[]
}

export type ReportePlanilla = FiltrosReporte & {
  empleados: EmpleadoPlanilla[]
  total: Resumen
}

export const tipoPersonaLabels: Record<TipoPersona, string> = {
  EMPLEADO: 'Empleado',
  FAMILIAR: 'Familiar',
}

// Mismo límite que el backend (REPORTE_INVALID_RANGE)
export const MAXIMO_DIAS_REPORTE = 366

// Suma ambas modalidades de un conteo o cobro
export function sumar<T extends Record<string, number>>(
  valores: Modalidades<T>
): T {
  const total = { ...valores.porDia }
  for (const clave of Object.keys(total) as (keyof T)[]) {
    total[clave] = (total[clave] + valores.pension[clave]) as T[keyof T]
  }
  return total
}
