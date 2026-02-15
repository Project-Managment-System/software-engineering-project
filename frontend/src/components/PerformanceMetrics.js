import React, { useMemo } from 'react';
import {
  Activity,
  Cpu,
  Wifi,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ======================================================
   HEALTH EVALUATION LOGIC
====================================================== */
const evaluateSystemHealth = (latency, load) => {
  if (latency > 100 || load > 80) {
    return {
      label: 'CRITICAL',
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.45)'
    };
  }

  if (latency > 50 || load > 50) {
    return {
      label: 'DEGRADED',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)'
    };
  }

  return {
    label: 'OPTIMAL',
    color: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.45)'
  };
};

/* ======================================================
   COMPONENT
====================================================== */
const PerformanceMetrics = ({ latency = 0, load = 0 }) => {
  /* -------------------------
     DERIVED SYSTEM STATE
  -------------------------- */
  const systemHealth = useMemo(
    () => evaluateSystemHealth(latency, load),
    [latency, load]
  );

  return (
    <motion.section
      className="hud-widget performance-command-center"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ borderLeft: `4px solid ${systemHealth.color}` }}
    >
      {/* ==================================================
         SECTION 1: LIVE SIGNAL VISUALIZER
      ================================================== */}
      <div className="telemetry-visualizer">
        <div
          className="icon-pulse-wrapper"
          style={{ backgroundColor: systemHealth.glow }}
        >
          <Activity
            size={20}
            className="pulse-icon"
            style={{ color: systemHealth.color }}
          />
        </div>

        <svg
          className="mini-wave"
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="none"
            stroke={systemHealth.color}
            strokeWidth="2"
            animate={{
              d: [
                'M0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 15 T 100 15',
                'M0 15 Q 10 25, 20 15 T 40 15 T 60 15 T 80 15 T 100 15',
                'M0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 15 T 100 15'
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear'
            }}
          />
        </svg>
      </div>

      {/* ==================================================
         SECTION 2: TELEMETRY DATA
      ================================================== */}
      <div className="hud-data-group">
        {/* NETWORK LATENCY */}
        <div className="hud-data">
          <div className="label-row">
            <Wifi size={12} />
            <span className="label">NETWORK LATENCY</span>
          </div>

          <span className="value tabular-nums">
            {latency}ms
          </span>

          <div className="mini-bar-track">
            <motion.div
              className="mini-bar-fill"
              animate={{
                width: `${Math.min(latency, 100)}%`,
                backgroundColor: systemHealth.color
              }}
            />
          </div>
        </div>

        {/* COMPUTE LOAD */}
        <div className="hud-data">
          <div className="label-row">
            <Cpu size={12} />
            <span className="label">COMPUTE LOAD</span>
          </div>

          <span className="value tabular-nums">
            {load}%
          </span>

          <div className="mini-bar-track">
            <motion.div
              className="mini-bar-fill"
              animate={{
                width: `${load}%`,
                backgroundColor: systemHealth.color
              }}
            />
          </div>
        </div>
      </div>

      {/* ==================================================
         SECTION 3: SYSTEM STATUS
      ================================================== */}
      <div className="system-grade-box">
        <span
          className="grade-indicator"
          style={{ backgroundColor: systemHealth.color }}
        />

        <div className="grade-text">
          <span className="tiny-label">HEALTH STATUS</span>
          <span
            className="status-string"
            style={{ color: systemHealth.color }}
          >
            {systemHealth.label}
          </span>
        </div>

        <ShieldCheck
          size={18}
          className="shield-icon"
        />
      </div>
    </motion.section>
  );
};

export default PerformanceMetrics;
