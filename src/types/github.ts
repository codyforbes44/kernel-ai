export interface GitHubConnection {
  id: string;
  user_id: string;
  github_user_id: string;
  github_username: string;
  avatar_url: string | null;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRepo {
  id: string;
  project_id: string;
  github_connection_id: string;
  repo_owner: string;
  repo_name: string;
  repo_full_name: string;
  default_branch: string;
  last_synced_at: string | null;
  sync_status: 'idle' | 'syncing' | 'error';
  last_commit_sha: string | null;
  created_at: string;
}

export interface GitHubCommit {
  id: string;
  project_repo_id: string;
  commit_sha: string;
  commit_message: string | null;
  author_name: string | null;
  author_email: string | null;
  committed_at: string | null;
  synced_at: string;
  direction: 'push' | 'pull';
  files_changed: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  default_branch: string;
  html_url: string;
  description: string | null;
  updated_at: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

// Type guards for runtime type checking
export function isGitHubConnection(data: unknown): data is GitHubConnection {
  return (
    data !== null &&
    typeof data === 'object' &&
    'github_username' in data &&
    'github_user_id' in data
  );
}

export function isProjectRepo(data: unknown): data is ProjectRepo {
  return (
    data !== null &&
    typeof data === 'object' &&
    'repo_full_name' in data &&
    'project_id' in data
  );
}

export function isGitHubCommit(data: unknown): data is GitHubCommit {
  return (
    data !== null &&
    typeof data === 'object' &&
    'commit_sha' in data &&
    'direction' in data
  );
}

export function isGitHubCommitArray(data: unknown): data is GitHubCommit[] {
  return Array.isArray(data) && data.every(isGitHubCommit);
}
