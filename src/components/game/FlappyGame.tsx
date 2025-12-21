import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFlappyGame } from '@/hooks/useFlappyGame';
import { GameCanvas } from './GameCanvas';
import { FaceUploader } from './FaceUploader';
import { ScoreDisplay } from './ScoreDisplay';
import { GameOverModal } from './GameOverModal';
import { SoundControl, useGameSounds } from './SoundControl';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

export const FlappyGame: React.FC = () => {
  const [faceImage, setFaceImage] = useState<string | null>(() => {
    return localStorage.getItem('flappyFaceImage');
  });
  
  const [dimensions, setDimensions] = useState({
    width: Math.min(CANVAS_WIDTH, window.innerWidth - 32),
    height: Math.min(CANVAS_HEIGHT, window.innerHeight - 200),
  });

  const {
    gameState,
    highScore,
    jump,
    resetGame,
    BIRD_SIZE,
    PIPE_WIDTH,
    PIPE_GAP,
  } = useFlappyGame(dimensions.width, dimensions.height);

  const { playJumpSound, playScoreSound, playGameOverSound } = useGameSounds();
  const prevScoreRef = useRef(0);
  const prevStatusRef = useRef(gameState.gameStatus);

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(CANVAS_WIDTH, window.innerWidth - 32),
        height: Math.min(CANVAS_HEIGHT, window.innerHeight - 200),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Play sound effects
  useEffect(() => {
    if (gameState.score > prevScoreRef.current) {
      playScoreSound();
    }
    prevScoreRef.current = gameState.score;
  }, [gameState.score, playScoreSound]);

  useEffect(() => {
    if (prevStatusRef.current === 'playing' && gameState.gameStatus === 'gameOver') {
      playGameOverSound();
    }
    prevStatusRef.current = gameState.gameStatus;
  }, [gameState.gameStatus, playGameOverSound]);

  // Handle keyboard and touch input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        playJumpSound();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, playJumpSound]);

  const handleImageUpload = useCallback((image: string) => {
    setFaceImage(image);
    localStorage.setItem('flappyFaceImage', image);
  }, []);

  const handleImageClear = useCallback(() => {
    setFaceImage(null);
    localStorage.removeItem('flappyFaceImage');
  }, []);

  const handleCanvasClick = useCallback(() => {
    playJumpSound();
    jump();
  }, [jump, playJumpSound]);

  const isNewHighScore = gameState.gameStatus === 'gameOver' && gameState.score === highScore && highScore > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <SoundControl isPlaying={gameState.gameStatus === 'playing'} />
      
      {/* Header */}
      <div className="text-center slide-up">
        <h1 className="font-pixel text-3xl md:text-4xl text-primary neon-text mb-2">
          Flappy Face
        </h1>
        <p className="text-muted-foreground">Upload your face and fly!</p>
      </div>

      {/* Score Display */}
      <ScoreDisplay 
        score={gameState.score} 
        highScore={highScore}
        showHighScore={gameState.gameStatus !== 'idle'}
      />

      {/* Game Container */}
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Face Uploader */}
        <div className="lg:order-first order-last">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border">
            <FaceUploader
              faceImage={faceImage}
              onImageUpload={handleImageUpload}
              onImageClear={handleImageClear}
            />
          </div>
        </div>

        {/* Game Canvas */}
        <div
          className="cursor-pointer select-none"
          onClick={handleCanvasClick}
          onTouchStart={(e) => {
            e.preventDefault();
            playJumpSound();
            jump();
          }}
        >
          <GameCanvas
            birdY={gameState.birdY}
            pipes={gameState.pipes}
            birdImage={faceImage}
            width={dimensions.width}
            height={dimensions.height}
            birdSize={BIRD_SIZE}
            pipeWidth={PIPE_WIDTH}
            pipeGap={PIPE_GAP}
            gameStatus={gameState.gameStatus}
          />
        </div>
      </div>

      {/* Instructions */}
      {gameState.gameStatus === 'idle' && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Tap the screen or press <kbd className="px-2 py-1 bg-muted rounded text-foreground">Space</kbd> to flap!
        </p>
      )}

      {/* Game Over Modal */}
      {gameState.gameStatus === 'gameOver' && (
        <GameOverModal
          score={gameState.score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={resetGame}
        />
      )}
    </div>
  );
};
