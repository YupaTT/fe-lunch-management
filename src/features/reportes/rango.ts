import { type FiltrosReporte, MAXIMO_DIAS_REPORTE } from './schema'

const DIA = 86_400_000

// Mensaje de error del rango, o null si es válido; misma regla que el backend
export function errorRango({ desde, hasta }: FiltrosReporte) {
  if (!desde || !hasta) return 'Seleccione ambas fechas.'
  const dias = (Date.parse(hasta) - Date.parse(desde)) / DIA + 1
  if (dias < 1) return 'La fecha inicial debe ser anterior o igual a la final.'
  if (dias > MAXIMO_DIAS_REPORTE) {
    return `El rango no puede superar ${MAXIMO_DIAS_REPORTE} días.`
  }
  return null
}
