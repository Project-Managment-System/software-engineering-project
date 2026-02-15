import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import PropTypes from 'prop-types';

// Animation variants for motion
const notificationVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const NotificationPanel = ({ title, message, icon: Icon, color, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={notificationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="floating-notification"
        >
          <div className="notification-content">
            {Icon && <Icon color={color} size={20} />}
            <div className="notif-text">
              <p className="notif-title">{title}</p>
              <p className="notif-desc">{message}</p>
            </div>
          </div>
          <X size={16} className="close-notif" onClick={handleClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Prop types for better maintainability
NotificationPanel.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.string,
  onClose: PropTypes.func,
};

// Default props
NotificationPanel.defaultProps = {
  icon: AlertTriangle,
  color: '#f59e0b',
  onClose: null,
};

export default NotificationPanel;
