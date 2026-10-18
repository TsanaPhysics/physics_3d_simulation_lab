#!/usr/bin/env python3
"""
generate_3d_cover.py
Generates hyper-futuristic 3D Academic Book Cover for Next-Gen Physics Lab 2026.
Adheres to academic-book-cover-architect standards (2:3 aspect ratio, 1600x2400 px, 6x9 in).
Seamlessly blends Mr. Deep_xAI / J.A.R.V.I.S. avatar, 3D holographic physics simulations,
MediaPipe AR hand tracking, and clean typographic negative spaces.
"""

import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1600, 2400

def create_futuristic_cover():
    print(f"Creating base canvas {W}x{H}...")
    
    # 1. Background Gradient (Dark Cyber Laboratory Atmosphere)
    # Upper 30% (0-720): Deep midnight dark cyan-blue for title negative space
    # Mid 45% (720-1800): High-tech holographic lab core with soft ambient illumination
    # Lower 25% (1800-2400): Reflective obsidian floor for author negative space
    bg = np.zeros((H, W, 4), dtype=np.uint8)
    
    for y in range(H):
        ny = y / float(H)
        if ny < 0.30:
            # Top: Dark space #030611 -> #061124
            t = ny / 0.30
            r = int(3 + t * 4)
            g = int(6 + t * 11)
            b = int(17 + t * 20)
        elif ny < 0.75:
            # Mid: Core #061124 -> #0d2140 -> #061124
            t = (ny - 0.30) / 0.45
            curve = math.sin(t * math.pi)
            r = int(7 + curve * 15)
            g = int(17 + curve * 28)
            b = int(37 + curve * 46)
        else:
            # Bottom: Dark reflective workbench #061124 -> #020409
            t = (ny - 0.75) / 0.25
            r = int(7 - t * 5)
            g = int(17 - t * 13)
            b = int(37 - t * 28)
            
        bg[y, :, 0] = r
        bg[y, :, 1] = g
        bg[y, :, 2] = b
        bg[y, :, 3] = 255

    canvas = Image.fromarray(bg, mode="RGBA")
    
    # 2. Add Radial Cyan Ambient Glow in Midground (x=800, y=1180)
    glow_arr = np.zeros((H, W, 4), dtype=np.uint8)
    cx, cy = 800, 1180
    y_coords, x_coords = np.ogrid[:H, :W]
    dist_sq = ((x_coords - cx) / 1.0) ** 2 + ((y_coords - cy) / 0.8) ** 2
    max_r = 850
    mask = dist_sq < (max_r ** 2)
    glow_intensity = np.clip(1.0 - np.sqrt(dist_sq) / max_r, 0, 1) ** 2.2
    
    glow_arr[mask, 0] = (glow_intensity[mask] * 18).astype(np.uint8)
    glow_arr[mask, 1] = (glow_intensity[mask] * 85).astype(np.uint8)
    glow_arr[mask, 2] = (glow_intensity[mask] * 180).astype(np.uint8)
    glow_arr[mask, 3] = (glow_intensity[mask] * 190).astype(np.uint8)
    
    glow_img = Image.fromarray(glow_arr, mode="RGBA").filter(ImageFilter.GaussianBlur(radius=60))
    canvas = Image.alpha_composite(canvas, glow_img)
    
    # 3. Perspective Cybernetic Grid on Floor (y: 1720 to 2400)
    grid_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid_img)
    horizon_y = 1720
    floor_cx = W // 2
    
    for i in range(-25, 26):
        x_bot = floor_cx + i * 85
        x_top = floor_cx + i * 15
        alpha = max(10, 75 - abs(i) * 3)
        gdraw.line([(x_top, horizon_y), (x_bot, H)], fill=(0, 210, 255, alpha), width=2)
        
    for step in range(1, 16):
        ratio = (step / 16.0) ** 2.2
        cur_y = int(horizon_y + ratio * (H - horizon_y))
        alpha = int(25 + 130 * ratio)
        gdraw.line([(0, cur_y), (W, cur_y)], fill=(0, 210, 255, alpha), width=1)
        
    # Horizon rim light glow
    gdraw.line([(0, horizon_y), (W, horizon_y)], fill=(0, 240, 255, 160), width=3)
    canvas = Image.alpha_composite(canvas, grid_img)

    # 4. Composite Mr. Deep_xAI Digital Bot Avatar with SEAMLESS RADIAL FEATHERING
    avatar_path = "assets/images/mr_deep_xai_digital_bot.png"
    if os.path.exists(avatar_path):
        print("Integrating Mr. Deep_xAI high-res avatar with seamless radial feathering...")
        avatar_raw = Image.open(avatar_path).convert("RGBA")
        
        # Target size: width 860px
        aw, ah = avatar_raw.size
        target_w = 860
        target_h = int(ah * (target_w / float(aw)))
        avatar_scaled = avatar_raw.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Create an elliptical / radial feathering mask so NO rectangular box is visible
        mask_arr = np.zeros((target_h, target_w), dtype=np.uint8)
        acx = target_w // 2
        acy = int(target_h * 0.42) # Center around chest / face
        
        y_g, x_g = np.ogrid[:target_h, :target_w]
        # Ellipse radius: rx = 380, ry = 480
        norm_dist = np.sqrt(((x_g - acx) / 380.0) ** 2 + ((y_g - acy) / 480.0) ** 2)
        
        # Soft transition between 0.65 and 1.0
        alpha_factor = np.clip(1.0 - (norm_dist - 0.65) / 0.35, 0.0, 1.0)
        alpha_factor = alpha_factor ** 1.8
        
        # Also feather bottom heavily past y = 68%
        bottom_fade = np.ones((target_h, target_w), dtype=np.float32)
        cutoff_y = int(target_h * 0.68)
        for my in range(cutoff_y, target_h):
            fade_b = 1.0 - (my - cutoff_y) / float(target_h - cutoff_y)
            bottom_fade[my, :] = max(0.0, fade_b ** 2.0)
            
        final_alpha = (alpha_factor * bottom_fade * 255).astype(np.uint8)
        mask_img = Image.fromarray(final_alpha, mode="L")
        
        av_x = (W - target_w) // 2
        av_y = 740
        canvas.paste(avatar_scaled, (av_x, av_y), mask_img)
        
    # 5. Add 3D Holographic HUD Rings & Arc Reactor
    hud_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(hud_layer)
    
    # 5.1 Arc Reactor on Chest (x=800, y=1490)
    arc_cx, arc_cy = 800, 1490
    for r_out in [74, 60, 46, 32, 18]:
        hdraw.ellipse([arc_cx - r_out, arc_cy - r_out, arc_cx + r_out, arc_cy + r_out], 
                      outline=(0, 240, 255, 230), width=3)
    # Inner reactor core glow
    hdraw.ellipse([arc_cx - 12, arc_cy - 12, arc_cx + 12, arc_cy + 12], fill=(255, 255, 255, 255))
    for ang_deg in range(0, 360, 45):
        rad = math.radians(ang_deg)
        x1 = arc_cx + int(32 * math.cos(rad))
        y1 = arc_cy + int(32 * math.sin(rad))
        x2 = arc_cx + int(58 * math.cos(rad))
        y2 = arc_cy + int(58 * math.sin(rad))
        hdraw.line([(x1, y1), (x2, y2)], fill=(0, 240, 255, 255), width=3)

    # 5.2 Floating Holographic HUD Orbitals around Head (x=800, y=1030)
    head_cx, head_cy = 800, 1030
    # Outer dashed HUD ring
    for deg in range(0, 360, 6):
        if (deg % 30) < 22:
            rad1 = math.radians(deg)
            rad2 = math.radians(deg + 4)
            r_orbit = 330
            p1 = (head_cx + int(r_orbit * math.cos(rad1)), head_cy + int(r_orbit * 0.9 * math.sin(rad1)))
            p2 = (head_cx + int(r_orbit * math.cos(rad2)), head_cy + int(r_orbit * 0.9 * math.sin(rad2)))
            hdraw.line([p1, p2], fill=(0, 230, 255, 200), width=2)
            
    # HUD Target reticles & Angle ticks
    for tick_deg in [0, 45, 90, 135, 180, 225, 270, 315]:
        rad = math.radians(tick_deg)
        tx1 = head_cx + int(315 * math.cos(rad))
        ty1 = head_cy + int(315 * 0.9 * math.sin(rad))
        tx2 = head_cx + int(345 * math.cos(rad))
        ty2 = head_cy + int(345 * 0.9 * math.sin(rad))
        hdraw.line([(tx1, ty1), (tx2, ty2)], fill=(56, 189, 248, 255), width=3)
        hdraw.ellipse([tx2 - 4, ty2 - 4, tx2 + 4, ty2 + 4], fill=(255, 255, 255, 255))
        
    # 6. Left Hologram: 3D Hexagonal Resistor Circuit Loop (x=280, y=1480)
    hex_cx, hex_cy = 280, 1480
    hex_r = 160
    nodes = []
    for i in range(6):
        ang = math.radians(60 * i - 30)
        nx = int(hex_cx + hex_r * math.cos(ang))
        ny = int(hex_cy + hex_r * 0.68 * math.sin(ang))
        nodes.append((nx, ny))
        
    # Hexagon circuit ring glow platform
    for pr in [220, 190, 160]:
        hdraw.ellipse([hex_cx - pr, hex_cy + 130 - int(pr * 0.35), hex_cx + pr, hex_cy + 130 + int(pr * 0.35)],
                      outline=(0, 240, 255, 80), width=2)
                      
    for i in range(6):
        n1 = nodes[i]
        n2 = nodes[(i + 1) % 6]
        # Neon branch line
        hdraw.line([n1, n2], fill=(245, 158, 11, 230), width=7)
        hdraw.line([n1, n2], fill=(254, 240, 138, 255), width=3)
        
        # 3D Resistor body in center of branch
        mx = (n1[0] + n2[0]) // 2
        my = (n1[1] + n2[1]) // 2
        hdraw.rectangle([mx - 22, my - 12, mx + 22, my + 12], fill=(15, 23, 42, 255), outline=(234, 179, 8, 255), width=2)
        # Resistor color bands
        b_cols = [(239, 68, 68), (37, 99, 235), (34, 197, 94), (234, 179, 8)]
        for bi, col in enumerate(b_cols):
            hdraw.line([(mx - 12 + bi * 8, my - 11), (mx - 12 + bi * 8, my + 11)], fill=col + (255,), width=3)
            
    # Golden terminals
    for idx, (nx, ny) in enumerate(nodes):
        hdraw.ellipse([nx - 14, ny - 14, nx + 14, ny + 14], fill=(251, 191, 36, 255), outline=(255, 255, 255, 255), width=3)
        
    # Telemetry card above circuit (x=280, y=1260)
    hdraw.rounded_rectangle([hex_cx - 150, hex_cy - 240, hex_cx + 150, hex_cy - 160], radius=10, fill=(10, 20, 40, 230), outline=(56, 189, 248, 220), width=2)
    # Voltage pulse line inside card
    card_pts = []
    for cx_step in range(260):
        c_val = int(hex_cy - 200 + 18 * math.sin(cx_step * 0.12))
        card_pts.append((hex_cx - 130 + cx_step, c_val))
    for c_i in range(len(card_pts) - 1):
        hdraw.line([card_pts[c_i], card_pts[c_i + 1]], fill=(16, 185, 129, 255), width=3)
        
    # 7. Left-Top Hologram: 3D Simple Pendulum & Laser Oscillations (x=290, y=940)
    # Placed in the left quadrant so it NEVER touches his face!
    pend_top = (290, 780)
    pend_ball = (230, 980)
    hdraw.line([pend_top, pend_ball], fill=(250, 204, 21, 240), width=4)
    # Laser sweep arc
    hdraw.arc([pend_top[0] - 120, pend_top[1] - 120, pend_top[0] + 120, pend_top[1] + 120], start=30, end=150, fill=(56, 189, 248, 200), width=3)
    # Polished steel bob
    hdraw.ellipse([pend_ball[0] - 28, pend_ball[1] - 28, pend_ball[0] + 28, pend_ball[1] + 28], fill=(225, 29, 72, 255), outline=(255, 255, 255, 255), width=4)
    hdraw.ellipse([pend_ball[0] - 12, pend_ball[1] - 16, pend_ball[0] - 2, pend_ball[1] - 6], fill=(255, 255, 255, 240))

    # 8. Right-Top Hologram: 3D Optical Glass Prism & Spectral Dispersion (x=1320, y=980)
    prism_cx, prism_cy = 1320, 980
    p_top = (prism_cx, prism_cy - 80)
    p_left = (prism_cx - 75, prism_cy + 60)
    p_right = (prism_cx + 75, prism_cy + 60)
    # Glass prism facet with cyan glow
    hdraw.polygon([p_top, p_left, p_right], fill=(30, 58, 138, 180), outline=(56, 189, 248, 255))
    # Laser beam in
    hdraw.line([(prism_cx - 160, prism_cy + 20), (prism_cx - 30, prism_cy + 10)], fill=(255, 255, 255, 255), width=5)
    # Spectrum dispersion rays out
    spec_cols = [
        (239, 68, 68), (249, 115, 22), (234, 179, 8), 
        (34, 197, 94), (6, 182, 212), (59, 130, 246), (168, 85, 247)
    ]
    for s_idx, scol in enumerate(spec_cols):
        y_spread = prism_cy - 30 + s_idx * 18
        hdraw.line([(prism_cx + 25, prism_cy + 15), (prism_cx + 190, y_spread)], fill=scol + (240,), width=3)

    # 9. Right-Bottom Hologram: MediaPipe AR 3D Hand Skeleton (x=1320, y=1480)
    hwrist = (1320, 1720)
    h_pts = {
        0: hwrist,
        1: (1260, 1660), 2: (1210, 1590), 3: (1180, 1530), 4: (1160, 1470), # Thumb
        5: (1270, 1520), 6: (1250, 1410), 7: (1230, 1320), 8: (1210, 1240), # Index
        9: (1330, 1500), 10: (1330, 1380), 11: (1330, 1270), 12: (1330, 1180), # Mid
        13: (1380, 1520), 14: (1395, 1420), 15: (1405, 1330), 16: (1415, 1250), # Ring
        17: (1430, 1560), 18: (1460, 1480), 19: (1480, 1410), 20: (1500, 1340)  # Pinky
    }
    h_conns = [
        (0, 1), (1, 2), (2, 3), (3, 4),
        (0, 5), (5, 6), (6, 7), (7, 8),
        (5, 9), (9, 10), (10, 11), (11, 12),
        (9, 13), (13, 14), (14, 15), (15, 16),
        (13, 17), (17, 18), (18, 19), (19, 20), (0, 17)
    ]
    for p1_i, p2_i in h_conns:
        pt1 = h_pts[p1_i]
        pt2 = h_pts[p2_i]
        hdraw.line([pt1, pt2], fill=(0, 240, 255, 170), width=5)
        hdraw.line([pt1, pt2], fill=(255, 255, 255, 230), width=2)
        
    for p_idx, pt in h_pts.items():
        is_tip = p_idx in [4, 8]
        col = (255, 255, 255, 255) if is_tip else (0, 240, 255, 255)
        rad_sz = 10 if is_tip else 6
        hdraw.ellipse([pt[0] - rad_sz, pt[1] - rad_sz, pt[0] + rad_sz, pt[1] + rad_sz], fill=col, outline=(14, 165, 233, 255), width=3)

    # Pinch target crosshair & laser pulse
    pinch_pt = ((h_pts[4][0] + h_pts[8][0]) // 2, (h_pts[4][1] + h_pts[8][1]) // 2)
    hdraw.ellipse([pinch_pt[0] - 36, pinch_pt[1] - 36, pinch_pt[0] + 36, pinch_pt[1] + 36], outline=(52, 211, 153, 240), width=3)
    hdraw.line([(pinch_pt[0] - 50, pinch_pt[1]), (pinch_pt[0] + 50, pinch_pt[1])], fill=(52, 211, 153, 220), width=2)
    hdraw.line([(pinch_pt[0], pinch_pt[1] - 50), (pinch_pt[0], pinch_pt[1] + 50)], fill=(52, 211, 153, 220), width=2)

    # 10. Clean Formatted Scientific Formulas
    equations = [
        ("T = 2pi sqrt(L/g)", 150, 860),
        ("Req = 5/6 Ohm", 150, 1680),
        ("1/f = 1/s + 1/s'", 1250, 820),
        ("curl B = mu0 * J", 1240, 1800),
        ("c = 3.00 x 10^8 m/s", 710, 680),
        ("E = h*nu - W0", 150, 1140)
    ]
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
    except:
        font = ImageFont.load_default()
        
    for eq_text, eq_x, eq_y in equations:
        hdraw.text((eq_x, eq_y), eq_text, font=font, fill=(56, 189, 248, 170))

    # Multi-pass Gaussian Bloom for Sci-Fi Glow Effect
    print("Applying multi-scale sci-fi bloom...")
    glow1 = hud_layer.filter(ImageFilter.GaussianBlur(radius=5))
    glow2 = hud_layer.filter(ImageFilter.GaussianBlur(radius=15))
    glow3 = hud_layer.filter(ImageFilter.GaussianBlur(radius=32))
    
    canvas = Image.alpha_composite(canvas, glow3)
    canvas = Image.alpha_composite(canvas, glow2)
    canvas = Image.alpha_composite(canvas, glow1)
    canvas = Image.alpha_composite(canvas, hud_layer)

    # 11. Save Output Artwork
    out_jpg = "workshop_manual_3d_ar_ai/figures/cover_art.jpg"
    out_png = "assets/images/cover_art_3d_futuristic.png"
    
    os.makedirs(os.path.dirname(out_jpg), exist_ok=True)
    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    
    canvas.convert("RGB").save(out_jpg, quality=98)
    canvas.save(out_png)
    print(f"Cover artwork saved to:\n  - {out_jpg}\n  - {out_png}")

if __name__ == "__main__":
    create_futuristic_cover()
