import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Ocurrió un error inesperado.'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const { title, mensaje } = error.response?.data ?? {}
    if (typeof title === 'string' && title.length > 0) {
      errMsg = title
    } else if (typeof mensaje === 'string' && mensaje.length > 0) {
      errMsg = mensaje
    } else if (!error.response) {
      errMsg = 'No se pudo conectar con el servidor.'
    }
  }

  toast.error(errMsg)
}
