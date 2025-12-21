import { StorageBucket } from '@/services/storageService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Database, Globe, Lock } from 'lucide-react';

interface StorageBucketSelectorProps {
  buckets: StorageBucket[];
  currentBucket: string;
  onChange: (bucketId: string) => void;
  isLoading?: boolean;
}

export function StorageBucketSelector({
  buckets,
  currentBucket,
  onChange,
  isLoading,
}: StorageBucketSelectorProps) {
  return (
    <Select value={currentBucket} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select bucket" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {buckets.map(bucket => (
          <SelectItem key={bucket.id} value={bucket.id}>
            <div className="flex items-center gap-2">
              <span>{bucket.name}</span>
              {bucket.public ? (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="h-5 px-1.5 text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
