// リポジトリ作成ツール（Cloudflare Worker）。
// GET /            … スマホ用の専用ページを返す
// POST /api/create … リポジトリ作成＋（任意で）Cloudflare Pages 自動デプロイ設定
import { PAGE } from './page.js';
import {
  buildProjectName,
  sanitizeName,
  sanitizeBranch,
  constantTimeEqual,
  utf8ToBase64,
} from './util.js';
import { encryptSecret } from './secrets.js';
import {
  getAuthUser,
  createRepo,
  getRef,
  createRef,
  setDefaultBranch,
  getSecretPublicKey,
  putSecret,
  putFile,
} from './github.js';
import { createPagesProject } from './cloudflare.js';

const REQUIRED_ENV = ['GITHUB_TOKEN', 'CF_API_TOKEN', 'CF_ACCOUNT_ID', 'ACCESS_PASSCODE'];

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// 新リポジトリに置く初期ページ（最初のデプロイで中身が空にならないように）
function starterHtml(repoName, projectName) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${repoName}</title>
</head>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.6">
  <h1>🚀 ${repoName}</h1>
  <p>このページは自動生成された初期ページです。Cloudflare Pages へのデプロイが動作しています。</p>
  <p>ここを書き換えて push すると、自動で公開URLに反映されます。</p>
  <p style="color:#888;font-size:13px">project: ${projectName}</p>
</body>
</html>
`;
}

// push されたら Cloudflare Pages へ自動デプロイする GitHub Actions ワークフロー。
// \${{ }} は GitHub Actions の式。テンプレートリテラル展開を避けるため \\$ でエスケープ。
function deployWorkflow(projectName, branch) {
  return `name: Deploy to Cloudflare Pages
on:
  push:
    branches:
      - ${branch}
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy . --project-name=${projectName} --branch=${branch}
`;
}

async function handleCreate(request, env) {
  const missing = REQUIRED_ENV.filter((k) => !env[k]);
  if (missing.length) {
    return json({ error: `サーバー設定が不足しています: ${missing.join(', ')}` }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'リクエストが不正です' }, 400);
  }

  // 合言葉チェック（URL が漏れても部外者が作成できないようにする）
  if (!constantTimeEqual(body.passcode || '', env.ACCESS_PASSCODE)) {
    await new Promise((r) => setTimeout(r, 500)); // 総当たり対策の軽い遅延
    return json({ error: '合言葉が違います' }, 401);
  }

  const base = sanitizeName(body.toolName);
  if (!base) {
    return json({ error: 'ツール名が不正です（英数字を含めてください）' }, 400);
  }

  const isPrivate = body.visibility !== 'public';
  const description = body.description || '';
  const defaultBranch = sanitizeBranch(body.defaultBranch) || 'main';
  const autoDeploy = body.autoDeploy !== false;
  const org = (body.org || '').trim();

  const steps = [];
  try {
    // 作成先オーナーを決定
    let owner = org;
    if (!owner) {
      const user = await getAuthUser(env);
      owner = user.login;
    }
    const repoName = base;

    // 1) リポジトリ作成
    const repo = await createRepo(env, { name: repoName, description, isPrivate, org });
    owner = repo.owner.login;
    steps.push('リポジトリ作成');

    // 2) デフォルトブランチが指定と違えば作り直す
    if (defaultBranch !== repo.default_branch) {
      const ref = await getRef(env, owner, repoName, `heads/${repo.default_branch}`);
      await createRef(env, owner, repoName, `heads/${defaultBranch}`, ref.object.sha);
      await setDefaultBranch(env, owner, repoName, defaultBranch);
      steps.push(`デフォルトブランチを ${defaultBranch} に設定`);
    }

    let pagesUrl = null;
    let projectName = null;

    if (autoDeploy) {
      // 3) URL（プロジェクト名）を生成：合計58文字、残りを CSPRNG で充填
      const built = buildProjectName(base);
      projectName = built.projectName;

      // 4) Cloudflare Pages プロジェクトを先に作る
      await createPagesProject(env, { name: projectName, productionBranch: defaultBranch });
      steps.push('Cloudflare Pages プロジェクト作成');

      // 5) デプロイ用シークレットを暗号化して登録
      const pk = await getSecretPublicKey(env, owner, repoName);
      await putSecret(
        env, owner, repoName, 'CLOUDFLARE_API_TOKEN',
        encryptSecret(pk.key, env.CF_API_TOKEN), pk.key_id,
      );
      await putSecret(
        env, owner, repoName, 'CLOUDFLARE_ACCOUNT_ID',
        encryptSecret(pk.key, env.CF_ACCOUNT_ID), pk.key_id,
      );
      steps.push('デプロイ用シークレット登録');

      // 6) 初期ページ → ワークフローの順で追加（最後の push でデプロイが走る）
      await putFile(
        env, owner, repoName, 'index.html',
        utf8ToBase64(starterHtml(repoName, projectName)),
        'Add starter page', defaultBranch,
      );
      await putFile(
        env, owner, repoName, '.github/workflows/deploy.yml',
        utf8ToBase64(deployWorkflow(projectName, defaultBranch)),
        'Add Cloudflare Pages deploy workflow', defaultBranch,
      );
      steps.push('自動デプロイ設定ファイル追加');

      pagesUrl = `https://${projectName}.pages.dev`;
    }

    return json({
      ok: true,
      owner,
      repoName,
      repoUrl: repo.html_url,
      defaultBranch,
      projectName,
      pagesUrl,
      steps,
    });
  } catch (e) {
    return json({ error: e.message || String(e), steps }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/create') {
      return handleCreate(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};
