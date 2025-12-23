import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Wheat,
  CircleDollarSign,
  Banknote,
  CreditCard,
  Sprout,
  Apple
} from 'lucide-react';

const BuyerDecorativeElements = ({ colors, isDarkMode }) => {
  const elements = [
    // Money/Financial Icons
    { icon: CircleDollarSign, x: '10%', y: '15%', delay: 0.2, size: 24 },
    { icon: DollarSign, x: '85%', y: '20%', delay: 0.4, size: 20 },
    { icon: TrendingUp, x: '15%', y: '75%', delay: 0.6, size: 22 },
    { icon: Banknote, x: '80%', y: '70%', delay: 0.8, size: 26 },
    { icon: CreditCard, x: '90%', y: '45%', delay: 1.2, size: 24 },
    { icon: ShoppingCart, x: '12%', y: '85%', delay: 1.4, size: 22 },
    
    // Farming/Crop Icons
    { icon: Wheat, x: '75%', y: '15%', delay: 0.3, size: 30 },
    { icon: Sprout, x: '20%', y: '25%', delay: 0.5, size: 26 },
    { icon: Apple, x: '85%', y: '60%', delay: 0.7, size: 24 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element, index) => {
        const IconComponent = element.icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: element.x,
              top: element.y,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isDarkMode ? 0.08 : 0.06, 
              scale: 1
            }}
            transition={{ 
              delay: element.delay, 
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 4 + (index * 0.5), 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <IconComponent 
                size={element.size} 
                style={{ color: colors.primary }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BuyerDecorativeElements;