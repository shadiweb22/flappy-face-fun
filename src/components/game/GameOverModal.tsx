import React from 'react';
import { Trophy, RotateCcw, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  onRestart,
}) => {
  const handleShare = async () => {
    const shareText = `🐦 I scored ${score} points in Flappy Face! Can you beat my score? 🎮`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flappy Face Game',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        copyToClipboard(shareUrl, shareText);
      }
    } else {
      copyToClipboard(shareUrl, shareText);
    }
  };

  const copyToClipboard = (url: string, text: string) => {
    navigator.clipboard.writeText(`${text}\n${url}`);
    toast.success('Game link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-primary rounded-3xl p-8 max-w-sm w-full text-center bounce-in neon-box">
        <h2 className="font-pixel text-2xl text-destructive mb-2">Game Over!</h2>
        
        {isNewHighScore && (
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Trophy className="w-6 h-6" />
            <span className="font-bold text-lg">New High Score!</span>
          </div>
        )}

        <div className="bg-muted rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-8 h-8 text-primary" />
            <span className="font-pixel text-4xl text-foreground">{score}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">Best: {highScore}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="game" size="lg" onClick={onRestart} className="w-full">
            <RotateCcw size={20} />
            Play Again
          </Button>
          
          <Button variant="gameSecondary" size="lg" onClick={handleShare} className="w-full">
            <Share2 size={20} />
            Share Score
          </Button>
        </div>
      </div>
    </div>
  );
};
