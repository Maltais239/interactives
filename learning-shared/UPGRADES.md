# October 2026 classroom upgrades

Existing launch URLs are preserved for `preassess`, `latitudelongitude`, `piratemapping` and `dinodig`. Three new credited Walker editions live under `walker-corner`.

## Editing

The three new games and Walker copies separate student interface (`index.html`), interaction (`app.js`) and pure learning logic/data (`engine.js`). Shared UI is in `learning-shared/studio.css` and `studio.js`.

- Number Studio: four independently tracked skills, five number ranges, 10-question rounds. Three consecutive independent outcomes increase the range; two supported outcomes in a three-question window decrease it. Invalid entries do not count. Range changes are heuristics for practice, not a diagnostic assessment. Progress, support use and up to 100 recent questions are stored locally. Teacher controls can fix the range. Visual grouping and feedback are informed by [IES practice-guide recommendations](https://ies.ed.gov/ncee/wwc/practiceguide/26).
- Coordinate Explorer: eight unique targets on 30°, 15° or 5° grids. Targets remain within ±60° latitude, avoiding unclickable polar points. Both map and coordinate-entry controls work. Feedback treats north/south and east/west independently, including the dateline.
- Pirate Mapping: five-treasure voyages in compass, three-stop route or grid-reference modes. Uses the original island/fox artwork. Clues remain fixed from the start of each stage. Arrow keys work when the map has focus; adjacent grid cells and direction buttons work with pointer/touch. Treasure transitions require an explicit Next action.
- STRATA: original eight localities and excavation foundation retained. Fixed shared map background, correct Early/Late Cretaceous context, gentler tool names, default sound off, keyboard-accessible clear-section button, preserved excavation masks on resize, local notes, observation/inference checks and comparison table. Re-bury repeats the excavation without losing existing notes/catalogue progress. Photo/reconstruction credits are in `dinodig/image-credits.html` and JSON. Reference specimens and approximate map pins are explicitly distinguished from exact individual finds.
- Walker editions: see `walker-corner/README.md` for original links and recovered source files. Function expressions never execute JavaScript; bridge values are labelled relative-unit classroom models; plural words include explicit exceptions/contrasts.

## Storage and verification

Only Number Studio, Bridge Test Lab and STRATA store local progress/notes. A fresh browser has a fresh record. Storage failure does not prevent play; download/print options provide a fallback. No student names, class records or account integration are requested.

Core verification covers thousands of generated math questions, adaptive boundaries, route replay, coordinate edge cases, arithmetic parsing, bridge challenge solvability and spelling contrasts. DOM tests cover finite rounds, duplicate answer guards, supported outcomes, local reloads, model trades, sorting and review rounds. Live desktop checks and screenshot refreshes supplement these; full device/accessibility audits are outside this batch.

When updating HTML/JS/CSS, change the `?v=` asset version for browser caches. The BGSD bank catalogue remains at `BlackGoldSchoolDivision/interactives/interactive-learning-lab/catalogue.json`; rebuild with `source/build.py` after updating descriptions and screenshot URLs.
