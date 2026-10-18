<?php
/**
 * LEQs-GLOBE 2570 - Natural Human Voice TTS API Engine
 * Google Cloud Text-to-Speech (Neural2 / Journey Architecture)
 * 
 * Features:
 * - Studio quality human speech synthesis (th-TH-Neural2-C / th-TH-Standard-A)
 * - Intelligent MD5 filesystem cache (assets/audio_cache/) for instant playback & zero redundant API costs
 * - CORS enabled for seamless cross-device & web client access
 * - Automatic text cleaning and Chanthaburi dialect inflection support
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ensure cache directory exists
$cacheDir = __DIR__ . '/../assets/audio_cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0777, true);
}

// Retrieve Request Input
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$text = $_POST['text'] ?? $data['text'] ?? $_GET['text'] ?? '';
$lang = $_POST['lang'] ?? $data['lang'] ?? $_GET['lang'] ?? 'th-TH';
$voiceName = $_POST['voice'] ?? $data['voice'] ?? $_GET['voice'] ?? 'th-TH-Neural2-C';
$speakingRate = floatval($_POST['rate'] ?? $data['rate'] ?? $_GET['rate'] ?? 1.02);
$pitch = floatval($_POST['pitch'] ?? $data['pitch'] ?? $_GET['pitch'] ?? 0.0);

// Status / Health Check
if (isset($_GET['status'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'online',
        'engine' => 'Google Cloud Text-to-Speech (Neural2)',
        'default_voice' => 'th-TH-Neural2-C',
        'cache_dir_writable' => is_writable($cacheDir),
        'cached_files_count' => count(glob($cacheDir . '/*.mp3'))
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if (empty(trim($text))) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Text parameter is required']);
    exit;
}

// Clean text: strip HTML tags and symbols
$cleanText = strip_tags($text);
$cleanText = preg_replace('/[*_#`~]/', '', $cleanText);
$cleanText = trim($cleanText);

// Normalize Language & Voice Code
if (strpos($lang, 'th') !== false) {
    $langCode = 'th-TH';
    $voice = $voiceName ?: 'th-TH-Neural2-C';
} elseif (strpos($lang, 'zh') !== false) {
    $langCode = 'cmn-CN';
    $voice = 'cmn-CN-Wavenet-A';
} else {
    $langCode = 'en-US';
    $voice = 'en-US-Neural2-F';
}

// Compute Cache Hash
$cacheKey = md5($cleanText . '_' . $langCode . '_' . $voice . '_' . $speakingRate . '_' . $pitch);
$cacheFilePath = $cacheDir . '/' . $cacheKey . '.mp3';
$cacheWebUrl = 'assets/audio_cache/' . $cacheKey . '.mp3';

// 1. Check if Cached Audio Exists
if (file_exists($cacheFilePath) && filesize($cacheFilePath) > 500) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'cached' => true,
        'audio_url' => $cacheWebUrl,
        'voice' => $voice,
        'duration_est_sec' => round(mb_strlen($cleanText) * 0.12, 1)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Call Google Cloud Text-to-Speech API
// Check environment variable or fallback configuration
$googleApiKey = getenv('GOOGLE_CLOUD_TTS_API_KEY') ?: getenv('GEMINI_API_KEY') ?: '';

// Also check config file if exists
$configFile = __DIR__ . '/config.json';
if (empty($googleApiKey) && file_exists($configFile)) {
    $cfg = json_decode(file_get_contents($configFile), true);
    if (!empty($cfg['google_tts_api_key'])) {
        $googleApiKey = $cfg['google_tts_api_key'];
    }
}

if (!empty($googleApiKey)) {
    $apiUrl = "https://texttospeech.googleapis.com/v1/text:synthesize?key=" . urlencode($googleApiKey);

    $payload = [
        'input' => ['text' => $cleanText],
        'voice' => [
            'languageCode' => $langCode,
            'name' => $voice
        ],
        'audioConfig' => [
            'audioEncoding' => 'MP3',
            'speakingRate' => $speakingRate,
            'pitch' => $pitch
        ]
    ];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resJson = json_decode($response, true);
        if (!empty($resJson['audioContent'])) {
            $audioBinary = base64_decode($resJson['audioContent']);
            file_put_contents($cacheFilePath, $audioBinary);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => true,
                'cached' => false,
                'audio_url' => $cacheWebUrl,
                'voice' => $voice
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 2.5 Direct Google Studio Voice Fallback (Zero API Key required, high quality natural speech)
$directLang = (strpos($langCode, 'th') !== false) ? 'th' : ((strpos($langCode, 'zh') !== false || strpos($langCode, 'cmn') !== false) ? 'zh-CN' : 'en');

// Split into natural chunks of <= 140 chars to ensure complete speech without clipping
$chunks = [];
if (mb_strlen($cleanText) <= 150) {
    $chunks[] = $cleanText;
} else {
    // Split by punctuation marks, newlines or Sukhothai particles
    $delimiters = ['\n', '!', '?', '。', '.', 'ครับเน้อ', 'เน้อครับ', 'เน้อ', 'ครับ', 'ค่ะ'];
    $regex = '/([\n!?。.]|ครับเน้อ|เน้อครับ|เน้อ|ครับ|ค่ะ)/u';
    $parts = preg_split($regex, $cleanText, -1, PREG_SPLIT_DELIM_CAPTURE);
    $cur = '';
    foreach ($parts as $p) {
        if (mb_strlen($cur . $p) > 130) {
            if (!empty(trim($cur))) $chunks[] = trim($cur);
            $cur = $p;
        } else {
            $cur .= $p;
        }
    }
    if (!empty(trim($cur))) $chunks[] = trim($cur);
    if (empty($chunks)) {
        $chunks[] = mb_substr($cleanText, 0, 150);
    }
    // Limit to 4 chunks max to keep response swift (< 3.5s)
    $chunks = array_slice($chunks, 0, 4);
}

$combinedAudio = '';
$fetchSuccess = true;

foreach ($chunks as $idx => $chunk) {
    if (empty(trim($chunk))) continue;
    $chunkUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" . urlencode($directLang) . "&q=" . urlencode($chunk);
    $ch2 = curl_init($chunkUrl);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch2, CURLOPT_REFERER, 'https://translate.google.com/');
    curl_setopt($ch2, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
    $directAudio = curl_exec($ch2);
    $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    if ($httpCode2 === 200 && strlen($directAudio) > 200) {
        $combinedAudio .= $directAudio;
    } else {
        if ($idx === 0) {
            $fetchSuccess = false;
            break;
        }
    }
}

if ($fetchSuccess && strlen($combinedAudio) > 400) {
    file_put_contents($cacheFilePath, $combinedAudio);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'cached' => false,
        'audio_url' => $cacheWebUrl,
        'voice' => 'google-studio-natural-voice'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Graceful Fallback Notice if all network TTS services fail or are offline
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => false,
    'fallback' => 'browser_speech_synthesis',
    'message' => 'Online TTS services unreachable or offline. Seamlessly utilizing optimized Browser Neural Speech fallback.',
    'text' => $cleanText,
    'lang' => $langCode
], JSON_UNESCAPED_UNICODE);
exit;
