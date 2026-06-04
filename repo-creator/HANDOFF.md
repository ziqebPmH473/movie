# 引き継ぎ指示（このファイルだけで完結します）

あなたはローカルの Claude Code です。すでに別環境で完成済みのツールを「（必要ならリポジトリ作成）→ ファイル設置 → GitHub へ push → Cloudflare へデプロイ」まで仕上げてください。必要な前提・仕様・全ソースコードをこのファイルに入れてあります。**ZIP や他リポジトリへのアクセスは不要**です。下記のファイルを**リポジトリのルート直下**にそのまま作成してください。

**重要（リポジトリ作成について）**: ローカルの Claude Code は GitHub のリポジトリ作成権限を持つ（Web版の連携と違い 403 にならない）。なので、まだ専用リポジトリが無ければ **あなた自身で新規作成してよい**。例: `gh repo create repo-creator --private --source=. --remote=origin`（または `gh repo create repo-creator --private` で作ってから clone）。ユーザーに手動作成を依頼する必要はない。リポジトリ名は `repo-creator` を推奨。

---

## 0. 目的（背景）

スマホから新しい GitHub リポジトリを作成し、そのリポジトリを Cloudflare Pages へ自動デプロイ設定まで行う「専用 Web ページ（Cloudflare Worker）」を動かす。

背景: Claude Code(web) の GitHub 連携はリポジトリ作成権限が無い(403)。そこで自分の PAT 等をサーバー側に保管したツールで作成を肩代わりする。完成すれば、外出先のスマホからリポジトリ作成＋公開 URL 取得まで完結する。

## 1. 確定仕様

- 形態: Cloudflare Worker（モジュールワーカー, `export default { fetch }`）。
- ルート: `GET /` → スマホ用 HTML フォーム / `POST /api/create` → 作成処理。
- サーバー側シークレット（4つ）:
  - `GITHUB_TOKEN`    : GitHub PAT（classic, スコープ `repo` + `workflow`）
  - `CF_API_TOKEN`    : Cloudflare API トークン（権限 Cloudflare Pages: Edit）
  - `CF_ACCOUNT_ID`   : Cloudflare アカウント ID
  - `ACCESS_PASSCODE` : ページの合言葉
- `POST /api/create` の処理:
  1. 合言葉を定数時間比較で検証（不一致は 401 ＋軽い遅延）
  2. ツール名を正規化（小文字・`[a-z0-9]` 以外は `-`・前後 `-` 除去）= base
  3. GitHub リポジトリ作成（`auto_init=true`）。個人 or org。
  4. 必要ならデフォルトブランチを指定値に変更（既定 `main`）
  5. autoDeploy 時:
     - 公開 URL 用プロジェクト名を生成（下記規則）
     - Cloudflare Pages プロジェクト作成（`production_branch`=デフォルトブランチ, Direct Upload 型）
     - 新リポジトリの Actions シークレットに `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を登録（libsodium sealed box 暗号化。npm: `tweetsodium`）
     - `index.html`（初期ページ）と `.github/workflows/deploy.yml` を新リポジトリへコミット
     - 戻り値に `repoUrl`, `pagesUrl`(=`https://<project>.pages.dev`), `steps`
- **公開 URL（= CF Pages プロジェクト名 / サブドメイン）規則【重要・確定】**:
  - 文字種は `[a-z0-9]` のみ（`_` や記号は CF 仕様上不可）
  - 形式: `base(最大32文字) + "-" + ランダム`。**合計を必ず 58 文字に固定**し、不足分をランダムで充填
  - ランダムは `crypto.getRandomValues`（CSPRNG）、**最低 25 桁**を保証（base が長すぎる時は base を切り詰め）
- 自動デプロイ方式: GitHub Actions（`cloudflare/wrangler-action@v3`）で `pages deploy . --project-name=<name> --branch=<branch>`。push 毎に CF Pages へ反映。
- 依存: `tweetsodium`（GitHub シークレット暗号化）。`wrangler.toml` に `compatibility_flags=["nodejs_compat"]` が必須。

## 2. 作成するファイル（このリポジトリのルート直下に、以下の内容そのままで）

### `src/util.js`
```js
// 汎用ユーティリティ（乱数・名前生成・base64・定数時間比較）

// Cloudflare Pages のプロジェクト名で使える文字（小文字英数字）。
// 記号・アンダースコアは仕様上使えないため除外している。
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

// 暗号学的に安全な乱数（CSPRNG）でランダム文字列を生成する。
// モジュロバイアスを避けるため棄却サンプリングを行う。
export function randomString(len) {
  const out = [];
  const max = 256 - (256 % CHARS.length); // 252。これ以上のバイト値は捨てる
  while (out.length < len) {
    const buf = new Uint8Array(len - out.length);
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b < max) {
        out.push(CHARS[b % CHARS.length]);
        if (out.length === len) break;
      }
    }
  }
  return out.join('');
}

// 入力をリポジトリ名／プロジェクト名のベースに正規化する。
// 小文字化し、英数字以外はハイフンにまとめ、前後のハイフンを除去する。
export function sanitizeName(input) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ブランチ名の軽い正規化。スラッシュやドットは許可する。
export function sanitizeBranch(input) {
  return (input || '').trim().replace(/[^A-Za-z0-9._/\-]/g, '');
}

// 合計58文字固定で、ベース名を引いた残りをランダムで充填する。
// ランダム部の最低桁数（既定25桁＝約129ビット）を保証し、
// ベース名が長すぎる場合は自動で切り詰める。
export function buildProjectName(base, { total = 58, minRandom = 25 } = {}) {
  let b = base.slice(0, 32);
  let randomLen = total - b.length - 1; // 1 はハイフン
  if (randomLen < minRandom) {
    b = base.slice(0, total - minRandom - 1);
    randomLen = minRandom;
  }
  const rand = randomString(randomLen);
  return { projectName: `${b}-${rand}`, base: b, randomLen };
}

// タイミング攻撃を避けるための定数時間比較。
export function constantTimeEqual(a, b) {
  const ea = new TextEncoder().encode(a || '');
  const eb = new TextEncoder().encode(b || '');
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

// UTF-8 文字列を base64 に変換する（GitHub Contents API 用）。
export function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function bytesToBase64(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
```

### `src/secrets.js`
```js
// GitHub Actions シークレットの暗号化。
// GitHub はリポジトリの公開鍵（libsodium sealed box）で暗号化した値を要求する。
import tweetsodium from 'tweetsodium';
import { base64ToBytes, bytesToBase64 } from './util.js';

// publicKeyBase64: GitHub から取得したリポジトリ公開鍵（base64）
// value: 平文のシークレット値
// 戻り値: base64 で暗号化された値
export function encryptSecret(publicKeyBase64, value) {
  const keyBytes = base64ToBytes(publicKeyBase64);
  const messageBytes = new TextEncoder().encode(value);
  const encrypted = tweetsodium.seal(messageBytes, keyBytes);
  return bytesToBase64(new Uint8Array(encrypted));
}
```

### `src/github.js`
```js
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
```

### `src/cloudflare.js`
```js
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
```

### `src/page.js`
```js
// スマホ向けの専用ページ（HTML/CSS/JS を1つにまとめた文字列）。
// 鍵（PAT 等）はここには一切含めない。サーバー側のシークレットを使う。
export const PAGE = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>リポジトリ作成</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    background: #0f1419; color: #e7edf3;
    -webkit-text-size-adjust: 100%;
  }
  main { max-width: 480px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 8px 0 4px; }
  p.sub { margin: 0 0 20px; color: #8b98a5; font-size: 13px; }
  label { display: block; font-size: 13px; margin: 14px 0 6px; color: #b6c2cf; font-weight: 600; }
  input, select, textarea {
    width: 100%; padding: 13px 14px; font-size: 16px;
    border: 1px solid #2a3540; border-radius: 12px;
    background: #1a222b; color: #e7edf3; outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: #4493f8; }
  textarea { min-height: 64px; resize: vertical; }
  .row { display: flex; gap: 10px; align-items: center; margin-top: 14px; }
  .row input[type=checkbox] { width: 20px; height: 20px; }
  .row label { margin: 0; }
  details { margin-top: 16px; border-top: 1px solid #232c35; padding-top: 8px; }
  summary { cursor: pointer; font-size: 13px; color: #8b98a5; padding: 6px 0; }
  button {
    width: 100%; margin-top: 22px; padding: 15px;
    font-size: 16px; font-weight: 700; color: #fff;
    background: #238636; border: 0; border-radius: 12px; cursor: pointer;
  }
  button:disabled { opacity: .55; }
  #result { margin-top: 22px; }
  .card { background: #161b22; border: 1px solid #2a3540; border-radius: 12px; padding: 16px; }
  .card.ok { border-color: #238636; }
  .card.err { border-color: #c0392b; }
  .urlbox { display: flex; gap: 8px; margin-top: 10px; }
  .urlbox input { font-size: 13px; }
  .urlbox button { width: auto; margin: 0; padding: 0 14px; background: #30363d; }
  a { color: #4493f8; }
  ul.steps { font-size: 13px; color: #8b98a5; padding-left: 18px; margin: 8px 0 0; }
  .muted { font-size: 12px; color: #6b7785; margin-top: 6px; }
  details.help { margin-top: 28px; border: 1px solid #232c35; border-radius: 12px; padding: 4px 14px; }
  details.help > summary { font-size: 14px; color: #b6c2cf; font-weight: 600; padding: 10px 0; }
  .help-body { font-size: 13px; color: #c2cdd6; line-height: 1.7; }
  .help-body h3 { font-size: 14px; margin: 18px 0 4px; color: #e7edf3; }
  .help-body p { margin: 4px 0; }
  .help-body code { background: #0d1117; border: 1px solid #2a3540; border-radius: 5px; padding: 1px 5px; font-size: 12px; }
  .help-body pre {
    background: #0d1117; border: 1px solid #2a3540; border-radius: 10px;
    padding: 12px; overflow-x: auto; font-size: 12px; color: #d6dee6;
  }
  .help-body ul.kv { padding-left: 18px; margin: 6px 0; }
  .help-body ul.kv li { margin: 3px 0; }
</style>
</head>
<body>
<main>
  <h1>📦 リポジトリ作成</h1>
  <p class="sub">作成すると Cloudflare Pages への自動デプロイまで設定されます。</p>

  <form id="f">
    <label for="passcode">合言葉</label>
    <input id="passcode" type="password" autocomplete="off" placeholder="アクセス用の合言葉">
    <div class="row">
      <input id="remember" type="checkbox">
      <label for="remember">この端末に合言葉を記憶</label>
    </div>

    <label for="toolName">ツール名</label>
    <input id="toolName" type="text" autocapitalize="off" autocorrect="off" placeholder="例: ipo-dashboard">

    <label for="visibility">公開設定</label>
    <select id="visibility">
      <option value="private" selected>非公開（private）</option>
      <option value="public">公開（public）</option>
    </select>

    <label for="description">説明（任意）</label>
    <textarea id="description" placeholder="このリポジトリの説明"></textarea>

    <details>
      <summary>詳細設定</summary>
      <label for="defaultBranch">デフォルトブランチ</label>
      <input id="defaultBranch" type="text" value="main" autocapitalize="off">
      <label for="org">組織（任意・空欄なら個人アカウント）</label>
      <input id="org" type="text" autocapitalize="off" placeholder="組織名">
      <div class="row">
        <input id="autoDeploy" type="checkbox" checked>
        <label for="autoDeploy">Cloudflare Pages 自動デプロイを設定する</label>
      </div>
    </details>

    <button id="submit" type="submit">作成する</button>
  </form>

  <div id="result"></div>

  <details class="help">
    <summary>🛠 セットアップ手順を表示（初回のみ・PCで）</summary>
    <div class="help-body">
      <p class="muted">この画面を使う前に、PCで一度だけ次の準備が必要です。</p>

      <h3>1. 必要な鍵を用意</h3>
      <p><b>GitHub PAT</b>（classic 推奨）<br>
      スコープ <code>repo</code> と <code>workflow</code> の両方にチェック。<br>
      GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</p>
      <p><b>Cloudflare API トークン</b><br>
      権限に <code>Account → Cloudflare Pages → Edit</code> を付与。<br>
      Cloudflare → My Profile → API Tokens → Create Token</p>
      <p><b>Cloudflare アカウントID</b><br>
      <code>dash.cloudflare.com/&lt;ここがID&gt;</code>、または Workers &amp; Pages の詳細に表示。</p>
      <p><b>合言葉</b><br>この画面にアクセスするための任意の文字列（自分で決める）。</p>

      <h3>2. デプロイ</h3>
      <pre>cd repo-creator
npm install
npx wrangler login
npx wrangler deploy</pre>

      <h3>3. 鍵と合言葉を登録</h3>
      <pre>npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put CF_API_TOKEN
npx wrangler secret put CF_ACCOUNT_ID
npx wrangler secret put ACCESS_PASSCODE</pre>

      <h3>4. 使う</h3>
      <p class="muted">表示されたURLをスマホのホーム画面に追加。開いて合言葉＋ツール名を入れれば作成できます。</p>

      <h3>入力項目</h3>
      <ul class="kv">
        <li><b>合言葉</b>：サーバーの ACCESS_PASSCODE と一致が必要</li>
        <li><b>ツール名</b>：リポジトリ名のベース（英数字以外はハイフンに）</li>
        <li><b>公開設定</b>：private / public</li>
        <li><b>説明</b>：任意</li>
        <li><b>デフォルトブランチ</b>：既定 main</li>
        <li><b>組織</b>：空欄なら個人アカウント</li>
        <li><b>自動デプロイ</b>：Cloudflare Pages 設定を行うか（既定 ON）</li>
      </ul>

      <h3>仕組み（メモ）</h3>
      <p class="muted">鍵はサーバー（Worker）にのみ保管され、この画面には出ません。合言葉で
      アクセス制限。公開URLは合計58文字固定で、ツール名以外を暗号用乱数で充填（最低25桁）。
      自動デプロイは GitHub Actions（wrangler-action）方式で、push のたびに公開URLへ反映されます。</p>
    </div>
  </details>
</main>

<script>
  const $ = (id) => document.getElementById(id);
  // 合言葉の記憶（任意・端末のローカルにのみ保存。鍵そのものではない）
  const saved = localStorage.getItem('rc_passcode');
  if (saved) { $('passcode').value = saved; $('remember').checked = true; }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function urlRow(url) {
    return '<div class="urlbox"><input readonly value="' + escapeHtml(url) + '">' +
      '<button type="button" onclick="navigator.clipboard.writeText(' + JSON.stringify(url) + ')">コピー</button></div>';
  }

  $('f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('submit');
    btn.disabled = true; btn.textContent = '作成中…';
    $('result').innerHTML = '';

    if ($('remember').checked) localStorage.setItem('rc_passcode', $('passcode').value);
    else localStorage.removeItem('rc_passcode');

    const payload = {
      passcode: $('passcode').value,
      toolName: $('toolName').value,
      visibility: $('visibility').value,
      description: $('description').value,
      defaultBranch: $('defaultBranch').value,
      org: $('org').value,
      autoDeploy: $('autoDeploy').checked,
    };

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        $('result').innerHTML = '<div class="card err"><b>失敗</b><div class="muted">' +
          escapeHtml(data.error || ('エラー ' + res.status)) +
          (data.steps && data.steps.length ? '<br>完了した手順: ' + escapeHtml(data.steps.join(' / ')) : '') +
          '</div></div>';
      } else {
        let html = '<div class="card ok"><b>✅ 作成しました</b>';
        html += '<div class="muted">リポジトリ</div>' + urlRow(data.repoUrl);
        if (data.pagesUrl) {
          html += '<div class="muted">公開URL（デプロイ完了後にアクセス可）</div>' + urlRow(data.pagesUrl);
        }
        if (data.steps && data.steps.length) {
          html += '<ul class="steps"><li>' + data.steps.map(escapeHtml).join('</li><li>') + '</li></ul>';
        }
        html += '</div>';
        $('result').innerHTML = html;
      }
    } catch (err) {
      $('result').innerHTML = '<div class="card err"><b>通信エラー</b><div class="muted">' + escapeHtml(String(err)) + '</div></div>';
    } finally {
      btn.disabled = false; btn.textContent = '作成する';
    }
  });
</script>
</body>
</html>`;
```

### `src/index.js`
```js
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
// ${'$'}{{ }} は GitHub Actions の式。テンプレートリテラル展開を避けるため \$ でエスケープ。
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
```

### `wrangler.toml`
```toml
name = "repo-creator"
main = "src/index.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
```

### `package.json`
```json
{
  "name": "repo-creator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "tweetsodium": "0.0.5"
  },
  "devDependencies": {
    "wrangler": "^3.80.0"
  }
}
```

### `.gitignore`
```text
node_modules/
.wrangler/
.dev.vars
dist/
```

### `.dev.vars.example`
```text
GITHUB_TOKEN="ghp_xxx"
CF_API_TOKEN="xxx"
CF_ACCOUNT_ID="xxx"
ACCESS_PASSCODE="xxx"
```

> `src/page.js` の完全な中身が手元に無い場合は、ユーザーに依頼して貼ってもらうこと（長い HTML テンプレート文字列のため）。それ以外のファイルは上記で完結。

## 2.5 リポジトリの用意（まだ無い場合のみ）

専用リポジトリがまだ無ければ、ローカルの Claude Code が作成する:
1. 空フォルダで作業しているなら、上記ファイルを配置してから `git init`
2. `gh repo create repo-creator --private --source=. --remote=origin --push`
   （`gh` が無ければ git でリモートを作って push、または GitHub API でも可。ローカルなので作成は通る）
すでにリポジトリ内で開いているなら、ファイルを配置して push するだけでよい。

## 3. デプロイ手順

### 既知の罠（重要）
- `wrangler login` は **Norton が localhost コールバックをブロック**して失敗する。だから下記いずれかで認証すること。
- `tweetsodium` は npm 依存なので **ダッシュボードのコード貼り付けエディタでは動かせない**。必ず「ビルドを伴う方式」（Connect to Git もしくはローカル build）で。

### 【推奨】Cloudflare ダッシュボードの Connect to Git（Workers Builds）
1. まずこのリポジトリを GitHub へ push（コミット → push）
2. dash.cloudflare.com → Workers & Pages → Create → Workers → **Import a repository**
3. このリポジトリを選択
4. 設定: Root directory = `/`（ルート直下に置いたので）/ Build command = `npm install` / Deploy command = `npx wrangler deploy`
5. デプロイ後、Settings → **Variables and Secrets** で 4 つを **Secret** 種別で登録:
   `GITHUB_TOKEN` / `CF_API_TOKEN` / `CF_ACCOUNT_ID` / `ACCESS_PASSCODE`
6. → この方式なら **Workers 編集権限のトークンは不要**。

### 【代替】ローカルで wrangler
1. `npm install`
2. Workers 編集権限つきの Cloudflare API トークンを用意し、環境変数 `CLOUDFLARE_API_TOKEN`（と `CLOUDFLARE_ACCOUNT_ID`）をセットして `npx wrangler deploy`（**login は使わない**）
3. `npx wrangler secret put` で 4 つを登録
   （注意: ユーザーが今持っている CF トークンは「Pages 編集」のみ。ローカル deploy には Workers 編集権限が要る。Connect to Git なら不要）

## 4. ユーザーが既に持っている鍵
- GitHub PAT（`repo` + `workflow`）… 取得済み
- Cloudflare API トークン（Pages: Edit）… 取得済み → `CF_API_TOKEN` に使う
- Cloudflare アカウント ID … 把握済み
- 合言葉（`ACCESS_PASSCODE`）… 英数字でユーザーが決める

## 5. 仕上げ確認
- デプロイ後 `https://repo-creator.<サブドメイン>.workers.dev` をスマホで開く
- 合言葉＋ツール名を入れて「作成」→ 新リポジトリが出来て、公開 URL(`.pages.dev`) が表示されれば成功
- 画面差異や不明点が出たらユーザーに確認しながら進める

## 6. 進め方の注意
- 順序: ①ファイル設置 → ②GitHub へ push → ③デプロイ → ④シークレット登録 → ⑤テスト
- コードのロジックは完成・検証済み（名前生成・乱数・Actions の式エスケープ）。大改修は不要。
- `tweetsodium` のバンドルでエラーが出たら、最初に `nodejs_compat` フラグの有無を確認すること。
