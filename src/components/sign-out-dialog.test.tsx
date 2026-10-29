import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { SignOutDialog } from './sign-out-dialog'

const navigate = vi.fn()
const mutate = vi.fn((_vars, opts) => opts?.onSettled?.())

vi.mock('@/features/auth/api', () => ({
  useLogout: () => ({ mutate, isPending: false }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

describe('SignOutDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls logout and navigates to sign-in without redirect', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Cerrar sesión$/i }))

    expect(mutate).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith({
      to: '/sign-in',
      replace: true,
    })
  })

  it('does not call logout or navigate when Cancel is clicked', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Cancelar$/i }))

    expect(mutate).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
