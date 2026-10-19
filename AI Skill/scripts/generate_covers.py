import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 2400

# ==============================================================================
# 3D Math & Projection Utilities
# ==============================================================================
def project_3d(x, y, z, fov=1200, cx=W//2, cy=H//2):
    # Perspective projection: Z is distance into screen (positive forward)
    # Avoid division by zero or negative
    dist = z + fov
    if dist <= 10:
        dist = 10
    factor = fov / dist
    sx = int(cx + x * factor)
    sy = int(cy + y * factor)
    return sx, sy, factor

def rotate_y(x, y, z, angle_rad):
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    nx = x * cos_a + z * sin_a
    nz = -x * sin_a + z * cos_a
    return nx, y, nz

def rotate_x(x, y, z, angle_rad):
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    ny = y * cos_a - z * sin_a
    nz = y * sin_a + z * cos_a
    return x, ny, nz

# ==============================================================================
# Multi-Pass Volumetric Bloom & Glow Engine
# ==============================================================================
def apply_volumetric_bloom(base_img, draw_glow_fn):
    # Create isolated high-intensity glow canvas
    glow_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d_glow = ImageDraw.Draw(glow_canvas)
    draw_glow_fn(d_glow)
    
    # 3-Pass Gaussian Bloom: Tight Core, Mid Corona, Broad Volumetric Halo
    pass1 = glow_canvas.filter(ImageFilter.GaussianBlur(8))
    pass2 = glow_canvas.filter(ImageFilter.GaussianBlur(25))
    pass3 = glow_canvas.filter(ImageFilter.GaussianBlur(65))
    
    # Additive blend of blooms
    bloom = Image.alpha_composite(pass3, pass2)
    bloom = Image.alpha_composite(bloom, pass1)
    bloom = Image.alpha_composite(bloom, glow_canvas)
    
    # Merge onto base image
    return Image.alpha_composite(base_img.convert("RGBA"), bloom).convert("RGB")

# ==============================================================================
# Base Atmospheric Background (Cinematic Deep Space / Cyber Lab)
# ==============================================================================
def create_atmospheric_background(primary_glow_col, horizon_col, base_col=(5, 8, 20)):
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    
    # Top 35% is dark, clean negative space for white title typography
    for y in range(H):
        t = y / (H - 1)
        if t < 0.35:
            # Deep dark upper sky with very subtle atmospheric gradient
            f = t / 0.35
            r = int(base_col[0] * (1 - f) + (base_col[0] + 8) * f)
            g = int(base_col[1] * (1 - f) + (base_col[1] + 12) * f)
            b = int(base_col[2] * (1 - f) + (base_col[2] + 25) * f)
        elif t < 0.65:
            # Midground volumetric aura zone
            f = (t - 0.35) / 0.30
            r = int((base_col[0] + 8) * (1 - f) + horizon_col[0] * f * 0.4)
            g = int((base_col[1] + 12) * (1 - f) + horizon_col[1] * f * 0.4)
            b = int((base_col[2] + 25) * (1 - f) + horizon_col[2] * f * 0.4)
        else:
            # Lower ground canvas with perspective depth
            f = (t - 0.65) / 0.35
            r = int((horizon_col[0] * 0.4) * (1 - f) + base_col[0] * 0.6 * f)
            g = int((horizon_col[1] * 0.4) * (1 - f) + base_col[1] * 0.6 * f)
            b = int((horizon_col[2] * 0.4) * (1 - f) + base_col[2] * 0.6 * f)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
        
    # Draw perspective 3D cyber grid floor in lower 40%
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d_ov = ImageDraw.Draw(overlay)
    horizon_y = 1350
    vanish_x = W // 2
    
    # Radiating perspective lines
    grid_col = (primary_glow_col[0], primary_glow_col[1], primary_glow_col[2], 25)
    for x in range(-W, 2 * W, 80):
        d_ov.line([(vanish_x, horizon_y), (x, H)], fill=grid_col, width=2)
        
    # Transverse perspective lines with geometric expansion
    curr_y = horizon_y + 12
    step = 5.0
    while curr_y < H:
        alpha = int(min(55, 15 + (curr_y - horizon_y) / (H - horizon_y) * 40))
        c = (primary_glow_col[0], primary_glow_col[1], primary_glow_col[2], alpha)
        d_ov.line([(0, int(curr_y)), (W, int(curr_y))], fill=c, width=1)
        curr_y += step
        step *= 1.13
        
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

# ==============================================================================
# Helper: 3D Holographic Ring with Nodes
# ==============================================================================
def draw_3d_holographic_ring(d, center_x, center_y, radius, tilt_rad, color, node_count=12):
    points_3d = []
    for i in range(100):
        a = 2 * math.pi * i / 100
        x = radius * math.cos(a)
        y = radius * math.sin(a)
        # Tilt around X axis
        x_rot, y_rot, z_rot = rotate_x(x, y, 0, tilt_rad)
        sx, sy, factor = project_3d(x_rot, y_rot, z_rot, fov=1000, cx=center_x, cy=center_y)
        points_3d.append((sx, sy, factor))
        
    for i in range(len(points_3d)):
        p1 = points_3d[i]
        p2 = points_3d[(i + 1) % len(points_3d)]
        w = max(1, int(3 * p1[2]))
        alpha = int(min(255, 140 * p1[2]))
        c = (color[0], color[1], color[2], alpha)
        d.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=c, width=w)
        
    # Nodes along ring
    for i in range(node_count):
        idx = int(i * (len(points_3d) / node_count))
        p = points_3d[idx]
        r = max(3, int(8 * p[2]))
        d.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=(255, 255, 255), outline=color)

# ==============================================================================
# Helper: 3D Shaded Crystalline Cube
# ==============================================================================
def draw_3d_cube(d, cx, cy, size, rot_x, rot_y, col_top, col_front, col_side):
    s = size / 2
    vertices = [
        (-s, -s, -s), (s, -s, -s), (s, s, -s), (-s, s, -s), # Back: 0,1,2,3
        (-s, -s, s), (s, -s, s), (s, s, s), (-s, s, s)       # Front: 4,5,6,7
    ]
    
    proj = []
    for vx, vy, vz in vertices:
        rx, ry, rz = rotate_y(vx, vy, vz, rot_y)
        rx, ry, rz = rotate_x(rx, ry, rz, rot_x)
        sx, sy, factor = project_3d(rx, ry, rz, fov=1200, cx=cx, cy=cy)
        proj.append((sx, sy))
        
    # Faces: Top (0,1,5,4), Front (4,5,6,7), Right (1,2,6,5)
    d.polygon([proj[0], proj[1], proj[5], proj[4]], fill=col_top, outline=(255, 255, 255))
    d.polygon([proj[4], proj[5], proj[6], proj[7]], fill=col_front, outline=(255, 255, 255))
    d.polygon([proj[1], proj[2], proj[6], proj[5]], fill=col_side, outline=(255, 255, 255))
    
    # Glowing edge highlight
    d.line([proj[4], proj[5]], fill=(255, 255, 255), width=2)
    d.line([proj[5], proj[6]], fill=(255, 255, 255), width=2)

# ==============================================================================
# Helper: Sci-Fi Telemetry & HUD Reticle
# ==============================================================================
def draw_hud_elements(d, cx, cy, radius, color):
    # Outer dashed reticle
    for a_deg in range(0, 360, 20):
        rad1 = math.radians(a_deg)
        rad2 = math.radians(a_deg + 12)
        x1, y1 = cx + radius * math.cos(rad1), cy + radius * math.sin(rad1)
        x2, y2 = cx + radius * math.cos(rad2), cy + radius * math.sin(rad2)
        d.line([(x1, y1), (x2, y2)], fill=color, width=2)
        
    # Corner target brackets
    bw, bl = 60, 25
    d.line([(cx - radius - bw, cy - radius), (cx - radius - bw + bl, cy - radius)], fill=color, width=2)
    d.line([(cx - radius - bw, cy - radius), (cx - radius - bw, cy - radius + bl)], fill=color, width=2)
    
    d.line([(cx + radius + bw, cy - radius), (cx + radius + bw - bl, cy - radius)], fill=color, width=2)
    d.line([(cx + radius + bw, cy - radius), (cx + radius + bw, cy - radius + bl)], fill=color, width=2)
    
    d.line([(cx - radius - bw, cy + radius), (cx - radius - bw + bl, cy + radius)], fill=color, width=2)
    d.line([(cx - radius - bw, cy + radius), (cx - radius - bw, cy + radius - bl)], fill=color, width=2)
    
    d.line([(cx + radius + bw, cy + radius), (cx + radius + bw - bl, cy + radius)], fill=color, width=2)
    d.line([(cx + radius + bw, cy + radius), (cx + radius + bw, cy + radius - bl)], fill=color, width=2)


# ==============================================================================
# VOLUME 1: Virtual Labs, 3D Physics Simulation & AIoT
# ==============================================================================
def render_cover_vol01(out_path):
    print("Rendering Master 3D Cover: Vol 01 - Virtual Labs & AIoT...")
    base = create_atmospheric_background((0, 240, 255), (10, 80, 160))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. Floating 3D Hexagonal Resistor Loop
        hex_r = 230
        hex_pts = []
        for i in range(6):
            a = math.radians(60 * i - 30)
            hx = hex_r * math.cos(a)
            hy = hex_r * math.sin(a) * 0.7  # tilted perspective
            sx, sy, _ = project_3d(hx, hy - 40, 0, fov=1000, cx=cx, cy=cy)
            hex_pts.append((sx, sy))
            
        for i in range(6):
            p1 = hex_pts[i]
            p2 = hex_pts[(i + 1) % 6]
            d.line([p1, p2], fill=(0, 240, 255), width=8)
            # Golden Resistor Cylinder in midpoint
            mx = (p1[0] + p2[0]) // 2
            my = (p1[1] + p2[1]) // 2
            d.ellipse([mx - 22, my - 22, mx + 22, my + 22], fill=(245, 158, 11), outline=(255, 255, 255))
            
        for pt in hex_pts:
            d.ellipse([pt[0]-16, pt[1]-16, pt[0]+16, pt[1]+16], fill=(255, 255, 255), outline=(0, 240, 255))
            
        # 2. 3D Laser Prism with Rainbow Dispersion on Left
        prism_cx, prism_cy = cx - 420, cy - 220
        d.polygon([(prism_cx, prism_cy - 120), (prism_cx - 100, prism_cy + 80), (prism_cx + 100, prism_cy + 80)],
                  fill=(15, 45, 95), outline=(0, 240, 255))
        # White laser beam in
        d.line([(prism_cx - 240, prism_cy + 20), (prism_cx - 40, prism_cy + 20)], fill=(255, 255, 255), width=6)
        # Rainbow beams out
        colors = [(239, 68, 68), (249, 115, 22), (234, 179, 8), (34, 197, 94), (6, 182, 212), (168, 85, 247)]
        for idx, col in enumerate(colors):
            dy = (idx - 2.5) * 18
            d.line([(prism_cx + 35, prism_cy + 15), (prism_cx + 260, prism_cy - 40 + dy)], fill=col, width=4)
            
        # 3. 3D Swinging Harmonic Pendulum on Right
        pivot_x, pivot_y = cx + 420, cy - 340
        bob_x, bob_y = cx + 330, cy + 40
        d.line([(pivot_x, pivot_y), (bob_x, bob_y)], fill=(200, 230, 255), width=4)
        d.ellipse([bob_x - 48, bob_y - 48, bob_x + 48, bob_y + 48], fill=(239, 68, 68), outline=(255, 255, 255))
        d.ellipse([bob_x - 18, bob_y - 24, bob_x - 6, bob_y - 12], fill=(255, 255, 255)) # specular
        
        # 4. Touchless MediaPipe 21-Joint AR Hand Skeleton (Bottom Center)
        wrist = (cx, cy + 320)
        fingers = [
            [(cx - 130, cy + 240), (cx - 170, cy + 180), (cx - 190, cy + 140)], # Thumb
            [(cx - 70, cy + 200), (cx - 85, cy + 130), (cx - 95, cy + 70)],     # Index
            [(cx - 10, cy + 190), (cx - 10, cy + 110), (cx - 10, cy + 40)],     # Middle
            [(cx + 50, cy + 200), (cx + 60, cy + 130), (cx + 65, cy + 70)],     # Ring
            [(cx + 110, cy + 220), (cx + 130, cy + 160), (cx + 140, cy + 110)]  # Pinky
        ]
        for f_chain in fingers:
            curr = wrist
            for joint in f_chain:
                d.line([curr, joint], fill=(0, 240, 255), width=4)
                d.ellipse([joint[0]-7, joint[1]-7, joint[0]+7, joint[1]+7], fill=(255, 255, 255), outline=(0, 240, 255))
                curr = joint
                
        # Central HUD Ring
        draw_hud_elements(d, cx, cy - 40, 360, (0, 240, 255))
        
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# VOLUME 2: Academic Research, Literature Synthesis & Scholarly Writing
# ==============================================================================
def render_cover_vol02(out_path):
    print("Rendering Master 3D Cover: Vol 02 - Academic Research & Synthesis...")
    base = create_atmospheric_background((245, 158, 11), (30, 60, 140), base_col=(8, 12, 28))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. Majestic 3D Floating Knowledge Tome / Open Book
        bw, bh = 340, 200
        # Left page
        d.polygon([(cx, cy + 60), (cx - bw, cy - 20), (cx - bw, cy + bh - 20), (cx, cy + bh + 40)],
                  fill=(24, 38, 85), outline=(245, 158, 11))
        # Right page
        d.polygon([(cx, cy + 60), (cx + bw, cy - 20), (cx + bw, cy + bh - 20), (cx, cy + bh + 40)],
                  fill=(30, 50, 110), outline=(245, 158, 11))
                  
        # Gold spine glow
        d.line([(cx, cy + 60), (cx, cy + bh + 40)], fill=(255, 255, 255), width=5)
        
        # Golden text streams on pages
        for row in range(7):
            y_off = cy + 40 + row * 22
            d.line([(cx - bw + 40, y_off - 10), (cx - 30, y_off)], fill=(245, 158, 11), width=3)
            d.line([(cx + 30, y_off), (cx + bw - 40, y_off - 10)], fill=(245, 158, 11), width=3)
            
        # 2. Floating 3D 7-Column Synthesis Matrix Holographic Grid
        m_w, m_h = 560, 220
        grid_top = cy - 320
        d.rounded_rectangle([cx - m_w//2, grid_top, cx + m_w//2, grid_top + m_h], radius=15,
                            fill=(15, 25, 60), outline=(245, 158, 11), width=3)
        # 7 Column Lines
        col_w = m_w / 7
        for c in range(1, 7):
            lx = int(cx - m_w//2 + c * col_w)
            d.line([(lx, grid_top), (lx, grid_top + m_h)], fill=(59, 130, 246), width=2)
            
        # 3. Celestial Spherical Constellation Network hovering above
        draw_3d_holographic_ring(d, cx, cy - 350, 320, tilt_rad=math.radians(65), color=(245, 158, 11), node_count=14)
        draw_3d_holographic_ring(d, cx, cy - 350, 250, tilt_rad=math.radians(-40), color=(59, 130, 246), node_count=10)
        
        # Floating Golden Quill / Stylus Hologram
        d.line([(cx + 260, cy - 80), (cx + 340, cy - 240)], fill=(245, 158, 11), width=6)
        d.ellipse([cx + 255, cy - 85, cx + 265, cy - 75], fill=(255, 255, 255))
        
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# VOLUME 3: AI Agentic Orchestration & Google Antigravity Architecture
# ==============================================================================
def render_cover_vol03(out_path):
    print("Rendering Master 3D Cover: Vol 03 - Agentic AI & Antigravity...")
    base = create_atmospheric_background((6, 182, 212), (50, 20, 110), base_col=(6, 8, 22))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. Massive 3D Arc-Reactor Quantum Core in Center
        core_r = 140
        for dr in range(core_r, 0, -8):
            t = dr / core_r
            r = int(6 * (1 - t) + 255 * t)
            g = int(182 * (1 - t) + 255 * t)
            b = int(212 * (1 - t) + 255 * t)
            d.ellipse([cx - dr, cy - dr, cx + dr, cy + dr], fill=(r, g, b))
            
        # Outer Mechanical Arc-Reactor Segments
        for a_deg in range(0, 360, 45):
            rad = math.radians(a_deg)
            px = cx + int(core_r * 1.35 * math.cos(rad))
            py = cy + int(core_r * 1.35 * math.sin(rad))
            d.ellipse([px - 22, py - 22, px + 22, py + 22], fill=(139, 92, 246), outline=(255, 255, 255))
            
        # 2. Orbiting Multi-Agent Subagent Spheres in 3D Space
        draw_3d_holographic_ring(d, cx, cy, 380, tilt_rad=math.radians(70), color=(6, 182, 212), node_count=8)
        draw_3d_holographic_ring(d, cx, cy, 320, tilt_rad=math.radians(-60), color=(139, 92, 246), node_count=6)
        
        # 3. Real-Time Telemetry DSP Audio Waveform Ring
        for deg in range(0, 360, 6):
            rad = math.radians(deg)
            # modulate height
            h = int(35 * math.sin(deg * 0.12) * math.cos(deg * 0.08))
            r_inner = 250
            r_outer = r_inner + abs(h) + 10
            x1 = cx + int(r_inner * math.cos(rad))
            y1 = cy + int(r_inner * math.sin(rad))
            x2 = cx + int(r_outer * math.cos(rad))
            y2 = cy + int(r_outer * math.sin(rad))
            d.line([(x1, y1), (x2, y2)], fill=(6, 182, 212), width=3)
            
        # Sci-Fi Corner Brackets & HUD
        draw_hud_elements(d, cx, cy, 460, (6, 182, 212))
        
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# VOLUME 4: Modern Web, Flutter Mobile & High-Performance DevTools
# ==============================================================================
def render_cover_vol04(out_path):
    print("Rendering Master 3D Cover: Vol 04 - Modern Web & Flutter...")
    base = create_atmospheric_background((2, 132, 199), (15, 60, 110), base_col=(5, 12, 25))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. Two 3D Floating Bezel-less Curved Smartphones
        def draw_perspective_phone(px, py, w, h, tilt_angle, app_col):
            # 3D tilted phone frame
            corners = [(-w//2, -h//2), (w//2, -h//2), (w//2, h//2), (-w//2, h//2)]
            proj = []
            for vx, vy in corners:
                rx, ry, rz = rotate_y(vx, vy, 0, tilt_angle)
                sx, sy, _ = project_3d(rx, ry, rz, fov=1200, cx=px, cy=py)
                proj.append((sx, sy))
                
            # Body
            d.polygon(proj, fill=(15, 23, 42), outline=(2, 132, 199))
            
            # Inner UI Cards
            card_top = (proj[0][1] + proj[3][1]) // 2 + 30
            card_h = 100
            for i in range(3):
                y0 = card_top + i * 110
                d.rounded_rectangle([px - w//3, y0, px + w//3, y0 + card_h], radius=14,
                                    fill=app_col, outline=(255, 255, 255))
                                    
        # Left Phone (Tilted Left)
        draw_perspective_phone(cx - 260, cy - 80, 280, 520, math.radians(22), (2, 132, 199))
        # Right Phone (Tilted Right)
        draw_perspective_phone(cx + 260, cy - 80, 280, 520, math.radians(-22), (20, 184, 166))
        
        # 2. Modern 60 FPS Core Web Vitals Performance Dial in Center
        draw_3d_holographic_ring(d, cx, cy - 260, 140, tilt_rad=math.radians(35), color=(20, 184, 166), node_count=8)
        d.ellipse([cx - 45, cy - 260 - 45, cx + 45, cy - 260 + 45], fill=(20, 184, 166), outline=(255, 255, 255))
        
        # 3. Responsive Container Layout Wireframe Grid behind
        for grid_r in [380, 480]:
            draw_3d_holographic_ring(d, cx, cy, grid_r, tilt_rad=math.radians(72), color=(2, 132, 199), node_count=12)
            
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# VOLUME 5: Cloud Data Engineering, BigQuery & Machine Learning
# ==============================================================================
def render_cover_vol05(out_path):
    print("Rendering Master 3D Cover: Vol 05 - Cloud Data & Machine Learning...")
    base = create_atmospheric_background((29, 78, 216), (16, 120, 90), base_col=(4, 10, 24))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. 3D Isometric Crystalline Data Cubes (BigQuery Lakehouse Layers)
        # Central Big Hypercube (Gold/Emerald)
        draw_3d_cube(d, cx, cy - 140, 160, rot_x=math.radians(30), rot_y=math.radians(45),
                     col_top=(16, 185, 129), col_front=(5, 150, 105), col_side=(4, 120, 87))
                     
        # Satellite Cubes
        satellites = [
            (cx - 320, cy - 300, 100, (59, 130, 246), (37, 99, 235), (29, 78, 216)), # Bronze Raw
            (cx + 320, cy - 300, 100, (245, 158, 11), (217, 119, 6), (180, 83, 9)),   # Silver Cleaned
            (cx - 280, cy + 120, 90, (139, 92, 246), (124, 58, 237), (109, 40, 217)), # Dataproc
            (cx + 280, cy + 120, 90, (236, 72, 153), (219, 39, 119), (190, 24, 93))   # ML Model
        ]
        
        for scx, scy, sz, c1, c2, c3 in satellites:
            # Laser data streaming conduit to central cube
            d.line([(scx, scy), (cx, cy - 140)], fill=c1, width=4)
            draw_3d_cube(d, scx, scy, sz, rot_x=math.radians(25), rot_y=math.radians(-35),
                         col_top=c1, col_front=c2, col_side=c3)
                         
        # 2. Orbital Quantum Data Rings
        draw_3d_holographic_ring(d, cx, cy - 140, 420, tilt_rad=math.radians(65), color=(59, 130, 246), node_count=16)
        draw_3d_holographic_ring(d, cx, cy - 140, 350, tilt_rad=math.radians(-55), color=(16, 185, 129), node_count=12)
        
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# VOLUME 6: Full-Stack Cloud & Firebase Intelligent Backend
# ==============================================================================
def render_cover_vol06(out_path):
    print("Rendering Master 3D Cover: Vol 06 - Full-Stack Cloud & Firebase...")
    base = create_atmospheric_background((249, 115, 22), (60, 25, 80), base_col=(10, 8, 22))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. Majestic 3D Radiant Firebase Crystal Core
        core_pts = [
            (cx, cy - 320), (cx + 120, cy - 140), (cx + 80, cy + 60),
            (cx - 80, cy + 60), (cx - 120, cy - 140)
        ]
        # Multi-layered crystal facets
        d.polygon(core_pts, fill=(249, 115, 22), outline=(255, 255, 255))
        d.polygon([(cx, cy - 320), (cx, cy + 60), (cx + 80, cy + 60), (cx + 120, cy - 140)],
                  fill=(251, 146, 60), outline=(255, 255, 255))
        d.polygon([(cx, cy - 320), (cx, cy + 60), (cx - 80, cy + 60), (cx - 120, cy - 140)],
                  fill=(234, 88, 12), outline=(255, 255, 255))
                  
        # Inner white fire nucleus
        d.ellipse([cx - 45, cy - 130, cx + 45, cy - 40], fill=(255, 255, 255))
        
        # 2. Floating Relational Database Schema Cubes (PostgreSQL Data Connect)
        db_positions = [
            (cx - 360, cy - 200, (56, 189, 248)), # Auth node
            (cx + 360, cy - 200, (37, 99, 235)),  # Postgres SQL
            (cx - 280, cy + 180, (168, 85, 247)), # Storage bucket
            (cx + 280, cy + 180, (234, 179, 8))   # Firestore NoSQL
        ]
        
        for dbx, dby, col in db_positions:
            d.line([(cx, cy - 80), (dbx, dby)], fill=col, width=4)
            # 3D database node
            d.rounded_rectangle([dbx - 60, dby - 40, dbx + 60, dby + 40], radius=15,
                                fill=(15, 23, 42), outline=col, width=3)
            d.ellipse([dbx - 20, dby - 12, dbx + 20, dby + 12], fill=col)
            
        # 3. Concentric Security Shield Rings (Zero-Trust)
        draw_3d_holographic_ring(d, cx, cy - 80, 440, tilt_rad=math.radians(65), color=(249, 115, 22), node_count=16)
        
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# VOLUME 7: Bioinformatics, Genomics & Computational Life Sciences
# ==============================================================================
def render_cover_vol07(out_path):
    print("Rendering Master 3D Cover: Vol 07 - Bioinformatics & Life Sciences...")
    base = create_atmospheric_background((5, 150, 105), (10, 75, 75), base_col=(3, 14, 18))
    
    def draw_scene(d):
        cx, cy = W // 2, 1260
        
        # 1. 3D Spiraling DNA Double Helix with Volumetric Depth
        helix_h = 580
        for t in range(-helix_h // 2, helix_h // 2, 10):
            rad = t * 0.024
            # Strand 1 (X1, Y1, Z1)
            x1 = 200 * math.sin(rad)
            y1 = t
            z1 = 200 * math.cos(rad)
            
            # Strand 2 opposite (X2, Y2, Z2)
            x2 = -x1
            y2 = t
            z2 = -z1
            
            sx1, sy1, f1 = project_3d(x1, y1, z1, fov=1100, cx=cx, cy=cy - 100)
            sx2, sy2, f2 = project_3d(x2, y2, z2, fov=1100, cx=cx, cy=cy - 100)
            
            # Draw base-pair rung connecting both strands
            alpha = int(min(255, 120 + 100 * (f1 + f2) / 2))
            d.line([(sx1, sy1), (sx2, sy2)], fill=(139, 92, 246, alpha), width=max(1, int(4 * f1)))
            
            # Strand 1 Sphere (Bio-Emerald)
            r1 = max(4, int(15 * f1))
            d.ellipse([sx1 - r1, sy1 - r1, sx1 + r1, sy1 + r1], fill=(5, 150, 105), outline=(255, 255, 255))
            
            # Strand 2 Sphere (Cyan / Turquoise)
            r2 = max(4, int(15 * f2))
            d.ellipse([sx2 - r2, sy2 - r2, sx2 + r2, sy2 + r2], fill=(6, 182, 212), outline=(255, 255, 255))
            
        # 2. AlphaFold 3D Protein Ribbon Splines orbiting DNA
        draw_3d_holographic_ring(d, cx, cy - 100, 380, tilt_rad=math.radians(60), color=(5, 150, 105), node_count=14)
        draw_3d_holographic_ring(d, cx, cy - 100, 320, tilt_rad=math.radians(-50), color=(139, 92, 246), node_count=10)
        
        # 3. Chemical Ligand Molecules (ChEMBL / PubChem Ball-and-Stick)
        ligands = [
            (cx - 360, cy - 120, (239, 68, 68)),
            (cx + 360, cy - 120, (245, 158, 11)),
            (cx - 240, cy + 220, (59, 130, 246)),
            (cx + 240, cy + 220, (168, 85, 247))
        ]
        for lx, ly, lcol in ligands:
            d.ellipse([lx - 32, ly - 32, lx + 32, ly + 32], fill=lcol, outline=(255, 255, 255))
            # covalent bonds
            d.line([(lx, ly), (lx + 45, ly - 30)], fill=(255, 255, 255), width=3)
            d.ellipse([lx + 45 - 16, ly - 30 - 16, lx + 45 + 16, ly - 30 + 16], fill=lcol)
            
    final_img = apply_volumetric_bloom(base, draw_scene)
    final_img.save(out_path, format="JPEG", quality=96, dpi=(300, 300))
    print(f"Saved: {out_path}")


# ==============================================================================
# Master Execution: Render All 7 Covers
# ==============================================================================
if __name__ == "__main__":
    covers = [
        ("AI Skill/Vol_01_Virtual_Labs_3D_Simulations_AIoT/figures/cover_art.jpg", render_cover_vol01),
        ("AI Skill/Vol_02_Academic_Research_and_Synthesis/figures/cover_art.jpg", render_cover_vol02),
        ("AI Skill/Vol_03_AI_Agentic_Orchestration_Antigravity/figures/cover_art.jpg", render_cover_vol03),
        ("AI Skill/Vol_04_Modern_Web_Flutter_and_DevTools/figures/cover_art.jpg", render_cover_vol04),
        ("AI Skill/Vol_05_Cloud_Data_Engineering_and_ML/figures/cover_art.jpg", render_cover_vol05),
        ("AI Skill/Vol_06_FullStack_Cloud_and_Firebase/figures/cover_art.jpg", render_cover_vol06),
        ("AI Skill/Vol_07_Bioinformatics_and_Life_Sciences/figures/cover_art.jpg", render_cover_vol07)
    ]
    
    for path, render_fn in covers:
        render_fn(path)
        
    print("\nALL 7 MASTER 3D COVERS RENDERED WITH FULL BLOOM & PBR VOLUMETRIC AESTHETIC!")
