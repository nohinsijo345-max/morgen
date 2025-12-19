import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Camera, 
  Upload, 
  Loader, 
  MessageCircle, 
  Stethoscope,
  Image as ImageIcon,
  Trash2,
  Bot,
  User as UserIcon,
  Leaf
} from 'lucide-react';
import axios from 'axios';
import { UserSession } from '../../utils/userSession';

export default function AIPlantDoctor() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [chatStats, setChatStats] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const farmerId = UserSession.getFarmerId();
    if (farmerId) {
      loadChatSession();
    } else {
      console.log('⚠️ No farmerId found in session for AI Doctor');
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatSession = async () => {
    try {
      setChatLoading(true);
      const farmerId = UserSession.getFarmerId();
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session');
        return;
      }
      
      console.log('✅ Loading AI Doctor chat for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/ai-doctor/chat/${farmerId}`);
      
      setMessages(response.data.messages || []);
      setChatStats(response.data.sessionStats || {});
    } catch (error) {
      console.error('Failed to load chat session:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !imageFile) return;

    const farmerId = UserSession.getFarmerId();
    if (!farmerId) {
      console.log('⚠️ No farmerId found in session');
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

      if (imageFile) {
        // Send image with question
        const formData = new FormData();
        formData.append('plantImage', imageFile);
        formData.append('question', messageText || 'Please analyze this plant image');

        const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${farmerId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setMessages(prev => [...prev, response.data.userMessage, response.data.assistantMessage]);
        setChatStats(response.data.sessionStats);
        
        // Clear image
        setImageFile(null);
        setImagePreview(null);
      } else {
        // Send text message with unique ID to prevent caching
        const uniqueMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_user`;
        
        const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${farmerId}/message`, {
          message: messageText,
          messageId: uniqueMessageId
        });

        // Add user message first, then AI response
        const userMessage = {
          id: uniqueMessageId,
          role: 'user',
          content: messageText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage, response.data.message]);
        setChatStats(response.data.sessionStats);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: '🌱 Sorry, I encountered an error. Please try again or ask me about your farming needs.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearChat = async () => {
    try {
      const farmerId = UserSession.getFarmerId();
      if (!farmerId) return;
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/ai-doctor/chat/${farmerId}/clear`);
      await loadChatSession();
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (chatLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-300/20 border-t-emerald-300 rounded-full"
        />
        <p className="mt-4 text-emerald-100">Loading AI Plant Doctor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 bg-gradient-to-r from-emerald-800/30 to-green-800/30 backdrop-blur-xl border-b border-emerald-600/20 shadow-2xl"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="p-2 bg-emerald-700/50 hover:bg-emerald-600/50 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-emerald-100" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-100">AI Plant Doctor</h1>
                  <p className="text-emerald-300 text-sm">Your agricultural health expert</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-emerald-200 text-sm font-medium">
                  {chatStats.questionsAsked || 0} consultations
                </p>
                <p className="text-emerald-300 text-xs">
                  {chatStats.imagesAnalyzed || 0} images analyzed
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChat}
                className="p-2 bg-red-600/50 hover:bg-red-500/50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5 text-red-200" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 bg-gradient-to-br from-emerald-800/20 to-green-800/20 backdrop-blur-xl rounded-3xl border border-emerald-600/20 shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-emerald-600 to-green-600' 
                            : 'bg-gradient-to-br from-teal-600 to-emerald-600'
                        }`}>
                          {message.role === 'user' ? (
                            <UserIcon className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-emerald-600 to-green-600 text-white'
                              : 'bg-gradient-to-br from-emerald-50/90 to-green-50/90 text-emerald-900 border border-emerald-200/50'
                          }`}>
                            {/* Image if present */}
                            {message.hasImage && message.imageUrl && (
                              <div className="mb-3">
                                <img 
                                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${message.imageUrl}`}
                                  alt="Plant analysis" 
                                  className="max-w-xs rounded-xl shadow-md"
                                />
                              </div>
                            )}
                            
                            {/* Message text */}
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                          
                          {/* Timestamp */}
                          <div className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-emerald-300' : 'text-emerald-400'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50/90 to-green-50/90 px-4 py-3 rounded-2xl shadow-lg border border-emerald-200/50">
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-emerald-700 text-sm">AI Doctor is analyzing...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-emerald-600/20">
              {/* Image Preview */}
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 relative inline-block"
                >
                  <img 
                    src={imagePreview} 
                    alt="Plant to analyze" 
                    className="max-h-32 rounded-xl shadow-lg border border-emerald-300/50"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <span className="text-white text-xs">×</span>
                  </button>
                </motion.div>
              )}

              {/* Input Row */}
              <div className="flex items-end gap-3">
                {/* Image Upload Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl shadow-lg transition-all"
                >
                  <Camera className="w-5 h-5 text-white" />
                </motion.button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask about plant diseases, crop care, or upload an image..."
                    className="w-full px-4 py-3 bg-emerald-50/90 border border-emerald-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-emerald-900 placeholder-emerald-600/70"
                    rows="2"
                    disabled={loading}
                  />
                </div>

                {/* Send Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || (!newMessage.trim() && !imageFile)}
                  className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all"
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
