// dist-artifact/index.html → claude.ai Artifact용 본문 파일(artifact.html)로 변환합니다.
// Artifact가 doctype/head/body를 감싸 주므로 그 태그만 벗겨 내고, 제목·폰트 링크·스타일·스크립트는 그대로 둡니다.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
const src = readFileSync('dist-artifact/index.html', 'utf8');
const head = src.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = src.match(/<body>([\s\S]*?)<\/body>/)[1];
const keep = head
  .replace(/<meta charset[^>]*>/, '').replace(/<meta name="viewport"[^>]*>/, '')
  .replace(/<link rel="manifest"[^>]*>/, '').replace(/<meta name="theme-color"[^>]*>/, '');
const title = keep.match(/<title>[\s\S]*?<\/title>/)[0];
const rest = keep.replace(title, '');
writeFileSync('dist-artifact/artifact.html', `${title}\n${rest}\n${body}`);
rmSync('dist-artifact/sw.js', { force: true }); rmSync('dist-artifact/manifest.webmanifest', { force: true });
console.log('artifact.html', (readFileSync('dist-artifact/artifact.html').length / 1024 / 1024).toFixed(2), 'MB');
