const { useState, useEffect, useRef } = React;

        // --- Icons ---
        const Icon = ({ name, color = "currentColor", size = 24, className="" }) => {
            const icons = {
                eye: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
                plus: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
                camera: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
                trash: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
                download: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
                image: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
                refresh: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>,
                chevronDown: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>,
                lightbulb: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
                zoomIn: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>,
                spotlight: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M5 5l1.5 1.5"/><path d="M17.5 17.5L19 19"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M5 19l1.5-1.5"/><path d="M17.5 6.5L19 5"/></svg>,
                sliderTool: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M12 5v14"/><path d="m8 10-2 2 2 2"/><path d="m16 14 2-2-2-2"/></svg>,
                chevronLeftRight: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
            };
            return icons[name] || null;
        };

        const analysisPrompts = {
            Who: ["Who or what is represented? What visible evidence supports your idea?", "Who created this source, and whose perspectives are missing?"],
            What: ["What details can you observe before making an inference?", "What is your interpretation? Which details support it?"],
            When: ["What clues suggest a time period? Check the source date.", "Was this made during the event, or later? Why might that matter?"],
            Where: ["What clues suggest a location or setting?", "What does the creator show beyond the main subject, and what is outside the frame?"],
            Why: ["Who was the intended audience, and what purpose might this source serve?", "What further evidence would help you test your interpretation?"]
        };

        const categoryColors = {
            "Who": { bg: "bg-blue-100", menuHover: "hover:bg-blue-50 hover:text-blue-700", text: "text-blue-700", activeBorder: "border-blue-600" },
            "What": { bg: "bg-green-100", menuHover: "hover:bg-green-50 hover:text-green-700", text: "text-green-700", activeBorder: "border-green-600" },
            "When": { bg: "bg-purple-100", menuHover: "hover:bg-purple-50 hover:text-purple-700", text: "text-purple-700", activeBorder: "border-purple-600" },
            "Where": { bg: "bg-amber-100", menuHover: "hover:bg-amber-50 hover:text-amber-700", text: "text-amber-700", activeBorder: "border-amber-600" },
            "Why": { bg: "bg-rose-100", menuHover: "hover:bg-rose-50 hover:text-rose-700", text: "text-rose-700", activeBorder: "border-rose-600" }
        };

        // Load the export helper only when requested, so it cannot block the activity.
        let captureLibraryPromise;
        const loadCaptureLibrary = () => {
            if(window.html2canvas)return Promise.resolve();
            if(captureLibraryPromise)return captureLibraryPromise;
            captureLibraryPromise=new Promise((resolve,reject)=>{
                const script=document.createElement('script');
                const timer=setTimeout(()=>{script.remove();captureLibraryPromise=null;reject(new Error('Export library timed out.'));},12000);
                script.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                script.onload=()=>{clearTimeout(timer);resolve();};
                script.onerror=()=>{clearTimeout(timer);captureLibraryPromise=null;reject(new Error('Export library unavailable.'));};
                document.head.appendChild(script);
            });return captureLibraryPromise;
        };
        // --- Helper: Save as Image ---
        const saveAsImage = async (elementId, title) => {
            const element = document.getElementById(elementId);
            if(!element) return;
            try {
                await loadCaptureLibrary();
                const canvas = await window.html2canvas(element, { 
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true
                });
                
                const link = document.createElement('a');
                link.download = `${filename(title)}_Analysis.png`;
                link.href = canvas.toDataURL();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Image capture failed:", err);
                alert("Couldn't save image. Please try again.");
            }
        };

        const STORAGE_KEY = 'imagespark-work-v2';
        const blankWeb = () => ({ ideas: [], question: 'What do I notice?' });
        const filename = title => title.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 75) || 'Image_Spark';
        const downloadFile = (content, type, name) => {
            const url = URL.createObjectURL(new Blob([content], {type}));
            const link = document.createElement('a');
            link.href = url; link.download = name; document.body.appendChild(link);
            link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        const customKey = url => {
            let hash = 2166136261;
            for (let i = 0; i < url.length; i++) hash = Math.imul(hash ^ url.charCodeAt(i), 16777619);
            return 'custom-' + (hash >>> 0).toString(16);
        };
        const isImageUrl = url => typeof url === 'string' && ( /^https?:\/\//i.test(url) || /^data:image\/(png|jpeg|webp);base64,/i.test(url));
        const validateProject = raw => {
            if (!raw || raw.version !== 2 || !raw.view || !raw.webs || Array.isArray(raw.webs)) throw new Error('Choose an Image Spark work file.');
            const {key, url, title, era} = raw.view;
            if (typeof key !== 'string' || key.length > 100 || !isImageUrl(url) && !/^images\/grade7\/[a-z0-9-]+\.jpg$/.test(url) || typeof title !== 'string') throw new Error('The image information in this file is invalid.');
            const webs = Object.create(null);
            const colors = ['bg-yellow-100', ...Object.values(categoryColors).map(c => c.bg)];
            const entries = Object.entries(raw.webs);
            if (entries.length > 100) throw new Error('This work file contains too many images.');
            for (const [id, web] of entries) {
                if (id.length > 100 || !web || !Array.isArray(web.ideas) || web.ideas.length > 250) throw new Error('The notes in this file are invalid.');
                webs[id] = {question: String(web.question || 'What do I notice?').slice(0, 500), ideas: web.ideas.map((idea, i) => ({
                    id: typeof idea.id === 'string' || typeof idea.id === 'number' ? idea.id : i,
                    text: String(idea.text || '').slice(0, 2000),
                    x: Number.isFinite(idea.x) ? Math.max(0, Math.min(100, idea.x)) : 50,
                    y: Number.isFinite(idea.y) ? Math.max(0, Math.min(100, idea.y)) : 50,
                    rotate: Number.isFinite(idea.rotate) ? Math.max(-5, Math.min(5, idea.rotate)) : 0,
                    color: colors.includes(idea.color) ? idea.color : 'bg-yellow-100'
                }))};
            }
            return {version: 2, view: {key, url, title: title.slice(0,300), era: String(era || 'Unspecified Era').slice(0,50)}, webs};
        };
        const grade7Images = window.imageSparkGrade7 || [];
        const defaultView = grade7Images.length ? {...grade7Images[0], key: grade7Images[0].id} : {key:'default', url:'https://www.cwjefferys.ca/uploads/thumbnails/JACQUESCARTIERERECTSACROSSATGASPE.jpg.65c2da11.jpg', title:'Cartier Erecting a Cross at Gaspe', era:'Exploration'};
        const loadWork = () => {
            let project = {version:2, view:defaultView, webs:{}};
            try { const saved = localStorage.getItem(STORAGE_KEY); if(saved) project = validateProject(JSON.parse(saved)); } catch (_) {}
            const shared = grade7Images.find(p => p.id === new URLSearchParams(location.search).get('image'));
            if(shared) project.view = {...shared, key:shared.id};
            return project;
        };

        const MindWeb = ({ title, web, setWeb, sourceInfo, onSaveWork, onOpenWork, status }) => {
            const {ideas, question} = web;
            const [newIdea, setNewIdea] = useState('');
            const [activeCategory, setActiveCategory] = useState(null);
            const [undo, setUndo] = useState(null);
            const containerRef = useRef(null);
            const drag = useRef(null);
            const [draggingId, setDraggingId] = useState(null);
            const remember = () => setUndo(JSON.parse(JSON.stringify(web)));
            const updateIdeas = fn => setWeb(current => ({...current, ideas:fn(current.ideas)}));
            const addIdea = () => {
                if(!newIdea.trim()) return;
                remember();
                const positions = [[20,22],[75,18],[78,72],[20,76],[48,10],[48,88]];
                const [x,y] = positions[ideas.length % positions.length];
                updateIdeas(old => [...old, {id: Date.now() + '-' + Math.random().toString(36).slice(2,7), text:newIdea.trim(), x,y,rotate:Math.random()*6-3,color:activeCategory ? categoryColors[activeCategory].bg : 'bg-yellow-100'}]);
                setNewIdea('');
            };
            const removeIdea = id => { remember(); updateIdeas(old => old.filter(idea => idea.id !== id)); };
            const resetWeb = () => { if(ideas.length && confirm('Clear the observations for this image? You can Undo this.')) {remember(); updateIdeas(() => []);} };
            const saveAsText = () => {
                const context = sourceInfo ? `\nDate: ${sourceInfo.date}\nSource: ${sourceInfo.source}\nCredit: ${sourceInfo.credit}\nRights: ${sourceInfo.license} (${sourceInfo.licenseUrl})\nGrade 7 connection: ${sourceInfo.connection}` : '';
                downloadFile(`Image Analysis: ${title}${context}\n\nQuestion: ${question}\n\nObservations and interpretations:\n${ideas.map(idea => '- ' + idea.text).join('\n')}\n\nCreated with Image Spark`, 'text/plain;charset=utf-8', filename(title) + '_Analysis.txt');
            };
            const startDrag = (e, idea) => {
                e.preventDefault();
                const rect = containerRef.current.getBoundingClientRect();
                const noteRect=e.currentTarget.closest('.sticky-note').getBoundingClientRect();
                remember(); drag.current = {id:idea.id, x:e.clientX, y:e.clientY, startX:(noteRect.left+noteRect.width/2-rect.left)/rect.width*100, startY:(noteRect.top+noteRect.height/2-rect.top)/rect.height*100, width:rect.width, height:rect.height};
                e.currentTarget.setPointerCapture(e.pointerId); setDraggingId(idea.id);
            };
            const moveDrag = e => {
                if(!drag.current) return;
                const d = drag.current;
                updateIdeas(old => old.map(idea => idea.id === d.id ? {...idea, x:Math.max(0,Math.min(100,d.startX+(e.clientX-d.x)/d.width*100)), y:Math.max(0,Math.min(100,d.startY+(e.clientY-d.y)/d.height*100))} : idea));
            };
            const endDrag = () => { drag.current=null; setDraggingId(null); };
            const keyboardMove = (e, id) => {
                const offsets = {ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};
                if(!offsets[e.key]) return;
                e.preventDefault(); const [dx,dy]=offsets[e.key];
                const rect=containerRef.current.getBoundingClientRect(), noteRect=e.currentTarget.closest('.sticky-note').getBoundingClientRect();
                const x=(noteRect.left+noteRect.width/2-rect.left)/rect.width*100, y=(noteRect.top+noteRect.height/2-rect.top)/rect.height*100;
                updateIdeas(old => old.map(idea => idea.id === id ? {...idea,x:Math.max(0,Math.min(100,x+dx)), y:Math.max(0,Math.min(100,y+dy))} : idea));
            };
            return (
                <div className="mind-workspace flex flex-col h-full">
                    <div className="mb-3 shrink-0 z-20">
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {Object.keys(analysisPrompts).map(cat => {const c=categoryColors[cat], active=activeCategory===cat; return <button key={cat} aria-expanded={active} onClick={() => setActiveCategory(active?null:cat)} className={`flex-1 min-w-[44px] py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border-2 ${active ? `${c.bg} ${c.text} ${c.activeBorder} shadow-sm` : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-indigo-50'}`}>{cat}</button>;})}
                        </div>
                        {activeCategory && <div className={`prompt-list mt-2 p-2.5 rounded-xl border-2 ${categoryColors[activeCategory].bg} ${categoryColors[activeCategory].activeBorder} border-opacity-40 shadow-inner animate-fadeIn`}><div className="flex flex-col gap-1.5">{analysisPrompts[activeCategory].map(prompt => <button key={prompt} title="Use this as your web question" onClick={() => setWeb(current => ({...current, question:prompt}))} className="text-left text-xs bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-white text-slate-700">{prompt}</button>)}</div></div>}
                    </div>
                    <form onSubmit={e => {e.preventDefault(); addIdea();}} className="flex gap-2 mb-4 shrink-0">
                        <input aria-label="New observation" maxLength={2000} className="min-w-0 flex-1 px-4 py-2 border-2 border-slate-200 rounded-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm text-sm text-slate-700 font-medium" placeholder="I notice..." value={newIdea} onChange={e=>setNewIdea(e.target.value)}/>
                        <button type="submit" aria-label="Add observation" disabled={!newIdea.trim()} className="bg-indigo-600 text-white p-2 px-4 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2 font-bold text-sm"><Icon name="plus" size={18}/><span className="hidden xl:inline">Add</span></button>
                    </form>
                    <div id="mind-web-capture" className="web-canvas relative flex-1 bg-white rounded-2xl border border-slate-200 shadow-inner overflow-hidden">
                        <div ref={containerRef} className="w-full h-full relative">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage:'radial-gradient(#4f46e5 1px, transparent 1px)',backgroundSize:'24px 24px'}}/>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-48 text-center">
                                <div className="bg-white border-4 border-indigo-100 p-4 rounded-full shadow-2xl flex items-center justify-center aspect-square animate-float mx-auto"><div className="text-center"><div className="text-2xl mb-1">👁️</div><textarea aria-label="Web question" maxLength={500} value={question} onChange={e=>setWeb(current=>({...current,question:e.target.value}))} className="font-heading font-bold text-indigo-900 text-base md:text-lg bg-transparent text-center border-none pointer-events-auto w-full break-words resize-none" rows={3}/></div></div>
                            </div>
                            {ideas.map(idea => <div key={idea.id} className={`sticky-note absolute ${idea.color} p-2 rounded-xl shadow-md border border-black/5 ${draggingId===idea.id?'z-50':'z-20'}`} style={{left:`clamp(92px, ${idea.x}%, calc(100% - 92px))`, top:`clamp(76px, ${idea.y}%, calc(100% - 76px))`, transform:`translate(-50%, -50%) rotate(${idea.rotate}deg)`}}>
                                <button data-html2canvas-ignore="true" aria-label="Move observation: drag or use arrow keys" title="Drag here or use arrow keys to move" onPointerDown={e=>startDrag(e,idea)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={e=>keyboardMove(e,idea.id)} className="sticky-handle block w-full text-slate-500 text-xs cursor-move">•••</button>
                                <textarea aria-label="Edit observation" maxLength={2000} rows={Math.max(2,Math.min(5,Math.ceil(idea.text.length/19)))} value={idea.text} onChange={e=>{const text=e.target.value; updateIdeas(old=>old.map(n=>n.id===idea.id?{...n,text}:n));}} className="handwritten text-base text-slate-800 leading-tight bg-transparent border-0 resize-none w-full"/>
                                <button data-html2canvas-ignore="true" aria-label="Delete observation" onClick={()=>removeIdea(idea.id)} className="sticky-delete absolute -top-2 -right-2 bg-white text-rose-500 rounded-full p-1 shadow-sm hover:bg-rose-50 border border-rose-100 flex items-center justify-center"><Icon name="plus" size={14} className="rotate-45"/></button>
                            </div>)}
                            {!ideas.length && <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-xs pointer-events-none px-4">What details do you notice? Add them to the web!</div>}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-center mt-3 gap-2 shrink-0">
                        <div className="flex gap-1"><button onClick={resetWeb} className="text-slate-400 hover:text-rose-500 text-xs font-semibold flex items-center gap-1 px-2 py-1"><Icon name="trash" size={14}/>Reset</button><button disabled={!undo} onClick={()=>{setWeb(undo);setUndo(null);}} className="text-slate-500 disabled:opacity-40 text-xs font-semibold px-2">Undo</button></div>
                        <div className="flex gap-2"><button onClick={saveAsText} className="bg-white border border-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1 text-xs"><Icon name="download" size={16}/>Text</button><button onClick={()=>saveAsImage('mind-web-capture',title)} className="bg-slate-800 text-white font-bold py-1.5 px-4 rounded-lg shadow-lg hover:bg-slate-700 flex items-center gap-1 text-xs"><Icon name="camera" size={16}/>Image</button></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 shrink-0"><button onClick={onSaveWork} className="font-semibold hover:text-indigo-600">Save work</button><button onClick={onOpenWork} className="font-semibold hover:text-indigo-600">Open work</button><span role="status" className="status-line ml-auto">{status}</span></div>
                </div>
            );
        };

        const eraPresets = [
            { label: "Exploration: Cartier Erecting a Cross at Gaspe (1534)", url: "https://www.cwjefferys.ca/uploads/thumbnails/JACQUESCARTIERERECTSACROSSATGASPE.jpg.65c2da11.jpg", title: "Cartier Erecting a Cross at Gaspe" },
            { label: "Exploration: Cartier at Hochelaga (1535)", url: "https://cdn.loc.gov/service/pnp/pga/02600/02616r.jpg", title: "Jacques Cartier at Hochelaga" },
            { label: "Early Canada: The First Prescription in Canada (1535)", url: "https://www.cwjefferys.ca/uploads/thumbnails/Sum21535Firstprescription.jpg.4c1d88fd.jpg", title: "The First Prescription in Canada" },
            { label: "Early Canada: Habitation at Port-Royal (1605)", url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Port-Royal_Nova-Scotia_1.jpg", title: "Habitation at Port-Royal" },
            { label: "Exploration: Henry Hudson Mutiny (1611)", url: "https://www.clo-ocol.gc.ca/sites/default/files/styles/large/public/picture5_0.jpg?itok=nNPuoKXw", title: "Henry Hudson Mutiny" },
            { label: "Exploration: Map of New France (1632)", url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Samuel_de_Champlain_Carte_geographique_de_la_Nouvelle_France.jpg", title: "Map of New France (1632)" },
            { label: "Early Canada: The Death of General Wolfe (1759)", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Benjamin_West_005.jpg/500px-Benjamin_West_005.jpg", title: "The Death of General Wolfe" },
            { label: "Confederation: Charlottetown Conference (1864)", url: "https://sencanada.ca/media/1xpo5dmv/com_hdr_father-of-confederation-charlottetown-conference.jpg", title: "Charlottetown Conference" },
            { label: "Confederation: Fathers of Confederation (Painting) (1864)", url: "https://sencanada.ca/media/347624/com_banner_fathers_of_confederation_new.jpg", title: "Fathers of Confederation (Painting)" },
            { label: "Western Expansion: The Last Spike (1885)", url: "https://raw.githubusercontent.com/Maltais239/historicalimages/main/LastSpike_Craigellachie_BC_Canada.jpg", title: "The Last Spike (1885)" },
            { label: "WWI: Canadians at Vimy Ridge (1917)", url: "https://www.veterans.gc.ca/sites/default/files/2025-07/1000x400-vimy.jpg", title: "Canadians at Vimy Ridge (1917)" },
            { label: "WWII: Wait for Me, Daddy (1940)", url: "https://2.bp.blogspot.com/-irqD4TjVUao/WAsB73lKI-I/AAAAAAAALmI/4cpDw15Hq3g8zeYi46zjodhzTTe_Aq8cgCLcB/s1600/wait_for_me_daddy_1940.jpg", title: "Wait for Me, Daddy" },
            { label: "WWII: Troops Landing at Juno Beach (1944)", url: "https://www.junobeach.org/wp-content/uploads/2022/04/Canadian-Army-Units-on-D-Day-720x480.jpg", title: "Troops Landing at Juno Beach (1944)" }
        ];

        const App = () => {
            const [project, setProject] = useState(loadWork);
            const {view} = project;
            const imageUrl = view.url, imageTitle = view.title, selectedEra = view.era;
            const sourceInfo = grade7Images.find(p => p.id === view.key);
            const web = project.webs[view.key] || blankWeb();
            const [status, setStatus] = useState('');
            const [imageError, setImageError] = useState(false);
            const [showImageInput, setShowImageInput] = useState(false);
            const [tempUrl, setTempUrl] = useState('');
            const [tempTitle, setTempTitle] = useState('');
            const workInput = useRef(null), uploadInput = useRef(null);
            const setWeb = update => setProject(current => ({...current, webs:{...current.webs, [current.view.key]: typeof update === 'function' ? update(current.webs[current.view.key] || blankWeb()) : update}}));
            const setSelectedEra = era => setProject(current => ({...current, view:{...current.view, era}}));
            const selectImage = preset => {
                setProject(current => ({...current, view:{key:preset.id || customKey(preset.url), url:preset.url, title:preset.title, era:preset.era || 'Unspecified Era'}}));
                setShowImageInput(false); setActiveTool('none'); setSliderPos(50); setTempUrl(''); setTempTitle('');
            };
            useEffect(() => {setImageError(false);}, [imageUrl]);
            useEffect(() => {
                const timer=setTimeout(() => {try{localStorage.setItem(STORAGE_KEY,JSON.stringify(project));setStatus('Saved on this device');}catch(_){setStatus('Device storage full — use Save work');}}, 350);
                return ()=>clearTimeout(timer);
            },[project]);
            const saveWork = () => downloadFile(JSON.stringify(project,null,2),'application/json',filename(imageTitle)+'_ImageSpark.json');
            const openWork = async e => {
                const file=e.target.files[0]; e.target.value=''; if(!file)return;
                try {if(file.size>20000000)throw new Error('Choose a work file smaller than 20 MB.'); const loaded=validateProject(JSON.parse(await file.text()));
                    if(Object.values(project.webs).some(w=>w.ideas.length) && !confirm('Open this saved project? Download your current work first if you need a separate copy.'))return;
                    setProject(loaded);setShowImageInput(false);setActiveTool('none');
                }catch(error){alert(error.message || 'This work file could not be opened.');}
            };
            const uploadImage = e => {
                const file=e.target.files[0]; e.target.value=''; if(!file)return;
                if(!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size>15000000){alert('Choose a JPG, PNG or WebP image smaller than 15 MB.');return;}
                const objectUrl=URL.createObjectURL(file), image=new Image();
                image.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(image.width,image.height));canvas.width=image.width*scale;canvas.height=image.height*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);selectImage({url:canvas.toDataURL('image/jpeg',0.86),title:tempTitle.trim() || file.name.replace(/\.[^.]+$/,'')});URL.revokeObjectURL(objectUrl);};
                image.onerror=()=>{URL.revokeObjectURL(objectUrl);alert('This image could not be opened.');};image.src=objectUrl;
            };

            // Tool State
            const [activeTool, setActiveTool] = useState("none"); // "none", "magnify", "mask", "slider"
            const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
            const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
            const [isHovering, setIsHovering] = useState(false);
            
            // Slider State
            const [sliderPos, setSliderPos] = useState(50);
            const [isDraggingSlider, setIsDraggingSlider] = useState(false);
            const imageRef = useRef(null);

            // Global mouse up for slider dragging safety
            useEffect(() => {
                const handleGlobalMouseUp = () => setIsDraggingSlider(false);
                window.addEventListener('mouseup', handleGlobalMouseUp);
                return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
            }, []);

            const handleMouseMove = (e) => {
                if (!imageRef.current) return;
                const rect = imageRef.current.getBoundingClientRect();
                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;
                
                setMousePos({ x: currentX, y: currentY });
                setImageSize({ width: rect.width, height: rect.height });

                if (isDraggingSlider && activeTool === 'slider') {
                    let newSliderPos = (currentX / rect.width) * 100;
                    setSliderPos(Math.max(0, Math.min(100, newSliderPos)));
                }
            };

            const toggleTool = (tool) => {
                setActiveTool(current => current === tool ? 'none' : tool);
            };

            const handleUpdateImage = () => {
                const url=tempUrl.trim();
                if(!url && tempTitle.trim()){setProject(current=>({...current,view:{...current.view,title:tempTitle.trim()}}));setShowImageInput(false);return;}
                if(!/^https?:\/\//i.test(url)){alert('Paste an image address beginning with https:// or upload an image.');return;}
                selectImage({url,title:tempTitle.trim() || 'Image for analysis'});
            };
            const handleResetDefaultImage = () => selectImage(defaultView);

            return (
                <div className="app-shell flex flex-col overflow-hidden">
                    <input ref={workInput} type="file" accept=".json,application/json" onChange={openWork} hidden />
                    <input ref={uploadInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} hidden />
                    {/* Header */}
                    <header className="app-header glass-panel shrink-0 z-50 px-6 py-3 border-b border-white/40 shadow-sm">
                        <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg">
                                    <Icon name="eye" size={18} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-heading font-extrabold text-slate-800 tracking-tight leading-none">Image Spark</h1>
                                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Visual Analysis</span>
                                </div>
                            </div>
                            <div className="header-selectors flex items-center gap-2">
                            <select aria-label="Grade 7 curriculum images" value={sourceInfo ? sourceInfo.id : ''} onChange={e=>{const preset=grade7Images.find(p=>p.id===e.target.value);if(preset)selectImage(preset);}} className="grade-selector min-w-0 text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 focus:ring-2 focus:ring-indigo-500 shadow-sm">
                                <option value="" disabled>Grade 7 curriculum images…</option>
                                {[...new Set(grade7Images.map(p=>p.theme))].map(theme=><optgroup key={theme} label={theme}>{grade7Images.filter(p=>p.theme===theme).map(p=><option key={p.id} value={p.id}>{p.title} — {p.date}</option>)}</optgroup>)}
                            </select>
                            <div className="relative">
                                <select aria-label="Historical era tag" 
                                    value={selectedEra}
                                    onChange={(e) => setSelectedEra(e.target.value)}
                                    className="appearance-none text-[10px] md:text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 pr-7 rounded-full border border-indigo-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all hover:bg-indigo-100"
                                >
                                    <option value="Unspecified Era">Tag Historical Era...</option>
                                    <option value="Exploration">Exploration</option>
                                    <option value="Early Canada">Early Canada</option>
                                    <option value="Confederation">Confederation</option>
                                    <option value="Western Expansion">Western Expansion</option>
                                    <option value="WWI">WWI</option>
                                    <option value="WWII">WWII</option>
                                    <option value="Modern Era">Modern Era</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500">
                                    <Icon name="chevronDown" size={14} />
                                </div>
                            </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 w-full mx-auto px-4 py-4 min-h-0">
                        
                        <div className="analysis-grid grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
                             
                             {/* Left: Image Container */}
                            <div className="image-panel bg-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden group border border-slate-700 flex flex-col h-full min-h-[300px]">
                                 
                                 {/* Controls */}
                                 <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
                                    <button 
                                        onClick={() => toggleTool('magnify')}
                                        className={`p-2 rounded-lg backdrop-blur-sm transition-colors shadow-lg border border-white/10 ${activeTool === 'magnify' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'}`}
                                        title="Magnifying Glass" aria-label="Magnifying Glass" aria-pressed={activeTool==='magnify'}
                                    >
                                        <Icon name="zoomIn" size={20} />
                                    </button>
                                    <button 
                                        onClick={() => toggleTool('mask')}
                                        className={`p-2 rounded-lg backdrop-blur-sm transition-colors shadow-lg border border-white/10 ${activeTool === 'mask' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'}`}
                                        title="Spotlight / Mask" aria-label="Spotlight / Mask" aria-pressed={activeTool==='mask'}
                                    >
                                        <Icon name="spotlight" size={20} />
                                    </button>
                                    <button 
                                        onClick={() => toggleTool('slider')}
                                        className={`p-2 rounded-lg backdrop-blur-sm transition-colors shadow-lg border border-white/10 ${activeTool === 'slider' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'}`}
                                        title="Reveal Slider" aria-label="Reveal Slider" aria-pressed={activeTool==='slider'}
                                    >
                                        <Icon name="sliderTool" size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setShowImageInput(!showImageInput)}
                                        className={`p-2 rounded-lg backdrop-blur-sm transition-colors shadow-lg border border-white/10 ${showImageInput ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'}`}
                                        title="Change Image" aria-label="Change Image" aria-expanded={showImageInput}
                                    >
                                        <Icon name={showImageInput ? "refresh" : "image"} size={20} />
                                    </button>
                                 </div>

                                 {/* Image Display */}
                                 <div 
                                    ref={imageRef}
                                    className={`relative w-full flex-1 bg-black flex items-center justify-center overflow-hidden ${(activeTool === 'magnify' || activeTool === 'mask') ? 'cursor-crosshair' : ''}`}
                                    onPointerMove={handleMouseMove}
                                    onPointerDown={e=>{if(activeTool==='magnify'||activeTool==='mask'){handleMouseMove(e);setIsHovering(true);}}}
                                    onPointerEnter={() => setIsHovering(true)}
                                    onPointerLeave={() => {setIsHovering(false);}}
                                    onPointerUp={()=>setIsDraggingSlider(false)} onPointerCancel={()=>setIsDraggingSlider(false)}
                                    style={{touchAction:activeTool==='none'?'auto':'none'}}
                                 >
                                    <img 
                                        src={imageUrl} 
                                        alt={imageTitle}
                                        className="w-full h-full object-contain"
                                        onError={() => setImageError(true)}
                                    />
                                    
                                    {imageError && <div role="alert" className="absolute inset-0 flex flex-col justify-center items-center gap-3 p-12 bg-slate-900 text-center"><p>This image could not be loaded.</p><button onClick={()=>setShowImageInput(true)} className="px-4 py-2 bg-indigo-600 rounded-lg">Choose another image</button></div>}
                                    {/* Reveal Slider Dark Overlay (Curtain) */}
                                    {activeTool === 'slider' && (
                                        <div 
                                            className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 pointer-events-none"
                                            style={{
                                                clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`
                                            }}
                                        />
                                    )}

                                    {/* Slider Handle */}
                                    {activeTool === 'slider' && (
                                        <div 
                                            className="absolute top-0 bottom-0 z-30"
                                            style={{ left: `${sliderPos}%` }}
                                        >
                                            {/* Center Line */}
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)] -ml-[1px]"></div>
                                            
                                            {/* Grabby Hand Handle */}
                                            <button aria-label="Reveal amount" role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(sliderPos)}
                                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-indigo-500 rounded-full shadow-xl flex items-center justify-center transition-transform z-40 select-none ${isDraggingSlider ? 'cursor-grabbing scale-110 bg-indigo-50' : 'cursor-grab hover:scale-110'}`}
                                                onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setIsDraggingSlider(true);}}
                                                onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setSliderPos(current=>e.key==='Home'?0:e.key==='End'?100:Math.max(0,Math.min(100,current+(e.key==='ArrowRight'?5:-5))));}}}
                                            >
                                                <Icon name="chevronLeftRight" size={18} className="text-indigo-600" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Mask Overlay */}
                                    {activeTool === 'mask' && (
                                        <div 
                                            className="absolute inset-0 bg-black/95 z-20 pointer-events-none transition-opacity duration-300"
                                            style={{
                                                WebkitMaskImage: isHovering ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, transparent 0, transparent 80px, black 120px)` : 'black',
                                                maskImage: isHovering ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, transparent 0, transparent 80px, black 120px)` : 'black'
                                            }}
                                        />
                                    )}

                                    {/* Magnifier Overlay */}
                                    {activeTool === 'magnify' && isHovering && (
                                         <div className="absolute w-[200px] h-[200px] border-4 border-indigo-500 shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-full overflow-hidden pointer-events-none z-30 bg-black"
                                             style={{ left: mousePos.x - 100, top: mousePos.y - 100 }}>
                                             <div style={{
                                                 position: 'absolute',
                                                 width: imageSize.width,
                                                 height: imageSize.height,
                                                 left: -mousePos.x + 100,
                                                 top: -mousePos.y + 100,
                                                 transform: 'scale(4.0)',
                                                 transformOrigin: `${mousePos.x}px ${mousePos.y}px`
                                             }}>
                                                 <img alt="" src={imageUrl} className="w-full h-full object-contain" />
                                             </div>
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-12 pointer-events-none z-10">
                                        <h2 className="text-lg md:text-2xl font-heading font-bold text-white text-center shadow-black drop-shadow-md">{imageTitle}</h2>
                                    </div>
                                 </div>

                                 {sourceInfo && <details key={view.key} className="source-details bg-slate-800/90 text-slate-200 text-xs px-4 shrink-0">
                                    <summary className="flex items-center font-semibold text-indigo-200">Source & Grade 7 inquiry <span className="ml-auto text-slate-400">{sourceInfo.kind}</span></summary>
                                    <div className="pb-4 space-y-2 leading-relaxed"><p>{sourceInfo.date} · {sourceInfo.credit}</p><p><a href={sourceInfo.source} target="_blank" rel="noopener noreferrer" className="underline text-indigo-200">View original source</a> · <a href={sourceInfo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{sourceInfo.license}</a></p><p><strong>Curriculum:</strong> {sourceInfo.connection}</p><p>{sourceInfo.inquiry}</p><button onClick={()=>setWeb(current=>({...current,question:sourceInfo.inquiry}))} className="bg-indigo-600 px-3 py-2 rounded-lg font-semibold">Use as web question</button></div>
                                 </details>}
                                 {/* Settings Drawer */}
                                 {showImageInput && (
                                    <div className="image-drawer absolute inset-x-0 top-0 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 p-6 animate-fadeIn z-30 shadow-2xl">
                                        <div className="max-w-xl mx-auto space-y-4">
                                            <h3 className="text-indigo-400 font-bold uppercase text-xs">Update Image Source</h3>
                                            
                                            {/* PRESET DROPDOWN */}
                                            <div>
                                                <label className="block text-slate-400 text-[10px] mb-1">Quick Load Era Preset</label>
                                                <div className="relative">
                                                    <select 
                                                        aria-label="Quick Load Era Preset" className="w-full appearance-none bg-slate-900 border border-indigo-500/50 rounded-lg px-3 py-2 pr-8 text-indigo-200 focus:border-indigo-400 outline-none text-sm cursor-pointer hover:border-indigo-400 transition-colors"
                                                        onChange={(e) => {
                                                            if(e.target.value) {
                                                                const preset = eraPresets.find(p => p.label === e.target.value);
                                                                if(preset) {
                                                                    selectImage(preset);
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <option value="">-- Choose a historical image --</option>
                                                        {eraPresets.map(preset => (
                                                            <option key={preset.label} value={preset.label}>{preset.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
                                                        <Icon name="chevronDown" size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <div>
                                                    <label className="block text-slate-400 text-[10px] mb-1">Image URL</label>
                                                    <input 
                                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                                                        aria-label="Image URL" placeholder="Paste image address..."
                                                        value={tempUrl}
                                                        onChange={(e) => setTempUrl(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-[10px] mb-1">Title / Caption</label>
                                                    <input 
                                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                                                        aria-label="Title / Caption" placeholder="e.g. The Death of Wolfe"
                                                        value={tempTitle}
                                                        onChange={(e) => setTempTitle(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={()=>uploadInput.current.click()} className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm text-indigo-200">Upload an image from this device</button>
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                                                <button 
                                                    onClick={handleResetDefaultImage}
                                                    className="text-slate-400 hover:text-indigo-400 text-xs transition-colors flex items-center gap-1"
                                                >
                                                    <Icon name="refresh" size={14} /> Reset to Default
                                                </button>
                                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                    <button 
                                                        onClick={() => setShowImageInput(false)}
                                                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={handleUpdateImage}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 text-sm"
                                                    >
                                                        Update View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                 )}
                            </div>

                            {/* Right: Mind Web Container */}
                            <div className="web-panel bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 border border-slate-100 flex flex-col h-full min-h-[400px]">
                                 <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 shrink-0">
                                    <div className="bg-pink-100 text-pink-600 p-1.5 rounded-lg">
                                        <Icon name="eye" size={16} />
                                    </div>
                                    <h3 className="text-lg font-heading font-bold text-slate-800">Visual Brainstorming</h3>
                                </div>
                                <div className="flex-1 relative">
                                     <MindWeb key={view.key} title={imageTitle} web={web} setWeb={setWeb} sourceInfo={sourceInfo} onSaveWork={saveWork} onOpenWork={()=>workInput.current.click()} status={status} />
                                </div>
                            </div>

                        </div>

                    </main>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
