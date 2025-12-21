import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabaseExplorer } from '@/hooks/useDatabaseExplorer';
import { useTableRecords } from '@/hooks/useTableRecords';
import {
  TableListSidebar,
  SchemaViewer,
  DataGridEditor,
  RelationshipDiagram,
} from './database-editor';
import type { DatabaseEditorTab } from '@/types/database-editor';
import { Database, Table2, GitFork } from 'lucide-react';

export function DatabasePanel() {
  const {
    tables,
    groupedTables,
    selectedTable,
    activeTab,
    searchQuery,
    relationships,
    isLoadingTables,
    isLoadingRelationships,
    setSearchQuery,
    selectTable,
    setActiveTab,
  } = useDatabaseExplorer();

  const {
    records,
    total,
    page,
    pageSize,
    totalPages,
    sortColumn,
    sortDirection,
    selectedRows,
    search,
    schema,
    isLoadingRecords,
    isLoadingSchema,
    isDeleting,
    setPage,
    setPageSize,
    handleSort,
    setSearch,
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    insertRecord,
    updateRecord,
    deleteRecord,
    bulkDeleteRecords,
    refetchRecords,
    exportJSON,
    exportCSV,
  } = useTableRecords({ tableName: selectedTable });

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <TableListSidebar
          tables={tables}
          groupedTables={groupedTables}
          selectedTable={selectedTable}
          searchQuery={searchQuery}
          isLoading={isLoadingTables}
          onSearchChange={setSearchQuery}
          onSelectTable={selectTable}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedTable ? (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as DatabaseEditorTab)}
            className="flex-1 flex flex-col"
          >
            <div className="border-b border-border bg-card px-4">
              <TabsList className="h-10">
                <TabsTrigger value="data" className="gap-1.5">
                  <Table2 className="h-3.5 w-3.5" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="schema" className="gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  Schema
                </TabsTrigger>
                <TabsTrigger value="relationships" className="gap-1.5">
                  <GitFork className="h-3.5 w-3.5" />
                  Relationships
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="data" className="flex-1 m-0">
              <DataGridEditor
                tableName={selectedTable}
                records={records}
                schema={schema}
                total={total}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                selectedRows={selectedRows}
                search={search}
                isLoading={isLoadingRecords}
                isDeleting={isDeleting}
                onSort={handleSort}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSearchChange={setSearch}
                onToggleRow={toggleRowSelection}
                onSelectAll={selectAllRows}
                onClearSelection={clearSelection}
                onInsert={async (data) => { await insertRecord(data); }}
                onUpdate={async (id, data) => { await updateRecord(id, data); }}
                onDelete={async (id) => { await deleteRecord(id); }}
                onBulkDelete={async (ids) => { await bulkDeleteRecords(ids); }}
                onRefresh={refetchRecords}
                onExportJSON={exportJSON}
                onExportCSV={exportCSV}
              />
            </TabsContent>

            <TabsContent value="schema" className="flex-1 m-0">
              <SchemaViewer schema={schema} isLoading={isLoadingSchema} />
            </TabsContent>

            <TabsContent value="relationships" className="flex-1 m-0">
              <RelationshipDiagram
                relationships={relationships}
                selectedTable={selectedTable}
                onSelectTable={selectTable}
                isLoading={isLoadingRelationships}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
            <Database className="h-12 w-12 mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">Database Explorer</h3>
            <p className="text-sm">Select a table from the sidebar to view and edit data</p>
          </div>
        )}
      </div>
    </div>
  );
}
