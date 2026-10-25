import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const AUTH_USER = 'auth-user'

export interface AuthRole {
  idRol: string
  rol: string
  nombre: string
}

export interface AuthUser {
  id: string
  correoElectronico: string
  estado: string
  idRol: string
  rol: string
  roles: AuthRole[]
  requiereCambioContrasena: boolean
  persona: {
    nombres: string
    primerApellido?: string | null
    segundoApellido?: string | null
    nroDocumento: string
  }
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function writeStoredUser(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(AUTH_USER, JSON.stringify(user))
    else localStorage.removeItem(AUTH_USER)
  } catch {
    // localStorage no disponible
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  return {
    auth: {
      user: initToken ? readStoredUser() : null,
      setUser: (user) =>
        set((state) => {
          writeStoredUser(user)
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          writeStoredUser(null)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

export function getUserDisplayName(user: AuthUser | null) {
  if (!user) return ''
  const { nombres, primerApellido } = user.persona ?? {}
  return (
    [nombres, primerApellido].filter(Boolean).join(' ') ||
    user.correoElectronico
  )
}
