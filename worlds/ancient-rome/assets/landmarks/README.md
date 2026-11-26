# Landmark models

The landmark assets live in individual folders and can be fetched by URL when used in a district.

## Colosseum

[3D model by Colosseum.how](https://www.colosseum.how/3d-model), published by Artur Jakucewicz.

The original AD 80 reconstruction is stored as [colosseum/colosseum-ad-80.glb.gz](colosseum/colosseum-ad-80.glb.gz). Gzip compression preserves the complete GLB. Decompress the file to obtain `colosseum-ad-80.glb` for a 3D editor, or decompress the response with the browser's `DecompressionStream('gzip')` when loading it. A host may already decode gzip responses, so a loader should check the gzip magic bytes before decompressing.

The source page permits any use, including commercial projects, with an active credit link to Colosseum.how. Preserve that credit wherever this model is used. The stored file uses lossless gzip compression. The source describes it as a simplified reconstruction with approximate dimensions and some details that may belong to Domitian's later additions.

The walk loads `colosseum/colosseum-walk.mesh.gz`, a smaller derivative with simplified triangles and quantized positions and normals. The source colours are retained. The display ground and foundation are replaced by the world terrain and forecourt. The complete original GLB is retained as the archive above.

The Colosseum, Roman Forum and Palatine can be reached through the walk’s city map.

## Roman Forum

[FORUM ROMANUM by L.VII.C](https://3dwarehouse.sketchup.com/model/456438acf00cb5ad6c4e174b0cf70299/FORUM-ROMANUM).

The current walk uses its own procedural interpretation in `imperial-city.js`. This external listing describes a detailed assembled reconstruction. Access to its download requires a Trimble account. Creator permission for standalone redistribution needs confirmation before storing a copy here.

## Palatine

[Palace of Domitian by L.VII.C](https://3dwarehouse.sketchup.com/model/9c95b23ebd85e2106626df250d84698/Palace-of-Domitian).

The current walk uses its own procedural interpretation in `imperial-city.js`. This external listing describes an exterior reconstruction with interiors for four principal halls. Access to its download requires a Trimble account. Creator permission for standalone redistribution needs confirmation before storing a copy here.

[SketchUp's explanation of 3D Warehouse reuse terms](https://help.sketchup.com/en/3d-warehouse/3d-warehouse-terms-use-faq) covers combined works and restrictions on standalone transfers and aggregation.

The machine-readable [sources.json](sources.json) records the saved file, its checksums, and the pending models.
