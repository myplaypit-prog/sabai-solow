import type { Stay } from './types';
import { SPOT_CITIES } from './cities';
// 프로토타입: 운영자가 구글맵에서 확인해 입력할 자리. 지금은 값이 없어 [빈칸]으로 둡니다.
const BANDS: { band: 1 | 2 | 3; label: string; photo: string }[] = [
  { band: 1, label: '게스트하우스', photo: 'room' }, { band: 2, label: '부티크', photo: 'room' }, { band: 3, label: '리조트형', photo: 'room' },
];
export const BAND_LABEL = { 1: '3만원 이하', 2: '3~6만원', 3: '6~10만원' } as const;
export const STAYS: Stay[] = SPOT_CITIES.flatMap((c) =>
  BANDS.map((b) => ({ id: `${c.id}-${b.band}`, city: c.id, name: `[숙소명] · ${b.label}`, band: b.band, rating: '[평점]', reviews: '[리뷰 수]', priceKrw: '[최저가 원]', priceThb: '[바트]', site: '[최저가 사이트]', checkedOn: '[확인 날짜]', distance: '[터미널·역까지 거리]', tags: b.band === 1 ? ['1인 요금'] : b.band === 2 ? ['늦은 체크인'] : ['24시간 리셉션'], photo: b.photo })));
export const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
