import React from 'react';
import { CloudRain, Wind } from 'lucide-react';

/**
 * WeatherIntegration
 * Displays compact weather telemetry inside HUD
 */
function WeatherIntegration() {
  return (
    <div className="hud-widget weather">

      {/* WEATHER ICON */}
      <CloudRain size={16} className="weather-icon" />

      {/* TEMPERATURE & HUMIDITY */}
      <span className="value">24°C | 82% HUM</span>

      {/* WIND INFO */}
      <Wind size={16} className="wind-icon" />
      <span className="label">WIND: 12 km/h</span>

    </div>
  );
}

export default WeatherIntegration;
