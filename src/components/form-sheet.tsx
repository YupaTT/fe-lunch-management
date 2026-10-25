import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SubmitButton } from '@/components/form-fields'

type FormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  // id del <form> interno; conecta el botón de envío del footer
  formId: string
  submitText?: React.ReactNode
  cancelText?: React.ReactNode
  isLoading?: boolean
  className?: string
  children: React.ReactNode
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  isLoading,
  className,
  children,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('flex flex-col', className)}>
        <SheetHeader className='text-start'>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className='flex-1 overflow-y-auto px-4'>{children}</div>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={isLoading}>
              {cancelText}
            </Button>
          </SheetClose>
          <SubmitButton form={formId} loading={isLoading}>
            {submitText}
          </SubmitButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
