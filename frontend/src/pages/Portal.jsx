import React from 'react';
import { Building2, LayoutDashboard, Globe, ChevronRight } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

// Character animation variants for the premium logo treatment
const logoContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 12, stiffness: 200 }
  }
};

const PortalCard = ({ title, icon: Icon, description, onClick, image }) => (
  <motion.div 
    variants={cardVariants}
    whileHover={{ 
      y: -10, 
      scale: 1.02,
      borderColor: "#90D5FF",
      boxShadow: "0 30px 60px -15px rgba(0, 58, 97, 0.35), 0 0 30px rgba(144, 213, 255, 0.4)"
    }}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    className="relative bg-white/85 backdrop-blur-2xl border border-[#90D5FF]/40 rounded-[2.5rem] flex flex-col overflow-hidden group transition-all duration-500"
  >
    {/* Inner Subtle White Rim Layer */}
    <div className="absolute inset-0 border border-white/60 rounded-[2.5rem] pointer-events-none z-30" />
    <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#90D5FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

    {/* Thumbnail Banner Image Window - Tinted darker using high professional opacity controls */}
    <div className="h-56 w-full overflow-hidden relative bg-slate-950">
      <div className="absolute inset-0 bg-slate-950/25 mix-blend-multiply z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-10" />
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover opacity-60 contrast-110 brightness-90 transition-all duration-1000 ease-out group-hover:scale-110 group-hover:opacity-85 group-hover:brightness-100"
      />
    </div>

    {/* Content Area - Designed with #90D5FF Structural Highlights */}
    <div className="p-10 flex flex-col flex-grow relative z-20">
      {/* Icon Frame Capsule tinted to your Light Blue brand identity */}
      <div className="p-4 rounded-2xl bg-[#90D5FF]/20 border border-[#90D5FF]/50 text-[#006EB1] w-fit mb-6 shadow-sm group-hover:bg-[#006EB1] group-hover:text-white group-hover:border-[#006EB1] group-hover:rotate-[360deg] transition-all duration-700 ease-in-out">
        <Icon size={26} strokeWidth={2} />
      </div>
      
      {/* Updated to premium high-contrast dark blue tone */}
      <h3 className="text-3xl font-extrabold mb-3 text-[#002B49] tracking-tight">
        {title}
      </h3>
      
      <p className="text-slate-600 text-sm mb-10 flex-grow leading-relaxed font-normal">
        {description}
      </p>
      
      {/* Expanded & Polished Access Portal Bar using the brand palette */}
      <button 
        onClick={onClick} 
        className="w-full py-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 hover:from-[#006EB1] hover:to-[#005a91] text-white border border-slate-800 hover:border-[#90D5FF] rounded-2xl text-xs font-bold tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group-hover:gap-5 shadow-lg relative overflow-hidden active:scale-[0.99]"
      >
        <span>ACCESS PORTAL</span> 
        <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  </motion.div>
);

export default function Portal() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const logoText = "CIVILPRO";
  const logoAccent = "MAX";

  return (
    <div 
      className="min-h-screen relative overflow-hidden text-slate-900 antialiased font-sans bg-cover bg-center bg-fixed bg-slate-900"
      style={{ 
        backgroundImage: `url("https://i.pinimg.com/736x/6e/6e/7a/6e6e7a8d1a45abb2e0887a5352f20c01.jpg")` 
      }}
    >
      {/* Background Safety Tint Layer removed - Image will now render in its 100% original full color spectrum */}
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />

      {/* Top Animated Progress Indicator Line using your exact brand accent */}
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-[#006EB1] z-[110] origin-left" style={{ scaleX }} />

      {/* Navigation Bar styled with Light Blue #90D5FF Frosting */}
      <nav className="fixed w-full z-[100] px-10 py-6 flex items-center justify-between bg-white/85 backdrop-blur-xl border-b border-[#90D5FF]/60 shadow-md shadow-[#006EB1]/5">
        {/* Lyrical Frame Character-by-Character Stagger Animation Sequence */}
        <motion.h2 
          variants={logoContainerVariants}
          initial="hidden"
          animate="visible"
          className="text-xl font-black tracking-wider text-slate-900 uppercase flex items-center select-none"
        >
          {logoText.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants}>
              {char}
            </motion.span>
          ))}
          <span className="w-2" />
          {logoAccent.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants} className="text-[#006EB1] font-medium">
              {char}
            </motion.span>
          ))}
        </motion.h2>

        <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#005a91] bg-[#90D5FF]/30 border border-[#90D5FF]/60 px-4 py-2 rounded-full tracking-widest uppercase shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006EB1] animate-pulse" />
          SYSTEM OPERATIONAL
        </div>
      </nav>

      {/* Main Container Workspace */}
      <main className="max-w-5xl mx-auto px-8 pt-48 pb-28 relative z-20">
        
        {/* Text Bar Container featuring a Darker Blue (#001C30) Auto-Running Border Track */}
        <div className="relative p-[4px] rounded-[2.5rem] overflow-hidden mb-20 shadow-xl shadow-slate-900/5 bg-slate-300">
          {/* Deeper Dark Blue Continuous Auto-Run Border Loop Animation Component */}
          <div className="absolute inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,transparent_180deg,#001C30_270deg,transparent_360deg)] animate-[spin_5s_linear_infinite] z-0" />
          
          {/* Inner Text Bar Header Panel Content Module */}
          <header className="relative text-center flex flex-col items-center bg-white/80 backdrop-blur-xl border border-[#90D5FF]/50 p-10 rounded-[2.4rem] z-10 w-full">
            
            {/* Changed from gradient text to a solid professional dark blue color layout */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-5xl sm:text-6xl font-black tracking-tight mb-5 text-[#002B49] uppercase pt-4"
            >
              COMMAND CENTRAL
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed font-normal pb-4"
            >
              Streamlined administrative and operational access for the future of civil engineering infrastructure.
            </motion.p>
          </header>
        </div>

        {/* Portals Responsive Container Layout Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <PortalCard 
            icon={Building2} 
            title="Head Office" 
            description="High-level strategic oversight and administrative enterprise management."
            image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
            onClick={() => navigate('/headoffice/login')} 
          />
          <PortalCard 
            icon={LayoutDashboard} 
            title="Division" 
            description="Unified field operations, engineering analytics, and user access."
            image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200"
            onClick={() => navigate('/division/login')} 
          />
        </motion.div>
      </main>
    </div>
  );
}