# Public school-board boundary references

These files are geographic references, kept separate from contacts, notes, opportunities, activity and sales information. They contain no private workspace records.

## Structure

- `bc.geojson`, `ab.geojson`, `sk.geojson`, `mb.geojson`: WGS84 longitude/latitude polygons, grouped by provincial government authority code where available.
- `manifest.json`: source endpoints, retrieval date, source-vintage notes, counts, display processing and known coverage gaps.
- `account-links.json`: an identity crosswalk from all 185 boundary IDs to 183 district accounts, plus cross-border equivalences for Lloydminster. No name-only fuzzy joins.
- Manitoba's selected source provides names rather than authority numbers. Its `MB-*` IDs are **derived name keys**, not official authority codes; these should be maintained through a reviewed crosswalk if names change.

An account may have a comma-separated `boundaryIds` field. An explicit account link takes priority over the bundled crosswalk. This allows a renamed account or a cross-border authority to retain its relationship to one or more source areas.

## Coverage of this snapshot

- BC: 59 geographic district areas; no SD93 francophone polygon in the selected source.
- Alberta: 42 named public areas, 17 separate/Catholic areas and 4 francophone regions. Unnamed/unattributed source polygons are excluded.
- Saskatchewan: 18 public and 8 separate divisions, plus 1 francophone authority assembled from its supplied subdivisions.
- Manitoba: 36 named division/district areas; no DSFM polygon in the selected source.

Counts describe these **source layers**, not every authority or potential account. Charter, independent and First Nations systems are not comprehensively covered. Public, separate and francophone areas can overlap. A missing polygon does not imply a missing account or eligibility restriction.

The directory adds SD93 and DSFM as pin-only accounts: 185 unique accounts in total, with provincial membership counts of BC 60, AB 63, SK 27 and MB 37. Lloydminster Public (AB-3170 / SK-99) and Lloydminster Catholic (AB-4870 / SK-89) each share one account across both provinces. See `../directory-coverage.json` for the generated coverage summary.

## Sources and credit

Contains information from the Government of British Columbia, Government of Alberta, Government of Saskatchewan and Government of Manitoba. Original sources and their conditions remain authoritative:

- [BC School Districts](https://catalogue.data.gov.bc.ca/dataset/school-districts-of-bc) — Open Government Licence–British Columbia; WFS export from the BC Geographic Warehouse.
- [Alberta school division maps](https://www.alberta.ca/alberta-school-division-maps) — public/separate 2026 ArcGIS services and the active francophone education-region service. Government of Alberta copyright.
- [Saskatchewan Schools and Divisions service](https://gis.saskatchewan.ca/arcgis/rest/services/Education/SchoolsAndDivisions/MapServer) — Government of Saskatchewan, Ministry of Education. [Public metadata](https://gisappl.saskatchewan.ca/WebDocs/SaskInteractive/ED_SD_Public.html) and [separate metadata](https://gisappl.saskatchewan.ca/WebDocs/SaskInteractive/ED_SD_Separate.html).
- [Manitoba School Divisions catalogue](https://open.canada.ca/data/en/dataset/77194d03-9315-70f9-d71f-4052c857ce82) — Government of Manitoba / GeoManitoba ArcGIS service.

See `manifest.json` for exact query URLs and vintage notes. **Retrieval date is not the effective boundary-revision date.**

## Refresh and display processing

The website reads these static files, so opening the map does not query government APIs or require an API key for the boundary layer. The separate OpenStreetMap basemap still loads normal map tiles under its usage policy.

To refresh: install Python `shapely>=2.1`, then run `python scripts/refresh-boundaries.py` from `westward/`. During development `--cached` reuses ignored raw responses in `.boundary-raw/`. Review metadata, unmatched authorities, crosswalks, output counts and test results before committing a new snapshot.

The builder excludes unnamed source features, combines parts belonging to the same authority, repairs invalid source geometry for display and simplifies geometry at 0.001 degree tolerance. These are generalized planning polygons, **not cadastral, enrolment-eligibility or legal boundary determinations**. Small gaps/slivers or simplified shared edges can occur. Consult the government source for official decisions. The Alberta service itself warns of approximations and geometry issues.

The map starts with public, separate/Catholic and francophone boundaries and reference pins enabled. The Layers control offers individual toggles, together with source and coverage information. Clicking a polygon opens an existing district brief or lets the user save a new public reference record. Generated directory pins are approximate city-centre references or interior points of the largest polygon component; they are not verified office locations. A manually added boundary record also starts with approximate coordinates. Verify its office location before travel.
