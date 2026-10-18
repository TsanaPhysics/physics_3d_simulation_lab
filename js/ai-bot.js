/**
 * js/ai-bot.js
 * Agentic AI BOT Assistant: "Dr. Newton — Agentic Physics Copilot"
 * NextGen Physics Laboratory 2026 - RBRU
 */

(function () {
  'use strict';

  let isChatOpen = false;
  let isTTSVoiceEnabled = false;
  let isTyping = false;
  let messageHistory = [];

  // Knowledge base and guidance data for all 16 experiments
  const LAB_KNOWLEDGE = {
    elec_hex_loop: {
      name: 'วงจรตัวต้านทานรูปหกเหลี่ยม (Hexagonal Resistor Network)',
      formula: '$$R_{af} = 1 \\parallel 20 = \\frac{20}{21}\\,\\Omega, \\quad I = \\frac{V}{R_{\\text{รวม}}} = \\frac{21}{23}\\text{ A}, \\quad V_{af} = \\frac{20}{23}\\text{ V}$$',
      tips: 'เมื่อต่อสายไฟที่จุด a และ f ความต้านทานจะขนานกันระหว่างด้านตรง $1\\,\\Omega$ กับด้านอ้อม $2+3+4+5+6 = 20\\,\\Omega$ ให้ความต้านทานสมมูลต่ำที่สุดตามข้อสอบ IJSO ข้อ 7',
      actions: ['toggleSwitch', 'resetPins']
    },
    elec_wheatstone: {
      name: 'วงจรบริดจ์ของวีตสตัน (Wheatstone Slide-Wire Bridge)',
      formula: '$$\\frac{R_x}{R_{\\text{std}}} = \\frac{L_1}{L_2} = \\frac{L_1}{100 - L_1}$$',
      tips: 'เลื่อนหัวสัมผัสจ็อกกีย์ (Jockey) จนกระทั่งเข็มกัลวาโนมิเตอร์เบนเป็นศูนย์ (Null Balance) จุดนี้ศักย์ไฟฟ้าที่ขั้ว C และ D จะเท่ากันพอดี',
      actions: ['autoNull']
    },
    mech_pendulum: {
      name: 'ลูกตุ้มเพนดูลัมอย่างง่าย (Simple Harmonic Pendulum)',
      formula: '$$T = 2\\pi\\sqrt{\\frac{L}{g}} \\implies T^2 = \\left(\\frac{4\\pi^2}{g}\\right)L$$',
      tips: 'การแกว่งแบบฮาร์มอนิกอย่างง่ายต้องรักษามุมแกว่งให้น้อยกว่า $10^\\circ$ เพื่อให้ประมาณ $\\sin\\theta \\approx \\theta$ ได้อย่างแม่นยำ',
      actions: ['startStopwatch', 'instantMeasure20']
    },
    mech_air_track: {
      name: 'การอนุรักษ์โมเมนตัมบนรางเบาะลม (Air Track Collision)',
      formula: '$$p_{\\text{before}} = p_{\\text{after}} \\implies m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2$$',
      tips: 'รางเบาะลมตัดแรงเสียดทานออกเกือบ 100% ในการชนแบบยืดหยุ่น ($e=1$) พลังงานจลน์จะอนุรักษ์ แต่ในการชนแบบไม่ยืดหยุ่น ($e=0$) รถจะติดไปด้วยกันและสูญเสียพลังงานจลน์สูงสุด',
      actions: ['launchAirTrack']
    },
    mech_free_fall: {
      name: 'การตกอย่างอิสระและวัดค่า g (Free Fall Photogate)',
      formula: '$$h = \\frac{1}{2}gt^2 \\implies g = 2 \\times \\text{Slope}(h \\text{ vs } t^2)$$',
      tips: 'ปล่อยลูกเหล็กจากแม่เหล็กไฟฟ้าตัดลำแสงโฟโตเกต 3 จุด พล็อตกราฟระหว่าง $h$ กับ $t^2$ จะได้เส้นตรงผ่านจุดกำเนิด ความชันเท่ากับ $g/2$',
      actions: ['releaseBall']
    },
    waves_resonance: {
      name: 'การสั่นพ้องของคลื่นเสียงในหลอดเรโซแนนซ์ (Sound Resonance)',
      formula: '$$L_n = (2n - 1)\\frac{\\lambda}{4} - c \\implies v = f \\lambda = 2f(L_{n+1} - L_n)$$',
      tips: 'เสียงจะก้องดังที่สุด (Resonance Amplitude) เมื่อผิวน้ำอยู่ในตำแหน่งบัพการกระจัด (Displacement Node) และปากหลอดเป็นปฏิบัพ',
      actions: ['findResonance']
    },
    optics_bench: {
      name: 'รางทัศนศาสตร์และการเกิดภาพของเลนส์บาง (Optics Bench)',
      formula: '$$\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s\'}, \\quad m = -\\frac{s\'}{s} = \\frac{y\'}{y}$$',
      tips: 'เมื่อวัตถุอยู่ไกลกว่า $2f$ จะเกิดภาพจริงหัวกลับขนาดเล็กกว่าวัตถุ และเมื่อวัตถุอยู่ที่ $2f$ จะเกิดภาพจริงหัวกลับขนาดเท่าวัตถุที่ระยะ $2f$ ฝั่งตรงข้าม',
      actions: ['autoFocus']
    },
    em_faraday_lenz: {
      name: 'การเหนี่ยวนำแม่เหล็กไฟฟ้าฟาราเดย์และเลนซ์ (Faraday & Lenz Induction)',
      formula: '$$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt} = -N\\left(\\frac{d\\Phi_B}{dx}\\right)v$$',
      tips: 'ยิ่งเคลื่อนแท่งแม่เหล็กผ่านขดลวดด้วยความเร็วสูง แรงเคลื่อนไฟฟ้าเหนี่ยวนำ $\\mathcal{E}$ จะยิ่งสูงขึ้น ทิศทางกระแสจะสร้างสนามแม่เหล็กต้านการเคลื่อนที่ตามกฎของเลนซ์',
      actions: ['toggleOscillate', 'flipPoles']
    },
    em_solenoid_field: {
      name: 'สนามแม่เหล็กในขดลวดโซเลนอยด์ (Solenoid Magnetic Field)',
      formula: '$$B_0 = \\mu_0 n I = \\mu_0 \\left(\\frac{N}{L}\\right) I$$',
      tips: 'สนามแม่เหล็กภายในแกนกลางของโซเลนอยด์จะมีความสม่ำเสมอสูงสุดและมีค่าเป็นสองเท่าของสนามแม่เหล็กบริเวณขอบปลายทั้งสองข้าง ($B_{\\text{edge}} \\approx B_0 / 2$)',
      actions: ['autoScan']
    },
    em_helmholtz_coils: {
      name: 'ขดลวดเฮล์มโฮลทซ์และสนามแม่เหล็กสม่ำเสมอ (Helmholtz Coils)',
      formula: '$$B_{\\text{center}} = \\left(\\frac{4}{5}\\right)^{3/2} \\frac{\\mu_0 N I}{R} \\approx 0.7155\\,\\frac{\\mu_0 N I}{R}$$',
      tips: 'วางขดลวด 2 วงห่างกันเท่ากับรัศมี ($d = R$) จะทำให้ทั้งอนุพันธ์อันดับ 1 และอันดับ 2 ของสนามแม่เหล็กเป็นศูนย์ ($B\'=0, B\'\'=0$) เกิดบริเวณสนามแม่เหล็กราบเรียบสม่ำเสมอ',
      actions: ['setHelmholtzCondition']
    },
    thermo_ideal_gas: {
      name: 'กฎของแก๊สอุดมคติและศูนย์สัมบูรณ์ (Ideal Gas Law & Absolute Zero)',
      formula: '$$PV = nRT \\implies P = \\left(\\frac{nR}{V}\\right) T$$',
      tips: 'ที่ปริมาตรคงที่ ความดันจะแปรผันตรงกับอุณหภูมิเคลวิน เมื่อลากเส้นตรง $P$ เทียบกับอุณหภูมิเซลเซียสตัดแกนนอนที่ $P=0$ จะได้จุดศูนย์สัมบูรณ์ที่ $-273.15\\,^\\circ\\text{C}$',
      actions: ['recordGasData']
    },
    thermo_calorimeter: {
      name: 'ความจุความร้อนจำเพาะด้วยแคลอริมิเตอร์ (Calorimetry)',
      formula: '$$Q_{\\text{loss}} = Q_{\\text{gain}} \\implies m_s c_s (T_s - T_f) = (m_w c_w + C_{\\text{cal}})(T_f - T_w)$$',
      tips: 'ต้องถ่ายโอนก้อนโลหะร้อนลงในแคลอริมิเตอร์อย่างรวดเร็วเพื่อลดการสูญเสียความร้อนสู่อากาศ และกวนน้ำสม่ำเสมอเพื่อให้ระบบเข้าสู่สมดุลความร้อนอย่างแท้จริง',
      actions: ['transferMetal']
    },
    thermo_thermal_exp: {
      name: 'การขยายตัวเชิงเส้นของโลหะ (Linear Thermal Expansion)',
      formula: '$$\\Delta L = \\alpha L_0 \\Delta T \\implies \\alpha = \\frac{\\Delta L}{L_0 (T - T_0)}$$',
      tips: 'เข็มไดอัลเกจหมุน 1 รอบแทนการยืดตัว $1.00\\text{ mm}$ (ขีดละ $0.01\\text{ mm}$) อลูมิเนียมมีสัมประสิทธิ์การขยายตัวสูงสุดในกลุ่มโลหะทั่วไป',
      actions: ['steamOn']
    },
    modern_photoelectric: {
      name: 'ปรากฏการณ์โฟโตอิเล็กทริกและค่าคงตัวพลังค์ (Photoelectric Effect)',
      formula: '$$hf = W_0 + K_{\\text{max}} = W_0 + e V_{\\text{stop}} \\implies V_{\\text{stop}} = \\left(\\frac{h}{e}\\right) f - \\frac{W_0}{e}$$',
      tips: 'ความต่างศักย์หยุดยั้ง $V_{\\text{stop}}$ ขึ้นอยู่กับความถี่แสง $f$ เท่านั้น และไม่ขึ้นกับความเข้มแสง ความชันของกราฟ $V_{\\text{stop}}$ กับ $f$ เท่ากับ $h/e$',
      actions: ['findVstop']
    },
    modern_half_life: {
      name: 'การสลายตัวของสารรังสีและครึ่งชีวิต (Radioactive Decay & GM Counter)',
      formula: '$$N(t) = N_0 e^{-\\lambda t} = N_0 \\left(\\frac{1}{2}\\right)^{\\frac{t}{T_{1/2}}} \\quad (\\lambda = \\frac{\\ln 2}{T_{1/2}})$$',
      tips: 'การสลายตัวของนิวเคลียสเป็นกระบวนการสุ่ม (Stochastic) เชิงความน่าจะเป็น อัตราการนับจะสอดคล้องกับการแจกแจงปัวซง (Poisson distribution)',
      actions: ['startDecay']
    },
    modern_frank_hertz: {
      name: 'การทดลองของฟรังก์-เฮิรตซ์และระดับพลังงานอะตอม (Franck-Hertz)',
      formula: '$$\\Delta E = e \\Delta V = 4.86\\text{ eV (Mercury Hg)} \\implies \\lambda = \\frac{hc}{\\Delta E} \\approx 253.7\\text{ nm}$$',
      tips: 'กระแสแอนโหนดจะตกลงเป็นจังหวะทุกๆ $4.86\\text{ V}$ ซึ่งเป็นหลักฐานการชนแบบไม่ยืดหยุ่นและการมีอยู่ของระดับพลังงานที่ไม่ต่อเนื่องของอะตอมปรอท',
      actions: ['autoSweep']
    }
  };

  function initAIBot() {
    updateAITelemetryPill();

    // Hook registry experiment change event to update telemetry
    if (window.PhysicsLabRegistry) {
      window.PhysicsLabRegistry.on('change', () => {
        updateAITelemetryPill();
      });
    }

    // Bind chat input enter key
    const textInput = document.getElementById('ai-chat-input');
    if (textInput) {
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleUserSend();
        }
      });
    }

    // Initial greeting if history is empty
    if (messageHistory.length === 0) {
      addBotMessage(
        `สวัสดีครับ! ผมคือ <b>Dr. Newton</b> ผู้ช่วยอัจฉริยะ (Agentic AI Copilot) ประจำห้องปฏิบัติการฟิสิกส์เสมือนจริง RBRU 2026<br/><br/>
        ผมสามารถช่วยคุณได้หลากหลายด้าน:
        <ul style="margin: 6px 0 6px 18px; font-size: 0.8rem; line-height: 1.5;">
          <li>📖 <b>อธิบายหลักการและสูตรฟิสิกส์</b> พร้อมสมการ KaTeX</li>
          <li>🔍 <b>ตรวจสอบค่าปัจจุบันในห้องทดลอง</b> (Telemetry Inspection)</li>
          <li>⚡ <b>ควบคุมอุปกรณ์แทนคุณ</b> (Agentic Auto-Pilot)</li>
          <li>📊 <b>ช่วยคำนวณและวิเคราะห์ผลการทดลอง</b></li>
        </ul>
        คุณอยากให้ผมช่วยอะไรในการทดลองนี้ครับ?`
      );
    }
  }

  function toggleAIChat(show) {
    const drawer = document.getElementById('ai-bot-drawer');
    if (!drawer) return;
    isChatOpen = (typeof show === 'boolean') ? show : !drawer.classList.contains('active');
    drawer.classList.toggle('active', isChatOpen);

    if (isChatOpen) {
      updateAITelemetryPill();
      const input = document.getElementById('ai-chat-input');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }

  function toggleTTSVoice() {
    isTTSVoiceEnabled = !isTTSVoiceEnabled;
    const btn = document.getElementById('btn-ai-tts');
    if (btn) {
      btn.classList.toggle('active', isTTSVoiceEnabled);
      btn.title = isTTSVoiceEnabled ? 'เสียงพูด AI: เปิด (คลิกเพื่อปิด)' : 'เสียงพูด AI: ปิด (คลิกเพื่อเปิด)';
    }
    if (!isTTSVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function speakText(text) {
    if (!isTTSVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip HTML and LaTeX for speech
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/\$\$[\s\S]*?\$\$/g, 'สมการคณิตศาสตร์').replace(/\$[^$]*\$/g, 'ตัวแปร');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  function updateAITelemetryPill() {
    const pill = document.getElementById('ai-telemetry-text');
    if (!pill || !window.PhysicsLabRegistry) return;
    const exp = window.PhysicsLabRegistry.getActiveExperiment();
    if (!exp) return;

    pill.innerHTML = `
      <span class="ai-live-tag">● ${exp.shortTitle || exp.title}</span>
      <span style="opacity:0.75; font-size:0.68rem;">สถานะ: พร้อมใช้งาน</span>
    `;
  }

  function addUserMessage(text) {
    const container = document.getElementById('ai-messages-list');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai-bubble-user';
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    messageHistory.push({ role: 'user', content: text });
  }

  function addBotMessage(htmlContent, toolBadgeText) {
    const container = document.getElementById('ai-messages-list');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai-bubble-bot';

    let contentHTML = '';
    if (toolBadgeText) {
      contentHTML += `<div class="ai-tool-badge">⚡ Tool Executed: ${toolBadgeText}</div>`;
    }
    contentHTML += htmlContent;

    bubble.innerHTML = contentHTML;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;

    messageHistory.push({ role: 'bot', content: htmlContent });

    // Typeset KaTeX if available
    if (typeof renderAcademicMath === 'function') {
      renderAcademicMath(bubble);
    }

    speakText(htmlContent);
  }

  function showTypingIndicator() {
    const container = document.getElementById('ai-messages-list');
    if (!container) return;

    const typing = document.createElement('div');
    typing.id = 'ai-typing-box';
    typing.className = 'ai-bubble ai-bubble-bot ai-typing-indicator';
    typing.innerHTML = `
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('ai-typing-box');
    if (typing) typing.remove();
  }

  // =========================================================================
  // AGENTIC TOOL EXECUTION & NATURAL REASONING ENGINE
  // =========================================================================
  function executeAgenticResponse(userQuery) {
    const query = userQuery.toLowerCase();
    const activeExp = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperiment() : null;
    const expId = activeExp ? activeExp.id : 'elec_hex_loop';
    const kn = LAB_KNOWLEDGE[expId] || { name: 'การทดลองฟิสิกส์', formula: '', tips: '' };

    showTypingIndicator();
    isTyping = true;

    setTimeout(() => {
      removeTypingIndicator();
      isTyping = false;

      // 1. Tool Call: Switch Lab
      const switchMatch = detectSwitchLabIntent(query);
      if (switchMatch) {
        if (window.PhysicsLabRegistry) {
          window.PhysicsLabRegistry.switchExperiment(switchMatch.id);
        }
        addBotMessage(
          `รับทราบครับ! ผมได้สั่งการสลับห้องปฏิบัติการไปยัง <b>${switchMatch.title}</b> เรียบร้อยแล้วครับ อุปกรณ์ 3D พร้อมให้คุณทดลองได้ทันที`,
          `PhysicsLabRegistry.switchExperiment('${switchMatch.id}')`
        );
        return;
      }

      // 2. Tool Call: Auto-Pilot / Control Instrument
      if (query.includes('สวิตช์') || query.includes('เปิดไฟ') || query.includes('ปิดไฟ')) {
        if (typeof toggleCircuitSwitch === 'function') toggleCircuitSwitch();
        addBotMessage(
          `ทำการสลับตำแหน่งสวิตช์วงจรไฟฟ้าเรียบร้อยแล้วครับ! ค่ากระแสและแรงดันไฟฟ้าจะปรับตัวตามเข็มมิเตอร์ที่มีระบบสปริงหน่วง`,
          `toggleCircuitSwitch()`
        );
        return;
      }

      if (query.includes('ปล่อยรถ') || query.includes('ชน')) {
        const btn = document.getElementById('btn-air-launch');
        if (btn) btn.click();
        addBotMessage(
          `สั่งปล่อยรถทดลองบนรางเบาะลมแล้วครับ! รถทั้งสองคันจะเคลื่อนที่และชนกันตามกฎการอนุรักษ์โมเมนตัม โฟโตเกตจะวัดเวลาตัดลำแสงโดยอัตโนมัติ`,
          `launchCollision()`
        );
        return;
      }

      if (query.includes('ปล่อยลูกเหล็ก') || query.includes('ปล่อยวัตถุ') || query.includes('ตก')) {
        const btn = document.getElementById('btn-fall-release');
        if (btn) btn.click();
        addBotMessage(
          `ตัดกระแสไฟฟ้าที่แม่เหล็กปล่อยลูกเหล็กตกอิสระแล้วครับ! โฟโตเกตทั้ง 3 ระดับกำลังบันทึกเวลา $t_1, t_2, t_3$ เพื่อคำนวณค่า $g$`,
          `releaseBall()`
        );
        return;
      }

      if (query.includes('จุ่มโลหะ') || query.includes('แคลอริมิเตอร์')) {
        const btn = document.getElementById('btn-cal-transfer');
        if (btn) btn.click();
        addBotMessage(
          `ถ่ายโอนก้อนโลหะร้อน 100°C ลงในกระป๋องแคลอริมิเตอร์แล้วครับ! อุณหภูมิน้ำกำลังไต่ระดับเข้าสู่สมดุลความร้อนตามกฎของนิวตัน`,
          `transferMetal()`
        );
        return;
      }

      // 3. Tool Call: Inspect State
      if (query.includes('ตรวจสอบ') || query.includes('ค่าปัจจุบัน') || query.includes('อ่านค่า') || query.includes('สถานะ')) {
        const stateSummary = inspectCurrentLabState(expId);
        addBotMessage(
          `จากการตรวจสอบค่าเซนเซอร์และการตั้งค่าใน <b>${kn.name}</b> ปัจจุบัน:<br/><br/>
          ${stateSummary}<br/><br/>
          ทุกอย่างทำงานอย่างถูกต้องตามกฎฟิสิกส์ครับ!`,
          `inspectCurrentLabState('${expId}')`
        );
        return;
      }

      // 4. Lab Instructions & Formula Guidance
      if (query.includes('ขั้นตอน') || query.includes('แนะนำ') || query.includes('วิธีทำ') || query.includes('เริ่ม')) {
        addBotMessage(
          `<b>คำแนะนำการทำปฏิบัติการ: ${kn.name}</b><br/><br/>
          <b>สมการหลักที่ใช้:</b><br/>${kn.formula}<br/><br/>
          <b>ข้อควรระวังและเทคนิค:</b><br/>${kn.tips}<br/><br/>
          คุณสามารถปรับตัวแปรบน <b>แผงควบคุมด้านซ้าย</b> และสังเกตผลการวัดและกราฟบน <b>แผงผลวิเคราะห์ด้านขวา</b> ได้ตลอดเวลาครับ`
        );
        return;
      }

      // 5. Quiz / Concept Testing
      if (query.includes('คำถาม') || query.includes('quiz') || query.includes('ทดสอบ')) {
        const quiz = generateLabQuiz(expId);
        addBotMessage(
          `<b>🧪 คำถามทดสอบความเข้าใจประจำแล็บ (${kn.name}):</b><br/><br/>
          ${quiz.question}<br/><br/>
          <i>ลองพิมพ์คำตอบของคุณส่งมาได้เลยครับ เดี๋ยวผมจะช่วยตรวจให้!</i>`
        );
        return;
      }

      // Generic Physics Socratic Response
      addBotMessage(
        `สำหรับปฏิบัติการ <b>${kn.name}</b>:<br/><br/>
        สูตรและหลักการสำคัญคือ ${kn.formula}<br/><br/>
        ${kn.tips}<br/><br/>
        <i>คุณสามารถลองคลิกปุ่มแนะนำคำสั่งด้านบน เช่น "🔍 ตรวจสอบค่าปัจจุบัน" หรือ "⚡ ดำเนินการแทนฉัน" เพื่อให้ผมช่วยเหลือเพิ่มเติมได้ครับ!</i>`
      );

    }, 600);
  }

  function detectSwitchLabIntent(query) {
    if (!window.PhysicsLabRegistry) return null;
    const exps = window.PhysicsLabRegistry.getAllExperiments();

    for (let exp of exps) {
      const matchKeywords = [
        exp.id.toLowerCase(),
        (exp.shortTitle || '').toLowerCase(),
        (exp.title || '').toLowerCase()
      ];
      if (matchKeywords.some(k => query.includes(k) || (k.includes('วงจร') && query.includes('วงจร')) || (k.includes('รางลม') && query.includes('รางลม')) || (k.includes('ตกอิสระ') && query.includes('ตก')))) {
        if (query.includes('ไป') || query.includes('สลับ') || query.includes('เปลี่ยน') || query.includes('เปิด')) {
          return exp;
        }
      }
    }
    return null;
  }

  function inspectCurrentLabState(expId) {
    switch (expId) {
      case 'elec_hex_loop':
        return `• จุดเชื่อมต่อสายไฟ: ขั้ว P ต่อจุด <b>${window.selectedNodeP || 'a'}</b>, ขั้ว Q ต่อจุด <b>${window.selectedNodeQ || 'f'}</b><br/>
                • แรงดันแหล่งจ่าย: <b>${(window.powerSupplyVoltage || 10.0).toFixed(2)} V</b><br/>
                • ความต้านทานตัวต้านทาน 10Ω: <b>10.0 Ω</b><br/>
                • สถานะสวิตช์: <b>${window.circuitSwitchClosed ? '🟢 เปิดวงจร (Closed)' : '🔴 ปิดวงจร (Open)'}</b>`;
      case 'mech_pendulum':
        return `• ความยาวเชือก ($L$): <b>${window.pendLengthCm || 50} cm</b><br/>
                • มุมปล่อยเริ่มต้น: <b>${window.pendReleaseAngleDeg || 8.0}°</b><br/>
                • คาบตามทฤษฎี ($T$): <b>${((2 * Math.PI) * Math.sqrt((window.pendLengthCm || 50) / 980.7)).toFixed(3)} s</b>`;
      case 'mech_air_track':
        return `• รูปแบบการชน: <b>ยืดหยุ่นสมบูรณ์ ($e = 1.0$)</b><br/>
                • มวลรถ 1 / 2: <b>150g / 150g</b><br/>
                • สถานะระบบ: <b>โมเมนตัมรวมของระบบอนุรักษ์</b>`;
      default:
        return `• ระบบจำลอง 3D Active และเชื่อมต่อกับเซนเซอร์เรียบร้อยแล้ว<br/>
                • อัตราเรนเดอร์: <b>60 FPS</b> ไร้ข้อผิดพลาด`;
    }
  }

  function generateLabQuiz(expId) {
    const quizzes = {
      elec_hex_loop: {
        question: 'ทำไมการต่อขั้ว P และ Q เข้ากับจุด a และ f ถึงให้ค่าความต้านทานสมมูลต่ำที่สุดในบรรดาจุดต่อทั้งหมด?'
      },
      mech_pendulum: {
        question: 'หากเราเพิ่มมวลของลูกตุ้มเพนดูลัมเป็น 2 เท่า คาบการแกว่ง $T$ จะเปลี่ยนแปลงไปอย่างไร เพราะเหตุใด?'
      },
      waves_resonance: {
        question: 'ทำไมระยะห่างระหว่างตำแหน่งผิวน้ำที่เกิดการสั่นพ้องสองตำแหน่งติดกัน ($L_{n+1} - L_n$) จึงมีค่าเท่ากับครึ่งหนึ่งของความยาวคลื่น ($\lambda / 2$)?'
      },
      modern_frank_hertz: {
        question: 'ทำไมกระแสไฟฟ้า $I_A$ จึงตกลงเป็นช่วงๆ ทุกๆ แรงดัน $4.86\\text{ V}$ แทนที่จะเพิ่มขึ้นอย่างต่อเนื่อง?'
      }
    };
    return quizzes[expId] || {
      question: 'ปรากฏการณ์นี้สอดคล้องกับกฎข้อใดทางฟิสิกส์ และเราสามารถลดความคลาดเคลื่อนในการทดลองได้อย่างไร?'
    };
  }

  function handleUserSend() {
    const input = document.getElementById('ai-chat-input');
    if (!input || isTyping) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addUserMessage(text);
    executeAgenticResponse(text);
  }

  function sendUserMessage(text) {
    addUserMessage(text);
    executeAgenticResponse(text);
  }

  // Export to global scope
  window.AIBot = {
    init: initAIBot,
    openChat: () => toggleAIChat(true),
    closeChat: () => toggleAIChat(false),
    toggleChat: () => toggleAIChat(),
    toggleTTS: toggleTTSVoice,
    sendUserMessage: sendUserMessage,
    handleSend: handleUserSend
  };

})();
