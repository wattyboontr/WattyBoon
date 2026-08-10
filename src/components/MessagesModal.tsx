import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Search, User as UserIcon, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import { User } from '../types';

export const MessagesModal: React.FC = () => {
  const {
    currentUser,
    users,
    messages,
    sendDirectMessage,
    markMessagesAsRead,
    isMessagingOpen,
    activeMessagingUserId,
    openMessagingWithUser,
    closeMessaging,
    openAuthorProfile,
  } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(activeMessagingUserId);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileView, setMobileView] = useState<'contacts' | 'chat'>('contacts');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get list of potential message contacts
  const contacts = React.useMemo(() => {
    if (!currentUser) return [];
    const contactIds = new Set<string>();

    messages.forEach((m) => {
      if (m.senderId === currentUser.id) contactIds.add(m.receiverId);
      if (m.receiverId === currentUser.id) contactIds.add(m.senderId);
    });

    currentUser.following?.forEach((id) => contactIds.add(id));
    currentUser.followers?.forEach((id) => contactIds.add(id));

    return users
      .filter((u) => u.id !== currentUser.id && contactIds.has(u.id))
      .filter((u) => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [currentUser, messages, users, searchQuery]);

  // Sync selected user when activeMessagingUserId changes
  useEffect(() => {
    if (activeMessagingUserId) {
      setSelectedUserId(activeMessagingUserId);
      setMobileView('chat');
    } else if (!selectedUserId && currentUser && contacts.length > 0) {
      setSelectedUserId(contacts[0].id);
    }
  }, [activeMessagingUserId, isMessagingOpen, contacts, currentUser, selectedUserId]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (selectedUserId && isMessagingOpen) {
      markMessagesAsRead(selectedUserId);
    }
  }, [selectedUserId, isMessagingOpen, messages]);

  // Scroll to bottom of message thread
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUserId, messages, mobileView]);

  if (!isMessagingOpen || !currentUser) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId) || (contacts[0] || null);

  const conversationMessages = selectedUser
    ? messages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === selectedUser.id) ||
          (m.senderId === selectedUser.id && m.receiverId === currentUser.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;
    sendDirectMessage(selectedUser.id, inputText.trim());
    setInputText('');
  };

  const handleQuickGreeting = (text: string) => {
    if (!selectedUser) return;
    sendDirectMessage(selectedUser.id, text);
  };

  const getLastMessageInfo = (contactId: string) => {
    const chatMsgs = messages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === contactId) ||
          (m.senderId === contactId && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const lastMsg = chatMsgs[0];
    const unreadCount = chatMsgs.filter((m) => m.senderId === contactId && !m.isRead).length;

    return { lastMsg, unreadCount };
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] max-h-[720px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            {/* Mobile Back Button to Contacts */}
            {mobileView === 'chat' && (
              <button
                onClick={() => setMobileView('contacts')}
                className="sm:hidden p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors mr-1"
                title="Kişilere Dön"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Doğrudan Mesajlar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Takipçilerin ve okurlarınla sohbet et
              </p>
            </div>
          </div>

          <button
            onClick={closeMessaging}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Responsive 2 Column / Single View on Mobile */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Contacts List (Shown on desktop OR on mobile when mobileView === 'contacts') */}
          <div className={`w-full sm:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/30 ${
            mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
          }`}>
            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Contacts Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 dark:divide-slate-800/60">
              {contacts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Sohbet edilecek kullanıcı bulunamadı. Takip ettiğin yazarlarla mesajlaşabilirsin!
                </div>
              ) : (
                contacts.map((contact) => {
                  const { lastMsg, unreadCount } = getLastMessageInfo(contact.id);
                  const isSelected = selectedUser?.id === contact.id;

                  return (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedUserId(contact.id);
                        setMobileView('chat');
                      }}
                      className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-l-4 border-purple-600'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20"
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {contact.name}
                          </h4>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-400 flex-shrink-0">
                              {formatTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : `@${contact.username}`}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation (Shown on desktop OR on mobile when mobileView === 'chat') */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
            mobileView === 'contacts' ? 'hidden sm:flex' : 'flex'
          }`}>
            {selectedUser ? (
              <>
                {/* Chat Recipient Header */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
                  <div 
                    onClick={() => {
                      closeMessaging();
                      openAuthorProfile(selectedUser.id);
                    }}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-500/30 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {selectedUser.name}
                      </h3>
                      <p className="text-[10px] text-slate-400">@{selectedUser.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeMessaging();
                      openAuthorProfile(selectedUser.id);
                    }}
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Profili Gör
                  </button>
                </div>

                {/* Chat Message History */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-slate-950/20">
                  {conversationMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <Sparkles className="w-8 h-8 mb-2 text-purple-400 animate-bounce" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {selectedUser.name} ile henüz mesajlaşmadınız.
                      </p>
                      <p className="text-[11px] mt-1 text-slate-400 max-w-xs">
                        Aşağıdaki hızlı mesajlardan birine tıklayarak veya doğrudan yazarak sohbeti başlatın!
                      </p>

                      {/* Quick Starters */}
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <button
                          onClick={() => handleQuickGreeting('Merhaba! Hikayeni çok beğendim! ✨')}
                          className="px-3 py-1.5 text-xs rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800"
                        >
                          "Hikayeni çok beğendim! ✨"
                        </button>
                        <button
                          onClick={() => handleQuickGreeting('Yeni bölüm ne zaman yayınlanacak? 📖')}
                          className="px-3 py-1.5 text-xs rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800"
                        >
                          "Yeni bölüm ne zaman geliyor? 📖"
                        </button>
                      </div>
                    </div>
                  ) : (
                    conversationMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700/80 rounded-bl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Mesajınızı yazın..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-slate-400 text-xs">
                Sohbet başlatmak için bir kullanıcı seçin.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

