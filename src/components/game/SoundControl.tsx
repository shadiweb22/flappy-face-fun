import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoundControlProps {
  isPlaying: boolean;
  onJump?: () => void;
  onScore?: () => void;
  onGameOver?: () => void;
}

export const SoundControl: React.FC<SoundControlProps> = ({ 
  isPlaying,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const notesIntervalRef = useRef<number | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      masterGainRef.current.gain.value = 0.15;
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playNote = useCallback((frequency: number, duration: number, delay: number = 0, type: OscillatorType = 'square') => {
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(master);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, [isMuted]);

  const playChiptuneMelody = useCallback(() => {
    // Retro game melody notes (frequencies in Hz)
    const melodyNotes = [
      // Bar 1 - Upbeat intro
      { freq: 523.25, dur: 0.15, delay: 0 },      // C5
      { freq: 659.25, dur: 0.15, delay: 0.2 },    // E5
      { freq: 783.99, dur: 0.15, delay: 0.4 },    // G5
      { freq: 1046.50, dur: 0.3, delay: 0.6 },    // C6
      
      // Bar 2 - Descending
      { freq: 987.77, dur: 0.15, delay: 1.0 },    // B5
      { freq: 783.99, dur: 0.15, delay: 1.2 },    // G5
      { freq: 659.25, dur: 0.15, delay: 1.4 },    // E5
      { freq: 523.25, dur: 0.3, delay: 1.6 },     // C5
      
      // Bar 3 - Variation
      { freq: 587.33, dur: 0.15, delay: 2.0 },    // D5
      { freq: 698.46, dur: 0.15, delay: 2.2 },    // F5
      { freq: 880.00, dur: 0.15, delay: 2.4 },    // A5
      { freq: 1174.66, dur: 0.3, delay: 2.6 },    // D6
      
      // Bar 4 - Resolution
      { freq: 1046.50, dur: 0.15, delay: 3.0 },   // C6
      { freq: 783.99, dur: 0.15, delay: 3.2 },    // G5
      { freq: 659.25, dur: 0.15, delay: 3.4 },    // E5
      { freq: 523.25, dur: 0.4, delay: 3.6 },     // C5
    ];

    // Bass line
    const bassNotes = [
      { freq: 130.81, dur: 0.4, delay: 0 },       // C3
      { freq: 130.81, dur: 0.2, delay: 0.5 },     // C3
      { freq: 164.81, dur: 0.4, delay: 1.0 },     // E3
      { freq: 164.81, dur: 0.2, delay: 1.5 },     // E3
      { freq: 146.83, dur: 0.4, delay: 2.0 },     // D3
      { freq: 146.83, dur: 0.2, delay: 2.5 },     // D3
      { freq: 130.81, dur: 0.4, delay: 3.0 },     // C3
      { freq: 196.00, dur: 0.2, delay: 3.5 },     // G3
    ];

    melodyNotes.forEach(note => {
      playNote(note.freq, note.dur, note.delay, 'square');
    });

    bassNotes.forEach(note => {
      playNote(note.freq, note.dur, note.delay, 'triangle');
    });
  }, [playNote]);

  useEffect(() => {
    if (isPlaying && !isMuted) {
      initAudioContext();
      
      // Play melody immediately and then loop
      playChiptuneMelody();
      notesIntervalRef.current = window.setInterval(() => {
        playChiptuneMelody();
      }, 4000); // Loop every 4 seconds

      return () => {
        if (notesIntervalRef.current) {
          clearInterval(notesIntervalRef.current);
        }
      };
    } else {
      if (notesIntervalRef.current) {
        clearInterval(notesIntervalRef.current);
        notesIntervalRef.current = null;
      }
    }
  }, [isPlaying, isMuted, initAudioContext, playChiptuneMelody]);

  // Update master gain when mute state changes
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : 0.15;
    }
  }, [isMuted]);

  const toggleMute = () => {
    initAudioContext();
    setIsMuted(!isMuted);
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

// Export sound effect hooks for game events
export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playJumpSound = useCallback(() => {
    const ctx = initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [initContext]);

  const playScoreSound = useCallback(() => {
    const ctx = initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, [initContext]);

  const playGameOverSound = useCallback(() => {
    const ctx = initContext();
    
    [0, 0.1, 0.2].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300 - i * 50, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  }, [initContext]);

  return { playJumpSound, playScoreSound, playGameOverSound };
};
