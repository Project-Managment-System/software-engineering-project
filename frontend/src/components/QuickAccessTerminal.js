import React from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable loading shimmer bar component.
 */
const GlobalLoadingBar = ({ height, color, speed }) => {
  const shimmerStyle = {
    height,
    background: color,
    animation: `shimmer ${speed} infinite linear`,
  };

  return (
    <div className="loading-shimmer-container" style={{ height }}>
      <div className="loading-shimmer-bar" style={shimmerStyle}></div>
    </div>
  );
};

// Prop types for maintainability
GlobalLoadingBar.propTypes = {
  height: PropTypes.string,
  color: PropTypes.string,
  speed: PropTypes.string,
};

// Default props
GlobalLoadingBar.defaultProps = {
  height: '4px',
  color: 'linear-gradient(90deg, #f3f3f3 25%, #e0e0e0 50%, #f3f3f3 75%)',
  speed: '1.5s',
};

export default GlobalLoadingBar;
