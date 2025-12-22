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

// Input validation helpers
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitizeString(str: string, maxLength: number): string {
  return str.slice(0, maxLength).replace(/[<>]/g, "");
}

function isValidGitHubName(name: string): boolean {
  // GitHub repo/owner names: alphanumeric, hyphens, max 100 chars
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(name);
}

const ALLOWED_ACTIONS = [
  "list-repos",
  "create-repo",
  "link-repo",
  "unlink-repo",
  "push",
  "pull",
  "get-status",
  "get-commits",
  "list-branches",
  "switch-branch",
  "create-branch",
] as const;

type GitHubAction = typeof ALLOWED_ACTIONS[number];

interface SyncRequest {
  action: GitHubAction;
  projectId?: string;
  repoName?: string;
  repoOwner?: string;
  defaultBranch?: string;
  isPrivate?: boolean;
  description?: string;
  commitMessage?: string;
  branchName?: string;
  fromBranch?: string;
}

function validateSyncRequest(body: unknown): { valid: true; data: SyncRequest } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const { action, projectId, repoName, repoOwner, defaultBranch, isPrivate, description, commitMessage } = 
    body as Record<string, unknown>;

  // Validate action (required)
  if (typeof action !== "string" || !ALLOWED_ACTIONS.includes(action as GitHubAction)) {
    return { valid: false, error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(", ")}` };
  }

  // Validate projectId (optional but must be UUID if provided)
  if (projectId !== undefined && projectId !== null) {
    if (typeof projectId !== "string" || !isValidUUID(projectId)) {
      return { valid: false, error: "projectId must be a valid UUID" };
    }
  }

  // Validate repoName (optional but must be valid GitHub name if provided)
  if (repoName !== undefined && repoName !== null) {
    if (typeof repoName !== "string" || !isValidGitHubName(repoName)) {
      return { valid: false, error: "repoName must be a valid GitHub repository name" };
    }
  }

  // Validate repoOwner (optional but must be valid GitHub name if provided)
  if (repoOwner !== undefined && repoOwner !== null) {
    if (typeof repoOwner !== "string" || !isValidGitHubName(repoOwner)) {
      return { valid: false, error: "repoOwner must be a valid GitHub username" };
    }
  }

  // Validate defaultBranch (optional, max 100 chars)
  if (defaultBranch !== undefined && defaultBranch !== null) {
    if (typeof defaultBranch !== "string" || defaultBranch.length > 100) {
      return { valid: false, error: "defaultBranch must be a string with max 100 characters" };
    }
    // Branch names: alphanumeric, hyphens, underscores, forward slashes
    if (!/^[a-zA-Z0-9/_-]+$/.test(defaultBranch)) {
      return { valid: false, error: "defaultBranch contains invalid characters" };
    }
  }

  // Validate isPrivate (optional boolean)
  if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
    return { valid: false, error: "isPrivate must be a boolean" };
  }

  // Validate description (optional, max 500 chars)
  if (description !== undefined && description !== null) {
    if (typeof description !== "string" || description.length > 500) {
      return { valid: false, error: "description must be a string with max 500 characters" };
    }
  }

  // Validate commitMessage (optional, max 500 chars)
  if (commitMessage !== undefined && commitMessage !== null) {
    if (typeof commitMessage !== "string" || commitMessage.length > 500) {
      return { valid: false, error: "commitMessage must be a string with max 500 characters" };
    }
  }

  // Validate branchName (optional, max 100 chars, valid branch name)
  const branchName = (body as Record<string, unknown>).branchName;
  if (branchName !== undefined && branchName !== null) {
    if (typeof branchName !== "string" || branchName.length > 100) {
      return { valid: false, error: "branchName must be a string with max 100 characters" };
    }
    if (!/^[a-zA-Z0-9/_-]+$/.test(branchName)) {
      return { valid: false, error: "branchName contains invalid characters" };
    }
  }

  // Validate fromBranch (optional, max 100 chars, valid branch name)
  const fromBranch = (body as Record<string, unknown>).fromBranch;
  if (fromBranch !== undefined && fromBranch !== null) {
    if (typeof fromBranch !== "string" || fromBranch.length > 100) {
      return { valid: false, error: "fromBranch must be a string with max 100 characters" };
    }
    if (!/^[a-zA-Z0-9/_-]+$/.test(fromBranch)) {
      return { valid: false, error: "fromBranch contains invalid characters" };
    }
  }

  return {
    valid: true,
    data: {
      action: action as GitHubAction,
      projectId: typeof projectId === "string" ? projectId : undefined,
      repoName: typeof repoName === "string" ? repoName : undefined,
      repoOwner: typeof repoOwner === "string" ? repoOwner : undefined,
      defaultBranch: typeof defaultBranch === "string" ? defaultBranch : undefined,
      isPrivate: typeof isPrivate === "boolean" ? isPrivate : undefined,
      description: typeof description === "string" ? sanitizeString(description, 500) : undefined,
      commitMessage: typeof commitMessage === "string" ? sanitizeString(commitMessage, 500) : undefined,
      branchName: typeof branchName === "string" ? branchName : undefined,
      fromBranch: typeof fromBranch === "string" ? fromBranch : undefined,
    },
  };
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

    // Validate input
    const rawBody = await req.json();
    const validation = validateSyncRequest(rawBody);
    
    if (!validation.valid) {
      console.log("[github-sync] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, projectId, repoName, repoOwner, defaultBranch, isPrivate, description, commitMessage, branchName, fromBranch } = validation.data;
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
      if (!repoName) {
        return new Response(
          JSON.stringify({ error: "repoName is required for create-repo action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
          private: isPrivate ?? false,
          description: description ?? "",
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
      if (!projectId || !repoOwner || !repoName) {
        return new Response(
          JSON.stringify({ error: "projectId, repoOwner, and repoName are required for link-repo action" }),
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
          default_branch: defaultBranch ?? "main",
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
          JSON.stringify({ error: "projectId is required for unlink-repo action" }),
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
      const actualCommitMessage = commitMessage ?? "Update from Lovable Builder";

      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "projectId is required for push action" }),
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
          message: actualCommitMessage,
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
          commit_message: actualCommitMessage,
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
              message: actualCommitMessage,
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
          JSON.stringify({ error: "projectId is required for pull action" }),
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
        console.log("Fetched tree with", treeData.tree?.length || 0, "items");

        // Get content for each file
        const filePromises = [];
        for (const item of treeData.tree || []) {
          if (item.type !== "blob") continue;
          
          // Skip binary files and large files
          if (item.size > 1000000) continue; // 1MB limit

          filePromises.push(
            fetch(
              `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/contents/${item.path}?ref=${projectRepo.default_branch}`,
              {
                headers: {
                  Authorization: `Bearer ${connection.access_token}`,
                  Accept: "application/vnd.github.v3.raw",
                },
              }
            ).then(async (res) => {
              if (!res.ok) return null;
              try {
                const content = await res.text();
                return { path: item.path, content, type: "file" };
              } catch {
                return null;
              }
            })
          );
        }

        const files = (await Promise.all(filePromises)).filter(Boolean);
        console.log("Fetched content for", files.length, "files");

        // Clear existing files and insert new ones
        await serviceClient
          .from("project_files")
          .delete()
          .eq("project_id", projectId);

        if (files.length > 0) {
          const { error: insertError } = await serviceClient
            .from("project_files")
            .insert(
              files.map((f) => ({
                project_id: projectId,
                path: f!.path,
                content: f!.content,
                type: f!.type,
                name: f!.path.split("/").pop() || f!.path,
              }))
            );

          if (insertError) {
            console.error("Failed to insert files:", insertError);
          }
        }

        // Get latest commit info
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/commits/${projectRepo.default_branch}`,
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        let latestCommitSha = null;
        if (commitsResponse.ok) {
          const commitData = await commitsResponse.json();
          latestCommitSha = commitData.sha;

          // Record the pull
          await serviceClient.from("github_commits").insert({
            project_repo_id: projectRepo.id,
            commit_sha: commitData.sha,
            commit_message: commitData.commit?.message || "Pulled from GitHub",
            author_name: commitData.commit?.author?.name || connection.github_username,
            committed_at: commitData.commit?.author?.date || new Date().toISOString(),
            direction: "pull",
            files_changed: files.length,
          });
        }

        // Update project repo
        await serviceClient
          .from("project_repos")
          .update({
            sync_status: "idle",
            last_synced_at: new Date().toISOString(),
            last_commit_sha: latestCommitSha,
          })
          .eq("id", projectRepo.id);

        console.log("Pull successful, imported", files.length, "files");

        return new Response(
          JSON.stringify({
            success: true,
            files_imported: files.length,
            commit_sha: latestCommitSha,
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

    // Get sync status
    if (action === "get-status") {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "projectId is required for get-status action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: projectRepo, error: repoError } = await serviceClient
        .from("project_repos")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (repoError) {
        return new Response(
          JSON.stringify({ linked: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          linked: true,
          repo: {
            owner: projectRepo.repo_owner,
            name: projectRepo.repo_name,
            branch: projectRepo.default_branch,
          },
          sync_status: projectRepo.sync_status,
          last_synced: projectRepo.last_synced_at,
          last_commit: projectRepo.last_commit_sha,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get commit history
    if (action === "get-commits") {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "projectId is required for get-commits action" }),
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
        .order("committed_at", { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({ commits: commits || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List branches
    if (action === "list-branches") {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "projectId is required for list-branches action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: projectRepo } = await serviceClient
        .from("project_repos")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (!projectRepo) {
        return new Response(
          JSON.stringify({ error: "No repository linked to this project" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Fetching branches for", projectRepo.repo_owner + "/" + projectRepo.repo_name);

      const branchesResponse = await fetch(
        `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/branches`,
        {
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!branchesResponse.ok) {
        console.error("Failed to fetch branches:", branchesResponse.status);
        return new Response(
          JSON.stringify({ error: "Failed to fetch branches" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const branchesData = await branchesResponse.json();
      const branches = branchesData.map((b: { name: string; protected: boolean }) => ({
        name: b.name,
        isDefault: b.name === projectRepo.default_branch,
        isProtected: b.protected,
      }));

      console.log("Found", branches.length, "branches");

      return new Response(
        JSON.stringify({ branches }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Switch branch
    if (action === "switch-branch") {
      if (!projectId || !branchName) {
        return new Response(
          JSON.stringify({ error: "projectId and branchName are required for switch-branch action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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

      console.log("Switching to branch:", branchName);

      // Update the default branch in project_repos
      const { error: updateError } = await serviceClient
        .from("project_repos")
        .update({ 
          default_branch: branchName,
          sync_status: "syncing",
        })
        .eq("id", projectRepo.id);

      if (updateError) {
        console.error("Failed to update branch:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update branch" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Pull files from the new branch
      try {
        const treeResponse = await fetch(
          `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/trees/${branchName}?recursive=1`,
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!treeResponse.ok) {
          throw new Error("Failed to fetch branch tree");
        }

        const treeData = await treeResponse.json();
        
        // Get content for each file
        const filePromises = [];
        for (const item of treeData.tree || []) {
          if (item.type !== "blob") continue;
          if (item.size > 1000000) continue;

          filePromises.push(
            fetch(
              `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/contents/${item.path}?ref=${branchName}`,
              {
                headers: {
                  Authorization: `Bearer ${connection.access_token}`,
                  Accept: "application/vnd.github.v3.raw",
                },
              }
            ).then(async (res) => {
              if (!res.ok) return null;
              try {
                const content = await res.text();
                return { path: item.path, content, type: "file" };
              } catch {
                return null;
              }
            })
          );
        }

        const files = (await Promise.all(filePromises)).filter(Boolean);

        // Clear existing files and insert new ones
        await serviceClient
          .from("project_files")
          .delete()
          .eq("project_id", projectId);

        if (files.length > 0) {
          await serviceClient
            .from("project_files")
            .insert(
              files.map((f) => ({
                project_id: projectId,
                path: f!.path,
                content: f!.content,
                type: f!.type,
                name: f!.path.split("/").pop() || f!.path,
              }))
            );
        }

        // Update sync status
        await serviceClient
          .from("project_repos")
          .update({ sync_status: "idle" })
          .eq("id", projectRepo.id);

        console.log("Branch switched to", branchName, "- imported", files.length, "files");

        return new Response(
          JSON.stringify({ success: true, branch: branchName, filesUpdated: files.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error("Branch switch failed:", error);
        await serviceClient
          .from("project_repos")
          .update({ sync_status: "error" })
          .eq("id", projectRepo.id);

        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : "Branch switch failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create branch
    if (action === "create-branch") {
      if (!projectId || !branchName) {
        return new Response(
          JSON.stringify({ error: "projectId and branchName are required for create-branch action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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

      const sourceBranch = fromBranch || projectRepo.default_branch;
      console.log("Creating branch", branchName, "from", sourceBranch);

      // Get the SHA of the source branch
      const refResponse = await fetch(
        `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/refs/heads/${sourceBranch}`,
        {
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!refResponse.ok) {
        console.error("Failed to get source branch ref:", refResponse.status);
        return new Response(
          JSON.stringify({ error: "Failed to get source branch" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refData = await refResponse.json();
      const sha = refData.object.sha;

      // Create the new branch
      const createRefResponse = await fetch(
        `https://api.github.com/repos/${projectRepo.repo_owner}/${projectRepo.repo_name}/git/refs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${connection.access_token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: sha,
          }),
        }
      );

      if (!createRefResponse.ok) {
        const error = await createRefResponse.json();
        console.error("Failed to create branch:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Failed to create branch" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Branch created:", branchName);

      return new Response(
        JSON.stringify({ success: true, branch: branchName }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("GitHub sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
