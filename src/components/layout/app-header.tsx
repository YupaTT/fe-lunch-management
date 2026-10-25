import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Header } from './header'

type AppHeaderProps = {
  fixed?: boolean
  className?: string
  // Contenido a la izquierda (p. ej. TopNav); debe incluir 'me-auto'
  children?: React.ReactNode
}

export function AppHeader({ fixed, className, children }: AppHeaderProps) {
  return (
    <Header fixed={fixed} className={className}>
      {children}
      <Search className={children ? undefined : 'me-auto'} />
      <ThemeSwitch />
      <ConfigDrawer />
      <ProfileDropdown />
    </Header>
  )
}
