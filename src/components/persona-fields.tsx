import { type Control, type FieldPath } from 'react-hook-form'
import {
  generoOptions,
  type PersonaFormValues,
  tipoDocumentoOptions,
} from '@/lib/persona'
import { DateField, InputField, SelectField } from '@/components/form-fields'

type PersonaFieldsProps<T extends { persona: PersonaFormValues }> = {
  control: Control<T>
  generoRequerido?: boolean
}

export function PersonaFields<T extends { persona: PersonaFormValues }>({
  control,
  generoRequerido,
}: PersonaFieldsProps<T>) {
  const name = (field: keyof PersonaFormValues) =>
    `persona.${field}` as FieldPath<T>

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <InputField
        control={control}
        name={name('nombres')}
        label='Nombres'
        className='sm:col-span-2'
      />
      <InputField
        control={control}
        name={name('primerApellido')}
        label='Apellido paterno'
      />
      <InputField
        control={control}
        name={name('segundoApellido')}
        label='Apellido materno'
      />
      <SelectField
        control={control}
        name={name('tipoDocumento')}
        label='Tipo de documento'
        options={tipoDocumentoOptions}
      />
      <InputField
        control={control}
        name={name('nroDocumento')}
        label='Nro. de documento'
      />
      <SelectField
        control={control}
        name={name('genero')}
        label={generoRequerido ? 'Género' : 'Género (opcional)'}
        options={generoOptions}
      />
      <DateField
        control={control}
        name={name('fechaNacimiento')}
        label='Fecha de nacimiento (opcional)'
      />
    </div>
  )
}
