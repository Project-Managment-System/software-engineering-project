// Centralized, delegated click-ripple + magnetic-pull micro-interactions for the
// premium button system (see premium-system.css "ULTRA PREMIUM GLASSMORPHISM
// BUTTON SYSTEM"). Runs once globally via a single init() call from index.js —
// no dashboard file, button component, or onClick handler needs to change.

const RIPPLE_SELECTOR = [
  '.save-btn', '.cancel-btn', '.confirm-btn', '.approve-btn', '.reject-btn',
  '.edit-btn', '.delete-btn', '.tik-btn', '.undo-btn', '.undo-review-btn',
  '.download-pdf-btn', '.export-btn', '.table-action-btn', '.action-btn-pill',
  '.sidebar-toggle-menu-btn'
].join(', ');

// Magnetic pull is intentionally reserved for primary call-to-action buttons only.
const MAGNETIC_SELECTOR = '.save-btn, .confirm-btn, .tik-btn';
const MAGNETIC_RANGE = 3; // px, matches the "extremely subtle" spec

let initialized = false;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const supportsHoverPrecise = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function spawnRipple(button, clientX, clientY) {
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.6;
  const ripple = document.createElement('span');
  ripple.className = 'ps-ripple';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${clientX - rect.left - size / 2}px`;
  ripple.style.top = `${clientY - rect.top - size / 2}px`;
  button.appendChild(ripple);
  const cleanup = () => ripple.remove();
  ripple.addEventListener('animationend', cleanup, { once: true });
  // Safety net in case the element is removed/re-rendered mid-animation.
  setTimeout(cleanup, 800);
}

function handlePointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return; // left click / primary touch only
  const button = e.target.closest(RIPPLE_SELECTOR);
  if (!button || button.disabled) return;
  if (prefersReducedMotion()) return;
  spawnRipple(button, e.clientX, e.clientY);
}

let activeMagneticEl = null;
let rafId = null;
let pendingMove = null;

function applyMagneticTransform() {
  rafId = null;
  if (!activeMagneticEl || !pendingMove) return;
  const rect = activeMagneticEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = pendingMove.x - cx;
  const dy = pendingMove.y - cy;
  const maxDist = Math.max(rect.width, rect.height);
  const strength = Math.min(1, Math.hypot(dx, dy) / maxDist);
  const offsetX = (dx / maxDist) * MAGNETIC_RANGE * strength;
  const offsetY = (dy / maxDist) * MAGNETIC_RANGE * strength;
  // Uses !important so this reliably wins over the per-dashboard hover
  // transforms that are already declared !important in some files.
  activeMagneticEl.style.setProperty(
    'transform',
    `translate(${offsetX.toFixed(2)}px, ${(offsetY - 2).toFixed(2)}px)`,
    'important'
  );
}

function handleMouseOver(e) {
  if (prefersReducedMotion() || !supportsHoverPrecise()) return;
  const button = e.target.closest(MAGNETIC_SELECTOR);
  if (button && button !== activeMagneticEl && !button.disabled) {
    activeMagneticEl = button;
  }
}

function handleMouseOut(e) {
  const button = e.target.closest(MAGNETIC_SELECTOR);
  if (button && (!e.relatedTarget || !button.contains(e.relatedTarget))) {
    button.style.removeProperty('transform');
    if (activeMagneticEl === button) activeMagneticEl = null;
  }
}

function handleMouseMove(e) {
  if (!activeMagneticEl) return;
  pendingMove = { x: e.clientX, y: e.clientY };
  if (rafId == null) rafId = requestAnimationFrame(applyMagneticTransform);
}

export function initButtonEffects() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;

  document.addEventListener('pointerdown', handlePointerDown, { passive: true });

  if (supportsHoverPrecise() && !prefersReducedMotion()) {
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
  }
}
