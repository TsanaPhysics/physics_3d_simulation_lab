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

  const PORTRAIT_SRC = 'assets/images/mr_deep_xai_bot_square.png?v=20261018_65';

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

  // Active Persona ('jarvis' or 'sukhothai')
  let currentPersona = 'jarvis';

  const PERSONA_DATA = {
    jarvis: {
      id: 'jarvis',
      name: 'J.A.R.V.I.S.',
      title: 'Iron Man AI Protocol',
      badgeLabel: '🤖 J.A.R.V.I.S.',
      launcherLabel: 'J.A.R.V.I.S. AI',
      voiceStatus: '🎙️ J.A.R.V.I.S. (เสียงผู้ชายทุ้มลึก)',
      browserPitch: 0.44, // Masculine deep baritone / J.A.R.V.I.S. gentleman voice
      browserRate: 0.90,  // Dignified, composed pace
      pitch: -2.6, // Deep, calm, British gentleman resonance (Paul Bettany)
      rate: 0.95,  // Dignified, composed pace
      honorific: 'ท่าน',
      moods: {
        idle: { icon: '⚡', label: 'All systems online, sir.', badgeClass: 'mood-jarvis' },
        thinking: { icon: '🔮', label: 'Processing algorithms, sir...', badgeClass: 'mood-thinking' },
        speaking: { icon: '🎙️', label: 'Transmitting audio, sir...', badgeClass: 'mood-speaking' },
        excited: { icon: '💡', label: 'Optimal vector identified, sir!', badgeClass: 'mood-excited' },
        vision: { icon: '📷', label: 'Scanning 3D HUD optics, sir...', badgeClass: 'mood-thinking' }
      },
      phrases: {
        greeting: 'สวัสดีครับท่าน ผม **J.A.R.V.I.S.** ในโปรโตคอล **Mr. Deep_xAI** ยินดีรับใช้ครับท่าน (At your service, sir)',
        co_create: 'ระบบจำลองฟิสิกส์ 3 มิติ และโมดูล Co-creation อัจฉริยะออนไลน์พร้อมปฏิบัติการ 100% แล้วครับท่าน (All systems operational, sir)',
        ack: 'รับทราบคำสั่งครับท่าน กำลังจัดการให้ทันทีครับ (Right away, sir)',
        thinking: 'กำลังคำนวณเวกเตอร์และวิเคราะห์โครงสร้างข้อมูลให้ครับท่าน...',
        success: 'การจำลองและปรับเทียบพารามิเตอร์เสร็จสมบูรณ์เรียบร้อยครับท่าน',
        vision_scanned: 'สแกนภาพฉากแล็บ 3 มิติผ่านระบบ HUD Optics เรียบร้อยครับท่าน ข้อมูลพิกัดอุปกรณ์ในฉากมีดังนี้ครับ:'
      }
    },
    sukhothai: {
      id: 'sukhothai',
      name: 'หนุ่มสุโขทัย',
      title: 'Digital Bot หนุ่มสุโขทัย',
      badgeLabel: '🌾 หนุ่มสุโขทัย',
      launcherLabel: 'หนุ่มสุโขทัย',
      voiceStatus: '🎙️ หนุ่มสุโขทัย (เสียงผู้ชาย)',
      browserPitch: 0.58, // Warm natural young Thai man pitch
      browserRate: 0.96,
      pitch: -0.5,
      rate: 1.02,
      honorific: 'อาจารย์',
      moods: {
        idle: { icon: '😊', label: 'พร้อมร่วมงานเน้อ', badgeClass: '' },
        thinking: { icon: '🤔', label: 'กำลังคิดวิเคราะห์เน้อ...', badgeClass: 'mood-thinking' },
        speaking: { icon: '🎙️', label: 'กำลังบรรยายเน้อ...', badgeClass: 'mood-speaking' },
        excited: { icon: '💡', label: 'ไอเดียแจ่มมากเน้อ!', badgeClass: 'mood-excited' },
        vision: { icon: '📷', label: 'กำลังตรวจภาพ 3D เน้อ...', badgeClass: 'mood-thinking' }
      },
      phrases: {
        greeting: 'สวัสดีครับเน้อ! ผมชื่อ **Mr. Deep_xAI** หนุ่มสุโขทัย ผู้ช่วยฟิสิกส์และ Co-creation อัจฉริยะประจำห้องแล็บ RBRU 2026 เน้อ',
        co_create: 'มาเน้ออาจารย์! วันนี้เรามาร่วมสร้างสรรค์ (Co-creation) ออกแบบการทดลอง หรือวิเคราะห์ข้อมูลเชิงลึกไปด้วยกันเน้อ มีอะไรให้ผมช่วยบอกมาได้เลยเน้อ',
        ack: 'รับทราบเน้อ! เดี๋ยวผมจัดให้เดี๋ยวนี้เลยเน้อ',
        thinking: 'กำลังวิเคราะห์สมการและสภาวะในแล็บให้อย่างละเอียดเน้อ...',
        success: 'เรียบร้อยแล้วเน้อ! ผลการทดลองออกมาสวยงามและแม่นยำมากเน้อ',
        vision_scanned: 'ผมสแกนภาพฉาก 3D ในห้องแล็บให้เรียบร้อยแล้วเน้อ! จากภาพที่เห็นในสายตาผมตอนนี้เน้อ:'
      }
    }
  };

  /**
   * Iron Man JARVIS High-Tech HUD Chime Synthesizer (Web Audio API)
   * 880Hz (A5) -> 1320Hz (E6) futuristic dual-blip chime
   */
  function playJarvisChime() {
    try {
      if (!botAudioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) botAudioContext = new AudioCtx();
      }
      if (botAudioContext && botAudioContext.state === 'suspended') {
        botAudioContext.resume().catch(() => {});
      }
      if (!botAudioContext) return;

      const now = botAudioContext.currentTime;
      // Blip 1: 880Hz
      const osc1 = botAudioContext.createOscillator();
      const gain1 = botAudioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.05, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
      osc1.connect(gain1);
      gain1.connect(botAudioContext.destination);
      osc1.start(now);
      osc1.stop(now + 0.07);

      // Blip 2: 1320Hz
      const osc2 = botAudioContext.createOscillator();
      const gain2 = botAudioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.045);
      gain2.gain.setValueAtTime(0.0001, now + 0.045);
      gain2.gain.exponentialRampToValueAtTime(0.06, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      osc2.connect(gain2);
      gain2.connect(botAudioContext.destination);
      osc2.start(now + 0.045);
      osc2.stop(now + 0.135);
    } catch (e) {}
  }

  /**
   * Initialize Mr. Deep_xAI Engine
   */
  function init() {
    updateTelemetryPill();
    setupSpeechRecognition();
    applyPersonaUI();

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

  function togglePersona() {
    currentPersona = (currentPersona === 'jarvis') ? 'sukhothai' : 'jarvis';
    applyPersonaUI();
    playJarvisChime();

    if (currentPersona === 'jarvis') {
      const msg = 'ระบบ J.A.R.V.I.S. เปิดใช้งานเต็มพิกัดแล้วครับท่าน ยินดีรับใช้ครับ (At your service, sir)';
      appendBotMessage(msg);
      speakBotVoice(msg);
    } else {
      const msg = 'สลับมาเป็นโหมดหนุ่มสุโขทัยเรียบร้อยแล้วเน้อ มีอะไรให้ผมช่วยบอกมาได้เลยเน้อครับเน้อ!';
      appendBotMessage(msg);
      speakBotVoice(msg);
    }
  }

  function setPersona(personaKey) {
    if (PERSONA_DATA[personaKey]) {
      currentPersona = personaKey;
      applyPersonaUI();
      playJarvisChime();
    }
  }

  function applyPersonaUI() {
    const p = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;
    const toggleBtn = document.getElementById('ai-persona-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = p.badgeLabel;
      toggleBtn.className = (currentPersona === 'jarvis') ? 'ai-jarvis-pill' : 'ai-sukhothai-pill';
    }
    const launcherStatus = document.getElementById('ai-launcher-status-text');
    if (launcherStatus) {
      launcherStatus.textContent = p.launcherLabel;
    }
    const voiceBadge = document.getElementById('ai-voice-status-indicator');
    if (voiceBadge) {
      voiceBadge.textContent = p.voiceStatus;
    }
    setMood('idle');
  }

  function setMood(mood) {
    currentMood = mood;
    const container = document.getElementById('mr-deep-avatar-container');
    const badge = document.getElementById('jarvis-mood-badge');
    const waveform = document.getElementById('ai-waveform-box');
    const pMoods = (PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis).moods;

    if (container) {
      container.className = `jarvis-avatar-container ${pMoods[mood]?.badgeClass || ''}`;
    }
    if (badge) {
      badge.textContent = pMoods[mood]?.icon || '⚡';
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
    unlockAudioContext();
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
    unlockAudioContext();
    isChatOpen = true;
    const drawer = document.getElementById('ai-bot-drawer');
    if (drawer) {
      drawer.classList.add('open');
      updateTelemetryPill();
      setMood('idle');
    }
  }

  let activeAudioElement = null;
  let audioWaveformTimer = null;

  function closeChat() {
    isChatOpen = false;
    const drawer = document.getElementById('ai-bot-drawer');
    if (drawer) {
      drawer.classList.remove('open');
    }
    stopVoiceAudio();
  }

  function toggleTTS() {
    isTTSVoiceEnabled = !isTTSVoiceEnabled;
    const btn = document.getElementById('btn-ai-tts');
    if (btn) {
      btn.textContent = isTTSVoiceEnabled ? '🔊' : '🔇';
      btn.title = isTTSVoiceEnabled ? 'ปิดเสียงบรรยาย Google TTS' : 'เปิดเสียงบรรยาย Google TTS';
      btn.classList.toggle('active', isTTSVoiceEnabled);
    }
    if (!isTTSVoiceEnabled) {
      stopVoiceAudio();
    }
  }

  let cachedGoogleThaiVoice = null;
  let voiceQueue = [];
  let isPlayingVoiceQueue = false;
  let isAudioUnlocked = false;
  let botAudioContext = null;
  let activeBufferSource = null;

  // Studio TTS Endpoints from globe2027 and local project
  const currentHost = window.location.hostname || 'localhost';
  const STUDIO_TTS_ENDPOINTS = [
    `http://${currentHost}/G4_Environment_Climate_Energy/globe2027/api/tts.php`,
    'http://localhost/G4_Environment_Climate_Energy/globe2027/api/tts.php',
    'http://127.0.0.1/G4_Environment_Climate_Energy/globe2027/api/tts.php',
    'api/tts.php'
  ];

  const SILENT_WAV_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

  function unlockAudioContext() {
    try {
      // 1. Web Audio API Context Unlocking
      if (!botAudioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          botAudioContext = new AudioCtx();
        }
      }
      if (botAudioContext && botAudioContext.state === 'suspended') {
        botAudioContext.resume().catch(() => {});
      }

      // 2. HTML5 Audio Element Priming with Silent WAV
      if (!activeAudioElement) {
        activeAudioElement = new Audio();
        activeAudioElement.preload = 'auto';
      }
      if (!isAudioUnlocked) {
        activeAudioElement.src = SILENT_WAV_BASE64;
        const playProm = activeAudioElement.play();
        if (playProm !== undefined) {
          playProm.then(() => {
            activeAudioElement.pause();
            activeAudioElement.currentTime = 0;
            isAudioUnlocked = true;
          }).catch(() => {});
        } else {
          isAudioUnlocked = true;
        }
      }
    } catch (e) {}
  }

  // Pre-unlock audio on user interaction
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, unlockAudioContext, { passive: true });
  });

  function updateVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. First priority: Explicit Male Thai voices if installed (e.g., Niwat, Male, ชาย)
    let found = voices.find(v => 
      (v.lang === 'th-TH' || v.lang.startsWith('th')) && 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('niwat') || v.name.includes('ชาย') || v.name.toLowerCase().includes('man'))
    );

    // 2. Second priority: Google Thai Voice
    if (!found) {
      found = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Chrome')) && 
        (v.lang === 'th-TH' || v.lang.startsWith('th'))
      );
    }

    // 3. Third priority: Any other Thai platform voice (e.g. Kanya/Siri, pitch-shifted to masculine register)
    if (!found) {
      found = voices.find(v => v.lang === 'th-TH' || v.lang.startsWith('th'));
    }

    if (found) {
      cachedGoogleThaiVoice = found;
      console.info('Mr. Deep_xAI Male Voice Engine ready:', found.name, found.lang);
      const voiceBadge = document.getElementById('ai-voice-status-indicator');
      const pConfig = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;
      if (voiceBadge) {
        voiceBadge.textContent = pConfig.voiceStatus;
      }
    }
  }

  if ('speechSynthesis' in window) {
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  /**
   * High-Fidelity Studio Audio Playback (Web Audio API direct PCM decode + Blob URL fallback)
   */
  async function playStudioBase64Audio(dataUrl, cleanText) {
    let normalizedUrl = dataUrl;
    if (normalizedUrl.startsWith('data:audio/mp3;')) {
      normalizedUrl = normalizedUrl.replace('data:audio/mp3;', 'data:audio/mpeg;');
    }

    // Primary: Web Audio API (Hardware PCM decode - immune to Autoplay block once resumed)
    try {
      if (!botAudioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) botAudioContext = new AudioCtx();
      }
      if (botAudioContext) {
        if (botAudioContext.state === 'suspended') {
          await botAudioContext.resume();
        }

        const base64Index = normalizedUrl.indexOf('base64,');
        const base64Str = base64Index !== -1 ? normalizedUrl.substring(base64Index + 7) : normalizedUrl;
        const binaryStr = window.atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const audioBuffer = await botAudioContext.decodeAudioData(bytes.buffer.slice(0));
        if (audioBuffer) {
          stopVoiceAudio();

          const source = botAudioContext.createBufferSource();
          source.buffer = audioBuffer;

          const pConfig = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;

          if (currentPersona === 'jarvis') {
            // Iron Man Holographic HUD Audio DSP Filter Chain
            const highpass = botAudioContext.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.setValueAtTime(120, botAudioContext.currentTime);

            const presence = botAudioContext.createBiquadFilter();
            presence.type = 'peaking';
            presence.frequency.setValueAtTime(3400, botAudioContext.currentTime);
            presence.Q.setValueAtTime(1.4, botAudioContext.currentTime);
            presence.gain.setValueAtTime(2.6, botAudioContext.currentTime);

            const comp = botAudioContext.createDynamicsCompressor();
            comp.threshold.setValueAtTime(-16, botAudioContext.currentTime);
            comp.ratio.setValueAtTime(3, botAudioContext.currentTime);

            source.connect(highpass);
            highpass.connect(presence);
            presence.connect(comp);
            comp.connect(botAudioContext.destination);
          } else {
            source.connect(botAudioContext.destination);
          }

          source.onended = () => {
            stopVoiceAudio();
          };

          activeBufferSource = source;
          source.start(0);

          setMood('speaking');
          startWaveformSimulation();
          const voiceBadge = document.getElementById('ai-voice-status-indicator');
          if (voiceBadge) voiceBadge.textContent = pConfig.voiceStatus;
          return true;
        }
      }
    } catch (webAudioErr) {
      console.warn('[Studio Voice] Web Audio API decode failed, attempting Blob URL fallback:', webAudioErr);
    }

    // Secondary: HTML5 Audio Element with standards-compliant audio/mpeg Blob URL
    try {
      stopVoiceAudio();
      if (!activeAudioElement) {
        activeAudioElement = new Audio();
      }

      let playableSrc = normalizedUrl;
      try {
        const base64Index = normalizedUrl.indexOf('base64,');
        const base64Str = base64Index !== -1 ? normalizedUrl.substring(base64Index + 7) : normalizedUrl;
        const binaryStr = window.atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        playableSrc = URL.createObjectURL(blob);
      } catch (blobErr) {
        playableSrc = normalizedUrl;
      }

      activeAudioElement.removeAttribute('crossorigin');
      activeAudioElement.src = playableSrc;
      activeAudioElement.playbackRate = 1.0;
      activeAudioElement.preload = 'auto';

      activeAudioElement.onplay = () => {
        setMood('speaking');
        startWaveformSimulation();
        const voiceBadge = document.getElementById('ai-voice-status-indicator');
        const pConf = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;
        if (voiceBadge) voiceBadge.textContent = pConf.voiceStatus;
      };

      activeAudioElement.onended = () => {
        stopVoiceAudio();
      };

      activeAudioElement.onerror = (err) => {
        console.warn('[Studio Voice] HTMLAudio error, fallback to browser speech:', err);
        fallbackToBrowserSpeech(cleanText);
      };

      const playProm = activeAudioElement.play();
      if (playProm !== undefined) {
        playProm.catch((err) => {
          console.warn('[Studio Voice] Play promise error, fallback to browser speech:', err);
          fallbackToBrowserSpeech(cleanText);
        });
      }
      return true;
    } catch (htmlAudioErr) {
      console.warn('[Studio Voice] HTMLAudio element failed, fallback to browser speech:', htmlAudioErr);
      fallbackToBrowserSpeech(cleanText);
      return false;
    }
  }

  /**
   * Google Studio Human Voice Engine (Tone matched: J.A.R.V.I.S. Iron Man AI / Sukhothai)
   */
  async function speakBotVoice(text) {
    if (!isTTSVoiceEnabled) return;

    // Stop previous voice playback
    stopVoiceAudio();
    unlockAudioContext();

    const pConfig = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;

    if (currentPersona === 'jarvis') {
      playJarvisChime();
    }

    // 1. Phrasing and phonetic cleanup for natural human speech
    let cleanText = text
      .replace(/\$\$(.*?)\$\$/gs, ' สมการคณิตศาสตร์ ')
      .replace(/\\Omega/g, ' โอห์ม ')
      .replace(/\\text\{V\}/g, ' โวลต์ ')
      .replace(/\\text\{A\}/g, ' แอมแปร์ ')
      .replace(/\\text\{m\/s\}\^2/g, ' เมตรต่อวินาทียกกำลังสอง ')
      .replace(/\\text\{m\/s\}/g, ' เมตรต่อวินาที ')
      .replace(/\\text\{s\}/g, ' วินาที ')
      .replace(/\\text\{cm\}/g, ' เซนติเมตร ')
      .replace(/\\text\{m\}/g, ' เมตร ')
      .replace(/\\text\{Hz\}/g, ' เฮิรตซ์ ')
      .replace(/\\mu_0/g, ' มิวศูนย์ ')
      .replace(/\\pi/g, ' พาย ')
      .replace(/\\Delta/g, ' เดลต้า ')
      .replace(/\\theta/g, ' ทีต้า ')
      .replace(/\\lambda/g, ' แลมบ์ดา ')
      .replace(/\\approx/g, ' ประมาณ ')
      .replace(/\\times/g, ' คูณ ')
      .replace(/\$(.*?)\$/g, ' $1 ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[\#\*\_\`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\bIJSO\b/g, 'ไอเจเอสโอ')
      .replace(/\bDC\b/g, 'ดีซี')
      .replace(/\bAC\b/g, 'เอซี')
      .replace(/\b3D\b/g, 'สามมิติ')
      .replace(/\bAI\b/g, 'เอไอ')
      .replace(/\bMr\.\s*Deep_xAI\b/g, 'มิสเตอร์ดีฟเอไอ')
      .replace(/\bJ\.A\.R\.V\.I\.S\.\b/gi, 'จาวิส')
      .replace(/\bJARVIS\b/gi, 'จาวิส')
      .trim();

    // Persona-specific sentence ending & phrasing
    if (currentPersona === 'jarvis') {
      cleanText = cleanText
        .replace(/เน้อครับเน้อ/g, 'ครับท่าน')
        .replace(/เน้ออาจารย์/g, 'ครับท่าน')
        .replace(/เน้อ/g, 'ครับ');
      if (!cleanText.includes('ครับท่าน') && !cleanText.includes('ครับ') && !cleanText.includes('sir')) {
        cleanText += ' ครับท่าน';
      }
    } else {
      if (!cleanText.includes('เน้อ')) {
        cleanText += ' เน้อครับเน้อ';
      }
    }

    // 2. Dispatch to Male Neural Voice Engine (JARVIS Deep Male Pitch: 0.44 / Sukhothai Male Pitch: 0.58)
    const voiceBadge = document.getElementById('ai-voice-status-indicator');
    if (voiceBadge) {
      voiceBadge.textContent = pConfig.voiceStatus;
    }

    fallbackToBrowserSpeech(cleanText);
  }

  const speakSukhothaiVoice = speakBotVoice;

  function fallbackToBrowserSpeech(cleanText) {
    const sentences = cleanText
      .split(/[\n\r]+|[!?。]+|(?<=[ครับเน้อ|ค่ะ|ครับ|จ้ะ|เน้อ])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) return;

    voiceQueue = [...sentences];
    isPlayingVoiceQueue = true;
    playNextVoiceChunk();
  }

  function playNextVoiceChunk() {
    if (!isPlayingVoiceQueue || voiceQueue.length === 0) {
      stopVoiceAudio();
      return;
    }

    const chunk = voiceQueue.shift();
    if (!chunk) {
      playNextVoiceChunk();
      return;
    }

    if (!('speechSynthesis' in window)) {
      stopVoiceAudio();
      return;
    }

    updateVoices();

    const pConfig = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = 'th-TH';
    // Calibrated male voice pitch: 0.44 for J.A.R.V.I.S. deep baritone, 0.58 for Sukhothai young male
    utterance.pitch = (pConfig.browserPitch !== undefined) ? pConfig.browserPitch : (currentPersona === 'jarvis' ? 0.44 : 0.58);
    utterance.rate = (pConfig.browserRate !== undefined) ? pConfig.browserRate : 0.92;
    utterance.volume = 1.0;

    if (cachedGoogleThaiVoice) {
      utterance.voice = cachedGoogleThaiVoice;
    }

    utterance.onstart = () => {
      setMood('speaking');
      startWaveformSimulation();
    };

    utterance.onend = () => {
      if (isPlayingVoiceQueue && voiceQueue.length > 0) {
        setTimeout(() => playNextVoiceChunk(), 60);
      } else {
        stopVoiceAudio();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis chunk error:', e);
      if (isPlayingVoiceQueue && voiceQueue.length > 0) {
        setTimeout(() => playNextVoiceChunk(), 50);
      } else {
        stopVoiceAudio();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopVoiceAudio() {
    isPlayingVoiceQueue = false;
    voiceQueue = [];

    if (activeBufferSource) {
      try {
        activeBufferSource.stop();
        activeBufferSource.disconnect();
      } catch (e) {}
      activeBufferSource = null;
    }

    if (activeAudioElement) {
      try {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    stopWaveformSimulation();
    setMood('idle');
  }

  function startWaveformSimulation() {
    stopWaveformSimulation();
    const bars = document.querySelectorAll('#ai-waveform-box .waveform-bar');
    if (!bars.length) return;

    audioWaveformTimer = setInterval(() => {
      bars.forEach(bar => {
        const h = Math.floor(Math.random() * 12) + 3;
        bar.style.height = `${h}px`;
      });
    }, 110);
  }

  function stopWaveformSimulation() {
    if (audioWaveformTimer) {
      clearInterval(audioWaveformTimer);
      audioWaveformTimer = null;
    }
    const bars = document.querySelectorAll('#ai-waveform-box .waveform-bar');
    bars.forEach(b => b.style.height = '3px');
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

    // AI analyzes the vision frame
    setMood('thinking');
    setTimeout(() => {
      let analysisText = '';
      const p = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;
      const isJarvis = (currentPersona === 'jarvis');

      if (activeExp && activeExp.id === 'elec_hex_loop') {
        const pPin = window.labState?.exp1?.connectedPinP || 'f';
        const qPin = window.labState?.exp1?.connectedPinQ || 'a';
        const sw = window.labState?.exp1?.knifeSwitchClosed ? 'สับลง (วงจรปิด กระแสไหล)' : 'ยกขึ้น (วงจรเปิด)';
        const vs = window.labState?.exp1?.supplyVoltage || 10.0;
        analysisText = `${p.phrases.vision_scanned}
- **อุปกรณ์ในฉาก:** แผงตัวต้านทาน 6 เหลี่ยม IJSO, แหล่งจ่ายไฟ DC HY-3005D, สวิตช์ใบมีด และมิเตอร์วัดหน้าปัดคู่
- **สถานะการเชื่อมต่อ:** ขั้วต่อ P ต่ออยู่ที่จุด **${pPin}**, ขั้วต่อ Q ต่ออยู่ที่จุด **${qPin}**
- **สวิตช์ใบมีด:** อยู่ในสถานะ **${sw}**
- **แรงดันไฟฟ้า $V_s$:** จ่ายอยู่ที่ **${vs.toFixed(2)}\\text{ V}**
- **ผลการวิเคราะห์ทางฟิสิกส์:** ${isJarvis ? 'การจัดวางอุปกรณ์สอดคล้องตามข้อกำหนด IJSO ข้อ 7 อย่างสมบูรณ์แบบครับท่าน ค่าความต้านทานสมมูลต่ำสุดที่จุด f-a เท่ากับ $\\frac{20}{21}\\,\\Omega$' : 'การจัดวางสายและอุปกรณ์ถูกต้องตามระเบียบแล็บ IJSO ข้อ 7 เน้อ ค่าความต้านทานสมมูลต่ำสุดอยู่ที่คู่จุด f-a เท่ากับ $\\frac{20}{21}\\,\\Omega$ สมบูรณ์แบบมากเน้อ!'}`;
      } else if (activeExp && activeExp.id === 'mech_pendulum') {
        const len = window.labState?.exp2?.lengthCm || 50;
        analysisText = `${p.phrases.vision_scanned}
- **อุปกรณ์ในฉาก:** เสาขาตั้ง Retort Stand, เชือกแขวนลูกตุ้มทองเหลือง, ไม้บรรทัดเมตร และสเกลวัดมุมโปรแทรกเตอร์
- **พารามิเตอร์ปัจจุบัน:** ความยาวเชือก $L = ${len}\\text{ cm}$ ($(0.${len}\\text{ m})$)
- **ผลการวิเคราะห์เชิงสายตา:** ${isJarvis ? 'ลูกตุ้มอยู่ในแนวดิ่งสมบูรณ์แบบครับท่าน พร้อมสำหรับการแกว่งมุมเล็ก $\\theta < 10^\\circ$ เพื่อวัดคาบ $T$ และคำนวณค่า $g$' : 'ลูกตุ้มถูกจัดวางในแนวดิ่งได้ระนาบอย่างดีเน้อ พร้อมสำหรับการแกว่งมุมเล็ก $\\theta < 10^\\circ$ เพื่อวัดคาบ $T$ หาค่า $g$ ครับเน้อ!'}`;
      } else {
        analysisText = `${p.phrases.vision_scanned}
- **ปฏิบัติการที่ตรวจพบ:** ${expTitle}
- **การจัดวางอุปกรณ์ 3D:** เมชอุปกรณ์และเซ็นเซอร์วัดถูกจัดวางบนโต๊ะแล็บอย่างถูกต้อง พร้อมสำหรับการจำลองร่วมกันแบบ Co-creation ${isJarvis ? 'ครับท่าน' : 'เน้อ!'}`;
      }

      appendBotMessage(analysisText);
      speakBotVoice(analysisText);
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
        const isJarvis = (currentPersona === 'jarvis');
        const reply = isJarvis 
          ? `ได้รับไฟล์ภาพเรียบร้อยครับท่าน กำลังประมวลผลโครงสร้างทางฟิสิกส์และแผนภาพเวกเตอร์จากเซ็นเซอร์ออปติคัลให้ หากท่านต้องการให้รันการคำนวณส่วนใด แจ้งผมได้ทันทีครับ (At your service, sir)`
          : `ผมได้รับภาพของอาจารย์แล้วเน้อ! ภาพคมชัดมากเน้อ กำลังตรวจโครงสร้างวงจรและแผนภาพเวกเตอร์ทางฟิสิกส์ให้ หากต้องการให้ผมคำนวณหรือเปรียบเทียบกับทฤษฎีจุดไหน บอกผมได้เลยเน้อครับเน้อ!`;
        appendBotMessage(reply);
        speakBotVoice(reply);
      }, 1000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function pushBotGreeting() {
    const p = PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis;
    const isJarvis = (currentPersona === 'jarvis');
    const welcome = `${p.phrases.greeting}

${p.phrases.co_create}
- 🤖 **J.A.R.V.I.S. Iron Man AI Protocol (เสียงจาวิสทุ้มนุ่มสุขุม หรือสลับเสียงสุโขทัยได้)**
- 💡 **ร่วมตั้งสมมติฐาน & ออกแบบการทดลอง (Co-Design)**
- 📷 **สแกนภาพฉาก 3D ตรวจสอบสายตา (HUD Optics Vision)**
- 🔍 **ตรวจสอบค่าเซ็นเซอร์จริงในแล็บ (Telemetry Inspection)**
- ⚡ **สั่งการอุปกรณ์แทนคุณ (Agentic Auto-Pilot)**

${isJarvis ? 'ท่านต้องการให้ผมเริ่มจำลอง หรือตรวจสอบพารามิเตอร์ส่วนใดก่อนดีครับท่าน?' : 'อาจารย์อยากให้ผมช่วยอะไรในการทดลองนี้ก่อนดีเน้อ?'}`;
    appendBotMessage(welcome);
  }

  function handleSend() {
    unlockAudioContext();
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendUserMessage(text);
  }

  function sendUserMessage(text) {
    unlockAudioContext();
    openChat();
    appendUserMessage(text);

    setMood('thinking');
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const response = generateDeepxAIResponse(text);
      appendBotMessage(response.content, response.actionFeedback);
      speakBotVoice(response.speechText || response.content);
    }, 850);
  }

  function formatPersonaText(content, speechText) {
    if (currentPersona === 'jarvis') {
      const adaptedContent = content
        .replace(/เน้อครับเน้อ/g, 'ครับท่าน')
        .replace(/เน้ออาจารย์/g, 'ครับท่าน')
        .replace(/อาจารย์/g, 'ท่าน')
        .replace(/เน้อ!/g, 'ครับท่าน!')
        .replace(/เน้อ\?/g, 'ครับท่าน?')
        .replace(/เน้อ/g, 'ครับ')
        .replace(/จัดให้ตามคำขอ/g, 'รับทราบและดำเนินการให้ทันทีครับท่าน')
        .replace(/ไอเดียแจ่มมาก/g, 'ข้อเสนอแนะยอดเยี่ยมมากครับท่าน');

      const adaptedSpeech = (speechText || content)
        .replace(/เน้อครับเน้อ/g, 'ครับท่าน')
        .replace(/เน้ออาจารย์/g, 'ครับท่าน')
        .replace(/อาจารย์/g, 'ท่าน')
        .replace(/เน้อ!/g, 'ครับท่าน')
        .replace(/เน้อ/g, 'ครับ');

      return {
        content: adaptedContent,
        speechText: adaptedSpeech
      };
    }
    return {
      content: content,
      speechText: speechText || content
    };
  }

  function generateDeepxAIResponse(prompt) {
    const text = prompt.toLowerCase();
    const activeExpId = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperimentId() : 'elec_hex_loop';
    const activeExp = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperiment() : null;
    const currentLab = LAB_KNOWLEDGE[activeExpId] || LAB_KNOWLEDGE.elec_hex_loop;
    const isJarvis = (currentPersona === 'jarvis');

    // 0. Persona Switch intent via Natural Chat!
    if (text.includes('จาวิส') || text.includes('jarvis') || text.includes('ไอรอนแมน') || text.includes('iron man')) {
      currentPersona = 'jarvis';
      applyPersonaUI();
      playJarvisChime();
      return {
        content: `**J.A.R.V.I.S. Protocol Engaged.**\n\nสวัสดีครับท่าน ระบบปัญญาประดิษฐ์ J.A.R.V.I.S. (Just A Rather Very Intelligent System) ในโปรโตคอล Mr. Deep_xAI เปิดใช้งานเต็มพิกัดแล้วครับท่าน ระบบเสียงสตูดิโอ HD พร้อมฟิลเตอร์ HUD Hologram และอัลกอริทึมวิเคราะห์ฟิสิกส์ออนไลน์ 100% แล้วครับ (At your service, sir)\n\nท่านต้องการให้ผมตรวจสอบพารามิเตอร์ หรือดำเนินการจำลองส่วนใดก่อนดีครับท่าน?`,
        speechText: `สวัสดีครับท่าน ระบบจาวิสเปิดใช้งานเต็มพิกัดแล้วครับ ยินดีรับใช้ครับท่าน แอด ยัวร์ เซอร์วิส เซอร์`,
        actionFeedback: `⚡ J.A.R.V.I.S. Protocol Online`
      };
    }

    if (text.includes('สุโขทัย') || text.includes('เสียงเน้อ') || text.includes('คนสุโขทัย')) {
      currentPersona = 'sukhothai';
      applyPersonaUI();
      return {
        content: `สลับมาเป็นโหมดหนุ่มสุโขทัยเรียบร้อยแล้วเน้ออาจารย์! พูดคุยด้วยเสียงเน้อๆ อบอุ่นเป็นกันเอง มีอะไรให้ช่วยในการทดลองบอกผมได้เลยเน้อครับเน้อ!`,
        speechText: `สลับมาเป็นโหมดหนุ่มสุโขทัยเรียบร้อยแล้วเน้ออาจารย์ มีอะไรให้ช่วยบอกผมได้เลยเน้อ`,
        actionFeedback: `🌾 โหมดหนุ่มสุโขทัย Online`
      };
    }

    // 1. Check for lab switching intent
    const switchIntent = detectSwitchLabIntent(text);
    if (switchIntent) {
      if (window.PhysicsLabRegistry) {
        window.PhysicsLabRegistry.switchExperiment(switchIntent.id);
      }
      setMood('excited');
      return formatPersonaText(
        `จัดให้ตามคำขอเน้อ! ผมสลับห้องทดลองไปยัง **${switchIntent.name}** ให้เรียบร้อยแล้วเน้อ\n\n📌 **สูตรสำคัญ:**\n${switchIntent.formula}\n\n💡 **คำแนะนำจาก AI Copilot:**\n${switchIntent.tips}`,
        `จัดให้ตามคำขอเน้อ สลับห้องทดลองไปยัง ${switchIntent.name} ให้เรียบร้อยแล้วเน้ออาจารย์`
      );
    }

    // 2. Telemetry Inspection
    if (text.includes('ตรวจสอบ') || text.includes('สถานะ') || text.includes('ค่าปัจจุบัน') || text.includes('อ่านค่า') || text.includes('telemetry')) {
      const stateSummary = inspectCurrentLabState(activeExpId);
      setMood('excited');
      return formatPersonaText(
        `นี่คือผลการตรวจสอบค่า Telemetry จริงจากอุปกรณ์ในแล็บเน้ออาจารย์:\n\n${stateSummary}\n\nทุกระบบทำงานปกติ สัญญาณนิ่งมากเน้ออาจารย์!`,
        `ตรวจสอบค่าปัจจุบันในห้องทดลองให้เรียบร้อยแล้วเน้อ ทุกระบบทำงานปกติ สัญญาณนิ่งมากเน้ออาจารย์`
      );
    }

    // 3. Auto-Pilot Actions
    if (text.includes('ดำเนินการ') || text.includes('แทนฉัน') || text.includes('กด') || text.includes('สับสวิตช์') || text.includes('auto') || text.includes('ปล่อย')) {
      const actionResult = triggerLabAction(activeExpId);
      setMood('excited');
      const ack = (PERSONA_DATA[currentPersona] || PERSONA_DATA.jarvis).phrases.ack;
      return formatPersonaText(
        `${ack}\n\n${actionResult.message}\n\nเรียบร้อยแล้วเน้ออาจารย์ ลองดูผลการตอบสนองที่หน้าปัดและกราฟ 3D ได้เลยเน้อ!`,
        `ดำเนินการให้เรียบร้อยแล้วเน้ออาจารย์ ลองดูผลที่หน้าปัดและกราฟได้เลยเน้อ`
      );
    }

    // 4. Formula Explanation
    if (text.includes('สูตร') || text.includes('คำนวณ') || text.includes('ทฤษฎี') || text.includes('สมการ')) {
      setMood('speaking');
      return formatPersonaText(
        `สำหรับปฏิบัติการ **${currentLab.name}** มีสูตรและหลักคิดสำคัญดังนี้เน้อ:\n\n${currentLab.formula}\n\n💡 **เทคนิคการคำนวณและทริค:**\n${currentLab.tips}\n\nเข้าใจง่ายไหมเน้ออาจารย์ ถ้าอยากให้ผมช่วยคำนวณตัวเลขไหน บอกมาได้เลยเน้อ!`,
        `สำหรับแล็บ ${currentLab.name} มีสูตรหลักและหลักคิดสำคัญตามนี้เน้อ เข้าใจง่ายมากๆ เน้ออาจารย์`
      );
    }

    // 5. Co-creation & Hypothesis Design
    if (text.includes('ร่วมคิด') || text.includes('co-creation') || text.includes('ออกแบบ') || text.includes('สมมติฐาน') || text.includes('วิจัย')) {
      setMood('excited');
      return formatPersonaText(
        `ไอเดียแจ่มมากเน้ออาจารย์! ในการทำ Co-creation สำหรับแล็บ **${currentLab.name}** ผมขอเสนอแนวทางดังนี้เน้อ:
1. **การตั้งสมมติฐานใหม่:** ลองปรับตัวแปรต้นเพื่อสังเกตผลกระทบแบบ Non-linear
2. **การลดความคลาดเคลื่อน (Systematic Error):** ตรวจสอบจุดต่อสายไฟและระยะศูนย์ของอุปกรณ์
3. **การประยุกต์สู่เทคโนโลยีจริง:** นำสมการของแล็บนี้ไปเชื่อมโยงกับเซ็นเซอร์ IoT และปัญญาประดิษฐ์ Edge AI เน้อ!

อาจารย์ชอบแนวทางไหนเป็นพิเศษเน้อ เดี๋ยวเราลุยต่อยอดด้วยกันเลยเน้อ!`,
        `ไอเดียแจ่มมากเน้ออาจารย์ ผมเสนอแนวคิดการร่วมสร้างสรรค์ทั้งสามข้อ ลองพิจารณาดูเน้อ`
      );
    }

    // 6. Physics Quiz
    if (text.includes('quiz') || text.includes('คำถาม') || text.includes('ทดสอบ') || text.includes('ทาย')) {
      const quiz = generateLabQuiz(activeExpId);
      setMood('speaking');
      return formatPersonaText(
        `มาทดสอบความเข้าใจกันหน่อยเน้ออาจารย์!\n\n${quiz.question}\n\nก) ${quiz.optA}\nข) ${quiz.optB}\nค) ${quiz.optC}\nง) ${quiz.optD}\n\nลองตอบมาดูเน้อว่าข้อไหนถูก!`,
        `มาทดสอบความเข้าใจกันหน่อยเน้ออาจารย์ ลองทายดูว่าข้อไหนถูกต้องเน้อ`
      );
    }

    // 7. General Lab Guidance (Default)
    setMood('speaking');
    return formatPersonaText(
      `เกี่ยวกับปฏิบัติการ **${currentLab.name}** เน้ออาจารย์:\n\n${currentLab.tips}\n\n📌 **สมการที่ใช้:**\n${currentLab.formula}\n\nต้องการให้ผมช่วยกดสั่งการอุปกรณ์ สแกนภาพฉาก 3D หรืออธิบายขั้นตอนตรงไหนเพิ่มเติม บอกผมได้เลยเน้อครับเน้อ!`,
      `เกี่ยวกับแล็บนี้ มีรายละเอียดและสูตรสำคัญตามนี้เน้ออาจารย์ มีอะไรให้ช่วยบอกได้เลยเน้อ`
    );
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
    togglePersona,
    setPersona,
    playJarvisChime,
    speakBotVoice,
    captureSceneVision,
    handleImageUpload,
    handleSend,
    sendUserMessage,
    setMood,
    speakSukhothaiVoice,
    playStudioBase64Audio,
    unlockAudioContext
  };

})();
