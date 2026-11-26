# Westward

A first working version of Darren’s Western Canada K–12 territory workspace. The design follows the approved navy-sidebar, teal-accent mockup.

## What works

- Interactive map with province and relationship filters, district selection, proposed routes and home base.
- A starter directory of 27 real district/authority names across BC, Alberta, Saskatchewan and Manitoba. This is **not the complete territory or an assigned account list**. Pins use approximate city centres, not verified offices.
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

Map tiles load from CARTO/OpenStreetMap and typography from Google Fonts. These providers receive normal asset requests. District notes are not sent in those requests. Directions links send the selected approximate district coordinates to Google Maps only when opened.

There are no CRM, Calendar, email, licensing-console or Google internal-system connections. Calendar export downloads a proposed itinerary and does not arrange meetings or travel. Opportunity stages are personal labels rather than Google forecast definitions.

## Use

Serve this folder as a static website (for example, from a GitHub Pages subdirectory). To run locally with Python: `python3 -m http.server 8000`, then open `http://localhost:8000`. Opening `index.html` directly from the filesystem will not reliably load ES modules.

Start with **Demo workspace** to explore. Use **Start my workspace** to remove illustrative contacts, actions, opportunities, trips and sample account assignments while preserving your own additions and the district directory. Add your actual assigned accounts and verify sources as you go.

**Saved in this browser → Export backup** creates a portable JSON file. Import validates its structure and references before asking to replace the current workspace. A stale browser tab will not silently overwrite newer saved records.

## Checks

Run `npm test` (Node built-in test runner; no install required). Tests cover backup validation, reference integrity, demo cleanup, dates, contact/visit distinction, relationship states, route order, calendar export, screen-template rendering, contact-to-follow-up saving, reload persistence, HTML escaping and stale-tab protection. These are automated model/template checks, not a substitute for a visual browser review.

The map observes container resizing without replacing stored records or resetting the current map position. Primary touch targets are at least 44 CSS pixels high. Layouts include short-screen and narrow-phone adaptations. The repository’s requested rendered checks at 1024×540, 1366×650, 768×900, 390×667, 320×568 and 640×360 remain unverified: the preview browser was unavailable during this build.

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

Do not infer paid license counts, active users, renewals, buying priorities or province-wide preferences from a public tools page. Confirm these during discovery. Resources and starter references reviewed for the concept on November 26, 2026.

Third-party code: Leaflet 1.9.4 (BSD-2-Clause) and Lucide (ISC); see `vendor/` for their license notices. Map attribution remains visible in the app.
