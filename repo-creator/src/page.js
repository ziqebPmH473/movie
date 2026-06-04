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
