import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  type EstadoPension as Estado,
  estadoPensionLabels,
  estadoPensionStyles,
} from '../schema'

// Sin estado es una persona que nunca tuvo pensión
export function EstadoPension({ estado }: { estado?: Estado }) {
  return (
    <Badge
      variant='outline'
      className={cn(
        estado ? estadoPensionStyles[estado] : 'text-muted-foreground'
      )}
    >
      {estado ? estadoPensionLabels[estado] : 'Sin pensión'}
    </Badge>
  )
}
