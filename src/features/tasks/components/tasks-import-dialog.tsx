import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/form-dialog'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file.',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      'Please upload csv format.'
    ),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = () => {
    const file = form.getValues('file')

    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      }
      showSubmittedData(fileDetails, 'You have imported the following file:')
    }
    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
      title='Import Tasks'
      description='Import tasks quickly from a CSV file.'
      formId='task-import-form'
      submitText='Import'
      cancelText='Close'
      className='gap-2 sm:max-w-sm'
    >
      <Form {...form}>
        <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='file'
            render={() => (
              <FormItem className='my-2'>
                <FormLabel>File</FormLabel>
                <FormControl>
                  <Input
                    type='file'
                    accept='text/csv'
                    {...fileRef}
                    className='h-8 py-0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormDialog>
  )
}
