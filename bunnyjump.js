//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//bunny
let bunnyWidth = 40;
let bunnyHeight = 50;
let bunnyX = boardWidth/2 - bunnyWidth/2;
let bunnyY = boardHeight*7/8 - bunnyHeight;

let bunny = {
    img : null,
    x : bunnyX,
    y : bunnyY,
    width : bunnyWidth,
    height : bunnyHeight
};

let bunnyJumpImg = new Image();
let bunnyReadyImg = new Image();

//physics
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -4;
let gravity = 0.2;
let maxBoostVelocity = -8;

let canBoost = false;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 20;
let platformImg = new Image();
let platformBrokenImg = new Image();

//game state
let score = 0;
let scrollOffset = 0;
let gameOver = false;
let gameStarted = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    bunnyJumpImg.src = "./bunny-jump.png";
    bunnyReadyImg.src = "./bunny-ready.png";
    bunny.img = bunnyReadyImg;

    platformImg.src = "./ground-grass.png";
    platformBrokenImg.src = "./ground-grass-broken.png";

    requestAnimationFrame(update);

    document.addEventListener("keydown", movebunny);
    document.addEventListener("keyup", stopbunny);
    board.addEventListener("click", startGame); // klik layar juga mulai game
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        placePlatforms();
    }
}

function drawStartScreen() {
    context.clearRect(0, 0, board.width, board.height);

    context.fillStyle = "#0e4375ff";
    context.font = "18px 'Press Start 2P'";
    context.textAlign = "center";
    context.fillText("BUNNY JUMP", boardWidth/2, boardHeight/2 - 40);

    context.font = "10px 'Press Start 2P'";
    context.fillText("CLICK TO START", boardWidth/2, boardHeight/2 + 10);
}

function update() {
    requestAnimationFrame(update);

    if (!gameStarted) {
        drawStartScreen();
        return;
    }

    if (gameOver) return;
    context.clearRect(0, 0, board.width, board.height);

    //horizontal
    bunny.x += velocityX;
    if (bunny.x > boardWidth) bunny.x = 0;
    else if (bunny.x + bunny.width < 0) bunny.x = boardWidth;

    //gravity
    velocityY += gravity;
    bunny.y += velocityY;

    if (velocityY < 0) bunny.img = bunnyJumpImg;
    else bunny.img = bunnyReadyImg;

    if (bunny.y > board.height) gameOver = true;

    //platform loop
    for (let i = 0; i < platformArray.length; i++) {
        let p = platformArray[i];

        if (velocityY < 0 && bunny.y < boardHeight * 3/4) {
            p.y -= velocityY;
            scrollOffset -= velocityY;
        }

        if (detectCollision(bunny, p) && velocityY >= 0) {
            velocityY = initialVelocityY;
            canBoost = true;

            if (!p.stepTime) {
                p.stepTime = Date.now();
            } else {
                let diff = (Date.now() - p.stepTime) / 1000;
                if (diff > 3 && p.img !== platformBrokenImg) p.img = platformBrokenImg;
                if (diff > 4) {
                    platformArray.splice(i, 1);
                    i--;
                    continue;
                }
            }
        }

        context.drawImage(p.img, p.x, p.y, p.width, p.height);
    }

    context.drawImage(bunny.img, bunny.x, bunny.y, bunny.width, bunny.height);

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    score = Math.floor(scrollOffset / 100);
    if (score < 0) score = 0;

    //text
    context.fillStyle = "#0e4375ff";
    context.font = "18px 'Press Start 2P'";
    context.textAlign = "center";
    context.fillText(score, boardWidth / 2, 40);

    if (gameOver) {
        context.fillStyle = "#ec0f0fff";
        context.font = "18px 'Press Start 2P'";
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 20);

        context.font = "10px 'Press Start 2P'";
        context.fillText("Press SPACE to restart", boardWidth / 2, boardHeight / 2 + 20);
    }
}

function movebunny(e) {
    if (e.code == "Space" && !gameStarted) startGame();
    if (e.code == "Space" && gameOver) restartGame();

    if (!gameStarted || gameOver) return;

    if (e.code == "ArrowRight" || e.code == "KeyD") velocityX = 4;
    else if (e.code == "ArrowLeft" || e.code == "KeyA") velocityX = -4;

    else if (e.code == "KeyW" || e.code == "ArrowUp") {
        if (canBoost) {
            velocityY = maxBoostVelocity;
            canBoost = false;
        }
    }
}

function stopbunny(e) {
    if (["ArrowRight","KeyD","ArrowLeft","KeyA"].includes(e.code)) velocityX = 0;
}

function restartGame() {
    bunny.x = bunnyX;
    bunny.y = bunnyY;
    velocityX = 0;
    velocityY = 0;
    scrollOffset = 0;
    score = 0;
    gameOver = false;
    canBoost = false;
    placePlatforms();
}

function placePlatforms() {
    platformArray = [];

    let base = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    };
    platformArray.push(base);

    for (let i = 0; i < 6; i++) {
        let px = Math.floor(Math.random() * boardWidth * 3/4);
        platformArray.push({
            img : platformImg,
            x : px,
            y : boardHeight - 60*i - 120,
            width : platformWidth,
            height : platformHeight
        });
    }
}

function newPlatform() {
    let px = Math.floor(Math.random() * boardWidth*3/4);
    platformArray.push({
        img : platformImg,
        x : px,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    });
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y + a.height > b.y &&
           a.y + a.height < b.y + b.height;
}
