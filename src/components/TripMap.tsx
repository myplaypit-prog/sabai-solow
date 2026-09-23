import { cityById } from '../data/cities';
import type { Trip } from '../lib/planner';

// 핀 색: 짙은 글자(#1B2A4A)와 대비가 충분한 밝은 색 7가지(라이트·다크 공통)
const PIN = ['#F7A07E', '#F5B738', '#8ED5B6', '#B7C6EE', '#FFB59D', '#F5D48A', '#C9DCD2'];
export const pinColor = (i: number) => PIN[i % PIN.length];

/** 정적 동선 지도(프로토타입). 정식 버전에서는 OpenStreetMap/구글 지도로 교체합니다. */
export function stopsOf(trip: Trip) {
  const out: { city: string; from: number; to: number }[] = [];
  trip.days.forEach((d) => { const last = out[out.length - 1]; if (last && last.city === d.city) last.to = d.n; else out.push({ city: d.city, from: d.n, to: d.n }); });
  return out;
}
export function TripMap({ trip, w = 560, h = 760, focus }: { trip: Trip; w?: number; h?: number; focus?: string }) {
  const stops = stopsOf(trip);
  const cs = stops.map((s) => cityById(s.city));
  const lat = cs.map((c) => c.lat), lng = cs.map((c) => c.lng);
  const pad = 0.35;
  let [la0, la1, ln0, ln1] = [Math.min(...lat) - pad, Math.max(...lat) + pad, Math.min(...lng) - pad, Math.max(...lng) + pad];
  // 가로세로 비율 맞추기(경도 1° ≈ 위도 1°로 단순화)
  const ratio = w / h; const spanLa = la1 - la0, spanLn = ln1 - ln0;
  if (spanLn / spanLa < ratio) { const add = (spanLa * ratio - spanLn) / 2; ln0 -= add; ln1 += add; } else { const add = (spanLn / ratio - spanLa) / 2; la0 -= add; la1 += add; }
  const xy = (la: number, ln: number) => [60 + ((ln - ln0) / (ln1 - ln0)) * (w - 190), 50 + ((la1 - la) / (la1 - la0)) * (h - 100)];
  const pts = cs.map((c) => xy(c.lat, c.lng));
  const route = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(0)} ${y.toFixed(0)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" role="img" aria-label={`동선 지도: ${cs.map((c) => c.name).join(', ')} 순서`} className="block">
      <rect width={w} height={h} fill="rgb(var(--sand))" />
      {Array.from({ length: Math.ceil(w / 48) }, (_, i) => <path key={'v' + i} d={`M${i * 48} 0V${h}`} stroke="rgb(var(--ink))" strokeOpacity=".07" />)}
      {Array.from({ length: Math.ceil(h / 48) }, (_, i) => <path key={'h' + i} d={`M0 ${i * 48}H${w}`} stroke="rgb(var(--ink))" strokeOpacity=".07" />)}
      <path d={route} fill="none" stroke="rgb(var(--ink))" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 8" />
      {stops.map((s, i) => {
        const [x, y] = pts[i]; const c = cs[i]; const dim = focus && focus !== s.city;
        const label = s.from === s.to ? `${s.from}` : `${s.from}–${s.to}`;
        return (
          <g key={i} opacity={dim ? 0.35 : 1}>
            <circle cx={x} cy={y} r={22} fill={pinColor(i)} stroke="rgb(var(--ink))" strokeWidth={3} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={label.length > 3 ? 11 : 14} fontWeight={800} fill="#1B2A4A">{label}</text>
            <rect x={x + 28} y={y - 15} width={c.name.length * 15 + 22} height={30} rx={15} fill="rgb(var(--paper))" stroke="rgb(var(--ink))" strokeWidth={1.5} />
            <text x={x + 39} y={y + 5} fontSize={15} fontWeight={800} fill="rgb(var(--ink))">{c.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
