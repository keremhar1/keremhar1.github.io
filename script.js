// Calculator state
let currentInput = '0';
let operator = null;
let previousInput = null;
let shouldResetDisplay = false;

// Get display element
const display = document.getElementById('display');

// Update the display
function updateDisplay() {
    display.textContent = currentInput;
    display.classList.remove('error');
}

// Clear all calculator data
function clearDisplay() {
    currentInput = '0';
    operator = null;
    previousInput = null;
    shouldResetDisplay = false;
    updateDisplay();
}

// Delete last character
function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Append number or operator to display
function appendToDisplay(value) {
    // Handle numbers and decimal point
    if (!isNaN(value) || value === '.') {
        appendNumber(value);
    } 
    // Handle operators
    else if (['+', '-', '*', '/'].includes(value)) {
        appendOperator(value);
    }
}

// Append number or decimal point
function appendNumber(value) {
    // Reset display if needed
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    // Handle decimal point
    if (value === '.') {
        // Prevent multiple decimal points
        if (currentInput.includes('.')) {
            return;
        }
        // Add decimal point
        if (currentInput === '0') {
            currentInput = '0.';
        } else {
            currentInput += '.';
        }
    } else {
        // Handle numbers
        if (currentInput === '0') {
            currentInput = value;
        } else {
            currentInput += value;
        }
    }
    
    updateDisplay();
}

// Append operator
function appendOperator(newOperator) {
    // If there's a pending calculation, perform it first
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = currentInput;
    operator = newOperator;
    shouldResetDisplay = true;
}

// Perform calculation
function calculate() {
    if (operator === null || previousInput === null) {
        return;
    }
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                showError('Cannot divide by zero');
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    // Handle result
    if (isNaN(result) || !isFinite(result)) {
        showError('Invalid operation');
        return;
    }
    
    // Format result to avoid floating point precision issues
    currentInput = formatResult(result);
    operator = null;
    previousInput = null;
    shouldResetDisplay = true;
    updateDisplay();
}

// Format calculation result
function formatResult(result) {
    // Handle very large or very small numbers
    if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-15 && result !== 0)) {
        return result.toExponential(10);
    }
    
    // Round to avoid floating point precision issues
    const rounded = Math.round(result * 1e12) / 1e12;
    
    // Convert to string and remove unnecessary zeros
    let resultStr = rounded.toString();
    
    // Limit decimal places for display
    if (resultStr.includes('.') && resultStr.split('.')[1].length > 10) {
        resultStr = rounded.toFixed(10).replace(/\.?0+$/, '');
    }
    
    return resultStr;
}

// Show error message
function showError(message) {
    currentInput = message;
    display.classList.add('error');
    display.textContent = currentInput;
    
    // Reset after 2 seconds
    setTimeout(() => {
        clearDisplay();
    }, 2000);
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Prevent default for calculator keys
    if ('0123456789+-*/.='.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
    }
    
    // Handle number keys
    if ('0123456789.'.includes(key)) {
        appendToDisplay(key);
    }
    // Handle operator keys
    else if ('+-*/'.includes(key)) {
        appendToDisplay(key);
    }
    // Handle equals/enter
    else if (key === '=' || key === 'Enter') {
        calculate();
    }
    // Handle clear (Escape)
    else if (key === 'Escape') {
        clearDisplay();
    }
    // Handle backspace
    else if (key === 'Backspace') {
        deleteLast();
    }
});

// Initialize display
updateDisplay();

// Add visual feedback for keyboard presses
document.addEventListener('keydown', function(event) {
    const key = event.key;
    let button = null;
    
    // Find corresponding button
    if ('0123456789'.includes(key)) {
        button = Array.from(document.querySelectorAll('.btn-number')).find(btn => btn.textContent === key);
    } else if (key === '.') {
        button = Array.from(document.querySelectorAll('.btn-number')).find(btn => btn.textContent === '.');
    } else if (key === '+') {
        button = document.querySelector('.btn-operation[onclick*="+"]');
    } else if (key === '-') {
        button = document.querySelector('.btn-operation[onclick*="-"]');
    } else if (key === '*') {
        button = document.querySelector('.btn-operation[onclick*="*"]');
    } else if (key === '/') {
        button = document.querySelector('.btn-operation[onclick*="/"]');
    } else if (key === '=' || key === 'Enter') {
        button = document.querySelector('.btn-equals');
    } else if (key === 'Escape') {
        button = document.querySelector('.btn-clear');
    } else if (key === 'Backspace') {
        button = document.querySelector('.btn-operation[onclick*="deleteLast"]');
    }
    
    // Add visual feedback
    if (button) {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.boxShadow = '';
        }, 100);
    }
});

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', function(event) {
    if (event.target.classList.contains('btn')) {
        event.preventDefault();
    }
});

// Add touch feedback for mobile
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('touchstart', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    });
    
    button.addEventListener('touchend', function() {
        setTimeout(() => {
            this.style.transform = '';
            this.style.boxShadow = '';
        }, 100);
    });
});