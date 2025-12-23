import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { DATE_RANGE_OPTIONS, type DateRangeFilter } from '@/types/admin';

interface DateRangeFilterProps {
  value: DateRangeFilter;
  onChange: (value: DateRangeFilter) => void;
  className?: string;
}

export function DateRangeFilterSelect({ value, onChange, className }: DateRangeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || 'w-40'}>
        <Calendar className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
