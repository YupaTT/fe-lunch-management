import { z } from 'zod'

export type Genero = 'M' | 'F' | 'OTRO'
export type TipoDocumento = 'CI' | 'PASAPORTE' | 'OTRO'

export type Persona = {
  nroDocumento: string | null
  tipoDocumento: TipoDocumento
  nombres: string
  primerApellido: string | null
  segundoApellido: string | null
  fechaNacimiento: string | null
  genero: Genero | null
}

export const generoOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'OTRO' },
]

export const tipoDocumentoOptions = [
  { label: 'Cédula de identidad', value: 'CI' },
  { label: 'Pasaporte', value: 'PASAPORTE' },
  { label: 'Otro', value: 'OTRO' },
]

export function getNombreCompleto(
  persona: Pick<Persona, 'nombres' | 'primerApellido' | 'segundoApellido'>
) {
  return [persona.nombres, persona.primerApellido, persona.segundoApellido]
    .filter(Boolean)
    .join(' ')
}

export function personaSchema({
  documentoRequerido,
  generoRequerido,
}: {
  documentoRequerido: boolean
  generoRequerido: boolean
}) {
  return z
    .object({
      nombres: z.string().trim().min(1, 'Ingrese los nombres.'),
      primerApellido: z.string().trim(),
      segundoApellido: z.string().trim(),
      tipoDocumento: z.string(),
      nroDocumento: documentoRequerido
        ? z.string().trim().min(1, 'Ingrese el número de documento.')
        : z.string().trim(),
      fechaNacimiento: z.string(),
      genero: generoRequerido
        ? z.string().min(1, 'Seleccione el género.')
        : z.string(),
    })
    .refine((p) => p.primerApellido || p.segundoApellido, {
      message: 'Ingrese al menos un apellido.',
      path: ['primerApellido'],
    })
}

export type PersonaFormValues = z.infer<ReturnType<typeof personaSchema>>

export const emptyPersona: PersonaFormValues = {
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  tipoDocumento: 'CI',
  nroDocumento: '',
  fechaNacimiento: '',
  genero: '',
}

export function toPersonaFormValues(persona: Persona): PersonaFormValues {
  return {
    nombres: persona.nombres,
    primerApellido: persona.primerApellido ?? '',
    segundoApellido: persona.segundoApellido ?? '',
    tipoDocumento: persona.tipoDocumento ?? 'CI',
    nroDocumento: persona.nroDocumento ?? '',
    fechaNacimiento: persona.fechaNacimiento?.slice(0, 10) ?? '',
    genero: persona.genero ?? '',
  }
}

export type PersonaPayload = ReturnType<typeof toPersonaPayload>

// Convierte los campos vacíos del formulario en valores que acepta el backend
export function toPersonaPayload(values: PersonaFormValues) {
  return {
    nombres: values.nombres,
    primerApellido: values.primerApellido || null,
    segundoApellido: values.segundoApellido || null,
    tipoDocumento: values.tipoDocumento,
    nroDocumento: values.nroDocumento || null,
    fechaNacimiento: values.fechaNacimiento || null,
    genero: values.genero || undefined,
  }
}
