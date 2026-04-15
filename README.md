# Morse Code Translator

A Morse code translator with Web Audio playback. Zero dependencies, no build step.

**Live demo**: https://sen.ltd/portfolio/morse-code/

## Features

- **Text ↔ Morse** conversion (International Morse Code)
- **Audio playback** via Web Audio API at configurable WPM (5–40)
- **Visual indicator** — lit dot/dash display during playback
- **WPM slider** — adjustable words per minute
- **Tap-to-input** — hold for dash, short press for dot
- **Flash mode** — full-screen white flash for distant signaling
- **Morse reference table** — all 26 letters, digits, punctuation
- **Japanese/English UI**
- Dark nautical theme, mobile-friendly

## Supported Characters

Letters A–Z, digits 0–9, and punctuation: `. , ? ! / ( ) & : ; = + - _ " $ @`

## Morse Timing (PARIS standard)

| Element | Duration |
|---|---|
| Dot | 1 unit |
| Dash | 3 units |
| Intra-character gap | 1 unit |
| Inter-character gap | 3 units |
| Word gap | 7 units |
| 1 unit at 20 WPM | 60 ms |

## Usage

```sh
# Serve locally
npm run serve
# → http://localhost:8080

# Run tests
npm test
```

## Project Structure

```
morse-code/
├── index.html        # Single-page app
├── style.css         # Nautical dark theme
├── src/
│   ├── morse.js      # Morse table + conversion + playback sequencing
│   ├── main.js       # DOM, Web Audio, UI logic
│   └── i18n.js       # ja/en translations
├── tests/
│   └── morse.test.js # 40+ unit tests
└── assets/           # Screenshots
```

## License

MIT © 2026 SEN LLC (SEN 合同会社)

<!-- sen-publish:links -->
## Links

- 🌐 Demo: https://sen.ltd/portfolio/morse-code/
- 📝 dev.to: https://dev.to/sendotltd/a-morse-code-translator-with-web-audio-playback-and-paris-standard-timing-3b4l
<!-- /sen-publish:links -->
