import { Truck, ArrowLeft } from 'lucide-react';

const LocalTransport = () => {
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
          <h1 className="text-3xl font-bold text-[#082829]">Local Transport</h1>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-lg">
          <div className="text-center py-12">
            <Truck className="w-24 h-24 text-[#082829]/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#082829] mb-4">Transport Services</h2>
            <p className="text-[#082829]/70">Find the best transport options for your crops</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalTransport;