import { SEASON_TIPS } from '../data/seasons';
import { Badge, Photo, seasonKind } from './ui';
import { Icon } from './Icon';
import { todayISO, monthOf } from '../lib/dates';

const COL: Record<string, string> = { peak: 'bg-pist', haze: 'bg-putty', heat: 'bg-butter', rain: 'bg-mint', gulf: 'bg-hib' };
export function Timeline() {
  const now = monthOf(todayISO());
  return (
    <div role="img" aria-label={`월별 시기 타임라인, 지금은 ${now}월`} className="card rounded-3xl p-4 lg:p-6 flex flex-col gap-2.5">
      <div className="flex">{Array.from({ length: 12 }, (_, k) => <span key={k} className={`flex-1 text-center text-xs lg:text-sm font-bold ${k + 1 === now ? 'text-ink' : 'text-muted'}`}>{k + 1}<span className="hidden lg:inline">월</span></span>)}</div>
      <div className="relative flex flex-col gap-2">
        <span className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-chili-d" style={{ left: `${((now - 0.5) / 12) * 100}%` }} />
        {SEASON_TIPS.map((t) => {
          const ms = t.id === 'haze' ? [2, 3, 4] : t.months; // 2월 말~4월
          const runs: [number, number][] = []; [...ms].sort((a, b) => a - b).forEach((x) => { const r = runs[runs.length - 1]; if (r && r[1] === x - 1) r[1] = x; else runs.push([x, x]); });
          return <div key={t.id} className="relative h-[22px] lg:h-[26px]">{runs.map(([a, b]) => <span key={a} className={`absolute inset-y-0 rounded-full line ${COL[t.id]}`} style={{ left: `${((a - 1) / 12) * 100}%`, width: `${((b - a + 1) / 12) * 100}%` }} />)}
            <span className="hidden lg:block absolute top-1/2 -translate-y-1/2 pl-2.5 text-[13px] font-extrabold whitespace-nowrap text-fixedink" style={{ left: `${((Math.min(...runs.map((r) => r[0])) - 1) / 12) * 100}%` }}>{t.period}{t.sub ? ` ${t.sub}` : ''}</span></div>;
        })}
      </div>
    </div>
  );
}

export function TipCards({ onPick }: { onPick: (month: number) => void }) {
  const now = monthOf(todayISO());
  const order = [...SEASON_TIPS].sort((a, b) => Number(b.months.includes(now) && b.id === 'rain') - Number(a.months.includes(now) && a.id === 'rain'));
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 items-stretch">
      {order.map((t) => {
        const isNow = t.months.includes(now) && t.id !== 'gulf' && t.id !== 'haze';
        return (
          <article key={t.id} className={`lift relative flex flex-col rounded-[28px] overflow-hidden bg-paper ${isNow ? 'shadow-[inset_0_0_0_2px_rgb(var(--primary))]' : 'line'}`}>
            {isNow && <span className="absolute top-3.5 right-3.5 z-[5] px-3.5 py-2 rounded-full bg-chili text-fixedink text-sm font-extrabold rotate-6 shadow-cta">지금 {now}월</span>}
            <div className="grain h-[170px] lg:h-[180px] border-b-[1.5px] rule"><Photo k={t.photo} /></div>
            <div className="p-[22px] flex flex-col gap-3 flex-1">
              <div className="flex flex-col gap-1"><h3 className="m-0 text-[28px] font-extrabold tracking-[-0.02em] leading-tight">{t.period}</h3>{t.sub && <span className="text-[15px] font-extrabold">{t.sub}</span>}</div>
              <div><Badge kind={seasonKind(t.badge)}>{t.badgeText}</Badge></div>
              <p className="m-0 text-[15px] font-bold leading-snug">{t.weather}</p>
              <div className="flex flex-col gap-2 text-[15px] leading-normal"><span className="flex gap-2"><span className="text-lagoon"><Icon name="check" size={18} sw={2.4} /></span><span>{t.pros}</span></span><span className="flex gap-2"><span className="text-chili-d"><Icon name="alert" size={18} /></span><span>{t.cons}</span></span></div>
              <p className="m-0 mt-1 pt-3 border-t border-hair serif-i text-xl leading-snug">“{t.quote}”</p>
              <button type="button" onClick={() => onPick(t.months.includes(now) ? now : t.months[0])} className={`btn mt-auto h-[52px] ${isNow ? 'btn-lagoon' : 'btn-line'}`}>이 시기로 계획하기 <Icon name="arrow" size={18} sw={2.4} /></button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
