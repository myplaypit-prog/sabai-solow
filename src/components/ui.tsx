import { Link, type LinkProps } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { PHOTO_ALT, photoSrc } from '../data/photos';
import type { BadgeKind } from '../lib/planner';

type BK = BadgeKind | 'safe' | 'noride';
const B: Record<BK, { cls: string; icon: string; label: string }> = {
  rec: { cls: 'bg-pist text-ink line', icon: 'sun', label: '추천' },
  warn: { cls: 'bg-butter text-fixedink line', icon: 'clock', label: '주의' },
  save: { cls: 'bg-lagoon text-on-lagoon', icon: 'rain', label: '알뜰' },
  nodrink: { cls: 'bg-night text-on-night ring-1 ring-inset ring-cloud/60', icon: 'nodrink', label: '금주일' },
  fest: { cls: 'bg-hib text-ink line', icon: 'spark', label: '축제' },
  holiday: { cls: 'bg-putty text-ink line', icon: 'calendar', label: '공휴일' },
  alert: { cls: 'bg-chili-d text-cloud', icon: 'alert', label: '경고' },
  safe: { cls: 'bg-mint text-ink line', icon: 'shield', label: '안심' },
  noride: { cls: 'bg-paper text-ink line', icon: 'check', label: '코끼리 탑승 없음' },
};
export const seasonKind = (b: string): BK => (b === 'rec' ? 'rec' : b === 'warn' ? 'warn' : 'save');
export function Badge({ kind, children, size = 'md' }: { kind: BK; children?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const b = B[kind];
  const sz = size === 'sm' ? 'text-[13px] px-2.5 py-1 gap-1.5' : size === 'lg' ? 'text-base px-3.5 py-2 gap-2' : 'text-sm px-3 py-1.5 gap-1.5';
  return <span className={`inline-flex items-center rounded-full font-bold leading-tight whitespace-nowrap ${sz} ${b.cls}`}><Icon name={b.icon} size={size === 'sm' ? 14 : 16} sw={2.2} />{children ?? b.label}</span>;
}
export function Photo({ k, className = '', pos = 'center', eager = false }: { k: string; className?: string; pos?: string; eager?: boolean }) {
  return <img src={photoSrc(k)} alt={PHOTO_ALT[k] ?? ''} loading={eager ? 'eager' : 'lazy'} decoding="async" className={`block w-full h-full object-cover ${className}`} style={{ objectPosition: pos }} />;
}
export function Logo({ size = 28, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <Link to="/" aria-label="Sabai Solow 홈" className={`inline-flex flex-col gap-1 no-underline ${onDark ? 'text-on-night' : 'text-ink'}`}>
      <span className="font-grot font-extrabold leading-none tracking-[-0.035em]" style={{ fontSize: size }}>Sabai Solo<span className="text-chili">w</span></span>
      <span className="font-semibold tracking-[.04em] leading-none" style={{ fontSize: Math.max(11, Math.round(size * 0.42)) }}>slow &amp; solo</span>
    </Link>
  );
}
export function Btn({ to, children, kind = 'lagoon', icon = 'arrow', className = '', ...rest }: { to: string; children: ReactNode; kind?: 'lagoon' | 'line' | 'butter'; icon?: string | null; className?: string } & Omit<LinkProps, 'to'>) {
  return <Link to={to} className={`btn btn-${kind} ${className}`} {...rest}>{children}{icon && <Icon name={icon} size={20} sw={2.4} />}</Link>;
}
export function ExtLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) { return <span className={`kicker ${className}`}>{children}</span>; }
