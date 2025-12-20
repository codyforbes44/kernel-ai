import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string;
  expires_in?: number;
}

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const githubClientId = Deno.env.get("GITHUB_CLIENT_ID");
    const githubClientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Check if GitHub is configured
    if (action === "check-config") {
      const isConfigured = !!(githubClientId && githubClientSecret);
      console.log("GitHub configuration check:", { isConfigured });
      return new Response(
        JSON.stringify({ configured: isConfigured }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get OAuth URL
    if (action === "get-oauth-url") {
      if (!githubClientId) {
        console.error("GitHub client ID not configured");
        return new Response(
          JSON.stringify({ error: "GitHub integration not configured" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const redirectUri = url.searchParams.get("redirect_uri");
      const state = url.searchParams.get("state");

      if (!redirectUri || !state) {
        return new Response(
          JSON.stringify({ error: "Missing redirect_uri or state" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const oauthUrl = new URL("https://github.com/login/oauth/authorize");
      oauthUrl.searchParams.set("client_id", githubClientId);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("scope", "repo user:email");
      oauthUrl.searchParams.set("state", state);

      console.log("Generated OAuth URL for GitHub");
      return new Response(
        JSON.stringify({ url: oauthUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle OAuth callback
    if (action === "callback") {
      if (!githubClientId || !githubClientSecret) {
        console.error("GitHub credentials not configured");
        return new Response(
          JSON.stringify({ error: "GitHub integration not configured" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const code = url.searchParams.get("code");
      const authHeader = req.headers.get("Authorization");

      if (!code) {
        return new Response(
          JSON.stringify({ error: "Missing authorization code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Missing authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Exchange code for access token
      console.log("Exchanging authorization code for access token");
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code,
        }),
      });

      const tokenData: GitHubTokenResponse = await tokenResponse.json();

      if (!tokenData.access_token) {
        console.error("Failed to get access token:", tokenData);
        return new Response(
          JSON.stringify({ error: "Failed to get access token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get GitHub user info
      console.log("Fetching GitHub user info");
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const githubUser: GitHubUser = await userResponse.json();

      // Create Supabase client with user's auth
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get user ID from auth header
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      
      if (userError || !user) {
        console.error("Failed to get user:", userError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate token expiry
      const tokenExpiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      // Upsert GitHub connection
      console.log("Saving GitHub connection for user:", user.id);
      const { data: connection, error: upsertError } = await supabase
        .from("github_connections")
        .upsert({
          user_id: user.id,
          github_user_id: String(githubUser.id),
          github_username: githubUser.login,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          avatar_url: githubUser.avatar_url,
          token_expires_at: tokenExpiresAt,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (upsertError) {
        console.error("Failed to save connection:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to save GitHub connection" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("GitHub connection saved successfully");
      return new Response(
        JSON.stringify({
          success: true,
          connection: {
            id: connection.id,
            github_username: connection.github_username,
            avatar_url: connection.avatar_url,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Disconnect GitHub
    if (action === "disconnect") {
      const authHeader = req.headers.get("Authorization");
      
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Missing authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete connection (will cascade to project_repos and commits)
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      const { error: deleteError } = await serviceClient
        .from("github_connections")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Failed to disconnect:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to disconnect GitHub" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("GitHub disconnected for user:", user.id);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("GitHub auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
