import { useState } from 'react'
import { toast } from 'sonner'
import { formatearMonto } from '@/lib/moneda'
import { getNombreCompleto } from '@/lib/persona'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useActivarPension } from '../api'
import { esActivable, formatearMes, parentescoDe } from '../format'
import { type PensionHogar, type PersonaHogar } from '../schema'

const AUTOMATICA = 'automatica'
const SOLO_MES = 'solo-mes'

// Opción de radio con forma de tarjeta: todo el recuadro es clicable
function Opcion({
  value,
  titulo,
  detalle,
}: {
  value: string
  titulo: string
  detalle: string
}) {
  const id = `opcion-${value}`
  return (
    <Label
      htmlFor={id}
      className='flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5'
    >
      <RadioGroupItem id={id} value={value} className='mt-0.5' />
      <span className='grid gap-0.5'>
        <span className='font-medium'>{titulo}</span>
        <span className='text-xs text-muted-foreground'>{detalle}</span>
      </span>
    </Label>
  )
}

// Registrar la pensión del titular o de un familiar a partir del próximo mes disponible
export function ActivarPensionDialog({
  datos,
  inicial,
  onOpenChange,
}: {
  datos: PensionHogar
  // Persona preseleccionada; null abre el diálogo sin selección
  inicial: PersonaHogar | null
  onOpenChange: (open: boolean) => void
}) {
  const activar = useActivarPension()
  const activables = datos.personas.filter((p) => esActivable(p.pension))
  const [idPersona, setIdPersona] = useState(
    inicial?.idPersona ??
      (activables.length === 1 ? activables[0].idPersona : '')
  )
  const [duracion, setDuracion] = useState(AUTOMATICA)
  const persona = activables.find((p) => p.idPersona === idPersona)
  const mes = datos.inicioSiActiva
  const nombreMes = formatearMes(mes).split(' ')[0]

  function confirmar() {
    if (!persona) return
    activar.mutate(
      {
        idPersona: persona.idPersona,
        mesInicio: mes,
        mesFin: duracion === SOLO_MES ? mes : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Pensión de ${getNombreCompleto(persona)} registrada.`)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Registrar pensión</DialogTitle>
          <DialogDescription className='first-letter:uppercase'>
            {formatearMes(mes)} · {formatearMonto(datos.precio)} por almuerzo ·
            mínimo {datos.minimo} al mes
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-5'>
          <fieldset className='grid gap-2'>
            <legend className='mb-2 text-sm font-medium'>¿Para quién?</legend>
            {activables.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Todo tu hogar ya tiene pensión.
              </p>
            ) : (
              <RadioGroup
                value={idPersona}
                onValueChange={setIdPersona}
                className='gap-2'
              >
                {activables.map((p) => (
                  <Opcion
                    key={p.idPersona}
                    value={p.idPersona}
                    titulo={getNombreCompleto(p)}
                    detalle={parentescoDe(p)}
                  />
                ))}
              </RadioGroup>
            )}
          </fieldset>

          <fieldset className='grid gap-2'>
            <legend className='mb-2 text-sm font-medium'>Duración</legend>
            <RadioGroup
              value={duracion}
              onValueChange={setDuracion}
              className='gap-2'
            >
              <Opcion
                value={AUTOMATICA}
                titulo='Renovación automática'
                detalle='Continúa cada mes hasta que la canceles.'
              />
              <Opcion
                value={SOLO_MES}
                titulo={`Solo ${nombreMes}`}
                detalle='Termina al finalizar el mes.'
              />
            </RadioGroup>
          </fieldset>
        </div>

        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline' disabled={activar.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button disabled={!persona || activar.isPending} onClick={confirmar}>
            {activar.isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
