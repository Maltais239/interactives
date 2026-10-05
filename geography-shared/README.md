# Geography repair batch — October 2026

The existing URLs and activities are retained. The shared background uses OpenStreetMap Standard tiles with visible attribution, browser caching, and no tile prefetch/offline download features. Configure the background in `basemap.js`.

## Boundary data

`canada.geojson` retains the coordinates of all 13 regions from the dataset previously used by the Canada Map Challenge and Canadian Geography Hub:

https://cdn.jsdelivr.net/gh/codeforgermany/click_that_hood@master/public/data/canada.geojson

Repository: https://github.com/codeforgermany/click_that_hood

The companion repository licence is retained in `click-that-hood-LICENSE`. Database timestamp fields were removed; `Yukon Territory` was normalized to `Yukon`. This is a fixed copy of the existing educational map, not a new authoritative boundary survey.

Civilizations of the World loads the repository's existing `../curriculum_civilizations.geojson` instead of requesting it from a separate raw GitHub host. Original historical-region attribution and content are preserved.

## Repairs

- Replace the CARTO backgrounds displaying API-key messages in all five activities.
- Serve Canada boundary data from this site; check unsuccessful responses and keep controls disabled while loading.
- Fit the Canada maps to all province/territory boundaries at startup.
- Preserve the Canadian Geography Hub's final question and completed round when switching Explore/Quiz.
- Reset the civilization map view when returning to all civilizations.
- Show correct/incorrect feedback and the correct answer in Civilizations & Trade Routes; guard duplicate scoring and display map attribution.
- Correct box sizing and provide stacked map/question layouts for the three sidebar maps on small screens.

## Verification

Run `node geography-shared/repair-tests.cjs` from the repository root. The checks exercise wrong/correct answers, hints, all 13 Canadian questions, mode switching on the final question, completion, restart, failed data loads, all 33 civilization detail entries, category filters, and the 15-question trade-route quiz.

JavaScript and JSX syntax are checked before publishing. Live browser checks cover map backgrounds, region/marker selection, mode switching, hints and quiz feedback. Browser resizing is not available in the current verification environment; the small-screen CSS needs a classroom-device check.

Map details still require an internet connection. Province shapes and historical regions are served from this repository.
