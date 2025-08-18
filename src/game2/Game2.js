const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정
canvas.width = 400;
canvas.height = 400;

// 게임 설정
const gridSize = 20; // 한 칸의 크기
const tileCount = canvas.width / gridSize; // 캔버스 내 칸 수

let snake = [
    { x: 10, y: 10 } // 초기 지렁이 위치
];
let food = { x: 15, y: 15 }; // 초기 음식 위치
let dx = 0; // x 방향 이동
let dy = 0; // y 방향 이동
let score = 0; // 점수
let gameSpeed = 100; // 게임 속도 (밀리초)
let gameLoop;

// 게임 초기화
function initGame() {
    const randomX = Math.floor(Math.random() * tileCount);
    const randomY = Math.floor(Math.random() * tileCount);
    snake = [{ x: randomX, y: randomY }];
    food = { x: 15, y: 15 };
    dx = 0;
    dy = 0;
    score = 0;
    document.getElementById('score').innerText = `점수: ${score}`;
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
}

// 캔버스 그리기
function drawGame() {
    // 배경 지우기
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 지렁이 이동
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 음식 먹기
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        document.getElementById('score').innerText = `점수: ${score}`;
        generateFood();
    } else {
        snake.pop(); // 꼬리 제거 (길이 유지)
    }

    // 지렁이 그리기
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // 음식 그리기
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // 충돌 체크
    if (isGameOver(head)) {
        clearInterval(gameLoop);
        alert(`게임 오버! 점수: ${score}`);
    }
}

// 음식 생성
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // 지렁이 몸통 위에 음식이 생성되지 않도록
    snake.forEach(segment => {
        if (food.x === segment.x && food.y === segment.y) {
            generateFood();
        }
    });
}

// 게임 오버 조건
function isGameOver(head) {
    // 벽 충돌
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // 몸통 또는 꼬리 충돌
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 키보드 입력 처리
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (dy !== 1) { // 반대 방향 이동 방지
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// 게임 시작
initGame();