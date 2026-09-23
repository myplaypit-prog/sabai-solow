# Sabai Solow — 작업 규칙

- 스택: Vite + React 18 + TypeScript + Tailwind 3, HashRouter(Artifact 호환). 서버 없음.
- 색은 반드시 토큰으로: Tailwind 클래스(`bg-lagoon`, `text-ink` …) 또는 `rgb(var(--token))`. 새 색은 `src/styles/index.css`의 `:root`와 다크 블록 두 곳에 함께 추가.
- 작은 글자는 ink·lagoon·chili-d만. butter·hib·pist·mint·chili는 면으로만 쓰고 그 위 글자는 ink(`text-fixedink`).
- 접근성: 터치 영역 44px 이상(`min-h-11`), 본문 16px 이상, 배지는 색+글자+아이콘, 폼은 label 연결.
- 문구: 짧은 존댓말("~해요"), 경고는 담담하게, 느낌표·과장 금지. 모르는 값은 `[빈칸]`.
- 데이터는 `src/data/*`, 규칙은 `src/lib/planner.ts`. 규칙을 바꾸면 `npm test`를 통과시킬 것.
- 사진은 `public/photos`에 넣고 `src/data/photo-meta.json`·`PHOTO_ALT`에 출처·대체텍스트를 함께 기록.
- 커밋 메시지: `feat:` `fix:` `docs:` `refactor:` 접두어 + 한국어 설명.
