// GitHub REST API ラッパー。サーバー側に保管した PAT を使う。
const API = 'https://api.github.com';

function headers(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'repo-creator-worker',
    'Content-Type': 'application/json',
  };
}

export async function gh(env, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: headers(env),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data && data.message ? data.message : `GitHub API ${res.status}`;
    const err = new Error(`GitHub: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function getAuthUser(env) {
  return gh(env, 'GET', '/user');
}

export function createRepo(env, { name, description, isPrivate, org }) {
  const body = {
    name,
    description: description || '',
    private: !!isPrivate,
    auto_init: true, // 初期コミット＋デフォルトブランチを作る
  };
  if (org) return gh(env, 'POST', `/orgs/${org}/repos`, body);
  return gh(env, 'POST', '/user/repos', body);
}

export function getRef(env, owner, repo, ref) {
  return gh(env, 'GET', `/repos/${owner}/${repo}/git/ref/${ref}`);
}

export function createRef(env, owner, repo, ref, sha) {
  return gh(env, 'POST', `/repos/${owner}/${repo}/git/refs`, { ref: `refs/${ref}`, sha });
}

export function setDefaultBranch(env, owner, repo, branch) {
  return gh(env, 'PATCH', `/repos/${owner}/${repo}`, { default_branch: branch });
}

export function getSecretPublicKey(env, owner, repo) {
  return gh(env, 'GET', `/repos/${owner}/${repo}/actions/secrets/public-key`);
}

export function putSecret(env, owner, repo, name, encrypted_value, key_id) {
  return gh(env, 'PUT', `/repos/${owner}/${repo}/actions/secrets/${name}`, {
    encrypted_value,
    key_id,
  });
}

export function putFile(env, owner, repo, path, contentBase64, message, branch) {
  return gh(env, 'PUT', `/repos/${owner}/${repo}/contents/${path}`, {
    message,
    content: contentBase64,
    branch,
  });
}
