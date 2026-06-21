import React from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Phone, 
  Mail, 
  Facebook, 
  ArrowRight, 
  MapPin, 
  Clock 
} from 'lucide-react';
import './Footer.css';

export default function Footer({ isDark }) {
  const currentYear = new Date().getFullYear();

  // Custom Company Action Hooks
  const companyLinks = {
    instagram: "https://instagram.com/civilpromax", // Replace with actual account url
    facebook: "https://facebook.com/civilpromax",   // Replace with actual page url
    email: "mailto:info@civilpromax.com",           // Opens user email client instantly
    whatsapp: "https://wa.me/94771234567"           // Connects directly to WhatsApp chat thread
  };

  // Stagger Container Animation Rules
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Creates step-by-step entry cascade
        delayChildren: 0.1
      }
    }
  };

  // Single Item Slide-Up Animation Rule
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 60, damping: 15 } 
    }
  };

  return (
    <footer className={`pro-footer ${isDark ? 'dark-mode' : 'light-mode'}`}>
      {/* Background Animated Matrix Glow Accent */}
      <div className="footer-background-mesh"></div>

      <motion.div 
        className="footer-content-wrapper"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* Main Columns Grid Array */}
        <div className="footer-main-grid">
          
          {/* Column 1: About Panel */}
          <motion.div variants={itemVariants} className="grid-column about-col">
            <div className="brand-animation-box">
              <h2 className="animated-brand-text">
                CIVIL PRO <span className="highlight">MAX</span>
              </h2>
            </div>
            <p className="about-description">
              Pioneering high-precision software infrastructure and engineering framework components. Streamlining construction layout management pipelines across enterprise ecosystems with structural efficiency.
            </p>
          </motion.div>

          {/* Column 2: Quick Links Array */}
          <motion.div variants={itemVariants} className="grid-column links-col">
            <h3 className="column-title">Quick Links</h3>
            <ul className="links-list">
              {['Portal Home', 'System Dashboard', 'Admin Gateway', 'Engineer Console', 'User Core'].map((text, i) => (
                <li key={i}>
                  <a href={`#${text.toLowerCase().replace(/\s+/g, '-')}`} className="nav-link-item">
                    <ArrowRight size={12} className="link-arrow" />
                    <span>{text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Contact Channels */}
          <motion.div variants={itemVariants} className="grid-column contact-col">
            <h3 className="column-title">Contact Us</h3>
            <div className="contact-info-stack">
              <div className="info-entry-row">
                <MapPin size={16} className="text-cyan-500 shrink-0" />
                <span>Enterprise Plaza, Level 4, Tech Sector Node</span>
              </div>
              <div className="info-entry-row">
                <Mail size={16} className="text-cyan-500 shrink-0" />
                <a href={companyLinks.email} className="hover-action-text">info@civilpromax.com</a>
              </div>
              <div className="info-entry-row">
                <Clock size={16} className="text-cyan-500 shrink-0" />
                <span>Comms Matrix: 24/7 Monitoring</span>
              </div>
            </div>
          </motion.div>

          {/* Column 4: External Interactive Links Network */}
          <motion.div variants={itemVariants} className="grid-column social-col">
            <h3 className="column-title">Secure Links</h3>
            <p className="social-cta-text">Touch an array node below to open real-time company transmission lines:</p>
            
            <div className="social-icon-matrix">
              
              <motion.a 
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                href={companyLinks.instagram} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-wrapper insta-node"
                title="Instagram Network"
              >
                <Instagram size={20} />
              </motion.a>

              <motion.a 
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                href={companyLinks.whatsapp} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-wrapper whatsapp-node"
                title="WhatsApp Channel"
              >
                <Phone size={20} />
              </motion.a>

              <motion.a 
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                href={companyLinks.facebook} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-wrapper facebook-node"
                title="Facebook Portal"
              >
                <Facebook size={20} />
              </motion.a>

            </div>
          </motion.div>

        </div>

        {/* Lower Verification Bar Layer */}
        <motion.div variants={itemVariants} className="footer-bottom-bar">
          <p className="copyright-text">
            &copy; {currentYear} <span className="text-cyan-500 font-bold">CIVIL PRO MAX</span> Systems Corp. All absolute access parameters monitored.
          </p>
          <div className="compliance-links-row">
            <a href="#privacy">Privacy Nodes</a>
            <span className="divider-dot">•</span>
            <a href="#terms">Usage Tokens</a>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
}