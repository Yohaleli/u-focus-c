import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

interface LocalAudioPlayerProps {
  url: string;
  name: string;
}

const LocalAudioPlayer: React.FC<LocalAudioPlayerProps> = ({ url, name }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // reset state when url changes
    setIsPlaying(false);
    audio.pause();
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [url]);

  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // Gives 32 bins
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (e) {
        console.warn('Web Audio API not supported or failed to initialize', e);
      }
    }
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Adjust canvas size to parent container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        if (barHeight < 2) barHeight = 2; // minimum height

        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (dataArray[i] / 255) * 0.6})`;
        
        // Draw centered vertically
        const y = (canvas.height - barHeight) / 2;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth - 2, barHeight, 4);
        } else {
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    draw();
  };

  useEffect(() => {
    if (isPlaying) {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      drawWaveform();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Draw flat line when paused
      if (canvasRef.current) {
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         if (ctx && analyserRef.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bufferLength = analyserRef.current.frequencyBinCount;
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
            for (let i = 0; i < bufferLength; i++) {
              const barHeight = 2;
              const y = (canvas.height - barHeight) / 2;
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(x, y, barWidth - 2, barHeight, 4);
              } else {
                ctx.fillRect(x, y, barWidth - 2, barHeight);
              }
              ctx.fill();
              x += barWidth;
            }
         }
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        initAudioContext();
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const time = Number(e.target.value);
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const val = Number(e.target.value);
      audio.volume = val;
      setVolume(val);
      if (val > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = volume;
        setIsMuted(false);
      } else {
        audio.volume = 0;
        setIsMuted(true);
      }
    }
  };

    const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/20 shadow-xl rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 shadow-inner">
          <Music className="w-5 h-5 text-white/80" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          <p className="text-[10px] text-white/50 font-mono tracking-wider mt-0.5">Local Audio File</p>
        </div>
      </div>
      
      {/* Waveform Canvas */}
      <div className="w-full h-12 relative flex items-center justify-center my-1 rounded overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/50 w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer hover:bg-white/30 transition-colors"
          />
          <span className="text-[10px] font-mono text-white/50 w-8">{formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <button 
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-black fill-black" />
            ) : (
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            )}
          </button>
          
          <div className="flex items-center gap-2 group relative">
            <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-full h-1 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default LocalAudioPlayer;
