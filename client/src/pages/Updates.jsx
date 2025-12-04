import { useState, useEffect } from 'react';
import { Bell, ArrowLeft } from 'lucide-react';

const Updates = () => {
  const [updates, setUpdates] = useState([]);

  return (
    <div className="min-h-screen bg-[#fbfbef] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30"
          >
            <ArrowLeft className="w-5 h-5 text-[#082829]" />
          </button>
          <h1 className="text-3xl font-bold text-[#082829]">Government Updates</h1>
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
              <div className="flex items-start gap-4">
                <Bell className="w-6 h-6 text-[#082829] mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#082829] mb-2">
                    Update Title {item}
                  </h3>
                  <p className="text-[#082829]/70 mb-4">
                    This is a sample government update message that provides important information to farmers...
                  </p>
                  <div className="text-sm text-[#082829]/50">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Updates;