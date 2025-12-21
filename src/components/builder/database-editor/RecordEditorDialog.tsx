import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TableSchema, ColumnSchema } from '@/types/database-editor';

interface RecordEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: TableSchema | undefined;
  record?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

// Generate Zod schema from column definitions
function generateZodSchema(columns: ColumnSchema[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  columns.forEach((col) => {
    // Skip auto-generated fields
    if (col.name === 'id' && col.defaultValue?.includes('gen_random_uuid')) return;
    if (col.name === 'created_at' || col.name === 'updated_at') return;

    let fieldSchema: z.ZodTypeAny;

    const baseType = col.type.toLowerCase();

    if (baseType.includes('bool')) {
      fieldSchema = z.boolean();
    } else if (baseType.includes('int') || baseType.includes('numeric') || baseType.includes('decimal')) {
      fieldSchema = z.coerce.number();
    } else if (baseType.includes('json')) {
      fieldSchema = z.string().refine((val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, 'Invalid JSON');
    } else {
      fieldSchema = z.string();
    }

    if (col.nullable) {
      fieldSchema = fieldSchema.optional().nullable();
    }

    shape[col.name] = fieldSchema;
  });

  return z.object(shape);
}

export function RecordEditorDialog({
  open,
  onOpenChange,
  schema,
  record,
  onSave,
}: RecordEditorDialogProps) {
  const isEditing = !!record;
  const columns = schema?.columns || [];

  // Filter out auto-generated columns
  const editableColumns = columns.filter(
    (col) =>
      !(col.name === 'id' && col.defaultValue?.includes('gen_random_uuid')) &&
      col.name !== 'created_at' &&
      col.name !== 'updated_at'
  );

  const zodSchema = generateZodSchema(columns);

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: record || {},
  });

  useEffect(() => {
    if (record) {
      // Convert JSON objects to strings for editing
      const formValues: Record<string, unknown> = {};
      editableColumns.forEach((col) => {
        const value = record[col.name];
        if (col.type.toLowerCase().includes('json') && value) {
          formValues[col.name] = JSON.stringify(value, null, 2);
        } else {
          formValues[col.name] = value;
        }
      });
      form.reset(formValues);
    } else {
      form.reset({});
    }
  }, [record, form, editableColumns]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Convert JSON strings back to objects
    const processedData: Record<string, unknown> = {};
    editableColumns.forEach((col) => {
      const value = data[col.name];
      if (col.type.toLowerCase().includes('json') && typeof value === 'string' && value) {
        try {
          processedData[col.name] = JSON.parse(value);
        } catch {
          processedData[col.name] = value;
        }
      } else {
        processedData[col.name] = value;
      }
    });

    await onSave(processedData);
    form.reset();
  };

  const renderField = (column: ColumnSchema) => {
    const baseType = column.type.toLowerCase();

    return (
      <FormField
        key={column.name}
        control={form.control}
        name={column.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {column.name}
              {!column.nullable && <span className="text-destructive">*</span>}
              <span className="text-xs text-muted-foreground font-normal">
                ({column.type})
              </span>
            </FormLabel>
            <FormControl>
              {baseType.includes('bool') ? (
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              ) : baseType.includes('json') || baseType === 'text' ? (
                <Textarea
                  {...field}
                  value={(field.value as string) || ''}
                  placeholder={column.nullable ? 'null' : ''}
                  className="font-mono text-sm min-h-[80px]"
                />
              ) : baseType.includes('int') || baseType.includes('numeric') ? (
                <Input
                  {...field}
                  type="number"
                  value={(field.value as number) ?? ''}
                  placeholder={column.nullable ? 'null' : '0'}
                />
              ) : (
                <Input
                  {...field}
                  value={(field.value as string) || ''}
                  placeholder={column.nullable ? 'null' : ''}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Record' : 'Add New Record'}
            {schema && (
              <span className="text-muted-foreground font-normal ml-2">
                in {schema.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-4 py-2">
                {editableColumns.map(renderField)}
              </div>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Record'
                  : 'Create Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
