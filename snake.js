const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let fruit = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
let velocity = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

function drawRect(x, y, color, borderColor = null) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const color = isHead ? 'darkgreen' : 'green';
        const borderColor = isHead ? 'black' : 'darkgreen';
        
        drawRect(segment.x, segment.y, color, borderColor);

        if (isHead) {
            // Draw eyes on the snake's head
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc((segment.x + 0.25) * gridSize, (segment.y + 0.25) * gridSize, gridSize / 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc((segment.x + 0.25) * gridSize, (segment.y + 0.25) * gridSize, gridSize / 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    });
}

function drawFruit() {
    drawRect(fruit.x, fruit.y, 'red', 'darkred');
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, canvas.height - 10);
}

function drawGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Enter to Play Again', canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Escape to Quit', canvas.width / 2, canvas.height / 2 + 50);
}

function update() {
    if (gameOver) return;

    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (head.x === fruit.x && head.y === fruit.y) {
        score++;
        fruit = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;
        updateHighScores();
        clearInterval(game);
        return;
    }

    snake.unshift(head);
}

function changeDirection(event) {
    if (gameOver) {
        if (event.key === 'Enter') {
            restartGame();
        } else if (event.key === 'Escape') {
            window.close();
        }
        return;
    }

    const key = event.key;
    if (key === 'ArrowUp' && velocity.y === 0) velocity = { x: 0, y: -1 };
    if (key === 'ArrowDown' && velocity.y === 0) velocity = { x: 0, y: 1 };
    if (key === 'ArrowLeft' && velocity.x === 0) velocity = { x: -1, y: 0 };
    if (key === 'ArrowRight' && velocity.x === 0) velocity = { x: 1, y: 0 };
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    fruit = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    velocity = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    document.addEventListener('keydown', changeDirection);
    game = setInterval(gameLoop, 100);
}

function updateHighScores() {
    const name = document.getElementById('playerName').value.trim();
    if (name) {
        highScores.push({ name: name, score: score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10); // Keep only top 10 scores
        localStorage.setItem('highScores', JSON.stringify(highScores));
        updateLeaderboard();
    }
    document.getElementById('playerName').value = ''; // Clear the input field
}

function updateLeaderboard() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';

    if (highScores.length === 0) {
        scoreList.innerHTML = '<li>No scores yet</li>';
        return;
    }

    highScores.forEach(entry => {
        if (entry.name && entry.score !== undefined) {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry.name}: ${entry.score}`;
            scoreList.appendChild(listItem);
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFruit();
    drawSnake();
    drawScore();
    update();
    if (gameOver) {
        drawGameOver();
    }
}

document.addEventListener('keydown', changeDirection);
let game = setInterval(gameLoop, 100);
updateLeaderboard();
