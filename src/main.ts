// --- DOM Element Selection ---
const gameBoard = document.getElementById("game-board")!;
const attemptsLeftSpan = document.getElementById("attempts-left")!;
const gameOverModal = document.getElementById("game-over-modal")!;
const gameOverMessage = document.getElementById("game-over-message")!;
const startOverBtn = document.getElementById("start-over-btn")!;

// --- Game State Variables ---
const CARD_VALUES = ["A", "B", "C", "A", "B", "C"];
const TOTAL_PAIRS = 3;
const MAX_ATTEMPTS = 3;

let attemptsLeft = MAX_ATTEMPTS;
let flippedCards: HTMLElement[] = [];
let matchedPairs = 0;
let lockBoard = false; // Prevents clicking more than 2 cards at a time

// --- Game Logic Functions ---

/**
 * Shuffles an array
 * @param array The array to shuffle.
 */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Creates and populates the game board with shuffled cards.
 */
function createBoard(): void {
  // Clear previous board
  gameBoard.innerHTML = "";
  const shuffledCards = shuffle([...CARD_VALUES]);

  shuffledCards.forEach((value) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = value;

    card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-front">${value}</div>
          <div class="card-face card-back"></div>
        </div>
      `;

    card.addEventListener("click", handleCardClick);
    gameBoard.appendChild(card);
  });
}

/**
 * Handles the logic when a card is clicked.
 */
function handleCardClick(this: HTMLDivElement): void {
  if (
    lockBoard ||
    flippedCards.length === 2 ||
    this.classList.contains("flipped")
  ) {
    return; // Exit if board is locked, 2 cards are already flipped, or the same card is clicked
  }

  this.classList.add("flipped");
  flippedCards.push(this);

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

/**
 * Checks if the two currently flipped cards are a match.
 */
function checkForMatch(): void {
  lockBoard = true;
  const [cardOne, cardTwo] = flippedCards;
  const isMatch = cardOne.dataset.value === cardTwo.dataset.value;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

/**
 * Logic for when a matching pair is found.
 */
function handleMatch(): void {
  matchedPairs++;
  flippedCards.forEach((card) => {
    card.removeEventListener("click", handleCardClick);
    card.classList.add("matched");
  });
  resetTurn();

  if (matchedPairs === TOTAL_PAIRS) {
    setTimeout(() => showGameOverModal(true), 500);
  }
}

/**
 * Logic for when the flipped cards do not match.
 */
function handleMismatch(): void {
  attemptsLeft--;
  updateAttemptsDisplay();

  if (attemptsLeft === 0) {
    setTimeout(() => showGameOverModal(false), 1200);
    return;
  }

  setTimeout(() => {
    flippedCards.forEach((card) => card.classList.remove("flipped"));
    resetTurn();
  }, 1200);
}

/**
 * Resets the flipped cards array and unlocks the board for the next turn.
 */
function resetTurn(): void {
  flippedCards = [];
  lockBoard = false;
}

/**
 * Updates the attempts counter on the screen.
 */
function updateAttemptsDisplay(): void {
  attemptsLeftSpan.textContent = attemptsLeft.toString();
}

/**
 * Shows the game over modal with a win or lose message.
 * @param didWin - Boolean indicating if the player won.
 */
function showGameOverModal(didWin: boolean): void {
  gameOverMessage.textContent = didWin ? "You Won!" : "You Lost!";
  gameOverModal.classList.remove("hidden");
}

/**
 * Resets the entire game to its initial state.
 */
function resetGame(): void {
  attemptsLeft = MAX_ATTEMPTS;
  matchedPairs = 0;
  resetTurn();
  updateAttemptsDisplay();
  gameOverModal.classList.add("hidden");
  createBoard();
}

// --- Initializer ---
startOverBtn.addEventListener("click", resetGame);
createBoard(); // Start the first game on page load
