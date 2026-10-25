import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SubmitButton } from '@/components/form-fields'

type FormDialogProps = {
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

export function FormDialog({
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
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg', className)}>
        <DialogHeader className='text-start'>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline' disabled={isLoading}>
              {cancelText}
            </Button>
          </DialogClose>
          <SubmitButton form={formId} loading={isLoading}>
            {submitText}
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
