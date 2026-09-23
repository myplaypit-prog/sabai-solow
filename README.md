# Sabai Solow — 태국 소도시 혼행 플래너 (프로토타입)

30~50대 혼자 여행자를 위한 태국 소도시 힐링 여행 플래너입니다. 여행 시기·취향을 넣으면 동선, 교통, 숙소 기준(구글맵 평점 4.5+ · 1박 10만원 이하), 현지 투어를 한 번에 짜 줍니다.
외부 가입·API 없이 브라우저 안에서만 동작하는 **프로토타입**입니다.

기획·설계 문서: [docs/기획안.md](docs/기획안.md) · [docs/설계.md](docs/설계.md)

## 바로 실행하기

```bash
npm install
npm run dev        # http://localhost:5173 에서 열기
npm test           # 규칙 엔진 테스트(추천 코스 8개 × 12개월 × 일수 조합)
npm run build      # dist/ 에 정적 사이트 생성(아무 정적 호스팅에나 올릴 수 있어요)
npm run build:artifact   # dist-artifact/artifact.html — claude.ai Artifact용 한 파일 빌드
```

Node.js 20 이상이 필요해요.

## 화면

| 경로 | 화면 |
|---|---|
| `#/` | 홈 — 히어로, 이달의 시기 배지, 추천 코스 8개, 다가오는 금주일·축제 |
| `#/login` `#/signup` `#/verify` `#/reset-password` | 이메일 로그인·가입(목업), 이메일 인증은 [인증 완료로 처리(테스트)] 버튼, 구글·네이버는 "준비 중" |
| `#/plan` | 계획 5단계(시기 → 일수·예산 → 이동 강도 → 관심사 → 안심 일정) + '이 기간의 여행 정보' 패널, 미정이면 시기 팁 카드 5개 |
| `#/trip/:id` | 일정 결과 — 일자별·지도·숙소·교통·투어 탭, 금주일·축제 배지, 편집(순서·체류일)·되돌리기, 저장·PDF·오프라인·링크 복사 |
| `#/trip/:id/print` | 인쇄용 화면(브라우저 인쇄 → PDF로 저장) |
| `#/courses` `#/season` `#/safety` `#/my` `#/credits` | 추천 코스·도시, 시기 가이드, 혼행 안심 팩(태국어 목적지 카드), 내 일정·계정, 사진 출처 |

## 폴더 구조

```
src/
  data/        샘플 데이터(기획안 3·5·6·7·11장): cities, courses, legs, events, seasons, tours, stays, photos
  lib/         planner.ts(규칙 엔진) · period.ts(이 기간의 여행 정보) · auth.ts(목업 계정) · storage.ts(IndexedDB) · trips.ts
  components/  Layout(내비·하단 탭·푸터), PeriodPanel, SeasonTips, TripMap, TourSheet, ui(Badge·Photo·Logo·Btn)
  pages/       Home, Plan, Trip, Auth, Misc(코스·시기·안심 팩·내 일정·인쇄·출처)
  styles/      index.css — 디자인 토큰(라이트/다크), Pretendard
public/photos  실사 사진 35장(Unsplash 라이선스, 출처는 src/data/photo-meta.json)
```

## 디자인 토큰 — Golden Hour Editorial

| 토큰 | 값 | 쓰임 |
|---|---|---|
| cloud | #F7F3EA | 바탕 |
| tamarind(ink) | #2A1B14 | 글자·어두운 섹션 |
| lagoon | #0E6E68 | 주 버튼·링크 (cloud 위 5.5:1) |
| chili / chili deep | #E2572A / #C23C17 | 로고 w·스티커 면 / 강조 글자 |
| butter · hibiscus · pistachio · mint | #F8D66A · #F5A8B8 · #CADFA2 · #D3EBE3 | 면 전용(위 글자는 tamarind) |

글꼴: 한글 Pretendard(제목 800), 포인트 Instrument Serif Italic, 로고 Bricolage Grotesque. 색·글꼴 값은 `tailwind.config.js`와 `src/styles/index.css`에서 함께 바꿉니다.

## 규칙 엔진 요약 (`src/lib/planner.ts`)

1. 관심사·여행 월 계절 점수·일수로 코스 A~H 중 하나를 고름(`rankCourses`)
2. 체류일을 일수에 맞게 늘리거나 줄임, '여유'는 도시 수를 줄임(`fitStops`)
3. 구간마다 규칙에 맞는 가장 짧은 지상 교통을 고름 — 하루 최대 6시간(안심 5시간), 안심 일정은 야간버스 제외·여성 전용칸 열차 우선, 귀국일은 낮 이동만(`chooseOption`)
4. 날짜별 금주일·축제 배지, 우기 산악도로 주의, 2박 이상 도시에 투어 1개 추천
5. 직통 구간이 없으면 교통 거점(방콕·치앙마이·수랏타니·트랑)을 0박 환승으로 끼워 넣음 — 편집으로 순서를 바꿔도 교통편이 끊기지 않아요(`bridgeStops`)

## 프로토타입의 한계

- 계정·일정은 이 브라우저(IndexedDB)에만 저장돼요. 데이터를 지우면 사라져요.
- 숙소 이름·평점·최저가, 투어 가격대, 일부 축제 날짜는 화면 확인용 **임시 데이터**예요(`(샘플)`·`(임시)` 표시, 숙소는 `sample: true`). 실제 업체가 아니에요. 운영자가 구글맵에서 확인한 값으로 `src/data/stays.ts`·`tours.ts`·`events.ts`를 바꾸고 표시를 떼 주세요.
- '예상 숙박비'는 고른 숙소 가격, 안 고른 도시는 예산 안 최저가로 어림한 값이에요(임시 데이터 기준).
- 지도는 정적 SVG예요. 다음 단계에서 OpenStreetMap(Leaflet)이나 구글 지도로 바꿉니다.
- 오프라인 저장은 서비스 워커(`public/sw.js`)가 앱 파일(JS·CSS·폰트)과 그 일정의 사진을 미리 받아 둔 뒤에 '준비 완료'라고 알려요. 화면은 네트워크 우선, 파일·사진은 캐시 우선이라 새 버전도 받아져요.
- claude.ai Artifact 화면이나 일부 앱 내 브라우저에서는 인쇄·서비스 워커가 막혀 있어요. PDF·오프라인 캐시는 `npm run dev`/`build`로 일반 브라우저에서 열 때 동작해요.

## Git으로 이어서 작업하기

```bash
git log --oneline            # 지금까지의 커밋 보기
git switch -c feature/내작업   # 새 브랜치에서 작업
git add -A && git commit -m "fix: 무엇을 바꿨는지"
git push                     # 원격: https://github.com/myplaypit-prog/sabai-solow
```
