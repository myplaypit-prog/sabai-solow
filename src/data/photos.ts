import meta from './photo-meta.json';
// 모든 사진: Unsplash 무료 라이선스. 출처(촬영자)를 함께 기록합니다.
export const PHOTO_ALT: Record<string, string> = {
  khaosok: '카오속 치어란 호수의 에메랄드빛 물과 석회암 절벽', solo_hat: '모자를 쓴 여행자가 산골 마을을 내려다보는 뒷모습', solo_ruins: '모자를 쓴 여행자가 사원 유적을 바라보는 뒷모습',
  north_temple: '북부 란나 양식 사원과 하얀 탑', banrakthai: '매홍손 반락타이 마을의 차밭과 전통 가옥', karst_boat: '석회암 봉우리 사이 강가에 정박한 롱테일 보트', sukhothai: '해 질 녘 수코타이 역사공원 유적',
  mekong: '노을 진 메콩강과 산 능선', kohtao: '코타오 낭유안 섬 전망대에서 바다를 바라보는 사람', lipe: '꼬리뻬 해변의 롱테일 보트들', huahin: '후아힌 표지판과 붉은 목조 건물',
  cm_temple: '치앙마이 황금 탑이 있는 사원', elephant: '초록 숲 옆 들판에서 풀을 먹으며 쉬는 어미 코끼리와 새끼 코끼리', elephant2: '진흙 목욕을 하는 어미 코끼리와 새끼 코끼리', cooking: '쿠킹클래스에서 함께 요리하는 사람들', thaifood: '바나나잎 위에 차린 태국 요리',
  zipline: '산비탈 정글 위를 짚라인으로 건너는 사람', trek: '숲 사이로 이어진 트레킹 길', tea_rows: '곡선으로 이어진 차밭', tea_hill: '매싸롱 차밭 언덕과 정자', lantern: '밤하늘로 떠오르는 이펭 풍등',
  nightmarket: '불 밝힌 야시장 골목', songthaew: '비 온 거리를 달리는 빨간 송태우', whitetemple: '치앙라이 백색사원과 연못', rice: '안개 낀 산골의 초록 논', mist: '산 능선 위 운해', kwai: '칸차나부리 콰이강의 다리',
  lampang: '람빵역 목조 플랫폼', train: '기차 창밖으로 보이는 강과 산', room: '바다가 보이는 부티크 객실', pai: '빠이 캐니언 절벽과 숲', beach: '맑은 날 태국 해변과 롱테일 보트', boatrace: '꽃과 천으로 장식한 롱테일 보트 뱃머리', haze: '연무가 낀 겹겹의 산 능선', storm: '바다 위로 몰려오는 먹구름',
  cafe: '열대 정원 카페의 나무 테이블에서 혼자 쉬는 여행자',
};
export const photoSrc = (k: string) => `./photos/${k}.jpg`;
/** WebP(640px·1280px). scripts/make-webp.py가 jpg에서 만들어요 */
export const photoWebp = (k: string) => [`./photos/${k}-640.webp`, `./photos/${k}.webp`];
export const photoSrcSet = (k: string) => { const [s, b] = photoWebp(k); return `${s} 640w, ${b} 1280w`; };
/** Google Stitch로 만든 AI 생성 이미지(실제 장소 사진이 아님) */
export const GENERATED: { key: string; note: string }[] = [{ key: 'cafe', note: 'Google Stitch 생성 이미지(AI) · 홈 첫 화면' }];
export const ALL_CREDITS = Object.entries(meta as Record<string, { user: string; id: string }>).map(([k, m]) => ({ key: k, name: m.user, url: `https://unsplash.com/photos/${m.id}` }));
