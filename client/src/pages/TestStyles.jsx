export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-6">
          If you can see this styled properly with a purple gradient background,
          white card, and proper typography, then Tailwind CSS is working!
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 text-white p-4 rounded-xl text-center font-bold">
            Red
          </div>
          <div className="bg-green-500 text-white p-4 rounded-xl text-center font-bold">
            Green
          </div>
          <div className="bg-blue-500 text-white p-4 rounded-xl text-center font-bold">
            Blue
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/dashboard" 
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
