import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { useAuth } from '@/hooks/useAuth';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Folder, Clock, ArrowRight, Code2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { TemplatePicker } from '@/components/builder/TemplatePicker';
import { PROJECT_TEMPLATES, ProjectTemplate } from '@/lib/projectTemplates';

export default function Builder() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { projects, createProject, isLoading } = useBuilderProject();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>(PROJECT_TEMPLATES[0]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">App Builder</h1>
                <p className="text-sm text-muted-foreground">Create and edit web applications</p>
              </div>
            </div>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
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
                  className="group cursor-pointer hover:border-primary/50 transition-colors"
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
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
    </div>
  );
}
