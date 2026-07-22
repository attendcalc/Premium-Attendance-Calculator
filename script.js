document.addEventListener('DOMContentLoaded', () => {
    const totalInput = document.getElementById('total-classes');
    const attendedInput = document.getElementById('attended-classes');
    const requiredInput = document.getElementById('required-percentage');
    
    const percentageText = document.getElementById('current-percentage');
    const percentageCircle = document.getElementById('percentage-circle');
    const statusBadge = document.getElementById('status-badge');
    const goalMessage = document.getElementById('goal-message');
    
    // Setup event listeners for real-time calculation
    [totalInput, attendedInput, requiredInput].forEach(input => {
        input.addEventListener('input', calculateAttendance);
    });

    function calculateAttendance() {
        const total = parseInt(totalInput.value);
        let attended = parseInt(attendedInput.value);
        const required = parseInt(requiredInput.value) || 0;

        // Validation & Reset
        if (isNaN(total) || isNaN(attended) || total <= 0) {
            resetDisplay();
            return;
        }

        // Prevent attended from being greater than total
        if (attended > total) {
            attended = total;
            attendedInput.value = total;
        }

        // Calculate current percentage
        const currentPercentage = (attended / total) * 100;
        const currentPercentageFormatted = currentPercentage.toFixed(1);
        
        updatePercentageDisplay(currentPercentage, currentPercentageFormatted);
        updateGoalAnalysis(total, attended, required, currentPercentage);
    }

    function updatePercentageDisplay(percentage, formattedText) {
        // Update Text
        percentageText.textContent = `${formattedText}%`;
        
        // Update SVG Circle (dasharray out of 100)
        percentageCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);

        // Update Colors based on percentage ranges (assuming typical thresholds if no required is set)
        let strokeColor = 'var(--primary)';
        let badgeColor = 'rgba(99, 102, 241, 0.2)';
        let badgeTextColor = 'var(--primary-light)';
        let badgeText = 'Good';

        if (percentage >= 85) {
            strokeColor = 'var(--success)';
            badgeColor = 'rgba(16, 185, 129, 0.2)';
            badgeTextColor = '#34d399';
            badgeText = 'Excellent';
        } else if (percentage >= 75) {
            strokeColor = 'var(--primary)';
            badgeColor = 'rgba(99, 102, 241, 0.2)';
            badgeTextColor = 'var(--primary-light)';
            badgeText = 'Good';
        } else if (percentage >= 60) {
            strokeColor = 'var(--warning)';
            badgeColor = 'rgba(245, 158, 11, 0.2)';
            badgeTextColor = '#fbbf24';
            badgeText = 'Average';
        } else {
            strokeColor = 'var(--danger)';
            badgeColor = 'rgba(239, 68, 68, 0.2)';
            badgeTextColor = '#f87171';
            badgeText = 'Critical';
        }

        percentageCircle.style.stroke = strokeColor;
        statusBadge.style.backgroundColor = badgeColor;
        statusBadge.style.color = badgeTextColor;
        statusBadge.textContent = badgeText;
    }

    function updateGoalAnalysis(total, attended, required, currentPercentage) {
        if (!required || required <= 0 || required > 100) {
            goalMessage.innerHTML = 'Enter a valid required percentage to see your goal analysis.';
            return;
        }

        if (currentPercentage >= required) {
            // Already meeting or exceeding goal. How many can be missed?
            // Formula: floor((100*A - R*T) / R)
            const classesCanMiss = Math.floor((100 * attended - required * total) / required);
            
            if (classesCanMiss > 0) {
                goalMessage.innerHTML = `You are <span class="goal-highlight goal-success">above</span> your required percentage.<br>You can safely miss <span class="goal-highlight goal-success">${classesCanMiss}</span> class${classesCanMiss !== 1 ? 'es' : ''} and still maintain <strong>${required}%</strong>.`;
            } else {
                goalMessage.innerHTML = `You are exactly on target at <span class="goal-highlight goal-success">${required}%</span>. You cannot miss the next class!`;
            }
        } else {
            // Below goal. How many consecutive classes need to be attended?
            // Formula: ceil((R*T - 100*A) / (100 - R))
            if (required === 100) {
                 goalMessage.innerHTML = `You cannot reach 100% since you have already missed classes.`;
                 return;
            }
            const classesNeeded = Math.ceil((required * total - 100 * attended) / (100 - required));
            
            goalMessage.innerHTML = `You are <span class="goal-highlight goal-danger">below</span> your required percentage.<br>You need to attend <span class="goal-highlight goal-warning">${classesNeeded}</span> more class${classesNeeded !== 1 ? 'es' : ''} consecutively to reach <strong>${required}%</strong>.`;
        }
    }

    function resetDisplay() {
        percentageText.textContent = '0%';
        percentageCircle.setAttribute('stroke-dasharray', '0, 100');
        percentageCircle.style.stroke = 'var(--primary)';
        
        statusBadge.style.backgroundColor = 'rgba(148, 163, 184, 0.2)';
        statusBadge.style.color = 'var(--text-muted)';
        statusBadge.textContent = 'Awaiting Input';
        
        goalMessage.innerHTML = 'Enter your attendance details to see analysis.';
    }
});
