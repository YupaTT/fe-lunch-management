import { ZONA_BOLIVIA, formatearFecha } from '@/features/dashboard/fechas'
import { type Parentesco, parentescoLabels } from '@/features/familiares/schema'
import { type Pension } from './schema'

export function parentescoDe(persona: { parentesco: Parentesco | null }) {
  return persona.parentesco ? parentescoLabels[persona.parentesco] : 'Titular'
}

// Sin pensión vigente puede activarla; una que termina también se puede renovar
export function esActivable(pension: Pension | null) {
  return !pension || pension.mesFin !== null
}

// Mes en texto a partir de una fecha YYYY-MM-DD, por ejemplo "noviembre de 2026"
export function formatearMes(fecha: string) {
  return formatearFecha(fecha, { month: 'long', year: 'numeric' })
}

// Hora límite en hora de Bolivia, por ejemplo "vie, 31 oct, 21:00"
export function formatearCierre(iso: string) {
  return new Date(iso).toLocaleString('es-BO', {
    timeZone: ZONA_BOLIVIA,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const mesCorto = (fecha: string) =>
  formatearFecha(fecha, { month: 'short', year: 'numeric' })

// "Desde nov 2026" mientras sigue vigente, "Hasta oct 2026" si ya tiene fin
export function vigencia(pension: Pick<Pension, 'mesInicio' | 'mesFin'>) {
  if (!pension.mesFin) return `Desde ${mesCorto(pension.mesInicio)}`
  // Cancelada antes de empezar: nunca tuvo vigencia
  if (pension.mesFin < pension.mesInicio) return '—'
  return `Hasta ${mesCorto(pension.mesFin)}`
}
