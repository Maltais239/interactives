# Sound, Structure, Spell — Word-work studio

An accessible, static classroom app adapted from **Dr. Shelley Blackwell, SLP.D's 2025 _Sound, Structure, Spell: Exploring Phonics Pathways and Morphology Rules_** student workbook and teacher manual.

## Student experience

- 11 topics, 29 practice days, and 145 lesson activities, all available without unlocking.
- 895 word-bank entries across vowel–consonant–e; final /k/, /j/, and /ch/; sounds of c and g; vowel teams; past tense; plurals; -ing; and -ly.
- Pattern discovery with examples, explanations, rule checks, and notes.
- Word sorting, 105 explicit sound maps followed by whole-word spelling, analogies with answer choices, word sums, suffix building, and parts of speech.
- Sentence dictation with spelling feedback and original writing saved for discussion with a teacher or partner.
- Selectable mixed review and a searchable, filterable word bank with extra practice.
- Browser speech with adjustable speed, replay, and optional automatic reading. A Show word/model control supports adult-led practice when voices are unavailable.
- Browser-local progress, in-progress answers, writing, completed activities, and practice logs; JSON export/import for device or learner transfers; CSV log and printable progress report.
- Responsive layouts, keyboard controls, labelled inputs, 44px minimum primary controls, reduced-motion support, and no browser-zoom restriction.

## Instructional use

Use alongside guided discussion. Ask students to explain why a spelling makes sense, even after a correct response. Move from focused practice to mixed retrieval and connected writing. The app does not assess the meaning or grammar of students' original writing or explanations.

Each phonics topic has three daily practice sets with five new sound-map targets per day and different sorting samples. Analogy practice is repeated to support retrieval. Each suffix topic has two practice days, with reusable word sums and building exercises. The full word bank supports additional practice.

Sound maps group a spelling by sound, including digraphs and split vowel spellings such as **a…e**. The final e in cage can also soften g; it is not duplicated in a second box. Sorts for c and g highlight the **first** instance of that letter so words containing more than one sound have an explicit target.

## Source attribution and corrections

The author permits educational sharing and requests that the work not be altered and sold. This free educational adaptation retains that attribution and request. It is not an official app or endorsement. Please do not sell the adapted materials. No broader software or content licence is asserted.

All 11 topics and the activity types are represented. Blank reusable worksheet pages are implemented as repeatable practice and the full word bank. The instructor's resource/reference pages inform teacher notes rather than appearing as student exercises. PDF page positions for each topic are included in the app's teacher notes.

The adaptation corrects inconsistent source examples and overgeneralizations, including:

- **muck/neck** use ck; **unhinge** uses ge.
- **slide → slid** is irregular, not an ed example.
- Consonant + y and vowel + y require different treatment before ed/es.
- Consonant doubling considers final-syllable stress and excludes w/x/y.
- **-ly** is derivational; brotherly/ghostly are adjectives, while quickly is an adverb.
- **quiz → quizzes** includes a doubled z.
- Some ambiguous analogies are replaced; displayed answer options make the intended spelling contrast explicit.

## Privacy and persistence

The app has no accounts, analytics, recording, or student-data backend. Work is saved in the current browser profile; students sharing that profile share its progress. Use export/import to switch learners or devices. Import asks before replacing existing progress. An exported file contains practice answers and writing; handle it as student work.

Speech uses the browser/device's speech service. Depending on the selected voice, that service may use a network connection. The optional Nunito font is loaded from Google Fonts; local fallback fonts keep the app usable when unavailable. This is a static app, not a cloud-synced gradebook.

## Files and local preview

`index.html`, `style.css`, `data.js`, and `app.js` run on static hosting, including GitHub Pages. No build step or package installation is required. `package.json` and `dev-server.cjs` are optional local development conveniences.

```sh
npm run dev
npm test
```

Open the printed local URL. For direct filesystem use, open `index.html`; browser storage and speech support can vary under file URLs.

## Validation

The content regression test checks all topic banks, explicit grapheme maps, category coverage, important exception answers, word-building keys, and spelling/sum/sentence matching. Browser checks exercised corrective sorting feedback; mapping followed by spelling; analogies; a completed seven-word sum activity; suffix building and parts of speech; dictation and saved writing; reload persistence; JSON export/import; mixed review; and word-bank controls.

Responsive checks cover 1366×650, 1024×540, 768×900, 390×667, 320×568, and 640×360, including live resizing with an unfinished answer and 150% text. Long lessons and narrow screens can scroll; the app does not hide essential controls to force a fixed screen height.
