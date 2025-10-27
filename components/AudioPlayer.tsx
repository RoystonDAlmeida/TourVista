
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { PlayIcon, PauseIcon, StopIcon } from './icons';

interface AudioPlayerProps {
  base64Audio: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Audio }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const context = audioContextRef.current;
    let isActive = true;

    const setupAudio = async () => {
      try {
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, context, 24000, 1);
        if (isActive) {
          setAudioBuffer(buffer);
        }
      } catch (error) {
        console.error("Failed to decode audio data:", error);
      }
    };

    setupAudio();

    return () => {
      isActive = false;
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base64Audio]);
  
  const stopPlayback = useCallback(() => {
    if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playPause = useCallback(() => {
    if (!audioBuffer) return;

    if (isPlaying) {
      stopPlayback();
    } else {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    }
  }, [audioBuffer, isPlaying, stopPlayback]);

  return (
    <div className="flex items-center space-x-4 bg-slate-700/50 p-3 rounded-xl border border-slate-700">
      <button
        onClick={playPause}
        disabled={!audioBuffer}
        className="p-3 rounded-full bg-cyan-500 text-white disabled:bg-slate-600 disabled:cursor-not-allowed transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-800"
        aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
      <button
        onClick={stopPlayback}
        disabled={!isPlaying}
        className="p-2 rounded-full bg-slate-600 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-transform hover:scale-110 enabled:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-slate-800"
        aria-label="Stop narration"
      >
        <StopIcon className="w-5 h-5" />
      </button>
      <div className="text-sm font-medium text-slate-300">
        {isPlaying ? 'Playing Narration...' : 'Ready to Play'}
      </div>
    </div>
  );
};

export default AudioPlayer;
