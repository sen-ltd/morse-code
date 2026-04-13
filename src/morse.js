/**
 * Morse code table and conversion logic (International Morse Code)
 * Timing follows PARIS standard: dot = 1 unit, dash = 3 units
 * intra-char gap = 1 unit, inter-char gap = 3 units, word gap = 7 units
 * At WPM n: 1 unit = 1200 / n ms
 */

export const MORSE_TABLE = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
  '@': '.--.-.',
};

// Build reverse table from morse → char
export const REVERSE_TABLE = Object.fromEntries(
  Object.entries(MORSE_TABLE).map(([char, morse]) => [morse, char])
);

/**
 * Convert text to morse code string.
 * Letters are separated by spaces, words by ' / '.
 * Unknown characters are skipped.
 * @param {string} text
 * @returns {string}
 */
export function textToMorse(text) {
  const words = text.trim().toUpperCase().split(/\s+/);
  const morseWords = words.map(word => {
    const letters = word.split('').filter(c => MORSE_TABLE[c] !== undefined);
    return letters.map(c => MORSE_TABLE[c]).join(' ');
  }).filter(w => w.length > 0);
  return morseWords.join(' / ');
}

/**
 * Convert morse code string to text.
 * Letters separated by spaces, words separated by ' / '.
 * @param {string} morse
 * @returns {string}
 */
export function morseToText(morse) {
  if (!morse.trim()) return '';
  const words = morse.trim().split(/\s*\/\s*/);
  return words.map(word => {
    const letters = word.trim().split(/\s+/);
    return letters.map(letter => {
      const ch = REVERSE_TABLE[letter.trim()];
      return ch !== undefined ? ch : '?';
    }).join('');
  }).join(' ');
}

/**
 * Calculate total duration of a morse string at given WPM.
 * @param {string} morse - morse code string (output of textToMorse)
 * @param {number} wpm
 * @returns {number} duration in seconds
 */
export function getDuration(morse, wpm) {
  const seq = playbackSequence(morse, wpm);
  return seq.reduce((sum, s) => sum + s.duration, 0) / 1000;
}

/**
 * Generate a playback sequence for the given morse string.
 * Each element: { on: boolean, duration: number (ms) }
 * @param {string} morse - morse code string (output of textToMorse)
 * @param {number} wpm
 * @returns {Array<{on: boolean, duration: number}>}
 */
export function playbackSequence(morse, wpm) {
  const unit = 1200 / wpm; // ms per unit
  const seq = [];

  // Split into word groups
  const words = morse.trim().split(/\s*\/\s*/);
  words.forEach((word, wordIdx) => {
    const letters = word.trim().split(/\s+/).filter(l => l.length > 0);
    letters.forEach((letter, letterIdx) => {
      const symbols = letter.split('');
      symbols.forEach((sym, symIdx) => {
        if (sym === '.') {
          seq.push({ on: true, duration: unit });
        } else if (sym === '-') {
          seq.push({ on: true, duration: 3 * unit });
        }
        // Intra-character gap (after each symbol except the last in a letter)
        if (symIdx < symbols.length - 1) {
          seq.push({ on: false, duration: unit });
        }
      });
      // Inter-character gap or word gap
      if (letterIdx < letters.length - 1) {
        // 3 units inter-char gap (already have 0 at end, add 3 total)
        seq.push({ on: false, duration: 3 * unit });
      } else if (wordIdx < words.length - 1) {
        // 7 units word gap
        seq.push({ on: false, duration: 7 * unit });
      }
    });
  });

  return seq;
}
