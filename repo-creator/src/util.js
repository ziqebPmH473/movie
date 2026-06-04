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
