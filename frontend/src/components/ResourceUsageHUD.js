import React from 'react';
import { Cpu } from 'lucide-react';

/**
 * ResourceUsageHUD
 * Displays a compact system resource usage indicator
 */
function ResourceUsageHUD() {
  const usagePercentage = 45; // static for now

  return (
    <div className="hud-widget resources">

      {/* ICON */}
      <Cpu size={16} className="resource-icon" />

      {/* PROGRESS BAR */}
      <div className="progress-mini">
        <div
          className="fill"
          style={{ width: `${usagePercentage}%` }}
        />
      </div>

      {/* LABEL */}
      <span className="label">VRAM_STATIC</span>

    </div>
  );
}

export default ResourceUsageHUD;
