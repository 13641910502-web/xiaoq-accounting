"""Generate app icon for 小Q记账 — Q + ¥ on black background."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = {
    'icon.png': 1024,
    'adaptive-icon.png': 1024,
    'favicon.png': 48,
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_icon(size: int) -> Image.Image:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    margin = size * 0.12
    cx, cy = size / 2, size / 2

    # Blue accent ring
    ring_radius = size * 0.42
    ring_width = max(3, int(size * 0.04))
    draw.ellipse(
        [cx - ring_radius, cy - ring_radius, cx + ring_radius, cy + ring_radius],
        outline=(74, 144, 217, 255),
        width=ring_width,
    )

    # Try to load fonts — fall back to default
    font_size_q = int(size * 0.38)
    font_size_yuan = int(size * 0.22)

    font_q = None
    font_yuan = None
    font_paths = [
        'C:/Windows/Fonts/msyhbd.ttf',   # Microsoft YaHei Bold
        'C:/Windows/Fonts/simhei.ttf',    # SimHei
        'C:/Windows/Fonts/arialbd.ttf',   # Arial Bold
        'C:/Windows/Fonts/segoeuib.ttf',  # Segoe UI Bold
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font_q = ImageFont.truetype(fp, font_size_q)
                font_yuan = ImageFont.truetype(fp, font_size_yuan)
                break
            except Exception:
                continue

    if font_q is None:
        font_q = ImageFont.load_default()
        font_yuan = ImageFont.load_default()

    # Draw "Q" centered
    bbox_q = draw.textbbox((0, 0), 'Q', font=font_q)
    qw = bbox_q[2] - bbox_q[0]
    qh = bbox_q[3] - bbox_q[1]
    draw.text(
        (cx - qw / 2, cy - qh / 2 - size * 0.03),
        'Q',
        fill=(255, 255, 255, 255),
        font=font_q,
    )

    # Draw "¥" as accent, overlapping bottom-right of Q
    bbox_y = draw.textbbox((0, 0), '¥', font=font_yuan)
    yw = bbox_y[2] - bbox_y[0]
    yh = bbox_y[3] - bbox_y[1]
    yuan_x = cx + qw * 0.25
    yuan_y = cy + qh * 0.12

    # Pill behind ¥ for contrast
    pill_pad = size * 0.02
    draw.rounded_rectangle(
        [yuan_x - pill_pad, yuan_y - pill_pad,
         yuan_x + yw + pill_pad, yuan_y + yh + pill_pad],
        radius=size * 0.04,
        fill=(0, 0, 0, 255),
    )

    draw.text(
        (yuan_x, yuan_y),
        '¥',
        fill=(74, 144, 217, 255),
        font=font_yuan,
    )

    return img

for filename, size in SIZES.items():
    icon = create_icon(size)
    filepath = os.path.join(OUTPUT_DIR, filename)
    icon.save(filepath, 'PNG')
    print(f'  Created {filepath} ({size}x{size})')

# Android adaptive icon: foreground (just the mark on transparent)
fg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw_fg = ImageDraw.Draw(fg)
# Simple centered mark
cx, cy = 1024 / 2, 1024 / 2
r = 1024 * 0.38
draw_fg.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(74, 144, 217, 255))
_fonts = [
    'C:/Windows/Fonts/msyhbd.ttf',
    'C:/Windows/Fonts/simhei.ttf',
    'C:/Windows/Fonts/arialbd.ttf',
    'C:/Windows/Fonts/segoeuib.ttf',
]
_fp = next((f for f in _fonts if os.path.exists(f)), None)
font_fg = ImageFont.truetype(_fp, 400) if _fp else ImageFont.load_default()
bbox = draw_fg.textbbox((0, 0), 'Q', font=font_fg)
draw_fg.text(
    (cx - (bbox[2] - bbox[0]) / 2, cy - (bbox[3] - bbox[1]) / 2 - 20),
    'Q', fill=(255, 255, 255, 255), font=font_fg
)
font_sm = ImageFont.truetype(_fp, 180) if _fp else ImageFont.load_default()
draw_fg.text((cx + 80, cy + 60), '¥', fill=(0, 0, 0, 255), font=font_sm)
fg.save(os.path.join(OUTPUT_DIR, 'android-icon-foreground.png'), 'PNG')
print('  Created android-icon-foreground.png')

bg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 255))
bg.save(os.path.join(OUTPUT_DIR, 'android-icon-background.png'), 'PNG')
print('  Created android-icon-background.png')

mono = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw_mono = ImageDraw.Draw(mono)
draw_mono.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 255))
mono.save(os.path.join(OUTPUT_DIR, 'android-icon-monochrome.png'), 'PNG')
print('  Created android-icon-monochrome.png')

print('\nAll icons generated.')
