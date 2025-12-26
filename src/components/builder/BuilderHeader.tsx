import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { KernelAILogo } from '@/components/brand/KernelAILogo';
import { 
  Save, Code2, Globe, MoreVertical, Settings, Copy, Home
} from 'lucide-react';

interface BuilderHeaderProps {
  projectId: string;
  projectName?: string;
  isPublic?: boolean;
  onSave: () => void;
  onOpenSettings: () => void;
  onOpenRemix: () => void;
}

export const BuilderHeader = memo(function BuilderHeader({
  projectId,
  projectName,
  isPublic,
  onSave,
  onOpenSettings,
  onOpenRemix,
}: BuilderHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {/* Home/Logo Link */}
        <KernelAILogo size="xs" interactive to="/" />
        
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/builder" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Code2 className="h-4 w-4" />
                  Builder
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium flex items-center gap-2">
                {projectName}
                {isPublic && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Collaborator Avatars */}
        <CollaboratorAvatars projectId={projectId} />
        
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenRemix}>
              <Copy className="h-4 w-4 mr-2" />
              Remix Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
