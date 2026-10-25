import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Form } from '@/components/ui/form'
import {
  InputField,
  RadioGroupField,
  SelectField,
} from '@/components/form-fields'
import { FormSheet } from '@/components/form-sheet'
import { type Task } from '../data/schema'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  status: z.string().min(1, 'Please select a status.'),
  label: z.string().min(1, 'Please select a label.'),
  priority: z.string().min(1, 'Please choose a priority.'),
})
type TaskForm = z.infer<typeof formSchema>

const statusOptions = [
  { label: 'In Progress', value: 'in progress' },
  { label: 'Backlog', value: 'backlog' },
  { label: 'Todo', value: 'todo' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Done', value: 'done' },
]

const labelOptions = [
  { label: 'Documentation', value: 'documentation' },
  { label: 'Feature', value: 'feature' },
  { label: 'Bug', value: 'bug' },
]

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      title: '',
      status: '',
      label: '',
      priority: '',
    },
  })

  const onSubmit = (data: TaskForm) => {
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
      title={`${isUpdate ? 'Update' : 'Create'} Task`}
      description={`${
        isUpdate
          ? 'Update the task by providing necessary info.'
          : 'Add a new task by providing necessary info.'
      } Click save when you're done.`}
      formId='tasks-form'
      submitText='Save changes'
      cancelText='Close'
    >
      <Form {...form}>
        <form
          id='tasks-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <InputField
            control={form.control}
            name='title'
            label='Title'
            placeholder='Enter a title'
          />
          <SelectField
            control={form.control}
            name='status'
            label='Status'
            placeholder='Select dropdown'
            options={statusOptions}
          />
          <RadioGroupField
            control={form.control}
            name='label'
            label='Label'
            options={labelOptions}
          />
          <RadioGroupField
            control={form.control}
            name='priority'
            label='Priority'
            options={priorityOptions}
          />
        </form>
      </Form>
    </FormSheet>
  )
}
