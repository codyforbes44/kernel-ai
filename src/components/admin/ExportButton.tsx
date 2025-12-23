import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/types/admin';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filenamePrefix: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({ 
  data, 
  filenamePrefix, 
  disabled,
  variant = 'outline',
  size = 'sm'
}: ExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const filename = `${filenamePrefix}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    exportToCSV(data, filename);
    toast.success(`Exported ${data.length} records`);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      disabled={disabled || data.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  );
}
