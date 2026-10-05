/* Shared background for BGSD geography activities.
 * Standard browser requests retain OpenStreetMap's normal caching and Referer.
 * No tile prefetching or offline tile downloads.
 */
function addSchoolBasemap(map) {
  const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    updateWhenIdle: true,
    keepBuffer: 1
  }).addTo(map);
  let notice;
  layer.on('tileerror', () => {
    if (notice) return;
    notice = L.control({position: 'bottomleft'});
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
