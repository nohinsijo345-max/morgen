import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  return (
    <div className="min-h-screen bg-[#fbfbef] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30"
          >
            <ArrowLeft className="w-5 h-5 text-[#082829]" />
          </button>
          <h1 className="text-3xl font-bold text-[#082829]">Leaderboard</h1>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-[#082829]" />
              <div>
                <h2 className="text-2xl font-bold text-[#082829]">Top Farmers This Month</h2>
                <p className="text-[#082829]/70">Based on sales performance and customer ratings</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#082829]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-[#082829] font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-[#082829] font-semibold">Farmer</th>
                  <th className="px-6 py-4 text-left text-[#082829] font-semibold">Total Sales</th>
                  <th className="px-6 py-4 text-left text-[#082829] font-semibold">Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
                  <tr key={rank} className="border-b border-white/10 hover:bg-white/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {rank <= 3 ? (
                          <Medal className={`w-6 h-6 ${
                            rank === 1 ? 'text-yellow-500' :
                            rank === 2 ? 'text-gray-400' :
                            'text-orange-500'
                          }`} />
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center text-[#082829] font-bold">
                            {rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#082829] font-medium">Farmer {rank}</div>
                      <div className="text-[#082829]/70 text-sm">FAR-100{rank}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#082829] font-semibold">
                        ₹{(50000 - rank * 3000).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-[#082829]">{(5 - rank * 0.2).toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;