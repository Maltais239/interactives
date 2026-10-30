# Dímelo — Spanish language journal

A buildless, browser-local Spanish practice app. No account or API key is needed.

Live app: https://maltais239.github.io/interactives/dimelo/

Open this folder through an HTTP server or GitHub Pages; JavaScript modules do not load reliably from a file:// URL.

## Included

- Complete mapping of Darren’s Coffee Break episode 1–8 notes; episode 9 is cumulative review. Original spellings remain available in the coverage audit.
- Whole phrases, component words, useful conversation helpers, and travel vocabulary.
- All numbers 0–100, tens, hundreds, generated mixed amounts, thousands and amounts up to one million. Spoken prices are whole Mexican pesos.
- Learning steps, recall, recognition, listening, sentence building, and bounded guided conversations.
- Separate per-skill progress and spaced review. Same-day repeats do not establish delayed retention; supported answers do not count as independent successes.
- Browser speech synthesis, optional speech recognition, voice and speed controls.
- Local saving, JSON backup import/export, and adding later vocabulary.

`content.js` holds the Spanish language pack, original-note mapping, number grammar, sentence tasks and lessons. `engine.js` contains answer checking, review scheduling, number parsing and conversation patterns. `audio.js` wraps optional browser audio features. `app.js` contains application behavior.

Run `npm test` (or `node --test tests/*.test.mjs`). The static assets are in this folder. No package installation or build is required.

Speech input depends on browser support and may use that browser’s remote recognition service. It captures words rather than evaluating accent quality. Guided conversations use reviewed response patterns; they are not unrestricted AI chat. Future language packs need their own vocabulary, grammar, number rules and conversations.

Research links are provided in Sound & settings. The methods are research-informed; the application has not undergone an efficacy trial.
