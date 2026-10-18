import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont
import numpy as np

src_path = 'assets/images/mr_deep_xai_real.jpg'
orig = Image.open(src_path).convert('RGBA')
w, h = orig.size  # 768, 1024

# 1. Base image enhancement:
# Cool tech grade: slightly boost contrast and subtle cyan tint in shadows while preserving natural skin tones
enhancer = ImageEnhance.Contrast(orig)
graded = enhancer.enhance(1.08)

# 2. Extract edge contours for holographic cyber-lines
gray = orig.convert('L')
# Bilateral-like smoothing then edges
smooth_gray = gray.filter(ImageFilter.GaussianBlur(radius=1))
edges = smooth_gray.filter(ImageFilter.FIND_EDGES)
edges_arr = np.array(edges)

# Create an electric cyan & purple glow edge overlay
threshold = 28
strong_edges = edges_arr > threshold
edge_rgba = np.zeros((h, w, 4), dtype=np.uint8)

# Cyan glow on strong edges (jaw, collar, lapels, shoulders)
edge_rgba[strong_edges, 0] = 30   # R
edge_rgba[strong_edges, 1] = 210  # G
edge_rgba[strong_edges, 2] = 255  # B
# Soft opacity so it doesn't overpower the face
edge_rgba[strong_edges, 3] = np.clip(edges_arr[strong_edges] * 0.65, 0, 140).astype(np.uint8)

edge_img = Image.fromarray(edge_rgba, mode='RGBA')
edge_img_blurred = edge_img.filter(ImageFilter.GaussianBlur(radius=1.5))

# 3. Create Sci-Fi Cybernetic HUD Layer
hud = Image.new('RGBA', (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(hud)

cyan = (0, 242, 254, 240)
cyan_soft = (56, 189, 248, 140)
cyan_glow = (56, 189, 248, 60)
gold = (245, 158, 11, 230)
purple = (168, 85, 247, 190)
white = (255, 255, 255, 255)

# Load font
try:
    font_mono_sm = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 12)
    font_mono_xs = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 10)
    font_mono_lg = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 15)
except Exception:
    font_mono_sm = ImageFont.load_default()
    font_mono_xs = font_mono_sm
    font_mono_lg = font_mono_sm

# Head center: (389, 260)
head_x, head_y = 389, 280

# 3.1 Background subtle holographic hexagonal lattice
for hx in range(30, w, 80):
    for hy in range(30, 480, 70):
        # Only in background or peripheral areas
        dist_to_face = math.hypot(hx - head_x, hy - head_y)
        if dist_to_face > 180:
            r_hex = 18
            pts = []
            for a in range(6):
                ang = math.radians(a * 60)
                pts.append((hx + math.cos(ang) * r_hex, hy + math.sin(ang) * r_hex))
            draw.polygon(pts, outline=(56, 189, 248, 45), fill=(14, 165, 233, 10))

# 3.2 Jarvis Large Concentric HUD Rings around Face/Head
for r_ring, color, width in [
    (195, (56, 189, 248, 90), 1),
    (210, (0, 242, 254, 120), 2),
    (225, (168, 85, 247, 80), 1),
    (250, (56, 189, 248, 60), 1)
]:
    draw.ellipse([head_x - r_ring, head_y - r_ring, head_x + r_ring, head_y + r_ring], outline=color, width=width)

# Concentric ring tick marks and angular scales
for deg in range(0, 360, 15):
    rad = math.radians(deg)
    r1 = 206
    r2 = 214 if deg % 45 == 0 else 210
    x1 = head_x + math.cos(rad) * r1
    y1 = head_y + math.sin(rad) * r1
    x2 = head_x + math.cos(rad) * r2
    y2 = head_y + math.sin(rad) * r2
    col = cyan if deg % 45 == 0 else cyan_soft
    draw.line([(x1, y1), (x2, y2)], fill=col, width=1)

# Ring quadrant target brackets
for ang in [35, 145, 215, 325]:
    rad = math.radians(ang)
    bx = head_x + math.cos(rad) * 210
    by = head_y + math.sin(rad) * 210
    draw.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill=cyan, outline=white, width=1)

# 3.3 Eyes Coordinates: Left=(346, 261), Right=(432, 258)
eye_l = (346, 261)
eye_r = (432, 258)

for ex, ey in [eye_l, eye_r]:
    # Glowing digital iris ring
    r_iris = 7
    draw.ellipse([ex - r_iris, ey - r_iris, ex + r_iris, ey + r_iris], outline=(0, 242, 254, 250), width=1)
    draw.ellipse([ex - r_iris - 2, ey - r_iris - 2, ex + r_iris + 2, ey + r_iris + 2], outline=(56, 189, 248, 120), width=1)
    # Quantum ocular core (white pinpoint highlight)
    draw.ellipse([ex - 2, ey - 2, ex + 2, ey + 2], fill=(255, 255, 255, 255))
    # HUD target tick marks
    draw.line([ex - 14, ey, ex - 9, ey], fill=(0, 242, 254, 220), width=1)
    draw.line([ex + 9, ey, ex + 14, ey], fill=(0, 242, 254, 220), width=1)
    draw.line([ex, ey - 14, ex, ey - 9], fill=(0, 242, 254, 220), width=1)
    draw.line([ex, ey + 9, ex, ey + 14], fill=(0, 242, 254, 220), width=1)

# 3.4 Facial Recognition Target Brackets (around cheeks / jaw)
# Left cheek bracket
draw.arc([270, 260, 310, 300], 90, 180, fill=cyan, width=2)
draw.line([270, 280, 270, 325], fill=cyan, width=1)
draw.line([270, 325, 280, 325], fill=cyan, width=1)

# Right cheek bracket
draw.arc([470, 260, 510, 300], 0, 90, fill=cyan, width=2)
draw.line([510, 280, 510, 325], fill=cyan, width=1)
draw.line([500, 325, 510, 325], fill=cyan, width=1)

# Chin target bracket
draw.line([370, 445, 410, 445], fill=cyan_soft, width=1)
draw.line([370, 440, 370, 445], fill=cyan_soft, width=1)
draw.line([410, 440, 410, 445], fill=cyan_soft, width=1)

# Forehead neural node
draw.line([365, 155, 415, 155], fill=(56, 189, 248, 140), width=1)
draw.ellipse([387, 153, 393, 157], fill=cyan, outline=white, width=1)
draw.line([390, 157, 390, 182], fill=(56, 189, 248, 100), width=1)

# 3.5 Cybernetic Circuit Traces on Suit Collar and Lapels
circuit_pts_l = [
    (290, 520), (280, 550), (300, 590), (290, 630), (315, 680), (310, 740)
]
for i in range(len(circuit_pts_l)-1):
    draw.line([circuit_pts_l[i], circuit_pts_l[i+1]], fill=(0, 242, 254, 180), width=2)
    p = circuit_pts_l[i]
    draw.ellipse([p[0]-3, p[1]-3, p[0]+3, p[1]+3], fill=cyan, outline=white, width=1)

circuit_pts_r = [
    (490, 520), (505, 550), (485, 590), (495, 630), (465, 680), (470, 740)
]
for i in range(len(circuit_pts_r)-1):
    draw.line([circuit_pts_r[i], circuit_pts_r[i+1]], fill=(168, 85, 247, 180), width=2)
    p = circuit_pts_r[i]
    draw.ellipse([p[0]-3, p[1]-3, p[0]+3, p[1]+3], fill=purple, outline=white, width=1)

# Neck cyber-lines
draw.line([(345, 455), (340, 485), (350, 510)], fill=(56, 189, 248, 120), width=1)
draw.line([(435, 455), (440, 485), (430, 510)], fill=(56, 189, 248, 120), width=1)

# 3.6 Quantum Core Arc-Reactor around chest emblem (567, 767)
cx, cy = 567, 767
for radius, width, color in [(55, 2, cyan), (65, 1, cyan_soft), (75, 2, gold)]:
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=color, width=width)

for deg in range(0, 360, 30):
    rad = math.radians(deg)
    x1 = cx + math.cos(rad) * 55
    y1 = cy + math.sin(rad) * 55
    x2 = cx + math.cos(rad) * 72
    y2 = cy + math.sin(rad) * 72
    draw.line([(x1, y1), (x2, y2)], fill=cyan, width=1)

# 3.7 Sci-Fi Telemetry Badges & Labels
# Top left badge
draw.rectangle([45, 65, 230, 115], fill=(2, 6, 23, 160), outline=(56, 189, 248, 120), width=1)
draw.text((55, 72), 'MR. DEEP_xAI', fill=cyan, font=font_mono_lg)
draw.text((55, 93), 'QUANTUM DIGITAL BOT v2.6', fill=(226, 232, 240, 220), font=font_mono_xs)

# Top right badge
draw.rectangle([538, 65, 723, 115], fill=(2, 6, 23, 160), outline=(168, 85, 247, 120), width=1)
draw.text((548, 72), 'SUKHOTHAI NEURAL', fill=(192, 132, 252, 255), font=font_mono_sm)
draw.text((548, 93), 'STATUS: ONLINE // 60 FPS', fill=(52, 211, 153, 230), font=font_mono_xs)

# Subtle fine horizontal holographic scanlines
scanline_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
scan_draw = ImageDraw.Draw(scanline_layer)
for y in range(0, h, 3):
    scan_draw.line([(0, y), (w, y)], fill=(2, 6, 23, 20), width=1)

# 4. Composite All Layers
final = graded.copy()
final.alpha_composite(edge_img_blurred)
final.alpha_composite(hud)
final.alpha_composite(scanline_layer)

# 3.7 Sci-Fi Telemetry Badges & Labels (Drawn on full portrait)
draw.rectangle([45, 65, 230, 115], fill=(2, 6, 23, 160), outline=(56, 189, 248, 120), width=1)
draw.text((55, 72), 'MR. DEEP_xAI', fill=cyan, font=font_mono_lg)
draw.text((55, 93), 'QUANTUM DIGITAL BOT v2.6', fill=(226, 232, 240, 220), font=font_mono_xs)

draw.rectangle([538, 65, 723, 115], fill=(2, 6, 23, 160), outline=(168, 85, 247, 120), width=1)
draw.text((548, 72), 'SUKHOTHAI NEURAL', fill=(192, 132, 252, 255), font=font_mono_sm)
draw.text((548, 93), 'STATUS: ONLINE // 60 FPS', fill=(52, 211, 153, 230), font=font_mono_xs)

# Subtle fine horizontal holographic scanlines
scanline_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
scan_draw = ImageDraw.Draw(scanline_layer)
for y in range(0, h, 3):
    scan_draw.line([(0, y), (w, y)], fill=(2, 6, 23, 20), width=1)

# 4. Composite All Layers
final = graded.copy()
final.alpha_composite(edge_img_blurred)
final.alpha_composite(hud)
final.alpha_composite(scanline_layer)

# Save full portrait
final.save('assets/images/mr_deep_xai_digital_bot.png', 'PNG')
print('Saved assets/images/mr_deep_xai_digital_bot.png')

# 5. Precision 512x512 Square Crop for Avatar (Face perfectly centered)
# We compose the avatar cleanly from the base and overlay layers without cropped text
crop_size = 512
half = crop_size // 2
crop_x1 = max(0, head_x - half)
crop_y1 = max(0, head_y - 210)
crop_x2 = crop_x1 + crop_size
crop_y2 = crop_y1 + crop_size

if crop_x2 > w:
    crop_x2 = w
    crop_x1 = w - crop_size

# Crop base + edge glow
sq_graded = graded.crop((crop_x1, crop_y1, crop_x2, crop_y2))
sq_edges = edge_img_blurred.crop((crop_x1, crop_y1, crop_x2, crop_y2))
sq_scan = scanline_layer.crop((crop_x1, crop_y1, crop_x2, crop_y2))

# Create clean HUD specifically fitted for the 512x512 circular avatar frame
sq_hud = Image.new('RGBA', (crop_size, crop_size), (0, 0, 0, 0))
sq_draw = ImageDraw.Draw(sq_hud)

sq_cx, sq_cy = crop_size // 2, 210  # Head center mapped into square coordinates

# Concentric Jarvis rings centered on face in square crop
for r_ring, color, width in [
    (185, (56, 189, 248, 90), 1),
    (200, (0, 242, 254, 130), 2),
    (215, (168, 85, 247, 85), 1),
    (240, (56, 189, 248, 60), 1)
]:
    sq_draw.ellipse([sq_cx - r_ring, sq_cy - r_ring, sq_cx + r_ring, sq_cy + r_ring], outline=color, width=width)

# Concentric ring tick marks and angular scales
for deg in range(0, 360, 15):
    rad = math.radians(deg)
    r1 = 196
    r2 = 205 if deg % 45 == 0 else 200
    x1 = sq_cx + math.cos(rad) * r1
    y1 = sq_cy + math.sin(rad) * r1
    x2 = sq_cx + math.cos(rad) * r2
    y2 = sq_cy + math.sin(rad) * r2
    col = cyan if deg % 45 == 0 else cyan_soft
    sq_draw.line([(x1, y1), (x2, y2)], fill=col, width=1)

# Ring quadrant target brackets
for ang in [35, 145, 215, 325]:
    rad = math.radians(ang)
    bx = sq_cx + math.cos(rad) * 200
    by = sq_cy + math.sin(rad) * 200
    sq_draw.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill=cyan, outline=white, width=1)

# Mapped Eyes in square crop:
sq_eye_l = (eye_l[0] - crop_x1, eye_l[1] - crop_y1)
sq_eye_r = (eye_r[0] - crop_x1, eye_r[1] - crop_y1)

for ex, ey in [sq_eye_l, sq_eye_r]:
    r_iris = 7
    sq_draw.ellipse([ex - r_iris, ey - r_iris, ex + r_iris, ey + r_iris], outline=(0, 242, 254, 250), width=1)
    sq_draw.ellipse([ex - r_iris - 2, ey - r_iris - 2, ex + r_iris + 2, ey + r_iris + 2], outline=(56, 189, 248, 120), width=1)
    sq_draw.ellipse([ex - 2, ey - 2, ex + 2, ey + 2], fill=(255, 255, 255, 255))
    sq_draw.line([ex - 14, ey, ex - 9, ey], fill=(0, 242, 254, 220), width=1)
    sq_draw.line([ex + 9, ey, ex + 14, ey], fill=(0, 242, 254, 220), width=1)
    sq_draw.line([ex, ey - 14, ex, ey - 9], fill=(0, 242, 254, 220), width=1)
    sq_draw.line([ex, ey + 9, ex, ey + 14], fill=(0, 242, 254, 220), width=1)

# Cheek target brackets mapped
sq_chk_l = (270 - crop_x1, 260 - crop_y1)
sq_draw.arc([sq_chk_l[0], sq_chk_l[1], sq_chk_l[0] + 40, sq_chk_l[1] + 40], 90, 180, fill=cyan, width=2)
sq_draw.line([sq_chk_l[0], sq_chk_l[1] + 20, sq_chk_l[0], sq_chk_l[1] + 65], fill=cyan, width=1)

sq_chk_r = (470 - crop_x1, 260 - crop_y1)
sq_draw.arc([sq_chk_r[0], sq_chk_r[1], sq_chk_r[0] + 40, sq_chk_r[1] + 40], 0, 90, fill=cyan, width=2)
sq_draw.line([sq_chk_r[0] + 40, sq_chk_r[1] + 20, sq_chk_r[0] + 40, sq_chk_r[1] + 65], fill=cyan, width=1)

# Forehead node mapped
sq_fn_x = 390 - crop_x1
sq_fn_y = 155 - crop_y1
sq_draw.line([sq_fn_x - 25, sq_fn_y, sq_fn_x + 25, sq_fn_y], fill=(56, 189, 248, 140), width=1)
sq_draw.ellipse([sq_fn_x - 3, sq_fn_y - 2, sq_fn_x + 3, sq_fn_y + 2], fill=cyan, outline=white, width=1)
sq_draw.line([sq_fn_x, sq_fn_y + 2, sq_fn_x, sq_fn_y + 25], fill=(56, 189, 248, 100), width=1)

# Collar circuits mapped
for pts, col in [(circuit_pts_l, cyan), (circuit_pts_r, purple)]:
    mapped = [(p[0] - crop_x1, p[1] - crop_y1) for p in pts if p[1] - crop_y1 < crop_size]
    for i in range(len(mapped)-1):
        sq_draw.line([mapped[i], mapped[i+1]], fill=col, width=2)
        sq_draw.ellipse([mapped[i][0]-3, mapped[i][1]-3, mapped[i][0]+3, mapped[i][1]+3], fill=col, outline=white, width=1)

# Precision sci-fi badges neatly positioned within square viewport
sq_draw.rectangle([18, 18, 185, 48], fill=(2, 6, 23, 180), outline=(56, 189, 248, 160), width=1)
sq_draw.text((26, 22), 'MR. DEEP_xAI', fill=cyan, font=font_mono_sm)
sq_draw.text((26, 36), 'DIGITAL BOT // 2026', fill=(226, 232, 240, 200), font=font_mono_xs)

sq_draw.rectangle([325, 18, 494, 48], fill=(2, 6, 23, 180), outline=(168, 85, 247, 160), width=1)
sq_draw.text((333, 22), 'SUKHOTHAI NEURAL', fill=(192, 132, 252, 255), font=font_mono_sm)
sq_draw.text((333, 36), 'STATUS: ONLINE // 60FPS', fill=(52, 211, 153, 220), font=font_mono_xs)

# Corner cyber brackets
bracket_len = 24
sq_draw.line([(10, 10), (10 + bracket_len, 10)], fill=cyan, width=2)
sq_draw.line([(10, 10), (10, 10 + bracket_len)], fill=cyan, width=2)
sq_draw.line([(crop_size - 10, 10), (crop_size - 10 - bracket_len, 10)], fill=cyan, width=2)
sq_draw.line([(crop_size - 10, 10), (crop_size - 10, 10 + bracket_len)], fill=cyan, width=2)
sq_draw.line([(10, crop_size - 10), (10 + bracket_len, crop_size - 10)], fill=cyan, width=2)
sq_draw.line([(10, crop_size - 10), (10, crop_size - 10 - bracket_len)], fill=cyan, width=2)
sq_draw.line([(crop_size - 10, crop_size - 10), (crop_size - 10 - bracket_len, crop_size - 10)], fill=cyan, width=2)
sq_draw.line([(crop_size - 10, crop_size - 10), (crop_size - 10, crop_size - 10 - bracket_len)], fill=cyan, width=2)

# Composite square avatar
square_final = sq_graded.copy()
square_final.alpha_composite(sq_edges)
square_final.alpha_composite(sq_hud)
square_final.alpha_composite(sq_scan)

square_final.save('assets/images/mr_deep_xai_bot_square.png', 'PNG')
print('Saved assets/images/mr_deep_xai_bot_square.png successfully!')
