import React, { useState, useEffect, useCallback, useRef } from "react";
import rocketImageSrc from '../game/images/rocket.png';
import spaceImageSrc from '../game/images/space.png';
import bulletImageSrc from '../game/images/bullet.png';
import enemyImageSrc from '../game/images/enemy.png';
import explosionImageSrc from '../game/images/explosion.png';
import gameOverImageSrc from '../game/images/gameover.png';
import '../css/EsterEgg.css';

// 이미지 프리로드
const preloadImage = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

const images = {
  space: preloadImage(spaceImageSrc),
  rocket: preloadImage(rocketImageSrc),
  bullet: preloadImage(bulletImageSrc),
  enemy: preloadImage(enemyImageSrc),
  explosion: preloadImage(explosionImageSrc),
  gameOver: preloadImage(gameOverImageSrc)
};

const getRandomDirection = () => {
  const directions = ['top', 'bottom', 'left', 'right'];
  return directions[Math.floor(Math.random() * 4)];
};

const generateCoordinates = (direction) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const offset = 200;

  const startPositions = {
    top: { 
      x: Math.random() * (viewportWidth + offset * 2) - offset, 
      y: -offset - Math.random() * 100 
    },
    bottom: { 
      x: Math.random() * (viewportWidth + offset * 2) - offset, 
      y: viewportHeight + offset + Math.random() * 100 
    },
    left: { 
      x: -offset - Math.random() * 100, 
      y: Math.random() * (viewportHeight + offset * 2) - offset 
    },
    right: { 
      x: viewportWidth + offset + Math.random() * 100, 
      y: Math.random() * (viewportHeight + offset * 2) - offset 
    }
  };

  // 종료 위치도 랜덤화
  const endPositions = {
    top: { 
      x: Math.random() * (viewportWidth + offset * 2) - offset,
      y: viewportHeight + offset + Math.random() * 100 
    },
    bottom: { 
      x: Math.random() * (viewportWidth + offset * 2) - offset,
      y: -offset - Math.random() * 100 
    },
    left: { 
      x: viewportWidth + offset + Math.random() * 100,
      y: Math.random() * (viewportHeight + offset * 2) - offset 
    },
    right: { 
      x: -offset - Math.random() * 100,
      y: Math.random() * (viewportHeight + offset * 2) - offset 
    }
  };

  return {
    start: startPositions[direction],
    end: endPositions[direction]
  };
};

function EsterEgg() {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [rocketStyle, setRocketStyle] = useState({});
  const [currentDirection, setCurrentDirection] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const scoreRef = useRef(0);

  // 게임 종료 핸들러
  const handleCloseGame = useCallback(() => {
    setGameStarted(false);
    setIsGameActive(false);
    setScore(0);
    scoreRef.current = 0;
    // 모든 게임 상태 리셋
    bulletList.current = [];
    enemyList.current = [];
    explosionList.current = [];
    gameOver.current = false;
  }, []);

    // 게임 시작 핸들러
  const startGame = useCallback(() => {
    setGameStarted(true);
    setIsGameActive(true);
    setScore(0);
    scoreRef.current = 0;
  }, []);

  // 게임 상태 관련 ref
  const rocketX = useRef(0);
  const rocketY = useRef(0);
  const bulletList = useRef([]);
  const enemyList = useRef([]);
  const explosionList = useRef([]);
  const gameOver = useRef(false);
  const animationFrameId = useRef(null);
  const enemyInterval = useRef(null);
  const lastShotTime = useRef(Date.now());
  const BULLET_COOLDOWN = 300;

  const calculateRotation = (start, end) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;    
  }; 

  const updateRocketPath = useCallback((direction) => {
    const coords = generateCoordinates(direction);
    const rotation = calculateRotation(coords.start, coords.end); // 각도 계산
    
    setRocketStyle({
      '--start-x': `${coords.start.x}px`,
      '--start-y': `${coords.start.y}px`,
      '--end-x': `${coords.end.x}px`,
      '--end-y': `${coords.end.y}px`,
      '--rotation': `${rotation}deg`
    });
    setCurrentDirection(direction);
  }, []);

  useEffect(() => {
    if (!gameStarted) {
      const initialDirection = getRandomDirection();
      updateRocketPath(initialDirection);
    }
  }, [gameStarted, updateRocketPath]);

const handleAnimationEnd = () => {
  if (!gameStarted) {
    const newDirection = getRandomDirection();
    updateRocketPath(newDirection);

    const altDirection = getRandomDirection();
    updateRocketPath(altDirection);
  }
};

  // 게임 초기화
  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let keysDown = {};

    const initGame = () => {
      canvas.width = 800;
      canvas.height = 600;
      rocketX.current = canvas.width/2 - 32;
      rocketY.current = canvas.height - 64;
      bulletList.current = [];
      enemyList.current = [];
      explosionList.current = [];
      gameOver.current = false;
      setScore(0);
    };

    const gameLoop = () => {
      update(canvas, keysDown);
      render(ctx, canvas);
      if (!gameOver.current) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };

    const handleKeyDown = (e) => {
      keysDown[e.keyCode] = true;
      if (e.keyCode === 32) createBullet();
    };

    const handleKeyUp = (e) => {
      delete keysDown[e.keyCode];
    };

    const startGame = () => {
      initGame();
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      enemyInterval.current = setInterval(createEnemy, 1000);
      gameLoop();
    };

    startGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(enemyInterval.current);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStarted]);

  const createBullet = () => {
    const now = Date.now();
    if (now - lastShotTime.current < BULLET_COOLDOWN) return;
    lastShotTime.current = now;

    const bullet = {
      x: rocketX.current + 15,
      y: rocketY.current,
      speed: 10,
      update() { this.y -= this.speed; },
      isOffscreen() { return this.y + 16 <= 0; }
    };
    bulletList.current.push(bullet);
  };

  const createEnemy = () => {
    const enemy = {
      x: Math.floor(Math.random() * (canvasRef.current.width - 64)),
      y: -64,
      speed: 3,
      update() { this.y += this.speed; }
    };
    enemyList.current.push(enemy);
  };

  const update = (canvas, keysDown) => {
    if (gameOver.current) return;

    if (39 in keysDown || 68 in keysDown) {
      rocketX.current = Math.min(rocketX.current + 5, canvas.width - 64);
    } else if (37 in keysDown || 65 in keysDown) {
      rocketX.current = Math.max(rocketX.current - 5, 0);
    }

    bulletList.current = bulletList.current.filter(bullet => {
      bullet.update();
      return !bullet.isOffscreen();
    });

    enemyList.current = enemyList.current.filter(enemy => {
      enemy.update();
      if (enemy.y > canvas.height) gameOver.current = true;

      let isDestroyed = false;
      bulletList.current = bulletList.current.filter(bullet => {
        const collision = (
          bullet.x < enemy.x + 64 &&
          bullet.x + 16 > enemy.x &&
          bullet.y < enemy.y + 64 &&
          bullet.y + 16 > enemy.y
        );
        if (collision) {
          isDestroyed = true;
          explosionList.current.push({ x: enemy.x, y: enemy.y, time: 10 });
          setScore(prev => {
            const newScore = prev + 1;
            scoreRef.current = newScore;
            return newScore;
          });
          return false;
        }
        return true;
      });
      return !isDestroyed;
    });

    explosionList.current = explosionList.current.filter(explosion => {
      explosion.time -= 1;
      return explosion.time > 0;
    });
  };

  const render = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.space, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.rocket, rocketX.current, rocketY.current, 64, 64);

    bulletList.current.forEach(bullet => 
      ctx.drawImage(images.bullet, bullet.x, bullet.y, 16, 16)
    );

    enemyList.current.forEach(enemy => 
      ctx.drawImage(images.enemy, enemy.x, enemy.y, 64, 64)
    );

    explosionList.current.forEach(explosion => 
      ctx.drawImage(images.explosion, explosion.x, explosion.y, 64, 64)
    );

    if (gameOver.current) {
      ctx.drawImage(images.gameOver, canvas.width/2 - 160, canvas.height/2 - 80, 320, 160);
      ctx.fillStyle = "#00ff00";
      ctx.font = "24px 'Press Start 2P'";
      ctx.fillText(`FINAL SCORE: ${scoreRef.current}`, canvas.width/2 - 85, canvas.height/2 + 60);
      ctx.fillText("CLICK TO RESTART", canvas.width/2 - 105, canvas.height/2 + 100);
    }
  };

  const handleCanvasClick = () => {
    if (gameOver.current) {
      setGameStarted(false);
      setTimeout(() => setGameStarted(true), 100);
    }
  };

  return (
  <div id="cosmic-arena">
    {!isGameActive && (
      <div 
        className="flying-rocket"
        style={{
          ...rocketStyle,
          display: gameStarted ? 'none' : 'block' // 명시적 표시 제어
        }}
        onClick={startGame}
        onAnimationEnd={handleAnimationEnd}
      >
        <img 
          src={rocketImageSrc} 
          alt="Start Game" 
          className="quantum-rocket"
        />
      </div>
    )}

      {isGameActive && (
        <div className="game-modal-overlay">
          <div className="game-modal">
            <button 
              className="game-close-btn"
              onClick={handleCloseGame}
            >
              ✕
            </button>
            <canvas 
              ref={canvasRef} 
              id="gameCanvas"
              onClick={handleCanvasClick}
            />
            <div className="live-score">
              <span>SCORE: </span>
              <span className="score-value">{score}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EsterEgg;