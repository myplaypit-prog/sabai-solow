import type { Tour } from './types';
// 기획안 11장. 투어 내용·가격은 업체마다 다름 — 일반 안내.
const links = (q: string) => [
  { name: 'Klook', url: `https://www.klook.com/search/result/?query=${encodeURIComponent(q)}` },
  { name: 'KKday', url: `https://www.kkday.com/ko/product/productlist?keyword=${encodeURIComponent(q)}` },
  { name: 'GetYourGuide', url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}` },
  { name: 'Viator', url: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(q)}` },
];
export const TOURS: Tour[] = [
  { id: 'elephant', name: '코끼리 목욕', cities: ['chiangmai', 'khaosok'], photo: 'elephant', photo2: 'elephant2', duration: '반나절 · 하루', priceBand: '[가격대]', noRiding: true,
    what: '코끼리 탑승이 없는 보호소에서 먹이를 주고 강·진흙 목욕을 함께하는 반나절·하루 프로그램이에요.',
    prepare: ['젖어도 되는 옷·수영복', '갈아입을 옷, 수건', '아쿠아슈즈', '방수팩', '선크림·벌레 기피제'],
    cautions: ['코끼리 탑승·쇼가 있는 곳은 소개하지 않아요', '코끼리가 원할 때만 목욕하는 방식인지 확인', '코끼리 뒤·바로 옆에 서지 않기', '보통 전날까지 예약'],
    highlights: ['가까이서 코끼리와 교감', '숙소 픽업 포함이 많아요', '혼자 온 참가자도 많아요'], links: links('elephant sanctuary bathing chiang mai') },
  { id: 'cooking', name: '쿠킹클래스', cities: ['chiangmai', 'pai', 'chiangrai'], photo: 'cooking', photo2: 'thaifood', duration: '반나절 · 하루', priceBand: '[가격대]',
    what: '시장에서 재료를 고르고 태국 요리 4~5가지를 직접 만드는 반나절·하루 수업이에요.',
    prepare: ['편한 옷', '알레르기·채식 여부 미리 알림'], cautions: ['매운 정도 조절 요청', '오전·오후·저녁 반 중 선택'],
    highlights: ['1인 1조리대', '레시피북 제공', '만든 요리를 함께 먹어 혼밥 부담이 없어요'], links: links('thai cooking class chiang mai') },
  { id: 'zipline', name: '짚라인', cities: ['chiangmai'], photo: 'zipline', photo2: 'trek', duration: '2~4시간', priceBand: '[가격대]',
    what: '정글 나무 사이를 와이어로 이동하는 2~4시간 코스예요. 구간 수·길이는 업체마다 달라요.',
    prepare: ['운동화', '긴바지', '벌레 기피제', '소지품 최소화'], cautions: ['키·체중 제한과 보험 포함 여부 확인', '안전 장비 설명 듣기', '우기엔 미끄러움'],
    highlights: ['짧은 시간에 정글 풍경', '혼자 가도 그룹으로 진행'], rainyCaution: '우기라 미끄럽고 거머리가 많은 시기예요.', links: links('zipline chiang mai') },
  { id: 'trekking', name: '트레킹', cities: ['chiangmai', 'chiangrai', 'pai', 'maehongson', 'khaosok'], photo: 'trek', photo2: 'rice', duration: '반나절 ~ 1박 2일', priceBand: '[가격대]',
    what: '가이드와 함께 숲길·폭포·산간 마을을 걷는 반나절~1박 2일 코스예요.',
    prepare: ['트레킹화', '우비', '물', '벌레·거머리 기피제', '긴 옷'], cautions: ['우기엔 길이 미끄럽고 거머리가 많아요', '난이도·거리 확인', '국립공원은 가이드 동행', '마을 주민 사진은 허락받기'],
    highlights: ['대중교통으로 못 가는 자연을 안전하게', '1박 코스는 현지 마을 숙박 체험'], rainyCaution: '우기라 미끄럽고 거머리가 많은 시기예요. 가이드 동행 코스를 추천해요.', links: links('jungle trekking chiang mai') },
];
export const tourById = (id: string) => TOURS.find((t) => t.id === id)!;
