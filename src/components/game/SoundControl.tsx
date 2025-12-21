import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoundControlProps {
  isPlaying: boolean;
}

export const SoundControl: React.FC<SoundControlProps> = ({ isPlaying }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    if (isPlaying && !isMuted) {
      // Create a simple ambient background sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();

      // Subtle frequency modulation for ambient feel
      const modulateFrequency = () => {
        const freq = 220 + Math.sin(ctx.currentTime * 0.5) * 20;
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      };
      
      const interval = setInterval(modulateFrequency, 100);

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      return () => {
        clearInterval(interval);
        oscillator.stop();
        oscillator.disconnect();
      };
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    }
  }, [isPlaying, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  return (
    <Button
      variant="icon"
      size="icon"
      onClick={toggleMute}
      className="fixed top-4 right-4 z-50"
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </Button>
  );
};
