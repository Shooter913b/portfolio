import { parseRepo } from "./paths";

type GitHubContentResponse = {
  content: string;
  sha: string;
  encoding: string;
};

type GitHubDirectoryEntry = {
  name: string;
  path: string;
  type: "file" | "dir";
};

function getRepoConfig() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!repo) throw new Error("GITHUB_REPO is not configured");
  return { ...parseRepo(repo), branch };
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getGitHubUser(
  accessToken: string
): Promise<{ login: string }> {
  const response = await fetch("https://api.github.com/user", {
    headers: authHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error(`GitHub user lookup failed (${response.status})`);
  }
  return response.json() as Promise<{ login: string }>;
}

export async function getFileFromGitHub(
  path: string,
  accessToken: string
): Promise<{ content: string; sha: string } | null> {
  const { owner, repo, branch } = getRepoConfig();
  const url = new URL(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  );
  url.searchParams.set("ref", branch);

  const response = await fetch(url, { headers: authHeaders(accessToken) });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub read failed for ${path} (${response.status})`);
  }

  const data = (await response.json()) as GitHubContentResponse;
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { content, sha: data.sha };
}

export async function putFileToGitHub(
  path: string,
  body: string | Uint8Array,
  message: string,
  accessToken: string,
  sha?: string
): Promise<{ sha: string }> {
  const { owner, repo, branch } = getRepoConfig();
  const content = Buffer.from(body).toString("base64");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub write failed for ${path} (${response.status}): ${error}`);
  }

  const data = (await response.json()) as { content: { sha: string } };
  return { sha: data.content.sha };
}

export async function deleteFileFromGitHub(
  path: string,
  sha: string,
  message: string,
  accessToken: string
): Promise<void> {
  const { owner, repo, branch } = getRepoConfig();

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sha, branch }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub delete failed for ${path} (${response.status}): ${error}`);
  }
}

export async function listGitHubDirectory(
  dir: string,
  accessToken: string
): Promise<GitHubDirectoryEntry[]> {
  const { owner, repo, branch } = getRepoConfig();
  const url = new URL(
    `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`
  );
  url.searchParams.set("ref", branch);

  const response = await fetch(url, { headers: authHeaders(accessToken) });
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`GitHub list failed for ${dir} (${response.status})`);
  }

  const data = (await response.json()) as GitHubDirectoryEntry[];
  return Array.isArray(data) ? data : [];
}
