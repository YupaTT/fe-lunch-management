import { type Persona, type PersonaPayload } from '@/lib/persona'

export type UsuarioEstado = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE'

export type Usuario = {
  id: string
  correoElectronico: string
  estado: UsuarioEstado
  cantidadFamiliares: number
  usuarioRol: {
    id: string
    estado: string
    rol: { id: string; rol: string }
  }[]
  persona: Persona
}

export type Rol = {
  id: string
  rol: string
  nombre: string
  estado: string
}

export type UsuariosParams = {
  pagina: number
  limite: number
  filtro?: string
  orden?: string
  rol?: string
  estado?: string
}

export type UsuarioPayload = {
  correoElectronico: string
  roles: string[]
  persona: PersonaPayload
}

export type ContrasenaTemporal = {
  id: string
  estado: UsuarioEstado
  contrasenaTemporal: string
}
