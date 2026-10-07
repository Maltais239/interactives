# Science field notebook sorts

Seven independent notebook activities: light, energy, matter, materials, weather/climate, animal diets and seasons. The approved Biotic & Abiotic activity and Natural Resources: Resource Depot are not rebuilt or modified here. This builder never touches `sorting-lab/`.

Edit cards, categories, colours, feedback or teacher notes in `activities/<folder>.json`. Each card has a stable key, label, group and explanation. Art is editable inline SVG. Animal Diets retains its existing photographs, profile sources and photograph credits; its two rounds list card keys.

From the repository root, rebuild all seven:

```sh
python3 field-notebook-sort/build.py
```

Or rebuild only one:

```sh
python3 field-notebook-sort/build.py transparentopaque
```

The output is each activity's own `index.html`, with CSS, JSON and JavaScript included. Each app has a Make it my own dialog; it fetches the published initial source, includes photographs in the downloaded HTML, and strips marked analytics scripts. The optional web font has a system fallback. Local student answers are not exported.

Animal Diets now uses this builder. The older `sorting-lab/build.py` can overwrite its page with the older design; use this builder for Animal Diets. Resource Depot continues to use its original Sorting Lab files.

Responsive checks: open `validation/screen-checks.html` on the published site. The viewport selector changes the same iframe without a reload, and the text button tests CSS zoom at 200%. Verify retained answers, readable labels, vertical access to all controls and no page-level horizontal scrolling.

October 7, 2026: tested wrong/correct answers, every answer and round, completion, reset, native drop and portable-copy preparation. Classroom and mobile layouts are checked at 1366×650, 1024×540, 768×900, 390×667, 320×568, 640×360 and 512×270.
