import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Upload,
  Mic,
  MoreHorizontal,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI insurance document processing assistant. Upload a document or describe what you need help with, and I\'ll guide you through the process.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I understand you want to: "${inputMessage}". I can help you process insurance documents, analyze policies, extract key information, and guide you through claims. What specific document would you like to work with?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Chat cleared! I\'m ready to help you with a new document processing task.',
        timestamp: new Date()
      }
    ]);
    
    toast({
      type: 'success',
      title: 'Chat Cleared',
      description: 'Ready for new conversation'
    });
  };

  const MessageBubble = ({ message }) => {
    const isBot = message.type === 'bot';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6`}
      >
        <div className={`flex items-start space-x-3 max-w-3xl ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isBot 
                ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' 
                : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
            }`}
          >
            {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`relative px-6 py-4 rounded-2xl shadow-sm ${
              isBot 
                ? 'bg-white border border-gray-200' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
            }`}
          >
            <p className={`text-sm leading-relaxed ${isBot ? 'text-gray-900' : 'text-white'}`}>
              {message.content}
            </p>
            
            <div className={`mt-2 text-xs ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Tail */}
            <div className={`absolute top-4 ${
              isBot 
                ? '-left-2 border-r-gray-200 border-r-8 border-t-transparent border-b-transparent border-t-4 border-b-4' 
                : '-right-2 border-l-blue-600 border-l-8 border-t-transparent border-b-transparent border-t-4 border-b-4'
            }`} />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-6"
    >
      <div className="flex items-start space-x-3 max-w-3xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoBack}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">AI Document Processor</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Intelligent insurance document analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleClearChat}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-clear-chat"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Clear Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto py-8 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { icon: FileText, text: 'Analyze Policy', color: 'from-blue-500 to-blue-600' },
              { icon: Upload, text: 'Upload Document', color: 'from-green-500 to-green-600' },
              { icon: Sparkles, text: 'Extract Data', color: 'from-purple-500 to-purple-600' }
            ].map((action, index) => (
              <motion.button
                key={action.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                onClick={() => setInputMessage(action.text)}
                data-testid={`quick-action-${action.text.toLowerCase().replace(' ', '-')}`}
              >
                <action.icon className="w-4 h-4" />
                <span>{action.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-4 mb-6"
        >
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your document processing needs or ask any question..."
                className="w-full resize-none border-0 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500 text-sm leading-relaxed max-h-32"
                rows={2}
                disabled={isLoading}
                data-testid="input-message"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                variant="primary"
                size="md"
                className="rounded-xl"
                data-testid="button-send"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="white" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="bg-white/50 backdrop-blur-lg border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>AI Agent Active</span>
            </span>
            <span>Session: New</span>
          </div>
          <div>
            Welcome, {user?.firstName || user?.email || 'User'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;