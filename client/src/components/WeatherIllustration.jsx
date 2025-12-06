import { motion } from 'framer-motion';

const WeatherIllustration = ({ condition }) => {
  const renderSunnyIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Sun */}
      <motion.circle
        cx="100"
        cy="60"
        r="25"
        fill="#FDB813"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.line
          key={i}
          x1={100 + Math.cos((angle * Math.PI) / 180) * 35}
          y1={60 + Math.sin((angle * Math.PI) / 180) * 35}
          x2={100 + Math.cos((angle * Math.PI) / 180) * 45}
          y2={60 + Math.sin((angle * Math.PI) / 180) * 45}
          stroke="#FDB813"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}

      {/* Ground */}
      <rect x="0" y="150" width="200" height="50" fill="#082829" opacity="0.1" />
      
      {/* Farmer figure */}
      <motion.g
        animate={{
          x: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Body */}
        <ellipse cx="100" cy="140" rx="8" ry="15" fill="#082829" opacity="0.7" />
        {/* Head */}
        <circle cx="100" cy="120" r="6" fill="#082829" opacity="0.7" />
        {/* Hat */}
        <ellipse cx="100" cy="118" rx="10" ry="3" fill="#082829" opacity="0.7" />
        {/* Tool */}
        <motion.line
          x1="108"
          y1="135"
          x2="115"
          y2="145"
          stroke="#082829"
          strokeWidth="2"
          opacity="0.7"
          animate={{
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{ originX: '108px', originY: '135px' }}
        />
      </motion.g>

      {/* Crops/Plants */}
      {[30, 50, 150, 170].map((x, i) => (
        <motion.g
          key={i}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          <line x1={x} y1="150" x2={x} y2="140" stroke="#082829" strokeWidth="2" opacity="0.3" />
          <circle cx={x} cy="138" r="3" fill="#082829" opacity="0.3" />
        </motion.g>
      ))}
    </svg>
  );

  const renderRainyIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Rain clouds */}
      <motion.g
        animate={{
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ellipse cx="80" cy="50" rx="25" ry="15" fill="#082829" opacity="0.3" />
        <ellipse cx="100" cy="45" rx="30" ry="18" fill="#082829" opacity="0.3" />
        <ellipse cx="120" cy="50" rx="25" ry="15" fill="#082829" opacity="0.3" />
      </motion.g>

      {/* Rain drops */}
      {[40, 60, 80, 100, 120, 140, 160].map((x, i) => (
        <motion.line
          key={i}
          x1={x}
          y1="70"
          x2={x}
          y2="85"
          stroke="#4A90E2"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          animate={{
            y: [0, 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "linear"
          }}
        />
      ))}

      {/* Ground with puddles */}
      <rect x="0" y="150" width="200" height="50" fill="#082829" opacity="0.1" />
      <ellipse cx="50" cy="150" rx="15" ry="3" fill="#4A90E2" opacity="0.3" />
      <ellipse cx="150" cy="150" rx="20" ry="3" fill="#4A90E2" opacity="0.3" />

      {/* Person with umbrella */}
      <motion.g
        animate={{
          x: [-20, 20],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        {/* Umbrella */}
        <motion.path
          d="M 100 110 Q 85 105 85 100 Q 85 95 100 95 Q 115 95 115 100 Q 115 105 100 110"
          fill="#E74C3C"
          opacity="0.8"
          animate={{
            rotate: [0, -5, 0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          style={{ originX: '100px', originY: '110px' }}
        />
        {/* Umbrella handle */}
        <line x1="100" y1="110" x2="100" y2="120" stroke="#082829" strokeWidth="2" opacity="0.7" />
        
        {/* Body */}
        <ellipse cx="100" cy="135" rx="7" ry="12" fill="#082829" opacity="0.7" />
        {/* Head */}
        <circle cx="100" cy="118" r="5" fill="#082829" opacity="0.7" />
        
        {/* Legs walking */}
        <motion.line
          x1="100"
          y1="147"
          x2="95"
          y2="155"
          stroke="#082829"
          strokeWidth="2"
          opacity="0.7"
          animate={{
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          style={{ originX: '100px', originY: '147px' }}
        />
        <motion.line
          x1="100"
          y1="147"
          x2="105"
          y2="155"
          stroke="#082829"
          strokeWidth="2"
          opacity="0.7"
          animate={{
            rotate: [0, -10, 0, 10, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          style={{ originX: '100px', originY: '147px' }}
        />
      </motion.g>
    </svg>
  );

  const renderCloudyIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Multiple clouds at different depths */}
      <motion.g
        animate={{
          x: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ellipse cx="60" cy="40" rx="20" ry="12" fill="#082829" opacity="0.15" />
        <ellipse cx="80" cy="35" rx="25" ry="15" fill="#082829" opacity="0.15" />
        <ellipse cx="100" cy="40" rx="20" ry="12" fill="#082829" opacity="0.15" />
      </motion.g>

      <motion.g
        animate={{
          x: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ellipse cx="100" cy="60" rx="25" ry="15" fill="#082829" opacity="0.25" />
        <ellipse cx="120" cy="55" rx="30" ry="18" fill="#082829" opacity="0.25" />
        <ellipse cx="140" cy="60" rx="25" ry="15" fill="#082829" opacity="0.25" />
      </motion.g>

      {/* Ground */}
      <rect x="0" y="150" width="200" height="50" fill="#082829" opacity="0.1" />

      {/* Farmer looking up */}
      <motion.g
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Body */}
        <ellipse cx="100" cy="140" rx="8" ry="15" fill="#082829" opacity="0.7" />
        {/* Head tilted up */}
        <ellipse cx="100" cy="120" rx="6" ry="7" fill="#082829" opacity="0.7" />
        {/* Hat */}
        <ellipse cx="100" cy="118" rx="10" ry="3" fill="#082829" opacity="0.7" />
        {/* Arm pointing up */}
        <motion.line
          x1="100"
          y1="130"
          x2="110"
          y2="115"
          stroke="#082829"
          strokeWidth="2"
          opacity="0.7"
          animate={{
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{ originX: '100px', originY: '130px' }}
        />
      </motion.g>

      {/* Wind lines */}
      {[90, 110, 130].map((y, i) => (
        <motion.line
          key={i}
          x1="20"
          y1={y}
          x2="50"
          y2={y}
          stroke="#082829"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.2"
          animate={{
            x: [0, 30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Birds */}
      {[{ x: 140, y: 80 }, { x: 160, y: 75 }].map((pos, i) => (
        <motion.path
          key={i}
          d={`M ${pos.x} ${pos.y} Q ${pos.x + 5} ${pos.y - 3} ${pos.x + 10} ${pos.y} M ${pos.x + 10} ${pos.y} Q ${pos.x + 15} ${pos.y - 3} ${pos.x + 20} ${pos.y}`}
          stroke="#082829"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          animate={{
            x: [0, -100],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
          }}
        />
      ))}
    </svg>
  );

  switch (condition) {
    case 'rainy':
      return renderRainyIllustration();
    case 'cloudy':
      return renderCloudyIllustration();
    case 'sunny':
    default:
      return renderSunnyIllustration();
  }
};

export default WeatherIllustration;
