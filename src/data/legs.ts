import type { Leg, TransportOption } from './types';
// 기획안 5장 '구간별 교통편(어림)'. 출시 전 운행사 시간표로 검증 필요.
const o = (mode: TransportOption['mode'], label: string, hours: number, hoursText: string, extra: Partial<TransportOption> = {}): TransportOption => ({ mode, label, hours, hoursText, ...extra });
const L: Leg[] = [
  { from: 'bangkok', to: 'chiangmai', options: [o('night_train', '야간열차 침대칸', 13, '11~13h', { overnight: true, ladies: true, note: '특급 9/10호 여성·유아 전용 침대칸' }), o('night_bus', 'VIP 야간버스', 10, '9~10h', { overnight: true }), o('flight', '국내선', 1.2, '1h10m')] },
  { from: 'bangkok', to: 'lampang', options: [o('night_train', '야간열차 침대칸', 10, '약 10h', { overnight: true, ladies: true, note: '방콕–치앙마이 노선(특급 9/10호 여성 전용칸)' }), o('bus', '고속버스', 9, '8~9h'), o('flight', '국내선', 1, '1h')] },
  { from: 'chiangmai', to: 'lampang', options: [o('train', '기차', 3, '2~3h'), o('bus', '버스', 2, '1.5~2h')] },
  { from: 'lampang', to: 'phrae', options: [o('bus', '버스', 2, '2h'), o('train', '기차(덴차이역 경유)', 3, '덴차이역 경유')] },
  { from: 'phrae', to: 'nan', options: [o('bus', '버스', 2.5, '2~2.5h')] },
  { from: 'nan', to: 'chiangrai', options: [o('bus', '버스', 6, '5~6h', { note: '가장 긴 구간 · 이동 당일 오후는 비워 둬요' })] },
  { from: 'chiangmai', to: 'chiangrai', options: [o('bus', '버스', 3.5, '3~3.5h')] },
  { from: 'chiangrai', to: 'maesalong', options: [o('songthaew', '매짠까지 버스 + 송태우', 2, '1.5~2h')] },
  { from: 'chiangmai', to: 'pai', options: [o('minivan', '미니밴', 3, '3h', { note: '762굽이 산길' })] },
  { from: 'pai', to: 'maehongson', options: [o('minivan', '미니밴', 3, '2.5~3h')] },
  { from: 'maehongson', to: 'chiangmai', options: [o('flight', '국내선', 0.7, '약 40분'), o('minivan', '미니밴(빠이 경유)', 6, '5~6h')] },
  { from: 'chiangmai', to: 'sukhothai', options: [o('bus', '버스', 6, '5~6h')] },
  { from: 'bangkok', to: 'sukhothai', options: [o('bus', '버스', 7, '6~7h'), o('flight', '국내선', 1.2, '1h10m')] },
  { from: 'bangkok', to: 'kanchanaburi', options: [o('train', '기차(톤부리역)', 3, '3h'), o('bus', '버스', 3, '2.5~3h'), o('minivan', '미니밴', 2.5, '2~2.5h')] },
  { from: 'kanchanaburi', to: 'bangkok', options: [o('minivan', '미니밴', 2.5, '2~2.5h'), o('train', '기차(톤부리역)', 3, '3h')] },
  { from: 'sukhothai', to: 'chiangmai', options: [o('bus', '버스', 6, '5~6h')] },
  { from: 'bangkok', to: 'loei', options: [o('night_bus', '야간버스', 10, '9~10h', { overnight: true }), o('flight', '국내선(러이 공항)', 1, '1h')] },
  { from: 'loei', to: 'chiangkhan', options: [o('songthaew', '버스·송태우', 1.5, '1~1.5h')] },
  { from: 'bangkok', to: 'huahin', options: [o('train', '기차', 4.5, '3.5~4.5h'), o('bus', '버스', 4, '3~4h'), o('minivan', '미니밴', 3, '3h')] },
  { from: 'bangkok', to: 'kohsamet', options: [o('ferry', '미니밴 + 페리', 3.7, '미니밴 3h + 페리 30~40분'), o('bus', '버스(반페) + 페리', 4, '반페까지 3~3.5h')] },
  { from: 'huahin', to: 'chumphon', options: [o('train', '기차', 5, '4~5h'), o('bus', '버스', 4, '4h'), o('minivan', '미니밴', 4, '4h')] },
  { from: 'bangkok', to: 'chumphon', options: [o('night_train', '야간열차 침대칸', 9, '7~9h', { overnight: true }), o('flight', '국내선', 1, '1h')] },
  { from: 'chumphon', to: 'kohtao', options: [o('ferry', '고속페리', 2, '1.5~2h', { note: '10~12월 결항 가능' })] },
  { from: 'kohtao', to: 'suratthani', options: [o('ferry', '페리 + 버스 연계', 7, '5~7h')] },
  { from: 'chumphon', to: 'suratthani', options: [o('train', '기차', 3, '2~3h'), o('bus', '버스', 3, '3h')] },
  { from: 'bangkok', to: 'suratthani', options: [o('night_train', '야간열차 침대칸', 11, '9~11h', { overnight: true, ladies: true, note: '31/32호 여성 전용칸(방콕–수랏타니 구간)' }), o('flight', '국내선', 1.2, '1h10m')] },
  { from: 'suratthani', to: 'khaosok', options: [o('minivan', '미니밴', 2, '2h'), o('bus', '버스', 2.5, '2~2.5h')] },
  { from: 'khaosok', to: 'trang', options: [o('minivan', '미니밴(수랏타니 경유)', 5, '약 5h(임시)', { note: '소요 시간 임시값 · 운행사 확인 필요' })] },
  { from: 'bangkok', to: 'trang', options: [o('night_train', '야간열차 침대칸', 16, '15~16h', { overnight: true }), o('flight', '국내선', 1.5, '1h30m')] },
  { from: 'trang', to: 'kohlipe', options: [o('ferry', '미니밴 + 스피드보트', 3.5, '빡바라 항까지 1.5~2h + 1.5h', { seasonal: '11~5월 운항 · 5~10월 대폭 감편' })] },
];
export const LEGS = L;
export const hasLeg = (from: string, to: string) => L.some((l) => (l.from === from && l.to === to) || (l.from === to && l.to === from));
/** 직통 구간이 없을 때 거쳐 갈 교통 거점 */
export const HUBS = ['bangkok', 'chiangmai', 'suratthani', 'trang'];
export function findLeg(from: string, to: string): Leg {
  const direct = L.find((l) => l.from === from && l.to === to);
  if (direct) return direct;
  const rev = L.find((l) => l.from === to && l.to === from);
  if (rev) return { from, to, options: rev.options };
  return { from, to, options: [{ mode: 'bus', label: '[교통편 확인 필요]', hours: 0, hoursText: '[소요 시간 빈칸]' }] };
}
export const BOOKING = {
  train: [{ name: '태국철도 D-Ticket', url: 'https://dticket.railway.co.th/' }, { name: '12Go', url: 'https://12go.asia/' }],
  bus: [{ name: '12Go', url: 'https://12go.asia/' }, { name: 'BusX', url: 'https://www.busandvan.com/' }, { name: 'BusOnlineTicket', url: 'https://www.busonlineticket.co.th/' }, { name: '나콘챠이어', url: 'https://www.nakhonchaiair.com/' }],
  minivan: [{ name: '12Go', url: 'https://12go.asia/' }, { name: 'Bookaway', url: 'https://www.bookaway.com/' }],
  ferry: [{ name: '12Go', url: 'https://12go.asia/' }, { name: 'Bookaway', url: 'https://www.bookaway.com/' }],
  flight: [{ name: '항공 검색', url: 'https://www.google.com/travel/flights' }],
};
