import { useEffect, useRef, useState } from 'react';
import { cityById } from '../data/cities';
import type { Trip } from '../lib/planner';
import { useApp } from '../state';

// 핀 색: 짙은 글자(#1B2A4A)와 대비가 충분한 밝은 색 7가지(라이트·다크 공통)
const PIN = ['#F7A07E', '#F5B738', '#8ED5B6', '#B7C6EE', '#FFB59D', '#F5D48A', '#C9DCD2'];
export const pinColor = (i: number) => PIN[i % PIN.length];

export function stopsOf(trip: Trip) {
  const out: { city: string; from: number; to: number }[] = [];
  trip.days.forEach((d) => { const last = out[out.length - 1]; if (last && last.city === d.city) last.to = d.n; else out.push({ city: d.city, from: d.n, to: d.n }); });
  return out;
}

/* ---- 웹 메르카토르(지도 타일 좌표) ---- */
const TILE = 256;
const worldX = (lng: number, z: number) => ((lng + 180) / 360) * TILE * 2 ** z;
const worldY = (lat: number, z: number) => { const s = Math.sin((lat * Math.PI) / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z; };
// OpenStreetMap 기본 타일(가입·키 없음, 출처 표기 필수). 트래픽이 커지면 유료 타일 서비스로 바꿀 것 — 사용 정책: operations.osmfoundation.org/policies/tiles
const tileUrl = (z: number, x: number, y: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}
function useDark() {
  const { theme } = useApp();
  const [sys, setSys] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => { const m = matchMedia('(prefers-color-scheme: dark)'); const f = () => setSys(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  return theme === 'dark' || (theme === 'system' && sys);
}

/** 동선 지도: 실제 지도 타일 위에 곡선 경로·번호 핀. 오프라인이거나 타일을 못 받으면 간단한 도식 지도로 바꿔요. */
export function TripMap({ trip, focus }: { trip: Trip; w?: number; h?: number; focus?: string }) {
  const { online } = useApp();
  const dark = useDark();
  const [ref, { w, h }] = useSize();
  const [failed, setFailed] = useState(0);
  const stops = stopsOf(trip);
  const cs = stops.map((s) => cityById(s.city));
  const label = `동선 지도: ${cs.map((c) => c.name).join(' → ')} 순서`;
  const useTiles = online && failed < 3;

  // 모든 도시가 여백 안에 들어오는 가장 큰 확대 단계
  const padX = 70, padTop = 60, padBottom = 70;
  let z = 11, cx = 0, cy = 0;
  if (w && h) {
    for (; z > 4; z--) {
      const xs = cs.map((c) => worldX(c.lng, z)), ys = cs.map((c) => worldY(c.lat, z));
      if (Math.max(...xs) - Math.min(...xs) <= w - padX * 2 - 90 && Math.max(...ys) - Math.min(...ys) <= h - padTop - padBottom) {
        cx = (Math.max(...xs) + Math.min(...xs)) / 2 + 40; cy = (Math.max(...ys) + Math.min(...ys)) / 2 + (padBottom - padTop) / 2;
        break;
      }
    }
  }
  const x0 = cx - w / 2, y0 = cy - h / 2;
  const pts = cs.map((c) => [worldX(c.lng, z) - x0, worldY(c.lat, z) - y0]);
  // 도시 사이를 살짝 휘어진 선으로(같은 곳을 오가도 겹치지 않게 번갈아 휘기)
  const curves = pts.slice(1).map(([x2, y2], i) => {
    const [x1, y1] = pts[i]; const dx = x2 - x1, dy = y2 - y1; const k = (i % 2 ? -1 : 1) * 0.18;
    return `M${x1} ${y1} Q${(x1 + x2) / 2 - dy * k} ${(y1 + y2) / 2 + dx * k} ${x2} ${y2}`;
  });

  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  if (useTiles && w && h) {
    const n = 2 ** z;
    for (let tx = Math.floor(x0 / TILE); tx <= Math.floor((x0 + w) / TILE); tx++)
      for (let ty = Math.floor(y0 / TILE); ty <= Math.floor((y0 + h) / TILE); ty++)
        if (ty >= 0 && ty < n) tiles.push({ key: `${z}/${tx}/${ty}`, src: tileUrl(z, ((tx % n) + n) % n, ty), left: tx * TILE - x0, top: ty * TILE - y0 });
  }

  return (
    <div ref={ref} role="img" aria-label={label} className={`relative w-full h-full overflow-hidden ${dark ? 'bg-[#262a33]' : 'bg-[#EEF0EC]'}`}>
      {useTiles ? tiles.map((t) => (
        <img key={t.key} src={t.src} alt="" width={TILE} height={TILE} draggable={false} onError={() => setFailed((f) => f + 1)}
          className="absolute max-w-none select-none pointer-events-none" style={{ left: t.left, top: t.top, width: TILE, height: TILE, filter: dark ? 'invert(1) hue-rotate(180deg) brightness(.85) contrast(.9)' : 'saturate(.75)' }} />
      )) : <Schematic w={w} h={h} />}
      {/* 사진처럼 튀지 않게 살짝 덮는 면 */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: dark ? 'rgba(10,14,26,.18)' : 'rgba(250,247,242,.22)' }} />
      {w > 0 && (
        <svg width={w} height={h} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {curves.map((d, i) => <path key={'s' + i} d={d} fill="none" stroke={dark ? '#0A0E1A' : '#fff'} strokeWidth={8} strokeLinecap="round" opacity={0.85} />)}
          {curves.map((d, i) => <path key={'r' + i} d={d} fill="none" stroke="#B8431C" strokeWidth={3.5} strokeLinecap="round" strokeDasharray="1 9" opacity={focus && focus !== stops[i].city && focus !== stops[i + 1].city ? 0.35 : 1} />)}
        </svg>
      )}
      {w > 0 && stops.map((s, i) => {
        const [x, y] = pts[i]; const c = cs[i]; const dim = focus && focus !== s.city;
        const day = s.from === s.to ? `${s.from}` : `${s.from}–${s.to}`;
        return (
          <div key={i} className="absolute flex items-center gap-1.5 -translate-y-1/2 transition-opacity" style={{ left: x - 18, top: y, opacity: dim ? 0.4 : 1, zIndex: focus === s.city ? 3 : 2 }}>
            <span className="w-9 h-9 rounded-full grid place-items-center font-extrabold text-[#1B2A4A] shadow-lift" style={{ background: pinColor(i), boxShadow: '0 0 0 3px #1B2A4A, 0 6px 14px rgba(0,0,0,.25)', fontSize: day.length > 3 ? 11 : 14 }}>{day}</span>
            <span className="px-2.5 py-1 rounded-full bg-card text-marine text-[14px] font-extrabold whitespace-nowrap shadow-soft line">{c.name}</span>
          </div>
        );
      })}
      <span className="absolute right-2 bottom-2 px-2 py-0.5 rounded-md bg-card/85 text-[11px] text-slate">{useTiles ? '© OpenStreetMap 기여자' : '오프라인 · 간단 지도'}</span>
    </div>
  );
}

/** 타일이 없을 때(오프라인) 바탕: 옅은 격자 */
function Schematic({ w, h }: { w: number; h: number }) {
  return (
    <svg width={w} height={h} className="absolute inset-0" aria-hidden="true">
      <rect width={w} height={h} fill="rgb(var(--oat))" />
      {Array.from({ length: Math.ceil(w / 48) }, (_, i) => <path key={'v' + i} d={`M${i * 48} 0V${h}`} stroke="rgb(var(--marine))" strokeOpacity=".07" />)}
      {Array.from({ length: Math.ceil(h / 48) }, (_, i) => <path key={'h' + i} d={`M0 ${i * 48}H${w}`} stroke="rgb(var(--marine))" strokeOpacity=".07" />)}
    </svg>
  );
}
