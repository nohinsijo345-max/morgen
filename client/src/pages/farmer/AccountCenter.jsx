import { useState, useEffect } from 'react';
import { User, Edit, Save, ArrowLeft } from 'lucide-react';

const AccountCenter = () => {
  const [farmer, setFarmer] = useState(null);
  const [editing, setEditing] = useState(false);

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
          <h1 className="text-3xl font-bold text-[#082829]">Account Center</h1>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-[#082829]/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-[#082829]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#082829]">Farmer Profile</h2>
              <p className="text-[#082829]/70">Manage your account information</p>
            </div>
          </div>

          {/* Profile form will be implemented later */}
          <div className="text-center py-12 text-[#082829]/70">
            Account management features coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCenter;