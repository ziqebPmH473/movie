// Cloudflare API ラッパー。サーバー側に保管した API トークンを使う。
const API = 'https://api.cloudflare.com/client/v4';

// Pages プロジェクト（Direct Upload 型）を作成する。
// GitHub Actions 側の wrangler が deploy するための受け皿。
export async function createPagesProject(env, { name, productionBranch }) {
  const res = await fetch(`${API}/accounts/${env.CF_ACCOUNT_ID}/pages/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, production_branch: productionBranch }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const msg =
      data.errors && data.errors.length
        ? data.errors.map((e) => e.message).join('; ')
        : `Cloudflare API ${res.status}`;
    const err = new Error(`Cloudflare: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data.result;
}
