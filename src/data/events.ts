import type { CalendarEvent } from './types';
// 기획안 7장. 2026년 샘플 데이터 — 매년 태국 정부·TAT 발표로 갱신.
export const EVENTS: CalendarEvent[] = [
  { id: 'makha', type: 'no_alcohol', title: '마카부차', dateText: '3월 3일(화)', from: '2026-03-03', to: '2026-03-03', cities: 'all', message: '불교 기념일이라 편의점·식당·바에서 술을 팔지 않아요. 허가받은 호텔은 예외일 수 있어요.' },
  { id: 'visakha', type: 'no_alcohol', title: '위사카부차', dateText: '5월 31일(일)', from: '2026-05-31', to: '2026-05-31', cities: 'all', message: '불교 기념일이라 편의점·식당·바에서 술을 팔지 않아요.' },
  { id: 'asanha', type: 'no_alcohol', title: '아산하부차 + 카오파나', dateText: '7월 29~30일', from: '2026-07-29', to: '2026-07-30', cities: 'all', message: '이틀 연속(48시간) 술을 팔지 않아요.' },
  { id: 'okpansa', type: 'no_alcohol', title: '오크파나 · 안거 종료', dateText: '10월 26일(월)', from: '2026-10-26', to: '2026-10-26', cities: 'all', message: '편의점·식당·바에서 술을 팔지 않아요. 난 보트 레이스가 이 무렵 열려요.', photo: 'cm_temple' },
  { id: 'bosang', type: 'festival', title: '보생 우산 축제', dateText: '1월 중순', months: [1], cities: ['chiangmai'], message: '치앙마이 근교 낮 축제', impact: '영향 적음' },
  { id: 'cmflower', type: 'festival', title: '치앙마이 꽃 축제', dateText: '2월 첫 주말', months: [2], cities: ['chiangmai'], message: '구시가지 퍼레이드', impact: '교통 통제' },
  { id: 'wedding', type: 'festival', title: '수중 결혼식', dateText: '2월 중순', months: [2], cities: ['trang'], message: '트랑 수중 결혼식', impact: '섬 투어 수요 증가' },
  { id: 'poysanglong', type: 'festival', title: '포이상롱(동자승 수계식)', dateText: '3월 말~4월 초', months: [3, 4], cities: ['maehongson'], message: '도시 최대 행사', impact: '숙소 부족' },
  { id: 'songkran', type: 'festival', title: '송크란(태국 새해)', dateText: '4월 13~15일', from: '2026-04-13', to: '2026-04-15', cities: 'all', message: '전국 물축제(치앙마이 최대)', impact: '교통 매진, 가격 급등, 방수팩 준비' },
  { id: 'phitakhon', type: 'festival', title: '피타콘 가면 축제', dateText: '6~7월', months: [6, 7], cities: ['loei', 'chiangkhan'], message: '러이 단사이', impact: '숙소 부족' },
  { id: 'nanboat', type: 'festival', title: '난 전통 보트 레이스', dateText: '9~10월', months: [9, 10], cities: ['nan'], message: '연중 가장 붐비는 때', impact: '숙소 예약 필수', photo: 'boatrace' },
  { id: 'veg', type: 'festival', title: '채식 축제', dateText: '10월 중순(임시 · 음력 9월 초)', months: [10], cities: ['trang'], message: '식당 다수가 채식 메뉴만 판매', impact: '날짜는 매년 바뀌어요(임시값)', photo: 'thaifood' },
  { id: 'loykrathong', type: 'festival', title: '로이끄라통 · 이펭', dateText: '11월 23~25일', from: '2026-11-23', to: '2026-11-25', cities: ['chiangmai', 'sukhothai'], message: '구시가지 숙소 2~3배', impact: '4~6개월 전 예약 권장', photo: 'lantern' },
  { id: 'kwai', type: 'festival', title: '콰이강의 다리 주간', dateText: '11월 말~12월 초', months: [11, 12], cities: ['kanchanaburi'], message: '불꽃놀이·조명쇼', impact: '주말 혼잡' },
  { id: 'crflower', type: 'festival', title: '치앙라이 꽃 축제', dateText: '12월~2월', months: [12, 1, 2], cities: ['chiangrai'], message: '시내 공원 행사', impact: '영향 적음' },
];
