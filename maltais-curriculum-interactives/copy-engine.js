/* Teacher exports read the published source, never a student's live DOM. */
(function () {
  'use strict';
  const REPOSITORIES = {
    'Maltais239/interactives': 'https://maltais239.github.io/interactives/',
    'BlackGoldSchoolDivision/interactives': 'https://interactives.blackgold.ca/'
  };
  const encoder = new TextEncoder();
  function repoLocation(url) {
    const u = new URL(url);
    for (const [repo, base] of Object.entries(REPOSITORIES)) {
      const b = new URL(base);
      if (u.origin === b.origin && u.pathname.startsWith(b.pathname)) {
        return {repo, path: decodeURIComponent(u.pathname.slice(b.pathname.length))};
      }
    }
    return null;
  }
  function rawUrl(repo, path) {
    if (!REPOSITORIES[repo] || path.split('/').some(p => p === '..')) throw new Error('Invalid source location.');
    return 'https://raw.githubusercontent.com/' + repo + '/main/' + path.split('/').map(encodeURIComponent).join('/');
  }
  async function read(repo, path, signal, binary = false) {
    const response = await fetch(rawUrl(repo, path), {signal, cache:'no-cache'});
    if (!response.ok) throw new Error('Could not load ' + path + ' (' + response.status + ').');
    return binary ? new Uint8Array(await response.arrayBuffer()) : response.text();
  }
  function stripAnalytics(doc) {
    doc.querySelectorAll('script[data-lab-analytics],script[src*="googletagmanager.com/gtag"],script[src*="cloudflareinsights.com/beacon"],script[src*="learning-shared/analytics.js"]').forEach(e => e.remove());
  }
  function cssUrls(css, base) {
    return css.replace(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi, (match, quote, value) => {
      value = value.trim();
      if (!value || /^(?:data:|blob:|#)/i.test(value)) return match;
      try { return 'url(' + JSON.stringify(new URL(value, base).href) + ')'; } catch { return match; }
    }).replace(/(@import\s+)(['"])([^'"]+)\2/gi, (match, start, quote, value) => {
      try { return start + JSON.stringify(new URL(value, base).href); } catch { return match; }
    });
  }
  // A source base keeps dynamically created images and relative fetches online.
  // Local fragment links and SVG paint references must still point into the copy.
  function fragmentSupport() {
    return `(() => {
      const local = location.href.split('#')[0];
      const fix = root => {
        for (const e of root.querySelectorAll('[href^="#"],[xlink\\\\:href^="#"],[fill*="url(#"],[stroke*="url(#"],[clip-path*="url(#"],[mask*="url(#"],[filter*="url(#"]')) {
          for (const a of ['href','xlink:href']) { const v=e.getAttribute(a); if(v&&v[0]==='#')e.setAttribute(a,local+v); }
          for (const a of ['fill','stroke','clip-path','mask','filter']) { const v=e.getAttribute(a); if(v&&v.includes('url(#'))e.setAttribute(a,v.replace(/url\\(#([^)]*)\\)/g,(_,id)=>'url("'+local+'#'+id+'")')); }
        }
      };
      document.addEventListener('DOMContentLoaded', () => {
        fix(document);
        const observer=new MutationObserver(()=>fix(document));
        observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['href','xlink:href','fill','stroke','clip-path','mask','filter']});
      });
    })();`;
  }
  async function prepare(version, activity, signal, readSource = read) {
    const source = await readSource(version.repo, version.path, signal);
    const doc = new DOMParser().parseFromString(source, 'text/html');
    stripAnalytics(doc);
    const originalUrl = new URL(version.path, REPOSITORIES[version.repo]).href;
    const existingBase = doc.querySelector('base[href]');
    const sourceBase = existingBase ? new URL(existingBase.getAttribute('href'), originalUrl).href : originalUrl;
    let base = existingBase;
    if (!base) { base = doc.createElement('base'); doc.head.prepend(base); }
    base.setAttribute('href', sourceBase);
    const deferred = [];
    let styles = 0, scripts = 0, linkedScripts = 0;
    const contentPolicy = Boolean(doc.querySelector('meta[http-equiv="Content-Security-Policy" i]'));
    const hasModules = Boolean(doc.querySelector('script[type="module"]'));
    function keepScript(script, url) {
      script.setAttribute('src', url);
      // A classic deferred library must execute before the deferred app code.
      // Move the complete chain to the end of the body and retain its order.
      if (!hasModules && !contentPolicy && script.hasAttribute('defer') && !script.hasAttribute('async')) {
        script.removeAttribute('defer'); script.remove(); deferred.push(script);
      }
      linkedScripts++;
    }
    for (const link of doc.querySelectorAll('link[rel="stylesheet"][href]')) {
      const url = new URL(link.getAttribute('href'), sourceBase).href;
      const location = repoLocation(url);
      if (!location || contentPolicy) { link.setAttribute('href', url); continue; }
      const css = await readSource(location.repo, location.path, signal);
      const style = doc.createElement('style');
      if (link.hasAttribute('media')) style.setAttribute('media', link.getAttribute('media'));
      style.setAttribute('data-original-file', location.path);
      style.textContent = cssUrls(css, url).replace(/<\/style/gi, '<\\/style');
      link.replaceWith(style); styles++;
    }
    for (const script of Array.from(doc.querySelectorAll('script[src]'))) {
      const url = new URL(script.getAttribute('src'), sourceBase).href;
      const location = repoLocation(url);
      const type = (script.getAttribute('type') || '').toLowerCase();
      // Keep vendor libraries, modules and asynchronous scripts in their native form.
      if (!location || contentPolicy || hasModules || type === 'module' || script.hasAttribute('async') || /(?:^|\/)vendor\/|\.min\.js$/i.test(location.path)) {
        keepScript(script, url); continue;
      }
      const code = await readSource(location.repo, location.path, signal);
      if (/document\s*\.\s*currentScript|\bimport\.meta\b/.test(code)) {
        keepScript(script, url); continue;
      }
      const inline = doc.createElement('script');
      for (const attribute of script.attributes) {
        if (!['src','defer','async','integrity','crossorigin'].includes(attribute.name)) inline.setAttribute(attribute.name, attribute.value);
      }
      inline.setAttribute('data-original-file', location.path);
      inline.textContent = code.replace(/<\/script/gi, '<\\/script');
      if (script.hasAttribute('defer')) { deferred.push(inline); script.remove(); }
      else script.replaceWith(inline);
      scripts++;
    }
    const fragments = doc.createElement('script');
    fragments.setAttribute('data-copy-support', 'fragments');
    fragments.textContent = fragmentSupport();
    doc.head.appendChild(fragments);
    // Classic deferred code retains its order and sees the completed body.
    deferred.forEach(script => doc.body.appendChild(script));
    const note = doc.createComment(' Teacher copy of ' + activity.title.replace(/--/g,'—') + '. Original: ' + originalUrl + '. Keep original credits. Online assets may be required. ');
    doc.documentElement.insertBefore(note, doc.head);
    return {html:'<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n', original:source, originalUrl, styles, scripts, linkedScripts};
  }
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const a = document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  let zipLibrary;
  function getZip() {
    if (window.fflate) return Promise.resolve(window.fflate);
    if (!zipLibrary) zipLibrary = new Promise((resolve,reject) => {
      const s=document.createElement('script');
      s.src='https://interactives.blackgold.ca/territorial-evolution-canada/vendor/fflate.min.js';
      s.onload=()=>window.fflate ? resolve(window.fflate) : reject(new Error('ZIP library unavailable.'));
      s.onerror=()=>{zipLibrary=null; reject(new Error('Could not load the ZIP library. Use the source-files link instead.'));};
      document.head.appendChild(s);
    });
    return zipLibrary;
  }
  async function project(version, activity, manifest, signal, progress = () => {}) {
    const root = version.path.split('/')[0];
    const list = manifest.files[version.repo + '/' + root];
    if (!list?.length) throw new Error('Project files are unavailable. Use the source-files link.');
    const selected = new Map(list.map(f => [f.path, f]));
    const contents = {};
    let totalBytes=0, done=0;
    const loadedShared = new Set();
    // Follow shared-folder references found in HTML, CSS and JavaScript.
    let pending=Array.from(selected.keys());
    while (pending.length) {
      const batch=pending.splice(0,4);
      await Promise.all(batch.map(async path => {
        if(signal?.aborted) throw new DOMException('Cancelled','AbortError');
        const bytes=await read(version.repo,path,signal,true);
        totalBytes+=bytes.length;
        if(totalBytes>40*1024*1024) throw new Error('This project is too large for a browser ZIP. Use the source-files link.');
        let data=bytes;
        if(/\.(html?|css|js)$/i.test(path)) {
          let text=new TextDecoder().decode(bytes);
          if(/\.html?$/i.test(path)) {
            // Tracking on the original site must not follow a teacher's adaptation.
            text=text.replace(/<script\b[^>]*\bdata-lab-analytics\b[^>]*>[\s\S]*?<\/script\s*>/gi,'');
            data=encoder.encode(text);
          }
          for(const folder of ['learning-shared','geography-shared']) {
            if(!text.includes(folder+'/')||loadedShared.has(folder))continue;
            loadedShared.add(folder);
            for(const file of manifest.files[version.repo+'/'+folder]||[]) {
              if(!selected.has(file.path) && !/analytics(?:-config)?\.(?:js|json)$|screen-checks\.html$|(?:^|\/)tests?\//.test(file.path)) {
                selected.set(file.path,file); pending.push(file.path);
              }
            }
          }
        }
        contents[path]=data; done++; progress(done,selected.size);
      }));
    }
    const instructions=[
      activity.title+' — teacher project copy',
      '',
      'Start with: '+version.path,
      'Keep the folder structure so pictures, CSS, JavaScript and shared helpers can be found.',
      'For maps and apps that fetch data, host this folder on a web server (for example GitHub Pages).',
      'External maps, fonts and libraries may still need an internet connection.',
      'Original source: '+version.url,
      'Keep the original author and data-source credits. Follow any included licences.',
      'Original-site analytics tags have been removed from the HTML copies.',
      '',
      'To adapt with AI, provide the entry HTML and its referenced app JavaScript/CSS files.',
      'Describe the grade, topic, questions or vocabulary you want to change.',
      'Request complete replacement files and keep the responsive layout and accessibility controls.'
    ].join('\n');
    contents['START-HERE.txt']=encoder.encode(instructions);
    const fflate=await getZip();
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    // Store files without blocking the page on heavy compression.
    return new Promise((resolve,reject)=> {
      const cancel=fflate.zip(contents,{level:0},(error,data)=> {
        signal?.removeEventListener('abort',abort);
        if(error)reject(error);else resolve({bytes:data,files:Object.keys(contents).length});
      });
      function abort(){cancel();reject(new DOMException('Cancelled','AbortError'));}
      signal?.addEventListener('abort',abort,{once:true});
    });
  }
  window.LabCopy = {prepare,project,download,rawUrl,repoLocation,cssUrls};
})();
