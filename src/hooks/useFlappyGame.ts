import { useState, useCallback, useRef, useEffect } from 'react';

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

interface GameState {
  birdY: number;
  birdVelocity: number;
  pipes: Pipe[];
  score: number;
  gameStatus: 'idle' | 'playing' | 'gameOver';
}

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;
const BIRD_SIZE = 40;
const PIPE_SPAWN_INTERVAL = 1800;

export const useFlappyGame = (canvasWidth: number, canvasHeight: number) => {
  const [gameState, setGameState] = useState<GameState>({
    birdY: canvasHeight / 2,
    birdVelocity: 0,
    pipes: [],
    score: 0,
    gameStatus: 'idle',
  });
  
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const gameLoopRef = useRef<number>();
  const lastPipeSpawnRef = useRef<number>(0);

  const jump = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus === 'gameOver') return prev;
      if (prev.gameStatus === 'idle') {
        return {
          ...prev,
          gameStatus: 'playing',
          birdVelocity: JUMP_FORCE,
        };
      }
      return {
        ...prev,
        birdVelocity: JUMP_FORCE,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      birdY: canvasHeight / 2,
      birdVelocity: 0,
      pipes: [],
      score: 0,
      gameStatus: 'idle',
    });
    lastPipeSpawnRef.current = 0;
  }, [canvasHeight]);

  const checkCollision = useCallback((birdY: number, pipes: Pipe[]): boolean => {
    const birdLeft = canvasWidth * 0.2;
    const birdRight = birdLeft + BIRD_SIZE;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;

    // Ground and ceiling collision
    if (birdTop <= 0 || birdBottom >= canvasHeight - 50) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          return true;
        }
      }
    }

    return false;
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (gameState.gameStatus !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;

        // Update bird position
        const newVelocity = prev.birdVelocity + GRAVITY;
        const newBirdY = prev.birdY + newVelocity;

        // Spawn new pipes
        let newPipes = [...prev.pipes];
        if (currentTime - lastPipeSpawnRef.current > PIPE_SPAWN_INTERVAL) {
          const minHeight = 50;
          const maxHeight = canvasHeight - PIPE_GAP - 100;
          const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
          
          newPipes.push({
            x: canvasWidth,
            topHeight,
            passed: false,
          });
          lastPipeSpawnRef.current = currentTime;
        }

        // Update pipes and check for scoring
        let newScore = prev.score;
        newPipes = newPipes
          .map(pipe => {
            const newX = pipe.x - PIPE_SPEED;
            const birdX = canvasWidth * 0.2 + BIRD_SIZE / 2;
            
            if (!pipe.passed && newX + PIPE_WIDTH < birdX) {
              newScore += 1;
              return { ...pipe, x: newX, passed: true };
            }
            
            return { ...pipe, x: newX };
          })
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // Check collision
        if (checkCollision(newBirdY, newPipes)) {
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('flappyHighScore', newScore.toString());
          }
          return {
            ...prev,
            birdY: newBirdY,
            birdVelocity: newVelocity,
            pipes: newPipes,
            score: newScore,
            gameStatus: 'gameOver',
          };
        }

        return {
          ...prev,
          birdY: newBirdY,
          birdVelocity: newVelocity,
          pipes: newPipes,
          score: newScore,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStatus, canvasWidth, canvasHeight, checkCollision, highScore]);

  return {
    gameState,
    highScore,
    jump,
    resetGame,
    BIRD_SIZE,
    PIPE_WIDTH,
    PIPE_GAP,
  };
};
