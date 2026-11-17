# Abyssal Garden

Created by **Maksymilian Dendura (Noniv)**.

Original source and project documentation are at [Noniv/abyssal-garden](https://github.com/Noniv/abyssal-garden).

This version extends the underwater world with four loggerhead turtles, three blacktip reef sharks, a school of nine goldfish, and six jellyfish. The turtle meshes use curved cross-sections in `wildlife.js`. A Web Worker generates the shark and goldfish meshes and colors on the device using [Procedural Animals](https://github.com/majidmanzarpour/threejs-procedural-animals) by Majid Manzarpour and contributors. `marine-life.js` adapts their swim tables to the kelp routes and shades the animals in WebGPU. The build needs no model downloads.

The bundled worker is generated from `marine-worker-entry.js` and the upstream project at commit [c95ae493](https://github.com/majidmanzarpour/threejs-procedural-animals/tree/c95ae49346aa8e140a924376cec6cf0073d99512). Its header includes the upstream MIT notice. To rebuild, check out that revision and run `npx esbuild@0.28.2 marine-worker-entry.js --bundle --minify --format=esm --target=es2022 --alias:procedural-animals=/absolute/path/to/upstream --outfile=marine-worker.js --banner:js="$(printf '/*\n'; cat /absolute/path/to/upstream/LICENSE; printf '*/')"`.

Copyright (c) 2026 Maksymilian Dendura. See [LICENSE](LICENSE).

Open the [GitHub Pages build](https://maltais239.github.io/interactives/worlds/kelp-garden/) in a browser with WebGPU support. For local development, serve this folder over HTTP.
