import React from 'react';
import { Trophy, Star } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  showHighScore?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  highScore,
  showHighScore = true,
}) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border">
        <Star className="w-5 h-5 text-primary" />
        <span className="font-pixel text-lg text-foreground">{score}</span>
      </div>
      
      {showHighScore && (
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-primary/50">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-pixel text-sm text-muted-foreground">Best: {highScore}</span>
        </div>
      )}
    </div>
  );
};
