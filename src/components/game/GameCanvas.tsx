import React, { useEffect, useRef } from 'react';

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

interface GameCanvasProps {
  birdY: number;
  pipes: Pipe[];
  birdImage: string | null;
  width: number;
  height: number;
  birdSize: number;
  pipeWidth: number;
  pipeGap: number;
  gameStatus: 'idle' | 'playing' | 'gameOver';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  birdY,
  pipes,
  birdImage,
  width,
  height,
  birdSize,
  pipeWidth,
  pipeGap,
  gameStatus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (birdImage) {
      const img = new Image();
      img.src = birdImage;
      img.onload = () => {
        birdImageRef.current = img;
      };
    }
  }, [birdImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#38bdf8');
    skyGradient.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const drawCloud = (x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
      ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(width * 0.1, height * 0.15, 25);
    drawCloud(width * 0.5, height * 0.1, 30);
    drawCloud(width * 0.8, height * 0.2, 20);

    // Draw pipes
    pipes.forEach(pipe => {
      // Pipe gradient
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
      pipeGradient.addColorStop(0, '#22c55e');
      pipeGradient.addColorStop(0.5, '#4ade80');
      pipeGradient.addColorStop(1, '#22c55e');

      // Top pipe
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
      
      // Top pipe cap
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 25, pipeWidth + 10, 25);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x - 5, pipe.topHeight - 25, pipeWidth + 10, 25);

      // Bottom pipe
      const bottomY = pipe.topHeight + pipeGap;
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipe.x, bottomY, pipeWidth, height - bottomY - 50);
      
      // Bottom pipe cap
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 25);
      ctx.strokeStyle = '#15803d';
      ctx.strokeRect(pipe.x - 5, bottomY, pipeWidth + 10, 25);
    });

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, height - 50, 0, height);
    groundGradient.addColorStop(0, '#854d0e');
    groundGradient.addColorStop(1, '#713f12');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height - 50, width, 50);
    
    // Ground grass
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, height - 50, width, 10);

    // Draw bird
    const birdX = width * 0.2;
    
    if (birdImageRef.current && birdImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(birdX + birdSize / 2, birdY + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(birdImageRef.current, birdX, birdY, birdSize, birdSize);
      ctx.restore();
      
      // Bird border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(birdX + birdSize / 2, birdY + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Default bird
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(birdX + birdSize / 2, birdY + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(birdX + birdSize * 0.65, birdY + birdSize * 0.35, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(birdX + birdSize * 0.7, birdY + birdSize * 0.35, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(birdX + birdSize, birdY + birdSize * 0.5);
      ctx.lineTo(birdX + birdSize * 0.75, birdY + birdSize * 0.35);
      ctx.lineTo(birdX + birdSize * 0.75, birdY + birdSize * 0.65);
      ctx.fill();
    }

    // Idle state text
    if (gameStatus === 'idle') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px Fredoka';
      ctx.textAlign = 'center';
      ctx.fillText('Tap or Press Space to Start!', width / 2, height / 2);
    }

  }, [birdY, pipes, birdImage, width, height, birdSize, pipeWidth, pipeGap, gameStatus]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-2xl shadow-2xl"
    />
  );
};
