# Sabai Solow — 작업 규칙

- 스택: Vite + React 18 + TypeScript + Tailwind 3, HashRouter(Artifact 호환). 서버 없음.
- 디자인 기준은 `docs/design/DESIGN.md`(Google Stitch). 새 화면은 벤토 카드(`card rounded-3xl`)·pill 칩·`glass` 떠 있는 바를 쓸 것.
- 색은 반드시 토큰으로: 새 이름(`bg-primary`, `text-marine`, `bg-sage-t text-sage` …) 또는 `rgb(var(--token))`. 예전 이름(lagoon·ink·cloud…)은 별칭이라 새 코드에선 쓰지 않음. 새 색은 `src/styles/index.css`의 `:root`와 다크 블록 두 곳에 함께 추가.
- 작은 글자는 marine·slate·primary·`*-d`만. saffron은 로고 w·장식·큰 글자 전용. mango·`*-t`는 면으로만 쓰고 그 위 글자는 marine 또는 짝이 되는 `*-d`.
- 어두운 면은 `bg-night text-on-night`(다크 모드에서도 어두움). `bg-marine`에 흰 글자를 올리지 말 것(다크 모드에서 marine은 밝은 글자색).
- 로고는 텍스트 워드마크 유지(`Logo`): `Sabai Solo` + saffron `w`.
- 접근성: 터치 영역 44px 이상(`min-h-11`), 본문 16px 이상, 배지는 색+글자+아이콘, 폼은 label 연결.
- 문구: 짧은 존댓말("~해요"), 경고는 담담하게, 느낌표·과장 금지.
- 모르는 값: 프로토타입에서는 화면 확인용 **임시값**을 넣고 `(임시)`·`(샘플)`을 붙이거나 `sample: true`로 표시. 실제 업체·숙소 이름은 쓰지 않음. 확인된 값으로 바꿀 때 표시를 뗄 것.
- 데이터는 `src/data/*`, 규칙은 `src/lib/planner.ts`. 규칙을 바꾸면 `npm test`를 통과시킬 것.
- 사진은 `public/photos`에 넣고 `src/data/photo-meta.json`·`PHOTO_ALT`에 출처·대체텍스트를 함께 기록.
- 기획·설계 문서는 `docs/`(기획안.md·설계.md). 화면·규칙을 바꾸면 문서와 어긋나지 않는지 확인.
- 커밋 메시지: `feat:` `fix:` `docs:` `refactor:` `chore:` 접두어 + 한국어 설명. 작업 단위마다 커밋하고 `origin main`에 푸시.
