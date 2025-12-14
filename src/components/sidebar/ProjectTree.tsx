import { useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectTreeProps {
  searchQuery: string;
}

export function ProjectTree({ searchQuery }: ProjectTreeProps) {
  const { projects, currentProject, setCurrentProject, createProject } = useWorkspace();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Projects
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-sidebar-accent"
          onClick={() => createProject("New Project")}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="px-2 py-4 text-center">
          <p className="text-sm text-muted-foreground">No projects yet</p>
          <Button
            variant="link"
            size="sm"
            className="text-primary"
            onClick={() => createProject("My First Project")}
          >
            Create your first project
          </Button>
        </div>
      ) : (
        filteredProjects.map((project) => {
          const isExpanded = expandedProjects.has(project.id);
          const isActive = currentProject?.id === project.id;

          return (
            <Collapsible
              key={project.id}
              open={isExpanded}
              onOpenChange={() => toggleProject(project.id)}
            >
              <div
                className={cn(
                  "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer",
                  "hover:bg-sidebar-accent transition-colors",
                  isActive && "bg-sidebar-accent"
                )}
                onClick={() => {
                  setCurrentProject(project);
                  if (!isExpanded) toggleProject(project.id);
                }}
              >
                <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <span className="text-base">{project.icon || "📁"}</span>

                <span
                  className={cn(
                    "flex-1 text-sm truncate",
                    isActive && "font-medium"
                  )}
                >
                  {project.name}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent className="pl-6">
                {/* Conversations for this project would go here */}
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}
    </div>
  );
}
