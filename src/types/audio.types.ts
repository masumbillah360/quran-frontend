export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentSurah: number;
  currentAyah: number | null;
  currentWord: number | null;
  currentAyahIndex: number;
}
