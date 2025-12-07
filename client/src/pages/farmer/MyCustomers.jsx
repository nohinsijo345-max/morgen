import { useState, useEffect } from 'react';
import { Users, ArrowLeft, Plus } from 'lucide-react';

const MyCustomers = () => {
  const [customers, setCustomers] = useState([]);

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
          <h1 className="text-3xl font-bold text-[#082829]">My Customers</h1>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-[#082829]" />
              <div>
                <h2 className="text-2xl font-bold text-[#082829]">Customer List</h2>
                <p className="text-[#082829]/70">Manage your customer relationships</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-[#082829] text-[#fbfbef] px-4 py-2 rounded-xl hover:bg-[#082829]/90">
              <Plus className="w-5 h-5" />
              Add Customer
            </button>
          </div>

          <div className="text-center py-12 text-[#082829]/70">
            Customer management features coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCustomers;