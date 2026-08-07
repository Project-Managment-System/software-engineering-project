// Premium UI sound effects, synthesized in-browser via the Web Audio API — no audio files,
// no licensing. AudioContext is created lazily on first playback (never at module load), so
// every call happens as a direct result of a real user action already, which satisfies
// browser autoplay policy without any extra "unlock" step.
const PREFS_KEY = 'sound-preferences';
let audioCtx = null;

const readPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { muted: false, volume: 0.5, ...JSON.parse(raw) };
  } catch (e) { /* corrupt/unavailable storage — fall back to defaults */ }
  return { muted: false, volume: 0.5 };
};

export const getSoundPrefs = readPrefs;

export const setSoundPrefs = (partial) => {
  const next = { ...readPrefs(), ...partial };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  return next;
};

const ensureContext = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

// notes: [{ freq, at, duration, type }] — a short melodic sequence, each note an
// independent oscillator with a quick attack / exponential-decay gain envelope.
const playNotes = (notes, peakGain) => {
  const ctx = ensureContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  notes.forEach(({ freq, at = 0, duration = 0.15, type = 'sine' }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const startTime = now + at;
    const endTime = startTime + duration;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(endTime + 0.02);
  });
};

// The many named events from the spec collapse onto these ~7 tone archetypes rather than
// one unique clip per event — e.g. profile-updated / new-project / estimate-generated /
// PDF-uploaded / approval all share the `success` tone.
const RECIPES = {
  success: [{ freq: 660, duration: 0.12 }, { freq: 880, at: 0.1, duration: 0.16 }],
  error: [{ freq: 300, duration: 0.14, type: 'sawtooth' }, { freq: 220, at: 0.1, duration: 0.18, type: 'sawtooth' }],
  reject: [{ freq: 300, duration: 0.14, type: 'sawtooth' }, { freq: 220, at: 0.1, duration: 0.18, type: 'sawtooth' }],
  warning: [{ freq: 440, duration: 0.2, type: 'triangle' }],
  info: [{ freq: 523, duration: 0.13 }],
  toggle: [{ freq: 800, duration: 0.05, type: 'square' }],
  login: [{ freq: 523, duration: 0.1 }, { freq: 659, at: 0.08, duration: 0.1 }, { freq: 784, at: 0.16, duration: 0.18 }],
  logout: [{ freq: 659, duration: 0.12 }, { freq: 440, at: 0.09, duration: 0.18 }],
};

// Fire-and-forget — a sound is a nice-to-have, never something a caller should need to
// await or handle errors for (unsupported browser, autoplay block, etc. just stay silent).
export const playSound = (kind) => {
  const prefs = readPrefs();
  if (prefs.muted) return;
  const recipe = RECIPES[kind] || RECIPES.info;
  try {
    playNotes(recipe, Math.max(0, Math.min(1, prefs.volume)) * 0.2);
  } catch (e) { /* ignore — sound is best-effort */ }
};
