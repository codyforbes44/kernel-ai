import { Key, Link2, Hash, Type, Calendar, FileJson, ToggleLeft, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TableSchema, ColumnSchema } from '@/types/database-editor';
import { cn } from '@/lib/utils';

interface SchemaViewerProps {
  schema: TableSchema | undefined;
  isLoading: boolean;
}

const TYPE_ICONS: Record<string, typeof Type> = {
  uuid: Key,
  text: Type,
  varchar: Type,
  integer: Hash,
  bigint: Hash,
  boolean: ToggleLeft,
  jsonb: FileJson,
  json: FileJson,
  timestamptz: Calendar,
  timestamp: Calendar,
  date: Calendar,
};

const TYPE_COLORS: Record<string, string> = {
  uuid: 'text-purple-500',
  text: 'text-blue-500',
  varchar: 'text-blue-500',
  integer: 'text-orange-500',
  bigint: 'text-orange-500',
  boolean: 'text-green-500',
  jsonb: 'text-yellow-500',
  json: 'text-yellow-500',
  timestamptz: 'text-cyan-500',
  timestamp: 'text-cyan-500',
  date: 'text-cyan-500',
};

export function SchemaViewer({ schema, isLoading }: SchemaViewerProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <p>No schema information available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Table Info */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="font-mono">{schema.name}</span>
              <Badge variant="outline" className="ml-2">
                {schema.columns.length} columns
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Columns */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Columns</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {schema.columns.map((column) => (
                <ColumnRow key={column.name} column={column} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Primary Keys */}
        {schema.primaryKey.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" />
                Primary Key
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex flex-wrap gap-2">
                {schema.primaryKey.map((key) => (
                  <Badge key={key} variant="secondary" className="font-mono">
                    {key}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* RLS Policies */}
        {schema.rlsPolicies.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">RLS Policies</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {schema.rlsPolicies.map((policy, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{policy.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {policy.command}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {policy.definition}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

function ColumnRow({ column }: { column: ColumnSchema }) {
  const baseType = column.type.split('(')[0].split(' ')[0].toLowerCase();
  const Icon = TYPE_ICONS[baseType] || Type;
  const colorClass = TYPE_COLORS[baseType] || 'text-muted-foreground';

  return (
    <div className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors">
      {/* Column Name & Type */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon className={cn('h-4 w-4 flex-shrink-0', colorClass)} />
        <span className="font-mono text-sm truncate">{column.name}</span>
      </div>

      {/* Type Badge */}
      <Badge variant="secondary" className="font-mono text-xs flex-shrink-0">
        {column.type}
      </Badge>

      {/* Indicators */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {column.isPrimaryKey && (
          <Badge className="bg-purple-500/10 text-purple-500 text-xs">PK</Badge>
        )}
        {column.isForeignKey && (
          <Badge className="bg-blue-500/10 text-blue-500 text-xs flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            FK
          </Badge>
        )}
        {!column.nullable && (
          <Badge variant="outline" className="text-xs">NOT NULL</Badge>
        )}
      </div>

      {/* Foreign Key Reference */}
      {column.isForeignKey && column.foreignTable && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          → {column.foreignTable}.{column.foreignColumn}
        </span>
      )}
    </div>
  );
}
