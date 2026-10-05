let listenersReady=false;

        // --- DOM Elements ---
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        const startSampleBtn = document.getElementById('start-sample-btn');
        const importJsonBtn = document.getElementById('import-json-btn');
        const jsonImporter = document.getElementById('json-importer');
        const errorMessage = document.getElementById('error-message');
        
        // Game screen elements
        const termEl = document.getElementById('term');
        const defEl = document.getElementById('definition');
        const hintBtn = document.getElementById('hint-btn');
        const canvas = document.getElementById('drawing-canvas');
        const ctx = canvas.getContext('2d');
        const clearBtn = document.getElementById('clear-canvas-btn');
        const doneBtn = document.getElementById('done-btn');
        const colorPalette = document.getElementById('color-palette');
        const mainMenuBtn = document.getElementById('main-menu-btn');
        const brushSizeSlider = document.getElementById('brush-size');
        const fillBtn = document.getElementById('fill-btn');
        const eraserBtn = document.getElementById('eraser-btn');
        const undoBtn = document.getElementById('undo-btn');
        
        // Modal elements
        const resultModal = document.getElementById('result-modal');
        const userDrawingImg = document.getElementById('user-drawing');
        const correctImage = document.getElementById('correct-image');
        const nextWordBtn = document.getElementById('next-word-btn');


        // --- Game State ---
        let vocabulary = [];
        let currentWordIndex = 0;
        let isDrawing = false;
        let penColor = 'black';
        let penWidth = 3;
        let isFillMode = false;
        let isEraserMode = false;
        let historyStack = [];
        let historyIndex = -1;

        // --- Default Data ---
        const DEFAULT_VOCABULARY = [
            { term: 'Archipelago', definition: 'A group or chain of islands clustered together in a sea or ocean.', imageSrc: '' },
            { term: 'Peninsula', definition: 'A piece of land almost surrounded by water or projecting out into a body of water.', imageSrc: '' },
            { term: 'Canyon', definition: 'A deep gorge with steep sides, often carved by a river.', imageSrc: '' }
        ];

        // --- Initialization ---
        function init() {
            // Start screen listeners
            startSampleBtn.addEventListener('click', () => {
                hideErrorMessage();
                startGame(DEFAULT_VOCABULARY);
            });
            importJsonBtn.addEventListener('click', () => {
                hideErrorMessage();
                jsonImporter.click();
            });
            jsonImporter.addEventListener('change', handleFileUpload);
        }
        
        // --- UI Helpers ---
        function showErrorMessage(message) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }

        function hideErrorMessage() {
            if (!errorMessage.classList.contains('hidden')) {
                errorMessage.classList.add('hidden');
            }
        }
        
        function deactivateTools() {
            isFillMode = false;
            isEraserMode = false;
            canvas.classList.remove('fill-cursor');
            document.querySelectorAll('.tool-btn.active').forEach(b => b.classList.remove('active'));
        }
        
        function activateColor(colorButton) {
            deactivateTools();
            colorPalette.querySelector('.active')?.classList.remove('active');
            colorButton.classList.add('active');
            penColor = colorButton.dataset.color;
        }

        // --- File Handling ---
        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (file.size > 5*1024*1024) throw Error('File too large.');
                    startGame(CardSets.normalize(JSON.parse(e.target.result)));
                } catch (error) {
                    console.error("JSON Parse Error:", error);
                    showErrorMessage('Error reading the JSON file. It might be malformed.');
                }
            };
            reader.readAsText(file);
            event.target.value = null;
        }

        // --- Game Flow ---
        function startGame(vocabSet) {
            vocabulary = vocabSet;
            currentWordIndex = 0;
            
            startScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            gameScreen.classList.add('flex');
            
            if (!listenersReady) { setupGameListeners(); listenersReady = true; }
            loadWord();
        }

        function returnToMenu() {
            gameScreen.classList.add('hidden');
            gameScreen.classList.remove('flex');
            startScreen.classList.remove('hidden');
            deactivateTools();
        }
        
        function setupGameListeners() {
            canvas.addEventListener('mousedown', handleCanvasClick);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });
            canvas.addEventListener('touchmove', draw, { passive: false });
            canvas.addEventListener('touchend', stopDrawing);
            
            hintBtn.onclick = () => defEl.classList.toggle('hidden');
            clearBtn.onclick = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                saveState();
            };
            
            doneBtn.onclick = showResult;
            nextWordBtn.onclick = nextWord;

            mainMenuBtn.onclick = returnToMenu;

            colorPalette.addEventListener('click', (e) => {
                if (e.target.classList.contains('color-btn')) {
                    activateColor(e.target);
                }
            });

            brushSizeSlider.oninput = (e) => { penWidth = e.target.value; };

            fillBtn.onclick = () => {
                deactivateTools();
                isFillMode = true;
                fillBtn.classList.add('active');
                canvas.classList.add('fill-cursor');
            };
            
            eraserBtn.onclick = () => {
                deactivateTools();
                colorPalette.querySelector('.active')?.classList.remove('active');
                isEraserMode = true;
                eraserBtn.classList.add('active');
            };
            
            undoBtn.onclick = undo;
        }

        function loadWord() {
            termEl.textContent = vocabulary[currentWordIndex].term;
            defEl.textContent = vocabulary[currentWordIndex].definition;
            defEl.classList.add('hidden');
            document.getElementById('round-progress').textContent = `Word ${currentWordIndex+1} of ${vocabulary.length}`;
            document.getElementById('reflection').value = '';
            document.getElementById('review-definition').textContent = vocabulary[currentWordIndex].definition;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            historyStack = [];
            historyIndex = -1;
            saveState();
        }
        
        function showResult() {
            const drawingUrl = canvas.toDataURL('image/png');
            userDrawingImg.src = drawingUrl;
            correctImage.hidden = !vocabulary[currentWordIndex].imageSrc;
            if (!correctImage.hidden) correctImage.src = vocabulary[currentWordIndex].imageSrc;
            correctImage.onerror=()=>{correctImage.hidden=true};
            resultModal.classList.remove('hidden');
            resultModal.classList.add('flex');
        }

        function nextWord() {
            resultModal.classList.add('hidden');
            resultModal.classList.remove('flex');
            currentWordIndex++;
            if(currentWordIndex >= vocabulary.length){ returnToMenu(); errorMessage.textContent='Round complete. You illustrated '+vocabulary.length+' words. Start a new set when you are ready.'; errorMessage.classList.remove('hidden'); return; }
            loadWord();
        }

        // --- Canvas Drawing Functions ---
        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0,Math.min(canvas.width-1,Math.round(((e.touches ? e.touches[0].clientX : e.clientX) - rect.left)*canvas.width/rect.width)));
            const y = Math.max(0,Math.min(canvas.height-1,Math.round(((e.touches ? e.touches[0].clientY : e.clientY) - rect.top)*canvas.height/rect.height)));
            return { x, y };
        }

        function handleCanvasClick(e) {
            if (isFillMode) {
                const { x, y } = getPos(e);
                floodFill(x, y, hexToRgb(penColor));
                deactivateTools();
                saveState();
            } else {
                startDrawing(e);
            }
        }

        function startDrawing(e) {
            isDrawing = true;
            const { x, y } = getPos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const { x, y } = getPos(e);
            
            ctx.lineTo(x, y);
            ctx.strokeStyle = isEraserMode ? '#FFFFFF' : penColor;
            ctx.lineWidth = penWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        function stopDrawing() {
            if (!isDrawing) return;
            isDrawing = false;
            ctx.closePath();
            saveState();
        }

        // --- Undo Logic ---
        function saveState() {
            historyIndex++;
            if (historyIndex < historyStack.length) {
                historyStack.length = historyIndex;
            }
            historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if(historyStack.length>30){historyStack.shift();historyIndex--;}
        }

        function undo() {
            if (historyIndex > 0) {
                historyIndex--;
                ctx.putImageData(historyStack[historyIndex], 0, 0);
            }
        }

        // --- Fill Logic ---
        function hexToRgb(hex) {
            if (hex === 'black') return { r: 0, g: 0, b: 0, a: 255 };
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                a: 255
            } : null;
        }

        function floodFill(startX, startY, fillColor) {
            if (!fillColor) return;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const startPos = (startY * canvas.width + startX) * 4;
            const startR = data[startPos];
            const startG = data[startPos + 1];
            const startB = data[startPos + 2];
            const startA = data[startPos + 3];

            if (fillColor.r === startR && fillColor.g === startG && fillColor.b === startB && fillColor.a === startA) {
                return; // Clicked on same color
            }

            const pixelStack = [[startX, startY]];
            while (pixelStack.length) {
                let [x, y] = pixelStack.pop();
                let currentPos = (y * canvas.width + x) * 4;

                // Go up as long as we're in the right color
                while (y >= 0 && (data[currentPos] === startR && data[currentPos + 1] === startG && data[currentPos + 2] === startB && data[currentPos + 3] === startA)) {
                    y--;
                    currentPos -= canvas.width * 4;
                }
                currentPos += canvas.width * 4;
                y++;
                
                let reachLeft = false;
                let reachRight = false;
                
                while (y < canvas.height && (data[currentPos] === startR && data[currentPos + 1] === startG && data[currentPos + 2] === startB && data[currentPos + 3] === startA)) {
                    data[currentPos] = fillColor.r;
                    data[currentPos + 1] = fillColor.g;
                    data[currentPos + 2] = fillColor.b;
                    data[currentPos + 3] = fillColor.a;

                    if (x > 0) {
                        if (data[currentPos - 4] === startR && data[currentPos - 3] === startG && data[currentPos - 2] === startB && data[currentPos - 1] === startA) {
                            if (!reachLeft) {
                                pixelStack.push([x - 1, y]);
                                reachLeft = true;
                            }
                        } else if (reachLeft) {
                            reachLeft = false;
                        }
                    }

                    if (x < canvas.width - 1) {
                         if (data[currentPos + 4] === startR && data[currentPos + 5] === startG && data[currentPos + 6] === startB && data[currentPos + 7] === startA) {
                            if (!reachRight) {
                                pixelStack.push([x + 1, y]);
                                reachRight = true;
                            }
                        } else if (reachRight) {
                            reachRight = false;
                        }
                    }
                    y++;
                    currentPos += canvas.width * 4;
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
        
        // --- Start the app ---
        init();
    
document.getElementById('save-drawing').onclick=()=>{const a=document.createElement('a');a.download='definition-drawing.png';a.href=canvas.toDataURL('image/png');a.click();};
document.getElementById('continue-drawing').onclick=()=>{resultModal.classList.add('hidden');resultModal.classList.remove('flex')};
document.getElementById('redo-btn').onclick=()=>{if(historyIndex<historyStack.length-1){historyIndex++;ctx.putImageData(historyStack[historyIndex],0,0)}};
document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-label','Pen colour '+b.dataset.color));
