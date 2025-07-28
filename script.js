// --- Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const resetButton = document.getElementById('resetButton');

const gridSize = 20; // Size of each snake segment and food item
let tileCountX, tileCountY; // Number of tiles on the canvas

// --- Game State Variables ---
let snake;
let food;
let dx, dy; // Direction of snake movement
let score;
let gameInterval;
let gameSpeed = 150; // Milliseconds between game updates (lower is faster)
let changingDirection; // To prevent quick 180-degree turns
let gameOver;

// --- Game Initialization ---
function initializeGame() {
    // Set canvas dimensions dynamically (or fixed)
    // For simplicity, let's use a fixed size for now
    canvas.width = 400;
    canvas.height = 400;

    tileCountX = canvas.width / gridSize;
    tileCountY = canvas.height / gridSize;

    // Initial snake position (center of the canvas)
    snake = [
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) },
        { x: Math.floor(tileCountX / 2) - 1, y: Math.floor(tileCountY / 2) },
        { x: Math.floor(tileCountX / 2) - 2, y: Math.floor(tileCountY / 2) }
    ];

    // Initial direction (moving right)
    dx = 1;
    dy = 0;

    score = 0;
    scoreDisplay.textContent = score;
    gameOver = false;
    changingDirection = false;

    placeFood();

    resetButton.style.display = 'none'; // Hide reset button
    canvas.style.borderColor = '#333'; // Normal border color

    // Clear any existing game loop and start a new one
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// --- Game Loop ---
function gameLoop() {
    if (gameOver) {
        displayGameOver();
        return;
    }
    changingDirection = false; // Allow direction change for next frame
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    checkCollision();
}

// --- Drawing Functions ---
function clearCanvas() {
    ctx.fillStyle = 'white'; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnakePart(snakePart, index) {
    // Head color different from body
    ctx.fillStyle = index === 0 ? 'darkgreen' : 'lightgreen';
    ctx.strokeStyle = 'darkgreen'; // Border for segments
    ctx.fillRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize);
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// --- Game Logic Functions ---
function moveSnake() {
    // Create new head based on current direction
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head to the beginning of the snake

    // Check if snake ate food
    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreDisplay.textContent = score;
        placeFood();
        // Optional: increase speed
        // if (score % 50 === 0 && gameSpeed > 50) {
        //     gameSpeed -= 10;
        //     clearInterval(gameInterval);
        //     gameInterval = setInterval(gameLoop, gameSpeed);
        // }
    } else {
        snake.pop(); // Remove tail segment if no food eaten
    }
}

function placeFood() {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY)
        };
    } while (isFoodOnSnake(newFoodPosition)); // Ensure food doesn't spawn on the snake
    food = newFoodPosition;
}

function isFoodOnSnake(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver = true;
        return;
    }

    // Self-collision (check if head collides with any part of its body)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }
}

function displayGameOver() {
    clearInterval(gameInterval); // Stop the game loop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    resetButton.style.display = 'block'; // Show reset button
    canvas.style.borderColor = 'red'; // Indicate game over with border
}

// --- Event Listeners ---
document.addEventListener('keydown', changeDirection);
resetButton.addEventListener('click', initializeGame);

function changeDirection(event) {
    if (changingDirection || gameOver) return; // Prevent multiple changes in one frame or if game over
    changingDirection = true;

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    } else if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    } else if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    } else if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// --- Start Game ---
initializeGame();