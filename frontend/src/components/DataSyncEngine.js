import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCcw } from 'lucide-react';

/**
 * Determines the display status based on the input string.
 * @param {string} status - The current database sync status
 * @returns {string} - 'READY' if status includes 'QUANTUM', otherwise 'ACTIVE'
 */
const getDisplayStatus = (status) => (status.includes('QUANTUM') ? 'READY' : 'ACTIVE');

const DataSyncEngine = ({ status }) => {
  const displayStatus = getDisplayStatus(status);

  return (
    <div className="sync-engine-overlay">
      <RefreshCcw size={12} className="spin-slow" />
      <span>DB_SYNC: {displayStatus}</span>
    </div>
  );
};

// Optional: Type checking for props
DataSyncEngine.propTypes = {
  status: PropTypes.string.isRequired,
};

// Optional: Default props
DataSyncEngine.defaultProps = {
  status: '',
};

export default DataSyncEngine;
