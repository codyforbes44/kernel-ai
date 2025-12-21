import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

interface GitHubPushEvent {
  ref: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
  };
  commits: Array<{
    id: string;
    message: string;
    author: { name: string; email: string };
    timestamp: string;
  }>;
  head_commit: {
    id: string;
    message: string;
    author: { name: string; email: string };
    timestamp: string;
  } | null;
  pusher: { name: string; email: string };
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const signatureArray = new Uint8Array(signatureBuffer);
    const expectedSignature = "sha256=" + Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the event type
    const eventType = req.headers.get("x-github-event");
    const signature = req.headers.get("x-hub-signature-256");
    const deliveryId = req.headers.get("x-github-delivery");

    console.log(`GitHub webhook: event=${eventType}, delivery=${deliveryId}`);

    // Only process push events
    if (eventType !== "push") {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(JSON.stringify({ message: "Event ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const payload: GitHubPushEvent = JSON.parse(body);

    // Find the project repo by repo name
    const repoFullName = payload.repository.full_name;
    const { data: projectRepo, error: repoError } = await serviceClient
      .from("project_repos")
      .select("*, builder_projects!inner(user_id)")
      .eq("repo_full_name", repoFullName)
      .single();

    if (repoError || !projectRepo) {
      console.log(`No linked project found for repo: ${repoFullName}`);
      return new Response(JSON.stringify({ message: "Repo not linked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature if secret exists
    if (projectRepo.webhook_secret && signature) {
      const isValid = await verifySignature(body, signature, projectRepo.webhook_secret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check if auto-sync is enabled
    if (!projectRepo.auto_sync_enabled) {
      console.log(`Auto-sync disabled for project: ${projectRepo.project_id}`);
      return new Response(JSON.stringify({ message: "Auto-sync disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this is the tracked branch
    const pushedBranch = payload.ref.replace("refs/heads/", "");
    if (pushedBranch !== projectRepo.default_branch) {
      console.log(`Ignoring push to non-default branch: ${pushedBranch}`);
      return new Response(JSON.stringify({ message: "Non-default branch" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the GitHub connection for this project
    const { data: connection, error: connError } = await serviceClient
      .from("github_connections")
      .select("*")
      .eq("id", projectRepo.github_connection_id)
      .single();

    if (connError || !connection) {
      console.error("GitHub connection not found");
      return new Response(JSON.stringify({ error: "Connection not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update sync status
    await serviceClient
      .from("project_repos")
      .update({ sync_status: "syncing" })
      .eq("id", projectRepo.id);

    try {
      // Fetch files from GitHub
      const treeResponse = await fetch(
        `https://api.github.com/repos/${repoFullName}/git/trees/${pushedBranch}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!treeResponse.ok) {
        throw new Error(`Failed to fetch tree: ${treeResponse.status}`);
      }

      const treeData = await treeResponse.json();
      const files = treeData.tree.filter((item: { type: string }) => item.type === "blob");

      let filesUpdated = 0;
      const allowedExtensions = [
        ".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".md", ".svg"
      ];

      // Fetch and update each file
      for (const file of files) {
        const ext = file.path.substring(file.path.lastIndexOf("."));
        if (!allowedExtensions.includes(ext)) continue;

        try {
          const contentResponse = await fetch(
            `https://api.github.com/repos/${repoFullName}/contents/${file.path}?ref=${pushedBranch}`,
            {
              headers: {
                Authorization: `Bearer ${connection.access_token}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (!contentResponse.ok) continue;

          const contentData = await contentResponse.json();
          const content = atob(contentData.content.replace(/\n/g, ""));
          const fileName = file.path.split("/").pop() || file.path;

          // Upsert file
          const { error: upsertError } = await serviceClient
            .from("project_files")
            .upsert(
              {
                project_id: projectRepo.project_id,
                path: file.path,
                name: fileName,
                content,
                type: "file",
                language: ext.substring(1),
              },
              { onConflict: "project_id,path" }
            );

          if (!upsertError) filesUpdated++;
        } catch (err) {
          console.error(`Error fetching file ${file.path}:`, err);
        }
      }

      // Record commit
      if (payload.head_commit) {
        await serviceClient.from("github_commits").insert({
          project_repo_id: projectRepo.id,
          commit_sha: payload.head_commit.id,
          commit_message: payload.head_commit.message,
          author_name: payload.head_commit.author.name,
          author_email: payload.head_commit.author.email,
          committed_at: payload.head_commit.timestamp,
          direction: "pull",
          files_changed: filesUpdated,
        });
      }

      // Update repo status
      await serviceClient
        .from("project_repos")
        .update({
          sync_status: "idle",
          last_synced_at: new Date().toISOString(),
          last_commit_sha: payload.head_commit?.id || projectRepo.last_commit_sha,
        })
        .eq("id", projectRepo.id);

      console.log(`Auto-sync complete: ${filesUpdated} files updated`);

      return new Response(
        JSON.stringify({
          success: true,
          filesUpdated,
          commitSha: payload.head_commit?.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      // Update status to error
      await serviceClient
        .from("project_repos")
        .update({ sync_status: "error" })
        .eq("id", projectRepo.id);

      throw error;
    }
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});