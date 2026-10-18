#!/usr/bin/env python3
"""
scripts/generate_digital_bot_avatar.py
Futuristic Digital Bot Avatar Generator (Jarvis HUD Hologram Style)
Part of futuristic-agentic-ai-bot-architect skill.
"""

import sys
import os
import math
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

def generate_digital_bot_avatar(input_path, out_full_path, out_square_path, bot_name="AI COPILOT", subtitle="ONLINE 60FPS"):
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} not found.")
        return False

    orig = Image.open(input_path).convert('RGBA')
    w, h = orig.size

    # 1. Base color enhancement
    enhancer = ImageEnhance.Contrast(orig)
    graded = enhancer.enhance(1.08)

    # 2. Extract edge contours for holographic cyber-lines
    gray = orig.convert('L').filter(ImageFilter.GaussianBlur(radius=1))
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges_arr = np.array(edges)

    edge_rgba = np.zeros((h, w, 4), dtype=np.uint8)
    strong = edges_arr > 28
    edge_rgba[strong, 0] = 30   # Cyan R
    edge_rgba[strong, 1] = 210  # Cyan G
    edge_rgba[strong, 2] = 255  # Cyan B
    edge_rgba[strong, 3] = np.clip(edges_arr[strong] * 0.65, 0, 140).astype(np.uint8)

    edge_img = Image.fromarray(edge_rgba, mode='RGBA').filter(ImageFilter.GaussianBlur(radius=1.5))

    # 3. Create Sci-Fi Cybernetic HUD Layer
    hud = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(hud)

    cyan = (0, 242, 254, 240)
    cyan_soft = (56, 189, 248, 140)
    purple = (168, 85, 247, 180)
    white = (255, 255, 255, 255)

    try:
        font_sm = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 12)
        font_xs = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 10)
    except Exception:
        font_sm = ImageFont.load_default()
        font_xs = font_sm

    head_x = w // 2
    head_y = int(h * 0.28)

    eye_l = (head_x - int(w * 0.055), head_y - int(h * 0.018))
    eye_r = (head_x + int(w * 0.055), head_y - int(h * 0.021))

    # Quantum Ocular Irises
    for ex, ey in [eye_l, eye_r]:
        draw.ellipse([ex - 7, ey - 7, ex + 7, ey + 7], outline=cyan, width=1)
        draw.ellipse([ex - 2, ey - 2, ex + 2, ey + 2], fill=white)
        draw.line([ex - 14, ey, ex - 9, ey], fill=cyan, width=1)
        draw.line([ex + 9, ey, ex + 14, ey], fill=cyan, width=1)
        draw.line([ex, ey - 14, ex, ey - 9], fill=cyan, width=1)
        draw.line([ex, ey + 9, ex, ey + 14], fill=cyan, width=1)

    # Concentric Jarvis HUD Rings
    for r_ring in [int(w * 0.24), int(w * 0.26), int(w * 0.28), int(w * 0.31)]:
        draw.ellipse([head_x - r_ring, head_y - r_ring, head_x + r_ring, head_y + r_ring], 
                     outline=(56, 189, 248, 85), width=1)

    for deg in range(0, 360, 15):
        rad = math.radians(deg)
        r1 = int(w * 0.255)
        r2 = int(w * 0.267) if deg % 45 == 0 else int(w * 0.260)
        draw.line([(head_x + math.cos(rad) * r1, head_y + math.sin(rad) * r1),
                   (head_x + math.cos(rad) * r2, head_y + math.sin(rad) * r2)], fill=cyan, width=1)

    # Scanlines
    scanline_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    scan_draw = ImageDraw.Draw(scanline_layer)
    for y in range(0, h, 3):
        scan_draw.line([(0, y), (w, y)], fill=(2, 6, 23, 20), width=1)

    final_full = graded.copy()
    final_full.alpha_composite(edge_img)
    final_full.alpha_composite(hud)
    final_full.alpha_composite(scanline_layer)

    os.makedirs(os.path.dirname(out_full_path) or '.', exist_ok=True)
    final_full.save(out_full_path, 'PNG')
    print(f"Saved full portrait: {out_full_path}")

    # Precision 512x512 Square Crop
    crop_size = 512
    half = crop_size // 2
    c_x1 = max(0, head_x - half)
    c_y1 = max(0, head_y - 210)
    c_x2 = c_x1 + crop_size
    c_y2 = c_y1 + crop_size

    if c_x2 > w:
        c_x2 = w
        c_x1 = w - crop_size

    sq_base = graded.crop((c_x1, c_y1, c_x2, c_y2))
    sq_edge = edge_img.crop((c_x1, c_y1, c_x2, c_y2))
    sq_scan = scanline_layer.crop((c_x1, c_y1, c_x2, c_y2))

    sq_hud = Image.new('RGBA', (crop_size, crop_size), (0, 0, 0, 0))
    sq_draw = ImageDraw.Draw(sq_hud)

    sq_cx, sq_cy = crop_size // 2, 210
    for r_ring in [185, 200, 215, 240]:
        sq_draw.ellipse([sq_cx - r_ring, sq_cy - r_ring, sq_cx + r_ring, sq_cy + r_ring], 
                        outline=(56, 189, 248, 90), width=1)

    # Square Badges
    sq_draw.rectangle([18, 18, 185, 48], fill=(2, 6, 23, 180), outline=(56, 189, 248, 160), width=1)
    sq_draw.text((26, 22), bot_name, fill=cyan, font=font_sm)
    sq_draw.text((26, 36), 'DIGITAL BOT // 2026', fill=(226, 232, 240, 200), font=font_xs)

    sq_draw.rectangle([325, 18, 494, 48], fill=(2, 6, 23, 180), outline=(168, 85, 247, 160), width=1)
    sq_draw.text((333, 22), 'CO-CREATION CORE', fill=(192, 132, 252, 255), font=font_sm)
    sq_draw.text((333, 36), subtitle, fill=(52, 211, 153, 220), font=font_xs)

    # Brackets
    b_len = 24
    sq_draw.line([(10, 10), (10 + b_len, 10)], fill=cyan, width=2)
    sq_draw.line([(10, 10), (10, 10 + b_len)], fill=cyan, width=2)
    sq_draw.line([(crop_size - 10, 10), (crop_size - 10 - b_len, 10)], fill=cyan, width=2)
    sq_draw.line([(crop_size - 10, 10), (crop_size - 10, 10 + b_len)], fill=cyan, width=2)

    final_sq = sq_base.copy()
    final_sq.alpha_composite(sq_edge)
    final_sq.alpha_composite(sq_hud)
    final_sq.alpha_composite(sq_scan)

    os.makedirs(os.path.dirname(out_square_path) or '.', exist_ok=True)
    final_sq.save(out_square_path, 'PNG')
    print(f"Saved square avatar: {out_square_path}")
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Create Futuristic Digital Bot Avatar")
    parser.add_argument("input", help="Path to original portrait photo")
    parser.add_argument("--out-full", default="assets/images/digital_bot_full.png", help="Output path for full portrait")
    parser.add_argument("--out-square", default="assets/images/digital_bot_square.png", help="Output path for 512x512 square crop")
    parser.add_argument("--name", default="MR. DEEP_xAI", help="Bot Name")
    parser.add_argument("--status", default="STATUS: ONLINE // 60FPS", help="Bot Status text")
    args = parser.parse_args()

    generate_digital_bot_avatar(args.input, args.out_full, args.out_square, args.name, args.status)
