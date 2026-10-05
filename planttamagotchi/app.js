
let careAudio;function playSound(type){if(!document.getElementById('sound-on').checked)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;careAudio||=new AC();careAudio.resume();const o=careAudio.createOscillator(),g=careAudio.createGain();o.frequency.value=['warning','stress','unhappy','dead'].includes(type)?220:540;g.gain.setValueAtTime(.05,careAudio.currentTime);g.gain.exponentialRampToValueAtTime(.001,careAudio.currentTime+.15);o.connect(g);g.connect(careAudio.destination);o.start();o.stop(careAudio.currentTime+.16)}catch{}}
        // --- Game State Variables ---
        let waterLevel = 50;
        let sunLevel = 50;
        let temperatureLevel = 20;
        let stressLevel = 0;
        let growthPoints = 0;
        let plantStage = 0;
        let isDead = false;
        let gameLoopInterval = null;

        // --- Game Constants ---
        const MAX_LEVEL = 100;
        const MIN_LEVEL = 0;
        const WATER_DECREASE_RATE = 2;
        const SUN_DECREASE_RATE = 2;
        const STRESS_INCREASE_LOW_RESOURCE = 2;
        const STRESS_INCREASE_OVERCLICK = 15;
        const STRESS_INCREASE_BAD_TEMP = 1;
        const STRESS_DECREASE_RATE = 2;
        const GROWTH_PER_TICK = 1;
        const POINTS_PER_STAGE = [6, 8, 10, 12];
        const IDEAL_WATER_LOW = 30;
        const IDEAL_WATER_HIGH = 90;
        const IDEAL_SUN_LOW = 30;
        const IDEAL_SUN_HIGH = 90;
        const IDEAL_TEMP_LOW = 15;
        const IDEAL_TEMP_HIGH = 30;
        const CRITICAL_THRESHOLD = 10;
        const HIGH_STRESS_THRESHOLD = 75;
        const WATER_PER_CLICK = 20;
        const SUN_PER_CLICK = 20;
        const GAME_TICK_MS = 3000;

        const PLANT_STAGES_EMOJI = ['🌰', '🌱', '🌿', '🌳', '🌲', '🍂'];

        // --- DOM References ---
        const plantImageEl = document.getElementById('plantImage');
        const waterBarEl = document.getElementById('waterBar');
        const sunBarEl = document.getElementById('sunBar');
        const tempBarEl = document.getElementById('tempBar');
        const stressBarEl = document.getElementById('stressBar');
        const growthBarEl = document.getElementById('growthBar');
        const feedbackMessageEl = document.getElementById('feedbackMessage');
        const waterButton = document.getElementById('waterButton');
        const sunButton = document.getElementById('sunButton');
        const resetButton = document.getElementById('resetButton'); // Still need reference
        const tempSlider = document.getElementById('tempSlider');
        const tempValueDisplay = document.getElementById('tempValueDisplay');

        // --- UI Update Functions ---
        function updateUI() {
            // Update progress bars
            waterBarEl.style.width = `${waterLevel}%`;
            waterBarEl.textContent = `${waterLevel}%`;
            sunBarEl.style.width = `${sunLevel}%`;
            sunBarEl.textContent = `${sunLevel}%`;
            stressBarEl.style.width = `${stressLevel}%`;
            stressBarEl.textContent = `${stressLevel}%`;

            // Update temperature bar
            const tempPercentage = (temperatureLevel / 40) * 100;
            tempBarEl.style.width = `${tempPercentage}%`;
            tempBarEl.textContent = `${temperatureLevel}°C`;

            // Update growth bar
            const currentStageMaxPoints = POINTS_PER_STAGE[plantStage] || 1;
            const growthPercentage = plantStage < POINTS_PER_STAGE.length
                ? Math.min(100, Math.round((growthPoints / currentStageMaxPoints) * 100))
                : 100;
            growthBarEl.style.width = `${growthPercentage}%`;
            growthBarEl.textContent = `${growthPercentage}%`;

            // Update plant image
            const stageIndex = isDead ? PLANT_STAGES_EMOJI.length - 1 : plantStage;
            plantImageEl.textContent = PLANT_STAGES_EMOJI[stageIndex];
            plantImageEl.setAttribute('data-stage', isDead ? 'dead' : plantStage.toString());

            // Update stressed class
            plantImageEl.classList.toggle('stressed', stressLevel > HIGH_STRESS_THRESHOLD && !isDead);

            // Update button/slider states
            waterButton.disabled = isDead;
            sunButton.disabled = isDead;
            resetButton.disabled = false; // Reset button should always be enabled? Or disable when game ends? Currently enabled.
            tempSlider.disabled = isDead;
        }

        function setFeedback(message, type = 'info') {
            feedbackMessageEl.textContent = message;
            switch (type) {
                case 'success': feedbackMessageEl.style.color = '#16a34a'; break;
                case 'error': feedbackMessageEl.style.color = '#dc2626'; break;
                case 'warning': feedbackMessageEl.style.color = '#f97316'; break;
                case 'stress': feedbackMessageEl.style.color = '#f43f5e'; break;
                case 'info': default: feedbackMessageEl.style.color = '#4b5563'; break;
            }
        }

        // --- Event Handlers ---
        function handleTempChange(event) {
            if (isDead || completed) return;
            temperatureLevel = parseInt(event.target.value, 10);
            tempValueDisplay.textContent = temperatureLevel;
            updateUI();
        }

        // --- Game Logic Functions ---
        function waterPlant() {
            if (isDead || completed) return;
            if (waterLevel >= IDEAL_WATER_HIGH) {
                stressLevel = Math.min(MAX_LEVEL, stressLevel + STRESS_INCREASE_OVERCLICK);
                setFeedback('Too much water! The plant is stressed!', 'stress');
                playSound('stress');
            } else {
                waterLevel = Math.min(MAX_LEVEL, waterLevel + WATER_PER_CLICK);
                setFeedback('Plant watered!', 'info');
                playSound('water');
            }
            updateUI();
            checkDeath();
        }

        function giveSunlight() {
            if (isDead || completed) return;
            if (sunLevel >= IDEAL_SUN_HIGH) {
                stressLevel = Math.min(MAX_LEVEL, stressLevel + STRESS_INCREASE_OVERCLICK);
                setFeedback('Too much sun! The plant is stressed!', 'stress');
                playSound('stress');
            } else {
                sunLevel = Math.min(MAX_LEVEL, sunLevel + SUN_PER_CLICK);
                setFeedback('Plant received sunlight!', 'info');
                playSound('sun');
            }
            updateUI();
            checkDeath();
        }

        function checkGrowth() {
            if (isDead || plantStage >= POINTS_PER_STAGE.length) return;

            const isWaterOk = waterLevel >= IDEAL_WATER_LOW && waterLevel < IDEAL_WATER_HIGH;
            const isSunOk = sunLevel >= IDEAL_SUN_LOW && sunLevel < IDEAL_SUN_HIGH;
            const isTempOk = temperatureLevel >= IDEAL_TEMP_LOW && temperatureLevel <= IDEAL_TEMP_HIGH;
            const isStressed = stressLevel > HIGH_STRESS_THRESHOLD;
            const isCriticallyLow = waterLevel < CRITICAL_THRESHOLD || sunLevel < CRITICAL_THRESHOLD;

            let feedbackMsg = "";
            let feedbackType = "info";
            let grewThisTick = false;
            let stressIncreasedThisTick = false;

            // Stress Handling
            if (isCriticallyLow) {
                stressLevel = Math.min(MAX_LEVEL, stressLevel + STRESS_INCREASE_LOW_RESOURCE);
                feedbackMsg = "Conditions are poor, plant is getting stressed! ";
                feedbackType = "warning";
                playSound('warning');
                stressIncreasedThisTick = true;
            }
            if (!isTempOk) {
                stressLevel = Math.min(MAX_LEVEL, stressLevel + STRESS_INCREASE_BAD_TEMP);
                let tempMsg = temperatureLevel < IDEAL_TEMP_LOW ? "It's too cold!" : "It's too hot!";
                feedbackMsg += tempMsg + " ";
                feedbackType = feedbackType === "warning" ? "warning" : "stress";
                if (!stressIncreasedThisTick) playSound('stress');
                stressIncreasedThisTick = true;
            }
            if (!stressIncreasedThisTick && isWaterOk && isSunOk && isTempOk && stressLevel > MIN_LEVEL) {
                stressLevel = Math.max(MIN_LEVEL, stressLevel - STRESS_DECREASE_RATE);
            }

             // Growth Handling
            if (isWaterOk && isSunOk && isTempOk) {
                if (isStressed) {
                    if (feedbackType !== 'warning' && feedbackType !== 'stress') {
                        feedbackMsg = "Plant is too stressed to grow!";
                        feedbackType = "stress";
                    } else {
                         feedbackMsg += "Plant is too stressed to grow!";
                    }
                    if (!stressIncreasedThisTick) playSound('stress');
                } else {
                    growthPoints += GROWTH_PER_TICK;
                    grewThisTick = true;
                    if (feedbackType === 'info') {
                        feedbackMsg = "Plant is growing well!";
                    }
                }
            } else if (!isCriticallyLow && !feedbackMsg) {
                 feedbackMsg = "Plant needs something...";
                 feedbackType = "info";
            }

            // Check for stage up
            if (grewThisTick) {
                const pointsNeeded = POINTS_PER_STAGE[plantStage];
                if (growthPoints >= pointsNeeded) {
                    plantStage++;
                    growthPoints = 0;
                    feedbackMsg = `Plant grew to the next stage! (${PLANT_STAGES_EMOJI[plantStage]})`;
                    feedbackType = 'success';
                    playSound('grow');
                    if (plantStage >= POINTS_PER_STAGE.length) {
                        feedbackMsg = `Congratulations! Your plant is fully grown! (${PLANT_STAGES_EMOJI[plantStage]})`;
                    }
                }
            }

            if (feedbackMsg) {
                 setFeedback(feedbackMsg, feedbackType);
            }
        }

        function checkDeath() {
             if (isDead) return true;
             if (waterLevel <= MIN_LEVEL || sunLevel <= MIN_LEVEL || stressLevel >= MAX_LEVEL) {
                 isDead = true;
                 let deathReason = "withered away";
                 if (stressLevel >= MAX_LEVEL) deathReason = "died from stress";
                 else if (waterLevel <= MIN_LEVEL) deathReason = "dried out";
                 else if (sunLevel <= MIN_LEVEL) deathReason = "lacked sunlight";

                 setFeedback(`Oh no! The plant ${deathReason}. Try again?`, 'error');
                 playSound('dead');
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
            if (isDead || completed) return;
            waterLevel = Math.max(MIN_LEVEL, waterLevel - WATER_DECREASE_RATE);
            sunLevel = Math.max(MIN_LEVEL, sunLevel - SUN_DECREASE_RATE);
            checkGrowth();
            if (checkDeath()) {pauseCare();recordCare("Needs care · restart available");return;}
            if(plantStage>=4){completed=true;pauseCare();setFeedback("Growth journey complete. Compare your observations, or restart for another trial.","info");}
            updateUI();
        }

        function resetGame() {
             completed=false;ticks=0;journal=[];pauseCare();
             playSound('reset');
             if (gameLoopInterval) clearInterval(gameLoopInterval);
             waterLevel = 50;
             sunLevel = 50;
             temperatureLevel = 20;
             stressLevel = 0;
             growthPoints = 0;
             plantStage = 0;
             isDead = false;
             tempSlider.value = temperatureLevel;
             tempValueDisplay.textContent = temperatureLevel;
             setFeedback('New plant started! Care for it well.', 'info');
             updateUI();
             pauseCare();recordCare("Restarted trial");
        }

         function startGameLoop() {
            if (gameLoopInterval) clearInterval(gameLoopInterval);
            if (!isDead && !completed) {
                 gameLoopInterval = setInterval(()=>{gameTick();recordCare("Time step")}, GAME_TICK_MS);
            }
         }

        // --- Initial Setup ---
let completed=false,ticks=0,journal=[];
function pauseCare(){clearInterval(gameLoopInterval);gameLoopInterval=null;document.getElementById('run-care').textContent='Run slowly';document.getElementById('care-clock').textContent='Paused · time step '+ticks;}
function recordCare(action){const values=[waterLevel,sunLevel,temperatureLevel,stressLevel,plantStage];journal.push([ticks,action,...values]);if(journal.length>500)journal.shift();document.getElementById('care-journal').innerHTML=journal.slice(-10).map(r=>'<tr>'+r.map(v=>'<td>'+Workshop.esc(v)+'</td>').join('')+'</tr>').join('');document.getElementById('care-clock').textContent=(gameLoopInterval?'Running':'Paused')+' · time step '+ticks;document.getElementById('step-care').disabled=completed||isDead;document.getElementById('run-care').disabled=completed||isDead;document.querySelectorAll('.progress-bar-fill').forEach(el=>{el.setAttribute('role','progressbar');el.setAttribute('aria-valuemin','0');el.setAttribute('aria-valuemax',el.id==='tempBar'?'40':'100');el.setAttribute('aria-valuenow',parseInt(el.textContent)||0);el.setAttribute('aria-label',el.closest('.status-bar-container').querySelector('.status-label').textContent)});}
        function initializeGame() {
            // Add event listeners
            waterButton.addEventListener('click', waterPlant);
            sunButton.addEventListener('click', giveSunlight);
            resetButton.addEventListener('click', resetGame); // Reset listener remains
            tempSlider.addEventListener('input', handleTempChange);

            // Initial UI setup
            tempValueDisplay.textContent = temperatureLevel;
            updateUI();

            // Start the game loop
            pauseCare();
        }

        // --- Start Game on Load ---
        initializeGame();

    
document.getElementById('step-care').onclick=()=>{pauseCare();gameTick();recordCare('Time step')};document.getElementById('run-care').onclick=()=>{if(gameLoopInterval)pauseCare();else{startGameLoop();document.getElementById('run-care').textContent='Pause';recordCare('Run started')}};document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseCare()});
document.getElementById('waterButton').addEventListener('click',()=>recordCare('Water'));
document.getElementById('sunButton').addEventListener('click',()=>recordCare('Sunlight'));
document.getElementById('tempSlider').addEventListener('input',()=>recordCare('Temperature'));
document.getElementById('export-care').onclick=()=>Workshop.download('plant-observations.csv',['Step,Action,Water,Sun,Temperature °C,Stress,Stage',...journal.map(r=>r.join(','))].join('\n')+'\n\nNotes: '+JSON.stringify(document.getElementById('care-notes').value),'text/csv');const notes=document.getElementById('care-notes');notes.value=Workshop.load('planttamagotchi-notes','');notes.oninput=()=>{document.getElementById('care-save').textContent=Workshop.save('planttamagotchi-notes',notes.value)?'Notes saved in this browser.':'Use Download observations to save your notes.'};recordCare('Starting conditions');