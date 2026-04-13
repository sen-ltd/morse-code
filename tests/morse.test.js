/**
 * Tests for morse.js
 * Run with: node --test tests/morse.test.js
 */

import { strict as assert } from 'assert';
import { describe, it } from 'node:test';
import {
  MORSE_TABLE,
  REVERSE_TABLE,
  textToMorse,
  morseToText,
  getDuration,
  playbackSequence,
} from '../src/morse.js';

// ─── MORSE_TABLE / REVERSE_TABLE ─────────────────────────────────────────────

describe('MORSE_TABLE', () => {
  it('contains all 26 letters', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (const ch of letters) {
      assert.ok(MORSE_TABLE[ch], `Missing letter: ${ch}`);
    }
  });

  it('contains all 10 digits', () => {
    for (let i = 0; i <= 9; i++) {
      assert.ok(MORSE_TABLE[String(i)], `Missing digit: ${i}`);
    }
  });

  it('A is .-', () => assert.equal(MORSE_TABLE['A'], '.-'));
  it('S is ...', () => assert.equal(MORSE_TABLE['S'], '...'));
  it('O is ---', () => assert.equal(MORSE_TABLE['O'], '---'));
  it('0 is -----', () => assert.equal(MORSE_TABLE['0'], '-----'));
  it('. (period) is .-.-.-', () => assert.equal(MORSE_TABLE['.'], '.-.-.-'));
  it('@ is .--.-.', () => assert.equal(MORSE_TABLE['@'], '.--.-.' ));
});

describe('REVERSE_TABLE', () => {
  it('.- maps to A', () => assert.equal(REVERSE_TABLE['.-'], 'A'));
  it('... maps to S', () => assert.equal(REVERSE_TABLE['...'], 'S'));
  it('--- maps to O', () => assert.equal(REVERSE_TABLE['---'], 'O'));
  it('----- maps to 0', () => assert.equal(REVERSE_TABLE['-----'], '0'));
  it('has no undefined values', () => {
    for (const [, val] of Object.entries(REVERSE_TABLE)) {
      assert.notEqual(val, undefined);
    }
  });
});

// ─── textToMorse ─────────────────────────────────────────────────────────────

describe('textToMorse', () => {
  it('single letter E', () => {
    assert.equal(textToMorse('E'), '.');
  });

  it('single letter A', () => {
    assert.equal(textToMorse('A'), '.-');
  });

  it('converts SOS', () => {
    assert.equal(textToMorse('SOS'), '... --- ...');
  });

  it('converts lowercase input', () => {
    assert.equal(textToMorse('sos'), '... --- ...');
  });

  it('separates letters with spaces', () => {
    assert.equal(textToMorse('AB'), '.- -...');
  });

  it('separates words with /', () => {
    assert.equal(textToMorse('HI HO'), '.... .. / .... ---');
  });

  it('handles numbers', () => {
    assert.equal(textToMorse('5'), '.....');
  });

  it('handles mixed alphanumeric', () => {
    const result = textToMorse('A1');
    assert.equal(result, '.- .----');
  });

  it('handles period', () => {
    assert.equal(textToMorse('.'), '.-.-.-');
  });

  it('skips unknown characters', () => {
    // Japanese characters should be skipped
    const result = textToMorse('Aあ');
    assert.equal(result, '.-');
  });

  it('skips spaces only between words', () => {
    const result = textToMorse('A B');
    assert.equal(result, '.- / -...');
  });

  it('handles multiple spaces between words', () => {
    const result = textToMorse('A  B');
    // Multiple spaces treated as word boundary
    assert.equal(result, '.- / -...');
  });

  it('trims leading/trailing whitespace', () => {
    assert.equal(textToMorse('  SOS  '), '... --- ...');
  });

  it('handles empty string', () => {
    assert.equal(textToMorse(''), '');
  });

  it('handles punctuation @', () => {
    assert.equal(textToMorse('@'), '.--.-.');
  });
});

// ─── morseToText ─────────────────────────────────────────────────────────────

describe('morseToText', () => {
  it('converts . to E', () => {
    assert.equal(morseToText('.'), 'E');
  });

  it('converts ... --- ... to SOS', () => {
    assert.equal(morseToText('... --- ...'), 'SOS');
  });

  it('handles word separator /', () => {
    assert.equal(morseToText('.... .. / .... ---'), 'HI HO');
  });

  it('unknown morse gives ?', () => {
    assert.equal(morseToText('......'), '?');
  });

  it('handles empty string', () => {
    assert.equal(morseToText(''), '');
  });

  it('handles whitespace around /', () => {
    assert.equal(morseToText('.- / -...'), 'A B');
  });
});

// ─── Round-trip ───────────────────────────────────────────────────────────────

describe('round-trip', () => {
  it('SOS round trip', () => {
    assert.equal(morseToText(textToMorse('SOS')), 'SOS');
  });

  it('HELLO WORLD round trip', () => {
    assert.equal(morseToText(textToMorse('HELLO WORLD')), 'HELLO WORLD');
  });

  it('numeric string round trip', () => {
    assert.equal(morseToText(textToMorse('12345')), '12345');
  });

  it('mixed alphanumeric round trip', () => {
    assert.equal(morseToText(textToMorse('TEST123')), 'TEST123');
  });
});

// ─── getDuration ─────────────────────────────────────────────────────────────

describe('getDuration', () => {
  it('single dot at 20 WPM = 60ms = 0.06s', () => {
    const unit = 1200 / 20; // 60 ms
    const result = getDuration('.', 20);
    assert.equal(result, unit / 1000);
  });

  it('single dash at 20 WPM = 180ms = 0.18s', () => {
    const unit = 1200 / 20;
    const result = getDuration('-', 20);
    assert.equal(result, (3 * unit) / 1000);
  });

  it('duration scales with WPM', () => {
    const d10 = getDuration('...', 10);
    const d20 = getDuration('...', 20);
    assert.ok(Math.abs(d10 - d20 * 2) < 0.001, `${d10} should be ~2x ${d20}`);
  });

  it('duration is positive for non-empty morse', () => {
    assert.ok(getDuration('... --- ...', 15) > 0);
  });
});

// ─── playbackSequence ─────────────────────────────────────────────────────────

describe('playbackSequence', () => {
  it('returns array', () => {
    const seq = playbackSequence('.', 20);
    assert.ok(Array.isArray(seq));
  });

  it('single dot: one on segment', () => {
    const seq = playbackSequence('.', 20);
    const onSegs = seq.filter(s => s.on);
    assert.equal(onSegs.length, 1);
  });

  it('dot duration is 1 unit', () => {
    const unit = 1200 / 20;
    const seq = playbackSequence('.', 20);
    const dot = seq.find(s => s.on);
    assert.equal(dot.duration, unit);
  });

  it('dash duration is 3 units', () => {
    const unit = 1200 / 20;
    const seq = playbackSequence('-', 20);
    const dash = seq.find(s => s.on);
    assert.equal(dash.duration, 3 * unit);
  });

  it('SOS has correct number of on segments (9)', () => {
    const seq = playbackSequence('... --- ...', 20);
    const onCount = seq.filter(s => s.on).length;
    assert.equal(onCount, 9); // 3 dots + 3 dashes + 3 dots
  });

  it('all durations are positive', () => {
    const seq = playbackSequence('... --- ...', 20);
    for (const s of seq) {
      assert.ok(s.duration > 0, `Expected positive duration, got ${s.duration}`);
    }
  });

  it('word gap is 7 units between words', () => {
    const unit = 1200 / 20;
    const seq = playbackSequence('. / .', 20);
    const offSegs = seq.filter(s => !s.on);
    const wordGap = offSegs.find(s => Math.abs(s.duration - 7 * unit) < 0.001);
    assert.ok(wordGap, 'Should have a 7-unit word gap');
  });

  it('empty morse returns empty array', () => {
    const seq = playbackSequence('', 20);
    assert.equal(seq.length, 0);
  });
});
