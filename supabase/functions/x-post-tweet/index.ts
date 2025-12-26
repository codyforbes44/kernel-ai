import { createHmac } from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("X_API_KEY")?.trim();
const API_SECRET = Deno.env.get("X_API_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("X_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("X_ACCESS_TOKEN_SECRET")?.trim();

interface PostTweetRequest {
  action: 'post' | 'post-thread' | 'status';
  content?: string;
  tweets?: string[];
  replyToId?: string;
}

interface TweetResponse {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  tweetIds?: string[];
  error?: string;
}

function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!API_KEY) missing.push("X_API_KEY");
  if (!API_SECRET) missing.push("X_API_SECRET");
  if (!ACCESS_TOKEN) missing.push("X_ACCESS_TOKEN");
  if (!ACCESS_TOKEN_SECRET) missing.push("X_ACCESS_TOKEN_SECRET");
  return { valid: missing.length === 0, missing };
}

// IMPORTANT: We intentionally do not include POST body parameters in OAuth signature
// Twitter's API expects only OAuth params in the signature base string
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("[X-POST] Signature Base String:", signatureBaseString.slice(0, 100) + "...");
  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2) + Date.now().toString(36),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return "OAuth " + entries
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

const BASE_URL = "https://api.x.com/2";

async function postTweet(text: string, replyToId?: string): Promise<TweetResponse> {
  const url = `${BASE_URL}/tweets`;
  const method = "POST";
  
  const body: Record<string, unknown> = { text };
  if (replyToId) {
    body.reply = { in_reply_to_tweet_id: replyToId };
  }

  const oauthHeader = generateOAuthHeader(method, url);
  console.log("[X-POST] Posting tweet, length:", text.length);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log("[X-POST] Response status:", response.status);
  console.log("[X-POST] Response body:", responseText);

  if (!response.ok) {
    const errorData = JSON.parse(responseText);
    const errorMessage = errorData.detail || errorData.title || errorData.errors?.[0]?.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = JSON.parse(responseText);
  const tweetId = data.data?.id;
  
  return {
    success: true,
    tweetId,
    tweetUrl: tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined,
  };
}

async function postThread(tweets: string[]): Promise<TweetResponse> {
  if (!tweets || tweets.length === 0) {
    throw new Error("No tweets provided for thread");
  }

  console.log("[X-POST] Posting thread with", tweets.length, "tweets");
  
  const tweetIds: string[] = [];
  let previousTweetId: string | undefined;

  for (let i = 0; i < tweets.length; i++) {
    console.log(`[X-POST] Posting tweet ${i + 1}/${tweets.length}`);
    
    const result = await postTweet(tweets[i], previousTweetId);
    
    if (!result.success || !result.tweetId) {
      throw new Error(`Failed to post tweet ${i + 1}: ${result.error}`);
    }
    
    tweetIds.push(result.tweetId);
    previousTweetId = result.tweetId;
    
    // Rate limit protection - wait 1 second between tweets
    if (i < tweets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: true,
    tweetId: tweetIds[0],
    tweetUrl: `https://x.com/i/web/status/${tweetIds[0]}`,
    tweetIds,
  };
}

async function getAccountInfo(): Promise<{ username: string; name: string } | null> {
  try {
    const url = `${BASE_URL}/users/me`;
    const oauthHeader = generateOAuthHeader("GET", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: oauthHeader,
      },
    });

    if (!response.ok) {
      console.log("[X-POST] Failed to get user info:", response.status);
      return null;
    }

    const data = await response.json();
    return {
      username: data.data?.username,
      name: data.data?.name,
    };
  } catch (error) {
    console.log("[X-POST] Error getting user info:", error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PostTweetRequest = await req.json();
    const { action } = body;

    console.log("[X-POST] Action:", action);

    // Status check - verify credentials are configured
    if (action === "status") {
      const validation = validateEnvironmentVariables();
      
      if (!validation.valid) {
        return new Response(
          JSON.stringify({
            configured: false,
            missing: validation.missing,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Try to get account info
      const account = await getAccountInfo();
      
      return new Response(
        JSON.stringify({
          configured: true,
          account: account,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate credentials for posting actions
    const validation = validateEnvironmentVariables();
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing X API credentials: ${validation.missing.join(", ")}`,
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result: TweetResponse;

    switch (action) {
      case "post":
        if (!body.content) {
          throw new Error("Content is required for posting a tweet");
        }
        result = await postTweet(body.content, body.replyToId);
        break;

      case "post-thread":
        if (!body.tweets || body.tweets.length === 0) {
          throw new Error("Tweets array is required for posting a thread");
        }
        result = await postThread(body.tweets);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log("[X-POST] Success:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[X-POST] Error:", errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
