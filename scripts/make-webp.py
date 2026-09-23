"""public/photos/*.jpg에서 WebP 두 가지(최대 1280px, 640px)를 만들어요. 사진을 추가·교체한 뒤 실행하세요.
  python scripts/make-webp.py
"""
import pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'photos'
jpg = webp = 0
for p in sorted(root.glob('*.jpg')):
    im = Image.open(p).convert('RGB')
    big = im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS) if im.width > 1280 else im
    big.save(p.with_suffix('.webp'), 'WEBP', quality=72, method=6)
    small = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS) if im.width > 640 else im
    small.save(root / f'{p.stem}-640.webp', 'WEBP', quality=76, method=6)
    jpg += p.stat().st_size
    webp += p.with_suffix('.webp').stat().st_size
print(f'JPG {jpg / 1e6:.1f}MB -> WebP {webp / 1e6:.1f}MB')
