import { FlappyGame } from '@/components/game/FlappyGame';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Flappy Face - Create Your Own Flappy Bird Game</title>
        <meta name="description" content="Upload your face and play Flappy Bird! Create your personalized flappy game, beat high scores, and share with friends." />
      </Helmet>
      <FlappyGame />
    </>
  );
};

export default Index;
