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
