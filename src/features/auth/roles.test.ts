import { describe, expect, it } from 'vitest'
import { type AuthUser } from '@/stores/auth-store'
import { Rol, hasRole } from './roles'

const user = (rol: string) => ({ rol }) as AuthUser

describe('hasRole', () => {
  it('allows everyone when no roles are required', () => {
    expect(hasRole(null, undefined)).toBe(true)
    expect(hasRole(user(Rol.EMPLEADO), [])).toBe(true)
  })

  it('checks the current role of the user', () => {
    expect(hasRole(user(Rol.ADMINISTRADOR), [Rol.ADMINISTRADOR])).toBe(true)
    expect(hasRole(user(Rol.EMPLEADO), [Rol.ADMINISTRADOR])).toBe(false)
  })

  it('denies access without an authenticated user', () => {
    expect(hasRole(null, [Rol.EMPLEADO])).toBe(false)
  })
})
