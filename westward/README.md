# Westward

A first working version of Darren’s Western Canada K–12 territory workspace. The design follows the approved navy-sidebar, teal-accent mockup.

## What works

- Interactive map with province and relationship filters, government school-board boundary overlays, district selection, proposed routes and home base.
- A directory of **185 unique public, separate/Catholic and francophone district accounts** across BC, Alberta, Saskatchewan and Manitoba. Province filters include 60 in BC, 63 in Alberta, 27 in Saskatchewan and 37 in Manitoba; the two Lloydminster boards appear in both AB and SK but have one account each. This is a reviewed geographic reference set, **not an assigned book or a complete list of all K–12 institutions**. Pins use approximate city centres or points inside district boundaries, not verified offices.
- District briefs: technology footprint, priorities, evidence/source date, renewal timing, contact cadence, assigned-book flag and stakeholders.
- Contact history with separate last-contact and last-visit dates. A contact can create a follow-up and complete its linked task in one save.
- Next steps with date, contact channel, priority, owner, completion/reopening and editing.
- Itineraries with ordered stops, approximate straight-line distance, Google Maps driving directions and tentative all-day ICS export.
- Opportunities with customer outcome, baseline, progress evidence and review date.
- Editable resource collection, full JSON backup/restore and a safe demo-to-personal-workspace transition.

## Visibility and data

The source contains public district references and clearly labelled fictional activities. It contains no actual customer contacts, private interview documents, compensation details or live district usage data.

Your entered records are saved in this browser’s `localStorage`; the app does not upload them to GitHub or sync them between devices. Export backups regularly. Browser storage is not a protected company CRM. Other JavaScript on the same hosting origin may have access to browser storage. For confidential work records, use employer-approved storage and access controls.

The app is deliberately not added to an app hub. The `noindex` meta tag requests that compliant search engines avoid indexing the app; it is **not access control**, and source in a public repository remains public. GitHub Pages may be public even when the source repository is private.

Map tiles load from OpenStreetMap and typography from Google Fonts. These providers receive normal asset requests. District notes are not sent in those requests. Directions links send the selected approximate district coordinates to Google Maps only when opened.

There are no CRM, Calendar, email, licensing-console or Google internal-system connections. Calendar export downloads a proposed itinerary and does not arrange meetings or travel. Opportunity stages are personal labels rather than Google forecast definitions.

## Use

Serve this folder as a static website (for example, from a GitHub Pages subdirectory). To run locally with Python: `python3 -m http.server 8000`, then open `http://localhost:8000`. Opening `index.html` directly from the filesystem will not reliably load ES modules.

Start with **Demo workspace** to explore. Use **Start my workspace** to remove illustrative contacts, actions, opportunities, trips and sample account assignments while preserving your own additions and the district directory. Add your actual assigned accounts and verify sources as you go.

**Saved in this browser → Export backup** creates a portable JSON file. Import validates its structure and references before asking to replace the current workspace. A stale browser tab will not silently overwrite newer saved records.

Existing 27-account workspaces automatically receive the 158 missing directory records on opening the updated app. The upgrade keeps existing IDs, names, coordinates, notes, assignments, contacts and plans. It reuses custom records with matching boundary IDs, or a unique exact name qualified by province and authority type. Deliberately deleted directory accounts stay excluded. Older JSON backups receive the same upgrade when restored.

## Checks

Run `npm test` (Node built-in test runner; no install required). Tests cover directory coverage, cross-border identity, repeat-safe workspace upgrades, preservation of existing records, backup validation, reference integrity, demo cleanup, dates, contact/visit distinction, relationship states, route order, calendar export, screen-template rendering, contact-to-follow-up saving, reload persistence, HTML escaping and stale-tab protection. These are automated model/template checks, not a substitute for a visual browser review.

The map observes container resizing without replacing stored records or resetting the current map position. Primary touch targets are at least 44 CSS pixels high. Layouts include short-screen and narrow-phone adaptations. Use `check-layout.html` for the repository’s required rendered checks at 1024×540, 1366×650, 768×900, 390×667, 320×568 and 640×360. Changing the screen selector resizes the same app without reloading it, so in-progress edits and map position can be checked. The initial release had no completed visual browser review; check results should accompany each subsequent handoff.

## Public research references

- [BC district directory](https://studentsuccess.gov.bc.ca/all/school-districts)
- [Alberta school division maps](https://www.alberta.ca/alberta-school-division-maps)
- [Saskatchewan school divisions](https://www.saskatchewan.ca/residents/education-and-learning/prek-12-education-early-learning-and-schools/k-12-school-divisions-in-saskatchewan)
- [Manitoba division maps](https://www.edu.gov.mb.ca/k12/schools/schooldivmap.html)
- [Canadian Education edition comparison](https://edu.google.com/intl/ALL_ca/workspace-for-education/editions/compare-editions/)
- [Greater Victoria public technology hub](https://techforlearning.sd61.bc.ca/)
- [Focused Education Microsoft agreement](https://focusedresources.ca/agreements-directory/microsoft-m365-campus-school-agreement)
- [Pembina Trails technology](https://www.pembinatrails.ca/technology)
- [Saskatoon Public Edsby help](https://www.spsd.sk.ca/edsby-help)

Do not infer paid license counts, active users, renewals, buying priorities or province-wide preferences from a public tools page. Confirm these during discovery. Resources and district references reviewed for the concept on November 26, 2026.

Third-party code: Leaflet 1.9.4 (BSD-2-Clause) and Lucide (ISC); see `vendor/` for their license notices. Map attribution remains visible in the app.

## Boundary references

Government polygons are bundled separately in `data/boundaries/`, with provenance and coverage notes in its README and manifest. The Layers control toggles public, separate/Catholic and francophone areas, and district reference pins. The basemap uses standard OpenStreetMap tiles rather than the previous CARTO endpoint, which returned API-key placeholder images.

All 185 source boundary records link to 183 distinct district accounts. SD93 in BC and DSFM in Manitoba remain pin-only because the selected layers supply no matching polygon, bringing the unique directory total to 185. Public, separate/Catholic and francophone boundaries and reference pins start enabled; overlapping layers can be toggled individually. Clicking a polygon opens its district brief. If its account was removed, it can prefill a replacement public reference record for review.

`directory-data.js` is generated public reference data; `data/directory-coverage.json` records its counts and exceptions. `data/directory-overrides.json` retains the original 27 public IDs and approximate pins. After reviewing updated boundaries and crosswalks, run `python3 scripts/build-directory.py` with Shapely installed, then run the tests. New pins use an interior point of the largest source polygon component and are explicitly labelled as office-unconfirmed references. Confirm and update office coordinates before planning travel.
