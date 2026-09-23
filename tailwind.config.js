/**
 * Sabai Solow — Stitch 디자인 시스템(docs/design/DESIGN.md) 토큰.
 * 색은 CSS 변수(src/styles/index.css)에서 라이트/다크를 함께 관리합니다.
 * 새 이름(saffron·marine·sage…)을 쓰고, 예전 이름(lagoon·ink·cloud…)은 같은 변수를 가리키는 별칭이에요.
 */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 새 토큰
        logo: v('logo'), linen: v('linen'), oat: v('oat'), card: v('card'), hair: v('hair'), 'hair-2': v('hair-2'),
        marine: v('marine'), slate: v('slate'),
        primary: v('primary'), 'primary-h': v('primary-h'), 'on-primary': v('on-primary'), saffron: v('saffron'), 'saffron-t': v('saffron-t'),
        sage: v('sage'), 'sage-t': v('sage-t'), mango: v('mango'), 'mango-t': v('mango-t'), 'mango-d': v('mango-d'),
        'alert-t': v('alert-t'), 'alert-d': v('alert-d'), 'sky-t': v('sky-t'), 'sky-d': v('sky-d'),
        // 예전 이름(별칭)
        cloud: v('linen'), paper: v('card'), sand: v('oat'), putty: v('hair-2'), ink: v('marine'), muted: v('slate'),
        lagoon: v('primary'), 'lagoon-d': v('primary-h'), 'on-lagoon': v('on-primary'),
        mint: v('sage-t'), chili: v('saffron'), 'chili-d': v('primary'), butter: v('mango'), lemon: v('mango-t'),
        pist: v('sage-t'), hib: v('saffron-t'), night: v('night'), 'on-night': v('on-night'),
        fixedink: '#1B2A4A',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Pretendard', '-apple-system', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'Pretendard', 'sans-serif'],
        logo: ['Quicksand', 'Pretendard', 'sans-serif'],
        grot: ['Quicksand', 'Pretendard', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -4px rgba(27,42,74,.05), 0 2px 6px -1px rgba(224,90,43,.03)',
        lift: '0 16px 36px -6px rgba(27,42,74,.09), 0 4px 12px -2px rgba(224,90,43,.06)',
        float: '0 20px 40px -8px rgba(27,42,74,.12)',
        cta: '0 4px 14px rgba(224,90,43,.35)',
      },
      borderRadius: { xl2: '20px', xl3: '24px' },
      maxWidth: { page: '1280px' },
    },
  },
  plugins: [],
};
