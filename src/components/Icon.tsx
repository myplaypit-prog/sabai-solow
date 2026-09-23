const P: Record<string, string> = {
  arrow: 'M5 12h14M13 6l6 6-6 6', back: 'M19 12H5M11 6l-6 6 6 6', arrowdr: 'M7 7l10 10M17 8v9H8', chev: 'M9 6l6 6-6 6', chevd: 'M6 9l6 6 6-6',
  rain: 'M20 15.5A4.5 4.5 0 0 0 17.5 7a6 6 0 0 0-11.3 1.7A4 4 0 0 0 6 16.5M8 19v2M12 17v4M16 19v2',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  train: 'M8 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM5 11h14M9 21l-2-4M15 21l2-4',
  bus: 'M7 3h10a3 3 0 0 1 3 3v12H4V6a3 3 0 0 1 3-3zM4 11h16M7 21v-3M17 21v-3',
  plane: 'M2 16l20-6-3-3-7 2-5-5-2 1 3 6-4 1-2-2-1 1 2 4z', boat: 'M3 16l2 4h14l2-4zM12 3v13M12 5l6 8h-6',
  nodrink: 'M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v7M8 21h8M3 3l18 18', spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', bed: 'M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  route: 'M6 16.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM18 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  menu: 'M4 7h16M4 12h16M4 17h16', x: 'M6 6l12 12M18 6L6 18', user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0',
  home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z', compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', save: 'M6 3h12v18l-6-4-6 4z', download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  offline: 'M3 3l18 18M8.5 8.8A6 6 0 0 0 6 13a4 4 0 0 0 4 4h7M12 6a6 6 0 0 1 5.7 4.2A4 4 0 0 1 20 16',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14', check: 'M5 12l5 5 9-10', info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5h.01',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01', mail: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 7l9 6 9-6',
  lock: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3', eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  bag: 'M6 8h12l-1 13H7zM9 8V6a3 3 0 0 1 6 0v2', ext: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M18 13l-6 6-6-6', copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
};
export function Icon({ name, size = 20, sw = 2, className = '' }: { name: keyof typeof P | string; size?: number; sw?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={P[name] ?? P.info} />
    </svg>
  );
}
