import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatabaseExplorer } from '@/hooks/useDatabaseExplorer';
import { useTableRecords } from '@/hooks/useTableRecords';
import { useSecurityScan } from '@/hooks/useSecurityScan';
import { useExternalSupabase } from '@/hooks/useExternalSupabase';
import {
  TableListSidebar,
  SchemaViewer,
  DataGridEditor,
  RelationshipDiagram,
} from './database-editor';
import type { DatabaseEditorTab } from '@/types/database-editor';
import { Database, Table2, GitFork, Shield, AlertTriangle, CheckCircle, RefreshCw, Cloud, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ExtendedTab = DatabaseEditorTab | 'security';

export function DatabasePanel() {
  const { connections, isLoading: isLoadingConnections } = useExternalSupabase();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('cloud');
  
  // Find selected external connection
  const externalConnection = selectedConnectionId !== 'cloud' 
    ? connections.find(c => c.id === selectedConnectionId)
    : null;
  
  const externalParams = externalConnection ? {
    url: externalConnection.supabase_url,
    key: externalConnection.supabase_service_role_key || externalConnection.supabase_anon_key,
  } : null;

  const {
    tables,
    groupedTables,
    selectedTable,
    activeTab,
    searchQuery,
    relationships,
    isLoadingTables,
    isLoadingRelationships,
    isExternal,
    setSearchQuery,
    selectTable,
    setActiveTab,
    refetchTables,
  } = useDatabaseExplorer({ externalConnection: externalParams });

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

  const {
    scanResult,
    isScanning,
    lastScannedAt,
    runScan,
    getTableFindings,
    getSeverityCount,
  } = useSecurityScan();

  const severityCounts = getSeverityCount();
  const tableFindings = selectedTable ? getTableFindings(selectedTable) : [];
  const hasIssues = severityCounts.critical > 0 || severityCounts.high > 0;

  const handleTabChange = (value: string) => {
    if (value === 'security') {
      // Keep this tab local
    } else {
      setActiveTab(value as DatabaseEditorTab);
    }
  };

  const handleConnectionChange = (value: string) => {
    setSelectedConnectionId(value);
    // Reset selected table when switching connections
    selectTable('');
  };

  const currentTab = activeTab as ExtendedTab;

  return (
    <div className="h-full flex flex-col">
      {/* Connection Selector */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" />
          <span>Connection:</span>
        </div>
        <Select 
          value={selectedConnectionId} 
          onValueChange={handleConnectionChange}
          disabled={isLoadingConnections}
        >
          <SelectTrigger className="w-[220px] h-8">
            <SelectValue placeholder="Select connection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cloud">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
                <span>Lovable Cloud</span>
              </div>
            </SelectItem>
            {connections.filter(c => c.is_active).map((conn) => (
              <SelectItem key={conn.id} value={conn.id}>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-orange-500" />
                  <span>{conn.project_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isExternal && (
          <Badge variant="secondary" className="text-xs">
            External Database
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetchTables()}
          disabled={isLoadingTables}
          className="ml-auto"
        >
          <RefreshCw className={cn("h-4 w-4", isLoadingTables && "animate-spin")} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
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
              value={currentTab}
              onValueChange={handleTabChange}
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
                  {!isExternal && (
                    <TabsTrigger value="security" className="gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Security
                      {tableFindings.length > 0 && (
                        <Badge 
                          variant={tableFindings.some(f => f.severity === 'critical' || f.severity === 'high') ? 'destructive' : 'secondary'}
                          className="ml-1 h-5 px-1.5 text-xs"
                        >
                          {tableFindings.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  )}
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

              {!isExternal && (
                <TabsContent value="security" className="flex-1 m-0">
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Security Analysis: {selectedTable}
                        </h3>
                        {lastScannedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last scanned: {new Date(lastScannedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runScan()}
                        disabled={isScanning}
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isScanning && "animate-spin")} />
                        {isScanning ? 'Scanning...' : 'Run Scan'}
                      </Button>
                    </div>

                    {/* Findings */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        {!scanResult ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No scan results</p>
                            <p className="text-sm mt-1">Run a security scan to analyze RLS policies</p>
                          </div>
                        ) : tableFindings.length === 0 ? (
                          <div className="text-center py-12">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <p className="font-medium text-green-600">No issues found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              This table has proper RLS policies configured
                            </p>
                          </div>
                        ) : (
                          tableFindings.map((finding) => (
                            <div
                              key={finding.id}
                              className={cn(
                                "p-4 rounded-lg border",
                                finding.severity === 'critical' && "border-red-500/50 bg-red-500/5",
                                finding.severity === 'high' && "border-orange-500/50 bg-orange-500/5",
                                finding.severity === 'medium' && "border-yellow-500/50 bg-yellow-500/5",
                                finding.severity === 'low' && "border-blue-500/50 bg-blue-500/5",
                                finding.severity === 'info' && "border-border bg-muted/30"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <AlertTriangle className={cn(
                                  "h-5 w-5 flex-shrink-0 mt-0.5",
                                  finding.severity === 'critical' && "text-red-500",
                                  finding.severity === 'high' && "text-orange-500",
                                  finding.severity === 'medium' && "text-yellow-500",
                                  finding.severity === 'low' && "text-blue-500",
                                  finding.severity === 'info' && "text-muted-foreground"
                                )} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={
                                      finding.severity === 'critical' ? 'destructive' :
                                      finding.severity === 'high' ? 'destructive' :
                                      finding.severity === 'medium' ? 'secondary' :
                                      'outline'
                                    }>
                                      {finding.severity.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {finding.category.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <h4 className="font-medium">{finding.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {finding.description}
                                  </p>
                                  {finding.remediation && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Suggested Fix:
                                      </p>
                                      <pre className="text-xs overflow-x-auto">
                                        <code>{finding.remediation}</code>
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
              <Database className="h-12 w-12 mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-1">Database Explorer</h3>
              <p className="text-sm">
                {isExternal 
                  ? `Connected to ${externalConnection?.project_name}. Select a table to explore.`
                  : 'Select a table from the sidebar to view and edit data'
                }
              </p>
              
              {/* Quick Security Overview */}
              {!isExternal && scanResult && hasIssues && (
                <div className="mt-6 p-4 rounded-lg border border-orange-500/50 bg-orange-500/5 max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Security Issues Detected</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    {severityCounts.critical > 0 && (
                      <span className="text-red-500">{severityCounts.critical} critical</span>
                    )}
                    {severityCounts.high > 0 && (
                      <span className="text-orange-500">{severityCounts.high} high</span>
                    )}
                    {severityCounts.medium > 0 && (
                      <span className="text-yellow-500">{severityCounts.medium} medium</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => runScan()}
                    disabled={isScanning}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isScanning && "animate-spin")} />
                    Re-scan Database
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
