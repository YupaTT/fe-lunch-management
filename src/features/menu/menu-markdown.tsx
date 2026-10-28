import { Fragment, useId, useState } from 'react'
import { type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from 'cn'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  componerFilas,
  FILAS_PLANTILLA,
  type FilaMenu,
  leerFilas,
} from './markdown'

function renderLinea(linea: string) {
  return linea
    .split(/(\*\*.+?\*\*|\*[^*]+?\*|_[^_]+?_)/g)
    .map((parte, indice) => {
      if (parte.startsWith('**') && parte.endsWith('**') && parte.length > 4) {
        return <strong key={indice}>{parte.slice(2, -2)}</strong>
      }
      if (/^([*_]).+\1$/.test(parte)) {
        return <em key={indice}>{parte.slice(1, -1)}</em>
      }
      return <Fragment key={indice}>{parte}</Fragment>
    })
}

// Soporta solo negrilla, cursiva y listas con guion
export function MenuMarkdown({
  texto,
  className,
}: {
  texto: string
  className?: string
}) {
  const bloques: React.ReactNode[] = []
  let lista: string[] = []
  const cerrarLista = () => {
    if (lista.length === 0) return
    bloques.push(
      <ul key={bloques.length} className='list-disc ps-5'>
        {lista.map((item, indice) => (
          <li key={indice}>{renderLinea(item)}</li>
        ))}
      </ul>
    )
    lista = []
  }

  for (const linea of texto.split('\n')) {
    const item = linea.match(/^\s*[-*]\s+(.*)$/)
    if (item) {
      lista.push(item[1])
      continue
    }
    cerrarLista()
    if (linea.trim()) {
      bloques.push(<p key={bloques.length}>{renderLinea(linea)}</p>)
    }
  }
  cerrarLista()

  return (
    <div className={cn('space-y-0.5 text-sm text-muted-foreground', className)}>
      {bloques}
    </div>
  )
}

type MenuMarkdownFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: React.ReactNode
  placeholder?: string
  className?: string
}

export function MenuMarkdownField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
}: MenuMarkdownFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <MenuMarkdownItem
          value={field.value ?? ''}
          onChange={field.onChange}
          label={label}
          className={className}
        >
          <FormControl>
            <Textarea {...field} placeholder={placeholder} rows={4} />
          </FormControl>
        </MenuMarkdownItem>
      )}
    />
  )
}

function FilasEditor({
  filas,
  onChange,
}: {
  filas: FilaMenu[]
  onChange: (filas: FilaMenu[]) => void
}) {
  function cambiar(indice: number, cambio: Partial<FilaMenu>) {
    onChange(
      filas.map((fila, i) => (i === indice ? { ...fila, ...cambio } : fila))
    )
  }

  return (
    <div className='grid gap-2'>
      {filas.map((fila, indice) => (
        <div
          key={indice}
          className='grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-2'
        >
          <Input
            value={fila.titulo}
            placeholder='Título'
            aria-label={`Título de la fila ${indice + 1}`}
            className='font-semibold'
            onChange={(event) =>
              cambiar(indice, { titulo: event.target.value })
            }
          />
          <Input
            value={fila.detalle}
            placeholder={fila.titulo ? `${fila.titulo} del día` : 'Detalle'}
            aria-label={fila.titulo || `Detalle de la fila ${indice + 1}`}
            onChange={(event) =>
              cambiar(indice, { detalle: event.target.value })
            }
          />
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            aria-label={`Quitar ${fila.titulo || 'fila'}`}
            disabled={filas.length === 1}
            onClick={() => onChange(filas.filter((_, i) => i !== indice))}
          >
            <X />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='justify-self-start'
        onClick={() => onChange([...filas, { titulo: '', detalle: '' }])}
      >
        <Plus />
        Agregar fila
      </Button>
    </div>
  )
}

function MenuMarkdownItem({
  value,
  onChange,
  label,
  className,
  children,
}: {
  value: string
  onChange: (valor: string) => void
  label: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const switchId = useId()
  const [conPlantilla, setConPlantilla] = useState(() => !!leerFilas(value))
  const filas = conPlantilla ? leerFilas(value) : null

  function cambiarPlantilla(activa: boolean) {
    setConPlantilla(activa)
    if (activa && !leerFilas(value)) {
      const texto = value.trim()
      onChange(
        componerFilas(
          texto
            ? [...FILAS_PLANTILLA, { titulo: 'Nota', detalle: texto }]
            : FILAS_PLANTILLA
        )
      )
    }
    if (!activa && leerFilas(value)?.every(({ detalle }) => !detalle.trim())) {
      onChange('')
    }
  }

  return (
    <FormItem className={className}>
      <div className='flex items-center justify-between gap-2'>
        <FormLabel>{label}</FormLabel>
        <div className='flex items-center gap-2'>
          <Switch
            id={switchId}
            size='sm'
            checked={conPlantilla}
            onCheckedChange={cambiarPlantilla}
          />
          <Label
            htmlFor={switchId}
            className='text-xs font-normal text-muted-foreground'
          >
            Usar plantilla
          </Label>
        </div>
      </div>
      {filas ? (
        <FilasEditor
          filas={filas}
          onChange={(nuevas) => onChange(componerFilas(nuevas))}
        />
      ) : (
        children
      )}
      <FormMessage />
    </FormItem>
  )
}
