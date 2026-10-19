import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 2400

def create_smooth_vertical_gradient(width, height, stops):
    """
    stops: list of (y_fraction, (R, G, B))
    """
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    
    stops = sorted(stops, key=lambda x: x[0])
    
    for y in range(height):
        frac = y / (height - 1)
        # Find enclosing stops
        idx = 0
        for i in range(len(stops) - 1):
            if stops[i][0] <= frac <= stops[i+1][0]:
                idx = i
                break
        else:
            idx = len(stops) - 2
            
        f0, c0 = stops[idx]
        f1, c1 = stops[idx+1]
        
        t = (frac - f0) / (f1 - f0) if f1 > f0 else 0
        t = max(0.0, min(1.0, t))
        # smoothstep
        t = t * t * (3 - 2 * t)
        
        r = int(c0[0] * (1 - t) + c1[0] * t)
        g = int(c0[1] * (1 - t) + c1[1] * t)
        b = int(c0[2] * (1 - t) + c1[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
        
    return img

def draw_perspective_cyber_grid(img, color=(0, 240, 255, 35), horizon_y=1100):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    
    # Radiating perspective lines
    horizon_x = W // 2
    for x in range(-W, 2 * W, 70):
        d.line([(horizon_x, horizon_y), (x, H)], fill=color, width=2)
        
    # Horizontal grid lines
    curr_y = horizon_y + 15
    spacing = 6.0
    while curr_y < H:
        alpha = int(min(60, 20 + (curr_y - horizon_y) / (H - horizon_y) * 45))
        c = (color[0], color[1], color[2], alpha)
        d.line([(0, int(curr_y)), (W, int(curr_y))], fill=c, width=2)
        curr_y += spacing
        spacing *= 1.12
        
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

def draw_pixar_glow_sphere(draw, center, radius, body_col, highlight_col, rim_col):
    cx, cy = center
    
    # Outer soft rim glow
    for dr in range(30, 0, -3):
        alpha = int(40 * (1 - dr / 30))
        glow_r = radius + dr
        draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], 
                     outline=(rim_col[0], rim_col[1], rim_col[2]), width=2)
                     
    # Solid 3D spherical gradient
    for r in range(radius, 0, -2):
        t = (radius - r) / radius
        # Offset toward top-left for 3D depth
        lx = cx - int(radius * 0.32 * (1 - t))
        ly = cy - int(radius * 0.35 * (1 - t))
        
        red = int(body_col[0] * (1 - t) + highlight_col[0] * t)
        green = int(body_col[1] * (1 - t) + highlight_col[1] * t)
        blue = int(body_col[2] * (1 - t) + highlight_col[2] * t)
        draw.ellipse([lx - r, ly - r, lx + r, ly + r], fill=(red, green, blue))
        
    # Primary Specular glint
    glint_x = cx - int(radius * 0.35)
    glint_y = cy - int(radius * 0.38)
    glint_r = max(4, int(radius * 0.20))
    draw.ellipse([glint_x - glint_r, glint_y - glint_r, glint_x + glint_r, glint_y + glint_r], fill=(255, 255, 255))
    
    # Secondary micro-specular glint
    glint2_x = glint_x + int(radius * 0.16)
    glint2_y = glint_y + int(radius * 0.16)
    glint2_r = max(2, int(radius * 0.08))
    draw.ellipse([glint2_x - glint2_r, glint2_y - glint2_r, glint2_x + glint2_r, glint2_y + glint2_r], fill=(255, 255, 255))

def draw_pixar_robot(draw, cx, cy, scale=1.0, eye_color=(0, 240, 255), accent_color=(245, 158, 11)):
    # Cute 3D Pixar AI Companion Bot
    # 1. Body
    body_r = int(170 * scale)
    draw_pixar_glow_sphere(draw, (cx, cy + int(140 * scale)), body_r, 
                           (235, 242, 250), (255, 255, 255), eye_color)
    
    # Chest Arc Reactor / Core
    core_r = int(45 * scale)
    draw_pixar_glow_sphere(draw, (cx, cy + int(140 * scale)), core_r,
                           eye_color, (255, 255, 255), (255, 255, 255))
                           
    # 2. Head
    head_r = int(140 * scale)
    draw_pixar_glow_sphere(draw, (cx, cy - int(60 * scale)), head_r,
                           (240, 245, 252), (255, 255, 255), eye_color)
                           
    # Cute Eyes Visor (Black Glossy Screen)
    visor_w = int(180 * scale)
    visor_h = int(80 * scale)
    visor_box = [cx - visor_w//2, cy - int(85 * scale), cx + visor_w//2, cy - int(85 * scale) + visor_h]
    draw.rounded_rectangle(visor_box, radius=int(35 * scale), fill=(15, 23, 42), outline=eye_color, width=int(4 * scale))
    
    # Two Friendly Glowing Eyes
    eye_offset = int(45 * scale)
    eye_r = int(22 * scale)
    # Left eye
    draw_pixar_glow_sphere(draw, (cx - eye_offset, cy - int(45 * scale)), eye_r, eye_color, (255, 255, 255), eye_color)
    # Right eye
    draw_pixar_glow_sphere(draw, (cx + eye_offset, cy - int(45 * scale)), eye_r, eye_color, (255, 255, 255), eye_color)
    
    # Cute Antenna
    draw.line([(cx, cy - int(200 * scale)), (cx, cy - int(240 * scale))], fill=(180, 195, 210), width=int(6 * scale))
    draw_pixar_glow_sphere(draw, (cx, cy - int(248 * scale)), int(16 * scale), accent_color, (255, 255, 255), accent_color)
    
    # Floating Shoulder Orbs (Cute magnetic floating hands)
    hand_r = int(50 * scale)
    draw_pixar_glow_sphere(draw, (cx - int(220 * scale), cy + int(120 * scale)), hand_r, (230, 240, 250), (255, 255, 255), eye_color)
    draw_pixar_glow_sphere(draw, (cx + int(220 * scale), cy + int(120 * scale)), hand_r, (230, 240, 250), (255, 255, 255), eye_color)

def render_volume_cover(vol_num, title_en, out_path, custom_draw_fn):
    print(f"Rendering Cover for Volume {vol_num}: {title_en}...")
    
    # Negative space engineering:
    # 0.0 - 0.35: Expansive airy pastel sky / digital glow (Clean Negative Space for Title)
    # 0.35 - 0.75: Midground action & 3D Pixar subject
    # 0.75 - 1.00: Deep dark canvas (Negative Space for Author Metadata)
    
    # Base palette
    sky_colors = [
        # Vol 1
        [(0.0, (190, 230, 255)), (0.35, (130, 195, 245)), (0.55, (20, 50, 90)), (0.80, (8, 18, 38)), (1.0, (4, 10, 22))],
        # Vol 2
        [(0.0, (235, 240, 255)), (0.35, (175, 200, 245)), (0.55, (30, 45, 95)), (0.80, (12, 18, 42)), (1.0, (5, 8, 24))],
        # Vol 3
        [(0.0, (220, 245, 255)), (0.35, (140, 215, 245)), (0.55, (25, 30, 75)), (0.80, (8, 12, 35)), (1.0, (4, 6, 20))],
        # Vol 4
        [(0.0, (225, 245, 255)), (0.35, (150, 215, 250)), (0.55, (15, 60, 95)), (0.80, (8, 25, 45)), (1.0, (4, 12, 25))],
        # Vol 5
        [(0.0, (230, 240, 255)), (0.35, (160, 190, 245)), (0.55, (20, 40, 85)), (0.80, (6, 16, 40)), (1.0, (3, 8, 20))],
        # Vol 6
        [(0.0, (255, 240, 230)), (0.35, (250, 195, 160)), (0.55, (60, 30, 75)), (0.80, (20, 10, 35)), (1.0, (10, 5, 18))],
        # Vol 7
        [(0.0, (225, 252, 245)), (0.35, (150, 235, 210)), (0.55, (15, 65, 65)), (0.80, (4, 28, 30)), (1.0, (2, 14, 16))]
    ]
    
    stops = sky_colors[vol_num - 1]
    img = create_smooth_vertical_gradient(W, H, stops)
    
    # Add subtle futuristic perspective digital grid
    draw_perspective_cyber_grid(img, color=(0, 240, 255, 28), horizon_y=1120)
    
    # Custom thematic visual elements
    d = ImageDraw.Draw(img)
    custom_draw_fn(d, img)
    
    # Save high-res JPEG (300 DPI, Quality 96%)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path} ({os.path.getsize(out_path) // 1024} KB)")

# ==============================================================================
# Volume 1: Virtual Labs, 3D Physics Simulation & AIoT
# ==============================================================================
def draw_vol01(d, img):
    # 3D Pixar Robot with Hexagonal Circuit & Pendulum
    cx, cy = W // 2, 1340
    draw_pixar_robot(d, cx, cy, scale=1.1, eye_color=(0, 240, 255), accent_color=(245, 158, 11))
    
    # Floating Holographic Hexagonal Circuit
    hex_cx, hex_cy = cx, cy - 280
    hex_r = 170
    points = []
    for i in range(6):
        angle = math.radians(60 * i - 30)
        px = hex_cx + int(hex_r * math.cos(angle))
        py = hex_cy + int(hex_r * math.sin(angle))
        points.append((px, py))
    
    # Draw glowing circuit loop
    for i in range(6):
        p1 = points[i]
        p2 = points[(i + 1) % 6]
        d.line([p1, p2], fill=(0, 240, 255), width=6)
        # Resistor zigzag or dot
        mid_x = (p1[0] + p2[0]) // 2
        mid_y = (p1[1] + p2[1]) // 2
        draw_pixar_glow_sphere(d, (mid_x, mid_y), 16, (245, 158, 11), (255, 255, 255), (245, 158, 11))
        
    for p in points:
        draw_pixar_glow_sphere(d, p, 20, (0, 240, 255), (255, 255, 255), (0, 240, 255))
        
    # Swinging Harmonic Pendulum on Right
    pivot_x, pivot_y = cx + 450, cy - 350
    bob_x, bob_y = cx + 380, cy - 50
    d.line([(pivot_x, pivot_y), (bob_x, bob_y)], fill=(180, 210, 230), width=4)
    draw_pixar_glow_sphere(d, (bob_x, bob_y), 55, (235, 70, 70), (255, 200, 200), (245, 158, 11))

# ==============================================================================
# Volume 2: Academic Research, Literature Synthesis & Scholarly Writing
# ==============================================================================
def draw_vol02(d, img):
    # 3D Pixar Scholar Bot with Knowledge Constellation
    cx, cy = W // 2, 1340
    draw_pixar_robot(d, cx, cy, scale=1.05, eye_color=(245, 158, 11), accent_color=(59, 130, 246))
    
    # Floating Holographic Open Book with 7-Column Grid
    book_cx, book_cy = cx, cy - 270
    bw, bh = 220, 130
    
    # Book pages
    d.polygon([(book_cx, book_cy), (book_cx - bw, book_cy - 40), (book_cx - bw, book_cy + bh), (book_cx, book_cy + bh + 30)],
              fill=(30, 58, 138), outline=(245, 158, 11))
    d.polygon([(book_cx, book_cy), (book_cx + bw, book_cy - 40), (book_cx + bw, book_cy + bh), (book_cx, book_cy + bh + 30)],
              fill=(37, 99, 235), outline=(245, 158, 11))
              
    # Constellation Network Nodes hovering above
    nodes = [
        (cx - 380, cy - 420), (cx - 200, cy - 530), (cx, cy - 480),
        (cx + 220, cy - 540), (cx + 390, cy - 410), (cx - 100, cy - 350), (cx + 120, cy - 340)
    ]
    for i in range(len(nodes) - 1):
        d.line([nodes[i], nodes[i+1]], fill=(245, 158, 11, 180), width=3)
    d.line([nodes[0], nodes[5]], fill=(59, 130, 246), width=2)
    d.line([nodes[4], nodes[6]], fill=(59, 130, 246), width=2)
    
    for nd in nodes:
        draw_pixar_glow_sphere(d, nd, 22, (245, 158, 11), (255, 255, 255), (255, 255, 255))

# ==============================================================================
# Volume 3: AI Agentic Orchestration & Google Antigravity Architecture
# ==============================================================================
def draw_vol03(d, img):
    # Mr. Deep_xAI / J.A.R.V.I.S. High-Tech Cyber Bot
    cx, cy = W // 2, 1330
    draw_pixar_robot(d, cx, cy, scale=1.15, eye_color=(6, 182, 212), accent_color=(139, 92, 246))
    
    # Orbiting Multi-Agent Subagent Spheres
    orbit_r = 380
    for idx, angle_deg in enumerate([30, 90, 150, 210, 270, 330]):
        rad = math.radians(angle_deg)
        ox = cx + int(orbit_r * math.cos(rad))
        oy = cy - int(orbit_r * 0.45 * math.sin(rad)) - 100
        # Orbit line
        d.ellipse([cx - orbit_r, cy - 100 - int(orbit_r*0.45), cx + orbit_r, cy - 100 + int(orbit_r*0.45)],
                  outline=(6, 182, 212), width=1)
        sub_col = (139, 92, 246) if idx % 2 == 0 else (6, 182, 212)
        draw_pixar_glow_sphere(d, (ox, oy), 28, sub_col, (255, 255, 255), (255, 255, 255))
        
    # Audio Waveform telemetry ring
    wave_y = cy + 320
    for x in range(cx - 350, cx + 350, 18):
        h = int(35 * math.sin((x - cx) * 0.05) * math.cos((x - cx) * 0.02))
        d.line([(x, wave_y - h), (x, wave_y + h)], fill=(6, 182, 212), width=4)

# ==============================================================================
# Volume 4: Modern Web, Flutter Mobile & High-Performance DevTools
# ==============================================================================
def draw_vol04(d, img):
    # 3D Pixar Builder Robot with Floating Mobile Mockups
    cx, cy = W // 2, 1350
    draw_pixar_robot(d, cx, cy, scale=1.08, eye_color=(2, 132, 199), accent_color=(20, 184, 166))
    
    # Floating Smartphone Hologram in Center
    phone_w, phone_h = 240, 420
    phone_x = cx - phone_w // 2
    phone_y = cy - 460
    
    # Glassmorphism phone body
    d.rounded_rectangle([phone_x, phone_y, phone_x + phone_w, phone_y + phone_h],
                        radius=35, fill=(15, 23, 42), outline=(2, 132, 199), width=5)
    # Screen inner content
    d.rounded_rectangle([phone_x + 15, phone_y + 25, phone_x + phone_w - 15, phone_y + phone_h - 25],
                        radius=20, fill=(30, 41, 59))
    # Flutter UI Cards inside phone
    d.rounded_rectangle([phone_x + 30, phone_y + 50, phone_x + phone_w - 30, phone_y + 130],
                        radius=12, fill=(2, 132, 199))
    d.rounded_rectangle([phone_x + 30, phone_y + 150, phone_x + phone_w - 30, phone_y + 230],
                        radius=12, fill=(20, 184, 166))
    d.rounded_rectangle([phone_x + 30, phone_y + 250, phone_x + phone_w - 30, phone_y + 360],
                        radius=12, fill=(51, 65, 85))
                        
    # 60 FPS Speed Badge
    badge_x, badge_y = cx + 220, cy - 250
    draw_pixar_glow_sphere(d, (badge_x, badge_y), 45, (20, 184, 166), (255, 255, 255), (20, 184, 166))

# ==============================================================================
# Volume 5: Cloud Data Engineering, BigQuery & Machine Learning
# ==============================================================================
def draw_vol05(d, img):
    # 3D Pixar Data Architect Bot with Floating BigQuery Cubes
    cx, cy = W // 2, 1340
    draw_pixar_robot(d, cx, cy, scale=1.1, eye_color=(29, 78, 216), accent_color=(16, 185, 129))
    
    # Floating Crystalline Data Cubes in 3D Isometric View
    def draw_iso_cube(center, size, col_top, col_left, col_right):
        x, y = center
        dx = int(size * 0.866)
        dy = int(size * 0.5)
        # Top
        d.polygon([(x, y - size), (x + dx, y - dy), (x, y), (x - dx, y - dy)], fill=col_top, outline=(255, 255, 255))
        # Left
        d.polygon([(x - dx, y - dy), (x, y), (x, y + size), (x - dx, y + dy)], fill=col_left, outline=(255, 255, 255))
        # Right
        d.polygon([(x, y), (x + dx, y - dy), (x + dx, y + dy), (x, y + size)], fill=col_right, outline=(255, 255, 255))
        
    cubes = [
        ((cx - 280, cy - 350), 45, (59, 130, 246), (37, 99, 235), (29, 78, 216)),
        ((cx, cy - 460), 60, (16, 185, 129), (5, 150, 105), (4, 120, 87)),
        ((cx + 280, cy - 350), 45, (245, 158, 11), (217, 119, 6), (180, 83, 9))
    ]
    for c_pos, sz, c_top, c_left, c_right in cubes:
        draw_iso_cube(c_pos, sz, c_top, c_left, c_right)
        
    # Data Stream Flow Lines
    d.line([(cx - 280, cy - 305), (cx, cy - 400)], fill=(59, 130, 246), width=4)
    d.line([(cx + 280, cy - 305), (cx, cy - 400)], fill=(245, 158, 11), width=4)

# ==============================================================================
# Volume 6: Full-Stack Cloud & Firebase Intelligent Backend
# ==============================================================================
def draw_vol06(d, img):
    # 3D Pixar Cloud Engineer Bot with Glowing Firebase Gem
    cx, cy = W // 2, 1340
    draw_pixar_robot(d, cx, cy, scale=1.1, eye_color=(249, 115, 22), accent_color=(56, 189, 248))
    
    # Glowing Firebase Gem / Flame in center above
    gem_cx, gem_cy = cx, cy - 280
    
    # Amber crystal flame
    gem_pts = [
        (gem_cx, gem_cy - 120), (gem_cx + 70, gem_cy - 30),
        (gem_cx + 45, gem_cy + 70), (gem_cx - 45, gem_cy + 70),
        (gem_cx - 70, gem_cy - 30)
    ]
    d.polygon(gem_pts, fill=(249, 115, 22), outline=(255, 255, 255))
    draw_pixar_glow_sphere(d, (gem_cx, gem_cy), 45, (254, 215, 170), (255, 255, 255), (249, 115, 22))
    
    # Relational Database Nodes orbiting
    db_nodes = [(cx - 280, cy - 220), (cx + 280, cy - 220), (cx - 200, cy - 450), (cx + 200, cy - 450)]
    for n in db_nodes:
        d.line([(gem_cx, gem_cy), n], fill=(56, 189, 248), width=3)
        draw_pixar_glow_sphere(d, n, 26, (37, 99, 235), (255, 255, 255), (56, 189, 248))

# ==============================================================================
# Volume 7: Bioinformatics, Genomics & Computational Life Sciences
# ==============================================================================
def draw_vol07(d, img):
    # 3D Pixar Bio-Scientist Bot with AlphaFold 3D Ribbon & DNA Helix
    cx, cy = W // 2, 1340
    draw_pixar_robot(d, cx, cy, scale=1.08, eye_color=(5, 150, 105), accent_color=(139, 92, 246))
    
    # Majestic Glowing DNA Double Helix above
    helix_cy = cy - 360
    h_len = 360
    for t in range(-h_len, h_len, 12):
        angle = t * 0.035
        x1 = cx + int(140 * math.sin(angle))
        y1 = helix_cy + t
        x2 = cx - int(140 * math.sin(angle))
        y2 = helix_cy + t
        
        # Base pair rung
        d.line([(x1, y1), (x2, y2)], fill=(139, 92, 246, 150), width=3)
        # Strand 1 sphere
        draw_pixar_glow_sphere(d, (x1, y1), 12, (5, 150, 105), (255, 255, 255), (5, 150, 105))
        # Strand 2 sphere
        draw_pixar_glow_sphere(d, (x2, y2), 12, (6, 182, 212), (255, 255, 255), (6, 182, 212))

# ==============================================================================
# Main Execution: Generate All 7 Covers
# ==============================================================================
vol_configs = [
    (1, "Virtual Labs, 3D Physics Simulation & AIoT", "AI Skill/Vol_01_Virtual_Labs_3D_Simulations_AIoT/figures/cover_art.jpg", draw_vol01),
    (2, "Academic Research, Literature Synthesis & Scholarly Writing", "AI Skill/Vol_02_Academic_Research_and_Synthesis/figures/cover_art.jpg", draw_vol02),
    (3, "AI Agentic Orchestration & Google Antigravity Architecture", "AI Skill/Vol_03_AI_Agentic_Orchestration_Antigravity/figures/cover_art.jpg", draw_vol03),
    (4, "Modern Web, Flutter Mobile & High-Performance DevTools", "AI Skill/Vol_04_Modern_Web_Flutter_and_DevTools/figures/cover_art.jpg", draw_vol04),
    (5, "Cloud Data Engineering, BigQuery & Machine Learning", "AI Skill/Vol_05_Cloud_Data_Engineering_and_ML/figures/cover_art.jpg", draw_vol05),
    (6, "Full-Stack Cloud & Firebase Intelligent Backend", "AI Skill/Vol_06_FullStack_Cloud_and_Firebase/figures/cover_art.jpg", draw_vol06),
    (7, "Bioinformatics, Genomics & Computational Life Sciences", "AI Skill/Vol_07_Bioinformatics_and_Life_Sciences/figures/cover_art.jpg", draw_vol07)
]

for vol_num, title, out_path, fn in vol_configs:
    render_volume_cover(vol_num, title, out_path, fn)

print("All 7 Volume Covers Rendered Successfully!")
