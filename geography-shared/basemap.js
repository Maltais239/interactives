/* Shared background for BGSD geography activities.
 * All views use the same OpenStreetMap tiles; changing view fetches no new tiles.
 * Normal browser caching and Referer are retained. No prefetch/offline downloads.
 */
function addSchoolBasemap(map, options = {}) {
  const views = {
    grey: { label: 'Light grey', filter: 'grayscale(1) brightness(1.06) contrast(0.9)' },
    muted: { label: 'Muted colour', filter: 'saturate(0.3) brightness(1.03)' },
    original: { label: 'Original', filter: 'none' }
  };
  const storageKey = 'school-map-view-v1';
  let view = 'grey';
  try {
    const saved = localStorage.getItem(storageKey);
    if (Object.prototype.hasOwnProperty.call(views, saved)) view = saved;
  } catch (_) { /* Embedded/private browsing can disable storage. */ }

  const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    updateWhenIdle: true,
    keepBuffer: 1,
    ...options
  });
  function applyView() {
    // Filter only this tile container, never the map, markers, paths or popups.
    const tiles = layer.getContainer();
    if (tiles) {
      tiles.style.filter = views[view].filter;
      tiles.dataset.mapView = view;
    }
  }
  layer.on('add', applyView);
  layer.addTo(map);

  if (!document.getElementById('school-map-view-styles')) {
    const style = document.createElement('style');
    style.id = 'school-map-view-styles';
    style.textContent = `
      .school-map-view { box-sizing:border-box; background:#fff; color:#334155;
        border:1px solid #cbd5e1; border-radius:8px; padding:6px 8px;
        box-shadow:0 1px 5px #0002; font:12px/1.4 system-ui,sans-serif; }
      .school-map-view label { display:flex; align-items:center; gap:8px;
        margin:0; color:#334155; font:600 12px/1.4 system-ui,sans-serif; }
      .school-map-view select { box-sizing:border-box; width:auto; max-width:130px;
        min-height:36px; margin:0; border:1px solid #cbd5e1; border-radius:5px;
        padding:4px 6px; background:#fff; color:#1e293b;
        font:400 13px/1.4 system-ui,sans-serif; cursor:pointer; }
      .school-map-view select:focus-visible { outline:3px solid #2563eb;
        outline-offset:2px; }
    `;
    document.head.appendChild(style);
  }

  const control = L.control({ position: 'topright' });
  control.onAdd = () => {
    const el = L.DomUtil.create('div', 'school-map-view');
    const label = document.createElement('label');
    label.appendChild(document.createTextNode('Map view'));
    const select = document.createElement('select');
    for (const [value, config] of Object.entries(views)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = config.label;
      select.appendChild(option);
    }
    select.value = view;
    select.addEventListener('change', () => {
      view = select.value;
      applyView();
      try { localStorage.setItem(storageKey, view); } catch (_) {}
    });
    label.appendChild(select);
    el.appendChild(label);
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
    L.DomEvent.on(el, 'keydown keyup', L.DomEvent.stopPropagation);
    return el;
  };
  control.addTo(map);

  let notice;
  layer.on('tileerror', () => {
    if (notice) return;
    notice = L.control({ position: 'bottomleft' });
    notice.onAdd = () => {
      const el = L.DomUtil.create('div');
      el.setAttribute('role', 'status');
      el.style.cssText = 'background:white;color:#334155;padding:8px 12px;border-radius:6px;max-width:240px;font:12px/1.4 sans-serif;box-shadow:0 1px 5px #0003';
      el.textContent = 'Some background details could not load. You can still use the activity’s shapes and markers.';
      L.DomEvent.disableClickPropagation(el);
      return el;
    };
    notice.addTo(map);
  });
  return layer;
}
