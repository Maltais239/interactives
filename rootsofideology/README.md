# Roots of Ideology

An introductory classroom activity about individualism and collectivism: twelve values, six fictional policy decisions, a twelve-example sorting game, short primary-source excerpts, and a scaffolded argument builder.

Open `index.html` through an HTTP server or GitHub Pages. No API key or build step is required. Student choices and writing use browser local storage; Save project/Open project move work between browsers using JSON. Make it my own creates a standalone HTML containing the three illustrations, lesson data, styles and app code. Font requests are optional; the exported activity works offline with system fonts. Read aloud depends on installed browser voices.

## Files

- `index.html`: document shell, teacher guide and attribution context.
- `styles.css`: responsive layouts, keyboard focus and print styling.
- `data.js`: editable values, fictional scenarios, sorting examples and attributed historical excerpts.
- `app.js`: interactions, validation, local progress, accessible sorting, print and exports.
- `assets/community.webp`, `assets/school.webp`, `assets/market.webp`: generated editorial illustrations, each 900 × 600 pixels.
- `assets/image-prompts.json`: exact prompts and generation provenance. Created with the built-in ImageGen tool on 7 October 2026; these are fictional modern settings, not historical documents.
- `validation.json`: completed interaction, export and responsive checks.

The teaching guide identifies the Alberta Grade 8 draft context and links to the official curriculum overview and implementation timeline. It does not claim full-unit coverage. Policy decisions are not graded as politically correct; the summary describes the selected policies rather than assigning a student's ideology. Sorting answers classify the central action in each deliberately scoped example, with two combined examples.

Primary excerpts: Locke, *Second Treatise*, Chapter II §6; Rousseau, *The Social Contract*, Book I chapter VI (G. D. H. Cole translation); Mill, *On Liberty*, Chapter I. Each card links to its full source and marks explanations as interpretations.

When editing CSS or JavaScript, update asset version query strings in `index.html`. Preserve work during resizing and follow the repository's responsive design requirements.
