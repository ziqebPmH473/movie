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
