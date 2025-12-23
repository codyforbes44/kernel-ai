import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Grid3X3,
  List,
  Heart,
  MoreVertical,
  Copy,
  Download,
  Trash2,
  Code,
  ExternalLink,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedAsset } from '@/hooks/useAIAssets';
import { formatDistanceToNow } from 'date-fns';

interface AssetLibraryProps {
  assets: GeneratedAsset[];
  isLoading: boolean;
  onSelectAsset: (asset: GeneratedAsset) => void;
  onCopyUrl: (url: string) => void;
  onDownload: (asset: GeneratedAsset) => void;
  onDelete: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
  getCodeSnippet: (asset: GeneratedAsset, format: 'jsx' | 'img' | 'bg') => string;
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'favorites';

export function AssetLibrary({
  assets,
  isLoading,
  onSelectAsset,
  onCopyUrl,
  onDownload,
  onDelete,
  onToggleFavorite,
  getCodeSnippet,
}: AssetLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (filterMode === 'favorites') {
      filtered = filtered.filter((a) => a.is_favorite);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.prompt.toLowerCase().includes(query) ||
          a.style.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [assets, searchQuery, filterMode]);

  const handleCopyCode = async (asset: GeneratedAsset, format: 'jsx' | 'img' | 'bg') => {
    const code = getCodeSnippet(asset, format);
    await navigator.clipboard.writeText(code);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filterMode === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterMode('all')}
        >
          All ({assets.length})
        </Button>
        <Button
          variant={filterMode === 'favorites' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilterMode('favorites')}
        >
          <Heart className="h-4 w-4 mr-1" />
          Favorites ({assets.filter((a) => a.is_favorite).length})
        </Button>
      </div>

      {/* Assets grid/list */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">No assets found</p>
          <p className="text-sm">
            {searchQuery ? 'Try a different search term' : 'Generate your first image above'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onSelect={() => onSelectAsset(asset)}
              onCopyUrl={() => onCopyUrl(asset.storage_url)}
              onDownload={() => onDownload(asset)}
              onDelete={() => onDelete(asset.id)}
              onToggleFavorite={() => onToggleFavorite(asset.id)}
              onCopyCode={(format) => handleCopyCode(asset, format)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map((asset) => (
            <AssetListItem
              key={asset.id}
              asset={asset}
              onSelect={() => onSelectAsset(asset)}
              onCopyUrl={() => onCopyUrl(asset.storage_url)}
              onDownload={() => onDownload(asset)}
              onDelete={() => onDelete(asset.id)}
              onToggleFavorite={() => onToggleFavorite(asset.id)}
              onCopyCode={(format) => handleCopyCode(asset, format)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AssetItemProps {
  asset: GeneratedAsset;
  onSelect: () => void;
  onCopyUrl: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopyCode: (format: 'jsx' | 'img' | 'bg') => void;
}

function AssetCard({
  asset,
  onSelect,
  onCopyUrl,
  onDownload,
  onDelete,
  onToggleFavorite,
  onCopyCode,
}: AssetItemProps) {
  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden border bg-muted/50',
        'hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer'
      )}
    >
      <div className="aspect-square" onClick={onSelect}>
        <img
          src={asset.storage_url}
          alt={asset.prompt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-xs text-white line-clamp-2">{asset.prompt}</p>
        </div>
      </div>

      {/* Favorite badge */}
      {asset.is_favorite && (
        <div className="absolute top-2 left-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      )}

      {/* Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AssetActions
          onCopyUrl={onCopyUrl}
          onDownload={onDownload}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onCopyCode={onCopyCode}
          isFavorite={asset.is_favorite}
        />
      </div>

      {/* Style badge */}
      <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
        {asset.style}
      </Badge>
    </div>
  );
}

function AssetListItem({
  asset,
  onSelect,
  onCopyUrl,
  onDownload,
  onDelete,
  onToggleFavorite,
  onCopyCode,
}: AssetItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg border bg-card',
        'hover:bg-accent transition-colors cursor-pointer'
      )}
    >
      <div className="h-16 w-16 rounded-md overflow-hidden shrink-0" onClick={onSelect}>
        <img
          src={asset.storage_url}
          alt={asset.prompt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0" onClick={onSelect}>
        <p className="text-sm font-medium line-clamp-1">{asset.prompt}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {asset.style}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      <AssetActions
        onCopyUrl={onCopyUrl}
        onDownload={onDownload}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        onCopyCode={onCopyCode}
        isFavorite={asset.is_favorite}
      />
    </div>
  );
}

function AssetActions({
  onCopyUrl,
  onDownload,
  onDelete,
  onToggleFavorite,
  onCopyCode,
  isFavorite,
}: {
  onCopyUrl: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopyCode: (format: 'jsx' | 'img' | 'bg') => void;
  isFavorite: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onToggleFavorite}>
          <Heart className={cn('h-4 w-4 mr-2', isFavorite && 'fill-current')} />
          {isFavorite ? 'Unfavorite' : 'Favorite'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyUrl}>
          <Copy className="h-4 w-4 mr-2" />
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onCopyCode('jsx')}>
          <Code className="h-4 w-4 mr-2" />
          Copy as JSX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopyCode('img')}>
          <Code className="h-4 w-4 mr-2" />
          Copy as img tag
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopyCode('bg')}>
          <Code className="h-4 w-4 mr-2" />
          Copy as background
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(onCopyUrl.toString(), '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in new tab
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
