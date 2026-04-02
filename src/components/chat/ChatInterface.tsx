import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Smile, Zap } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import type { Message } from '@/types';

interface ChatInterfaceProps {
  chatId: string;
  recipientName: string;
  recipientAvatar?: string;
}

/**
 * Chat Interface Component
 * Features:
 * - Real-time message display with animations
 * - Message input with emoji support
 * - Typing indicators
 * - Auto-scroll to latest messages
 * - Smooth message animations
 * - File attachment UI
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatId,
  recipientName,
  recipientAvatar,
}) => {
  const { user } = useAuthStore();
  const { messages, sendMessage, addMessage, typing } = useChatStore();
  const { emit, on } = useSocket();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages
  useSocketEvent('message:received', (data: any) => {
    addMessage(data);
  });

  // Listen for typing indicators
  useSocketEvent('typing', (data: any) => {
    if (data.userId !== user?.id) {
      setIsTyping(true);
    }
  });

  useSocketEvent('stop:typing', (data: any) => {
    if (data.userId !== user?.id) {
      setIsTyping(false);
    }
  });

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Emit typing event
    emit('typing', { chatId, userId: user?.id });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit stop typing
    typingTimeoutRef.current = setTimeout(() => {
      emit('stop:typing', { chatId, userId: user?.id });
    }, 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || loading) return;

    try {
      setLoading(true);
      const trimmedMessage = messageInput.trim();
      setMessageInput('');
      
      // Emit typing stop
      emit('stop:typing', { chatId, userId: user?.id });

      await sendMessage(chatId, trimmedMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300 } },
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white/5 to-transparent">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {recipientAvatar ? (
            <img
              src={recipientAvatar}
              alt={recipientName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            recipientName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">{recipientName}</h2>
          <p className="text-xs text-white/60">Active now</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="w-8 h-8 text-indigo-500" />
            </motion.div>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-4">
              <Smile className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-white/60">Start a conversation with {recipientName}</p>
          </motion.div>
        )}

        {messages.map((message) => {
          const isSentByUser = message.senderId === user?.id;

          return (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-xl ${
                  isSentByUser
                    ? 'bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/50 rounded-br-none'
                    : 'bg-white/10 border border-white/20 rounded-bl-none'
                }`}
              >
                <p
                  className={`text-sm ${
                    isSentByUser ? 'text-white' : 'text-white'
                  } break-words`}
                >
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isSentByUser ? 'text-indigo-200/60' : 'text-white/50'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs text-white/60">T</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [-4, 4, -4] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-2 h-2 rounded-full bg-white/50"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent backdrop-blur-xl p-6"
      >
        <div className="flex gap-3 items-end">
          {/* Input Container */}
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={handleTyping}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder-white/40 outline-none resize-none transition-all duration-300 backdrop-blur-xl max-h-24"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="p-3 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <Paperclip size={20} className="text-white/60 group-hover:text-white transition-colors" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="p-3 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <Smile size={20} className="text-white/60 group-hover:text-white transition-colors" />
          </motion.button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!messageInput.trim() || loading}
            className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300"
          >
            <Send size={20} className="text-white" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
