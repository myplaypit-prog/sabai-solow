import { Link, type LinkProps } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { PHOTO_ALT, photoSrc } from '../data/photos';
import type { BadgeKind } from '../lib/planner';

type BK = BadgeKind | 'safe' | 'noride';
const B: Record<BK, { cls: string; icon: string; label: string }> = {
  rec: { cls: 'bg-sage-t text-sage', icon: 'sun', label: '추천' },
  warn: { cls: 'bg-mango-t text-mango-d', icon: 'clock', label: '주의' },
  save: { cls: 'bg-sky-t text-sky-d', icon: 'rain', label: '알뜰' },
  nodrink: { cls: 'bg-alert-t text-alert-d', icon: 'nodrink', label: '금주일' },
  fest: { cls: 'bg-mango-t text-mango-d', icon: 'spark', label: '축제' },
  holiday: { cls: 'bg-oat text-marine', icon: 'calendar', label: '공휴일' },
  alert: { cls: 'bg-primary text-on-primary', icon: 'alert', label: '경고' },
  safe: { cls: 'bg-sage-t text-sage', icon: 'shield', label: '안심' },
  noride: { cls: 'bg-card text-sage line', icon: 'check', label: '코끼리 탑승 없음' },
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
/** Stitch 로고의 S 마크: 둥근 사각 테두리 + 끝이 말린 S (saffron) */
export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={`shrink-0 text-saffron ${className}`}>
      <rect x="5" y="5" width="54" height="54" rx="15" stroke="currentColor" strokeWidth="4.5" />
      <path d="M43 21.5C40.5 17.5 35.5 16 31 16.5 24.5 17.2 20.5 21 21 26c.6 5.5 6.5 7 11.5 8 5.5 1.1 11 3 10.7 8.5-.3 5.3-5.4 8-11.7 7.5-5-.4-8.7-2.5-10.5-6" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M43 21.5c2.4 3.4-1.6 6-4 3.6M21 44c-2.4-3.4 1.6-6 4-3.6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
/** 워드마크의 w: saffron + 위로 돋아난 잎 두 장 */
function LeafyW() {
  return (
    <span className="relative inline-block text-saffron">w
      <svg viewBox="0 0 24 20" aria-hidden="true" className="absolute text-saffron" style={{ width: '0.62em', height: '0.52em', right: '-0.34em', top: '-0.28em' }}>
        <path d="M3 18C4 10 9 4 17 2c0 7-5 13-14 16Z" fill="currentColor" />
        <path d="M11 19c1-4.5 4.5-7.5 11-8-1 4.5-5 7.5-11 8Z" fill="currentColor" opacity=".85" />
      </svg>
    </span>
  );
}
export function Logo({ size = 22, onDark = false, tagline = true }: { size?: number; onDark?: boolean; tagline?: boolean }) {
  return (
    <Link to="/" aria-label="Sabai Solow 홈" className={`inline-flex items-center gap-2.5 no-underline ${onDark ? 'text-on-night' : 'text-logo'}`}>
      <LogoMark size={Math.round(size * 1.75)} />
      <span className="flex flex-col gap-0.5">
        <span className="font-logo font-bold leading-none tracking-[-0.01em] pr-[0.35em]" style={{ fontSize: size }}>Sabai Solo<LeafyW /></span>
        {tagline && <span className="font-logo font-medium leading-none tracking-[.01em] opacity-80" style={{ fontSize: Math.max(10, Math.round(size * 0.5)) }}>peaceful + lively solo travels</span>}
      </span>
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
