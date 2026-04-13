/**
 * Internationalization strings for Morse Code Translator
 */

export const translations = {
  en: {
    title: 'Morse Code Translator',
    subtitle: 'Text ↔ Morse · Web Audio Playback',
    textLabel: 'Text',
    morseLabel: 'Morse Code',
    textPlaceholder: 'Type text here...',
    morsePlaceholder: '... --- ...',
    playBtn: 'Play',
    stopBtn: 'Stop',
    clearBtn: 'Clear',
    wpmLabel: 'WPM',
    tapMode: 'Tap to Input',
    flashMode: 'Flash Mode',
    tapHint: 'Hold for dash (—), tap for dot (·)',
    tapStart: 'Hold / Tap',
    tapDone: 'Done',
    tapClear: 'Clear',
    flashHint: 'Screen flashes morse code (for distant signaling)',
    unknownChars: 'Unknown characters skipped',
    morseRef: 'Morse Reference',
    langToggle: '日本語',
    copiedToClipboard: 'Copied!',
    copyMorse: 'Copy',
    swapBtn: '⇅',
  },
  ja: {
    title: 'モールス信号変換',
    subtitle: 'テキスト ↔ モールス · Web Audio 再生',
    textLabel: 'テキスト',
    morseLabel: 'モールス信号',
    textPlaceholder: 'テキストを入力...',
    morsePlaceholder: '... --- ...',
    playBtn: '再生',
    stopBtn: '停止',
    clearBtn: 'クリア',
    wpmLabel: 'WPM',
    tapMode: 'タップ入力',
    flashMode: 'フラッシュモード',
    tapHint: '長押し → ダッシュ (—)、短押し → ドット (·)',
    tapStart: '長押し / タップ',
    tapDone: '完了',
    tapClear: 'クリア',
    flashHint: '画面フラッシュで遠距離信号送信',
    unknownChars: '不明な文字はスキップされます',
    morseRef: 'モールス対応表',
    langToggle: 'English',
    copiedToClipboard: 'コピー完了!',
    copyMorse: 'コピー',
    swapBtn: '⇅',
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
