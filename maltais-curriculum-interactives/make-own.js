(function () {
  'use strict';
  const config = document.currentScript.dataset;
  let manifestPromise,activity,version,prepared,controller,request=0,opener,downloadURL;
  const dialog=document.createElement('dialog');
  dialog.id='make-own-dialog'; dialog.className='own-dialog';
  dialog.setAttribute('aria-labelledby','own-title');
  dialog.innerHTML=`<div class="own-head"><div><p class="own-kicker">For teachers</p><h2 id="own-title" tabindex="-1">Make it my own</h2><p class="own-activity-title" id="own-activity-title"></p></div><button type="button" class="own-close" aria-label="Close Make it my own">×</button></div>
    <div class="own-content"><p class="own-intro" id="own-intro">Get an editable HTML copy, then change the topic, questions or vocabulary for your class.</p>
      <label class="own-field" id="own-version-field" hidden>Choose an activity or version<select id="own-version"></select></label>
      <p class="own-status" id="own-status" role="status" aria-live="polite">Preparing your copy…</p>
      <div class="own-actions" id="own-html-actions"><a class="own-action primary" id="own-download" role="button" aria-disabled="true" tabindex="-1">Download HTML ↓</a><button type="button" class="own-action" id="own-copy" disabled>Copy HTML</button><button type="button" class="own-action" id="own-prompt" disabled>Copy AI prompt + HTML</button><button type="button" class="own-action" id="own-preview" disabled>Preview my copy ↗</button></div>
      <a class="own-action primary" id="own-slides-copy" target="_blank" rel="noopener noreferrer" hidden>Make a copy in Google Slides ↗</a>
      <p class="own-help" id="own-help">Paste the code or upload the HTML into Gemini Canvas and describe your changes. Pictures, maps, fonts and some data still load online.</p>
      <details class="own-details" id="own-project"><summary>Get the complete project</summary><p>Download the source files and pictures together. Keep the folders intact; apps that fetch data may need to be hosted online.</p><button type="button" class="own-action" id="own-zip">Download project ZIP ↓</button></details>
      <details class="own-details" id="own-code-details"><summary>View or select the HTML</summary><textarea class="own-code" id="own-code" readonly spellcheck="false" aria-label="Editable copy HTML"></textarea></details>
      <a class="own-source" id="own-source" target="_blank" rel="noopener noreferrer">View original source files ↗</a><p class="own-credit" id="own-credit">Keep the original author and data-source credits in your adaptation.</p>
    </div>`;
  document.body.appendChild(dialog);
  const find=id=>dialog.querySelector('#own-'+id);
  const buttons=['download','copy','prompt','preview'].map(find);
  function status(text,error=false){find('status').textContent=text;find('status').dataset.error=String(error);}
  function track(name){window.BGSDLabsAnalytics?.track(name,{activity_id:activity?.id||'',version:version?.path||''});}
  function getManifest(){
    if(!manifestPromise)manifestPromise=fetch(config.sourceManifest,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('The source list could not load. Please try again.');return r.json();}).catch(e=>{manifestPromise=null;throw e;});
    return manifestPromise;
  }
  function disable(value){buttons.forEach(b=>{if(b.tagName==='A'){b.setAttribute('aria-disabled',String(value));b.tabIndex=value?-1:0;if(value)b.removeAttribute('href');}else b.disabled=value;});find('zip').disabled=value;}
  function releaseDownload(){if(downloadURL){const old=downloadURL;downloadURL=null;setTimeout(()=>URL.revokeObjectURL(old),30000);}}
  function filename(ext){const slug=(version?.path.split('/').pop().replace(/\.html?$/i,'')||activity.id);return 'my-'+activity.id+(slug==='index'?'':'-'+slug)+ext;}
  function sourceLink(){
    const folder=version.path.slice(0,version.path.lastIndexOf('/'));
    find('source').href='https://github.com/'+version.repo+'/tree/main/'+folder.split('/').map(encodeURIComponent).join('/');
  }
  async function loadVersion(index){
    controller?.abort();controller=new AbortController();const token=++request;
    releaseDownload();version=activity.versions[index];prepared=null;disable(true);find('code').value='';sourceLink();
    status('Preparing your copy…');
    const activeController=controller;
    const timeout=setTimeout(()=>activeController.abort(),30000);
    try{
      const result=await LabCopy.prepare(version,activity,controller.signal);
      if(token!==request||!dialog.open)return;
      prepared=result;find('code').value=result.html;disable(false);
      downloadURL=URL.createObjectURL(new Blob([result.html],{type:'text/html;charset=utf-8'}));find('download').href=downloadURL;find('download').download=filename('.html');
      status('Ready. Your copy includes the activity HTML'+(result.styles||result.scripts?', styles and app code.':'.'));
    }catch(error){
      if(token!==request||!dialog.open)return;
      status(error.name==='AbortError'?'This is taking too long. Try another version, or use the original source-files link.':error.message,true);
      find('zip').disabled=false;
    }finally{clearTimeout(timeout);}
  }
  async function open(id,button){
    releaseDownload();opener=button;prepared=null;version=null;controller?.abort();++request;activity={id,title:button.closest('article')?.querySelector('h3')?.textContent||'Activity'};
    find('activity-title').textContent=activity.title;find('version-field').hidden=true;disable(true);status('Finding the source files…');
    find('source').removeAttribute('href');find('slides-copy').hidden=true;
    ['html-actions','help','project','code-details'].forEach(id=>find(id).hidden=false);
    find('intro').textContent='Get an editable HTML copy, then change the topic, questions or vocabulary for your class.';
    if(!dialog.open)dialog.showModal();find('title').focus({preventScroll:true});
    const token=request;
    try{
      const manifest=await getManifest();if(token!==request||!dialog.open)return;
      const found=manifest.activities[id];if(!found)throw new Error('No source entry is available for this resource.');
      activity={id,...found};find('activity-title').textContent=activity.title;
      find('credit').textContent=(activity.credit?activity.credit+'. ':'')+'Keep the original author and data-source credits in your adaptation.';
      if(activity.kind==='slides'){
        ['html-actions','help','project','code-details'].forEach(id=>find(id).hidden=true);
        find('intro').textContent='This resource is a Google Slides template. Make a copy to adapt it for your class.';
        find('slides-copy').hidden=false;find('slides-copy').href=activity.copy_url;
        find('source').href=activity.url;find('source').textContent='Open the original template ↗';status('Ready to make your own Slides copy.');
      }else{
        find('source').textContent='View original source files ↗';
        find('version').replaceChildren(...activity.versions.map((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=v.label;return o;}));
        find('version-field').hidden=activity.versions.length<2;
        await loadVersion(0);
      }
      track('make_it_my_own');
    }catch(error){if(token===request&&dialog.open)status(error.message,true);}
  }
  async function copy(text,label,event){
    try{
      await navigator.clipboard.writeText(text);status(label+' copied. Paste it into your editor or AI tool.');track(event);
    }catch{
      find('code-details').open=true;find('code').value=text;find('code').focus();find('code').select();
      status('Select Copy from your browser menu, or press Ctrl+C (⌘C on Mac).');
    }
  }
  document.addEventListener('click',e=>{const button=e.target.closest('button[data-own-id]');if(button)open(button.dataset.ownId,button);});
  find('version').addEventListener('change',()=>loadVersion(Number(find('version').value)));
  dialog.querySelector('.own-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{releaseDownload();controller?.abort();++request;prepared=null;opener?.focus({preventScroll:true});});
  find('download').addEventListener('click',e=>{if(!prepared){e.preventDefault();return;}status('HTML download started. Your original activity is unchanged.');track('html_download');});
  find('download').addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();if(prepared)find('download').click();}});
  find('copy').addEventListener('click',()=>{if(prepared)copy(prepared.html,'HTML','html_copy');});
  find('prompt').addEventListener('click',()=>{
    if(!prepared)return;
    const text='Adapt this '+activity.title+' HTML for my class.\n\nChanges I want: [describe the grade, topic, questions or vocabulary].\n\nKeep the layout responsive on Chromebook, tablet and phone. Keep keyboard and touch controls working. Preserve the original author and data-source credits and the online asset links. Return one complete updated HTML file I can download and host.\n\n```html\n'+prepared.html+'\n```';
    copy(text,'AI prompt and HTML','adapt_prompt_copy');
  });
  find('preview').addEventListener('click',()=>{
    if(!prepared)return;
    const url=URL.createObjectURL(new Blob([prepared.html],{type:'text/html'}));
    const opened=window.open(url,'_blank');
    if(!opened){URL.revokeObjectURL(url);status('Your browser blocked the preview tab. Download the HTML to open your copy.');return;}
    // Give the new document time to load before releasing its URL.
    setTimeout(()=>URL.revokeObjectURL(url),120000);status('Your editable copy opened in a new tab.');
  });
  find('zip').addEventListener('click',async()=>{
    if(!version)return;controller?.abort();controller=new AbortController();const token=++request;
    find('zip').disabled=true;status('Gathering project files…');
    try{
      const result=await LabCopy.project(version,activity,await getManifest(),controller.signal,(done,total)=>{if(token===request)status('Gathering project files: '+done+' of '+total+'…');});
      if(token!==request||!dialog.open)return;
      LabCopy.download(filename('.zip'),result.bytes,'application/zip');status('Project ZIP downloaded ('+result.files+' files). Open START-HERE.txt first.');track('project_download');
    }catch(error){if(token===request&&dialog.open&&error.name!=='AbortError')status(error.message,true);}
    finally{if(token===request)find('zip').disabled=false;}
  });
  find('source').addEventListener('click',()=>track('source_files_open'));
  find('slides-copy').addEventListener('click',()=>track('template_copy'));
})();
