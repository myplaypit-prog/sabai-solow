import { useState } from 'react';
import { periodInfo } from '../lib/period';
import { Badge, Kicker, seasonKind } from './ui';
import { Icon } from './Icon';
import { cityById } from '../data/cities';

export function PeriodPanel({ start, end, month, compact = false }: { start?: string; end?: string; month?: number; compact?: boolean }) {
  const [open, setOpen] = useState(true);
  const p = periodInfo({ start, end, month });
  if (!p.months.length) return null;
  return (
    <section aria-labelledby="pinfo" className="grain card rounded-[28px] p-5 lg:p-[30px] flex flex-col gap-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col gap-1.5"><Kicker className="!text-chili-d">이 기간의 여행 정보</Kicker><h2 id="pinfo" className="m-0 text-2xl lg:text-[28px] font-extrabold tracking-[-0.03em]">{p.label}</h2></div>
        <button type="button" aria-expanded={open} aria-controls="pinfo-body" onClick={() => setOpen(!open)} aria-label={open ? '패널 접기' : '패널 펼치기'} className="w-11 h-11 rounded-full bg-cloud grid place-items-center"><span className={open ? 'rotate-180' : ''}><Icon name="chevd" /></span></button>
      </div>
      {open && (
        <div id="pinfo-body" className="flex flex-col gap-5">
          <div>
            <h3 className="m-0 mb-1 text-base font-extrabold flex gap-2 items-center"><span className="text-lagoon"><Icon name="map" size={18} /></span>지역별 계절{p.months.length > 1 ? ` (${p.months[0]}월 기준)` : ''}</h3>
            <ul className="m-0 p-0 list-none">
              {p.regions.map((r) => (
                <li key={r.label} className="grid grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[92px_minmax(0,1fr)] gap-3 py-3.5 border-t border-hair">
                  <span className="font-extrabold">{r.label}</span>
                  <span className="flex flex-col gap-1.5 items-start"><Badge kind={seasonKind(r.badge)} size="sm">{r.text}</Badge><span className="text-[15px] leading-normal">{r.note}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`grid gap-3.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
            <div className="p-4 rounded-[18px] bg-mint flex flex-col gap-1.5"><span className="text-sm font-extrabold">가격 경향</span><span className="text-[17px] font-extrabold leading-snug">{p.price}</span></div>
            {p.rules.length > 0 && <div className="p-4 rounded-[18px] bg-lemon flex flex-col gap-1.5"><span className="text-sm font-extrabold">자동 적용 규칙</span>{p.rules.map((r) => <span key={r} className="text-base font-extrabold leading-snug">{r}</span>)}</div>}
          </div>
          {p.risks.length > 0 && <div><h3 className="m-0 mb-2.5 text-base font-extrabold">위험 요소</h3><ul className="m-0 p-0 list-none flex flex-col gap-2">{p.risks.map((r) => <li key={r} className="flex gap-2.5 text-[15px] leading-normal"><span className="text-chili-d"><Icon name="alert" size={18} /></span><span>{r}</span></li>)}</ul></div>}
          {p.avoid.length > 0 && <p className="m-0 text-[15px]"><b>피하면 좋은 곳</b> · {p.avoid.join(', ')}</p>}
          <div><h3 className="m-0 mb-2.5 text-base font-extrabold">기간에 걸린 금주일 · 축제</h3>
            {p.events.length === 0 ? <p className="m-0 text-[15px] text-muted">이 기간에 알려진 금주일·축제가 없어요.</p> :
              <ul className="m-0 p-0 list-none flex flex-col gap-2">{p.events.map((e) => (
                <li key={e.id} className="flex flex-col gap-1.5 px-3.5 py-3 rounded-2xl bg-cloud">
                  <span className="flex gap-2 items-center flex-wrap"><Badge kind={e.type === 'no_alcohol' ? 'nodrink' : 'fest'} size="sm" /><span className="text-sm font-extrabold">{e.dateText}</span></span>
                  <span className="font-extrabold">{e.title}</span>
                  <span className="text-sm text-muted">{e.cities === 'all' ? '전국' : e.cities.map((c) => cityById(c).name).join(', ')} · {e.message}</span>
                </li>))}</ul>}
          </div>
          <p className="m-0 text-[13px] leading-normal text-muted">기온·강수·가격은 일반적인 경향을 정리한 어림값이에요. 정식 서비스에서는 예보·대기질·실시간 가격으로 갱신해요.</p>
        </div>
      )}
    </section>
  );
}
