import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AIPlantDoctor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [language, setLanguage] = useState('english');

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePlant = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.post(`${API_URL}/api/ai/plant-doctor`, {
        imageBase64: preview,
        language
      });
      setDiagnosis(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-green-600 rounded-2xl">
            <Camera className="w-8 h-8 text-[#fbfbef]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">AI Plant Doctor</h2>
            <p className="text-gray-600">Instant disease diagnosis powered by AI</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="english">English</option>
            <option value="malayalam">മലയാളം</option>
            <option value="hindi">हिंदी</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="mb-8">
          <label className="block w-full">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
            <div className="border-2 border-dashed border-green-300 rounded-2xl p-12 text-center cursor-pointer hover:border-green-500 transition-colors">
              {preview ? (
                <img src={preview} alt="Plant" className="max-h-64 mx-auto rounded-xl" />
              ) : (
                <div>
                  <Upload className="w-16 h-16 mx-auto text-green-600 mb-4" />
                  <p className="text-gray-600 font-medium">
                    Click to capture or upload plant image
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Analyze Button */}
        {preview && !diagnosis && (
          <button
            onClick={analyzePlant}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-[#fbfbef] font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Analyze Plant
              </>
            )}
          </button>
        )}

        {/* Diagnosis Results */}
        {diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {diagnosis.disease}
                  </h3>
                  <p className="text-gray-600 mb-4">{diagnosis.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">Confidence:</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${diagnosis.confidence * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {(diagnosis.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h4 className="text-lg font-bold text-green-800 mb-3">
                💊 Recommended Treatment
              </h4>
              <p className="text-green-900 font-medium mb-4">{diagnosis.remedy}</p>
              
              <h5 className="font-semibold text-green-800 mb-2">Preventive Measures:</h5>
              <ul className="space-y-2">
                {diagnosis.preventiveMeasures.map((measure, i) => (
                  <li key={i} className="flex items-start gap-2 text-green-900">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setDiagnosis(null);
                setPreview(null);
                setImage(null);
              }}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Analyze Another Plant
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
