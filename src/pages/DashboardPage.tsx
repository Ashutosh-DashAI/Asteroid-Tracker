import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useNotifications } from '@/components/notifications/Toast';
import ChatInterface from '@/components/chat/ChatInterface';
import { MessageSquare, Plus } from 'lucide-react';

/**
 * Dashboard Page Component
 * Main chat interface and conversation list
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { chats, selectedChatId, selectChat, fetchChats, loading } = useChatStore();
  const { info } = useNotifications();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      selectChat(chats[0].id);
    }
  }, [chats, selectedChatId, selectChat]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="h-full flex gap-6 p-6">
      {/* Conversations List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-80 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-white/60 text-sm">
              {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => info('New chat feature coming soon!')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <Plus size={20} className="text-white/70 group-hover:text-white transition-colors" />
          </motion.button>
        </div>

        {/* Conversations Container */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && chats.length === 0 ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center justify-center h-40"
            >
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </motion.div>
          ) : chats.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="h-40 flex flex-col items-center justify-center text-white/60"
            >
              <MessageSquare size={32} className="mb-4 text-white/30" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start chatting to see them here</p>
            </motion.div>
          ) : (
            chats.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              return (
                <motion.button
                  key={chat.id}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 border ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                      {chat.participant.avatar ? (
                        <img
                          src={chat.participant.avatar}
                          alt={chat.participant.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        chat.participant.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {chat.participant.name}
                        </h3>
                        {chat.unreadCount > 0 && (
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold flex-shrink-0">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {chat.lastMessageTime &&
                          new Date(chat.lastMessageTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Chat Interface */}
      {selectedChat ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden lg:flex flex-1 rounded-2xl overflow-hidden bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-xl"
        >
          <ChatInterface
            chatId={selectedChat.id}
            recipientName={selectedChat.participant.name}
            recipientAvatar={selectedChat.participant.avatar}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:flex flex-1 rounded-2xl border border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/5 to-transparent items-center justify-center"
        >
          <div className="text-center">
            <MessageSquare size={48} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Select a conversation to start messaging</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
