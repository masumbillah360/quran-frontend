/**
 * ══════════════════════════════════════════════════════════════════════════════
 * USE KEYBOARD SHORTCUTS HOOK
 * ══════════════════════════════════════════════════════════════════════════════
 * Centralized keyboard shortcut handling with:
 * - Conflict prevention
 * - Input element awareness
 * - Shortcut documentation
 */

import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  /** If true, prevents default even in inputs */
  global?: boolean;
}

export const SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, description: 'Open search' },
  PLAY_PAUSE: { key: ' ', description: 'Play/Pause audio' },
  NEXT_AYAH: { key: 'ArrowRight', shift: true, description: 'Next ayah' },
  PREV_AYAH: { key: 'ArrowLeft', shift: true, description: 'Previous ayah' },
  STOP: { key: 'Escape', description: 'Stop audio / Close modal' },
  NEXT_SURAH: { key: 'ArrowDown', ctrl: true, description: 'Next surah' },
  PREV_SURAH: { key: 'ArrowUp', ctrl: true, description: 'Previous surah' },
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  TOGGLE_SETTINGS: { key: ',', ctrl: true, description: 'Toggle settings' },
} as const;

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const keyMatch =
          e.key === shortcut.key || e.code === shortcut.key;
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // Skip if in input and not global
          if (isInput && !shortcut.global) continue;

          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Get shortcut display string (e.g., "Ctrl+K")
 */
export function getShortcutDisplay(shortcut: Partial<ShortcutConfig>): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');
  
  if (shortcut.key) {
    const keyDisplay =
      shortcut.key === ' '
        ? 'Space'
        : shortcut.key.replace('Arrow', '');
    parts.push(keyDisplay);
  }

  return parts.join('+');
}
