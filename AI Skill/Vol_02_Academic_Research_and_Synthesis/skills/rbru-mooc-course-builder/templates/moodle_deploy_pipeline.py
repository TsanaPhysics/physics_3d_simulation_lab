#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RBRU MOOC Automated Deployment Pipeline
Template for batch-updating all Moodle mod_page activities and Section 3D Animated Covers via HTTP Session
"""

import os
import re
import json
import requests

# CONFIGURATION
MOODLE_BASE_URL = "https://elearning.rbru.ac.th"
COURSE_ID = "262"  # Target course ID
SESSION_COOKIE = "lsd8fv1nrb9spqgtchgv9a1co1"  # Update when session expires
HTML_DIR = "./moodle_pages"

session = requests.Session()
session.cookies.set("MoodleSessionrbrulms", SESSION_COOKIE, domain="elearning.rbru.ac.th")
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def clean_chapter_title(ch_id, raw_title):
    """Prevents duplicate chapter numbering: e.g. บทที่ 2 2 ทฤษฎี... -> บทที่ 2 ทฤษฎี..."""
    clean_title = re.sub(r'^(บทที่\s*\d+\s*|\d+\s*)', '', raw_title).strip()
    return f"บทที่ {ch_id} {clean_title}"

def update_section_cover_and_cards(sec_db_id, section_name, section_html):
    edit_url = f"{MOODLE_BASE_URL}/course/editsection.php?id={sec_db_id}"
    r = session.get(edit_url, headers=headers)
    if r.status_code != 200:
        return False
    sesskey_m = re.search(r'name="sesskey"\s+value="([^"]+)"', r.text)
    if not sesskey_m:
        return False
    
    def get_val(name):
        m = re.search(rf'<input[^>]*name=[\"\']{re.escape(name)}[\"\'][^>]*value=[\"\']([^\"\']*)[\"\']', r.text)
        return m.group(1) if m else ''

    payload = {
        "context": get_val("context") or "19080",
        "id": sec_db_id,
        "course": COURSE_ID,
        "sesskey": sesskey_m.group(1),
        "_qf__editsection_form": "1",
        "mform_isexpanded_id_generalhdr": "1",
        "mform_isexpanded_id_availabilityconditions": "0",
        "name": section_name,
        "summary_editor[text]": section_html,
        "summary_editor[format]": "1",
        "summary_editor[itemid]": get_val("summary_editor[itemid]"),
        "submitbutton": "บันทึกการเปลี่ยนแปลง"
    }
    resp = session.post(edit_url, data=payload, headers=headers)
    return resp.status_code in (200, 302, 303)

def update_page_content(cmid, html_content):
    edit_url = f"{MOODLE_BASE_URL}/course/modedit.php?update={cmid}&return=0&sr=0"
    resp = session.get(edit_url, headers=headers)
    if resp.status_code != 200:
        print(f"❌ Failed to load edit form for cmid {cmid}")
        return False

    form_inputs = re.findall(r'<input[^>]+name="([^"]+)"[^>]*value="([^"]*)"', resp.text)
    data = {k: v for k, v in form_inputs}

    sesskey_match = re.search(r'"sesskey":"([^"]+)"', resp.text)
    if sesskey_match:
        data['sesskey'] = sesskey_match.group(1)

    data['page[text]'] = html_content
    data['page[format]'] = '1'
    data['page[itemid]'] = data.get('page[itemid]', '0')
    data['submitbutton2'] = 'Save and return to course'

    post_resp = session.post(f"{MOODLE_BASE_URL}/course/modedit.php", data=data, headers=headers, allow_redirects=True)
    return post_resp.status_code == 200

if __name__ == "__main__":
    print("🚀 RBRU MOOC Deployment Pipeline ready.")
