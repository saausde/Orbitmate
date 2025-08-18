import React, { useState, useEffect, useCallback, useRef } from "react";
import rocketImageSrc from "../../game/images/spaceship_pixel3.png";
import cometImageSrc from "../../images/comet2.gif";
import spaceImageSrc from "../../game/images/gameBackground1.avif";
import bulletImageSrc from "../../game/images/bullet_pixel2.png";
import enemyImageSrc from "../../game/images/alien_ship3.png";
import explosionImageSrc from "../../game/images/explosion_pixel3.png";
import gameOverImageSrc from "../../game/images/gameOver_pixel1.png";

import "../../css/EasterEgg.css";

// 이미지 사전 참조 함수
const preloadImage = (src) => {
  const img = new window.Image();
  img.src = src;
  img.onerror = (e) => {
    // 에러 발생 시 콘솔에 경고 출력
    console.warn(`이미지 로드 실패: ${src}`, e);
  };
  return img;
};

// 게임에 사용되는 이미지 객체
const images = {
  space: preloadImage(spaceImageSrc),
  rocket: preloadImage(rocketImageSrc),
  bullet: preloadImage(bulletImageSrc),
  enemy: preloadImage(enemyImageSrc),
  explosion: preloadImage(explosionImageSrc),
  gameOver: preloadImage(gameOverImageSrc),
};

// 무작위 방향 반환 함수
const getRandomDirection = () => {
  const directions = ["top", "bottom", "left", "right"];
  return directions[Math.floor(Math.random() * 4)];
};

// 무작위 시작/종료 좌표 생성 함수 (브라우저 화면 끝까지 이동)
const generateCoordinates = (direction) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  // 시작 위치(화면 바깥)
  const startPositions = {
    top: {
      x: Math.random() * viewportWidth,
      y: -100,
    },
    bottom: {
      x: Math.random() * viewportWidth,
      y: viewportHeight + 100,
    },
    left: {
      x: -100,
      y: Math.random() * viewportHeight,
    },
    right: {
      x: viewportWidth + 100,
      y: Math.random() * viewportHeight,
    },
  };
  // 종료 위치(반대편 화면 바깥)
  const endPositions = {
    top: {
      x: Math.random() * viewportWidth,
      y: viewportHeight + 100,
    },
    bottom: {
      x: Math.random() * viewportWidth,
      y: -100,
    },
    left: {
      x: viewportWidth + 100,
      y: Math.random() * viewportHeight,
    },
    right: {
      x: -100,
      y: Math.random() * viewportHeight,
    },
  };
  return {
    start: startPositions[direction],
    end: endPositions[direction],
  };
};

function EasterEgg({ oncometClick, isGameActive, onGameStart, onGameEnd }) {
  // 캔버스 ref 및 게임 상태
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [cometStyle, setcometStyle] = useState({}); // flying-comet 위치/방향
  const [currentDirection, setCurrentDirection] = useState(null);
  const scoreRef = useRef(0);

  // 게임 종료 핸들러
  const handleCloseGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    // 모든 게임 상태 리셋
    bulletList.current = [];
    enemyList.current = [];
    explosionList.current = [];
    gameOver.current = false;
    if (typeof onGameEnd === "function") onGameEnd();
  }, [onGameEnd]);

  // 게임 시작 핸들러
  const startGame = useCallback(() => {
    if (typeof onGameStart === "function") onGameStart();
  }, [onGameStart]);

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

  // 행성 이동 각도 계산
  const calculateRotation = (start, end) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
  };

  // flying-comet의 무작위 경로/회전 적용
  const updatecometPath = useCallback((direction) => {
    const coords = generateCoordinates(direction);
    const rotation = calculateRotation(coords.start, coords.end); // 각도 계산
    setcometStyle({
      "--start-x": `${coords.start.x}px`,
      "--start-y": `${coords.start.y}px`,
      "--end-x": `${coords.end.x}px`,
      "--end-y": `${coords.end.y}px`,
      "--rotation": `${rotation}deg`,
    });
    setCurrentDirection(direction);
  }, []);

  // flying-comet이 사라지고 다시 등장할 때마다 무작위 위치/방향 갱신
  const [cometKey, setcometKey] = useState(0); // 리렌더 트리거용 키

  // flying-comet이 날아오는 방향과 위치를 무작위로 설정
  useEffect(() => {
    if (!isGameActive) {
      const initialDirection = getRandomDirection();
      updatecometPath(initialDirection);
    }
    // cometKey가 바뀔 때마다 위치/방향 갱신
  }, [isGameActive, updatecometPath, cometKey]);

  // flying-comet 애니메이션이 끝날 때마다 무작위 방향/위치로 재설정
  const handleAnimationEnd = () => {
    if (!isGameActive) {
      // 새로운 무작위 방향/위치로 재설정
      setcometKey((prev) => prev + 1); // 키 변경 → useEffect 트리거
    }
  };

  // 게임 초기화 및 루프
  useEffect(() => {
    if (!isGameActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let keysDown = {};
    // 게임 상태 초기화
    const initGame = () => {
      canvas.width = 800;
      canvas.height = 600;
      rocketX.current = canvas.width / 2 - 32;
      rocketY.current = canvas.height - 64;
      bulletList.current = [];
      enemyList.current = [];
      explosionList.current = [];
      gameOver.current = false;
      setScore(0);
    };
    // 게임 루프
    const gameLoop = () => {
      update(canvas, keysDown);
      render(ctx, canvas);
      if (!gameOver.current) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };
    // 키 이벤트
    const handleKeyDown = (e) => {
      keysDown[e.keyCode] = true;
      if (e.keyCode === 32) createBullet();
    };
    const handleKeyUp = (e) => {
      delete keysDown[e.keyCode];
    };
    // 게임 시작
    const startGameLoop = () => {
      initGame();
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      enemyInterval.current = setInterval(createEnemy, 1700);
      gameLoop();
    };
    startGameLoop();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(enemyInterval.current);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isGameActive]);

  // 총알 생성
  const createBullet = () => {
    const now = Date.now();
    if (now - lastShotTime.current < BULLET_COOLDOWN) return;
    lastShotTime.current = now;
    const bullet = {
      x: rocketX.current + 24,
      y: rocketY.current,
      speed: 10,
      update() {
        this.y -= this.speed;
      },
      isOffscreen() {
        return this.y + 16 <= 0;
      },
    };
    bulletList.current.push(bullet);
  };

  // 적 생성
  const createEnemy = () => {
    const enemy = {
      x: Math.floor(Math.random() * (canvasRef.current.width - 64)),
      y: -64,
      speed: 3,
      update() {
        this.y += this.speed;
      },
    };
    enemyList.current.push(enemy);
  };

  // 게임 상태 업데이트
  const update = (canvas, keysDown) => {
    if (gameOver.current) return;
    if (39 in keysDown || 68 in keysDown) {
      rocketX.current = Math.min(rocketX.current + 5, canvas.width - 64);
    } else if (37 in keysDown || 65 in keysDown) {
      rocketX.current = Math.max(rocketX.current - 5, 0);
    }
    bulletList.current = bulletList.current.filter((bullet) => {
      bullet.update();
      return !bullet.isOffscreen();
    });
    enemyList.current = enemyList.current.filter((enemy) => {
      enemy.update();
      if (enemy.y > canvas.height) gameOver.current = true;
      let isDestroyed = false;
      bulletList.current = bulletList.current.filter((bullet) => {
        const collision =
          bullet.x < enemy.x + 64 &&
          bullet.x + 16 > enemy.x &&
          bullet.y < enemy.y + 64 &&
          bullet.y + 16 > enemy.y;
        if (collision) {
          isDestroyed = true;
          explosionList.current.push({ x: enemy.x, y: enemy.y, time: 10 });
          setScore((prev) => {
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
    explosionList.current = explosionList.current.filter((explosion) => {
      explosion.time -= 1;
      return explosion.time > 0;
    });
  };

  // 게임 화면 렌더링
  const render = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.space, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.rocket, rocketX.current, rocketY.current, 64, 64);
    bulletList.current.forEach((bullet) =>
      ctx.drawImage(images.bullet, bullet.x, bullet.y, 16, 16)
    );
    enemyList.current.forEach((enemy) =>
      ctx.drawImage(images.enemy, enemy.x, enemy.y, 64, 64)
    );
    explosionList.current.forEach((explosion) =>
      ctx.drawImage(images.explosion, explosion.x, explosion.y, 64, 64)
    );
    if (gameOver.current) {
      ctx.drawImage(
        images.gameOver,
        canvas.width / 2 - 160,
        canvas.height / 2 - 80,
        320,
        160
      );
      ctx.fillStyle = "#00ff00";
      ctx.font = "24px 'Press Start 2P'";
      // Center FINAL SCORE horizontally
      const finalScoreText = `FINAL SCORE: ${scoreRef.current}`;
      const scoreTextWidth = ctx.measureText(finalScoreText).width;
      ctx.fillText(
        finalScoreText,
        canvas.width / 2 - scoreTextWidth / 2,
        canvas.height / 2 + 80
      );
      // Center CLICK TO RESTART horizontally
      const restartText = "CLICK TO RESTART";
      const restartTextWidth = ctx.measureText(restartText).width;
      ctx.fillText(
        restartText,
        canvas.width / 2 - restartTextWidth / 2,
        canvas.height / 2 + 100
      );
    }
  };

  // 게임 오버 시 캔버스 클릭으로 재시작
  const handleCanvasClick = () => {
    if (gameOver.current && typeof onGameEnd === "function") {
      onGameEnd(); // 게임 종료 후 부모에서 isGameActive를 false로 바꿔줌
      setTimeout(() => {
        if (typeof onGameStart === "function") onGameStart();
      }, 100);
    }
  };

  return (
    <div id="cosmic-arena">
      {/* flying-comet: 무작위 방향/위치로 화면 끝까지 날아가고, 사라지면 다시 무작위로 등장 */}
      {!isGameActive && (
        <div
          key={cometKey} // 매번 새로운 key로 리렌더
          className="flying-comet"
          style={cometStyle}
          onClick={startGame}
          onAnimationEnd={handleAnimationEnd}
        >
          <img src={cometImageSrc} alt="Start Game" className="quantum-comet" />
        </div>
      )}
      {/* 게임 모달 및 캔버스 */}
      {isGameActive && (
        <div className="game-modal-overlay">
          <div className="game-modal">
            <button className="game-close-btn" onClick={handleCloseGame}>
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

export default EasterEgg;
