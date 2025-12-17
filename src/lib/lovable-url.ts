import { toast } from "sonner";

export const LOVABLE_URL_PATTERN = /^https:\/\/(www\.)?(lovable\.dev|lovable\.app)\/projects\/[a-zA-Z0-9-]+/;

export function isValidLovableUrl(url: string): boolean {
  return LOVABLE_URL_PATTERN.test(url);
}

export function extractProjectId(url: string): string | null {
  const match = url.match(/lovable\.(dev|app)\/projects\/([a-zA-Z0-9-]+)/);
  return match ? match[2] : null;
}

export function openLovableProject(url: string): void {
  window.open(url, "_blank");
}

export async function copyProjectUrl(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Project URL copied");
  } catch {
    toast.error("Failed to copy URL");
  }
}
