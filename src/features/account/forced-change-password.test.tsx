import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ForcedChangePassword } from './forced-change-password'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  logout: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('@/features/auth/api', () => ({
  useChangePassword: () => ({ mutate: mocks.mutate, isPending: false }),
  useLogout: () => ({ mutate: mocks.logout, isPending: false }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => mocks.navigate }
})

describe('ForcedChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pide la contraseña temporal y bloquea el acceso hasta cambiarla', async () => {
    const screen = await render(<ForcedChangePassword />)

    await expect
      .element(screen.getByText('Debe cambiar su contraseña'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByLabelText('Contraseña temporal'))
      .toBeInTheDocument()
  })

  it('al cambiar la contraseña entra al sistema', async () => {
    mocks.mutate.mockImplementation((_vars, opts) => opts?.onSuccess?.())
    const screen = await render(<ForcedChangePassword />)

    await userEvent.fill(
      screen.getByLabelText('Contraseña temporal'),
      'Temp1234'
    )
    await userEvent.fill(
      screen.getByLabelText('Nueva contraseña', { exact: true }),
      'Nueva1234'
    )
    await userEvent.fill(
      screen.getByLabelText('Confirmar nueva contraseña'),
      'Nueva1234'
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Guardar contraseña' })
    )

    expect(mocks.mutate).toHaveBeenCalledWith(
      { contrasenaActual: 'Temp1234', contrasenaNueva: 'Nueva1234' },
      expect.any(Object)
    )
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/', replace: true })
  })

  it('permite cerrar sesión sin cambiar la contraseña', async () => {
    mocks.logout.mockImplementation((_vars, opts) => opts?.onSettled?.())
    const screen = await render(<ForcedChangePassword />)

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(mocks.logout).toHaveBeenCalled()
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/sign-in',
      replace: true,
    })
  })
})
