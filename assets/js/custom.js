document.addEventListener('DOMContentLoaded', function() {
  // Memory Game implementation
  const memoryGame = (function() {
    // Game state
    let gameStarted = false;
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval = null;
    let cardValues = [];
    let difficulty = 'easy';
    
    // DOM Elements
    const gameBoard = document.getElementById('gameBoard');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const difficultySelect = document.getElementById('difficulty');
    const movesCount = document.getElementById('movesCount');
    const matchesCount = document.getElementById('matchesCount');
    const winMessage = document.getElementById('winMessage');
    const bestScoreEasy = document.getElementById('bestScoreEasy');
    const bestScoreHard = document.getElementById('bestScoreHard');
    const timerDisplay = document.getElementById('timerDisplay');
    
    // Card data - using emojis for simplicity
    const cardData = [
      '🍎', '🍌', '🍇', '🍊', '🍓', '🍒',
      '🍕', '🍔', '🍦', '🍩', '🌮', '🥝',
      '🚗', '⚽', '🎮', '🎸', '🎨', '📚'
    ];
    
    // Initialize the game
    function init() {
      if (!gameBoard) return;
      
      // Load best scores from localStorage
      loadBestScores();
      
      // Event listeners
      startBtn.addEventListener('click', startGame);
      restartBtn.addEventListener('click', restartGame);
      difficultySelect.addEventListener('change', changeDifficulty);
      
      // Initialize the board
      initGameBoard();
    }
    
    // Load best scores from localStorage
    function loadBestScores() {
      const easyScore = localStorage.getItem('memoryGameBestScoreEasy');
      const hardScore = localStorage.getItem('memoryGameBestScoreHard');
      
      if (easyScore) {
        bestScoreEasy.textContent = easyScore;
      }
      
      if (hardScore) {
        bestScoreHard.textContent = hardScore;
      }
    }
    
    // Change difficulty
    function changeDifficulty() {
      difficulty = difficultySelect.value;
      restartGame();
    }
    
    // Start the game
    function startGame() {
      if (gameStarted) return;
      
      gameStarted = true;
      startBtn.disabled = true;
      startTimer();
    }
    
    // Start timer
    function startTimer() {
      timer = 0;
      updateTimerDisplay();
      
      timerInterval = setInterval(() => {
        timer++;
        updateTimerDisplay();
      }, 1000);
    }
    
    // Update timer display
    function updateTimerDisplay() {
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Stop timer
    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
    
    // Restart the game
    function restartGame() {
      // Reset game state
      gameStarted = false;
      flippedCards = [];
      matchedPairs = 0;
      moves = 0;
      stopTimer();
      
      // Update UI
      movesCount.textContent = '0';
      matchesCount.textContent = '0';
      winMessage.style.display = 'none';
      winMessage.className = 'win-message';
      startBtn.disabled = false;
      timerDisplay.textContent = '00:00';
      
      // Reinitialize the game board
      initGameBoard();
    }
    
    // Initialize game board based on difficulty
    function initGameBoard() {
      // Clear the board
      gameBoard.innerHTML = '';
      
      // Determine grid size based on difficulty
      let gridSize;
      if (difficulty === 'easy') {
        gridSize = 12; // 4x3 grid
        gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
      } else {
        gridSize = 24; // 6x4 grid
        gameBoard.style.gridTemplateColumns = 'repeat(6, 1fr)';
      }
      
      // Create card values array
      cardValues = createCardValues(gridSize);
      
      // Create cards
      for (let i = 0; i < gridSize; i++) {
        createCard(i);
      }
    }
    
    // Create card values array with pairs
    function createCardValues(gridSize) {
      const pairsNeeded = gridSize / 2;
      const selectedValues = cardData.slice(0, pairsNeeded);
      
      // Create pairs array
      const values = [];
      selectedValues.forEach(value => {
        values.push(value);
        values.push(value);
      });
      
      // Shuffle the array
      return shuffleArray(values);
    }
    
    // Shuffle array function
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    
    // Create a single card
    function createCard(index) {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.index = index;
      
      const cardInner = document.createElement('div');
      cardInner.className = 'card-inner';
      
      const cardFront = document.createElement('div');
      cardFront.className = 'card-front';
      cardFront.textContent = '?';
      
      const cardBack = document.createElement('div');
      cardBack.className = 'card-back';
      cardBack.textContent = cardValues[index];
      
      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      card.appendChild(cardInner);
      
      card.addEventListener('click', flipCard);
      
      gameBoard.appendChild(card);
    }
    
    // Flip card function
    function flipCard() {
      // Check if game has started
      if (!gameStarted) {
        startGame();
      }
      
      const card = this;
      
      // Prevent flipping if:
      // - card is already flipped or matched
      // - two cards are already flipped
      if (card.classList.contains('flipped') || 
          card.classList.contains('matched') || 
          flippedCards.length === 2) {
        return;
      }
      
      // Flip the card
      card.classList.add('flipped');
      flippedCards.push(card);
      
      // Check for match if two cards are flipped
      if (flippedCards.length === 2) {
        moves++;
        movesCount.textContent = moves;
        
        setTimeout(checkForMatch, 1000);
      }
    }
    
    // Check for match
    function checkForMatch() {
      const [card1, card2] = flippedCards;
      const value1 = cardValues[card1.dataset.index];
      const value2 = cardValues[card2.dataset.index];
      
      if (value1 === value2) {
        // Match found
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        matchesCount.textContent = matchedPairs;
        
        // Check if game is won
        checkWinCondition();
      } else {
        // No match
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
      }
      
      // Clear flipped cards
      flippedCards = [];
    }
    
    // Check win condition
    function checkWinCondition() {
      const totalPairs = cardValues.length / 2;
      
      if (matchedPairs === totalPairs) {
        // Game won
        stopTimer();
        showWinMessage();
        
        // Update best score
        updateBestScore();
      }
    }
    
    // Show win message
    function showWinMessage() {
      winMessage.textContent = `Congratulations! You completed the game in ${moves} moves and ${timer} seconds!`;
      winMessage.className = 'win-message win';
      winMessage.style.display = 'block';
    }
    
    // Update best score
    function updateBestScore() {
      const bestScoreKey = difficulty === 'easy' ? 'memoryGameBestScoreEasy' : 'memoryGameBestScoreHard';
      const currentBestScore = localStorage.getItem(bestScoreKey);
      
      if (!currentBestScore || moves < parseInt(currentBestScore)) {
        localStorage.setItem(bestScoreKey, moves.toString());
        loadBestScores();
      }
    }
    
    // Public methods
    return {
      init: init,
      restart: restartGame
    };
  })();
  
  // Initialize the memory game if the elements exist
  if (document.getElementById('gameBoard')) {
    memoryGame.init();
  }
  
  // Existing contact form validation code
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    setupRatingDisplay();
    contactForm.addEventListener('submit', handleFormSubmission);
    checkFormValidity();
  }
});

// Rating slider value display
function setupRatingDisplay() {
  const ratings = [1, 2, 3];
  ratings.forEach(rating => {
    const slider = document.getElementById(`rating${rating}`);
    const valueDisplay = document.getElementById(`rating${rating}-value`);
    if (slider && valueDisplay) {
      slider.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
      });
    }
  });
}

// Handle form submission
function handleFormSubmission(e) {
  e.preventDefault();
  
  // Collect form data
  const formData = {
    name: document.getElementById('name').value.trim(),
    surname: document.getElementById('surname').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    rating1: parseInt(document.getElementById('rating1').value),
    rating2: parseInt(document.getElementById('rating2').value),
    rating3: parseInt(document.getElementById('rating3').value)
  };
  
  // Print to console
  console.log('Form Data:', formData);
  
  // Display results below form
  displayFormData(formData);
  
  // Show success popup
  showSuccessPopup();
}

// Display form data below the form
function displayFormData(data) {
  const resultsContainer = document.getElementById('formResults');
  const resultsContent = document.getElementById('resultsContent');
  const averageRatingElement = document.getElementById('averageRating');
  if (resultsContainer && resultsContent && averageRatingElement) {
    // Show the results container
    resultsContainer.style.display = 'block';
    // Clear previous content
    resultsContent.innerHTML = '';
    // Add each field value to results
    resultsContent.innerHTML = `
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Surname:</strong> ${data.surname}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone number:</strong> ${data.phone}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Service rating:</strong> ${data.rating1}/10</p>
    <p><strong>Recommendation likelihood:</strong> ${data.rating2}/10</p>
    <p><strong>Communication rating:</strong> ${data.rating3}/10</p>
    `;
    // Calculate average rating
    const average = ((data.rating1 + data.rating2 + data.rating3) / 3).toFixed(1);
    const fullName = `${data.name} ${data.surname}`;
    // Set average rating text and color code
    averageRatingElement.textContent = `${fullName}: ${average}`;
    // Color code based on average
    if (average <= 4) {
      averageRatingElement.style.color = '#e74c3c'; // Red
    } else if (average <= 7) {
      averageRatingElement.style.color = '#f39c12'; // Orange
    } else {
      averageRatingElement.style.color = '#27ae60'; // Green
    }
    averageRatingElement.style.fontWeight = 'bold';
    averageRatingElement.style.fontSize = '1.2rem';
  }
}

// Show success popup notification
function showSuccessPopup() {
  const popup = document.getElementById('successPopup');
  if (popup) {
    popup.style.display = 'block';
    popup.classList.add('show');
    // Hide after 3 seconds
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => {
        popup.style.display = 'none';
      }, 300);
    }, 3000);
  }
}

// Check form validity
function checkFormValidity() {
  const fields = ['name', 'surname', 'email', 'phone', 'address'];
  const submitBtn = document.getElementById('submitBtn');
  
  if (!submitBtn) return;
  
  let isFormValid = true;
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && field.value.trim() === '') {
      isFormValid = false;
    }
  });
  
  submitBtn.disabled = !isFormValid;
}