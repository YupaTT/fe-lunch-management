import { format, isValid, parseISO } from 'date-fns'
import { type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/date-picker'
import { PasswordInput } from '@/components/password-input'

type BaseFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: React.ReactNode
  description?: React.ReactNode
  className?: string
}

type ControlledProps =
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onBlur'
  | 'ref'
  | 'className'

function FieldShell({
  label,
  description,
  className,
  children,
}: {
  label: React.ReactNode
  description?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      {children}
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}

type InputFieldProps<T extends FieldValues> = BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Input>, ControlledProps>

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: InputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <FormControl>
            <Input {...inputProps} {...field} />
          </FormControl>
        </FieldShell>
      )}
    />
  )
}

type PasswordFieldProps<T extends FieldValues> = BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof PasswordInput>, ControlledProps>

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: PasswordFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <FormControl>
            <PasswordInput placeholder='********' {...inputProps} {...field} />
          </FormControl>
        </FieldShell>
      )}
    />
  )
}

type TextareaFieldProps<T extends FieldValues> = BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Textarea>, ControlledProps>

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...textareaProps
}: TextareaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <FormControl>
            <Textarea {...textareaProps} {...field} />
          </FormControl>
        </FieldShell>
      )}
    />
  )
}

type SelectOption = { label: string; value: string }

type SelectFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder = 'Seleccione una opción',
  disabled,
  isLoading,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger className='w-full' onBlur={field.onBlur}>
                <SelectValue
                  placeholder={isLoading ? 'Cargando...' : placeholder}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      )}
    />
  )
}

// El formulario guarda la fecha como texto yyyy-MM-dd (así la espera el backend)
function toDate(value: unknown) {
  const date = parseISO(String(value ?? ''))
  return isValid(date) ? date : undefined
}

type DateFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  placeholder?: string
  disabled?: boolean
}

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  placeholder,
  disabled,
}: DateFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <FormControl>
            <DatePicker
              selected={toDate(field.value)}
              onSelect={(date) =>
                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
              }
              onBlur={field.onBlur}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
        </FieldShell>
      )}
    />
  )
}

type TimeFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  disabled?: boolean
}

// El formulario guarda la hora como texto HH:mm
export function TimeField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: TimeFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <FormControl>
            <Input
              type='time'
              disabled={disabled}
              className='appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
              {...field}
            />
          </FormControl>
        </FieldShell>
      )}
    />
  )
}

type RadioGroupFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  options: SelectOption[]
  disabled?: boolean
}

export function RadioGroupField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  options,
  disabled,
}: RadioGroupFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell
          label={label}
          description={description}
          className={className}
        >
          <FormControl>
            <RadioGroup
              value={field.value ?? ''}
              onValueChange={field.onChange}
              disabled={disabled}
              className='flex flex-col gap-2'
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className='flex items-center gap-2'
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className='font-normal'>{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
        </FieldShell>
      )}
    />
  )
}

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
}

export function SubmitButton({
  loading,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type='submit' disabled={disabled || loading} {...props}>
      {loading && <Loader2 className='animate-spin' />}
      {children}
    </Button>
  )
}
