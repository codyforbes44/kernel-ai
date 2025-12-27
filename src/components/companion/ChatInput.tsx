import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  companionName: string;
  isLoading: boolean;
  onSend: (message: string) => void;
}

export const ChatInput = memo(function ChatInput({ 
  companionName, 
  isLoading, 
  onSend 
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  }, [input, isLoading, onSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="p-4 border-t">
      <form 
        onSubmit={handleSubmit} 
        className="flex gap-2"
        role="form"
        aria-label={`Send message to ${companionName}`}
      >
        <Input
          value={input}
          onChange={handleChange}
          placeholder={`Message ${companionName}...`}
          disabled={isLoading}
          className="flex-1"
          aria-label={`Type your message to ${companionName}`}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          aria-label={isLoading ? 'Sending message' : 'Send message'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </form>
    </div>
  );
});
