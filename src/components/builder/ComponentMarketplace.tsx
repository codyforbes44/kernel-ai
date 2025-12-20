import { useState } from 'react';
import { Package, Search, Heart, Download, Plus, Loader2, ExternalLink, Code, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMarketplace } from '@/hooks/useMarketplace';
import { COMPONENT_CATEGORIES, type ComponentCategory, type MarketplaceComponent } from '@/types/marketplace';
import { cn } from '@/lib/utils';

interface ComponentMarketplaceProps {
  projectId: string;
  onInstallComponent?: (code: string, name: string) => void;
}

export function ComponentMarketplace({ projectId, onInstallComponent }: ComponentMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | undefined>();
  const [activeTab, setActiveTab] = useState('browse');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [previewComponent, setPreviewComponent] = useState<MarketplaceComponent | null>(null);
  
  // Publish form state
  const [publishForm, setPublishForm] = useState({
    name: '',
    description: '',
    category: 'ui' as ComponentCategory,
    tags: '',
    code: '',
  });

  const {
    components,
    myComponents,
    isLoading,
    isLoadingMy,
    publishComponent,
    isPublishing,
    installComponent,
    isInstalling,
    toggleLike,
    deleteComponent,
  } = useMarketplace({ projectId, category: selectedCategory, searchQuery });

  const handleInstall = async (component: MarketplaceComponent) => {
    const result = await installComponent(component.id);
    if (result && onInstallComponent) {
      onInstallComponent(result.code, result.name);
    }
  };

  const handlePublish = async () => {
    await publishComponent({
      name: publishForm.name,
      description: publishForm.description,
      category: publishForm.category,
      tags: publishForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      code: publishForm.code,
      is_public: true,
      version: '1.0.0',
      preview_image_url: null,
      dependencies: [],
      props_schema: {},
    });
    setShowPublishDialog(false);
    setPublishForm({ name: '', description: '', category: 'ui', tags: '', code: '' });
  };

  const renderComponentCard = (component: MarketplaceComponent, showActions = true) => (
    <Card key={component.id} className="overflow-hidden">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm truncate">{component.name}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              {component.description || 'No description'}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {component.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {/* Tags */}
        {component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {component.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 bg-muted rounded">
                {tag}
              </span>
            ))}
            {component.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{component.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {component.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Heart className={cn('h-3 w-3', component.is_liked && 'fill-current text-red-500')} />
            {component.likes}
          </span>
          <span className="ml-auto">v{component.version}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => handleInstall(component)}
              disabled={isInstalling || component.is_installed}
              className="flex-1 gap-1"
            >
              {isInstalling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : component.is_installed ? (
                <>Installed</>
              ) : (
                <>
                  <Download className="h-3 w-3" />
                  Install
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewComponent(component)}
              className="gap-1"
            >
              <Code className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleLike({ componentId: component.id, isLiked: component.is_liked || false })}
            >
              <Heart className={cn('h-3 w-3', component.is_liked && 'fill-current text-red-500')} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Package className="h-4 w-4" />
        <h3 className="font-semibold text-sm">Component Marketplace</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-3">
          <TabsTrigger value="browse" className="flex-1">Browse</TabsTrigger>
          <TabsTrigger value="my" className="flex-1">My Components</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="flex-1 flex flex-col min-h-0 p-3 space-y-3">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="pl-9 h-8"
              />
            </div>
            <Select
              value={selectedCategory || 'all'}
              onValueChange={(v) => setSelectedCategory(v === 'all' ? undefined : v as ComponentCategory)}
            >
              <SelectTrigger className="w-[120px] h-8">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {COMPONENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Component List */}
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : components.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No components found</p>
                  <p className="text-xs">Be the first to publish one!</p>
                </div>
              ) : (
                components.map(component => renderComponentCard(component))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="my" className="flex-1 flex flex-col min-h-0 p-3 space-y-3">
          {/* Publish Button */}
          <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Publish Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Publish Component</DialogTitle>
                <DialogDescription>
                  Share your component with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={publishForm.name}
                      onChange={(e) => setPublishForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="MyComponent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={publishForm.category}
                      onValueChange={(v) => setPublishForm(p => ({ ...p, category: v as ComponentCategory }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPONENT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={publishForm.description}
                    onChange={(e) => setPublishForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="A reusable component that..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={publishForm.tags}
                    onChange={(e) => setPublishForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="button, animated, hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Component Code</Label>
                  <Textarea
                    id="code"
                    value={publishForm.code}
                    onChange={(e) => setPublishForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="export function MyComponent() { ... }"
                    className="font-mono text-sm min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePublish} disabled={isPublishing || !publishForm.name || !publishForm.code}>
                  {isPublishing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* My Components List */}
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {isLoadingMy ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : myComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No components published</p>
                  <p className="text-xs">Share your first component!</p>
                </div>
              ) : (
                myComponents.map(component => (
                  <Card key={component.id}>
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{component.name}</CardTitle>
                        <Badge variant={component.is_public ? 'default' : 'secondary'}>
                          {component.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span><Download className="inline h-3 w-3" /> {component.downloads}</span>
                        <span><Heart className="inline h-3 w-3" /> {component.likes}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewComponent(component)}
                          className="flex-1 gap-1"
                        >
                          <Code className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteComponent(component.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Code Preview Dialog */}
      <Dialog open={!!previewComponent} onOpenChange={() => setPreviewComponent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewComponent?.name}</DialogTitle>
            <DialogDescription>{previewComponent?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
              <code>{previewComponent?.code}</code>
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewComponent(null)}>
              Close
            </Button>
            {previewComponent && !previewComponent.is_installed && (
              <Button onClick={() => {
                handleInstall(previewComponent);
                setPreviewComponent(null);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
