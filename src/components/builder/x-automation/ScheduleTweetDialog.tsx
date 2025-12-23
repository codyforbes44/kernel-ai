import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { BaseDialog, DialogActions } from '@/components/dialogs/BaseDialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ScheduleTweetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSchedule: (scheduledFor: string, timezone: string) => void;
  isLoading?: boolean;
}

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

export function ScheduleTweetDialog({
  open,
  onOpenChange,
  content,
  onSchedule,
  isLoading,
}: ScheduleTweetDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [timezone, setTimezone] = useState('UTC');

  const handleSchedule = () => {
    if (!date) return;

    const scheduledDate = new Date(date);
    scheduledDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
    onSchedule(scheduledDate.toISOString(), timezone);
  };

  const truncatedContent = content.length > 100 ? content.slice(0, 100) + '...' : content;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Tweet"
      description="Choose when you want this tweet to be posted"
      icon={Clock}
      size="lg"
      footer={
        <DialogActions
          cancelText="Cancel"
          confirmText={isLoading ? 'Scheduling...' : 'Schedule Tweet'}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleSchedule}
          isLoading={isLoading}
          confirmDisabled={!date}
        />
      }
    >
      <div className="space-y-6">
        {/* Tweet Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Preview:</p>
          <p className="text-sm">{truncatedContent}</p>
          <p className="text-xs text-muted-foreground mt-2">{content.length}/280 characters</p>
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hour</Label>
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Minute</Label>
            <Select value={minute} onValueChange={setMinute}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    :{m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseDialog>
  );
}
