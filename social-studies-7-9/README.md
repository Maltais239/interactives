# Social Studies 7–9 — Interactive Activities

Drag-and-drop learning activities for the Alberta Social Studies 7–9 curriculum,
organized on a Bloom's / DOK ramp (simple recall → deeper analysis). Pure HTML/CSS/JS,
no build step, no dependencies. Works on phone, tablet, and desktop.

## Quick start (GitHub Pages)
1. Drop this whole folder into a repo (or a subfolder of your existing one).
2. Settings → Pages → deploy from branch → `/root` (or `/docs`).
3. Visit `index.html`. Done.

You can also just double-click `index.html` locally — everything runs offline
except the Google Fonts link (which degrades gracefully).

## Folder layout
```
index.html              ← the hub, auto-grouped by grade + DOK level
assets/
  styles.css            ← one shared stylesheet (grade colour themes inside)
  engine.js             ← one engine powers ALL activity types
grade-7/  grade-8/  grade-9/
  *.html                ← each activity = ~40 lines of DATA only
build.py                ← regenerates every page + the index from one list
```

## The point: adding an activity is trivial
Every activity is just a config object handed to the shared engine. To add one,
add a dict to `ACTIVITIES` in `build.py` and run `python3 build.py`. Five types:

| `type` | What it does | Maps to |
|--------|--------------|---------|
| `categorize` | drag items into labelled bins | DOK 1 — Remember |
| `match` | drag a term onto its definition | DOK 1–2 — Understand |
| `sequence` | order events on a timeline | DOK 2 — Apply |
| `compare` | A only / Both / B only (Venn) | DOK 2–3 — Analyze |
| `spectrum` | place along a continuum with labelled poles | DOK 3 — Analyze/Evaluate |

Minimal example:
```python
{
 "grade":7,"slug":"my-activity","tier":1,"dok":"DOK 1 · Sort",
 "type":"categorize","title":"My Activity","cat":"Systems",
 "subtitle":"Sort each item.",
 "categories":["Group A","Group B"],
 "items":[
   {"key":"a","label":"first thing","category":"Group A","emoji":"🍁","text":True},
   {"key":"b","label":"second thing","category":"Group B","emoji":"⚖️","text":True},
 ]
}
```
`text:True` makes a wide word-card; omit it (and keep `emoji`) for a square icon-card.

## What's built (22 activities)
**Grade 7 — Canada Since Confederation:** Confederation key terms (match) · Joining
Confederation timeline (sequence) · Tariffs vs Free Trade (sort) · Economy terms (match) ·
WWI & Sovereignty (match) · Discrimination & Steps Toward Equality (sort).

**Grade 8 — Ideologies & Systems:** Individualism vs Collectivism (sort) · Economic
Sectors (sort) · Four Economic Systems (sort) · Economic Spectrum (spectrum) · Three
Branches (sort) · Parliamentary vs Presidential (compare) · Totalitarian↔Anarchy
(spectrum) · Party Systems (sort).

**Grade 9 — Modern Canada:** Push & Pull Factors (sort) · Impacts of Urbanization (sort) ·
Canada on the World Stage (match) · WWII Contributions timeline (sequence) · How a Bill
Becomes Law (sequence) · Who Governs What? federal/provincial (sort) · Mixed Economy
public/private (sort) · Evolving Rights timeline (sequence).

## Roadmap — strong candidates not yet built
These map cleanly to curriculum outcomes and would slot right in:
- **G7:** Louis Riel & Red River cause→effect (match) · 11 Numbered Treaties map context ·
  Federalism: opportunities vs challenges (compare).
- **G8:** Political spectrum — left/centre/right *concepts* (spectrum) · Three economic
  questions (match) · Communism vs Fascism (compare) · Forms of civic engagement (sort) ·
  Direct vs Representative democracy (compare).
- **G9:** Assimilation policies vs reconciliation/redress (sort — handle with care) ·
  Majority vs Minority government (sort) · Four levels of courts (sequence) · Youth
  Criminal Justice Act facts (sort) · National unity challenges (sort) · Great Depression
  responses (match).

Say the word and I'll generate any/all of these the same way.
