import { useEffect, useRef } from 'react';
import { tourById } from '../data/tours';
import { cityById } from '../data/cities';
import type { TourType } from '../data/types';
import { Badge, Kicker, Photo, ExtLink } from './ui';
import { Icon } from './Icon';
import { useApp } from '../state';

export function TourBlocks({ id, rainy }: { id: TourType; rainy?: boolean }) {
  const t = tourById(id);
  const L = ({ items, icon, cls }: { items: string[]; icon: string; cls: string }) => <ul className="m-0 p-0 list-none flex flex-col gap-2">{items.map((x) => <li key={x} className="flex gap-2.5 text-base leading-normal"><span className={cls}><Icon name={icon} size={18} sw={2.2} /></span><span>{x}</span></li>)}</ul>;
  const B = [
    { n: '01', h: '어떤 서비스인가', bg: 'bg-paper', c: <p className="m-0 text-base leading-relaxed">{t.what}</p> },
    { n: '02', h: '준비할 것', bg: 'bg-mint', c: <L items={t.prepare} icon="bag" cls="text-lagoon" /> },
    { n: '03', h: '주의할 점', bg: 'bg-lemon', c: <L items={t.cautions} icon="alert" cls="text-chili-d" /> },
    { n: '04', h: '추천 포인트', bg: 'bg-hib', c: <L items={t.highlights} icon="star" cls="" /> },
  ];
  return (<>
    {rainy && t.rainyCaution && <div role="note" className="p-4 rounded-[18px] bg-butter text-fixedink line flex gap-2.5 text-[15px] leading-normal"><Icon name="rain" size={22} /><span><b>시기 주의 · 우기</b><br />{t.rainyCaution}</span></div>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{B.map((b) => <section key={b.n} className={`p-5 rounded-[22px] line flex flex-col gap-3 ${b.bg}`}><h3 className="m-0 flex items-baseline gap-2.5 text-[19px] font-extrabold"><span className="serif-i text-[26px] text-chili-d">{b.n}</span>{b.h}</h3>{b.c}</section>)}</div>
  </>);
}

export function TourSheet({ id, onClose, onAdd, rainy, context, added = false }: { id: TourType; onClose: () => void; onAdd?: () => void; rainy?: boolean; context?: string; added?: boolean }) {
  const t = tourById(id); const { online } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  // onClose는 부모가 렌더할 때마다 새로 만들어져요. ref로 들고 있어야 포커스·스크롤 잠금이 한 번만 걸려요.
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => { const prev = document.activeElement as HTMLElement | null; ref.current?.focus(); const k = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); }; document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus(); }; }, []);
  return (
    <div className="fixed inset-0 z-[70] flex items-end lg:items-start justify-center lg:pt-16 overflow-y-auto" role="presentation">
      <button type="button" aria-label="닫기" onClick={onClose} className="fixed inset-0 bg-[rgba(15,22,40,.55)] cursor-default" />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tour-title" className="rise relative w-full lg:w-[1040px] max-h-[92vh] lg:max-h-none overflow-y-auto rounded-t-[32px] lg:rounded-[36px] bg-cloud shadow-2xl outline-none">
        <div className="lg:hidden flex justify-center pt-2.5 pb-1.5"><span className="w-12 h-[5px] rounded-full bg-putty" /></div>
        <div className="relative grid lg:grid-cols-[1.6fr_1fr] gap-2 p-2 h-[230px] lg:h-[380px]">
          <div className="zoom rounded-3xl lg:rounded-[28px_12px_12px_12px] overflow-hidden"><Photo k={t.photo} /></div>
          <div className="hidden lg:block zoom rounded-[12px_28px_12px_12px] overflow-hidden"><Photo k={t.photo2} /></div>
          <button type="button" aria-label="닫기" onClick={onClose} className="absolute top-4 right-4 lg:top-[22px] lg:right-[22px] w-11 h-11 lg:w-[52px] lg:h-[52px] rounded-full bg-paper line grid place-items-center"><Icon name="x" size={22} sw={2.4} /></button>
          {t.noRiding && <span className="absolute left-5 bottom-5 lg:left-7 lg:bottom-[26px] -rotate-[4deg] px-4 py-2.5 rounded-2xl bg-butter text-fixedink shadow-soft text-[17px] font-extrabold flex gap-2 items-center"><Icon name="check" sw={2.6} />코끼리 탑승 없음</span>}
        </div>
        <div className="px-4 lg:px-10 pt-5 lg:pt-7 pb-8 lg:pb-9 flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
            <div className="flex flex-col gap-2.5"><Kicker>Local tour{context ? ` · ${context}` : ''}</Kicker>
              <h2 id="tour-title" className="m-0 text-[40px] lg:text-[52px] leading-[1.05] font-extrabold tracking-[-0.03em]">{t.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[15px] lg:text-base font-semibold"><span className="flex gap-1.5 items-center"><Icon name="pin" size={18} />{t.cities.map((c) => cityById(c).name).join(', ')}</span><span className="flex gap-1.5 items-center"><Icon name="clock" size={18} />{t.duration}</span><span className="flex gap-1.5 items-center"><Icon name="bag" size={18} />{t.priceBand}</span></div></div>
            <div className="flex gap-2.5">{onAdd && (added
                ? <span role="status" className="btn btn-line h-14 opacity-70"><Icon name="check" size={18} sw={2.4} />일정에 담았어요</span>
                : <button type="button" onClick={onAdd} className="btn btn-line h-14"><Icon name="plus" size={18} sw={2.4} />일정에 담기</button>)}
              {online ? <ExtLink href={t.links[0].url} className="btn btn-lagoon h-14 flex-1 lg:flex-none">예약 사이트 열기 <Icon name="ext" size={18} /></ExtLink> : <span aria-disabled="true" className="btn btn-lagoon h-14 opacity-45">오프라인이라 링크를 꺼 뒀어요</span>}</div>
          </div>
          <TourBlocks id={id} rainy={rainy} />
          <div className="flex flex-col lg:flex-row lg:justify-between gap-2 pt-4 border-t-[1.5px] rule text-sm text-muted">
            <span className="flex flex-wrap gap-x-3 gap-y-1">예약 사이트: {t.links.map((l) => online ? <ExtLink key={l.name} href={l.url} className="underline font-bold text-ink">{l.name}</ExtLink> : <span key={l.name}>{l.name}</span>)} (일반 링크)</span>
            <span>투어 내용·가격은 업체마다 달라요 · 확인일 기준</span>
          </div>
          {t.noRiding && <div><Badge kind="noride" /></div>}
        </div>
      </div>
    </div>
  );
}
