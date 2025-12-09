import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ArrowLeft, Award, TrendingUp, Star, 
  Crown, Medal, Sparkles, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/leaderboard/top?limit=20`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalGradient = (rank) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-400 via-orange-500 to-orange-600';
    return 'from-[#082829] to-[#0a3a3c]';
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-white" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-white" />;
    if (rank === 3) return <Award className="w-6 h-6 text-white" />;
    return <span className="text-white font-bold text-lg">{rank}</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { text: 'CHAMPION', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (rank === 2) return { text: 'ELITE', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (rank === 3) return { text: 'MASTER', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: `#${rank}`, color: 'text-[#082829]', bg: 'bg-[#082829]/10' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e1e2d0] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#082829]/20 border-t-[#082829] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e1e2d0] relative overflow-hidden">

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#082829] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#082829] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="w-12 h-12 bg-white/40 backdrop-blur-xl rounded-2xl border border-[#082829]/20 flex items-center justify-center shadow-lg hover:bg-white/60 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#082829]" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold text-[#082829] flex items-center gap-3">
                <Trophy className="w-10 h-10 text-[#082829]" />
                Leaderboard
              </h1>
              <p className="text-[#082829]/60 mt-1">Top performing farmers this month</p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-2xl px-6 py-3 shadow-xl"
          >
            <div className="text-[#fbfbef]/70 text-sm">Total Farmers</div>
            <div className="text-[#fbfbef] text-2xl font-bold">{leaderboard.length}</div>
          </motion.div>
        </motion.div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center pt-12"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-2xl mb-4">
                    <Medal className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-gray-600">2</span>
                  </div>
                </motion.div>
                <div className="text-center mt-4 bg-white/40 backdrop-blur-xl rounded-2xl p-4 w-full border border-[#082829]/10">
                  <h3 className="font-bold text-[#082829] text-lg truncate">{leaderboard[1].name}</h3>
                  <p className="text-[#082829]/60 text-sm">{leaderboard[1]._id}</p>
                  <div className="mt-3 pt-3 border-t border-[#082829]/10">
                    <div className="text-2xl font-bold text-[#082829]">{leaderboard[1].totalSales}</div>
                    <div className="text-[#082829]/60 text-xs">Sales</div>
                  </div>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-3xl blur-xl opacity-50"
                  />
                  <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl mb-4">
                    <Crown className="w-20 h-20 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-3xl font-bold text-yellow-600">1</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </motion.div>
                </motion.div>
                <div className="text-center mt-4 bg-gradient-to-br from-yellow-50 to-white backdrop-blur-xl rounded-2xl p-5 w-full border-2 border-yellow-400/30 shadow-xl">
                  <div className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full mb-2">
                    CHAMPION
                  </div>
                  <h3 className="font-bold text-[#082829] text-xl truncate">{leaderboard[0].name}</h3>
                  <p className="text-[#082829]/60 text-sm">{leaderboard[0]._id}</p>
                  <div className="mt-3 pt-3 border-t border-yellow-400/20">
                    <div className="text-3xl font-bold text-[#082829]">{leaderboard[0].totalSales}</div>
                    <div className="text-[#082829]/60 text-xs">Sales</div>
                  </div>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center pt-12"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl mb-4">
                    <Award className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-orange-600">3</span>
                  </div>
                </motion.div>
                <div className="text-center mt-4 bg-white/40 backdrop-blur-xl rounded-2xl p-4 w-full border border-[#082829]/10">
                  <h3 className="font-bold text-[#082829] text-lg truncate">{leaderboard[2].name}</h3>
                  <p className="text-[#082829]/60 text-sm">{leaderboard[2]._id}</p>
                  <div className="mt-3 pt-3 border-t border-[#082829]/10">
                    <div className="text-2xl font-bold text-[#082829]">{leaderboard[2].totalSales}</div>
                    <div className="text-[#082829]/60 text-xs">Sales</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}


        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/40 backdrop-blur-xl rounded-3xl border border-[#082829]/20 shadow-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-gradient-to-r from-[#082829] to-[#0a3a3c] px-8 py-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#fbfbef]" />
              <div>
                <h2 className="text-2xl font-bold text-[#fbfbef]">Complete Rankings</h2>
                <p className="text-[#fbfbef]/70 text-sm">All farmers ranked by performance</p>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-[#082829]/30" />
                <h3 className="text-xl font-semibold text-[#082829] mb-2">No Sales Data Yet</h3>
                <p className="text-[#082829]/60">Start making sales to appear on the leaderboard!</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#082829]/5 border-b border-[#082829]/10">
                  <tr>
                    <th className="px-8 py-4 text-left text-[#082829] font-semibold text-sm uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-8 py-4 text-left text-[#082829] font-semibold text-sm uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-8 py-4 text-left text-[#082829] font-semibold text-sm uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th className="px-8 py-4 text-left text-[#082829] font-semibold text-sm uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-8 py-4 text-left text-[#082829] font-semibold text-sm uppercase tracking-wider">
                      Avg Rating
                    </th>
                    <th className="px-8 py-4 text-left text-[#082829] font-semibold text-sm uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {leaderboard.map((farmer, index) => {
                      const rank = index + 1;
                      const badge = getRankBadge(rank);
                      
                      return (
                        <motion.tr
                          key={farmer._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          whileHover={{ backgroundColor: 'rgba(8, 40, 41, 0.05)', x: 5 }}
                          className="border-b border-[#082829]/5 cursor-pointer transition-all"
                          onClick={() => setSelectedFarmer(farmer)}
                        >
                          {/* Rank */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getMedalGradient(rank)} flex items-center justify-center shadow-lg`}>
                                {getMedalIcon(rank)}
                              </div>
                            </div>
                          </td>

                          {/* Farmer Info */}
                          <td className="px-8 py-5">
                            <div>
                              <div className="text-[#082829] font-semibold text-lg">{farmer.name}</div>
                              <div className="text-[#082829]/60 text-sm font-mono">{farmer._id}</div>
                            </div>
                          </td>

                          {/* Total Sales */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="text-[#082829] font-bold text-xl">{farmer.totalSales}</div>
                              <div className="text-[#082829]/60 text-sm">orders</div>
                            </div>
                          </td>

                          {/* Revenue */}
                          <td className="px-8 py-5">
                            <div className="text-[#082829] font-semibold text-lg">
                              ₹{farmer.totalRevenue?.toLocaleString() || '0'}
                            </div>
                          </td>

                          {/* Rating */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                              <span className="text-[#082829] font-semibold">
                                {farmer.avgRating ? farmer.avgRating.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-8 py-5">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg} ${badge.color} font-bold text-sm`}>
                              {rank <= 3 && <Sparkles className="w-4 h-4" />}
                              {badge.text}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-6 mt-8"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-white/80 text-sm mb-2">Total Sales</div>
              <div className="text-4xl font-bold">
                {leaderboard.reduce((sum, f) => sum + f.totalSales, 0)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-white/80 text-sm mb-2">Total Revenue</div>
              <div className="text-4xl font-bold">
                ₹{leaderboard.reduce((sum, f) => sum + (f.totalRevenue || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-white/80 text-sm mb-2">Avg Rating</div>
              <div className="text-4xl font-bold flex items-center gap-2">
                <Star className="w-8 h-8 fill-current" />
                {(leaderboard.reduce((sum, f) => sum + (f.avgRating || 0), 0) / leaderboard.length).toFixed(1)}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Farmer Detail Modal */}
      <AnimatePresence>
        {selectedFarmer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFarmer(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${getMedalGradient(selectedFarmer.rank)} flex items-center justify-center shadow-xl mb-4`}>
                  {getMedalIcon(selectedFarmer.rank)}
                </div>
                <h3 className="text-2xl font-bold text-[#082829] mb-2">{selectedFarmer.name}</h3>
                <p className="text-[#082829]/60 font-mono text-sm mb-6">{selectedFarmer._id}</p>
                
                <div className="space-y-4">
                  <div className="bg-[#fbfbef] rounded-2xl p-4">
                    <div className="text-[#082829]/60 text-sm">Total Sales</div>
                    <div className="text-3xl font-bold text-[#082829]">{selectedFarmer.totalSales}</div>
                  </div>
                  <div className="bg-[#fbfbef] rounded-2xl p-4">
                    <div className="text-[#082829]/60 text-sm">Total Revenue</div>
                    <div className="text-3xl font-bold text-[#082829]">
                      ₹{selectedFarmer.totalRevenue?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div className="bg-[#fbfbef] rounded-2xl p-4">
                    <div className="text-[#082829]/60 text-sm">Average Rating</div>
                    <div className="text-3xl font-bold text-[#082829] flex items-center justify-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      {selectedFarmer.avgRating ? selectedFarmer.avgRating.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="mt-6 w-full bg-[#082829] text-white py-3 rounded-xl font-semibold hover:bg-[#0a3a3c] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;
