require('dotenv').config();

console.log('Environment Check:');
console.log('GEMINI_API_KEY configured:', !!process.env.GEMINI_API_KEY);
console.log('MONGO_URI configured:', !!process.env.MONGO_URI);

if (process.env.GEMINI_API_KEY) {
  console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY.length);
} else {
  console.log('⚠️  GEMINI_API_KEY not found - AI responses will use fallback');
}