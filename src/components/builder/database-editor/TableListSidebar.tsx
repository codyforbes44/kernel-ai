import { Search, Database, Shield, Table2, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { TableInfo } from '@/types/database-editor';

interface TableGroup {
  label: string;
  tables: TableInfo[];
}

interface TableListSidebarProps {
  tables: TableInfo[];
  groupedTables: Record<string, TableInfo[]>;
  selectedTable: string | null;
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onSelectTable: (tableName: string) => void;
}

const GROUP_LABELS: Record<string, { label: string; icon: string }> = {
  user: { label: 'User Data', icon: '👤' },
  builder: { label: 'Builder', icon: '🔨' },
  marketplace: { label: 'Marketplace', icon: '🛒' },
  github: { label: 'GitHub', icon: '🔗' },
  billing: { label: 'Billing', icon: '💳' },
  auth: { label: 'Authentication', icon: '🔐' },
  other: { label: 'Other', icon: '📁' },
};

export function TableListSidebar({
  tables,
  groupedTables,
  selectedTable,
  searchQuery,
  isLoading,
  onSearchChange,
  onSelectTable,
}: TableListSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['user', 'builder'])
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const groups: TableGroup[] = Object.entries(groupedTables)
    .filter(([_, tables]) => tables.length > 0)
    .map(([key, tables]) => ({
      label: GROUP_LABELS[key]?.label || key,
      tables,
    }));

  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Database</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {tables.length} tables
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : searchQuery ? (
            // Flat list when searching
            <div className="space-y-0.5">
              {tables
                .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(table => (
                  <TableItem
                    key={table.name}
                    table={table}
                    isSelected={selectedTable === table.name}
                    onClick={() => onSelectTable(table.name)}
                  />
                ))}
            </div>
          ) : (
            // Grouped list
            <div className="space-y-1">
              {groups.map(group => (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedGroups.has(group.label) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    <span>{group.label}</span>
                    <span className="ml-auto text-xs opacity-50">
                      {group.tables.length}
                    </span>
                  </button>
                  {expandedGroups.has(group.label) && (
                    <div className="ml-3 space-y-0.5">
                      {group.tables.map(table => (
                        <TableItem
                          key={table.name}
                          table={table}
                          isSelected={selectedTable === table.name}
                          onClick={() => onSelectTable(table.name)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function TableItem({
  table,
  isSelected,
  onClick,
}: {
  table: TableInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors text-left',
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted text-foreground'
      )}
    >
      <Table2 className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
      <span className="truncate flex-1">{table.name}</span>
      {table.hasRLS && (
        <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
      )}
    </button>
  );
}
