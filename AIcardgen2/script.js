// --- Configuration ---
let allCardsData = [];
const colors = ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#4f46e5'];

// --- AI Image Generation (Using Gemini) ---
async function generateImageWithRetry(card, maxRetries = 3) {
    const apiKey = document.getElementById('api-key-input').value;
    if (!apiKey) {
        alert("Please enter your Google AI API key.");
        return null;
    }
    const model = document.getElementById('model-input').value;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const generalPrompt = document.getElementById('general-prompt-input').value.trim();

    let newPrompt;
    const promptText = card.customPrompt || '';
    const styleKeywords = ['style', 'painting', 'drawing', 'photo', 'realistic', 'art', 'gogh', 'picasso', 'monet', 'dali', 'sketch', '3d'];
    const isArtisticStyle = styleKeywords.some(keyword => promptText.toLowerCase().includes(keyword));

    const negativeConstraints = `Do not spell the word "${card.term}". Do not write any text, letters, or numbers. No typography, no signage, no labels inside the image. Symbolism only.`;

    if (generalPrompt) {
         newPrompt = `A strictly wordless, text-free image of ${card.term}, with an overarching style of ${generalPrompt}. ${promptText}. High quality, detailed. Visual depiction only. Unlabeled. ${negativeConstraints}`;
    }
    else if (isArtisticStyle) {
        newPrompt = `A strictly wordless, text-free image of ${card.term}, ${promptText}. High quality, detailed. Visual depiction only. Unlabeled. ${negativeConstraints}`;
    } else {
        if (promptText) {
            newPrompt = `A strictly wordless, text-free clipart icon of ${card.term} described as ${promptText}. Isolated on white background. Vector style, vibrant colors. Visual depiction only. Unlabeled. ${negativeConstraints}`;
        } else {
            newPrompt = `A strictly wordless, text-free clipart icon of ${card.term}. Isolated on white background. Vector style, vibrant colors. Visual depiction only. Unlabeled. ${negativeConstraints}`;
        }
    }

    const payload = {
        contents: [{
            parts: [{ text: newPrompt }]
        }],
        generationConfig: {
            "responseMimeType": "image/png"
        }
    };

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            const base64Data = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Data) {
                return `data:image/png;base64,${base64Data}`;
            } else {
                throw new Error('Invalid response structure from API.');
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} for "${card.term}" failed:`, error);
            if (i === maxRetries - 1) { return null; }
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
    }
    return null;
}

// --- Card and Page Rendering ---
function createCardFront(card, index) {
    const color = colors[index % colors.length];
    const cardEl = document.createElement('div');
    cardEl.className = `card group h-full bg-white rounded-2xl border-[6px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col relative`;
    cardEl.style.borderColor = color;
    cardEl.dataset.term = card.term;

    cardEl.innerHTML = `
        <div class="image-container flex-1 min-h-0 flex items-center justify-center p-6 overflow-hidden bg-white">
            ${card.image ? `<img src="${card.image}" alt="${card.term}" class="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500">` : '<div class="loader"></div>'}
        </div>
        <div class="card-label text-center text-white flex items-center justify-center px-2 z-10" style="flex-basis: 4.5rem; background-color: ${color};">
            <h2 class="text-xl font-bold tracking-wide drop-shadow-md">${card.term}</h2>
        </div>
        <div class="absolute top-2 right-2 flex flex-col items-end space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button class="regenerate-btn bg-white/90 backdrop-blur text-indigo-600 border border-indigo-100 hover:bg-indigo-50 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1">
                <span>⚡ Regenerate</span>
            </button>
            <input type="text" class="hint-input bg-white/90 backdrop-blur w-36 text-xs p-1.5 rounded-lg border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Add hint (e.g. 'red car')..." value="${card.customPrompt || ''}">
        </div>
    `;

    const regenerateBtn = cardEl.querySelector('.regenerate-btn');
    const imageContainer = cardEl.querySelector('.image-container');
    const hintInput = cardEl.querySelector('.hint-input');

    regenerateBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        regenerateBtn.disabled = true;
        hintInput.disabled = true;
        regenerateBtn.innerHTML = '<span>⏳ Generating...</span>';
        imageContainer.innerHTML = '<div class="loader"></div>';

        const cardData = allCardsData.find(c => c.term === card.term);
        if (!cardData) return;

        const currentHint = hintInput.value.trim();
        cardData.customPrompt = currentHint;

        const newImageUrl = await generateImageWithRetry(cardData);

        cardData.image = newImageUrl;

        if (newImageUrl) {
             imageContainer.innerHTML = `<img src="${newImageUrl}" alt="${cardData.term}" class="max-h-full max-w-full object-contain drop-shadow-sm">`;
        } else {
             imageContainer.innerHTML = '<p class="text-red-400 font-bold text-sm">Generation Failed</p>';
        }

        regenerateBtn.disabled = false;
        hintInput.disabled = false;
        regenerateBtn.innerHTML = '<span>⚡ Regenerate</span>';
    });

    return cardEl;
}

function createCardBack(card, index) {
    const color = colors[index % colors.length];
    const cardEl = document.createElement('div');
    cardEl.className = `card-back h-full bg-white rounded-2xl border-[6px] shadow-sm overflow-hidden flex flex-col items-center justify-center p-8 relative`;
    cardEl.style.borderColor = color;

    // Convert hex to RGB for the background pattern
    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };

    cardEl.innerHTML = `
        <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(rgba(${hexToRgb(color)}, 1) 1px, transparent 1px); background-size: 16px 16px;"></div>
        <h3 class="text-xl font-bold text-slate-800 mb-3 relative z-10 pb-1" style="border-bottom: 2px solid rgba(${hexToRgb(color)}, 0.2);">${card.term}</h3>
        <p class="text-center text-slate-600 text-lg font-medium leading-relaxed relative z-10">${card.definition}</p>
    `;
    return cardEl;
}

function populatePage(grid, cards, isBack) {
    let cardsToRender = [...cards];
    if (isBack) {
         const reordered = [];
         for (let i = 0; i < cardsToRender.length; i += 3) {
             reordered.push(...cardsToRender.slice(i, i + 3).reverse());
         }
         cardsToRender = reordered;
    }
    cardsToRender.forEach((cardData) => {
        const originalIndex = allCardsData.findIndex(c => c.term === cardData.term);
        const element = isBack ? createCardBack(cardData, originalIndex) : createCardFront(cardData, originalIndex);
        grid.appendChild(element);
    });
}

function generateAllPages() {
    const mainContainer = document.getElementById('main-container');
    mainContainer.innerHTML = '';
    if (allCardsData.length === 0) return;

    const cardsPerPage = 6;
    const numPages = Math.ceil(allCardsData.length / cardsPerPage);

    for (let i = 0; i < numPages; i++) {
        const pageCards = allCardsData.slice(i * cardsPerPage, (i * cardsPerPage) + cardsPerPage);
        const frontPageContainer = document.createElement('div');
        frontPageContainer.className = "page-container w-full max-w-5xl aspect-[11/8.5] bg-white p-8 rounded-lg shadow-2xl ring-1 ring-slate-900/5 mb-8";
        const frontGrid = document.createElement('div');
        frontGrid.className = "grid grid-cols-3 grid-rows-2 gap-6 h-full";
        frontPageContainer.appendChild(frontGrid);
        mainContainer.appendChild(frontPageContainer);
        populatePage(frontGrid, pageCards, false);

        const backPageContainer = document.createElement('div');
        backPageContainer.className = "page-container w-full max-w-5xl aspect-[11/8.5] bg-white p-8 rounded-lg shadow-2xl ring-1 ring-slate-900/5 mb-8";
        const backGrid = document.createElement('div');
        backGrid.className = "grid grid-cols-3 grid-rows-2 gap-6 h-full";
        backPageContainer.appendChild(backGrid);
        mainContainer.appendChild(backPageContainer);
        populatePage(backGrid, pageCards, true);
    }
}

// --- Main Logic ---
async function handleCardGeneration() {
    const generateBtn = document.getElementById('generate-btn');
    const input = document.getElementById('custom-vocab-input').value;
    const lines = input.split('\n').filter(line => line.includes(':'));

    allCardsData = lines.map(line => {
        const lineParts = line.split(':');
        const termAndPrompt = lineParts[0].trim();
        const definition = lineParts.slice(1).join(':').trim();

        let term = termAndPrompt;
        let customPrompt = null;

        const promptMatch = termAndPrompt.match(/(.*?)\s*\((.*?)\)/);
        if (promptMatch && promptMatch.length === 3) {
            term = promptMatch[1].trim();
            customPrompt = promptMatch[2].trim();
        }

        return { term, definition, customPrompt, image: null };
    }).filter(c => c.term && c.definition);

    generateAllPages();

    generateBtn.disabled = true;

    const imagePromises = allCardsData.map(async (card, i) => {
        generateBtn.innerHTML = `<span>⏳ Generating Art ${i + 1}/${allCardsData.length}...</span>`;

        const imageUrl = await generateImageWithRetry(card);
        card.image = imageUrl;

        const cardEl = document.querySelector(`.card[data-term="${card.term}"]`);
        if (cardEl) {
            const imageContainer = cardEl.querySelector('.image-container');
            if (imageUrl) {
                imageContainer.innerHTML = `<img src="${imageUrl}" alt="${card.term}" class="max-h-full max-w-full object-contain drop-shadow-sm">`;
            } else {
                imageContainer.innerHTML = '<p class="text-red-400 font-bold text-sm">Generation Failed</p>';
            }
        }
    });

    await Promise.all(imagePromises);

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ Generate AI Flashcards</span>';

    // Enable export buttons
    document.getElementById('save-btn').disabled = false;
    document.getElementById('download-zip-btn').disabled = false;
    document.getElementById('export-json-btn').disabled = false;
}

document.getElementById('generate-btn').addEventListener('click', handleCardGeneration);

function triggerDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

document.getElementById('download-zip-btn').addEventListener('click', () => {
    const validCards = allCardsData.filter(c => c.image && c.image.startsWith('data:image/png'));

    if (validCards.length === 0) {
        alert('Download failed: Please generate flashcards and ensure images are created first.');
        return;
    }

    const zip = new JSZip();
    const promises = validCards.map(card => {
        const base64Data = card.image.split(',')[1];
        const safeFilename = card.term.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        zip.file(`${safeFilename}.png`, base64Data, { base64: true });
        return Promise.resolve();
    });

    Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
            triggerDownload(content, 'flashcard-images.zip');
        });
    });
});

document.getElementById('export-json-btn').addEventListener('click', () => {
    if (allCardsData.length === 0) {
        console.error('Export failed: No flashcard data has been generated yet.');
        return;
    }

    const exportData = allCardsData
        .filter(c => c.term && c.definition)
        .map(({ term, definition, image }) => ({
            term,
            definition,
            imageSrc: image || 'N/A'
        }));

    if (exportData.length === 0) {
        console.error('Export failed: No valid flashcard data found.');
        return;
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    triggerDownload(blob, 'flashcard-data.json');
});

function print() {
     if (allCardsData.length === 0) {
        console.warn('Cannot print: No flashcards have been generated yet.');
        return;
    }
    window.print();
}

document.getElementById('save-btn').addEventListener('click', print);
