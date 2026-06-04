# repo-creator

スマホの専用ページから、**新しい GitHub リポジトリの作成**と **Cloudflare Pages への自動デプロイ設定**を一発で行うツール。

外出先（スマホ）からでも、合言葉を入れて名前を入力するだけで:

1. 新しいリポジトリが作られる
2. そのリポジトリに「push したら Cloudflare Pages に自動デプロイ」が設定される
3. 推測されにくい公開URL（`ツール名-ランダム.pages.dev`）が表示される

以降は Claude Code でコードを書いて push すれば、自動で公開URLに反映されます。

---

## 仕組み（ざっくり）

- 本体は **Cloudflare Worker**。`GET /` で専用ページ、`POST /api/create` で作成処理を行う。
- 鍵（GitHub PAT・Cloudflare トークン）は **Worker のシークレット**として保管され、ブラウザには一切出ない。
- ページには **合言葉**でアクセス制限（URL が漏れても部外者は作成できない）。
- 自動デプロイは **GitHub Actions（`cloudflare/wrangler-action`）** 方式。作成時に
  リポジトリのシークレットへ Cloudflare の鍵を登録し、`.github/workflows/deploy.yml` を置く。
- 公開URL は **合計58文字固定**で、ツール名を引いた残りを **CSPRNG（暗号用乱数）** で充填。
  ランダム部は最低25桁（約129ビット）を保証。

---

## 初期セットアップ（PCで一度だけ）

### 1. 必要な鍵を用意する

**GitHub PAT（Personal Access Token / classic 推奨）**
- スコープ: `repo` と `workflow` の両方にチェック
  - `repo`: リポジトリ作成・シークレット登録に必要
  - `workflow`: `.github/workflows/deploy.yml` を置くために必要
- 発行: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

**Cloudflare API トークン**
- テンプレート不要。権限に **Account → Cloudflare Pages → Edit** を付与
- 発行: Cloudflare ダッシュボード → My Profile → API Tokens → Create Token

**Cloudflare アカウントID**
- ダッシュボードの URL `dash.cloudflare.com/<ここがアカウントID>`、または
  Workers & Pages の「アカウントの詳細」に表示される ID

**合言葉**
- ページにアクセスするための任意の文字列（自分で決める）

### 2. デプロイ

```bash
cd repo-creator
npm install
npx wrangler login          # 初回のみ。Cloudflare アカウントへログイン
npx wrangler deploy         # Worker を公開（URL が表示される）
```

### 3. シークレットを登録

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put CF_API_TOKEN
npx wrangler secret put CF_ACCOUNT_ID
npx wrangler secret put ACCESS_PASSCODE
```

各コマンド実行後に値の入力を求められる。これで完了。

### 4. 使う

`wrangler deploy` で表示された URL（`https://repo-creator.<サブドメイン>.workers.dev`）を
スマホのホーム画面に追加しておくと便利。開いて合言葉＋ツール名を入れれば作成できる。

---

## ローカルで試す

```bash
cp .dev.vars.example .dev.vars   # 値を埋める
npm install
npm run dev
```

---

## 入力項目

| 項目 | 内容 |
|---|---|
| 合言葉 | アクセス用（サーバーの `ACCESS_PASSCODE` と一致が必要） |
| ツール名 | リポジトリ名のベース。英数字以外はハイフンに正規化 |
| 公開設定 | private / public |
| 説明 | リポジトリの説明（任意） |
| デフォルトブランチ | 既定 `main` |
| 組織 | 空欄なら個人アカウント |
| 自動デプロイ | Cloudflare Pages 設定を行うか（既定 ON） |

---

## メモ

- このディレクトリは独立しているので、将来そのまま専用リポジトリへ移せる。
- 作成のみのツール（中身のコードは Claude Code 側で開発する想定）。
