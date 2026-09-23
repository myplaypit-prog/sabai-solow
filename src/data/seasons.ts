import type { SeasonBadge, SeasonTip, Region } from './types';
// 기획안 6장. 기온·강수·가격은 일반적 경향의 어림값.
export const SEASON_TIPS: SeasonTip[] = [
  { id: 'peak', period: '11월~2월', months: [11, 12, 1, 2], badge: 'rec', badgeText: '추천 · 성수기', weather: '건기, 북부 아침 10~15°C · 낮 25~30°C', price: '숙소·교통 가격 상승, 축제 기간은 2~3배', pros: '걷기 좋고 하늘이 맑아요. 축제가 많아요.', cons: '로이끄라통·연말엔 숙소·야간버스가 일찍 매진돼요. 산간·러이 고원 새벽 한기.', quote: '최적기예요. 다만 가격이 오르고 매진이 빨라요.', photo: 'mist' },
  { id: 'haze', period: '2월 말~4월', sub: '북부', months: [3, 4], badge: 'warn', badgeText: '주의 · 연무기', weather: '건기, 기온 상승', price: '보통', pros: '관광객이 줄어요.', cons: '화전 연기로 미세먼지(PM2.5)가 심해요. 치앙마이·치앙라이·매싸롱·매홍손·난은 호흡기 질환자에게 비추천.', quote: '북부 대신 해안을 먼저 보세요.', photo: 'haze' },
  { id: 'heat', period: '3월~5월', months: [3, 4, 5], badge: 'warn', badgeText: '주의 · 폭염기', weather: '낮 35~40°C 이상', price: '보통(송크란 주간만 상승)', pros: '4월 송크란 물축제가 있어요.', cons: '열사병, 낮 야외 일정 피로. 일정을 오전·야간으로 옮겨 드려요.', quote: '후아힌·코싸멧·코타오 같은 해안을 추천해요.', photo: 'beach', recommend: ['huahin', 'kohsamet', 'kohtao'] },
  { id: 'rain', period: '6월~10월', months: [6, 7, 8, 9, 10], badge: 'save', badgeText: '알뜰 · 우기', weather: '오후 소나기, 8~9월 비가 가장 많아요', price: '숙소 20~40% 저렴(어림)', pros: '초록 풍경, 한적함. 걸프 섬(코타오)은 오히려 맑아요.', cons: '산사태·도로 침수, 하천 범람, 트레킹·동굴 투어 취소. 예비일 1일을 넣어 드려요.', quote: '가격은 좋지만 이동이 끊길 수 있어요.', photo: 'rice' },
  { id: 'gulf', period: '10월~12월', sub: '남부 걸프', months: [10, 11, 12], badge: 'save', badgeText: '알뜰 · 걸프 우기', weather: '촘폰·수랏타니·코타오, 11월 비 최다', price: '보통', pros: '같은 시기 안다만(꼬리뻬·트랑)은 건기가 시작돼요.', cons: '홍수, 코타오행 페리 결항, 다이빙 시야 저하.', quote: '남부는 안다만 쪽으로 바꿔 드려요.', photo: 'storm' },
];

export interface RegionSeason { badge: SeasonBadge; text: string; note: string; }
/** 지역·월별 계절 배지 (6장 표를 지역 단위로 풀어 쓴 규칙) */
export function regionSeason(region: Region, m: number): RegionSeason {
  const north = region === '북부' || region === '동북부';
  const gulf = region === '걸프' || region === '동부';
  if (region === '안다만') {
    if (m >= 5 && m <= 10) return { badge: 'warn', text: '주의 · 남부 우기', note: '폭우와 높은 파도, 꼬리뻬행 스피드보트 대폭 감편, 섬 숙소 다수 휴업' };
    if (m >= 11 || m <= 2) return { badge: 'rec', text: '추천 · 성수기', note: '건기, 맑은 바다. 가격 상승' };
    return { badge: 'warn', text: '주의 · 폭염기', note: '낮 35~40°C, 해안 위주로' };
  }
  if (gulf && m >= 10 && m <= 12) return { badge: 'warn', text: '주의 · 걸프 우기', note: '11월 비 최다, 코타오행 페리 결항·다이빙 시야 저하' };
  if (gulf && m >= 6 && m <= 9) return { badge: 'rec', text: '추천 · 걸프는 맑음', note: '우기지만 걸프 섬(코타오)은 오히려 맑아요' };
  if (m >= 11 || m <= 2) return { badge: 'rec', text: '추천 · 성수기', note: '건기, 걷기 좋음. 가격 상승·축제 매진 주의' };
  if (north && (m === 3 || m === 4)) return { badge: 'warn', text: '주의 · 연무기', note: '화전 연기로 PM2.5 심함' };
  if (m >= 3 && m <= 5) return { badge: 'warn', text: '주의 · 폭염기', note: '낮 35~40°C 이상, 오전·야간 위주 일정' };
  return { badge: 'save', text: '알뜰 · 우기', note: north ? '오후 소나기, 산간 도로 산사태·침수 주의' : '초록 풍경과 한적함, 숙소 저렴' };
}
export const PERIOD_REGIONS: { label: string; region: Region }[] = [
  { label: '북부', region: '북부' }, { label: '중부', region: '중부' }, { label: '걸프 연안', region: '걸프' }, { label: '안다만', region: '안다만' },
];
