let solved=false,roundCount=0,independent=0,hadAttempt=false,usedHint=false;

        const moneyTypes = [
            { value: 100, label: '$100', type: 'bill', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/100_front.jpg' }, { value: 50, label: '$50', type: 'bill', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/50_front.jpg' },
            { value: 20, label: '$20', type: 'bill', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/20_front.jpg' }, { value: 10, label: '$10', type: 'bill', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/10_back.jpg' },
            { value: 5, label: '$5', type: 'bill', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/5_front.jpg' }, { value: 2, label: '$2', type: 'coin', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/png-clipart-canada-toonie-loonie-canadian-dollar-royal-canadian-mint-silver-coin-gold-world-thumbnail.png' },
            { value: 1, label: '$1', type: 'coin', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/2022-canadian-1-dollar-common-loon-loonie-coin-1-800x800.png' }, { value: 0.25, label: '25¢', type: 'coin', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/2020-canadian-25-cent-caribou-quarter-coin-1-800x800.jpg' },
            { value: 0.10, label: '10¢', type: 'coin', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/Canadian_Dime_-_reverse.png' }, { value: 0.05, label: '5¢', type: 'coin', imageUrl: 'https://raw.githubusercontent.com/Maltais239/Images/main/Canadian_Nickel_-_reverse.png' }
        ];
        let moneyTill, changeGivenBox, totalCostEl, amountPaidEl, changeDueEl, currentTotalEl, checkButton, newTransactionButton, feedbackDiv, roundedTotalEl, clearButton, totalContainer, changeDueContainer, timerContainer, timerEl;
        let totalCost = 0, amountPaid = 0, changeDue = 0, difficulty = 'normal', timerInterval = null, timeLeft = 30;
        let draggedItem = null, draggedValue = null, isDraggingFromTill = false, ghostImageElement = null, isTouchDragging = false, touchOffsetX = 0, touchOffsetY = 0, originalItemVisibility = '';

        function formatCurrency(value) { return '$' + value.toFixed(2); }

        function createMoneyElement(money, isClone = false) {
            const div = document.createElement('div');
            div.className = 'money-item';
            div.setAttribute('draggable', true);
            div.setAttribute('role','button');div.tabIndex=0;div.setAttribute('aria-label',(isClone?'Remove ':'Add ')+money.label);
            div.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();div.click();}});
            if(!isClone)div.addEventListener('click',()=>{if(solved||isTouchDragging)return;changeGivenBox.appendChild(createMoneyElement(money,true));updateTotalDisplay();});
            div.setAttribute('data-value', money.value);
            const img = document.createElement('img');
            img.src = money.imageUrl; img.alt = money.label; img.className = 'money-image';
            if (money.type === 'coin') img.classList.add('coin');
            img.onerror = () => { div.innerHTML = money.label; };
            div.appendChild(img);
            div.addEventListener('dragstart', handleDragStart); div.addEventListener('dragend', handleDragEnd);
            div.addEventListener('touchstart', handleTouchStart, { passive: false });
            if (isClone) { div.addEventListener('click', handleItemClick); }
            return div;
        }

        function populateTill() {
            if (!moneyTill) return;
            moneyTill.innerHTML = '';
            moneyTypes.forEach(money => moneyTill.appendChild(createMoneyElement(money, false)));
        }
        
        function calculateTotalInBox() {
            let total = 0;
            changeGivenBox.querySelectorAll('.money-item').forEach(item => { total += parseFloat(item.dataset.value); });
            return Math.round(total * 100) / 100;
        }

        function updateTotalDisplay() {
            const total = calculateTotalInBox();
            currentTotalEl.textContent = formatCurrency(total);
            checkButton.disabled = solved;
        }

        function generateNewTransaction() {
            stopTimer();
            solved=false;hadAttempt=false;usedHint=false;newTransactionButton.disabled=true;clearButton.disabled=false;document.getElementById('round-status').textContent='Transaction '+(roundCount+1)+' of 8';
            if(roundCount>=8){document.getElementById('round-status').textContent='Round complete · '+independent+' of 8 solved on the first try without hints';setFeedback('Round complete. Restart to practise another set.','success');solved=true;checkButton.disabled=true;newTransactionButton.disabled=true;clearButton.disabled=true;return;}
            totalCost = Math.floor(Math.random() * (difficulty==='easy'?4:difficulty==='normal'?19:99)) + (Math.floor(Math.random() * 100) * 0.01) + 0.01;
            totalCost = Math.round(totalCost * 100) / 100;
            const roundedTotalCost = Math.round(totalCost * 20) / 20;
            const paymentOptions = [5, 10, 20, 50, 100].filter(bill => bill >= roundedTotalCost && bill <= (difficulty==='easy'?10:difficulty==='normal'?20:100));
            if (paymentOptions.length > 0) {
                amountPaid = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
            } else {
                amountPaid = Math.ceil(roundedTotalCost / 10) * 10;
                if (amountPaid <= roundedTotalCost) amountPaid += 10;
            }
            changeDue = Math.round((amountPaid - roundedTotalCost) * 100) / 100;

            totalCostEl.textContent = formatCurrency(totalCost);
            roundedTotalEl.textContent = formatCurrency(roundedTotalCost);
            amountPaidEl.textContent = formatCurrency(amountPaid);
            changeDueEl.textContent = formatCurrency(changeDue);

            changeDueContainer.style.display = difficulty === 'easy' ? 'block' : 'none';
            timerContainer.style.display = document.getElementById('timed').checked ? 'block' : 'none';

            resetChangeBox();
            if(document.getElementById('timed').checked) startTimer();
        }

        function resetChangeBox() {
            changeGivenBox.innerHTML = '';
            updateTotalDisplay();
            setFeedback('');
            changeGivenBox.className = 'w-full p-4 rounded-lg';
            totalContainer.className = 'mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center transition-colors duration-300 feedback-container';
        }

        let touchStartX = 0, touchStartY = 0; const touchMoveThreshold = 15;
        function handleDragStart(e) { if(solved){e.preventDefault();return;} draggedItem = e.target; draggedValue = draggedItem.dataset.value; isDraggingFromTill = (draggedItem.parentElement === moneyTill); setTimeout(() => { if (draggedItem && !isDraggingFromTill) { draggedItem.classList.add('dragging-source'); } else if (draggedItem && isDraggingFromTill) { draggedItem.style.opacity = '0.7'; } }, 0); e.dataTransfer.setData('text/plain', draggedValue); e.dataTransfer.effectAllowed = 'copy'; }
        function handleDragEnd() { setTimeout(() => { if (draggedItem) { draggedItem.classList.remove('dragging-source'); draggedItem.style.opacity = ''; } document.querySelectorAll('.money-item.dragging-source').forEach(el => el.classList.remove('dragging-source')); draggedItem = null; draggedValue = null; isDraggingFromTill = false; changeGivenBox.classList.remove('drag-over'); }, 0); }
        function handleDragOver(e) { e.preventDefault(); if (e.target === changeGivenBox || !e.target.closest('.money-item')) { changeGivenBox.classList.add('drag-over'); e.dataTransfer.dropEffect = 'copy'; } }
        function handleDragLeave(e) { if (e.target === changeGivenBox || !changeGivenBox.contains(e.relatedTarget)) { changeGivenBox.classList.remove('drag-over'); } }
        function handleDrop(e) { e.preventDefault(); changeGivenBox.classList.remove('drag-over'); if (solved || !draggedValue || !isDraggingFromTill) return; if (e.target === changeGivenBox || !e.target.closest('.money-item')) { const moneyType = moneyTypes.find(m => m.value == draggedValue); if (moneyType) { const newItem = createMoneyElement(moneyType, true); changeGivenBox.appendChild(newItem); updateTotalDisplay(); } } }
        function handleTouchStart(e) { if(solved)return; isTouchDragging = false; draggedItem = e.currentTarget; draggedValue = draggedItem.dataset.value; isDraggingFromTill = (draggedItem.parentElement === moneyTill); const touch = e.touches[0]; touchStartX = touch.clientX; touchStartY = touch.clientY; const rect = draggedItem.getBoundingClientRect(); touchOffsetX = touch.clientX - rect.left; touchOffsetY = touch.clientY - rect.top; }
        function handleTouchMove(e) { if (!draggedItem) return; const touch = e.touches[0]; if (!isTouchDragging) { if (Math.abs(touch.clientX - touchStartX) > touchMoveThreshold || Math.abs(touch.clientY - touchStartY) > touchMoveThreshold) { isTouchDragging = true; e.preventDefault(); ghostImageElement = draggedItem.cloneNode(true); ghostImageElement.classList.add('ghost-image'); ghostImageElement.style.width = `${draggedItem.offsetWidth}px`; ghostImageElement.style.height = `${draggedItem.offsetHeight}px`; document.body.appendChild(ghostImageElement); if (!isDraggingFromTill) { originalItemVisibility = draggedItem.style.visibility; draggedItem.style.visibility = 'hidden'; } draggedItem.classList.add('dragging-source'); } } if (isTouchDragging) { e.preventDefault(); ghostImageElement.style.left = `${touch.clientX - touchOffsetX}px`; ghostImageElement.style.top = `${touch.clientY - touchOffsetY}px`; ghostImageElement.style.display = 'none'; const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY); ghostImageElement.style.display = ''; if (changeGivenBox === elementUnderTouch || changeGivenBox.contains(elementUnderTouch)) { changeGivenBox.classList.add('drag-over'); } else { changeGivenBox.classList.remove('drag-over'); } } }
        function handleTouchEnd(e) { if (!draggedItem) { isTouchDragging = false; return; } if (isTouchDragging) { if (ghostImageElement) ghostImageElement.style.display = 'none'; const endTargetElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY); if (ghostImageElement) ghostImageElement.style.display = ''; const finalTargetBox = endTargetElement === changeGivenBox || changeGivenBox.contains(endTargetElement); if (!isDraggingFromTill) { draggedItem.style.visibility = originalItemVisibility; } if (finalTargetBox && isDraggingFromTill && !solved) { const moneyType = moneyTypes.find(m => m.value == draggedValue); if (moneyType) { const newItem = createMoneyElement(moneyType, true); changeGivenBox.appendChild(newItem); updateTotalDisplay(); } } } if (draggedItem) { draggedItem.classList.remove('dragging-source'); draggedItem.style.visibility = originalItemVisibility; draggedItem.style.opacity = ''; } if (ghostImageElement) { ghostImageElement.remove(); ghostImageElement = null; } changeGivenBox.classList.remove('drag-over'); const touchEndTargetItem = e.target.closest('.money-item'); if (!isTouchDragging && touchEndTargetItem === draggedItem && draggedItem.parentElement === changeGivenBox) { handleItemClick({ currentTarget: draggedItem }); } draggedItem = null; draggedValue = null; isTouchDragging = false; isDraggingFromTill = false; originalItemVisibility = ''; }

        function handleItemClick(e) {
            if(solved)return;
            const clickedItem = e.currentTarget;
            if (clickedItem.parentElement === changeGivenBox) { clickedItem.remove(); updateTotalDisplay(); setFeedback(''); }
        }

        function applyFeedbackStyle(type) {
            const success = type === 'success';
            changeGivenBox.classList.add(success ? 'feedback-success' : 'feedback-error');
            totalContainer.classList.add(success ? 'feedback-success' : 'feedback-error');
            setTimeout(() => {
                changeGivenBox.classList.remove('feedback-success', 'feedback-error');
                totalContainer.classList.remove('feedback-success', 'feedback-error');
            }, 1000);
        }

        function calculateOptimalChange(amount) {
            let remaining = Math.round(amount * 100);
            let count = 0;
            for (const money of moneyTypes) {
                const valueInCents = Math.round(money.value * 100);
                const numItems = Math.floor(remaining / valueInCents);
                count += numItems;
                remaining -= numItems * valueInCents;
            }
            return count;
        }

        function checkChange() {
            if(solved)return;
            const currentTotal = calculateTotalInBox();
            if (Math.abs(currentTotal - changeDue) < 0.001) {
                stopTimer();solved=true;newTransactionButton.disabled=false;clearButton.disabled=true;roundCount++;if(!hadAttempt&&!usedHint)independent++;
                const optimalCount = calculateOptimalChange(changeDue);
                const userItemCount = changeGivenBox.children.length;
                if (optimalCount === userItemCount) {
                    setFeedback('Perfect Change! You used the fewest items possible!', 'success');
                } else {
                    setFeedback('Correct! Perfect change!', 'success');
                }
                applyFeedbackStyle('success');
                checkButton.disabled = true;
                document.getElementById('round-status').textContent=roundCount+' of 8 complete · '+independent+' first-try solutions';
            } else {
                hadAttempt=true;
                applyFeedbackStyle('error');
                if (currentTotal > changeDue) {
                    setFeedback(`Too much! You gave ${formatCurrency(currentTotal)}. Try removing some.`, 'error');
                } else {
                    setFeedback(`Not enough! You only gave ${formatCurrency(currentTotal)}. Try adding more.`, 'error');
                }
            }
        }

        function setFeedback(message, type = 'info') {
            feedbackDiv.textContent = message;
            feedbackDiv.className = 'feedback mt-4 text-center text-lg font-semibold min-h-[1.5em]';
            if (type === 'success') feedbackDiv.classList.add('text-green-600');
            if (type === 'error') feedbackDiv.classList.add('text-red-600');
        }

        function setDifficulty(newDifficulty) {
            if (difficulty === newDifficulty) return;
            roundCount=0;independent=0;
            difficulty = newDifficulty;
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
            });
            generateNewTransaction();
        }

        function startTimer() {
            timeLeft = 30;
            timerEl.textContent = timeLeft;
            timerInterval = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    stopTimer();
                    hadAttempt=true;setFeedback("Time is up. Keep working without the timer, then choose Next transaction.", 'error');
                    applyFeedbackStyle('error');

                }
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        function initializeGame() {
            moneyTill = document.getElementById('moneyTill'); changeGivenBox = document.getElementById('changeGivenBox'); totalCostEl = document.getElementById('totalCost');
            roundedTotalEl = document.getElementById('roundedTotal'); amountPaidEl = document.getElementById('amountPaid'); changeDueEl = document.getElementById('changeDue');
            currentTotalEl = document.getElementById('currentTotal'); checkButton = document.getElementById('checkButton'); newTransactionButton = document.getElementById('newTransactionButton');
            feedbackDiv = document.getElementById('feedback'); clearButton = document.getElementById('clearButton'); totalContainer = document.getElementById('totalContainer');
            changeDueContainer = document.getElementById('changeDueContainer'); timerContainer = document.getElementById('timerContainer'); timerEl = document.getElementById('timer');
            
            if (!moneyTill) { console.error("Initialization failed."); return; }

            populateTill();
            generateNewTransaction();

            changeGivenBox.addEventListener('dragover', handleDragOver); changeGivenBox.addEventListener('dragleave', handleDragLeave); changeGivenBox.addEventListener('drop', handleDrop);
            checkButton.addEventListener('click', checkChange);
            newTransactionButton.addEventListener('click', generateNewTransaction);
            clearButton.addEventListener('click', resetChangeBox);

            document.querySelectorAll('.difficulty-btn').forEach(btn => btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty)));
            document.addEventListener('touchmove', handleTouchMove, { passive: false }); document.addEventListener('touchend', handleTouchEnd);
            console.log("Cashier Change Game Initialized");
        }

        initializeGame();
    
document.getElementById('hint-change').onclick=()=>{usedHint=true;setFeedback('Count up from the cash total '+roundedTotalEl.textContent+' to the amount paid '+amountPaidEl.textContent+'. The difference is the change. Cash totals round to the nearest 5¢.','info');};
document.getElementById('restart-round').onclick=()=>{roundCount=0;independent=0;generateNewTransaction()};document.getElementById('timed').onchange=()=>generateNewTransaction();
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTimer();setFeedback('Timer paused while the page is hidden. You can continue without time pressure.')}});
