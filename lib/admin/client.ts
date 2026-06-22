const API_BASE = "/api";

export const DEV_LOGIN = "local-dev";

const IS_DEV = process.env.NODE_ENV === "development";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }

  return data;
}

export async function fetchAuthMe(): Promise<{ login: string } | null> {
  if (IS_DEV) return { login: DEV_LOGIN };

  const response = await fetch(`${API_BASE}/auth-me`, { credentials: "same-origin" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Auth check failed");
  return response.json();
}

export function startGitHubLogin(): void {
  window.location.href = `${API_BASE}/auth-github`;
}

export async function logoutAdmin(): Promise<void> {
  await request("/auth-logout", { method: "POST" });
}

export async function getContent<T>(path: string): Promise<{ data: T; sha: string }> {
  return request(`/content-get?path=${encodeURIComponent(path)}`);
}

export async function saveContent(
  path: string,
  content: unknown,
  message?: string
): Promise<{ ok: true; deploy: string }> {
  return request("/content-save", {
    method: "POST",
    body: JSON.stringify({ path, content, message }),
  });
}

export async function deleteContent(path: string): Promise<{ ok: true }> {
  return request("/content-delete", {
    method: "POST",
    body: JSON.stringify({ path }),
  });
}

export async function listBlogPosts(): Promise<{
  files: { name: string; path: string; slug: string }[];
}> {
  return request("/content-list?dir=content/blog");
}

export async function uploadAsset(
  path: string,
  file: File,
  options?: { updateResumeDate?: boolean }
): Promise<{ publicPath: string }> {
  const base64 = await fileToBase64(file);
  return request("/upload-asset", {
    method: "POST",
    body: JSON.stringify({
      path,
      base64,
      updateResumeDate: options?.updateResumeDate,
      message: `admin: upload ${path}`,
    }),
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
