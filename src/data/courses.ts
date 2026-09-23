import type { Course } from './types';
// 기획안 5장 '추천 코스' A~H. stops = 숙박 도시와 박 수(0박 = 환승).
export const COURSES: Course[] = [
  { id: 'A', name: '북부 슬로우 루프', days: 10, start: 'bangkok', end: 'bangkok', photo: 'north_temple', route: '방콕 → 람빵 → 프레 → 난 → 치앙라이 → 치앙마이 → 방콕', transport: '야간열차 · 고속버스 · 국내선', interests: ['temple', 'cafe', 'nature'], regions: ['북부'],
    stops: [{ city: 'lampang', nights: 1 }, { city: 'phrae', nights: 1 }, { city: 'nan', nights: 2 }, { city: 'chiangrai', nights: 2 }, { city: 'chiangmai', nights: 3 }] },
  { id: 'B', name: '매홍손 산악 루프', days: 7, start: 'chiangmai', end: 'chiangmai', photo: 'banrakthai', route: '치앙마이 → 빠이 → 매홍손 → 치앙마이', transport: '미니밴 · 국내선', interests: ['nature', 'yoga', 'cafe'], regions: ['북부'],
    stops: [{ city: 'chiangmai', nights: 2 }, { city: 'pai', nights: 2 }, { city: 'maehongson', nights: 2 }] },
  { id: 'C', name: '남부 정글 & 미식', days: 7, start: 'bangkok', end: 'bangkok', photo: 'karst_boat', route: '방콕 → 수랏타니 → 카오속 → 트랑 → 방콕', transport: '야간열차 · 미니밴', interests: ['nature', 'cafe'], regions: ['안다만'],
    stops: [{ city: 'suratthani', nights: 0 }, { city: 'khaosok', nights: 3 }, { city: 'trang', nights: 3 }] },
  { id: 'D', name: '역사와 강변', days: 7, start: 'bangkok', end: 'chiangmai', photo: 'sukhothai', route: '방콕 → 칸차나부리 → 방콕 → 수코타이 → 치앙마이', transport: '기차 · 미니밴 · 고속버스', interests: ['temple', 'nature'], regions: ['서부', '중부', '북부'],
    stops: [{ city: 'kanchanaburi', nights: 2 }, { city: 'bangkok', nights: 0 }, { city: 'sukhothai', nights: 2 }, { city: 'chiangmai', nights: 2 }] },
  { id: 'E', name: '메콩강 감성', days: 6, start: 'bangkok', end: 'bangkok', photo: 'mekong', route: '방콕 → 러이 → 치앙칸 → 러이 → 방콕', transport: '야간버스·항공 · 송태우', interests: ['cafe', 'yoga', 'nature'], regions: ['동북부'],
    stops: [{ city: 'loei', nights: 1 }, { city: 'chiangkhan', nights: 3 }, { city: 'loei', nights: 1 }] },
  { id: 'F', name: '걸프 해안과 코타오', days: 10, start: 'bangkok', end: 'bangkok', photo: 'kohtao', route: '방콕 → 후아힌 → 촘폰 → 코타오 → 수랏타니 → 카오속 → 방콕', transport: '기차 · 고속페리 · 미니밴 · 야간열차·항공', interests: ['sea', 'nature', 'work'], regions: ['걸프', '안다만'],
    stops: [{ city: 'huahin', nights: 2 }, { city: 'chumphon', nights: 1 }, { city: 'kohtao', nights: 3 }, { city: 'suratthani', nights: 1 }, { city: 'khaosok', nights: 2 }] },
  { id: 'G', name: '안다만 남쪽 섬', days: 7, start: 'bangkok', end: 'bangkok', photo: 'lipe', route: '방콕 → 트랑 → 꼬리뻬 → 트랑 → 방콕', transport: '항공·야간열차 · 미니밴 + 스피드보트(11~5월만)', interests: ['sea', 'yoga'], regions: ['안다만'],
    stops: [{ city: 'trang', nights: 2 }, { city: 'kohlipe', nights: 3 }, { city: 'trang', nights: 1 }] },
  { id: 'H', name: '방콕 근교 쉼표', days: 4, start: 'bangkok', end: 'bangkok', photo: 'huahin', route: '방콕 → 코싸멧 → 방콕, 또는 방콕 → 후아힌', transport: '버스·미니밴 + 페리 · 기차', interests: ['sea', 'yoga', 'work'], regions: ['동부', '걸프'],
    stops: [{ city: 'kohsamet', nights: 3 }] },
];
export const courseById = (id: string) => COURSES.find((c) => c.id === id)!;
