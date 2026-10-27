export type EstadoMenu =
  | 'DISPONIBLE'
  | 'SIN_SERVICIO'
  | 'PENDIENTE'
  | 'FUERA_DE_ATENCION'

export type MotivoSinServicio =
  | 'FERIADO_NACIONAL'
  | 'FERIADO_INSTITUCIONAL'
  | 'MANTENIMIENTO'
  | 'ACTIVIDAD_INSTITUCIONAL'
  | 'OTRO'

export const estadoMenuLabels: Record<EstadoMenu, string> = {
  DISPONIBLE: 'Disponible',
  SIN_SERVICIO: 'Sin servicio',
  PENDIENTE: 'Pendiente',
  FUERA_DE_ATENCION: 'Fuera de atención',
}

export const motivoSinServicioLabels: Record<MotivoSinServicio, string> = {
  FERIADO_NACIONAL: 'Feriado nacional',
  FERIADO_INSTITUCIONAL: 'Feriado institucional',
  MANTENIMIENTO: 'Mantenimiento',
  ACTIVIDAD_INSTITUCIONAL: 'Actividad institucional',
  OTRO: 'Otro',
}

export type MenuDia = {
  fecha: string
  estado: EstadoMenu
  id?: string
  descripcion?: string
  // Solo para días disponibles: indica si todavía se puede reservar y editar
  reservable?: boolean
  motivoSinServicio?: MotivoSinServicio
  detalleMotivo?: string | null
}
