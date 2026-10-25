import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const navigate = vi.fn()
const mutate = vi.fn()

vi.mock('../../api', () => ({
  useLogin: () => ({
    mutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({ children, to }: { children?: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

const user = {
  correoElectronico: 'juan.perez@unionbo.com',
  requiereCambioContrasena: false,
  persona: { nombres: 'JUAN', primerApellido: 'PEREZ' },
}

describe('UserAuthForm', () => {
  let screen: RenderResult
  let correoInput: Locator
  let contrasenaInput: Locator
  let submitButton: Locator

  async function setup(redirectTo?: string) {
    screen = await render(<UserAuthForm redirectTo={redirectTo} />)
    correoInput = screen.getByRole('textbox', { name: /^Correo electrónico$/i })
    contrasenaInput = screen.getByLabelText(/^Contraseña$/i)
    submitButton = screen.getByRole('button', { name: /^Iniciar sesión$/i })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mutate.mockImplementation((_data, opts) => opts?.onSuccess?.(user))
  })

  it('shows validation messages when submitting empty form', async () => {
    await setup()
    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText('Ingrese su correo electrónico.'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Ingrese su contraseña.'))
      .toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits credentials and navigates to default route', async () => {
    await setup()
    await userEvent.fill(correoInput, 'juan.perez@unionbo.com')
    await userEvent.fill(contrasenaInput, '123')
    await userEvent.click(submitButton)

    await vi.waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { correoElectronico: 'juan.perez@unionbo.com', contrasena: '123' },
        expect.any(Object)
      )
    )
    expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
  })

  it('sends the user to change password when a temporary one was used', async () => {
    mutate.mockImplementation((_data, opts) =>
      opts?.onSuccess?.({ ...user, requiereCambioContrasena: true })
    )
    await setup('/users')
    await userEvent.fill(correoInput, 'juan.perez@unionbo.com')
    await userEvent.fill(contrasenaInput, 'Temporal123')
    await userEvent.click(submitButton)

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/cuenta/contrasena',
        replace: true,
      })
    )
  })

  it('navigates to redirectTo when provided', async () => {
    await setup('/users')
    await userEvent.fill(correoInput, 'juan.perez@unionbo.com')
    await userEvent.fill(contrasenaInput, '123')
    await userEvent.click(submitButton)

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/users', replace: true })
    )
  })
})
