// El backend trabaja en hora de Bolivia; "hoy" debe coincidir con esa zona
export const ZONA_BOLIVIA = 'America/La_Paz'

// Fecha de hoy en Bolivia como YYYY-MM-DD
export function hoyBolivia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_BOLIVIA,
  }).format(new Date())
}

export function mesDe(fecha: string) {
  return fecha.slice(0, 7)
}

export function desplazarMes(mes: string, cantidad: number) {
  const [anio, numero] = mes.split('-').map(Number)
  return new Date(Date.UTC(anio, numero - 1 + cantidad, 1))
    .toISOString()
    .slice(0, 7)
}

// Primer y último día de un mes YYYY-MM
export function rangoDelMes(mes: string) {
  const [anio, numero] = mes.split('-').map(Number)
  const ultimo = new Date(Date.UTC(anio, numero, 0)).getUTCDate()
  return {
    desde: `${mes}-01`,
    hasta: `${mes}-${String(ultimo).padStart(2, '0')}`,
  }
}

// Días del mes en una grilla de lunes a domingo; null rellena el inicio
export function diasDelMes(mes: string) {
  const { desde, hasta } = rangoDelMes(mes)
  const huecos = (new Date(`${desde}T00:00:00Z`).getUTCDay() + 6) % 7
  const cantidad = Number(hasta.slice(8))
  return [
    ...Array<null>(huecos).fill(null),
    ...Array.from(
      { length: cantidad },
      (_, indice) => `${mes}-${String(indice + 1).padStart(2, '0')}`
    ),
  ]
}

export function formatearFecha(
  fecha: string,
  opciones: Intl.DateTimeFormatOptions
) {
  return new Date(`${fecha.slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    'es-BO',
    { ...opciones, timeZone: 'UTC' }
  )
}

// Lunes a jueves de la semana siguiente a la fecha dada, igual que el backend
export function diasSemanaSiguiente(fecha: string) {
  const base = new Date(`${fecha}T00:00:00Z`)
  const hastaLunes = (8 - base.getUTCDay()) % 7 || 7
  return Array.from({ length: 4 }, (_, indice) =>
    new Date(base.getTime() + (hastaLunes + indice) * 86_400_000)
      .toISOString()
      .slice(0, 10)
  )
}
