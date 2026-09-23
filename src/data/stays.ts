import type { Stay } from './types';
import { SPOT_CITIES } from './cities';
// 프로토타입: 화면 확인용 **임시 데이터**예요(실제 숙소·평점·가격 아님).
// 정식 데이터는 운영자가 구글맵에서 확인해 넣고 sample을 false로 바꿉니다.
export const THB_KRW = 42; // 임시 환율(1바트 ≈ 42원)
const BANDS: { band: 1 | 2 | 3; label: string; photo: string; base: number; tags: string[]; distance: string }[] = [
  { band: 1, label: '게스트하우스', photo: 'room', base: 22000, tags: ['1인 요금', '여성 전용 도미토리'], distance: '버스터미널 도보 10분' },
  { band: 2, label: '부티크 호텔', photo: 'room', base: 39000, tags: ['늦은 체크인', '1인실'], distance: '구시가지 도보 5분' },
  { band: 3, label: '리조트', photo: 'room', base: 68000, tags: ['24시간 리셉션', '픽업 가능'], distance: '역·터미널 차량 10분' },
];
export const BAND_LABEL = { 1: '3만원 이하', 2: '3~6만원', 3: '6~10만원' } as const;
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
export const STAYS: Stay[] = SPOT_CITIES.flatMap((c, ci) =>
  BANDS.map((b) => {
    const price = b.base + ((ci * 7 + b.band * 3) % 8) * 1000 * b.band; // 도시마다 조금씩 다른 임시 가격
    return {
      id: `${c.id}-${b.band}`, city: c.id, name: `${c.name} ${b.label} (샘플)`, band: b.band,
      rating: (4.5 + ((ci + b.band) % 4) / 10).toFixed(1), reviews: String(120 + ((ci * 37 + b.band * 91) % 880)),
      price, priceKrw: won(price), priceThb: `약 ${Math.round(price / THB_KRW / 10) * 10}바트`,
      site: '예시 사이트', checkedOn: '임시값', distance: b.distance, tags: b.tags, photo: b.photo, sample: true,
    };
  }));
export const stayById = (id?: string) => (id ? STAYS.find((s) => s.id === id) : undefined);
/** 일정 메모(notes['stay:도시'])에 저장된 값 → 표시 이름. 예전 일정은 이름 자체가 저장돼 있어요. */
export const stayName = (v?: string) => stayById(v)?.name ?? v;
/** 예산 안에서 가장 저렴한 숙소(숙박비 어림 계산용) */
export const cheapestStay = (city: string, budgetManwon: number) =>
  STAYS.filter((s) => s.city === city && s.price <= budgetManwon * 10000).sort((a, b) => a.price - b.price)[0];
export const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
