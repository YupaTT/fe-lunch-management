export type FilaMenu = { titulo: string; detalle: string }

export const FILAS_PLANTILLA: FilaMenu[] = [
  'Sopa',
  'Segundo',
  'Guarnición',
  'Ensalada',
  'Postre',
  'Refresco',
].map((titulo) => ({ titulo, detalle: '' }))

const unaLinea = (texto: string) => texto.replace(/\s*\n\s*/g, ' ')

export function componerFilas(filas: FilaMenu[]) {
  return filas
    .map(
      ({ titulo, detalle }) => `- **${unaLinea(titulo)}:** ${unaLinea(detalle)}`
    )
    .join('\n')
}

// Devuelve null si el texto no tiene el formato de la plantilla
export function leerFilas(texto: string): FilaMenu[] | null {
  const lineas = texto.split('\n').filter((linea) => linea.trim())
  if (lineas.length === 0) return null
  const filas: FilaMenu[] = []
  for (const linea of lineas) {
    const fila = linea.match(/^\s*- \*\*(.*?):\*\* ?(.*)$/)
    if (!fila) return null
    filas.push({ titulo: fila[1], detalle: fila[2] })
  }
  return filas
}

export function esPlantillaVacia(texto: string) {
  const filas = leerFilas(texto)
  return !!filas && filas.every(({ detalle }) => !detalle.trim())
}

export function textoPlano(texto: string) {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/[*_](.+?)[*_]/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
}

// Quita las filas de la plantilla que quedaron sin detalle
export function limpiarMenu(texto: string) {
  const filas = leerFilas(texto)
  if (!filas) return texto
  return componerFilas(filas.filter(({ detalle }) => detalle.trim()))
}
