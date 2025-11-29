import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, TrendingUp, Users, Clock, Trophy, DollarSign } from 'lucide-react';
import axios from 'axios';

export default function AuctionRoom({ auctionId, buyerId, buyerName }) {
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [autoBidMax, setAutoBidMax] = useState(0);
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [isWinning, setIsWinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchAuction();
    const interval = setInterval(fetchAuction, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [auctionId]);

  useEffect(() => {
    if (auction) {
      setBidAmount(auction.currentBid + 5);
      setIsWinning(auction.currentBidder === buyerId);
      
      // Calculate time left
      const end = new Date(auction.endTime);
      const now = new Date();
      const diff = end - now;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }
  }, [auction, buyerId]);

  const fetchAuction = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/auction/${auctionId}`);
      setAuction(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const placeBid = async (amount) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/auction/${auctionId}/bid`, {
        bidderId: buyerId,
        bidderName,
        amount
      });
      fetchAuction();
    } catch (err) {
      console.error(err);
    }
  };

  const quickBid = (increment) => {
    const newAmount = auction.currentBid + increment;
    placeBid(newAmount);
  };

  if (!auction) {
    return <div className="text-center py-12">Loading auction...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Winning Flash */}
      <AnimatePresence>
        {isWinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-12 text-center shadow-2xl"
            >
              <Trophy className="w-24 h-24 mx-auto text-white mb-4" />
              <h2 className="text-4xl font-bold text-white mb-2">You're Winning!</h2>
              <p className="text-white/90 text-xl">Current highest bidder</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Auction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crop Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{auction.cropId.name}</h1>
                <p className="text-white/80">
                  {auction.cropId.quantity} {auction.cropId.unit} • {auction.cropId.quality} Grade
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Farmer: {auction.cropId.farmerName} • {auction.cropId.district}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Time Left</span>
                </div>
                <div className="text-2xl font-bold">{timeLeft}</div>
              </div>
            </div>

            {/* Current Bid */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-white/80 text-sm mb-2">Current Highest Bid</div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">₹{auction.currentBid}</span>
                <span className="text-xl text-white/60">/{auction.cropId.unit}</span>
              </div>
              {auction.currentBidder && (
                <div className="mt-3 text-white/70 text-sm">
                  {auction.currentBidder === buyerId ? 'You are winning!' : `Leading: ${auction.bids[auction.bids.length - 1]?.bidderName}`}
                </div>
              )}
            </div>
          </motion.div>

          {/* Bidding Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Place Your Bid</h3>

            {/* Quick Bid Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => quickBid(5)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
              >
                +₹5
              </button>
              <button
                onClick={() => quickBid(10)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                +₹10
              </button>
              <button
                onClick={() => quickBid(50)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                +₹50
              </button>
            </div>

            {/* Custom Bid */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Bid Amount
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter amount"
                />
                <button
                  onClick={() => placeBid(bidAmount)}
                  disabled={bidAmount <= auction.currentBid}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Gavel className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Auto-Bidder */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800">Auto-Bidder</h4>
                  <p className="text-sm text-gray-600">Set max limit and let AI bid for you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBidEnabled}
                    onChange={(e) => setAutoBidEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              {autoBidEnabled && (
                <input
                  type="number"
                  value={autoBidMax}
                  onChange={(e) => setAutoBidMax(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Max bid limit (₹)"
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Bid History */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Bid History</h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auction.bids.slice().reverse().map((bid, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl ${
                    bid.bidderId === buyerId
                      ? 'bg-purple-50 border-2 border-purple-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {bid.bidderName}
                        {bid.bidderId === buyerId && (
                          <span className="ml-2 text-xs text-purple-600">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      ₹{bid.amount}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-xl"
          >
            <TrendingUp className="w-8 h-8 mb-4" />
            <div className="text-3xl font-bold mb-2">
              {auction.bids.length}
            </div>
            <div className="text-white/80">Total Bids Placed</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
