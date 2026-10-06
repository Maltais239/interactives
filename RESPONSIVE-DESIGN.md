# Responsive classroom activities

Screen resizing is a default requirement for every new or updated interactive.
Use the available browser or iframe width **and height**, including short Chromebook screens.

- Include `width=device-width,initial-scale=1` in the viewport meta tag. Keep browser zoom enabled.
- Keep text readable and primary touch controls at least 44 CSS pixels high. Change layout and spacing instead of scaling the whole page down.
- Use flexible grid columns (`minmax(0,1fr)`), wrapping toolbars, responsive diagrams and bounded image sizes. Preserve the aspect ratio of game boards.
- Put maps and primary workspaces in the available height below their headings. Use dynamic viewport units with a fallback, or measure the workspace's actual position. Do not set a fixed desktop map height for all screens.
- Stack panels when a side-by-side layout is too narrow. Allow scrolling for longer lessons, lists, settings and feedback. Never hide essential controls with `overflow:hidden`.
- A resize, orientation change, iframe resize, font load or keyboard opening must preserve the current question, answers, drawings and score. Update canvas/Leaflet dimensions when their container changes.
- Check the changed activity at 1024×540, 1366×650, 768×900, 390×667, 320×568 and 640×360. Check browser zoom, horizontal overflow, readable controls, a live resize during a question, and the completed-round state.

`learning-shared/screen-checks.html` provides same-origin iframe viewports for repeatable live checks. The source audit is not a substitute for rendered checks; legacy activities still need their own layout checked when edited.

## Shared layouts in Maltais239/interactives

`learning-shared/studio.css` has compact spacing for short screens and safe grid sizing.
`Studio.fitWorkspace(main)` sets `--workspace-height` from the space below the heading and returns a cleanup function.
`latitudelongitude/screen.css` uses it to size the map and keep longer controls scrollable.
`geography-shared/screen-layout.css` supports the audited full-screen `#map` / `#info-panel` family using `screen-map-layout` on the html element.
The shared basemap helper watches container resizing and updates Leaflet without resetting activity state. The Coordinate Explorer refits the world only while the user is in the world view; a manually panned or zoomed view is preserved.

Always change the asset cache version when publishing shared CSS or JavaScript changes.
