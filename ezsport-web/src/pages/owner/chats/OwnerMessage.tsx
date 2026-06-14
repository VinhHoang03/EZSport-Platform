import React, { useState, useEffect, useRef } from 'react';
import { TX, TX2 } from '../../../utils/theme';
import { conversationService, type Conversation } from '../../../services/conversation.service';
import { useAuth } from '../../../context/AuthContext';

export const OwnerMessage: React.FC = () => {
  const { } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto scroll to bottom khi có tin nhắn mới
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
      
      // Đánh dấu đã đọc
      if (conversation.unreadCount.owner > 0) {
        await conversationService.markAsRead(conversation._id);
        
        // Cập nhật local state
        setConversations(prev =>
          prev.map(c =>
            c._id === conversation._id
              ? { ...c, unreadCount: { ...c.unreadCount, owner: 0 } }
              : c
          )
        );
      }

      // Load lại conversation để lấy messages mới nhất
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

      // Cập nhật conversation hiện tại
      setSelectedConversation(updated);

      // Cập nhật danh sách conversations
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
    return conversation.participants.player;
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
      <div className="animate-slide-up" style={{ height: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div className="animate-slide-up" style={{ height: 'calc(100vh - 140px)', display: 'flex', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      {/* Left: Room list */}
      <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '20px', padding: '6px 12px', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: TX2, fontSize: '18px' }}>search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm hội thoại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div className="text-center py-5" style={{ color: TX2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>chat_bubble_outline</span>
              <p className="mt-2" style={{ fontSize: '13px' }}>Chưa có hội thoại nào</p>
            </div>
          ) : (
            filteredConversations.map(conversation => {
              const otherUser = getOtherUser(conversation);
              const isSelected = selectedConversation?._id === conversation._id;
              const avatar = otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName)}&background=22c55e&color=fff`;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #f1f5f9', 
                    background: isSelected ? '#f0fdf4' : 'transparent', 
                    borderLeft: isSelected ? '4px solid #22c55e' : '4px solid transparent', 
                    transition: 'all 0.15s' 
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={avatar} alt={otherUser.fullName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {otherUser.fullName}
                      </span>
                      <span style={{ fontSize: '10px', color: TX2 }}>
                        {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: conversation.unreadCount.owner > 0 ? TX : TX2, 
                        fontWeight: conversation.unreadCount.owner > 0 ? 700 : 500, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {conversation.lastMessage?.text || 'Chưa có tin nhắn'}
                      </span>
                      {conversation.unreadCount.owner > 0 && (
                        <span style={{ 
                          background: '#ef4444', 
                          color: '#fff', 
                          borderRadius: '50%', 
                          fontSize: '10px', 
                          fontWeight: 800, 
                          width: '18px', 
                          height: '18px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {conversation.unreadCount.owner}
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

      {/* Right: Conversation */}
      {selectedConversation ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {/* Header */}
          <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="d-flex align-items-center gap-3">
              <img 
                src={getOtherUser(selectedConversation).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherUser(selectedConversation).fullName)}&background=22c55e&color=fff`} 
                alt={getOtherUser(selectedConversation).fullName} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TX }}>{getOtherUser(selectedConversation).fullName}</div>
                <div style={{ fontSize: '11px', color: TX2, fontWeight: 600 }}>{getOtherUser(selectedConversation).email}</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedConversation.messages.length === 0 ? (
              <div className="text-center py-5" style={{ color: TX2 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>chat</span>
                <p className="mt-2" style={{ fontSize: '13px' }}>Bắt đầu cuộc trò chuyện</p>
              </div>
            ) : (
              selectedConversation.messages.map((msg, i) => {
                const isOwner = msg.senderRole === 'owner';
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isOwner ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '70%' }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: isOwner ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                        background: isOwner ? '#0f3d22' : '#fff', 
                        color: isOwner ? '#fff' : TX, 
                        border: isOwner ? 'none' : '1px solid #e2e8f0', 
                        fontSize: '13px', 
                        fontWeight: 500, 
                        lineHeight: 1.5, 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '10px', color: TX2, textAlign: isOwner ? 'right' : 'left', alignSelf: isOwner ? 'flex-end' : 'flex-start' }}>
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
                  padding: '10px 20px', 
                  fontSize: '13px', 
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
                  background: typedMessage.trim() && !sending ? '#0f3d22' : '#cbd5e1', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: typedMessage.trim() && !sending ? 'pointer' : 'default', 
                  boxShadow: typedMessage.trim() && !sending ? '0 2px 6px rgba(15,61,34,0.2)' : 'none', 
                  transition: 'all 0.15s' 
                }}
              >
                {sending ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div className="text-center" style={{ color: TX2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', opacity: 0.2 }}>chat_bubble_outline</span>
            <p className="mt-3" style={{ fontSize: '14px' }}>Chọn một hội thoại để bắt đầu</p>
          </div>
        </div>
      )}
    </div>
  );
};
