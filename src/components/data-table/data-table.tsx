import { type Table as TanstackTable, flexRender } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type DataTableProps<TData> = {
  table: TanstackTable<TData>
  isLoading?: boolean
  isFetching?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  className?: string
}

export function DataTable<TData>({
  table,
  isLoading,
  isFetching,
  error,
  onRetry,
  emptyMessage = 'No hay resultados.',
  className,
}: DataTableProps<TData>) {
  const colSpan = table.getVisibleLeafColumns().length
  const rows = table.getRowModel().rows

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border transition-opacity',
        isFetching && !isLoading && 'opacity-60'
      )}
    >
      <Table className={className}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn(
                    header.column.columnDef.meta?.className,
                    header.column.columnDef.meta?.thClassName
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: table.getState().pagination.pageSize }).map(
              (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              )
            )
          ) : error ? (
            <TableRow>
              <TableCell colSpan={colSpan} className='h-24 text-center'>
                <p className='text-destructive'>{error}</p>
                {onRetry && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={onRetry}
                  >
                    Reintentar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.columnDef.meta?.className,
                      cell.column.columnDef.meta?.tdClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className='h-24 text-center text-muted-foreground'
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
