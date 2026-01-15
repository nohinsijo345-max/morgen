import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Leaf,
  ShoppingBag, 
  Landmark, 
  Globe, 
  TruckIcon,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModuleSelector = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // Refs for scroll animations
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  
  // Scroll-based animations - simplified to prevent glitching
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  
  // In-view animations - simplified
  const heroInView = useInView(heroRef, { once: true, margin: "-50px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-100px" });

  console.log('ModuleSelector rendering...');

  // Theme colors - Fixed dark mode with cooler blue-slate palette
  const colors = {
    light: {
      background: 'linear-gradient(135deg, #fef7ed 0%, #fff7ed 50%, #fef3c7 100%)',
      cardBackground: 'rgba(255, 255, 255, 0.25)',
      cardBorder: 'rgba(251, 191, 36, 0.2)',
      cardHover: 'rgba(255, 255, 255, 0.4)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      accent: '#f59e0b',
      accentSecondary: '#d97706',
      cream: '#fef7ed',
      warmGold: '#f59e0b',
      headerBorder: 'rgba(251, 191, 36, 0.4)',
      headerShadow: '0 4px 20px rgba(251, 191, 36, 0.15)'
    },
    dark: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      cardBackground: 'rgba(15, 23, 42, 0.7)',
      cardBorder: 'rgba(100, 116, 139, 0.3)',
      cardHover: 'rgba(30, 41, 59, 0.8)',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      accent: '#60a5fa',
      accentSecondary: '#3b82f6',
      cream: '#1e293b',
      warmGold: '#60a5fa',
      headerBorder: 'rgba(100, 116, 139, 0.5)',
      headerShadow: '0 4px 20px rgba(100, 116, 139, 0.2)'
    }
  };

  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Module cards data with better icons - Admin removed for security
  const modules = [
    {
      id: 'farmer',
      title: 'Farmer Portal',
      description: 'Manage crops, weather insights, AI plant doctor, and market forecasts',
      icon: Leaf,
      gradient: 'from-green-400 to-emerald-600',
      route: '/login',
      features: ['Crop Management', 'Weather Insights', 'AI Plant Doctor', 'Price Forecasts']
    },
    {
      id: 'buyer',
      title: 'Buyer Portal',
      description: 'Access marketplace, auction rooms, and direct farmer connections',
      icon: ShoppingBag,
      gradient: 'from-red-400 to-pink-600',
      route: '/buyer-login',
      features: ['Live Auctions', 'Direct Purchase', 'Quality Assurance', 'Bulk Orders']
    },
    {
      id: 'government',
      title: 'Government Portal',
      description: 'Policy management, subsidies, and agricultural oversight',
      icon: Landmark,
      gradient: 'from-purple-400 to-violet-600',
      route: '/government/login',
      features: ['Policy Management', 'Subsidy Distribution', 'Data Analytics', 'Compliance']
    },
    {
      id: 'driver',
      title: 'Driver Portal',
      description: 'Transport management, delivery tracking, and route optimization',
      icon: TruckIcon,
      gradient: 'from-amber-400 to-orange-600',
      route: '/driver-login',
      features: ['Route Optimization', 'Delivery Tracking', 'Earnings', 'Schedule Management']
    }
  ];

  // Handle module selection - simplified
  const handleModuleSelect = (module) => {
    console.log('Navigating to:', module.route);
    navigate(module.route);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <motion.div 
      ref={containerRef}
      className="min-h-screen transition-all duration-700 relative overflow-hidden"
      style={{ background: currentColors.background }}
    >
      {/* Animated Background Elements - Simplified for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs - Reduced complexity */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-48 h-48 rounded-full blur-3xl"
          style={{ 
            backgroundColor: currentColors.accent,
            opacity: isDarkMode ? 0.06 : 0.1
          }}
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, -15, 0],
            scale: [1, 0.98, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl"
          style={{ 
            backgroundColor: currentColors.accentSecondary,
            opacity: isDarkMode ? 0.04 : 0.08
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 backdrop-blur-xl border-b-4"
        style={{ 
          backgroundColor: currentColors.cardBackground,
          borderColor: currentColors.headerBorder,
          boxShadow: currentColors.headerShadow
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img 
                src="/logo.png" 
                alt="Morgen Logo" 
                className="h-14 w-auto rounded-xl shadow-lg"
                whileHover={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 0.5 }}
              />
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: currentColors.text }}
                >
                  Morgen
                </h1>
                <p 
                  className="text-sm"
                  style={{ color: currentColors.textSecondary }}
                >
                  Agricultural Platform
                </p>
              </div>
            </motion.div>

            {/* Theme Toggle - Fixed functionality and removed labels */}
            <div className="flex items-center gap-4">
              {/* Discrete Admin Access - Only visible on hover */}
              <motion.button
                onClick={() => navigate('/admin-login')}
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                className="opacity-20 hover:opacity-100 transition-all duration-300 text-xs px-3 py-1 rounded-lg backdrop-blur-sm border"
                style={{ 
                  backgroundColor: currentColors.cardBackground,
                  borderColor: currentColors.cardBorder,
                  color: currentColors.textSecondary
                }}
                title="Admin Access"
              >
                Admin
              </motion.button>

              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-20 h-10 rounded-full p-1 transition-all duration-300 backdrop-blur-sm border-2"
                style={{ 
                  backgroundColor: currentColors.cardBackground,
                  borderColor: currentColors.cardBorder,
                  boxShadow: `inset 0 2px 4px ${currentColors.accent}20, 0 4px 8px ${currentColors.accent}10`
                }}
              >
                <motion.div
                  animate={{ x: isDarkMode ? 40 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
                  style={{ backgroundColor: currentColors.accent }}
                >
                  {/* Background glow effect */}
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: currentColors.accent, opacity: 0.3 }}
                  />
                  
                  {/* Icon - Fixed moon orientation */}
                  <div className="relative z-10">
                    {isDarkMode ? (
                      <Moon className="w-4 h-4 text-white" />
                    ) : (
                      <Sun className="w-4 h-4 text-white" />
                    )}
                  </div>
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="inline-flex items-center gap-6 mb-8"
          >
            <motion.div
              animate={{ 
                rotate: [0, 2, -2, 0],
                scale: [1, 1.02, 1],
                y: [0, -1, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 1
              }}
            >
              <Sparkles 
                className="w-8 h-8 md:w-10 md:h-10"
                style={{ color: currentColors.accent }}
              />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(135deg, ${currentColors.accent} 0%, ${currentColors.accentSecondary} 100%)`
              }}
            >
              Welcome to Morgen
            </motion.h2>
            
            <motion.div
              animate={{ 
                rotate: [0, -2, 2, 0],
                scale: [1, 1.03, 1],
                y: [0, -0.5, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 1,
                delay: 0.5
              }}
            >
              <Sparkles 
                className="w-8 h-8 md:w-10 md:h-10"
                style={{ color: currentColors.accentSecondary }}
              />
            </motion.div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl lg:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
            style={{ color: currentColors.textSecondary }}
          >
            Your comprehensive agricultural ecosystem connecting farmers, buyers, government, and communities
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-10 py-5 rounded-2xl backdrop-blur-md shadow-xl"
            style={{ 
              backgroundColor: currentColors.cardBackground,
              border: `2px solid ${currentColors.cardBorder}`,
              boxShadow: `0 10px 30px ${currentColors.accent}25`
            }}
          >
            <p 
              className="text-base md:text-lg font-semibold"
              style={{ color: currentColors.text }}
            >
              Choose your portal to get started
            </p>
          </motion.div>
        </motion.div>

        {/* Module Cards Grid */}
        <motion.div
          ref={cardsRef}
          initial={{ opacity: 0 }}
          animate={cardsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={cardsInView ? { 
                opacity: 1, 
                y: 0, 
                scale: 1
              } : { 
                opacity: 0, 
                y: 30, 
                scale: 0.95
              }}
              transition={{ 
                duration: 0.5, 
                delay: cardsInView ? 0.8 + (index * 0.1) : 0,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -6,
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModuleSelect(module)}
              className="group cursor-pointer relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-300"
              style={{
                backgroundColor: hoveredCard === module.id ? currentColors.cardHover : currentColors.cardBackground,
                borderColor: currentColors.cardBorder,
                boxShadow: hoveredCard === module.id 
                  ? `0 20px 40px -12px ${currentColors.accent}30` 
                  : `0 8px 20px -5px ${currentColors.accent}15`
              }}
              onMouseEnter={() => setHoveredCard(module.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Gradient */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: hoveredCard === module.id ? 0.05 : 0,
                  scale: hoveredCard === module.id ? 1.2 : 0.8
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-br ${module.gradient} pointer-events-none`}
              />

              <div className="relative z-10 p-8">
                {/* Icon with Enhanced Animation */}
                <motion.div
                  animate={{ 
                    rotate: hoveredCard === module.id ? [0, -5, 5, 0] : 0,
                    scale: hoveredCard === module.id ? 1.1 : 1,
                    y: hoveredCard === module.id ? -5 : 0
                  }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300
                  }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-6 shadow-lg relative overflow-hidden`}
                >
                  {/* Icon Glow Effect */}
                  <motion.div
                    animate={{ 
                      opacity: hoveredCard === module.id ? 0.3 : 0,
                      scale: hoveredCard === module.id ? 1.5 : 1
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${module.gradient} blur-xl`}
                  />
                  
                  <module.icon className="w-8 h-8 text-white relative z-10" />
                </motion.div>

                {/* Title */}
                <motion.h3 
                  animate={{ 
                    y: hoveredCard === module.id ? -2 : 0 
                  }}
                  className="text-2xl font-bold mb-3"
                  style={{ 
                    color: hoveredCard === module.id ? currentColors.accent : currentColors.text,
                    transition: 'color 0.3s ease'
                  }}
                >
                  {module.title}
                </motion.h3>

                {/* Description */}
                <motion.p 
                  animate={{ 
                    y: hoveredCard === module.id ? -2 : 0 
                  }}
                  className="text-base mb-6 leading-relaxed"
                  style={{ color: currentColors.textSecondary }}
                >
                  {module.description}
                </motion.p>

                {/* Features with Staggered Animation */}
                <div className="space-y-2 mb-6">
                  {module.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.8 + (index * 0.1) + (idx * 0.05),
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 group/feature"
                    >
                      <motion.div 
                        animate={{ 
                          scale: hoveredCard === module.id ? 1.2 : 1,
                          rotate: hoveredCard === module.id ? 180 : 0
                        }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: currentColors.accent }}
                      />
                      <span 
                        className="text-sm transition-colors duration-300 group-hover/feature:font-medium"
                        style={{ color: currentColors.textSecondary }}
                      >
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button with Enhanced Interaction */}
                <motion.div
                  animate={{ 
                    x: hoveredCard === module.id ? 8 : 0,
                    scale: hoveredCard === module.id ? 1.05 : 1
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center gap-3 font-semibold relative"
                  style={{ color: currentColors.accent }}
                >
                  <span className="relative">
                    Enter Portal
                    {/* Underline Animation */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: hoveredCard === module.id ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
                      style={{ backgroundColor: currentColors.accent }}
                    />
                  </span>
                </motion.div>
              </div>

              {/* Edge Light Reflection */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: hoveredCard === module.id ? 1 : 0,
                  x: hoveredCard === module.id ? ['-100%', '100%'] : '-100%'
                }}
                transition={{ 
                  opacity: { duration: 0.3 },
                  x: { duration: 1.5, ease: "easeInOut" }
                }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${currentColors.accent}20 50%, transparent 100%)`,
                  transform: 'skewX(-20deg)'
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 15 }}
          animate={cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
          className="text-center mt-24 pt-10 border-t-3"
          style={{ 
            borderColor: currentColors.headerBorder,
            background: `linear-gradient(90deg, transparent 0%, ${currentColors.cardBackground} 50%, transparent 100%)`
          }}
        >
          <motion.p 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="text-sm font-medium px-8 py-4 rounded-2xl backdrop-blur-md inline-block shadow-lg"
            style={{ 
              color: currentColors.textSecondary,
              backgroundColor: currentColors.cardBackground,
              border: `2px solid ${currentColors.cardBorder}`,
              boxShadow: `0 4px 15px ${currentColors.accent}15`
            }}
          >
            © 2026 Morgen Agricultural Platform. Empowering agriculture through technology.
          </motion.p>
        </motion.footer>
      </main>
    </motion.div>
  );
};

export default ModuleSelector;