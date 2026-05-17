'use client';

import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';
import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Music2,
} from 'lucide-react';

export default function AudioPlayerBar() {
  const [volume, setVolume] = useState(1);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { audioState, pauseAudio, resumeAudio, stopAudio, currentAudioRef, goToNextAyah, goToPrevAyah } =
    useApp();

  const surah = SURAHS.find((s) => s.number === audioState.currentSurah);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    setCurrentTime(0);
  }, [audioState.currentAyah]);

  useEffect(() => {
    const audio = currentAudioRef.current;
    if (!audio) return;

    const tick = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
      if (audioState.isPlaying)
        rafRef.current = requestAnimationFrame(tick);
    };

    if (audioState.isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audioState.isPlaying, audioState.currentAyah, currentAudioRef]);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = currentAudioRef.current;
    if (!audio?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime =
      ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  const setVol = (v: number) => {
    setVolume(v);
    if (currentAudioRef.current) currentAudioRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleTogglePlay = () => {
    if (audioState.isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  if (audioState.currentAyah === null && !audioState.isPlaying) return null;

  return (
    <div className="hidden md:fixed bottom-0 left-0 right-0 z-40 md:left-14 bg-(--bg-canvas)/95 backdrop-blur border-t border-(--border-default) shadow-2xl">
      <div
        className="w-full h-1 bg-(--bg-elevated) cursor-pointer group relative"
        onClick={seek}>
        <div
          className="h-full bg-linear-to-r from-(--bg-accent) to-(--accent) transition-none"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-(--accent) shadow-md opacity-0 group-hover:opacity-100 transition-opacity -mt-px"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-(--bg-accent)/20 border border-(--accent-dark)/40 flex items-center justify-center shrink-0">
            <Music2 size={14} className="text-(--text-accent)" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-(--text-primary) truncate leading-tight">
              {surah?.englishName ??
                `Surah ${audioState.currentSurah}`}
              {audioState.currentAyah && (
                <span className="text-(--text-muted) font-normal">
                  {' '}
                  · Ayah {audioState.currentAyah}
                </span>
              )}
              {audioState.currentWord && (
                <span className="text-(--text-accent) font-normal">
                  {' '}
                  · Word {audioState.currentWord}
                </span>
              )}
            </p>
            <p className="text-[10px] text-(--text-muted) leading-tight mt-0.5">
              Abdul Rahman Al-Sudais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={goToPrevAyah}
            className="text-(--text-muted) hover:text-(--text-tertiary) transition-colors hidden sm:block"
            title="Previous Ayah">
            <SkipBack size={15} />
          </button>
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-(--bg-accent) hover:bg-(--accent) text-white flex items-center justify-center transition-all shadow-lg shadow-(--accent-dark)/30">
            {audioState.isPlaying ? (
              <Pause size={14} />
            ) : (
              <Play size={14} />
            )}
          </button>
          <button
            onClick={goToNextAyah}
            className="text-(--text-muted) hover:text-(--text-tertiary) transition-colors hidden sm:block"
            title="Next Ayah">
            <SkipForward size={15} />
          </button>
        </div>

        <span className="text-[10px] text-(--text-muted) font-mono hidden sm:block shrink-0 min-w-17 text-center">
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleMute}
            className="text-(--text-muted) hover:text-(--text-tertiary) transition-colors">
            {isMuted ? (
              <VolumeX size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>
          <div className="w-20">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #2d6a4f ${(isMuted ? 0 : volume) * 100}%, #21262d ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>
        </div>

        <button
          onClick={stopAudio}
          className="text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0 ml-1"
          title="Stop playback">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
