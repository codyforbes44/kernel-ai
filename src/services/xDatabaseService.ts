import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface XTweetDraft {
  id: string;
  user_id: string;
  content: string;
  type: 'tweet' | 'thread';
  hashtags: string[];
  image_url: string | null;
  metadata: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface XScheduledTweet {
  id: string;
  user_id: string;
  draft_id: string | null;
  content: string;
  type: 'tweet' | 'thread';
  hashtags: string[];
  image_url: string | null;
  scheduled_for: string;
  timezone: string;
  status: 'pending' | 'posted' | 'failed' | 'cancelled';
  posted_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDraftInput {
  content: string;
  type?: 'tweet' | 'thread';
  hashtags?: string[];
  image_url?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDraftInput {
  content?: string;
  type?: 'tweet' | 'thread';
  hashtags?: string[];
  image_url?: string;
  metadata?: Record<string, unknown>;
  is_favorite?: boolean;
}

export interface ScheduleTweetInput {
  content: string;
  scheduled_for: string;
  type?: 'tweet' | 'thread';
  hashtags?: string[];
  image_url?: string;
  timezone?: string;
  draft_id?: string;
  metadata?: Record<string, unknown>;
}

class XDatabaseService {
  // Draft operations
  async getDrafts(limit = 50, offset = 0): Promise<XTweetDraft[]> {
    const { data, error } = await supabase
      .from('x_tweet_drafts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []) as XTweetDraft[];
  }

  async getDraft(id: string): Promise<XTweetDraft | null> {
    const { data, error } = await supabase
      .from('x_tweet_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as XTweetDraft;
  }

  async saveDraft(input: CreateDraftInput): Promise<XTweetDraft> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const insertData = {
      user_id: user.id,
      content: input.content,
      type: input.type || 'tweet',
      hashtags: input.hashtags || [],
      image_url: input.image_url || null,
      metadata: (input.metadata || {}) as Json,
    };

    const { data, error } = await supabase
      .from('x_tweet_drafts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data as XTweetDraft;
  }

  async updateDraft(id: string, input: UpdateDraftInput): Promise<XTweetDraft> {
    const updateData: Record<string, unknown> = {};
    if (input.content !== undefined) updateData.content = input.content;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.hashtags !== undefined) updateData.hashtags = input.hashtags;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.metadata !== undefined) updateData.metadata = input.metadata as Json;
    if (input.is_favorite !== undefined) updateData.is_favorite = input.is_favorite;

    const { data, error } = await supabase
      .from('x_tweet_drafts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as XTweetDraft;
  }

  async deleteDraft(id: string): Promise<void> {
    const { error } = await supabase
      .from('x_tweet_drafts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async toggleFavorite(id: string): Promise<XTweetDraft> {
    const draft = await this.getDraft(id);
    if (!draft) throw new Error('Draft not found');

    return this.updateDraft(id, { is_favorite: !draft.is_favorite });
  }

  // Scheduled tweet operations
  async getScheduledTweets(status?: string): Promise<XScheduledTweet[]> {
    let query = supabase
      .from('x_scheduled_tweets')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as XScheduledTweet[];
  }

  async getScheduledTweet(id: string): Promise<XScheduledTweet | null> {
    const { data, error } = await supabase
      .from('x_scheduled_tweets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as XScheduledTweet;
  }

  async scheduleTweet(input: ScheduleTweetInput): Promise<XScheduledTweet> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const insertData = {
      user_id: user.id,
      content: input.content,
      scheduled_for: input.scheduled_for,
      type: input.type || 'tweet',
      hashtags: input.hashtags || [],
      image_url: input.image_url || null,
      timezone: input.timezone || 'UTC',
      draft_id: input.draft_id || null,
      metadata: (input.metadata || {}) as Json,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('x_scheduled_tweets')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data as XScheduledTweet;
  }

  async updateScheduledTweet(
    id: string,
    input: Partial<Omit<ScheduleTweetInput, 'metadata'>> & { status?: string; metadata?: Json }
  ): Promise<XScheduledTweet> {
    const { data, error } = await supabase
      .from('x_scheduled_tweets')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as XScheduledTweet;
  }

  async cancelScheduledTweet(id: string): Promise<XScheduledTweet> {
    return this.updateScheduledTweet(id, { status: 'cancelled' });
  }

  async deleteScheduledTweet(id: string): Promise<void> {
    const { error } = await supabase
      .from('x_scheduled_tweets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const xDatabaseService = new XDatabaseService();
