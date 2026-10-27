import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ChangePassword } from './change-password'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}))

vi.mock('@/features/auth/api', () => ({
  useChangePassword: () => ({ mutate: mocks.mutate, isPending: false }),
}))

vi.mock('@/components/layout/app-header', () => ({ AppHeader: () => null }))

async function fillAndSubmit(
  actual: string,
  nueva: string,
  confirmacion: string
) {
  const screen = await render(<ChangePassword />)
  await userEvent.fill(screen.getByLabelText('Contraseña actual'), actual)
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

  it('submits a valid change', async () => {
    await fillAndSubmit('actual123', 'Nueva1234', 'Nueva1234')

    await vi.waitFor(() =>
      expect(mocks.mutate).toHaveBeenCalledWith(
        { contrasenaActual: 'actual123', contrasenaNueva: 'Nueva1234' },
        expect.any(Object)
      )
    )
  })
})
