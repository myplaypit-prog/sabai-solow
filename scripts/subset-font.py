"""Pretendard 가변 폰트를 필요한 글자만 남겨 줄여요.

남기는 글자: KS X 1001 한글 2,350자 + 자모 + 라틴·문장부호 + src/와 index.html에 실제로 쓰인 모든 글자.
화면 글을 바꾼 뒤 새 글자가 네모(□)로 보이면 다시 실행하세요.
  pip install fonttools brotli
  python scripts/subset-font.py
"""
import pathlib
from fontTools import subset

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'fonts-src' / 'PretendardVariable.woff2'
out = root / 'src' / 'styles' / 'Pretendard-subset.woff2'

chars = set()
for hi in range(0xB0, 0xC9):  # KS X 1001 한글 2,350자
    for lo in range(0xA1, 0xFF):
        try:
            chars.add(bytes([hi, lo]).decode('euc-kr'))
        except UnicodeDecodeError:
            pass
chars.update(chr(c) for c in range(0x3131, 0x3164))  # 한글 자모(입력 중 글자)
chars.update(chr(c) for c in range(0x20, 0x7F))
chars.update(chr(c) for c in range(0xA0, 0x100))
chars.update('–—‘’“”…·•※→←↑↓↔×÷±≈≤≥℃°₩฿€%')
for p in [*root.glob('src/**/*.ts'), *root.glob('src/**/*.tsx'), *root.glob('src/**/*.json'), root / 'index.html']:
    chars.update(p.read_text(encoding='utf-8'))

opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['*']
opts.name_IDs = ['*']
opts.notdef_outline = True
font = subset.load_font(str(src), opts)
sub = subset.Subsetter(opts)
sub.populate(text=''.join(ch for ch in chars if ch.isprintable() or ch == ' '))
sub.subset(font)
subset.save_font(font, str(out), opts)
print(f'{len(chars)} chars -> {out.relative_to(root)} ({out.stat().st_size / 1024:.0f} KB)')
