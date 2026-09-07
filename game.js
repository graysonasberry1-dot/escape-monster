// Game variables
let canvas, ctx;
let gameRunning = false;
let gameOver = false;
let gameStarted = false;
let difficulty = 'normal';
let score = 0;
let timeElapsed = 0;
let gameStartTime = 0;

// Player object
let player = {
    x: 0,
    y: 0,
    width: 30,
    height: 30,
    speed: 5,
    velocityX: 0,
    velocityY: 0,
    color: '#4CAF50'
};

// Monster object
let monster = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 2,
    color: '#FF6B6B',
    emoji: '👹'
};

// Door object
let door = {
    x: 0,
    y: 0,
    width: 50,
    height: 70,
    color: '#8B4513',
    emoji: '🚪'
};

// Difficulty settings
const difficultySettings = {
    easy: { playerSpeed: 6, monsterSpeed: 1.5, monsterSpeedIncrease: 0.0005 },
    normal: { playerSpeed: 5, monsterSpeed: 2, monsterSpeedIncrease: 0.001 },
    hard: { playerSpeed: 4, monsterSpeed: 2.5, monsterSpeedIncrease: 0.0015 }
};

// Key press tracking
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// Mobile control variables
let mobileUp = false;
let mobileDown = false;
let mobileLeft = false;
let mobileRight = false;

// Initialize canvas
function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Initialize positions
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    
    monster.x = Math.random() * (canvas.width - monster.width);
    monster.y = Math.random() * (canvas.height / 2);
    
    door.x = Math.random() * (canvas.width - door.width);
    door.y = 20;
}

// Start the game
function startGame() {
    document.getElementById('homeScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Show mobile controls on mobile devices
    if (window.innerWidth <= 768) {
        document.getElementById('mobileControls').style.display = 'flex';
    }
    
    initCanvas();
    gameRunning = true;
    gameOver = false;
    gameStarted = true;
    score = 0;
    timeElapsed = 0;
    gameStartTime = Date.now();
    
    // Apply difficulty settings
    const settings = difficultySettings[difficulty];
    player.speed = settings.playerSpeed;
    monster.speed = settings.monsterSpeed;
    
    // Start game loop
    gameLoop();
}

// Main game loop
function gameLoop() {
    update();
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Update timer
    timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    document.getElementById('timerValue').textContent = timeElapsed;
    
    // Update player velocity based on key presses
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Keyboard controls
    if (keys.ArrowUp || keys.w) player.velocityY = -player.speed;
    if (keys.ArrowDown || keys.s) player.velocityY = player.speed;
    if (keys.ArrowLeft || keys.a) player.velocityX = -player.speed;
    if (keys.ArrowRight || keys.d) player.velocityX = player.speed;
    
    // Mobile controls
    if (mobileUp) player.velocityY = -player.speed;
    if (mobileDown) player.velocityY = player.speed;
    if (mobileLeft) player.velocityX = -player.speed;
    if (mobileRight) player.velocityX = player.speed;
    
    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
    
    // Increase monster speed over time (difficulty scaling)
    const settings = difficultySettings[difficulty];
    monster.speed += settings.monsterSpeedIncrease;
    
    // Monster AI - chase the player
    let dx = player.x - monster.x;
    let dy = player.y - monster.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        monster.x += (dx / distance) * monster.speed;
        monster.y += (dy / distance) * monster.speed;
    }
    
    // Check collision with door (win condition)
    if (checkCollision(player, door)) {
        endGame(true);
    }
    
    // Check collision with monster (lose condition)
    if (checkCollision(player, monster)) {
        endGame(false);
    }
    
    // Increase score over time
    score = timeElapsed * 10;
    document.getElementById('scoreValue').textContent = score;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw door
    ctx.fillStyle = door.color;
    ctx.fillRect(door.x, door.y, door.width, door.height);
    ctx.fillStyle = '#654321';
    ctx.fillRect(door.x + door.width / 2 - 5, door.y + door.height / 2 - 5, 10, 10);
    
    // Draw door emoji
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(door.emoji, door.x + door.width / 2, door.y + door.height / 2 + 5);
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player emoji
    ctx.font = '24px Arial';
    ctx.fillText('🧑', player.x + player.width / 2, player.y + player.height / 2 + 5);
    
    // Draw monster
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(monster.emoji, monster.x + monster.width / 2, monster.y + monster.height / 2 + 8);
    
    // Draw distance indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    
    let dx = player.x - monster.x;
    let dy = player.y - monster.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 150) {
        ctx.fillText('DANGER! 🚨', 10, 30);
        document.getElementById('status').textContent = '🚨 DANGER!';
    } else if (distance < 250) {
        ctx.fillText('Watch out!', 10, 30);
        document.getElementById('status').textContent = 'Watch out!';
    } else {
        ctx.fillText('Safe for now', 10, 30);
        document.getElementById('status').textContent = 'Safe for now';
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// End game
function endGame(won) {
    gameRunning = false;
    gameOver = true;
    
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTime').textContent = timeElapsed;
    
    if (won) {
        document.getElementById('gameOverTitle').textContent = '🎉 YOU ESCAPED! 🎉';
        document.getElementById('gameOverTitle').style.color = '#4CAF50';
    } else {
        document.getElementById('gameOverTitle').textContent = '😱 GAME OVER 😱';
        document.getElementById('gameOverTitle').style.color = '#FF6B6B';
    }
}

// Go back to home screen
function goHome() {
    gameRunning = false;
    gameStarted = false;
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');
    document.getElementById('mobileControls').style.display = 'none';
}

// Restart game
function restartGame() {
    startGame();
}

// Set difficulty
function setDifficulty(level) {
    difficulty = level;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Mobile control functions
function moveUp() {
    mobileUp = true;
}

function moveDown() {
    mobileDown = true;
}

function moveLeft() {
    mobileLeft = true;
}

function moveRight() {
    mobileRight = true;
}

function stopMove() {
    mobileUp = false;
    mobileDown = false;
    mobileLeft = false;
    mobileRight = false;
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gameRunning && canvas) {
        initCanvas();
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initialized! Ready to play.');
});