import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { playSound } from '../utils/sounds';

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };

const POSITION_STYLES = {
  'bottom-right': { bottom: 24, right: 24, alignItems: 'flex-end' },
  'bottom-left': { bottom: 24, left: 24, alignItems: 'flex-start' },
  'top-right': { top: 24, right: 24, alignItems: 'flex-end' },
  'top-center': { top: 24, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
};

const SLIDE_FROM = {
  'bottom-right': { x: 80, y: 0 },
  'bottom-left': { x: -80, y: 0 },
  'top-right': { x: 80, y: 0 },
  'top-center': { x: 0, y: -40 },
};

const DURATION = 4200;

// A single toast — owns its own dismiss countdown so hovering it can genuinely pause the
// timer (the shrinking progress bar reflects the same clock that triggers dismissal).
function ToastItem({ toast, onDismiss, position }) {
  const [remaining, setRemaining] = useState(DURATION);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const rafRef = useRef(null);

  useEffect(() => {
    if (paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = Date.now();
    const startRemaining = remaining;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const next = startRemaining - elapsed;
      if (next <= 0) {
        onDismiss(toast.id);
        return;
      }
      setRemaining(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line
  }, [paused]);

  const Icon = ICONS[toast.type] || ICONS.info;
  const pct = Math.max(0, Math.min(100, (remaining / DURATION) * 100));
  const slide = SLIDE_FROM[position] || SLIDE_FROM['bottom-right'];

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) onDismiss(toast.id);
      }}
      initial={{ ...slide, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      exit={{ ...slide, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`toast-card toast-${toast.type || 'success'}`}
      style={{ pointerEvents: 'all', cursor: 'grab' }}
    >
      <div className="toast-card-icon">
        <Icon size={18} />
      </div>
      <span className="toast-card-message">{toast.message}</span>
      <button className="toast-card-close" onClick={() => onDismiss(toast.id)} title="Close">
        <X size={14} />
      </button>
      <div className="toast-card-progress" style={{ width: `${pct}%` }} />
    </motion.div>
  );
}

// Shared toast renderer — fully controlled (parent owns `toasts` state/persistence via its
// own addToast(), this only renders + owns dismiss timing/animation/sound). Used today by
// admin/user/engineer/DivisionalAssistant dashboards.
export default function ToastStack({ toasts, onDismiss, position = 'bottom-right' }) {
  const seen = useRef(new Set());

  useEffect(() => {
    toasts.forEach((t) => {
      if (!seen.current.has(t.id)) {
        seen.current.add(t.id);
        playSound(t.type || 'success');
      }
    });
  }, [toasts]);

  return (
    <div
      className="toast-stack"
      style={{ position: 'fixed', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none', ...POSITION_STYLES[position] }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} position={position} />
        ))}
      </AnimatePresence>
    </div>
  );
}
