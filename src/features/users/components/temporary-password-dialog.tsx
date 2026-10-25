import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type TemporaryPasswordDialogProps = {
  data: { nombre: string; contrasena: string } | null
  onClose: () => void
}

export function TemporaryPasswordDialog({
  data,
  onClose,
}: TemporaryPasswordDialogProps) {
  const [copied, setCopied] = useState(false)

  function close() {
    setCopied(false)
    onClose()
  }

  async function copy() {
    if (!data) return
    await navigator.clipboard.writeText(data.contrasena)
    setCopied(true)
  }

  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && close()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Contraseña temporal</DialogTitle>
          <DialogDescription>
            Entregue esta contraseña a <strong>{data?.nombre}</strong>. Deberá
            cambiarla en su primer ingreso y no se volverá a mostrar.
          </DialogDescription>
        </DialogHeader>
        <div className='flex gap-2'>
          <Input
            readOnly
            value={data?.contrasena ?? ''}
            aria-label='Contraseña temporal'
            className='font-mono'
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant='outline' size='icon' onClick={copy}>
            {copied ? <Check /> : <Copy />}
            <span className='sr-only'>Copiar</span>
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={close}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
