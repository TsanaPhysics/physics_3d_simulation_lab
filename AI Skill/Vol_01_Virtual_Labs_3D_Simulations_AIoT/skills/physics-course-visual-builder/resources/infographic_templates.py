# ==============================================================================
# Reusable Component Templates for Physics & Biophysics Chapters (1 to 12)
# physics-course-visual-builder standard library (Zero-Tofu, Baseline-Aligned)
# ==============================================================================

def vec(symbol):
    """Generates an elegant vector with an arrow centered above the character on the normal text baseline."""
    return f"""<span style="position: relative; display: inline-block; margin: 0 1px; font-weight: 700; font-style: italic; font-family: 'Times New Roman', Cambria, serif; font-size: 1.05em; line-height: 1;"><span style="position: absolute; top: -0.48em; left: 0; right: 0; text-align: center; font-size: 0.60em; font-weight: 900; font-style: normal; line-height: 1; pointer-events: none;">&rarr;</span>{symbol}</span>"""

def hat(symbol):
    """Generates an elegant unit vector with a hat (^) centered above the character on the normal text baseline."""
    return f"""<span style="position: relative; display: inline-block; margin: 0 1px; font-weight: 700; font-style: italic; font-family: 'Times New Roman', Cambria, serif; font-size: 1.05em; line-height: 1;"><span style="position: absolute; top: -0.42em; left: 0; right: 0; text-align: center; font-size: 0.65em; font-weight: 900; font-style: normal; line-height: 1; pointer-events: none;">^</span>{symbol}</span>"""

def dot():
    """Returns a vertically centered multiplication dot for vector dot products."""
    return """<span style="display: inline-block; margin: 0 3px; font-weight: bold; vertical-align: middle;">&sdot;</span>"""

def cross():
    """Returns a multiplication cross for vector cross products."""
    return """<span style="display: inline-block; margin: 0 3px; font-weight: bold; vertical-align: middle;">&times;</span>"""

def html_fraction(numerator, denominator):
    """Generates a responsive, crystal-clear inline-flex fraction with horizontal dividing line."""
    return f"""<span style="display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; margin: 0 4px; font-family: inherit;">
  <span style="border-bottom: 2px solid currentColor; padding: 2px 6px; font-weight: 700; line-height: 1.2;">{numerator}</span>
  <span style="padding: 2px 6px; font-weight: 700; line-height: 1.2;">{denominator}</span>
</span>"""

def formula_box(title, badge, formula_html, variables_list, category_color="#0284c7", bg_gradient="linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"):
    """Generates a modern, highlighted formula box with variable breakdown."""
    vars_html = "".join([f"&bull; <strong>{k}</strong> = {v}<br>" for k, v in variables_list])
    return f"""
<div style="background: {bg_gradient}; border-left: 5px solid {category_color}; border-radius: 12px; padding: 18px 22px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 8px;">
    <span style="font-weight: 700; color: {category_color}; font-size: 0.95em;">📌 {title}</span>
    <span style="background: #ffffff; color: {category_color}; border: 1px solid {category_color}; font-size: 0.78em; font-weight: 700; padding: 2px 10px; border-radius: 12px;">{badge}</span>
  </div>
  <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 14px; text-align: center; font-size: 1.3em; color: #0f172a; margin: 12px 0; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 16px;">
    {formula_html}
  </div>
  <div style="font-size: 0.92em; color: #334155; line-height: 1.75; margin-top: 8px;">
    {vars_html}
  </div>
</div>
"""

def visual_infographic_card(figure_id, figure_title, badge_text, visual_content_html, summary_text, accent_color="#38bdf8", icon="📊"):
    """Generates a high-contrast dark visual infographic card with embedded graphics and summary."""
    return f"""
<div style="margin: 26px 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid #334155; border-radius: 18px; padding: 24px; box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.45); color: #ffffff;">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 14px;">
    <div style="font-weight: 700; font-size: 1.12em; color: {accent_color}; display: flex; align-items: center; gap: 8px;">
      <span>{icon}</span> <strong>รูปที่ {figure_id}: {figure_title}</strong>
    </div>
    <span style="background: rgba(56, 189, 248, 0.15); color: {accent_color}; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.8em; font-weight: 600; padding: 4px 12px; border-radius: 20px;">
      {badge_text}
    </span>
  </div>

  <div style="margin-bottom: 16px;">
    {visual_content_html}
  </div>

  <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 10px; padding: 12px 18px; font-size: 0.9em; color: #cbd5e1;">
    💡 <strong>สาระสำคัญ:</strong> {summary_text}
  </div>
</div>
"""

def worked_example_card(example_num, title, badge, problem_text, steps_list, answer_text, accent_color="#1e40af", badge_bg="#dbeafe"):
    """Generates an interactive worked example with collapsible step-by-step solution and emerald green conclusion."""
    steps_html = ""
    for i, (step_title, step_body) in enumerate(steps_list, start=1):
        steps_html += f"""
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; background: #3b82f6; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 0.85em; font-weight: 700; margin-right: 8px;">{i}</span>
          <strong>{step_title}</strong>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 8px 0 8px 32px; font-size: 1.15em; text-align: center;">
            {step_body}
          </div>
        </div>
        """
    return f"""
<div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
  <div style="background: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
    <span style="font-weight: 700; color: {accent_color}; font-size: 1.02em;">📝 ตัวอย่างที่ {example_num}: {title}</span>
    <span style="background: {badge_bg}; color: {accent_color}; font-size: 0.78em; font-weight: 600; padding: 3px 10px; border-radius: 20px;">{badge}</span>
  </div>
  <div style="padding: 18px 22px; color: #334155;">
    <p style="margin-top: 0; font-weight: 500;">
      <strong>โจทย์:</strong> {problem_text}
    </p>
    
    <details style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px 18px; cursor: pointer;">
      <summary style="font-weight: 700; color: {accent_color}; outline: none; user-select: none;">👉 คลิกเพื่อดูวิธีทำและขั้นตอนคำนวณอย่างละเอียด</summary>
      <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #cbd5e1; color: #1e293b; line-height: 1.85;">
        {steps_html}
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 12px 18px; border-radius: 8px; font-weight: 600; color: #065f46; margin-top: 14px;">
          🎯 <strong><u>สรุปคำตอบ</u>:</strong> {answer_text}
        </div>
      </div>
    </details>
  </div>
</div>
"""
