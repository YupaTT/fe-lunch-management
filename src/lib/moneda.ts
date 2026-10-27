const formatoBolivianos = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
})

export function formatearMonto(valor: number) {
  return formatoBolivianos.format(valor)
}
