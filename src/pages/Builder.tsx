import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { useProtectedPage } from '@/hooks/useProtectedPage';
import { builderService } from '@/services/builderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Folder, Clock, ArrowRight, Code2, Sparkles, MoreHorizontal, Copy, ExternalLink, Trash2, Users, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { TemplatePicker } from '@/components/builder/TemplatePicker';
import { ProjectsGridSkeleton } from '@/components/builder/BuilderSkeletons';
import { PublicProjectsGallery } from '@/components/builder/PublicProjectsGallery';
import { PROJECT_TEMPLATES, ProjectTemplate } from '@/lib/projectTemplates';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO, getSoftwareApplicationSchema, SEO_CONFIG, BREADCRUMBS } from '@/lib/seo';
import { RemixProjectDialog } from '@/components/dialogs/RemixProjectDialog';
import { ImportProjectDialog } from '@/components/dialogs/ImportProjectDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BuilderProject } from '@/types/builder';

export default function Builder() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useProtectedPage();
  const { projects, createProject, createProjectFromFiles, remixProject, isRemixing, isLoading } = useBuilderProject();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>(PROJECT_TEMPLATES[0]);
  
  // Remix state
  const [remixDialogOpen, setRemixDialogOpen] = useState(false);
  const [projectToRemix, setProjectToRemix] = useState<BuilderProject | null>(null);
  const [remixFileCount, setRemixFileCount] = useState(0);
  const [isFetchingFileCount, setIsFetchingFileCount] = useState(false);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    createProject({ 
      name: newProjectName.trim(), 
      templateId: selectedTemplate.id 
    });
    setShowCreateDialog(false);
    setNewProjectName('');
    setSelectedTemplate(PROJECT_TEMPLATES[0]);
  };

  const handleOpenDialog = () => {
    setNewProjectName('');
    setSelectedTemplate(PROJECT_TEMPLATES[0]);
    setShowCreateDialog(true);
  };

  const handleOpenRemixDialog = useCallback(async (project: BuilderProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToRemix(project);
    setRemixFileCount(0);
    setRemixDialogOpen(true);
    
    // Fetch actual file count in background
    setIsFetchingFileCount(true);
    try {
      const files = await builderService.getFiles(project.id);
      setRemixFileCount(files.length);
    } catch (error) {
      console.error('Failed to fetch file count:', error);
    } finally {
      setIsFetchingFileCount(false);
    }
  }, []);

  const handleRemix = async (newName: string, includeKnowledgeBase: boolean) => {
    if (!projectToRemix) return;
    
    const result = await remixProject({
      sourceProjectId: projectToRemix.id,
      newName,
      includeKnowledgeBase,
    });
    
    setRemixDialogOpen(false);
    setProjectToRemix(null);
    
    // Navigate to the new project
    if (result?.project) {
      navigate(`/builder/${result.project.id}`);
    }
  };

  const handleImport = useCallback(async (
    name: string, 
    files: Array<{ path: string; name: string; content: string; type: 'file' | 'folder' }>
  ) => {
    setIsImporting(true);
    try {
      const result = await createProjectFromFiles({ name, files });
      setShowImportDialog(false);
      if (result) {
        navigate(`/builder/${result.id}`);
      }
    } finally {
      setIsImporting(false);
    }
  }, [createProjectFromFiles, navigate]);

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={PAGE_SEO.builder.title}
        description={PAGE_SEO.builder.description}
        ogImage={PAGE_SEO.builder.ogImage}
        structuredData={[
          getSoftwareApplicationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.builder(SEO_CONFIG.siteUrl)
        ]}
      />
      
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PageHeader
                title="App Builder"
                subtitle="Create and edit web applications"
                backLabel="Chat"
                className="border-0 p-0 bg-transparent"
              />
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center ml-2">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button onClick={handleOpenDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="my-projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-projects" className="gap-2">
              <Folder className="h-4 w-4" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            {isLoading ? (
              <ProjectsGridSkeleton count={6} />
            ) : projects.length === 0 ? (
              /* Empty State */
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Create your first project</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Build web applications with a visual editor, live preview, and AI-powered code generation.
                    </p>
                    <Button onClick={handleOpenDialog} size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Projects Grid */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const template = PROJECT_TEMPLATES.find(t => t.id === project.template);
                  return (
                    <Card
                      key={project.id}
                      className="group cursor-pointer hover:border-primary/50 transition-colors relative"
                      onClick={() => navigate(`/builder/${project.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ 
                              backgroundColor: template ? `${template.color}20` : 'hsl(var(--primary) / 0.1)'
                            }}
                          >
                            {template?.icon || <Folder className="h-5 w-5 text-primary" />}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => navigate(`/builder/${project.id}`)}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Project
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleOpenRemixDialog(project, e)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Remix Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="text-base mt-3">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || template?.name || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Create New Card */}
                <Card
                  className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={handleOpenDialog}
                >
                  <CardContent className="h-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">New Project</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="community">
            <PublicProjectsGallery />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Choose a template to get started quickly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My awesome project"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <TemplatePicker
                selectedId={selectedTemplate.id}
                onSelect={setSelectedTemplate}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remix Dialog */}
      <RemixProjectDialog
        open={remixDialogOpen}
        onOpenChange={setRemixDialogOpen}
        sourceProject={projectToRemix}
        fileCount={remixFileCount}
        isLoadingFileCount={isFetchingFileCount}
        onRemix={handleRemix}
        isRemixing={isRemixing}
      />

      {/* Import Dialog */}
      <ImportProjectDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
        isImporting={isImporting}
      />
    </div>
  );
}
