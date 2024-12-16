// Get references to DOM elements
const flashcard = document.getElementById('flashcard');
const flashcardWrapper = document.querySelector('.flashcard-wrapper');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const reverseBtn = document.getElementById('reverse');
const cardCount = document.getElementById('card-count');
const addVocabBtn = document.getElementById('add-vocab');
const vocabInput = document.getElementById('vocab-input');
const cardList = document.getElementById('card-list');
const checkBtn = document.getElementById('check');
const answerOverlay = document.getElementById('answer-overlay');
const answerInput = document.getElementById('answer-input');
const resultDisplay = document.getElementById('result');
const addVocabShowBtn = document.getElementById('add-vocab-show');
const vocabInputSection = document.getElementById('vocab-input-section');
const inputSection = document.getElementById('input-section');
const closeVocabInputBtn = document.getElementById('close-vocab-input');
const cardListSection = document.getElementById('card-list-section');
const toggleDefinitionBtn = document.getElementById('toggle-definition');
const switchIconBtn = document.getElementById('switch-icon');

// Variables to track the state of the flashcards and interactions
let vocabCards = [];
let currentCardIndex = 0;
let isFlipped = false;
let isReversed = false;
let isShuffled = false;
let isCheckMode = false;
let isShowingResult = false;
let originalOrder = [];

// Function to update flashcard content based on the current index
function updateFlashcard() {
    if (vocabCards.length === 0) {
        // Display a message if no cards are available
        flashcard.textContent = 'No cards available';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        reverseBtn.disabled = true;
    } else {
        // Display either the word or the definition depending on the flipped and reversed states
        const card = vocabCards[currentCardIndex];
        flashcard.textContent = isFlipped
            ? isReversed
                ? `${card.word}`
                : `${card.type ? card.type + ' ' : ''}${
                      card.phonetic ? card.phonetic + ' ' : ''
                  }${card.definition}${card.example ? ' ' + card.example : ''}`
            : isReversed
            ? `${card.type ? card.type + ' ' : ''}${
                  card.phonetic ? card.phonetic + ' ' : ''
              }${card.definition}${card.example ? ' ' + card.example : ''}`
            : `${card.word}`;

        // Update card count (e.g., "1/10")
        cardCount.textContent = `${currentCardIndex + 1} / ${
            vocabCards.length
        }`;

        // Disable the Previous button if it's the first card, disable Next if it's the last
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === vocabCards.length - 1;
        reverseBtn.disabled = false;
    }
    updateProgressBar(); // Update the progress bar
    updateControls(); // Update button states
}

// Function to update the progress bar based on the current card index
function updateProgressBar() {
    if (vocabCards.length > 0) {
        const progressPercentage =
            ((currentCardIndex + 1) / vocabCards.length) * 100;
        document.getElementById('progress-bar').style.width =
            progressPercentage + '%';
    } else {
        document.getElementById('progress-bar').style.width = '0%';
    }
}

// Function to flip the card between front and back
function flipCard() {
    isFlipped = !isFlipped;
    updateFlashcard();
}

// Function to update button states (enable/disable based on current state)
function updateControls() {
    const hasCards = vocabCards.length > 0;
    checkBtn.disabled = !hasCards;
    shuffleBtn.disabled = !hasCards;
    reverseBtn.disabled = !hasCards;
}

// Event listeners for the flashcard and buttons
flashcard.addEventListener('click', (event) => {
    flipCard(); // Flip card when flashcard is clicked
    event.stopPropagation(); // Prevent event from bubbling up
});

flashcardWrapper.addEventListener('click', () => {
    flipCard(); // Flip card when flashcard wrapper is clicked
});

// Go to the previous card when the Previous button is clicked
prevBtn.addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        isFlipped = false;
        updateFlashcard();
    }
});

// Go to the next card when the Next button is clicked
nextBtn.addEventListener('click', () => {
    if (currentCardIndex < vocabCards.length - 1) {
        currentCardIndex++;
        isFlipped = false;
        updateFlashcard();
    }
});

// Shuffle the cards when the Shuffle button is clicked
shuffleBtn.addEventListener('click', () => {
    if (!isShuffled) {
        originalOrder = [...vocabCards]; // Store original order
        vocabCards = vocabCards.sort(() => Math.random() - 0.5); // Shuffle
        shuffleBtn.style.backgroundColor = 'var(--btn-color)'; // Set color to active state
    } else {
        vocabCards = originalOrder; // Restore original order
        shuffleBtn.style.backgroundColor = ''; // Reset to default color
    }
    isShuffled = !isShuffled; // Toggle shuffle state
    currentCardIndex = 0;
    isFlipped = false;
    updateFlashcard();
});

// Reverse the flashcard content (word/definition) when the Reverse button is clicked
reverseBtn.addEventListener('click', () => {
    isReversed = !isReversed;
    reverseBtn.style.backgroundColor = isReversed ? 'var(--btn-color)' : ''; // Set color to active state
    currentCardIndex = 0;
    isFlipped = false;
    updateFlashcard();
});

// Hide the card-list-section initially
cardListSection.style.display = 'none';

// Variables to track the state of scroll locking
let isScrollLocked = true; // Lock scrolling initially

// Function to check and lock/unlock scrolling based on card availability
function toggleScrollLock() {
    if (vocabCards.length === 0) {
        isScrollLocked = true; // Lock scrolling when no cards
        window.scrollTo(0, 0); // Ensure the page stays at the top
    } else {
        isScrollLocked = false; // Unlock scrolling when there are cards
    }
}

// Add new vocabulary and update card list
addVocabBtn.addEventListener('click', () => {
    const vocabLines = vocabInput.value.trim().split('\n');
    let hasNewVocab = false;

    vocabLines.forEach((line) => {
        let parts = line.split('\t'); // Split content by tab

        // Remove empty parts (in case there are extra tabs)
        parts = parts.filter((part) => part.trim() !== '');

        let word, definition;

        // Ensure there are at least 2 parts: word and definition
        if (parts.length >= 2) {
            word = parts[0]; // The first part is the word
            // The rest is treated as the definition, joined with '|' between parts if applicable
            definition = parts.slice(1).join(' | ');
        }

        // Skip if word or definition is missing
        if (!word || !definition) return;

        // Add the new vocabulary to the vocabCards array
        vocabCards.push({ word, definition });

        // Create a list item for the new vocabulary
        const cardItem = document.createElement('li');
        cardItem.innerHTML = `<div class="vocab-word">${word}</div><div class="vocab-definition">${definition}</div>`;

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';

        deleteBtn.addEventListener('click', () => {
            const index = vocabCards.findIndex((card) => card.word === word);
            vocabCards.splice(index, 1); // Remove word from array
            cardItem.remove(); // Remove item from the list
            currentCardIndex = 0;
            updateFlashcard();

            // Hide the list if no vocabulary is left
            if (vocabCards.length === 0) {
                cardListSection.style.display = 'none';
                location.reload(); // Reload the page when all cards are deleted
            }
            toggleScrollLock(); // Check if scroll should be locked
        });

        // Add functionality to copy the word when clicked
        const vocabWordElement = cardItem.querySelector('.vocab-word');
        vocabWordElement.addEventListener('click', () => {
            navigator.clipboard.writeText(word).catch((err) => {
                console.error('Failed to copy word:', err);
            });
        });

        cardItem.appendChild(deleteBtn);
        cardList.appendChild(cardItem);
        hasNewVocab = true;
    });

    if (hasNewVocab) {
        cardListSection.style.display = 'block'; // Show the vocabulary list if new vocabulary is added
    }

    vocabInput.value = ''; // Clear input field after adding
    vocabInputSection.style.display = 'none'; // Hide the vocabulary input section
    updateFlashcard(); // Update flashcard display

    window.scrollTo(0, 0); // Scroll to the top after adding vocabulary

    toggleScrollLock(); // Unlock scrolling if new vocabulary is added
});

// Show or hide the answer check overlay when the Check button is clicked
checkBtn.addEventListener('click', () => {
    if (!isCheckMode) {
        answerOverlay.style.display = 'flex'; // Show overlay
        checkBtn.style.backgroundColor = 'var(--btn-color)'; // Set active button color
        isCheckMode = true;
        isShowingResult = false; // Reset result display state
        answerInput.focus();

        // Enable Reverse when Check mode is activated
        if (!isReversed) {
            reverseBtn.click(); // Simulate click to activate Reverse
        }

        // Lock flipping functionality when Check mode is activated
        lockFlipping();
    } else {
        answerOverlay.style.display = 'none'; // Hide overlay
        checkBtn.style.backgroundColor = ''; // Reset button color
        isCheckMode = false;
        isShowingResult = false; // Reset result display state
        resultDisplay.textContent = ''; // Clear result
        answerInput.value = ''; // Clear input field

        // Disable Reverse when Check mode is deactivated
        if (isReversed) {
            reverseBtn.click(); // Simulate click to deactivate Reverse
        }

        // Unlock flipping functionality when Check mode is deactivated
        unlockFlipping();
    }
});

// Check the user's answer when Enter is pressed
answerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key action

        if (!isShowingResult) {
            // Check if the result has not been displayed
            const userAnswer = answerInput.value.trim().toLowerCase();
            const correctAnswer =
                vocabCards[currentCardIndex].word.toLowerCase(); // Get the correct word

            // Reset result display
            resultDisplay.innerHTML = '';

            if (userAnswer === correctAnswer) {
                // Display correct result
                resultDisplay.innerHTML = `<span class="result correct"><i class="fas fa-check-circle"></i> ${vocabCards[currentCardIndex].word}</span>`;
                isShowingResult = true; // Mark that the result has been displayed
            } else {
                // Display incorrect result and prompt user to retry
                let displayedAnswer = '';
                for (let i = 0; i < correctAnswer.length; i++) {
                    if (userAnswer[i] === correctAnswer[i]) {
                        displayedAnswer += `<span>${correctAnswer[i]}</span>`;
                    } else {
                        displayedAnswer += `<span style="background-color: #ff4d4d;">${correctAnswer[i]}</span>`;
                    }
                }
                resultDisplay.innerHTML = `<span class="result wrong"><i class="fas fa-times-circle"></i> ${displayedAnswer}</span>`;
                answerInput.value = ''; // Clear input field to prompt re-entry
            }
        } else {
            // Move to the next card if not at the last card, clear result and reset state
            if (currentCardIndex < vocabCards.length - 1) {
                currentCardIndex++;
                isFlipped = false;
                updateFlashcard();
                resultDisplay.innerHTML = ''; // Clear result display when moving to the next card
                answerInput.value = ''; // Clear input field
            } else {
                // Exit check mode if on the last card
                checkBtn.click(); // Trigger click to exit check mode
            }
            isShowingResult = false; // Reset result display state
        }
    }
});

// Add event listener for keydown to handle shortcuts
document.addEventListener('keydown', (event) => {
    const isInputFocused =
        document.activeElement === answerInput ||
        document.activeElement === vocabInput;

    if (event.key === ' ' && !isInputFocused) {
        event.preventDefault();
        flipCard(); // Flip card on space bar press
    } else if (
        event.key === 'ArrowLeft' &&
        currentCardIndex > 0 &&
        !isInputFocused
    ) {
        event.preventDefault();
        currentCardIndex--; // Move to previous card on left arrow
        isFlipped = false;
        updateFlashcard();
    } else if (
        (event.key === 'ArrowRight' || event.key === 'Enter') &&
        currentCardIndex < vocabCards.length - 1 &&
        !isInputFocused
    ) {
        event.preventDefault();
        currentCardIndex++; // Move to next card on right arrow or Enter key
        isFlipped = false;
        updateFlashcard();
    } else if (event.key === 'r' && !isInputFocused) {
        event.preventDefault();
        reverseBtn.click(); // Trigger reverse button on 'R' key press
    } else if (event.key === 'c' && !isInputFocused) {
        event.preventDefault();
        checkBtn.click(); // Trigger check button on 'C' key press
    } else if (event.key === 's' && !isInputFocused) {
        event.preventDefault();
        shuffleBtn.click(); // Trigger shuffle button on 'S' key press
    } else if (event.key === 'a' && !isInputFocused) {
        event.preventDefault();
        addVocabShowBtn.click(); // Trigger add vocabulary show button on 'A' key press
    } else if (event.key === 'Escape' && isCheckMode) {
        // Exit Check mode with ESC key
        checkBtn.click(); // Simulate click to deactivate Check
    }
});

// Show vocab input section when 'Add Vocabulary' button is clicked
addVocabShowBtn.addEventListener('click', () => {
    vocabInputSection.style.display = 'flex'; // Show vocab input section
});

// Toggle visibility of vocab input section when 'Add Vocabulary' button is clicked
addVocabBtn.addEventListener('click', () => {
    inputSection.classList.toggle('show'); // Toggle visibility of vocab input section
    vocabInput.focus(); // Focus on the input field
});

// Close vocab input section when 'X' button is clicked
closeVocabInputBtn.addEventListener('click', () => {
    vocabInputSection.style.display = 'none';
});

// Close vocab input section when clicking outside the input section
vocabInputSection.addEventListener('click', (event) => {
    if (event.target === vocabInputSection) {
        vocabInputSection.style.display = 'none';
    }
});

const logo = document.getElementById('logo');
logo.addEventListener('click', () => {
    window.scrollTo(0, 0); // Scroll to top when logo is clicked
});

// Function to lock the flipping functionality
function lockFlipping() {
    flashcard.removeEventListener('click', flipCard); // Remove click event for flipping
    flashcardWrapper.removeEventListener('click', flipCard); // Remove click event for flipping
}

// Function to unlock the flipping functionality
function unlockFlipping() {
    flashcard.addEventListener('click', flipCard); // Add click event for flipping
    flashcardWrapper.addEventListener('click', flipCard); // Add click event for flipping
}

// Add event listener for keydown to handle closing vocab input with ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && vocabInputSection.style.display === 'flex') {
        vocabInputSection.style.display = 'none'; // Hide vocab input section when ESC is pressed
    }
});

// Activate check mode
checkBtn.addEventListener('click', () => {
    if (!isCheckMode) {
        lockFlipping(); // Lock flipping for both flashcard and flashcard-wrapper
    } else {
        unlockFlipping(); // Unlock flipping when exiting check mode
    }
});

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function () {
    // Check if the window width is 739px or less (likely mobile)
    if (window.innerWidth <= 739) {
        const controls = document.getElementById('controls');

        // Create a div for the first row of controls
        const row1 = document.createElement('div');
        row1.classList.add('control-row-1');

        // Create a div for the second row of controls
        const row2 = document.createElement('div');
        row2.classList.add('control-row-2');

        // Move the appropriate buttons to the first row
        const prev = document.getElementById('prev');
        const cardCount = document.getElementById('card-count');
        const next = document.getElementById('next');

        // Append buttons (prev, card-count, next) to the first row
        row1.appendChild(prev);
        row1.appendChild(cardCount);
        row1.appendChild(next);

        // Move the appropriate buttons to the second row
        const reverse = document.getElementById('reverse');
        const shuffle = document.getElementById('shuffle');
        const check = document.getElementById('check');
        const addVocabShow = document.getElementById('add-vocab-show');

        // Append buttons (reverse, shuffle, check, add-vocab-show) to the second row
        row2.appendChild(reverse);
        row2.appendChild(shuffle);
        row2.appendChild(check);
        row2.appendChild(addVocabShow);

        // Clear the #controls container and add the two new rows
        controls.innerHTML = '';

        // Append row1 and row2 into the controls container
        controls.appendChild(row1);
        controls.appendChild(row2);
    }
});

// Check if service workers are supported, then register the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./service-worker.js').then(
            function (registration) {
                console.log(
                    'Service Worker registered with scope:',
                    registration.scope,
                );
            },
            function (err) {
                console.log('Service Worker registration failed:', err);
            },
        );
    });
}

// Prevent double tap event
document.addEventListener(
    'touchstart',
    function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    },
    { passive: false },
);

document.addEventListener('dblclick', function (event) {
    event.preventDefault();
});

// Scroll to top when page is refreshed or loaded
window.addEventListener('beforeunload', function () {
    window.scrollTo(0, 0);
});

// State variables to track the toggle status
let isDefinitionVisible = true;
let isVocabularyVisible = true;
let mode = 'definition'; // Can be 'definition' or 'vocabulary'

// Function to toggle visibility of definitions and vocabulary
function toggleVisibility() {
    if (mode === 'definition') {
        isDefinitionVisible = !isDefinitionVisible;
        document.querySelectorAll('.vocab-definition').forEach((def) => {
            def.style.opacity = isDefinitionVisible ? '1' : '0';
        });
        toggleDefinitionBtn.textContent = isDefinitionVisible
            ? 'Hide Definition'
            : 'Show Definition';
    } else if (mode === 'vocabulary') {
        isVocabularyVisible = !isVocabularyVisible;
        document.querySelectorAll('.vocab-word').forEach((word) => {
            word.style.opacity = isVocabularyVisible ? '1' : '0';
        });
        toggleDefinitionBtn.textContent = isVocabularyVisible
            ? 'Hide Vocabulary'
            : 'Show Vocabulary';
    }
}

// Event listener for toggle-definition button
toggleDefinitionBtn.addEventListener('click', toggleVisibility);

// Event listener for switch-icon button
switchIconBtn.addEventListener('click', function () {
    if (mode === 'definition') {
        mode = 'vocabulary';
        isDefinitionVisible = true; // Reset visibility
        document.querySelectorAll('.vocab-definition').forEach((def) => {
            def.style.opacity = '1'; // Show definitions when switching modes
        });
        toggleDefinitionBtn.textContent = 'Show Vocabulary';
    } else {
        mode = 'definition';
        isVocabularyVisible = true; // Reset visibility
        document.querySelectorAll('.vocab-word').forEach((word) => {
            word.style.opacity = '1'; // Show vocabulary when switching modes
        });
        toggleDefinitionBtn.textContent = 'Show Definition';
    }
});

// Function to toggle visibility of individual hidden words or definitions
function showOnClick() {
    // Add click event listener to all vocab-word elements
    document.querySelectorAll('.vocab-word').forEach((word) => {
        word.addEventListener('click', function () {
            if (word.style.opacity === '0') {
                word.style.opacity = '1'; // Make word visible
            }
        });
    });

    // Add click event listener to all vocab-definition elements
    document.querySelectorAll('.vocab-definition').forEach((def) => {
        def.addEventListener('click', function () {
            if (def.style.opacity === '0') {
                def.style.opacity = '1'; // Make definition visible
            }
        });
    });
}

// Call the showOnClick function after the DOM has loaded or after toggling visibility
document.addEventListener('DOMContentLoaded', showOnClick);
toggleDefinitionBtn.addEventListener('click', showOnClick); // Reapply event listeners when toggling definitions

// Function to toggle visibility of #card-controls when scrolling
function toggleCardControlsOnScroll() {
    const cardListSection = document.getElementById('card-list-section');
    const cardControls = document.getElementById('card-controls');

    // Calculate when 30% of the card-list-section is scrolled
    const scrollPosition = window.scrollY + window.innerHeight;
    const sectionTop = cardListSection.offsetTop;
    const sectionHeight = cardListSection.offsetHeight;
    const triggerPosition = sectionTop + sectionHeight * 0.3; // 30% of the section height

    // Show or hide the #card-controls based on scroll position
    if (scrollPosition >= triggerPosition) {
        cardControls.style.display = 'block'; // Show controls
    } else {
        cardControls.style.display = 'none'; // Hide controls
    }
}

// Attach the scroll event listener
window.addEventListener('scroll', toggleCardControlsOnScroll);

// Initially hide the #card-controls
document.getElementById('card-controls').style.display = 'none';

// Function to handle the 'Add Vocabulary' button click
vocabInput.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') {
        event.preventDefault(); // Prevent the default tab behavior

        // Get the current position of the cursor
        const start = this.selectionStart;
        const end = this.selectionEnd;

        // Insert a tab at the cursor's position
        this.value =
            this.value.substring(0, start) + '\t' + this.value.substring(end);

        // Move the cursor after the inserted tab
        this.selectionStart = this.selectionEnd = start + 1;
    }
});
