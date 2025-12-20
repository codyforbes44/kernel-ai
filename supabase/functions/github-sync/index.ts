import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  default_branch: string;
  html_url: string;
  description: string | null;
  updated_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's GitHub connection
    const { data: connection, error: connError } = await serviceClient
      .from("github_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "GitHub not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, projectId, ...params } = await req.json();
    console.log("GitHub sync action:", action, "projectId:", projectId);

    // List user's repositories
    if (action === "list-repos") {
      console.log("Fetching repositories for user:", connection.github_username);
      
      const reposResponse = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!reposResponse.ok) {
        console.error("Failed to fetch repos:", reposResponse.status);
        return new Response(
          JSON.stringify({ error: "Failed to fetch repositories" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const repos: GitHubRepo[] = await reposResponse.json();
      console.log("Found", repos.length, "repositories");

      return new Response(
        JSON.stringify({ repos }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a new repository
    if (action === "create-repo") {
      const { repoName, isPrivate = false, description = "" } = params;

      console.log("Creating repository:", repoName);

      const createResponse = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: repoName,
          private: isPrivate,
          description,
          auto_init: true,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.error("Failed to create repo:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to create repository" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const repo: GitHubRepo = await createResponse.json();
      console.log("Repository created:", repo.full_name);

      return new Response(
        JSON.stringify({ repo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Link a repository to a project
    if (action === "link-repo") {
      const { repoOwner, repoName, defaultBranch = "main" } = params;

      if (!projectId || !repoOwner || !repoName) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Linking repo", repoOwner + "/" + repoName, "to project", projectId);

      const { data: projectRepo, error: linkError } = await serviceClient
        .from("project_repos")
        .upsert({
          project_id: projectId,
          github_connection_id: connection.id,
          repo_owner: repoOwner,
          repo_name: repoName,
          default_branch: defaultBranch,
        }, { onConflict: "project_id" })
        .select()
        .single();

      if (linkError) {
        console.error("Failed to link repo:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to link repository" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Repository linked successfully");
      return new Response(
        JSON.stringify({ projectRepo }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unlink repository from project
    if (action === "unlink-repo") {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "Missing projectId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: unlinkError } = await serviceClient
        .from("project_repos")
        .delete()
        .eq("project_id", projectId);

      if (unlinkError) {
        console.error("Failed to unlink repo:", unlinkError);
        return new Response(
          JSON.stringify({ error: "Failed to unlink repository" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Repository unlinked from project:", projectId);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Push to GitHub
    if (action === "push") {
      const { commitMessage = "Update from Lovable Builder" } = params;

      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "Missing projectId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get project repo
      const { data: projectRepo, error: repoError } = await serviceClient
        .from("project_repos")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (repoError || !projectRepo) {
        return new Response(
          JSON.stringify({ error: "No repository linked to this project" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update sync status
      await serviceClient
        .from("project_repos")
        .update({ sync_status: "syncing" })
        .eq("id", projectRepo.id);

      try {
        // Get all project files
        const { data: files, error: filesError } = await serviceClient
          .from("project_files")
          .select("*")
          .eq("project_id", projectId)
          .eq("type", "file");

        if (filesError) {
          throw new Error("Failed to fetch project files");
        }

        console.log("Pushing", files?.length || 0, "files to GitHub");

        // Get the current commit SHA for the default branch
        const refResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/refs/heads/${projectRepo.default_branch}`,
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        let baseSha: string | null = null;
        let baseTreeSha: string | null = null;

        if (refResponse.ok) {
          const refData = await refResponse.json();
          baseSha = refData.object.sha;

          // Get the tree SHA
          const commitResponse = await fetch(
            `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/commits/${baseSha}`,
            {
              headers: {
                Authorization: `Bearer ${connection.access_token}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (commitResponse.ok) {
            const commitData = await commitResponse.json();
            baseTreeSha = commitData.tree.sha;
          }
        }

        // Create blobs for each file
        const treeItems = [];
        for (const file of files || []) {
          if (!file.content) continue;

          const blobResponse = await fetch(
            `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/blobs`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${connection.access_token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: file.content,
                encoding: "utf-8",
              }),
            }
          );

          if (blobResponse.ok) {
            const blobData = await blobResponse.json();
            treeItems.push({
              path: file.path,
              mode: "100644",
              type: "blob",
              sha: blobData.sha,
            });
          }
        }

        // Create tree
        const treeResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/trees`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base_tree: baseTreeSha,
              tree: treeItems,
            }),
          }
        );

        if (!treeResponse.ok) {
          throw new Error("Failed to create tree");
        }

        const treeData = await treeResponse.json();

        // Create commit
        const commitPayload: Record<string, unknown> = {
          message: commitMessage,
          tree: treeData.sha,
        };

        if (baseSha) {
          commitPayload.parents = [baseSha];
        }

        const commitResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/commits`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(commitPayload),
          }
        );

        if (!commitResponse.ok) {
          throw new Error("Failed to create commit");
        }

        const newCommit = await commitResponse.json();

        // Update ref
        const updateRefResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/refs/heads/${projectRepo.default_branch}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sha: newCommit.sha,
              force: true,
            }),
          }
        );

        if (!updateRefResponse.ok) {
          // Try creating the ref if it doesn't exist
          await fetch(
            `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/refs`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${connection.access_token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ref: `refs/heads/${projectRepo.default_branch}`,
                sha: newCommit.sha,
              }),
            }
          );
        }

        // Update project repo with sync info
        await serviceClient
          .from("project_repos")
          .update({
            sync_status: "idle",
            last_synced_at: new Date().toISOString(),
            last_commit_sha: newCommit.sha,
          })
          .eq("id", projectRepo.id);

        // Record commit
        await serviceClient.from("github_commits").insert({
          project_repo_id: projectRepo.id,
          commit_sha: newCommit.sha,
          commit_message: commitMessage,
          author_name: connection.github_username,
          committed_at: new Date().toISOString(),
          direction: "push",
          files_changed: files?.length || 0,
        });

        console.log("Push successful, commit:", newCommit.sha);

        return new Response(
          JSON.stringify({
            success: true,
            commit: {
              sha: newCommit.sha,
              message: commitMessage,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (pushError) {
        console.error("Push failed:", pushError);

        await serviceClient
          .from("project_repos")
          .update({ sync_status: "error" })
          .eq("id", projectRepo.id);

        const message = pushError instanceof Error ? pushError.message : "Push failed";
        return new Response(
          JSON.stringify({ error: message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Pull from GitHub
    if (action === "pull") {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "Missing projectId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get project repo
      const { data: projectRepo, error: repoError } = await serviceClient
        .from("project_repos")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (repoError || !projectRepo) {
        return new Response(
          JSON.stringify({ error: "No repository linked to this project" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update sync status
      await serviceClient
        .from("project_repos")
        .update({ sync_status: "syncing" })
        .eq("id", projectRepo.id);

      try {
        // Get repository tree
        const treeResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/trees/${projectRepo.default_branch}?recursive=1`,
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!treeResponse.ok) {
          throw new Error("Failed to fetch repository tree");
        }

        const treeData = await treeResponse.json();
        const files = treeData.tree.filter((item: { type: string }) => item.type === "blob");

        console.log("Pulling", files.length, "files from GitHub");

        // Fetch each file content and update/create in database
        let filesUpdated = 0;
        for (const file of files) {
          const contentResponse = await fetch(
            `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/blobs/${file.sha}`,
            {
              headers: {
                Authorization: `Bearer ${connection.access_token}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (contentResponse.ok) {
            const blobData = await contentResponse.json();
            const content = blobData.encoding === "base64"
              ? atob(blobData.content)
              : blobData.content;

            const fileName = file.path.split("/").pop();
            const language = getLanguageFromPath(file.path);

            // Upsert file
            await serviceClient
              .from("project_files")
              .upsert({
                project_id: projectId,
                path: file.path,
                name: fileName,
                type: "file",
                content,
                language,
                updated_at: new Date().toISOString(),
              }, { onConflict: "project_id,path", ignoreDuplicates: false });

            filesUpdated++;
          }
        }

        // Get latest commit
        const commitResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/commits/${projectRepo.default_branch}`,
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        let latestCommit = null;
        if (commitResponse.ok) {
          latestCommit = await commitResponse.json();
        }

        // Update project repo
        await serviceClient
          .from("project_repos")
          .update({
            sync_status: "idle",
            last_synced_at: new Date().toISOString(),
            last_commit_sha: latestCommit?.sha || null,
          })
          .eq("id", projectRepo.id);

        // Record commit
        if (latestCommit) {
          await serviceClient.from("github_commits").upsert({
            project_repo_id: projectRepo.id,
            commit_sha: latestCommit.sha,
            commit_message: latestCommit.commit?.message || "Pull from GitHub",
            author_name: latestCommit.commit?.author?.name || connection.github_username,
            author_email: latestCommit.commit?.author?.email,
            committed_at: latestCommit.commit?.author?.date,
            direction: "pull",
            files_changed: filesUpdated,
          }, { onConflict: "project_repo_id,commit_sha" });
        }

        console.log("Pull successful, updated", filesUpdated, "files");

        return new Response(
          JSON.stringify({
            success: true,
            filesUpdated,
            commit: latestCommit ? {
              sha: latestCommit.sha,
              message: latestCommit.commit?.message,
            } : null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (pullError) {
        console.error("Pull failed:", pullError);

        await serviceClient
          .from("project_repos")
          .update({ sync_status: "error" })
          .eq("id", projectRepo.id);

        const message = pullError instanceof Error ? pullError.message : "Pull failed";
        return new Response(
          JSON.stringify({ error: message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get commit history
    if (action === "commits") {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "Missing projectId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: projectRepo } = await serviceClient
        .from("project_repos")
        .select("id")
        .eq("project_id", projectId)
        .single();

      if (!projectRepo) {
        return new Response(
          JSON.stringify({ commits: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: commits } = await serviceClient
        .from("github_commits")
        .select("*")
        .eq("project_repo_id", projectRepo.id)
        .order("synced_at", { ascending: false })
        .limit(50);

      return new Response(
        JSON.stringify({ commits: commits || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("GitHub sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
  };
  return langMap[ext || ""] || "plaintext";
}
