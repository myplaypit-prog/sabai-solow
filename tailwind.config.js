/** Sabai Solow — Golden Hour Editorial 토큰. 색은 CSS 변수(src/styles/index.css)에서 라이트/다크를 함께 관리합니다. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cloud: 'rgb(var(--cloud) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        sand: 'rgb(var(--sand) / <alpha-value>)',
        putty: 'rgb(var(--putty) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        lagoon: 'rgb(var(--lagoon) / <alpha-value>)',
        'lagoon-d': 'rgb(var(--lagoon-d) / <alpha-value>)',
        'on-lagoon': 'rgb(var(--on-lagoon) / <alpha-value>)',
        mint: 'rgb(var(--mint) / <alpha-value>)',
        chili: 'rgb(var(--chili) / <alpha-value>)',
        'chili-d': 'rgb(var(--chili-d) / <alpha-value>)',
        butter: 'rgb(var(--butter) / <alpha-value>)',
        lemon: 'rgb(var(--lemon) / <alpha-value>)',
        pist: 'rgb(var(--pist) / <alpha-value>)',
        hib: 'rgb(var(--hib) / <alpha-value>)',
        night: 'rgb(var(--night) / <alpha-value>)',
        'on-night': 'rgb(var(--on-night) / <alpha-value>)',
        fixedink: '#2A1B14',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Pretendard', 'Georgia', 'serif'],
        grot: ['"Bricolage Grotesque"', 'Pretendard', 'sans-serif'],
      },
      borderRadius: { xl2: '22px', xl3: '28px' },
    },
  },
  plugins: [],
};
