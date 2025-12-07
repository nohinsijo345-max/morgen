import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Bell, TrendingUp, Calendar } from 'lucide-react';

export default function HarvestCountdown({ crop }) {
  const [daysLeft, setDaysLeft] = useState(0);
  const [autoNotified, setAutoNotified] = useState(false);

  useEffect(() => {
    if (crop.harvestDate) {
      const calculateDays = () => {
        const today = new Date();
        const harvest = new Date(crop.harvestDate);
        const days = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
        setDaysLeft(days);

        // Auto-notify at 3 days
        if (days === 3 && !autoNotified) {
          notifyBuyers();
          setAutoNotified(true);
        }
      };

      calculateDays();
      const interval = setInterval(calculateDays, 1000 * 60 * 60); // Update every hour

      return () => clearInterval(interval);
    }
  }, [crop.harvestDate, autoNotified]);

  const notifyBuyers = async () => {
    // TODO: Send notification to buyers
    console.log('Notifying buyers about upcoming harvest');
  };

  const getStatusColor = () => {
    if (daysLeft <= 3) return 'from-red-500 to-orange-500';
    if (daysLeft <= 7) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-[#fbfbef] shadow-2xl"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{crop.name}</h3>
              <p className="text-[#fbfbef]/80 text-sm">Harvest Countdown</p>
            </div>
          </div>
          {daysLeft <= 3 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-2 bg-red-500 rounded-full"
            >
              <Bell className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        {/* Countdown Display */}
        <div className="text-center my-8">
          <motion.div
            key={daysLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-block bg-gradient-to-r ${getStatusColor()} rounded-2xl p-8 shadow-xl`}
          >
            <div className="text-7xl font-bold mb-2">{daysLeft}</div>
            <div className="text-xl font-medium">Days to Harvest</div>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Calendar className="w-5 h-5 mb-2 text-[#fbfbef]/80" />
            <div className="text-sm text-[#fbfbef]/80">Harvest Date</div>
            <div className="font-semibold">
              {new Date(crop.harvestDate).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <TrendingUp className="w-5 h-5 mb-2 text-[#fbfbef]/80" />
            <div className="text-sm text-[#fbfbef]/80">Expected Yield</div>
            <div className="font-semibold">{crop.quantity} {crop.unit}</div>
          </div>
        </div>

        {/* Auto-notify status */}
        {daysLeft <= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-green-500/20 border border-green-400/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">
                Buyers have been notified! Expect pre-booking requests soon.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
