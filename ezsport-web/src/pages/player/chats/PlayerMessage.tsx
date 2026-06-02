import React, { useState, useEffect, useRef } from 'react';
import { conversationService, type Conversation } from '../../../services/conversation.service';
import { useAuth } from '../../../context/AuthContext';

const TX = '#0f172a';
const TX2 = '#64748b';

export const PlayerMessage: React.FC = () => {
  const { } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      
      if (conversation.unreadCount.player > 0) {
        await conversationService.markAsRead(conversation._id);
        
        setConversations(prev =>
          prev.map(c =>
            c._id === conversation._id
              ? { ...c, unreadCount: { ...c.unreadCount, player: 0 } }
              : c
          )
        );
      }

      const updated = await conversationService.getConversationById(conversation._id);
      setSelectedConversation(updated);
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typedMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      const updated = await conversationService.sendMessage({
        conversationId: selectedConversation._id,
        text: typedMessage.trim(),
      });

      setSelectedConversation(updated);
      setConversations(prev =>
        prev.map(c => (c._id === updated._id ? updated : c))
      );

      setTypedMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const formatMessageTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.owner;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    return (
      otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3" style={{ color: TX2 }}>Đang tải hội thoại...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#fff' }}>
      {/* Left: Conversation list */}
      <div style={{ width: '340px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h5 style={{ fontSize: '18px', fontWeight: 800, color: TX, margin: 0, marginBottom: '12px' }}>Tin nhắn</h5>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '20px', padding: '8px 14px', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: TX2, fontSize: '18px' }}>search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: TX }} 
            />
          </div>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div className="text-center py-5" style={{ color: TX2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>chat_bubble_outline</span>
              <p className="mt-2" style={{ fontSize: '13px' }}>Chưa có hội thoại nào</p>
              <p style={{ fontSize: '12px', padding: '0 20px' }}>Nhắn tin với chủ sân từ trang chi tiết sân</p>
            </div>
          ) : (
            filteredConversations.map(conversation => {
              const otherUser = getOtherUser(conversation);
              const isSelected = selectedConversation?._id === conversation._id;
              const avatar = otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName)}&background=16a34a&color=fff`;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px 20px', 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #f1f5f9', 
                    background: isSelected ? '#f0fdf4' : 'transparent',
                    transition: 'all 0.15s' 
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={avatar} alt={otherUser.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    {conversation.venue && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: -2, 
                        right: -2, 
                        background: '#16a34a', 
                        borderRadius: '50%', 
                        width: '18px', 
                        height: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '2px solid #fff'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10px', color: '#fff' }}>store</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {otherUser.fullName}
                      </span>
                      <span style={{ fontSize: '11px', color: TX2 }}>
                        {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}
                      </span>
                    </div>
                    {conversation.venue && (
                      <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginBottom: '2px' }}>
                        📍 {conversation.venue.name}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: conversation.unreadCount.player > 0 ? TX : TX2, 
                        fontWeight: conversation.unreadCount.player > 0 ? 600 : 400, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {conversation.lastMessage?.text || 'Chưa có tin nhắn'}
                      </span>
                      {conversation.unreadCount.player > 0 && (
                        <span style={{ 
                          background: '#16a34a', 
                          color: '#fff', 
                          borderRadius: '50%', 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          minWidth: '18px',
                          height: '18px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          padding: '0 5px'
                        }}>
                          {conversation.unreadCount.player}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Chat area */}
      {selectedConversation ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {/* Chat header */}
          <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="d-flex align-items-center gap-3">
              <img 
                src={getOtherUser(selectedConversation).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherUser(selectedConversation).fullName)}&background=16a34a&color=fff`} 
                alt={getOtherUser(selectedConversation).fullName} 
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TX }}>{getOtherUser(selectedConversation).fullName}</div>
                <div style={{ fontSize: '12px', color: TX2 }}>
                  {selectedConversation.venue ? `📍 ${selectedConversation.venue.name}` : 'Chủ sân'}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedConversation.messages.length === 0 ? (
              <div className="text-center py-5" style={{ color: TX2 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>chat</span>
                <p className="mt-2" style={{ fontSize: '13px' }}>Bắt đầu cuộc trò chuyện với chủ sân</p>
              </div>
            ) : (
              selectedConversation.messages.map((msg, i) => {
                const isPlayer = msg.senderRole === 'player';
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isPlayer ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '70%' }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: isPlayer ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                        background: isPlayer ? '#16a34a' : '#fff', 
                        color: isPlayer ? '#fff' : TX, 
                        border: isPlayer ? 'none' : '1px solid #e2e8f0', 
                        fontSize: '14px', 
                        fontWeight: 500, 
                        lineHeight: 1.5, 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)' 
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '11px', color: TX2, textAlign: isPlayer ? 'right' : 'left', alignSelf: isPlayer ? 'flex-end' : 'flex-start' }}>
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-3">
              <input
                type="text"
                value={typedMessage}
                onChange={e => setTypedMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={sending}
                style={{ 
                  flex: 1, 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '24px', 
                  padding: '12px 20px', 
                  fontSize: '14px', 
                  outline: 'none', 
                  background: '#f8fafc', 
                  color: TX, 
                  fontWeight: 500 
                }}
              />
              <button
                type="submit"
                disabled={!typedMessage.trim() || sending}
                style={{ 
                  border: 'none', 
                  background: typedMessage.trim() && !sending ? '#16a34a' : '#cbd5e1', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  width: '44px', 
                  height: '44px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: typedMessage.trim() && !sending ? 'pointer' : 'default', 
                  boxShadow: typedMessage.trim() && !sending ? '0 2px 8px rgba(22,163,74,0.3)' : 'none', 
                  transition: 'all 0.15s' 
                }}
              >
                {sending ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div className="text-center" style={{ color: TX2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '72px', opacity: 0.2 }}>chat_bubble_outline</span>
            <p className="mt-3" style={{ fontSize: '15px', fontWeight: 600 }}>Chọn một hội thoại để bắt đầu</p>
            <p style={{ fontSize: '13px' }}>Hoặc nhắn tin với chủ sân từ trang chi tiết sân</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerMessage;
