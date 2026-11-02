/** Single source of truth for keyboard shortcuts (used by the hotkeys and the help modal). */
export const SHORTCUTS = [
  { keys: ['alt', 'N'], combo: 'alt+n', label: 'New page' },
  { keys: ['alt', 'W'], combo: 'alt+w', label: 'Go to writing' },
  { keys: ['alt', 'G'], combo: 'alt+g', label: 'Go to Word Serpent' },
  { keys: ['alt', 'S'], combo: 'alt+s', label: 'Start a sprint' },
  { keys: ['alt', 'F'], combo: 'alt+f', label: 'Focus mode' },
  { keys: ['alt', 'T'], combo: 'alt+t', label: 'Toggle light / dark' },
  { keys: ['alt', 'M'], combo: 'alt+m', label: 'Toggle sound' },
  { keys: ['alt', 'H'], combo: 'alt+h', label: 'Saved pages' },
  { keys: ['alt', 'B'], combo: 'alt+b', label: 'Trophy case' },
  { keys: ['mod', 'K'], combo: 'mod+k', label: 'Show shortcuts' },
  { keys: ['?'], combo: '?', label: 'Show shortcuts (outside the editor)' },
  { keys: ['Esc'], combo: 'escape', label: 'Finish session / pause serpent' },
] as const
