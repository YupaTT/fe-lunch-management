import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ChangePassword } from './change-password'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  navigate: vi.fn(),
  required: false,
}))

vi.mock('@/features/auth/api', () => ({
  useChangePassword: () => ({ mutate: mocks.mutate, isPending: false }),
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { user: { requiereCambioContrasena: mocks.required } },
    }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => mocks.navigate }
})

vi.mock('@/components/layout/app-header', () => ({ AppHeader: () => null }))

async function fillAndSubmit(
  actual: string,
  nueva: string,
  confirmacion: string
) {
  const screen = await render(<ChangePassword />)
  await userEvent.fill(
    screen.getByLabelText(/^Contraseña (actual|temporal)$/),
    actual
  )
  await userEvent.fill(
    screen.getByLabelText('Nueva contraseña', { exact: true }),
    nueva
  )
  await userEvent.fill(
    screen.getByLabelText('Confirmar nueva contraseña'),
    confirmacion
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Guardar contraseña' })
  )
  return screen
}

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.required = false
  })

  it('rejects passwords without letters and numbers', async () => {
    const screen = await fillAndSubmit('actual123', 'solamente', 'solamente')

    await expect
      .element(screen.getByText('Debe incluir al menos un número.'))
      .toBeInTheDocument()
    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it('rejects a confirmation that does not match', async () => {
    const screen = await fillAndSubmit('actual123', 'Nueva1234', 'Otra12345')

    await expect
      .element(screen.getByText('Las contraseñas no coinciden.'))
      .toBeInTheDocument()
    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it('submits a valid change and leaves the forced flow', async () => {
    mocks.required = true
    mocks.mutate.mockImplementation((_vars, opts) => opts?.onSuccess?.())
    const screen = await fillAndSubmit('Temp1234', 'Nueva1234', 'Nueva1234')

    await expect
      .element(screen.getByText('Debe definir una nueva contraseña'))
      .toBeInTheDocument()
    expect(mocks.mutate).toHaveBeenCalledWith(
      { contrasenaActual: 'Temp1234', contrasenaNueva: 'Nueva1234' },
      expect.any(Object)
    )
    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/', replace: true })
  })
})
