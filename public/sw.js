// 오프라인 일정표용 서비스 워커(로컬·정식 호스팅에서 동작).
// - 화면(HTML)은 네트워크 우선: 새 버전이 있으면 받아 오고, 끊기면 캐시로 보여 줘요.
// - JS·CSS·폰트·사진은 캐시 우선: 한 번 받은 파일은 산간·섬에서도 열려요.
// - 페이지가 { type: 'cache-urls', urls } 메시지를 보내면 그 파일들을 미리 받아 둬요.
const CACHE = 'sabai-solow-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html'])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'cache-urls') return;
  const urls = (e.data.urls || []).filter((u) => new URL(u, self.location.href).origin === self.location.origin);
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(urls.map((u) => c.add(u))))
      .then((results) => {
        const failed = results.filter((r) => r.status === 'rejected').length;
        if (e.source) e.source.postMessage({ type: 'cache-done', total: urls.length, failed });
      }),
  );
});

const put = (req, res) => {
  if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => put(req, res)).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
});
