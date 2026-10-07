# Image Spark

The existing Image Spark design, with a local bank of 23 Grade 7 curriculum images. See [IMAGE-SOURCES.md](IMAGE-SOURCES.md) for item-level credits, dates and rights.

Choose an image in the top selector. Source & Grade 7 inquiry opens the credit, curriculum connection and a suggested evidence-based question. Historical photographs, artwork, maps and documents should be interpreted with additional sources; a posed image alone does not establish a person's motives or experience.

Observations and web questions are saved separately for each image in this browser's local storage. Save work downloads a JSON project containing all image webs; Open work restores a saved project. Use Save work when moving to another device or before clearing browser data. Text exports include the current image's source and question. Image exports capture the web. Custom images can be loaded by URL or uploaded as JPG, PNG or WebP.

Drag notes using the three-dot handle, or focus the handle and use arrow keys. Edit notes directly. Undo restores the most recent add, deletion, drag start or reset. Reveal supports touch, mouse and arrow/Home/End keys. Changing image resets image tools but preserves its notes.

## Development

Edit `app.jsx`, the custom CSS in `index.html`, or `grade7-images.js`. With Node 24+, run `npm install` then `npm run build` in this folder and commit the generated `app.js`, `styles.css` and vendor files. The production page uses compiled JSX/CSS and local React bundles; no runtime Babel or Tailwind CDN is required. Google Fonts and the existing html2canvas export library remain external. Deployment is static GitHub Pages.

The responsive layout stacks below 1024px, supports shorter embedded views with panel scrolling, and preserves work through resizing. No student notes are sent to a server by the app.
