import React from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck } from 'lucide-react';

const SystemHealthMonitor = ({ status, icon: Icon, color }) => (
  <div className="health-check-indicator">
    {Icon && <Icon size={14} color={color} />}
    <span>{status}</span>
  </div>
);

// Prop types
SystemHealthMonitor.propTypes = {
  status: PropTypes.string,
  icon: PropTypes.elementType,
  color: PropTypes.string,
};

// Default props
SystemHealthMonitor.defaultProps = {
  status: 'ENCRYPTION: AES-256 ACTIVE',
  icon: ShieldCheck,
  color: '#22c55e',
};

export default SystemHealthMonitor;
