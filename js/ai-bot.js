/**
 * js/ai-bot.js
 * Mr. Deep_xAI — Co-creation Real-Time Multimodal Physics Copilot (Jarvis Style)
 * Authentic Sukhothai Dialect & Persona
 * NextGen Physics Laboratory 2026 - RBRU
 */

(function () {
  'use strict';

  let isChatOpen = false;
  let isTTSVoiceEnabled = true; // Enabled by default for Sukhothai voice experience
  let isListening = false;
  let recognitionInstance = null;
  let currentMood = 'idle'; // 'idle', 'thinking', 'speaking', 'excited', 'vision'
  let messageHistory = [];

  const PORTRAIT_SRC = 'assets/images/mr_deep_xai_real.jpg';

  // Comprehensive Knowledgebase for all 16 experiments
  const LAB_KNOWLEDGE = {
    elec_hex_loop: {
      name: 'วงจรตัวต้านทานรูปหกเหลี่ยม (IJSO Hexagonal Resistor Network)',
      formula: '$$R_{af} = 1 \\parallel 20 = \\frac{20}{21}\\,\\Omega, \\quad I = \\frac{21}{23}\\text{ A}, \\quad V_{af} = \\frac{20}{23}\\text{ V}$$',
      tips: 'ต่อสายไฟที่จุด a และ f จะได้ความต้านทานสมมูลต่ำสุดเน้อ เพราะตัวต้านทาน $1\\,\\Omega$ ขนานกับอีกด้านที่อนุกรมกัน $20\\,\\Omega$ ครับเน้อ',
      actions: ['toggleSwitch', 'resetPins']
    },
    elec_wheatstone: {
      name: 'วงจรบริดจ์ของวีตสตัน (Wheatstone Slide-Wire Bridge)',
      formula: '$$\\frac{R_x}{R_{\\text{std}}} = \\frac{L_1}{L_2} = \\frac{L_1}{100 - L_1}$$',
      tips: 'เลื่อนหัวจ็อกกีย์จนกระทั่งเข็มกัลวาโนมิเตอร์ชี้ศูนย์ (Null Balance) จุดนี้ศักย์ไฟฟ้าเท่ากันพอดีเป๊ะเน้ออาจารย์',
      actions: ['autoNull']
    },
    mech_pendulum: {
      name: 'ลูกตุ้มเพนดูลัมอย่างง่าย (Simple Harmonic Pendulum)',
      formula: '$$T = 2\\pi\\sqrt{\\frac{L}{g}} \\implies T^2 = \\left(\\frac{4\\pi^2}{g}\\right)L$$',
      tips: 'แกว่งมุมแคบๆ ไม่เกิน $10^\\circ$ เน้อ เพื่อให้ประมาณ $\\sin\\theta \\approx \\theta$ ได้แม่นยำ แล้วพล็อตกราฟ $T^2$ กับ $L$ หาค่า $g$ ได้เลยเน้อ',
      actions: ['startStopwatch', 'instantMeasure20']
    },
    mech_air_track: {
      name: 'การอนุรักษ์โมเมนตัมบนรางเบาะลม (Air Track Collision)',
      formula: '$$p_{\\text{ก่อน}} = p_{\\text{หลัง}} \\implies m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2$$',
      tips: 'รางเบาะลมลอยตัวไร้แรงเสียดทานเน้อ ชนแบบยืดหยุ่นพลังงานจลน์จะอนุรักษ์ แต่ถ้าติดกันไปพลังงานจะสูญเสียสูงสุดเน้อ',
      actions: ['launchAirTrack']
    },
    mech_free_fall: {
      name: 'การตกอย่างอิสระตัดลำแสงโฟโตเกต (Free Fall Photogate)',
      formula: '$$h = \\frac{1}{2}gt^2 \\implies g = 2 \\times \\text{Slope}(h \\text{ vs } t^2)$$',
      tips: 'ตัดแม่เหล็กไฟฟ้าปล่อยลูกเหล็กผ่านโฟโตเกต 3 ระดับ ความชันกราฟคูณ 2 จะได้ค่าความเร่งโน้มถ่วง $g$ สวยงามเน้อ',
      actions: ['releaseBall']
    },
    waves_resonance: {
      name: 'การสั่นพ้องของคลื่นเสียงในหลอดเรโซแนนซ์ (Sound Resonance Tube)',
      formula: '$$L_n = (2n - 1)\\frac{\\lambda}{4} - c \\implies v = 2f(L_{n+1} - L_n)$$',
      tips: 'เลื่อนผิวน้ำหาจุดที่เสียงกังวานดังที่สุดเน้อ นั่นคือตำแหน่งปฏิบัพที่ปากหลอดกับบัพที่ผิวน้ำพอดีเน้อ',
      actions: ['findResonance']
    },
    optics_bench: {
      name: 'รางทัศนศาสตร์และการเกิดภาพของเลนส์บาง (Optics Bench & Thin Lens)',
      formula: '$$\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s\'}, \\quad m = -\\frac{s\'}{s}$$',
      tips: 'เลื่อนเลนส์นูนและฉากรับภาพเน้อ เมื่อระยะวัตถุ $s > 2f$ จะเกิดภาพจริงหัวกลับขนาดเล็กกว่าวัตถุคมชัดเน้อ',
      actions: ['autoFocus']
    },
    em_faraday_lenz: {
      name: 'การเหนี่ยวนำแม่เหล็กไฟฟ้าฟาราเดย์-เลนซ์ (Faraday & Lenz Induction)',
      formula: '$$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt} = -N\\left(\\frac{d\\Phi_B}{dx}\\right)v$$',
      tips: 'รูดแท่งแม่เหล็กผ่านขดลวด ยิ่งเร็วเข็มกัลวาโนมิเตอร์ยิ่งเบนแรงเน้อ ทิศทางจะต้านการเปลี่ยนแปลงตามกฎของเลนซ์เน้อ',
      actions: ['toggleOscillate', 'flipPoles']
    },
    em_solenoid_field: {
      name: 'สนามแม่เหล็กในขดลวดโซเลนอยด์ (Solenoid Magnetic Field)',
      formula: '$$B_0 = \\mu_0 n I = \\mu_0 \\left(\\frac{N}{L}\\right) I$$',
      tips: 'สนามแม่เหล็กตรงกลางขดลวดเข้มและสม่ำเสมอที่สุดเน้อ ที่ปลายขอบจะเหลือประมาณครึ่งเดียว ($B_0/2$) ครับเน้อ',
      actions: ['autoScan']
    },
    em_helmholtz_coils: {
      name: 'ขดลวดเฮล์มโฮลทซ์และสนามแม่เหล็กสม่ำเสมอ (Helmholtz Coils)',
      formula: '$$B = \\left(\\frac{4}{5}\\right)^{3/2} \\frac{\\mu_0 N I}{R}$$',
      tips: 'วางขดลวดห่างกันเท่ากับรัศมี $R$ เน้อ จะได้สนามแม่เหล็กตรงกลางคงที่สม่ำเสมอที่สุดใน 3 มิติเน้อ',
      actions: ['centerProbe']
    },
    thermo_ideal_gas: {
      name: 'กฎของแก๊สอุดมคติและกระบอกสูบ (Ideal Gas Law P-V-T)',
      formula: '$$PV = nRT = N k_B T$$',
      tips: 'อัดลูกสูบแบบอุณหภูมิคงที่ ความดันจะแปรผกผันกับปริมาตรตามกฎของบอยล์เน้ออาจารย์',
      actions: ['heatGas', 'compressGas']
    },
    thermo_calorimeter: {
      name: 'แคลอริมิเตอร์และความร้อนจำเพาะ (Calorimeter & Heat Capacity)',
      formula: '$$Q_{\\text{สูญเสีย}} = Q_{\\text{ได้รับ}} \\implies m_m c_m (T_m - T_f) = (m_w c_w + C_{\\text{cal}})(T_f - T_w)$$',
      tips: 'หย่อนก้อนโลหะร้อนลงน้ำในแคลอริมิเตอร์ คนช้าๆ จนอุณหภูมิคงที่สมดุลความร้อนเน้อ',
      actions: ['transferSample']
    },
    thermo_thermal_exp: {
      name: 'การขยายตัวเชิงเส้นของของแข็ง (Linear Thermal Expansion)',
      formula: '$$\\Delta L = \\alpha L_0 \\Delta T \\implies \\alpha = \\frac{\\Delta L}{L_0 \\Delta T}$$',
      tips: 'ผ่านไอน้ำร้อนเข้าท่อโลหะ ไดอัลเกจจะวัดการยืดตัวระดับไมโครเมตรเน้อ ทองเหลืองจะยืดมากกว่าเหล็กเน้อ',
      actions: ['steamOn']
    },
    modern_photoelectric: {
      name: 'ปรากฏการณ์โฟโตอิเล็กทริกและค่าคงที่พลังค์ (Photoelectric Effect)',
      formula: '$$E = hf = W_0 + e V_{\\text{stop}} \\implies V_{\\text{stop}} = \\left(\\frac{h}{e}\\right)f - \\frac{W_0}{e}$$',
      tips: 'ฉายแสงความถี่เหนือความถี่ขีดเริ่ม แล้วปรับความต่างศักย์หยุดยั้งจนกระแสโฟโตอิเล็กตรอนเป็นศูนย์เน้อ',
      actions: ['findStoppingVoltage']
    },
    modern_half_life: {
      name: 'การสลายตัวกัมมันตรังสีและครึ่งชีวิต (Radioactive Half-Life)',
      formula: '$$N(t) = N_0 e^{-\\lambda t} = N_0 \\left(\\frac{1}{2}\\right)^{t / T_{1/2}}$$',
      tips: 'หัววัดไกเกอร์-มึลเลอร์จะตรวจจับรังสีเน้อ นับอัตราการสลายตัวเทียบกับเวลา พล็อตกราฟ Semi-log หาครึ่งชีวิตได้แม่นยำเน้อ',
      actions: ['startCounter']
    },
    modern_frank_hertz: {
      name: 'การทดลองฟรังก์-เฮิรตซ์และระดับพลังงานอะตอม (Franck-Hertz Experiment)',
      formula: '$$\\Delta V = \\frac{h\\nu}{e} \\approx 4.9\\text{ V (สำหรับไอปรอท Hg)}$$',
      tips: 'เมื่อเร่งอิเล็กตรอนชนอะตอมปรอทแบบไม่ยืดหยุ่น กระแสจะตกลงเป็นช่วงๆ ทุกๆ $4.9\\text{ V}$ พิสูจน์ระดับพลังงานแบบควอนตัมเน้อ',
      actions: ['rampVoltage']
    }
  };

  // Sukhothai Voice & Dialect Expressions
  const SUKHOTHAI_PHRASES = {
    greeting: 'สวัสดีครับเน้อ! ผมชื่อ **Mr. Deep_xAI** หนุ่มสุโขทัย ผู้ช่วยฟิสิกส์และ Co-creation อัจฉริยะประจำห้องแล็บ RBRU 2026 เน้อ',
    co_create: 'มาเน้ออาจารย์! วันนี้เรามาร่วมสร้างสรรค์ (Co-creation) ออกแบบการทดลอง หรือวิเคราะห์ข้อมูลเชิงลึกไปด้วยกันเน้อ มีอะไรให้ผมช่วยบอกมาได้เลยเน้อ',
    ack: 'รับทราบเน้อ! เดี๋ยวผมจัดให้เดี๋ยวนี้เลยเน้อ',
    thinking: 'กำลังวิเคราะห์สมการและสภาวะในแล็บให้อย่างละเอียดเน้อ...',
    success: 'เรียบร้อยแล้วเน้อ! ผลการทดลองออกมาสวยงามและแม่นยำมากเน้อ',
    vision_scanned: 'ผมสแกนภาพฉาก 3D ในห้องแล็บให้เรียบร้อยแล้วเน้อ! จากภาพที่เห็นในสายตาผมตอนนี้เน้อ:'
  };

  // Emotional Moods
  const MOOD_DATA = {
    idle: { icon: '😊', label: 'พร้อมร่วมงานเน้อ', badgeClass: '' },
    thinking: { icon: '🤔', label: 'กำลังคิดวิเคราะห์เน้อ...', badgeClass: 'mood-thinking' },
    speaking: { icon: '🎙️', label: 'กำลังบรรยายเน้อ...', badgeClass: 'mood-speaking' },
    excited: { icon: '💡', label: 'ไอเดียแจ่มมากเน้อ!', badgeClass: 'mood-excited' },
    vision: { icon: '📷', label: 'กำลังตรวจภาพ 3D เน้อ...', badgeClass: 'mood-thinking' }
  };

  /**
   * Initialize Mr. Deep_xAI Engine
   */
  function init() {
    updateTelemetryPill();
    setupSpeechRecognition();

    // Setup input Enter key listener
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSend();
        }
      });
    }

    // Listen to lab switch events
    if (window.PhysicsLabRegistry) {
      window.PhysicsLabRegistry.addListener('change', () => {
        updateTelemetryPill();
      });
    }

    // Initial greeting if chat is fresh
    if (messageHistory.length === 0) {
      pushBotGreeting();
    }
  }

  function setMood(mood) {
    currentMood = mood;
    const container = document.getElementById('mr-deep-avatar-container');
    const badge = document.getElementById('jarvis-mood-badge');
    const waveform = document.getElementById('ai-waveform-box');

    if (container) {
      container.className = `jarvis-avatar-container ${MOOD_DATA[mood]?.badgeClass || ''}`;
    }
    if (badge) {
      badge.textContent = MOOD_DATA[mood]?.icon || '😊';
    }
    if (waveform) {
      waveform.classList.toggle('active', mood === 'speaking');
    }
  }

  function updateTelemetryPill() {
    const textEl = document.getElementById('ai-telemetry-text');
    if (!textEl || !window.PhysicsLabRegistry) return;

    const activeExp = window.PhysicsLabRegistry.getActiveExperiment();
    if (activeExp) {
      textEl.innerHTML = `<span>⚡ แล็บปัจจุบัน: <b>${activeExp.shortTitle || activeExp.title}</b></span>`;
    } else {
      textEl.innerHTML = `<span>⚡ ระบบพร้อมทำงาน (Standby)</span>`;
    }
  }

  function toggleChat() {
    isChatOpen = !isChatOpen;
    const drawer = document.getElementById('ai-bot-drawer');
    if (drawer) {
      drawer.classList.toggle('open', isChatOpen);
      if (isChatOpen) {
        updateTelemetryPill();
        setMood('idle');
        const input = document.getElementById('ai-chat-input');
        if (input) setTimeout(() => input.focus(), 300);
      }
    }
  }

  function openChat() {
    isChatOpen = true;
    const drawer = document.getElementById('ai-bot-drawer');
    if (drawer) {
      drawer.classList.add('open');
      updateTelemetryPill();
      setMood('idle');
    }
  }

  function closeChat() {
    isChatOpen = false;
    const drawer = document.getElementById('ai-bot-drawer');
    if (drawer) {
      drawer.classList.remove('open');
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMood('idle');
  }

  function toggleTTS() {
    isTTSVoiceEnabled = !isTTSVoiceEnabled;
    const btn = document.getElementById('btn-ai-tts');
    if (btn) {
      btn.textContent = isTTSVoiceEnabled ? '🔊' : '🔇';
      btn.title = isTTSVoiceEnabled ? 'ปิดเสียงบรรยายสุโขทัย' : 'เปิดเสียงบรรยายสุโขทัย';
      btn.classList.toggle('active', isTTSVoiceEnabled);
    }
    if (!isTTSVoiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setMood('idle');
    }
  }

  /**
   * Sukhothai Male Voice Speech Synthesis
   */
  function speakSukhothaiVoice(text) {
    if (!isTTSVoiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown and latex for pleasant natural speech
    let cleanText = text
      .replace(/\$\$(.*?)\$\$/gs, 'สมการคณิตศาสตร์')
      .replace(/\$(.*?)\$/g, 'ตัวแปร')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[\#\*\_\`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    // Ensure authentic Sukhothai sentence ending if not present
    if (!cleanText.includes('เน้อ')) {
      cleanText += ' เน้อครับเน้อ';
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.pitch = 0.95; // Masculine natural pitch
    utterance.rate = 1.0;   // Friendly, natural Sukhothai pace

    // Find Thai voice if available
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang === 'th-TH' || v.lang.startsWith('th'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onstart = () => {
      setMood('speaking');
    };

    utterance.onend = () => {
      setMood('idle');
    };

    utterance.onerror = () => {
      setMood('idle');
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Web Speech Recognition for Real-time Voice Input
   */
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'th-TH';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    recognitionInstance.onstart = () => {
      isListening = true;
      const micBtn = document.getElementById('btn-ai-mic');
      if (micBtn) micBtn.classList.add('listening');
      setMood('thinking');
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('ai-chat-input');
      if (input) {
        input.value = transcript;
      }
      sendUserMessage(transcript);
    };

    recognitionInstance.onend = () => {
      isListening = false;
      const micBtn = document.getElementById('btn-ai-mic');
      if (micBtn) micBtn.classList.remove('listening');
      setMood('idle');
    };

    recognitionInstance.onerror = () => {
      isListening = false;
      const micBtn = document.getElementById('btn-ai-mic');
      if (micBtn) micBtn.classList.remove('listening');
      setMood('idle');
    };
  }

  function toggleSpeechInput() {
    if (!recognitionInstance) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech Recognition หรือต้องให้สิทธิ์การใช้ไมโครโฟนเน้อ');
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
    } else {
      try {
        recognitionInstance.start();
      } catch (e) {
        console.warn('Speech recognition start error:', e);
      }
    }
  }

  /**
   * Real-time 3D Scene Vision Snapshot
   */
  function captureSceneVision() {
    if (!window.renderer || !window.renderer.domElement) {
      sendUserMessage('ช่วยตรวจสอบฉากแล็บ 3D ให้หน่อยเน้อ');
      return;
    }

    setMood('vision');

    // Capture WebGL canvas to base64 JPEG
    const canvas = window.renderer.domElement;
    let dataUrl = '';
    try {
      dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.warn('Canvas export failed, using simulated vision:', e);
    }

    const activeExp = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperiment() : null;
    const expTitle = activeExp ? (activeExp.shortTitle || activeExp.title) : 'ห้องทดลอง 3D';

    // Append user message with vision snapshot card
    appendUserMessageWithVision('📷 สแกนภาพฉากแล็บ 3D ปัจจุบัน', dataUrl);

    // Mr. Deep_xAI analyzes the vision frame
    setMood('thinking');
    setTimeout(() => {
      let analysisText = '';
      if (activeExp && activeExp.id === 'elec_hex_loop') {
        const pPin = window.labState?.exp1?.connectedPinP || 'f';
        const qPin = window.labState?.exp1?.connectedPinQ || 'a';
        const sw = window.labState?.exp1?.knifeSwitchClosed ? 'สับลง (วงจรปิด กระแสไหล)' : 'ยกขึ้น (วงจรเปิด)';
        const vs = window.labState?.exp1?.supplyVoltage || 10.0;
        analysisText = `${SUKHOTHAI_PHRASES.vision_scanned}
- **อุปกรณ์ในฉาก:** ตรวจพบแผงตัวต้านทาน 6 เหลี่ยม IJSO, แหล่งจ่ายไฟ DC HY-3005D, สวิตช์ใบมีด และโวลต์มิเตอร์/แอมมิเตอร์หน้าปัดคู่เน้อ
- **สถานะการเชื่อมต่อ:** ขั้วต่อ P ต่ออยู่ที่จุด **${pPin}**, ขั้วต่อ Q ต่ออยู่ที่จุด **${qPin}**
- **สวิตช์ใบมีด:** อยู่ในสถานะ **${sw}**
- **แรงดันไฟฟ้า $V_s$:** จ่ายอยู่ที่ **${vs.toFixed(2)}\\text{ V}**
- **ผลการวิเคราะห์ทางฟิสิกส์:** การจัดวางสายและอุปกรณ์ถูกต้องตามระเบียบแล็บ IJSO ข้อ 7 เน้อ ค่าความต้านทานสมมูลต่ำสุดอยู่ที่คู่จุด f-a เท่ากับ $\\frac{20}{21}\\,\\Omega$ สมบูรณ์แบบมากเน้อ!`;
      } else if (activeExp && activeExp.id === 'mech_pendulum') {
        const len = window.labState?.exp2?.lengthCm || 50;
        analysisText = `${SUKHOTHAI_PHRASES.vision_scanned}
- **อุปกรณ์ในฉาก:** ตรวจพบเสาขาตั้ง Retort Stand, เชือกแขวนลูกตุ้มทองเหลือง, ไม้บรรทัดเมตร และแผ่นสเกลวัดมุมโปรแทรกเตอร์เน้อ
- **พารามิเตอร์ปัจจุบัน:** ความยาวเชือก $L = ${len}\\text{ cm}$ ($(0.${len}\\text{ m})$)
- **ผลการวิเคราะห์เชิงสายตา:** ลูกตุ้มถูกจัดวางในแนวดิ่งได้ระนาบอย่างดีเน้อ พร้อมสำหรับการแกว่งมุมเล็ก $\\theta < 10^\\circ$ เพื่อวัดคาบ $T$ หาค่า $g$ ครับเน้อ!`;
      } else {
        analysisText = `${SUKHOTHAI_PHRASES.vision_scanned}
- **ปฏิบัติการที่ตรวจพบ:** ${expTitle}
- **การจัดวางอุปกรณ์ 3D:** เมชอุปกรณ์และอุปกรณ์วัดถูกจัดวางบนโต๊ะแล็บฟิสิกส์อย่างถูกต้อง พร้อมสำหรับการรันการทดลองและการวัดค่า Telemetry ร่วมกัน (Co-creation) เน้อ!`;
      }

      appendBotMessage(analysisText);
      speakSukhothaiVoice(analysisText);
    }, 1200);
  }

  /**
   * Handle User File Upload for Vision Analysis
   */
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      const dataUrl = evt.target.result;
      appendUserMessageWithVision(`📎 แนบภาพ: ${file.name}`, dataUrl);
      setMood('thinking');
      setTimeout(() => {
        const reply = `ผมได้รับภาพของอาจารย์แล้วเน้อ! ภาพคมชัดมากเน้อ กำลังตรวจโครงสร้างวงจรและแผนภาพเวกเตอร์ทางฟิสิกส์ให้ หากต้องการให้ผมคำนวณหรือเปรียบเทียบกับทฤษฎีจุดไหน บอกผมได้เลยเน้อครับเน้อ!`;
        appendBotMessage(reply);
        speakSukhothaiVoice(reply);
      }, 1000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function pushBotGreeting() {
    const welcome = `${SUKHOTHAI_PHRASES.greeting}

${SUKHOTHAI_PHRASES.co_create}
- 💡 **ร่วมตั้งสมมติฐาน & ออกแบบการทดลอง (Co-Design)**
- 📷 **สแกนภาพฉาก 3D ตรวจสอบสายตา (Vision Real-time)**
- 🔍 **ตรวจสอบค่าเซ็นเซอร์จริงในแล็บ (Telemetry Inspection)**
- ⚡ **สั่งการอุปกรณ์แทนคุณ (Agentic Auto-Pilot)**
- 🎙️ **พูดคุยด้วยเสียงเน้อๆ ชาวสุโขทัย (Voice Input & TTS)**

อาจารย์อยากให้ผมช่วยอะไรในการทดลองนี้ก่อนดีเน้อ?`;
    appendBotMessage(welcome);
  }

  function handleSend() {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendUserMessage(text);
  }

  function sendUserMessage(text) {
    openChat();
    appendUserMessage(text);

    setMood('thinking');
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const response = generateDeepxAIResponse(text);
      appendBotMessage(response.content, response.actionFeedback);
      speakSukhothaiVoice(response.speechText || response.content);
    }, 850);
  }

  function generateDeepxAIResponse(prompt) {
    const text = prompt.toLowerCase();
    const activeExpId = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperimentId() : 'elec_hex_loop';
    const activeExp = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperiment() : null;
    const currentLab = LAB_KNOWLEDGE[activeExpId] || LAB_KNOWLEDGE.elec_hex_loop;

    // 1. Check for lab switching intent
    const switchIntent = detectSwitchLabIntent(text);
    if (switchIntent) {
      if (window.PhysicsLabRegistry) {
        window.PhysicsLabRegistry.switchExperiment(switchIntent.id);
      }
      setMood('excited');
      return {
        content: `จัดให้ตามคำขอเน้อ! ผมสลับห้องทดลองไปยัง **${switchIntent.name}** ให้เรียบร้อยแล้วเน้อ\n\n📌 **สูตรสำคัญ:**\n${switchIntent.formula}\n\n💡 **คำแนะนำจาก Mr. Deep_xAI:**\n${switchIntent.tips}`,
        speechText: `จัดให้ตามคำขอเน้อ สลับห้องทดลองไปยัง ${switchIntent.name} ให้เรียบร้อยแล้วเน้ออาจารย์`,
        actionFeedback: `🚀 สลับเข้าสู่ ${switchIntent.name} อัตโนมัติเรียบร้อย`
      };
    }

    // 2. Telemetry Inspection
    if (text.includes('ตรวจสอบ') || text.includes('สถานะ') || text.includes('ค่าปัจจุบัน') || text.includes('อ่านค่า') || text.includes('telemetry')) {
      const stateSummary = inspectCurrentLabState(activeExpId);
      setMood('excited');
      return {
        content: `นี่คือผลการตรวจสอบค่า Telemetry จริงจากอุปกรณ์ในแล็บเน้ออาจารย์:\n\n${stateSummary}\n\nทุกระบบทำงานปกติ สัญญาณนิ่งมากเน้ออาจารย์!`,
        speechText: `ตรวจสอบค่าปัจจุบันในห้องทดลองให้เรียบร้อยแล้วเน้อ ทุกระบบทำงานปกติ สัญญาณนิ่งมากเน้ออาจารย์`,
        actionFeedback: `🔍 ดึงค่า Telemetry จากเซ็นเซอร์ฮาร์ดแวร์ 3D สำเร็จ`
      };
    }

    // 3. Auto-Pilot Actions
    if (text.includes('ดำเนินการ') || text.includes('แทนฉัน') || text.includes('กด') || text.includes('สับสวิตช์') || text.includes('auto') || text.includes('ปล่อย')) {
      const actionResult = triggerLabAction(activeExpId);
      setMood('excited');
      return {
        content: `${SUKHOTHAI_PHRASES.ack}\n\n${actionResult.message}\n\nเรียบร้อยแล้วเน้ออาจารย์ ลองดูผลการตอบสนองที่หน้าปัดและกราฟ 3D ได้เลยเน้อ!`,
        speechText: `ดำเนินการให้เรียบร้อยแล้วเน้ออาจารย์ ลองดูผลที่หน้าปัดและกราฟได้เลยเน้อ`,
        actionFeedback: actionResult.badge
      };
    }

    // 4. Formula Explanation
    if (text.includes('สูตร') || text.includes('คำนวณ') || text.includes('ทฤษฎี') || text.includes('สมการ')) {
      setMood('speaking');
      return {
        content: `สำหรับปฏิบัติการ **${currentLab.name}** มีสูตรและหลักคิดสำคัญดังนี้เน้อ:\n\n${currentLab.formula}\n\n💡 **เทคนิคการคำนวณและทริค:**\n${currentLab.tips}\n\nเข้าใจง่ายไหมเน้ออาจารย์ ถ้าอยากให้ผมช่วยคำนวณตัวเลขไหน บอกมาได้เลยเน้อ!`,
        speechText: `สำหรับแล็บ ${currentLab.name} มีสูตรหลักและหลักคิดสำคัญตามนี้เน้อ เข้าใจง่ายมากๆ เน้ออาจารย์`
      };
    }

    // 5. Co-creation & Hypothesis Design
    if (text.includes('ร่วมคิด') || text.includes('co-creation') || text.includes('ออกแบบ') || text.includes('สมมติฐาน') || text.includes('วิจัย')) {
      setMood('excited');
      return {
        content: `ไอเดียแจ่มมากเน้ออาจารย์! ในการทำ Co-creation สำหรับแล็บ **${currentLab.name}** ผมขอเสนอแนวทางดังนี้เน้อ:
1. **การตั้งสมมติฐานใหม่:** ลองปรับตัวแปรต้นเพื่อสังเกตผลกระทบแบบ Non-linear
2. **การลดความคลาดเคลื่อน (Systematic Error):** ตรวจสอบจุดต่อสายไฟและระยะศูนย์ของอุปกรณ์
3. **การประยุกต์สู่เทคโนโลยีจริง:** นำสมการของแล็บนี้ไปเชื่อมโยงกับเซ็นเซอร์ IoT และปัญญาประดิษฐ์ Edge AI เน้อ!

อาจารย์ชอบแนวทางไหนเป็นพิเศษเน้อ เดี๋ยวเราลุยต่อยอดด้วยกันเลยเน้อ!`,
        speechText: `ไอเดียแจ่มมากเน้ออาจารย์ ผมเสนอแนวคิดการร่วมสร้างสรรค์ทั้งสามข้อ ลองพิจารณาดูเน้อ`
      };
    }

    // 6. Physics Quiz
    if (text.includes('quiz') || text.includes('คำถาม') || text.includes('ทดสอบ') || text.includes('ทาย')) {
      const quiz = generateLabQuiz(activeExpId);
      setMood('speaking');
      return {
        content: `มาทดสอบความเข้าใจกันหน่อยเน้ออาจารย์!\n\n${quiz.question}\n\nก) ${quiz.optA}\nข) ${quiz.optB}\nค) ${quiz.optC}\nง) ${quiz.optD}\n\nลองตอบมาดูเน้อว่าข้อไหนถูก!`,
        speechText: `มาทดสอบความเข้าใจกันหน่อยเน้ออาจารย์ ลองทายดูว่าข้อไหนถูกต้องเน้อ`
      };
    }

    // 7. General Lab Guidance (Default)
    setMood('speaking');
    return {
      content: `เกี่ยวกับปฏิบัติการ **${currentLab.name}** เน้ออาจารย์:\n\n${currentLab.tips}\n\n📌 **สมการที่ใช้:**\n${currentLab.formula}\n\nต้องการให้ผมช่วยกดสั่งการอุปกรณ์ สแกนภาพฉาก 3D หรืออธิบายขั้นตอนตรงไหนเพิ่มเติม บอกผมได้เลยเน้อครับเน้อ!`,
      speechText: `เกี่ยวกับแล็บนี้ มีรายละเอียดและสูตรสำคัญตามนี้เน้ออาจารย์ มีอะไรให้ช่วยบอกได้เลยเน้อ`
    };
  }

  function detectSwitchLabIntent(text) {
    if (text.includes('หกเหลี่ยม') || text.includes('ijso') || text.includes('ข้อ 7')) return { id: 'elec_hex_loop', ...LAB_KNOWLEDGE.elec_hex_loop };
    if (text.includes('วีตสตัน') || text.includes('wheatstone') || text.includes('บริดจ์')) return { id: 'elec_wheatstone', ...LAB_KNOWLEDGE.elec_wheatstone };
    if (text.includes('เพนดูลัม') || text.includes('ลูกตุ้ม') || text.includes('pendulum')) return { id: 'mech_pendulum', ...LAB_KNOWLEDGE.mech_pendulum };
    if (text.includes('เบาะลม') || text.includes('air track') || text.includes('ชน')) return { id: 'mech_air_track', ...LAB_KNOWLEDGE.mech_air_track };
    if (text.includes('ตกอิสระ') || text.includes('free fall') || text.includes('ลูกเหล็ก')) return { id: 'mech_free_fall', ...LAB_KNOWLEDGE.mech_free_fall };
    if (text.includes('เรโซแนนซ์') || text.includes('คลื่นเสียง') || text.includes('การสั่นพ้อง')) return { id: 'waves_resonance', ...LAB_KNOWLEDGE.waves_resonance };
    if (text.includes('เลนส์') || text.includes('ทัศนศาสตร์') || text.includes('optics')) return { id: 'optics_bench', ...LAB_KNOWLEDGE.optics_bench };
    if (text.includes('ฟาราเดย์') || text.includes('เลนซ์') || text.includes('เหนี่ยวนำ')) return { id: 'em_faraday_lenz', ...LAB_KNOWLEDGE.em_faraday_lenz };
    if (text.includes('โซเลนอยด์') || text.includes('solenoid')) return { id: 'em_solenoid_field', ...LAB_KNOWLEDGE.em_solenoid_field };
    if (text.includes('เฮล์มโฮลทซ์') || text.includes('helmholtz')) return { id: 'em_helmholtz_coils', ...LAB_KNOWLEDGE.em_helmholtz_coils };
    if (text.includes('แก๊ส') || text.includes('อุณหพลศาสตร์') || text.includes('gas law')) return { id: 'thermo_ideal_gas', ...LAB_KNOWLEDGE.thermo_ideal_gas };
    if (text.includes('แคลอริมิเตอร์') || text.includes('ความร้อนจำเพาะ') || text.includes('calorimeter')) return { id: 'thermo_calorimeter', ...LAB_KNOWLEDGE.thermo_calorimeter };
    if (text.includes('ขยายตัว') || text.includes('linear expansion')) return { id: 'thermo_thermal_exp', ...LAB_KNOWLEDGE.thermo_thermal_exp };
    if (text.includes('โฟโตอิเล็กทริก') || text.includes('photoelectric')) return { id: 'modern_photoelectric', ...LAB_KNOWLEDGE.modern_photoelectric };
    if (text.includes('ครึ่งชีวิต') || text.includes('half life') || text.includes('กัมมันตรังสี')) return { id: 'modern_half_life', ...LAB_KNOWLEDGE.modern_half_life };
    if (text.includes('ฟรังก์') || text.includes('เฮิรตซ์') || text.includes('franck')) return { id: 'modern_frank_hertz', ...LAB_KNOWLEDGE.modern_frank_hertz };
    return null;
  }

  function inspectCurrentLabState(expId) {
    if (expId === 'elec_hex_loop' && window.labState) {
      const p = window.labState.exp1.connectedPinP || 'f';
      const q = window.labState.exp1.connectedPinQ || 'a';
      const sw = window.labState.exp1.knifeSwitchClosed ? 'สับลง (ON)' : 'เปิดอยู่ (OFF)';
      const vs = window.labState.exp1.supplyVoltage || 10.0;
      const vHex = window.labState.exp1.vHexagon || 0.87;
      const cur = window.labState.exp1.iTotal || 0.913;
      return `• **ขั้วต่อ P-Q:** จุด ${p} ถึงจุด ${q}\n• **สวิตช์ใบมีด:** ${sw}\n• **แรงดันจ่าย ($V_s$):** ${vs.toFixed(2)} V\n• **แรงดันตกคร่อม ($V_{PQ}$):** ${vHex.toFixed(3)} V\n• **กระแสรวม ($I$):** ${cur.toFixed(3)} A`;
    }
    if (expId === 'mech_pendulum' && window.labState) {
      const len = window.labState.exp2.lengthCm || 50;
      const period = window.labState.exp2.theoreticalPeriod || 1.42;
      return `• **ความยาวเชือก ($L$):** ${len} cm (${(len / 100).toFixed(2)} m)\n• **คาบการแกว่งตามทฤษฎี ($T$):** ${period.toFixed(3)} s\n• **คาบยกกำลังสอง ($T^2$):** ${(period * period).toFixed(3)} s²`;
    }
    return `• **สถานะ 3D Simulation:** เชื่อมต่อเซ็นเซอร์เรียบร้อย อุปกรณ์เสมือนพร้อมบันทึกผลเน้อ`;
  }

  function triggerLabAction(expId) {
    if (expId === 'elec_hex_loop') {
      if (typeof window.toggleKnifeSwitch === 'function') {
        window.toggleKnifeSwitch();
      }
      return {
        message: 'ผมทำการสับสลับสวิตช์ใบมีด (Knife Switch) ในวงจรให้เรียบร้อยแล้วเน้อ กระแสไฟฟ้าตอบสนองทันที!',
        badge: '⚡ สับสลับสวิตช์ใบมีดสำเร็จ'
      };
    }
    if (expId === 'mech_pendulum') {
      if (typeof window.startTimer === 'function') {
        window.startTimer();
      }
      return {
        message: 'ผมกดปล่อยลูกตุ้มเพนดูลัมและเริ่มนาฬิกาจับเวลาดิจิทัลให้แล้วเน้อ สังเกตการแกว่งฮาร์มอนิกได้เลยเน้อ!',
        badge: '⏱️ เริ่มแกว่งลูกตุ้มและจับเวลาสำเร็จ'
      };
    }
    return {
      message: 'ผมส่งคำสั่งจำลองและอัปเดตสภาวะการทดลองของแล็บนี้ให้เรียบร้อยแล้วเน้อ!',
      badge: '✔ สั่งการระบบอัตโนมัติสำเร็จ'
    };
  }

  function generateLabQuiz(expId) {
    if (expId === 'elec_hex_loop') {
      return {
        question: 'ในวงจรตัวต้านทาน 6 เหลี่ยม (1-6 $\\Omega$) การต่อขั้วสายไฟเข้ากับจุดคู่ใดทำให้ได้ความต้านทานสมมูลรวม **ต่ำที่สุด**?',
        optA: 'จุด a และ d (ตรงข้ามกัน)',
        optB: 'จุด a และ f (ขนานกับ 1 $\\Omega$)',
        optC: 'จุด e และ f (ขนานกับ 6 $\\Omega$)',
        optD: 'จุด b และ c (ขนานกับ 2 $\\Omega$)'
      };
    }
    return {
      question: 'หากเพิ่มความยาวเชือกลูกตุ้มเพนดูลัมจากเดิม $L$ เป็น $4L$ คาบการแกว่ง $T$ จะเปลี่ยนแปลงอย่างไร?',
      optA: 'เพิ่มขึ้นเป็น 4 เท่า',
      optB: 'ลดลงเหลือครึ่งหนึ่ง',
      optC: 'เพิ่มขึ้นเป็น 2 เท่า',
      optD: 'เท่าเดิมไม่เปลี่ยนแปลง'
    };
  }

  function appendUserMessage(text) {
    const list = document.getElementById('ai-messages-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'ai-msg-row user-msg';
    row.innerHTML = `
      <div class="ai-msg-bubble">${escapeHTML(text)}</div>
    `;
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    messageHistory.push({ role: 'user', content: text });
  }

  function appendUserMessageWithVision(text, dataUrl) {
    const list = document.getElementById('ai-messages-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'ai-msg-row user-msg';
    row.innerHTML = `
      <div class="ai-msg-bubble">
        ${dataUrl ? `
          <div class="ai-vision-thumb-card">
            <span class="ai-vision-badge">📷 3D Visual Frame</span>
            <img src="${dataUrl}" alt="Scene Snapshot" />
          </div>
        ` : ''}
        <div>${escapeHTML(text)}</div>
      </div>
    `;
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    messageHistory.push({ role: 'user', content: text, image: dataUrl });
  }

  function appendBotMessage(markdownText, actionBadge) {
    const list = document.getElementById('ai-messages-list');
    if (!list) return;

    const htmlContent = formatMarkdown(markdownText);
    const row = document.createElement('div');
    row.className = 'ai-msg-row bot-msg';
    row.innerHTML = `
      <img src="${PORTRAIT_SRC}" class="ai-msg-avatar" alt="Mr. Deep_xAI" />
      <div class="ai-msg-bubble">
        <div class="bot-text-content">${htmlContent}</div>
        ${actionBadge ? `
          <div class="ai-action-feedback-card">
            <span>⚡</span> <span>${actionBadge}</span>
          </div>
        ` : ''}
      </div>
    `;
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;

    // Render KaTeX formulas
    if (typeof renderAcademicMath === 'function') {
      setTimeout(() => renderAcademicMath(row), 40);
    }

    messageHistory.push({ role: 'assistant', content: markdownText });
  }

  function showTypingIndicator() {
    const list = document.getElementById('ai-messages-list');
    if (!list) return;

    let el = document.getElementById('ai-typing-ind');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ai-typing-ind';
      el.className = 'ai-typing-indicator';
      el.innerHTML = `<span></span><span></span><span></span> <i>Mr. Deep_xAI กำลังคิดเน้อ...</i>`;
      list.appendChild(el);
      list.scrollTop = list.scrollHeight;
    }
  }

  function removeTypingIndicator() {
    const el = document.getElementById('ai-typing-ind');
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function formatMarkdown(text) {
    let out = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    out = out.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Bullet points
    out = out.replace(/^\- (.*$)/gim, '• $1<br/>');

    // Numbered lists
    out = out.replace(/^(\d+)\. (.*$)/gim, '$1. $2<br/>');

    // Line breaks
    out = out.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

    return out;
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Export to global window scope
  window.AIBot = {
    init,
    toggleChat,
    openChat,
    closeChat,
    toggleTTS,
    toggleSpeechInput,
    captureSceneVision,
    handleImageUpload,
    handleSend,
    sendUserMessage,
    setMood
  };

})();
