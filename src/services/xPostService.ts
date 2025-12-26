import { invoke } from '@/lib/serviceWrapper';
import { logger } from '@/lib/logger';

export interface PostTweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  tweetIds?: string[];
  error?: string;
}

export interface XApiStatus {
  configured: boolean;
  missing?: string[];
  account?: {
    username: string;
    name: string;
  } | null;
}

export const xPostService = {
  /**
   * Check if X API credentials are configured
   */
  async checkStatus(): Promise<XApiStatus> {
    logger.info('[XPost] Checking X API status');
    
    return invoke<XApiStatus>('x-post-tweet', { action: 'status' }, {
      retries: 1,
      retryDelay: 1000,
    });
  },

  /**
   * Post a single tweet to X
   */
  async postTweet(content: string, replyToId?: string): Promise<PostTweetResult> {
    logger.info('[XPost] Posting tweet', { length: content.length });
    
    return invoke<PostTweetResult>('x-post-tweet', {
      action: 'post',
      content,
      replyToId,
    }, {
      retries: 1,
      retryDelay: 2000,
    });
  },

  /**
   * Post a thread (multiple tweets) to X
   */
  async postThread(tweets: string[]): Promise<PostTweetResult> {
    logger.info('[XPost] Posting thread', { count: tweets.length });
    
    return invoke<PostTweetResult>('x-post-tweet', {
      action: 'post-thread',
      tweets,
    }, {
      retries: 0, // Don't retry threads to avoid duplicates
    });
  },
};
