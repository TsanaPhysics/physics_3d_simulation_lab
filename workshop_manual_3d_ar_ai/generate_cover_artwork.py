import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Dimensions: 1200 x 1800 px (Strict 2:3 aspect ratio for 6x9 inch book at 200 DPI)
W, H = 1200, 1800
img = Image.new("RGBA", (W, H), (10, 15, 30, 255))
draw = ImageDraw.Draw(img)

# 1. Create Base Background Gradient
# Upper 35% (0-630): Soft atmospheric pastel cyan-blue sky
# Mid 40% (630-1350): Transition to futuristic virtual laboratory
# Lower 25% (1350-1800): Deep dark navy-black high-tech workbench
bg_arr = np.zeros((H, W, 4), dtype=np.uint8)
for y in range(H):
    norm_y = y / float(H)
    if norm_y < 0.35:
        # Sky: gradient from #0b1a30 to #1e3a5f to soft cyan #38bdf8
        t = norm_y / 0.35
        r = int(12 + t * (28 - 12))
        g = int(35 + t * (75 - 35))
        b = int(75 + t * (140 - 75))
    elif norm_y < 0.75:
        # Midground lab: transition to deep tech blue-gray
        t = (norm_y - 0.35) / 0.40
        r = int(28 - t * 16)
        g = int(75 - t * 45)
        b = int(140 - t * 70)
    else:
        # Lower ground: rich dark navy-black canvas #060b14
        t = (norm_y - 0.75) / 0.25
        r = int(12 - t * 6)
        g = int(30 - t * 18)
        b = int(70 - t * 50)
    bg_arr[y, :, 0] = r
    bg_arr[y, :, 1] = g
    bg_arr[y, :, 2] = b
    bg_arr[y, :, 3] = 255

img = Image.fromarray(bg_arr, mode="RGBA")
draw = ImageDraw.Draw(img)

# 2. Add Laboratory Perspective Tech Grid on Floor (y: 1350 to 1800)
horizon_y = 1350
center_x = W // 2
grid_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g_draw = ImageDraw.Draw(grid_layer)

# Radial floor perspective lines
for i in range(-16, 17):
    x_bottom = center_x + i * 85
    g_draw.line([(center_x + i * 8, horizon_y), (x_bottom, H)], fill=(56, 189, 248, 45), width=2)

# Horizontal grid rings
for step in range(1, 14):
    ratio = (step / 14.0) ** 2
    cur_y = int(horizon_y + ratio * (H - horizon_y))
    g_draw.line([(0, cur_y), (W, cur_y)], fill=(56, 189, 248, int(25 + 60 * ratio)), width=1)

# Subtle workbench rim light along horizon
g_draw.line([(0, horizon_y), (W, horizon_y)], fill=(0, 240, 255, 180), width=3)
img = Image.alpha_composite(img, grid_layer)

# 3. Holographic 3D Virtual Physics Centerpiece (y: 650 to 1300)
holo_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
h_draw = ImageDraw.Draw(holo_layer)

# Glowing Hologram Platform Ring (Ellipses)
ring_cx, ring_cy = center_x, 1180
for r_step in range(120, 480, 50):
    rx, ry = r_step, int(r_step * 0.35)
    h_draw.ellipse([ring_cx - rx, ring_cy - ry, ring_cx + rx, ring_cy + ry], outline=(0, 240, 255, 70), width=2)

# 3.1 Hexagonal Resistor Circuit Hologram (Floating at cx: 420, cy: 920)
hex_cx, hex_cy = 430, 930
hex_radius = 160
nodes = []
for i in range(6):
    angle = math.radians(60 * i - 30)
    nx = int(hex_cx + hex_radius * math.cos(angle))
    ny = int(hex_cy + hex_radius * 0.65 * math.sin(angle))
    nodes.append((nx, ny))

# Draw hexagonal circuit branches with glowing gold/cyan lines
for i in range(6):
    n1 = nodes[i]
    n2 = nodes[(i + 1) % 6]
    # Glow outline
    h_draw.line([n1, n2], fill=(245, 158, 11, 220), width=6)
    h_draw.line([n1, n2], fill=(254, 240, 138, 255), width=3)
    # Resistor block in middle
    mid_x = (n1[0] + n2[0]) // 2
    mid_y = (n1[1] + n2[1]) // 2
    h_draw.rectangle([mid_x - 18, mid_y - 10, mid_x + 18, mid_y + 10], fill=(15, 23, 42, 240), outline=(234, 179, 8, 255), width=2)
    # 4 color bands
    bands = [(220, 38, 38), (37, 99, 235), (22, 163, 74), (234, 179, 8)]
    for b_idx, col in enumerate(bands):
        h_draw.line([(mid_x - 10 + b_idx * 6, mid_y - 9), (mid_x - 10 + b_idx * 6, mid_y + 9)], fill=col + (255,), width=2)

# Draw Node brass terminals a, b, c, d, e, f
for i, n in enumerate(nodes):
    h_draw.ellipse([n[0] - 12, n[1] - 12, n[0] + 12, n[1] + 12], fill=(251, 191, 36, 255), outline=(255, 255, 255, 255), width=3)

# 3.2 MediaPipe AR 3D Hand Skeleton Hologram (Floating at cx: 800, cy: 940)
# 21 Hand Landmarks Simulation
wrist = (800, 1140)
hand_points = {
    0: wrist,
    # Thumb
    1: (760, 1100), 2: (730, 1060), 3: (710, 1020), 4: (700, 980),
    # Index
    5: (765, 1010), 6: (755, 940), 7: (750, 880), 8: (745, 830),
    # Middle
    9: (800, 1000), 10: (800, 920), 11: (800, 850), 12: (800, 790),
    # Ring
    13: (835, 1015), 14: (840, 945), 15: (845, 885), 16: (850, 835),
    # Pinky
    17: (870, 1040), 18: (885, 985), 19: (895, 940), 20: (905, 890),
}

hand_connections = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20), (0, 17)
]

# Draw glowing cyber bone connections
for p1_idx, p2_idx in hand_connections:
    p1 = hand_points[p1_idx]
    p2 = hand_points[p2_idx]
    h_draw.line([p1, p2], fill=(0, 240, 255, 160), width=4)
    h_draw.line([p1, p2], fill=(255, 255, 255, 220), width=2)

# Draw joints (nodes)
for idx, pt in hand_points.items():
    color = (255, 255, 255, 255) if idx in [4, 8] else (0, 240, 255, 240)
    radius = 8 if idx in [4, 8] else 5
    h_draw.ellipse([pt[0] - radius, pt[1] - radius, pt[0] + radius, pt[1] + radius], fill=color, outline=(14, 165, 233, 255), width=2)

# Pinch Target Laser Ring between Index(8) and Thumb(4)
pinch_mid = ((hand_points[4][0] + hand_points[8][0]) // 2, (hand_points[4][1] + hand_points[8][1]) // 2)
h_draw.ellipse([pinch_mid[0] - 28, pinch_mid[1] - 28, pinch_mid[0] + 28, pinch_mid[1] + 28], outline=(52, 211, 153, 220), width=3)
h_draw.line([(pinch_mid[0] - 38, pinch_mid[1]), (pinch_mid[0] + 38, pinch_mid[1])], fill=(52, 211, 153, 200), width=2)
h_draw.line([(pinch_mid[0], pinch_mid[1] - 38), (pinch_mid[0], pinch_mid[1] + 38)], fill=(52, 211, 153, 200), width=2)

# 3.3 Glowing Physics Pendulum Simulation (Floating at center-top of midground)
pend_origin = (600, 680)
pend_bob = (580, 890)
h_draw.line([pend_origin, pend_bob], fill=(250, 204, 21, 240), width=3)
# Pendulum protractor arc
h_draw.arc([pend_origin[0] - 80, pend_origin[1] - 80, pend_origin[0] + 80, pend_origin[1] + 80], start=40, end=140, fill=(56, 189, 248, 180), width=2)
# Bob
h_draw.ellipse([pend_bob[0] - 22, pend_bob[1] - 22, pend_bob[0] + 22, pend_bob[1] + 22], fill=(225, 29, 72, 255), outline=(255, 255, 255, 255), width=3)

# 3.4 Holographic Telemetry HUD Cards
card1_x, card1_y = 120, 780
h_draw.rounded_rectangle([card1_x, card1_y, card1_x + 190, card1_y + 110], radius=12, fill=(15, 23, 42, 200), outline=(56, 189, 248, 160), width=2)
# Mini sine curve inside card
sine_pts = []
for sx in range(160):
    sy = int(card1_y + 55 + 24 * math.sin(sx * 0.08))
    sine_pts.append((card1_x + 15 + sx, sy))
for s_idx in range(len(sine_pts) - 1):
    h_draw.line([sine_pts[s_idx], sine_pts[s_idx + 1]], fill=(16, 185, 129, 240), width=2)

card2_x, card2_y = 890, 780
h_draw.rounded_rectangle([card2_x, card2_y, card2_x + 200, card2_y + 110], radius=12, fill=(15, 23, 42, 200), outline=(168, 85, 247, 160), width=2)
# Mini 7-segment digital displays inside card 2
h_draw.rectangle([card2_x + 20, card2_y + 35, card2_x + 95, card2_y + 85], fill=(0, 0, 0, 240), outline=(239, 68, 68, 200), width=2)
h_draw.rectangle([card2_x + 105, card2_y + 35, card2_x + 180, card2_y + 85], fill=(0, 0, 0, 240), outline=(56, 189, 248, 200), width=2)

# Apply gentle blur to glow layer
glow_layer = holo_layer.filter(ImageFilter.GaussianBlur(radius=6))
img = Image.alpha_composite(img, glow_layer)
img = Image.alpha_composite(img, holo_layer)

# 4. Save High-Resolution Cover Artwork
output_path = "workshop_manual_3d_ar_ai/figures/cover_art.jpg"
img.convert("RGB").save(output_path, quality=96)
print(f"Cover artwork generated successfully at: {output_path}")
