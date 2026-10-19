#!/usr/bin/env python3
"""
Custom Flutter App Icon Generator & Multi-Platform Deployer
Part of the 'flutter-app-architect' Master Skill
Authored for Dr. Chewa Thassana & Precision Mobile Application Engineering

Automates:
1. Resizing master 1024x1024 icon to all Android mipmap densities (standard + round)
2. Generating all iOS AppIcon set resolutions + Contents.json
3. Generating Web favicons and PWA icons
4. Updating pubspec.yaml with assets/icons/ and flutter_launcher_icons configuration
5. Patching AndroidManifest.xml with app name, icon, and roundIcon attributes
"""

import sys
import os
import argparse
import json
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_round_icon(im):
    """Generates an antialiased rounded/circle icon with transparent background."""
    im = im.convert('RGBA')
    w, h = im.size
    mask = Image.new('L', (w * 4, h * 4), 0)
    draw = ImageDraw.Draw(mask)
    # Circle or Squircle mask
    radius = int(w * 4 * 0.22) # smooth squircle
    draw.rounded_rectangle([(0, 0), (w * 4 - 1, h * 4 - 1)], radius=radius, fill=255)
    mask = mask.resize((w, h), Image.Resampling.LANCZOS)
    
    result = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    result.paste(im, (0, 0), mask=mask)
    return result

def generate_icons(project_path, source_icon_path, app_name=None):
    if not os.path.exists(source_icon_path):
        print(f"Error: Source icon not found at {source_icon_path}")
        sys.exit(1)
        
    if not os.path.exists(project_path):
        print(f"Error: Flutter project path not found at {project_path}")
        sys.exit(1)

    print(f"Loading master icon from: {source_icon_path}")
    master_img = Image.open(source_icon_path)
    if master_img.size != (1024, 1024):
        print(f"Resizing master icon from {master_img.size} to (1024, 1024)...")
        master_img = master_img.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    master_img_rgb = master_img.convert('RGB')
    master_img_round = make_round_icon(master_img)
    
    # 1. Project assets directory
    assets_dir = os.path.join(project_path, "assets", "icons")
    os.makedirs(assets_dir, exist_ok=True)
    master_img_rgb.save(os.path.join(assets_dir, "app_icon.png"), "PNG")
    master_img_round.save(os.path.join(assets_dir, "app_icon_round.png"), "PNG")
    master_img.convert('RGBA').save(os.path.join(assets_dir, "app_icon_transparent.png"), "PNG")
    print(f"Saved master icons in {assets_dir}")

    # Favicon and web assets
    for sz, fname in [(16, "favicon-16x16.png"), (32, "favicon-32x32.png"), (48, "favicon.png"), (180, "apple-touch-icon.png")]:
        resized = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(os.path.join(assets_dir, fname), "PNG")
    master_img.save(os.path.join(assets_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    # 2. Android Mipmaps
    android_res = os.path.join(project_path, "android", "app", "src", "main", "res")
    android_densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, px in android_densities.items():
        folder_path = os.path.join(android_res, folder)
        os.makedirs(folder_path, exist_ok=True)
        # Standard icon
        im_res = master_img_rgb.resize((px, px), Image.Resampling.LANCZOS)
        im_res.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        # Round icon
        round_res = master_img_round.resize((px, px), Image.Resampling.LANCZOS)
        round_res.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
    print(f"Generated Android launcher mipmaps in {android_res}")

    # 3. iOS AppIcon set
    ios_icons_dir = os.path.join(project_path, "ios", "Runner", "Assets.xcassets", "AppIcon.appiconset")
    os.makedirs(ios_icons_dir, exist_ok=True)
    ios_sizes = [
        (20, "Icon-App-20x20@1x.png", "20x20", "1x", "iphone"),
        (40, "Icon-App-20x20@2x.png", "20x20", "2x", "iphone"),
        (60, "Icon-App-20x20@3x.png", "20x20", "3x", "iphone"),
        (29, "Icon-App-29x29@1x.png", "29x29", "1x", "iphone"),
        (58, "Icon-App-29x29@2x.png", "29x29", "2x", "iphone"),
        (87, "Icon-App-29x29@3x.png", "29x29", "3x", "iphone"),
        (40, "Icon-App-40x40@1x.png", "40x40", "1x", "iphone"),
        (80, "Icon-App-40x40@2x.png", "40x40", "2x", "iphone"),
        (120, "Icon-App-40x40@3x.png", "40x40", "3x", "iphone"),
        (120, "Icon-App-60x60@2x.png", "60x60", "2x", "iphone"),
        (180, "Icon-App-60x60@3x.png", "60x60", "3x", "iphone"),
        (76, "Icon-App-76x76@1x.png", "76x76", "1x", "ipad"),
        (152, "Icon-App-76x76@2x.png", "76x76", "2x", "ipad"),
        (167, "Icon-App-83.5x83.5@2x.png", "83.5x83.5", "2x", "ipad"),
        (1024, "Icon-App-1024x1024@1x.png", "1024x1024", "1x", "ios-marketing"),
    ]
    contents_images = []
    for px, fname, size_str, scale_str, idiom_str in ios_sizes:
        res = master_img_rgb.resize((px, px), Image.Resampling.LANCZOS)
        res.save(os.path.join(ios_icons_dir, fname), "PNG")
        contents_images.append({
            "size": size_str,
            "idiom": idiom_str,
            "filename": fname,
            "scale": scale_str
        })
    contents_json = {
        "images": contents_images,
        "info": {
            "version": 1,
            "author": "flutter-app-architect"
        }
    }
    with open(os.path.join(ios_icons_dir, "Contents.json"), "w", encoding="utf-8") as f:
        json.dump(contents_json, f, indent=2)
    print(f"Generated iOS AppIcon set in {ios_icons_dir}")

    # 4. Web Icons
    web_dir = os.path.join(project_path, "web")
    if os.path.exists(web_dir):
        web_icons_dir = os.path.join(web_dir, "icons")
        os.makedirs(web_icons_dir, exist_ok=True)
        for sz in [192, 512]:
            res = master_img_rgb.resize((sz, sz), Image.Resampling.LANCZOS)
            res.save(os.path.join(web_icons_dir, f"Icon-{sz}.png"), "PNG")
            res.save(os.path.join(web_icons_dir, f"Icon-maskable-{sz}.png"), "PNG")
        master_img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(web_dir, "favicon.png"), "PNG")
        print(f"Generated Web icons in {web_icons_dir}")

    # 5. Patch pubspec.yaml
    pubspec_path = os.path.join(project_path, "pubspec.yaml")
    if os.path.exists(pubspec_path):
        with open(pubspec_path, "r", encoding="utf-8") as f:
            pubspec_content = f.read()

        modified = False
        if "flutter_launcher_icons:" not in pubspec_content:
            icon_config = """
flutter_launcher_icons:
  android: "launcher_icon"
  ios: true
  image_path: "assets/icons/app_icon.png"
  min_sdk_android: 21
  web:
    generate: true
    image_path: "assets/icons/app_icon.png"
"""
            if "dev_dependencies:" in pubspec_content:
                if "flutter_launcher_icons:" not in pubspec_content:
                    pubspec_content = pubspec_content.replace(
                        "dev_dependencies:",
                        "dev_dependencies:\n  flutter_launcher_icons: ^0.13.1"
                    )
            pubspec_content += icon_config
            modified = True

        if "assets/icons/" not in pubspec_content:
            if "flutter:" in pubspec_content:
                if "assets:" in pubspec_content:
                    pubspec_content = pubspec_content.replace("assets:", "assets:\n    - assets/icons/")
                else:
                    pubspec_content = pubspec_content.replace("flutter:", "flutter:\n  assets:\n    - assets/icons/")
                modified = True

        if modified:
            with open(pubspec_path, "w", encoding="utf-8") as f:
                f.write(pubspec_content)
            print("Successfully updated pubspec.yaml with assets/icons/ and flutter_launcher_icons configuration!")

    # 6. Patch AndroidManifest.xml
    manifest_path = os.path.join(project_path, "android", "app", "src", "main", "AndroidManifest.xml")
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_content = f.read()
        
        manifest_modified = False
        if 'android:roundIcon=' not in manifest_content and '<application' in manifest_content:
            manifest_content = manifest_content.replace(
                '<application',
                '<application\n        android:roundIcon="@mipmap/ic_launcher_round"'
            )
            manifest_modified = True
        
        if app_name and f'android:label="{app_name}"' not in manifest_content:
            import re
            manifest_content = re.sub(r'android:label="[^"]*"', f'android:label="{app_name}"', manifest_content)
            manifest_modified = True

        if manifest_modified:
            with open(manifest_path, "w", encoding="utf-8") as f:
                f.write(manifest_content)
            print("Successfully updated AndroidManifest.xml with app name and round icon!")

    print("\nCustom Flutter App Icon pipeline completed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Flutter Custom App Icon Multi-Platform Generator")
    parser.add_argument("--project-path", required=True, help="Path to Flutter project root")
    parser.add_argument("--icon-source", required=True, help="Path to 1024x1024 master icon PNG/JPG")
    parser.add_argument("--app-name", required=False, help="Display name for the application")
    args = parser.parse_args()

    generate_icons(args.project_path, args.icon_source, args.app_name)
