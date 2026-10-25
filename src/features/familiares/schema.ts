import { type Persona } from '@/lib/persona'

export type Parentesco = 'CONYUGE' | 'PADRE' | 'MADRE' | 'HIJO' | 'HIJA'

export type FamiliarEstado = 'ACTIVO' | 'INACTIVO'

export type Familiar = {
  id: string
  idUsuarioTitular: string
  parentesco: Parentesco
  estado: FamiliarEstado
  persona: Persona & { id: string }
}

export const parentescoLabels: Record<Parentesco, string> = {
  CONYUGE: 'Cónyuge',
  PADRE: 'Padre',
  MADRE: 'Madre',
  HIJO: 'Hijo',
  HIJA: 'Hija',
}

export const parentescoOptions = Object.entries(parentescoLabels).map(
  ([value, label]) => ({ value, label })
)
