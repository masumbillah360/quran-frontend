'use client';

import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Music2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AudioPlayerBar() {
  const [volume, setVolume] = useState(1);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const {
    audioState,
    pauseAudio,
    resumeAudio,
    stopAudio,
    audioRef,
    goToNextAyah,
    goToPrevAyah,
    seekAudio,
    clearAudioError,
  } = useApp();

  const surah = SURAHS.find((s) => s.number === audioState.currentSurah);

  // ── Progress tracker via RAF ──
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (!audioState.isPlaying) return;

    const tick = () => {
      const a = audioRef.current;
      if (a && a.duration && !isNaN(a.duration)) {
        setProgress((a.currentTime / a.duration) * 100);
        setCurrentTime(a.currentTime);
        setDuration(a.duration);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [audioState.isPlaying, audioState.currentAyah, audioRef]);

  // Reset on ayah change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [audioState.currentAyah]);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekAudio(pct * a.duration);
  }, [audioRef, seekAudio]);

  const handleVolume = useCallback((v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setIsMuted(v === 0);
  }, [audioRef]);

  const toggleMute = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isMuted) { a.volume = volume || 1; setIsMuted(false); }
    else { a.volume = 0; setIsMuted(true); }
  }, [audioRef, isMuted, volume]);

  const togglePlay = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    audioState.isPlaying ? pauseAudio() : resumeAudio();
  }, [audioState.isPlaying, pauseAudio, resumeAudio]);

  // ── Don't render if nothing to show ──
  if (audioState.currentAyah === null && !audioState.isPlaying && !audioState.error) {
    return null;
  }

  const canGoPrev = audioState.currentAyahIndex > 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:left-14 backdrop-blur-md border-t shadow-2xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-canvas) 95%, transparent)',
        borderColor: 'var(--border-default)',
      }}
      role="region"
      aria-label="Audio player"
    >
      {/* Error banner */}
      {audioState.error && (
        <div
          className="flex items-center justify-between px-4 py-2 text-xs"
          style={{ backgroundColor: 'color-mix(in srgb, var(--text-danger) 10%, transparent)' }}
          role="alert"
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--text-danger)' }}>
            <AlertCircle size={14} />
            <span>{audioState.error}</span>
          </div>
          <button onClick={clearAudioError} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--text-danger)' }} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div
        className="w-full h-1.5 cursor-pointer group relative"
        style={{ background: 'var(--bg-elevated)' }}
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        <div
          className="h-full"
          style={{ width: `${progress}%`, background: 'linear-gradient(to right, var(--accent-dark), var(--accent))' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)`, background: 'var(--accent)' }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--bg-accent) 20%, transparent)', borderColor: 'color-mix(in srgb, var(--accent-dark) 40%, transparent)' }}
          >
            {audioState.isLoading
              ? <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-accent)' }} />
              : <Music2 size={16} style={{ color: 'var(--text-accent)' }} />
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
              {surah?.englishName ?? `Surah ${audioState.currentSurah}`}
              {audioState.currentAyah != null && (
                <span className="font-normal" style={{ color: 'var(--text-muted)' }}> · Ayah {audioState.currentAyah}</span>
              )}
              {audioState.currentWord != null && (
                <span className="font-normal" style={{ color: 'var(--text-accent)' }}> · Word {audioState.currentWord}</span>
              )}
            </p>
            <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Abdul Rahman Al-Sudais
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Playback controls">
          <button
            onClick={goToPrevAyah}
            disabled={!canGoPrev}
            className="w-9 h-9 hidden sm:flex items-center justify-center rounded-full transition-colors hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Previous ayah"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlay}
            disabled={audioState.isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-white shadow-lg disabled:opacity-60"
            style={{ background: 'var(--bg-accent)' }}
            aria-label={audioState.isPlaying ? 'Pause' : 'Play'}
          >
            {audioState.isLoading
              ? <Loader2 size={16} className="animate-spin" />
              : audioState.isPlaying ? <Pause size={16} /> : <Play size={16} />
            }
          </button>

          <button
            onClick={goToNextAyah}
            className="w-9 h-9 hidden sm:flex items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Next ayah"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Time */}
        <span
          className="text-[10px] font-mono hidden sm:block shrink-0 min-w-17.5 text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0" role="group" aria-label="Volume">
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="w-20">
            <input
              type="range" min={0} max={1} step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => handleVolume(Number(e.target.value))}
              className="w-full"
              aria-label="Volume"
              style={{ background: `linear-gradient(to right, var(--accent-dark) ${(isMuted ? 0 : volume) * 100}%, var(--range-bg) ${(isMuted ? 0 : volume) * 100}%)` }}
            />
          </div>
        </div>

        {/* Close */}
        <button
          onClick={stopAudio}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-80 shrink-0"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Stop playback"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
