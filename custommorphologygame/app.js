    const wordSets = [
            { root: 'kind', prefixes: ['un'], suffixes: ['ly', 'ness'], prefixRedHerrings: ['re'], suffixRedHerrings: ['er', 's'], validWords: ['kind', 'kindly', 'kindness', 'unkind', 'unkindly'] },
            { root: 'lock', prefixes: ['un'], suffixes: ['s', 'ed'], prefixRedHerrings: ['re'], suffixRedHerrings: ['ing', 'ful'], validWords: ['lock', 'locks', 'locked', 'unlock', 'unlocks', 'unlocked'] },
            { root: 'pack', prefixes: ['un'], suffixes: ['s', 'ed', 'ing'], prefixRedHerrings: ['re', 'in'], suffixRedHerrings: ['er', 'ly'], validWords: ['pack', 'packs', 'packed', 'packing', 'unpack', 'unpacks', 'unpacked', 'unpacking'] },
            { root: 'help', prefixes: ['un'], suffixes: ['s', 'ed', 'ing', 'er', 'ful', 'less'], prefixRedHerrings: ['re', 'dis'], suffixRedHerrings: ['ly', 'ness', 'ion'], validWords: ['help', 'helps', 'helped', 'helping', 'helper', 'helpers', 'helpful', 'helpless', 'unhelpful'] },
            { root: 'act', prefixes: ['re', 'en', 'inter'], suffixes: ['s', 'ed', 'ing', 'or', 'ion', 'ive'], prefixRedHerrings: ['un', 'pre'], suffixRedHerrings: ['ly', 'ment'], validWords: ['act', 'acts', 'acted', 'acting', 'actor', 'actors', 'action', 'actions', 'active', 'react', 'reacts', 'reacted', 'reacting', 'reaction', 'reactions', 'enact', 'enacts', 'enacted', 'enacting', 'interact', 'interacts', 'interacted', 'interacting', 'interaction', 'interactions'] },
            { root: 'port', prefixes: ['im', 'ex', 're', 'sup', 'trans'], suffixes: ['s', 'ed', 'ing', 'er', 'able'], prefixRedHerrings: ['un', 'de'], suffixRedHerrings: ['ion', 'ive', 'ly'], validWords: ['port', 'ports', 'ported', 'porting', 'porter', 'porters', 'portable', 'import', 'imports', 'importer', 'importers', 'imported', 'importing', 'export', 'exports', 'exporter', 'exporters', 'exported', 'exporting', 'report', 'reports', 'reporter', 'reporters', 'reported', 'reporting', 'support', 'supports', 'supporter', 'supporters', 'supported', 'supporting', 'transport', 'transports', 'transported', 'transporting', 'transporter'] }
        ];

    let currentWordSet, currentWord = [], foundWords = [], gameIndex = 0;
    
    const gameContainer = document.getElementById('gameContainer');
    const builderContainer = document.getElementById('builderContainer');
    const prefixesContainer = document.getElementById('prefixes');
    const rootContainer = document.getElementById('root');
    const suffixesContainer = document.getElementById('suffixes');
    const currentWordDisplay = document.getElementById('currentWordDisplay');
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const feedbackEl = document.getElementById('feedback');
    const foundWordsContainer = document.getElementById('foundWords');
    const wordCounter = document.getElementById('wordCounter');
    const progressBar = document.getElementById('progressBar');
    
    // Builder elements
    const showBuilderBtn = document.getElementById('showBuilderBtn');
    const backToGameBtn = document.getElementById('backToGameBtn');
    const startCustomBtn = document.getElementById('startCustomBtn');
    const builderFeedback = document.getElementById('builderFeedback');

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createMorphemeButton(text, type) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', text + ' ' + (type === 'root' ? 'base or root' : type));
        btn.className = 'morpheme-tile';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'morpheme-tile-text';
        textSpan.textContent = text;
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'morpheme-tile-label';

        if (type === 'prefix') { 
            btn.classList.add('prefix-tile'); 
            labelSpan.textContent = 'prefix';
        } 
        else if (type === 'suffix') { 
            btn.classList.add('suffix-tile');
            labelSpan.textContent = 'suffix';
        }
         else if (type === 'root') { 
            btn.classList.add('root-word-tile');
            labelSpan.textContent = 'base / root';
        }
        
        btn.appendChild(textSpan);
        btn.appendChild(labelSpan);
        btn.dataset.type = type;
        btn.addEventListener('click', () => addMorpheme(text, type));
        return btn;
    }

    function addMorpheme(text, type) {
        const lastPart = currentWord.length > 0 ? currentWord[currentWord.length - 1].type : null;
        if (type === 'prefix' && currentWord.length === 0) { currentWord.push({ type, text }); } 
        else if (type === 'root' && (lastPart === 'prefix' || lastPart === null)) { currentWord.push({ type, text }); } 
        else if (type === 'suffix' && (lastPart === 'root' || lastPart === 'suffix')) { currentWord.push({ type, text }); }
        updateCurrentWordDisplay();
    }
    
    function updateCurrentWordDisplay() { currentWordDisplay.textContent = currentWord.length > 0 ? currentWord.map(p => p.text).join('') : '\u00A0'; }
    
    function clearCurrentWord(clearFeedback=true) { currentWord = []; updateCurrentWordDisplay(); if(clearFeedback)feedbackEl.textContent = ''; }
    
    function checkWord() {
        if(checkBtn.disabled)return;
        const wordToCheck = currentWord.map(part => part.text).join('').toLowerCase();
        if (!wordToCheck || !currentWord.some(p=>p.type==='root')) { feedbackEl.textContent='Select a base or root, then add parts and check your word.'; return; }
        feedbackEl.classList.remove('shake-anim');
        void feedbackEl.offsetWidth;
        if (currentWordSet.validWords.includes(wordToCheck)) {
            if (foundWords.includes(wordToCheck)) {
                feedbackEl.textContent = "Already found!";
                feedbackEl.className = 'text-center text-lg font-semibold text-amber-600';
            } else {
                feedbackEl.textContent = `Collected ${wordToCheck}. Explain its meaning or use it in a sentence.`;
                feedbackEl.className = 'text-center text-lg font-semibold text-green-600';
                foundWords.push(wordToCheck);
                renderFoundWords();
            }
        } else {
            feedbackEl.textContent = "That construction is not in this activity’s word bank. Try different parts or use a clue.";
            feedbackEl.className = 'text-center text-lg font-semibold text-red-600 shake-anim';
        }
        clearCurrentWord(false);
    }
    
    function renderFoundWords() {
        foundWordsContainer.innerHTML = '';
        foundWords.sort().forEach(word => {
            const wordEl = document.createElement('span');
            wordEl.className = 'found-word';
            wordEl.textContent = word;
            foundWordsContainer.appendChild(wordEl);
        });
        const progress = (foundWords.length / currentWordSet.validWords.length) * 100;
        progressBar.style.width = `${progress}%`;
        wordCounter.textContent = `${foundWords.length}/${currentWordSet.validWords.length}`;
        if (foundWords.length === currentWordSet.validWords.length && currentWordSet.validWords.length > 0) { moveToNextLevel(); }
    }
    
    function moveToNextLevel() {
        checkBtn.disabled=true;
        const last=gameIndex===wordSets.length-1;
        newGameBtn.disabled=gameIndex<0 || last;
        feedbackEl.textContent=gameIndex<0?'Custom family complete! Restart to practise again.':last?'All six families complete! Choose a family to practise again.':'Family complete! Choose Next Level when you are ready.';
    }
    function initGame(levelData) {
        if (typeof levelData === 'number') {
            gameIndex = levelData;
            currentWordSet = wordSets[gameIndex];
            newGameBtn.disabled = false;
        } else if (typeof levelData === 'object') {
            gameIndex = -1; // Flag for custom level
            currentWordSet = levelData;customFamily=levelData;
            newGameBtn.disabled = true; // Disable "Next Level" for custom games
        } else {
            return; // Invalid data
        }

        clearCurrentWord();
        foundWords = [];
        prefixesContainer.innerHTML = ''; rootContainer.innerHTML = ''; suffixesContainer.innerHTML = '';
        
        // Combine real prefixes and red herrings, then shuffle
        const allPrefixes = (currentWordSet.prefixes || []).concat(currentWordSet.prefixRedHerrings || []);
        shuffleArray(allPrefixes);
        allPrefixes.forEach(p => prefixesContainer.appendChild(createMorphemeButton(p, 'prefix')));
        
        const rootDiv = createMorphemeButton(currentWordSet.root, 'root');
        rootContainer.appendChild(rootDiv);

        // Combine real suffixes and red herrings, then shuffle
        const allSuffixes = (currentWordSet.suffixes || []).concat(currentWordSet.suffixRedHerrings || []);
        shuffleArray(allSuffixes);
        allSuffixes.forEach(s => suffixesContainer.appendChild(createMorphemeButton(s, 'suffix')));

        newGameBtn.disabled=true;document.getElementById('familySelect').value=String(gameIndex);
        // Reset UI
        checkBtn.disabled = false;
        feedbackEl.innerHTML = '&nbsp;';
        gameContainer.style.opacity = '1';
        
        renderFoundWords();
    }
    

    function parseCsvInput(str) {
        if (!str) return [];
        return str.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }
    
    // --- Event Listeners ---
    
    checkBtn.addEventListener('click', checkWord);
    clearBtn.addEventListener('click', clearCurrentWord);
    newGameBtn.addEventListener('click', () => {if(!newGameBtn.disabled&&gameIndex>=0)initGame(gameIndex+1)});
    
    showBuilderBtn.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        builderContainer.classList.remove('hidden');
        builderFeedback.innerHTML = '&nbsp;';
    });
    
    backToGameBtn.addEventListener('click', () => {
        builderContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
    });
    
    const fieldMap={root:'customRoot',prefixes:'customPrefixes',suffixes:'customSuffixes',prefixRedHerrings:'customPrefixHerrings',suffixRedHerrings:'customSuffixHerrings',validWords:'customValidWords'};
    function customFromFields(){return Object.fromEntries(Object.entries(fieldMap).map(([key,id])=>[key,key==='root'?document.getElementById(id).value.trim().toLowerCase():parseCsvInput(document.getElementById(id).value)]))}
    function fillCustom(data){for(const [key,id]of Object.entries(fieldMap))document.getElementById(id).value=key==='root'?data.root:data[key].join(', ')}
    startCustomBtn.addEventListener('click',()=>{try{const data=MorphemeTiles.validate(customFromFields());Workshop.save('tile-morphology-custom-v2',data);let customOption=document.getElementById('customOption');if(!customOption){customOption=document.createElement('option');customOption.id='customOption';customOption.value='-1';customOption.textContent='My custom family';document.getElementById('familySelect').append(customOption)}initGame(data);builderContainer.classList.add('hidden');gameContainer.classList.remove('hidden');document.getElementById('restartFamily').focus()}catch(e){builderFeedback.textContent=e.message}});
    const savedCustom=Workshop.load('tile-morphology-custom-v2',null);if(savedCustom){try{fillCustom(MorphemeTiles.validate(savedCustom))}catch{}}
    document.getElementById('exportCustom').onclick=()=>{try{Workshop.download('my-morpheme-family.json',JSON.stringify(MorphemeTiles.validate(customFromFields()),null,2),'application/json');builderFeedback.textContent='Custom family downloaded.'}catch(e){builderFeedback.textContent=e.message}};
    document.getElementById('importCustom').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('Choose a JSON family smaller than 100 KB.');fillCustom(MorphemeTiles.validate(JSON.parse(await file.text())));builderFeedback.textContent='Family imported. Review it, then start your game.'}catch(e){builderFeedback.textContent=e.message}e.target.value=''};
    // Start the first pre-built level
    initGame(0);

    let customFamily=null;
    const familySelect=document.getElementById('familySelect');
    wordSets.forEach((set,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=(i+1)+'. '+set.root;familySelect.append(option)});familySelect.value='0';
    familySelect.onchange=()=>{if(+familySelect.value>=0)initGame(+familySelect.value);else initGame(customFamily)};
    document.getElementById('restartFamily').onclick=()=>initGame(gameIndex<0?currentWordSet:gameIndex);
    document.getElementById('wordClue').onclick=()=>{const next=currentWordSet.validWords.find(w=>!foundWords.includes(w));if(!next){feedbackEl.textContent='All words collected. Restart this family to practise again.';return}const parts=MorphemeTiles.route(currentWordSet,next);feedbackEl.textContent='Try '+parts.map(p=>p.text).join(' + ')+'. Explain what the word means.'};
    const progressNode=document.getElementById('progressBar');const originalRender=renderFoundWords;
    renderFoundWords=function(){originalRender();progressNode.setAttribute('aria-valuenow',foundWords.length);progressNode.setAttribute('aria-valuemax',currentWordSet.validWords.length)};renderFoundWords();
