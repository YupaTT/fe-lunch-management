import * as React from 'react'
import { format } from 'date-fns'
import { cn } from 'cn'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = Omit<React.ComponentProps<'button'>, 'onSelect'> & {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Seleccione una fecha',
  className,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          data-empty={!selected}
          className={cn(
            'w-full justify-start rounded-3xl border-transparent bg-input/50 px-3 text-start font-normal hover:bg-input/50 data-[empty=true]:text-muted-foreground dark:bg-input/50 dark:hover:bg-input/50',
            className
          )}
          {...props}
        >
          {selected ? (
            format(selected, 'dd/MM/yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          locale={es}
          captionLayout='dropdown'
          defaultMonth={selected}
          startMonth={new Date(1900, 0)}
          endMonth={new Date()}
          selected={selected}
          onSelect={(date) => {
            onSelect(date)
            setOpen(false)
          }}
          disabled={(date: Date) =>
            date > new Date() || date < new Date('1900-01-01')
          }
        />
      </PopoverContent>
    </Popover>
  )
}
