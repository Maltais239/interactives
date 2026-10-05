
let careAudio;function playSound(type){if(!document.getElementById('sound-on').checked)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;careAudio||=new AC();careAudio.resume();const o=careAudio.createOscillator(),g=careAudio.createGain();o.frequency.value=['warning','stress','unhappy','dead'].includes(type)?220:540;g.gain.setValueAtTime(.05,careAudio.currentTime);g.gain.exponentialRampToValueAtTime(.001,careAudio.currentTime+.15);o.connect(g);g.connect(careAudio.destination);o.start();o.stop(careAudio.currentTime+.16)}catch{}}
        // --- Game State Variables ---
        let hydrationLevel = 50;
        let warmthLevel = 50;
        let fullnessLevel = 60;
        let discomfortLevel = 0;
        let happinessPoints = 0;
        let creatureStage = 0;
        let isUnhappy = false;
        let gameLoopInterval = null;

        // --- Game Constants ---
        const MAX_LEVEL = 100;
        const MIN_LEVEL = 0;
        const HYDRATION_DECREASE_RATE = 2;
        const WARMTH_DECREASE_RATE = 2;
        const FULLNESS_DECREASE_RATE = 3;
        const DISCOMFORT_INCREASE_LOW_RESOURCE = 3;
        const DISCOMFORT_FROM_OVERHYDRATE = 8; 
        const DISCOMFORT_FROM_OVERFEED = 8;    
        const DISCOMFORT_FROM_OVERWARM = 12;   
        const DISCOMFORT_DECREASE_RATE = 2;
        const HAPPINESS_PER_TICK = 1;
        const POINTS_PER_STAGE = [8, 10, 12, 14]; 
        const IDEAL_HYDRATION_LOW = 30;
        const IDEAL_HYDRATION_HIGH = 90;
        const IDEAL_WARMTH_LOW = 30;
        const IDEAL_WARMTH_HIGH = 90;
        const IDEAL_FULLNESS_LOW = 30;
        const IDEAL_FULLNESS_HIGH = 90;
        const CRITICAL_THRESHOLD = 10;
        const HIGH_DISCOMFORT_THRESHOLD = 75;
        const HYDRATION_PER_CLICK = 20;
        const WARMTH_PER_CLICK = 20;
        const FULLNESS_PER_CLICK = 30;
        const GAME_TICK_MS = 3000;

        // URLs for bear images and ghost emoji for unhappy state
        const CREATURE_STAGE_IMAGES = [
            'https://raw.githubusercontent.com/Maltais239/Images/main/bear%20(2).png', // Stage 0: Cub
            'https://raw.githubusercontent.com/Maltais239/Images/main/bear%20(1).png', // Stage 1: Young Bear
            'https://raw.githubusercontent.com/Maltais239/Images/main/bear%20(3).png', // Stage 2: Young Adult Bear
            'https://raw.githubusercontent.com/Maltais239/Images/main/bear%20(4).png', // Stage 3: BIG OLD ADULT BEAR
            'https://raw.githubusercontent.com/Maltais239/Images/main/bear%20(4).png', // Stage 4: Max Growth (same as adult, CSS adds glow)
            '👻'  // Unhappy state: Ghost Emoji
        ];

        // --- DOM References ---
        const creatureDisplayEl = document.getElementById('creatureDisplay'); 
        // creatureImageElement is now created/managed within updateCreatureImage

        const hydrationBarEl = document.getElementById('hydrationBar');
        const warmthBarEl = document.getElementById('warmthBar');
        const fullnessBarEl = document.getElementById('fullnessBar');
        const discomfortBarEl = document.getElementById('discomfortBar');
        const happinessBarEl = document.getElementById('happinessBar');
        const feedbackMessageEl = document.getElementById('feedbackMessage');
        const hydrateButton = document.getElementById('hydrateButton');
        const warmthButton = document.getElementById('warmthButton');
        const feedButton = document.getElementById('feedButton');
        const resetButton = document.getElementById('resetButton');

        // --- UI Update Functions ---
        function updateCreatureImage() {
            const nextStage=isUnhappy?'unhappy':creatureStage.toString();if(creatureDisplayEl.getAttribute('data-stage')===nextStage&&creatureDisplayEl.firstChild)return;
            const stageIndex = isUnhappy ? CREATURE_STAGE_IMAGES.length - 1 : creatureStage;
            const stageRepresentation = CREATURE_STAGE_IMAGES[stageIndex];

            creatureDisplayEl.setAttribute('data-stage', isUnhappy ? 'unhappy' : creatureStage.toString());
            creatureDisplayEl.innerHTML = ''; // Clear previous content (image or emoji)

            if (typeof stageRepresentation === 'string' && stageRepresentation.startsWith('http')) { 
                // It's an image URL
                let localCreatureImageElement = document.createElement('img'); 
                localCreatureImageElement.alt = "Bear Creature";
                localCreatureImageElement.classList.add('creature-image-element');
                localCreatureImageElement.src = stageRepresentation; 
                
                localCreatureImageElement.onload = function() {
                    // Image loaded successfully
                }
                localCreatureImageElement.onerror = function() {
                    creatureDisplayEl.textContent = '⚠️ Image Load Error'; 
                    if (localCreatureImageElement) localCreatureImageElement.style.display = 'none';
                }
                creatureDisplayEl.appendChild(localCreatureImageElement);

            } else { 
                // It's an emoji (e.g., ghost)
                creatureDisplayEl.textContent = stageRepresentation; 
            }
            creatureDisplayEl.classList.toggle('stressed', discomfortLevel > HIGH_DISCOMFORT_THRESHOLD && !isUnhappy);
        }


        function updateUI() {
            hydrationBarEl.style.width = `${hydrationLevel}%`;
            hydrationBarEl.textContent = `${hydrationLevel}%`;
            warmthBarEl.style.width = `${warmthLevel}%`;
            warmthBarEl.textContent = `${warmthLevel}%`;
            fullnessBarEl.style.width = `${fullnessLevel}%`;
            fullnessBarEl.textContent = `${fullnessLevel}%`;
            discomfortBarEl.style.width = `${discomfortLevel}%`;
            discomfortBarEl.textContent = `${discomfortLevel}%`;

            const currentStageMaxPoints = POINTS_PER_STAGE[creatureStage] || POINTS_PER_STAGE[POINTS_PER_STAGE.length -1];
            const happinessPercentage = creatureStage < POINTS_PER_STAGE.length
                ? Math.min(100, Math.round((happinessPoints / currentStageMaxPoints) * 100))
                : 100; 
            happinessBarEl.style.width = `${happinessPercentage}%`;
            happinessBarEl.textContent = `${happinessPercentage}%`;

            updateCreatureImage(); 

            hydrateButton.disabled = isUnhappy;
            warmthButton.disabled = isUnhappy;
            feedButton.disabled = isUnhappy;
            resetButton.disabled = false;
        }

        function setFeedback(message, type = 'info') {
            feedbackMessageEl.textContent = message;
            switch (type) {
                case 'success': feedbackMessageEl.style.color = '#16a34a'; break;
                case 'error': feedbackMessageEl.style.color = '#dc2626'; break;
                case 'warning': feedbackMessageEl.style.color = '#f97316'; break;
                case 'discomfort': feedbackMessageEl.style.color = '#ef4444'; break;
                case 'info': default: feedbackMessageEl.style.color = '#374151'; break;
            }
        }

        // --- Game Logic Functions ---
        function giveHydration() {
            if (isUnhappy || completed) return;
            if (hydrationLevel >= IDEAL_HYDRATION_HIGH) {
                discomfortLevel = Math.min(MAX_LEVEL, discomfortLevel + DISCOMFORT_FROM_OVERHYDRATE);
                setFeedback('Too much water! The bear is uncomfortable!', 'discomfort');
                playSound('discomfort');
            } else {
                hydrationLevel = Math.min(MAX_LEVEL, hydrationLevel + HYDRATION_PER_CLICK);
                setFeedback('Bear hydrated!', 'info');
                playSound('hydrate');
            }
            updateUI();
            checkUnhappyState();
        }

        function provideWarmth() {
            if (isUnhappy || completed) return;
            if (warmthLevel >= IDEAL_WARMTH_HIGH) {
                discomfortLevel = Math.min(MAX_LEVEL, discomfortLevel + DISCOMFORT_FROM_OVERWARM);
                setFeedback('Too much warmth! The bear is uncomfortable!', 'discomfort');
                playSound('discomfort');
            } else {
                warmthLevel = Math.min(MAX_LEVEL, warmthLevel + WARMTH_PER_CLICK);
                setFeedback('Bear feels warmer!', 'info');
                playSound('warmth');
            }
            updateUI();
            checkUnhappyState();
        }

        function feedCreature() {
            if (isUnhappy || completed) return;
            if (fullnessLevel >= IDEAL_FULLNESS_HIGH) {
                discomfortLevel = Math.min(MAX_LEVEL, discomfortLevel + DISCOMFORT_FROM_OVERFEED);
                setFeedback('Too much food! The bear is uncomfortable!', 'discomfort');
                playSound('discomfort');
            } else {
                fullnessLevel = Math.min(MAX_LEVEL, fullnessLevel + FULLNESS_PER_CLICK);
                setFeedback('Bear fed!', 'info');
                playSound('feed');
            }
            updateUI();
            checkUnhappyState();
        }


        function checkDevelopment() {
            if (isUnhappy || creatureStage >= POINTS_PER_STAGE.length) return;

            const isHydrationOk = hydrationLevel >= IDEAL_HYDRATION_LOW && hydrationLevel < IDEAL_HYDRATION_HIGH;
            const isWarmthOk = warmthLevel >= IDEAL_WARMTH_LOW && warmthLevel < IDEAL_WARMTH_HIGH;
            const isFullnessOk = fullnessLevel >= IDEAL_FULLNESS_LOW && fullnessLevel < IDEAL_FULLNESS_HIGH;
            const isHighlyDiscomforted = discomfortLevel > HIGH_DISCOMFORT_THRESHOLD;
            const isCriticallyLow = hydrationLevel < CRITICAL_THRESHOLD || warmthLevel < CRITICAL_THRESHOLD || fullnessLevel < CRITICAL_THRESHOLD;

            let feedbackMsg = "";
            let feedbackType = "info";
            let developedThisTick = false;
            let discomfortIncreasedThisTick = false;

            // Discomfort Handling
            if (isCriticallyLow) {
                discomfortLevel = Math.min(MAX_LEVEL, discomfortLevel + DISCOMFORT_INCREASE_LOW_RESOURCE);
                let criticalReason = "Needs are critical";
                if(hydrationLevel < CRITICAL_THRESHOLD) criticalReason = "Very thirsty";
                else if(warmthLevel < CRITICAL_THRESHOLD) criticalReason = "Very cold";
                else if(fullnessLevel < CRITICAL_THRESHOLD) criticalReason = "Very hungry";
                feedbackMsg = `${criticalReason}, bear is uncomfortable! `;
                feedbackType = "warning";
                playSound('warning');
                discomfortIncreasedThisTick = true;
            }
            if (!discomfortIncreasedThisTick && isHydrationOk && isWarmthOk && isFullnessOk && discomfortLevel > MIN_LEVEL) {
                discomfortLevel = Math.max(MIN_LEVEL, discomfortLevel - DISCOMFORT_DECREASE_RATE);
            }

             // Happiness/Development Handling
            if (isHydrationOk && isWarmthOk && isFullnessOk) {
                if (isHighlyDiscomforted) {
                    if (feedbackType !== 'warning' && feedbackType !== 'discomfort') {
                        feedbackMsg = "Bear is too uncomfortable to be happy!";
                        feedbackType = "discomfort";
                    } else {
                         feedbackMsg += "Bear is too uncomfortable to be happy!";
                    }
                    if (!discomfortIncreasedThisTick) playSound('discomfort');
                } else {
                    happinessPoints += HAPPINESS_PER_TICK;
                    developedThisTick = true;
                    if (feedbackType === 'info' && !feedbackMsg) { 
                        feedbackMsg = "Bear seems content!";
                    }
                }
            } else if (!isCriticallyLow && !feedbackMsg) { 
                 feedbackMsg = "Bear needs something...";
                 feedbackType = "info";
            }

            // Check for stage up
            if (developedThisTick) {
                const pointsNeeded = POINTS_PER_STAGE[creatureStage];
                if (happinessPoints >= pointsNeeded) {
                    creatureStage++;
                    happinessPoints = 0; 
                    feedbackMsg = `Bear grew to the next stage!`;
                    feedbackType = 'success';
                    playSound('happy_event');
                    if (creatureStage >= POINTS_PER_STAGE.length) { 
                        creatureStage = POINTS_PER_STAGE.length; 
                        feedbackMsg = `Congratulations! Your bear is fully grown!`;
                    }
                }
            }
            if (feedbackMsg) { setFeedback(feedbackMsg, feedbackType); }
        }

        function checkUnhappyState() {
             if (isUnhappy) return true; 

             const hydrationCritical = hydrationLevel <= MIN_LEVEL;
             const warmthCritical = warmthLevel <= MIN_LEVEL;
             const fullnessCritical = fullnessLevel <= MIN_LEVEL;
             const discomfortMax = discomfortLevel >= MAX_LEVEL;

             if (hydrationCritical || warmthCritical || fullnessCritical || discomfortMax) {
                 isUnhappy = true; 
                 let reason = "became very unhappy"; 

                 if (discomfortMax) {
                     reason = "became too uncomfortable";
                 } else if (hydrationCritical) {
                     reason = "is too thirsty";
                 } else if (warmthCritical) {
                     reason = "is too cold";
                 } else if (fullnessCritical) {
                     reason = "is too hungry";
                 }
                 
                 setFeedback(`Oh no! The bear ${reason}. Try again?`, 'error');
                 playSound('unhappy');
                 clearInterval(gameLoopInterval); 
                 gameLoopInterval = null;
                 updateUI(); 
                 return true; 
             }
             return false; 
        }

        function gameTick() {
            if(completed)return;
            ticks++;
            if (isUnhappy || completed) return;
            hydrationLevel = Math.max(MIN_LEVEL, hydrationLevel - HYDRATION_DECREASE_RATE);
            warmthLevel = Math.max(MIN_LEVEL, warmthLevel - WARMTH_DECREASE_RATE);
            fullnessLevel = Math.max(MIN_LEVEL, fullnessLevel - FULLNESS_DECREASE_RATE);
            checkDevelopment();
            if (checkUnhappyState()) {pauseCare();recordCare("Needs care · restart available");return;}
            if(creatureStage>=4){completed=true;pauseCare();setFeedback("Growth journey complete. Compare your observations, or restart for another trial.","info");} 
            updateUI();
        }

        function resetGame() {
             completed=false;ticks=0;journal=[];pauseCare();
             playSound('reset');
             if (gameLoopInterval) clearInterval(gameLoopInterval);
             hydrationLevel = 50;
             warmthLevel = 50;
             fullnessLevel = 60;
             discomfortLevel = 0;
             happinessPoints = 0;
             creatureStage = 0;
             isUnhappy = false;
             setFeedback('New bear cub! Care for it well.', 'info');
             updateUI(); 
             pauseCare();recordCare("Restarted trial");
        }

         function startGameLoop() {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            if (!isUnhappy && !completed) {
                 gameLoopInterval = setInterval(()=>{gameTick();recordCare("Time step")}, GAME_TICK_MS);
            }
         }

        // --- Initial Setup ---
let completed=false,ticks=0,journal=[];
function pauseCare(){clearInterval(gameLoopInterval);gameLoopInterval=null;document.getElementById('run-care').textContent='Run slowly';document.getElementById('care-clock').textContent='Paused · time step '+ticks;}
function recordCare(action){const values=[hydrationLevel,warmthLevel,fullnessLevel,discomfortLevel,creatureStage];journal.push([ticks,action,...values]);if(journal.length>500)journal.shift();document.getElementById('care-journal').innerHTML=journal.slice(-10).map(r=>'<tr>'+r.map(v=>'<td>'+Workshop.esc(v)+'</td>').join('')+'</tr>').join('');document.getElementById('care-clock').textContent=(gameLoopInterval?'Running':'Paused')+' · time step '+ticks;document.getElementById('step-care').disabled=completed||isUnhappy;document.getElementById('run-care').disabled=completed||isUnhappy;document.querySelectorAll('.progress-bar-fill').forEach(el=>{el.setAttribute('role','progressbar');el.setAttribute('aria-valuemin','0');el.setAttribute('aria-valuemax',el.id==='tempBar'?'40':'100');el.setAttribute('aria-valuenow',parseInt(el.textContent)||0);el.setAttribute('aria-label',el.closest('.status-bar-container').querySelector('.status-label').textContent)});}
        function initializeGame() {
            hydrateButton.addEventListener('click', giveHydration);
            warmthButton.addEventListener('click', provideWarmth);
            feedButton.addEventListener('click', feedCreature);
            resetButton.addEventListener('click', resetGame);
            
            updateUI(); 
            pauseCare();
        }
        initializeGame();
    
document.getElementById('step-care').onclick=()=>{pauseCare();gameTick();recordCare('Time step')};document.getElementById('run-care').onclick=()=>{if(gameLoopInterval)pauseCare();else{startGameLoop();document.getElementById('run-care').textContent='Pause';recordCare('Run started')}};document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseCare()});
document.getElementById('hydrateButton').addEventListener('click',()=>recordCare('Hydration'));
document.getElementById('warmthButton').addEventListener('click',()=>recordCare('Warmth'));
document.getElementById('feedButton').addEventListener('click',()=>recordCare('Food'));
document.getElementById('export-care').onclick=()=>Workshop.download('creature-observations.csv',['Step,Action,Hydration,Warmth,Fullness,Discomfort,Stage',...journal.map(r=>r.join(','))].join('\n')+'\n\nNotes: '+JSON.stringify(document.getElementById('care-notes').value),'text/csv');const notes=document.getElementById('care-notes');notes.value=Workshop.load('animaltamagotchi-notes','');notes.oninput=()=>{document.getElementById('care-save').textContent=Workshop.save('animaltamagotchi-notes',notes.value)?'Notes saved in this browser.':'Use Download observations to save your notes.'};recordCare('Starting conditions');