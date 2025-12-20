-- Add is_read column to messages table for tracking unread messages
ALTER TABLE public.messages 
ADD COLUMN is_read boolean DEFAULT true;

-- Set default to false for future assistant messages (user messages are inherently read)
-- We'll handle this in the application logic

-- Create index for efficient querying of unread messages
CREATE INDEX idx_messages_unread ON public.messages (user_id, is_read) WHERE is_read = false;