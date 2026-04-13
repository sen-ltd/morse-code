/**
 * Main application logic for Morse Code Translator
 * Handles: DOM interaction, Web Audio playback, visual indicator, tap input, flash mode
 */

import { textToMorse, morseToText, playbackSequence } from './morse.js';
import { t, translations } from './i18n.js';

// ─── State ────────────────────────────────────────────────────────────────────

let lang = localStorage.getItem('morse-lang') || 'en';
let wpm = parseInt(localStorage.getItem('morse-wpm') || '20', 10);
let isPlaying = false;
let playbackTimer = null;
let tapStart = null;
let tapBuffer = []; // array of '.' or '-'
let audioCtx = null;
let flashActive = false;
let flashScheduled = [];

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const textInput = document.getElementById('text-input');
const morseOutput = document.getElementById('morse-output');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const wpmSlider = document.getElementById('wpm-slider');
const wpmValue = document.getElementById('wpm-value');
const visualIndicator = document.getElementById('visual-indicator');
const visualSymbol = document.getElementById('visual-symbol');
const tapModeBtn = document.getElementById('tap-mode-btn');
const tapArea = document.getElementById('tap-area');
const tapDisplay = document.getElementById('tap-display');
const tapDoneBtn = document.getElementById('tap-done-btn');
const tapClearBtn = document.getElementById('tap-clear-btn');
const flashModeBtn = document.getElementById('flash-mode-btn');
const flashOverlay = document.getElementById('flash-overlay');
const langToggle = document.getElementById('lang-toggle');
const copyMorseBtn = document.getElementById('copy-morse-btn');
const swapBtn = document.getElementById('swap-btn');
const morseInput = document.getElementById('morse-input');

// ─── i18n ─────────────────────────────────────────────────────────────────────

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(lang, key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(lang, el.dataset.i18nPlaceholder);
  });
  document.documentElement.lang = lang;
  localStorage.setItem('morse-lang', lang);
}

langToggle.addEventListener('click', () => {
  lang = lang === 'en' ? 'ja' : 'en';
  applyLang();
});

// ─── WPM Slider ───────────────────────────────────────────────────────────────

wpmSlider.value = wpm;
wpmValue.textContent = wpm;
wpmSlider.addEventListener('input', () => {
  wpm = parseInt(wpmSlider.value, 10);
  wpmValue.textContent = wpm;
  localStorage.setItem('morse-wpm', wpm);
});

// ─── Text → Morse conversion ──────────────────────────────────────────────────

function syncTextToMorse() {
  const text = textInput.value;
  morseOutput.value = text ? textToMorse(text) : '';
}

function syncMorseToText() {
  const morse = morseInput.value;
  textInput.value = morse ? morseToText(morse) : '';
}

textInput.addEventListener('input', syncTextToMorse);
morseInput.addEventListener('input', syncMorseToText);

// ─── Audio context (lazy init) ────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ─── Playback ─────────────────────────────────────────────────────────────────

function stopPlayback() {
  isPlaying = false;
  flashScheduled.forEach(id => clearTimeout(id));
  flashScheduled = [];
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  visualIndicator.classList.remove('on');
  visualSymbol.textContent = '';
  if (flashActive) {
    flashOverlay.classList.remove('active');
  }
  playBtn.disabled = false;
  stopBtn.disabled = true;
}

function schedulePlayback(seq) {
  let t = 0;
  const ids = [];

  seq.forEach(({ on, duration }) => {
    const tStart = t;
    const tEnd = t + duration;

    const startId = setTimeout(() => {
      if (on) {
        visualIndicator.classList.add('on');
        // Determine symbol type for display
        const unit = 1200 / wpm;
        visualSymbol.textContent = duration > unit * 2 ? '—' : '·';
        if (flashActive) flashOverlay.classList.add('active');
      } else {
        visualIndicator.classList.remove('on');
        visualSymbol.textContent = '';
        if (flashActive) flashOverlay.classList.remove('active');
      }
    }, tStart);
    ids.push(startId);

    t = tEnd;
  });

  // Done
  const doneId = setTimeout(() => {
    stopPlayback();
  }, t + 100);
  ids.push(doneId);

  flashScheduled = ids;
}

function scheduleAudio(seq) {
  const ctx = getAudioCtx();
  const baseTime = ctx.currentTime + 0.05;
  let offset = 0;

  seq.forEach(({ on, duration }) => {
    if (on) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600;
      osc.type = 'sine';

      const start = baseTime + offset / 1000;
      const end = start + duration / 1000;

      // Smooth envelope to avoid clicks
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.005);
      gain.gain.setValueAtTime(0.4, end - 0.005);
      gain.gain.linearRampToValueAtTime(0, end);

      osc.start(start);
      osc.stop(end);
    }
    offset += duration;
  });
}

playBtn.addEventListener('click', () => {
  const morse = morseOutput.value.trim() || morseInput.value.trim();
  if (!morse) return;

  if (isPlaying) stopPlayback();

  isPlaying = true;
  playBtn.disabled = true;
  stopBtn.disabled = false;

  const seq = playbackSequence(morse, wpm);
  scheduleAudio(seq);
  schedulePlayback(seq);
});

stopBtn.addEventListener('click', stopPlayback);

clearBtn.addEventListener('click', () => {
  stopPlayback();
  textInput.value = '';
  morseOutput.value = '';
  morseInput.value = '';
});

// ─── Copy Morse ───────────────────────────────────────────────────────────────

copyMorseBtn.addEventListener('click', async () => {
  const morse = morseOutput.value || morseInput.value;
  if (!morse) return;
  try {
    await navigator.clipboard.writeText(morse);
    const orig = copyMorseBtn.textContent;
    copyMorseBtn.textContent = t(lang, 'copiedToClipboard');
    setTimeout(() => { copyMorseBtn.textContent = orig; }, 1200);
  } catch {
    // Clipboard not available, silently ignore
  }
});

// ─── Swap (morse ↔ text direction) ───────────────────────────────────────────

swapBtn.addEventListener('click', () => {
  const textVal = textInput.value;
  const morseVal = morseOutput.value || morseInput.value;
  if (morseVal) {
    morseInput.value = morseVal;
    morseOutput.value = '';
    textInput.value = '';
    syncMorseToText();
  } else {
    syncTextToMorse();
  }
});

// ─── Tap Mode ─────────────────────────────────────────────────────────────────

const DOT_THRESHOLD = 250; // ms — shorter than this = dot

tapModeBtn.addEventListener('click', () => {
  const panel = document.getElementById('tap-panel');
  panel.classList.toggle('hidden');
  tapBuffer = [];
  updateTapDisplay();
});

function updateTapDisplay() {
  tapDisplay.textContent = tapBuffer.join(' ') || '—';
}

// Tap area: mousedown/mouseup and touchstart/touchend
function onTapStart(e) {
  e.preventDefault();
  tapStart = Date.now();
  tapArea.classList.add('active');
}

function onTapEnd(e) {
  e.preventDefault();
  if (tapStart === null) return;
  const duration = Date.now() - tapStart;
  tapStart = null;
  tapArea.classList.remove('active');
  const symbol = duration < DOT_THRESHOLD ? '.' : '-';
  tapBuffer.push(symbol);
  updateTapDisplay();
}

tapArea.addEventListener('mousedown', onTapStart);
tapArea.addEventListener('mouseup', onTapEnd);
tapArea.addEventListener('touchstart', onTapStart, { passive: false });
tapArea.addEventListener('touchend', onTapEnd, { passive: false });

tapDoneBtn.addEventListener('click', () => {
  const morseStr = tapBuffer.join('');
  if (morseStr) {
    // Append to morse input
    const existing = morseInput.value.trim();
    morseInput.value = existing ? existing + ' ' + morseStr : morseStr;
    syncMorseToText();
  }
  tapBuffer = [];
  updateTapDisplay();
});

tapClearBtn.addEventListener('click', () => {
  tapBuffer = [];
  updateTapDisplay();
});

// ─── Flash Mode ───────────────────────────────────────────────────────────────

flashModeBtn.addEventListener('click', () => {
  flashActive = !flashActive;
  flashModeBtn.classList.toggle('active', flashActive);
  flashOverlay.classList.toggle('hidden', !flashActive);
  if (!flashActive) {
    flashOverlay.classList.remove('active');
  }
});

// Click flash overlay to dismiss
flashOverlay.addEventListener('click', () => {
  flashActive = false;
  flashModeBtn.classList.remove('active');
  flashOverlay.classList.add('hidden');
  flashOverlay.classList.remove('active');
  if (isPlaying) stopPlayback();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

stopBtn.disabled = true;
applyLang();
