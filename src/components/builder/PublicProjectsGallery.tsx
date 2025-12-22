import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Folder, 
  Clock, 
  Copy, 
  Globe, 
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { builderService } from '@/services/builderService';
import { useRemixProject } from '@/hooks/useRemixProject';
import { PROJECT_TEMPLATES } from '@/lib/projectTemplates';
import { RemixProjectDialog } from '@/components/dialogs/RemixProjectDialog';
import { GlowSkeleton } from '@/components/ui/glow-skeleton';
import type { BuilderProject } from '@/types/builder';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

export function PublicProjectsGallery() {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Use consolidated remix hook
  const {
    isDialogOpen: remixDialogOpen,
    projectToRemix,
    fileCount: remixFileCount,
    isLoadingFileCount: isFetchingFileCount,
    isRemixing,
    openRemixDialog,
    closeRemixDialog,
    handleRemix,
  } = useRemixProject();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const { projects: data, totalCount: count } = await builderService.getPublicProjects({
        search: debouncedSearch,
        template: templateFilter,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });
      setProjects(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to fetch public projects:', error);
      toast.error('Failed to load community projects');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, templateFilter, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, templateFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const templateOptions = [
    { id: 'all', name: 'All Templates' },
    ...PROJECT_TEMPLATES.map(t => ({ id: t.id, name: t.name })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Community Projects</h2>
          <p className="text-sm text-muted-foreground">
            Discover and remix public projects from the community
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by template" />
          </SelectTrigger>
          <SelectContent>
            {templateOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <GlowSkeleton className="h-10 w-10 rounded-lg" />
                <GlowSkeleton className="h-5 w-32 mt-3" />
                <GlowSkeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <GlowSkeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No public projects found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery || templateFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share a project with the community!'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const template = PROJECT_TEMPLATES.find(t => t.id === project.template);
              return (
                <Card
                  key={project.id}
                  className="group hover:border-primary/50 transition-colors relative"
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
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-3 line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || template?.name || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={(e) => openRemixDialog(project, e)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Remix This Project
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Remix Dialog */}
      <RemixProjectDialog
        open={remixDialogOpen}
        onOpenChange={(open) => !open && closeRemixDialog()}
        sourceProject={projectToRemix}
        fileCount={remixFileCount}
        isLoadingFileCount={isFetchingFileCount}
        onRemix={handleRemix}
        isRemixing={isRemixing}
      />
    </div>
  );
}
