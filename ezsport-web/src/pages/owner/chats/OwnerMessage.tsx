import React from 'react';
import { TX, TX2 } from '../../../utils/theme';

interface Message {
  sender: string;
  text: string;
  time: string;
}

interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

interface OwnerMessageProps {
  chatRooms: ChatRoom[];
  selectedRoomId: string;
  typedMessage: string;
  onSelectRoom: (id: string) => void;
  onClearUnread: (id: string) => void;
  onTypedMessageChange: (val: string) => void;
  onSendMessage: (text: string) => void;
}

export const OwnerMessage: React.FC<OwnerMessageProps> = ({
  chatRooms,
  selectedRoomId,
  typedMessage,
  onSelectRoom,
  onClearUnread,
  onTypedMessageChange,
  onSendMessage,
}) => {
  const activeRoom = chatRooms.find(r => r.id === selectedRoomId);

  return (
    <div className="animate-slide-up" style={{ height: 'calc(100vh - 140px)', display: 'flex', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      {/* Left: Room list */}
      <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '20px', padding: '6px 12px', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: TX2, fontSize: '18px' }}>search</span>
            <input type="text" placeholder="Tìm kiếm hội thoại..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatRooms.map(room => {
            const isSelected = room.id === selectedRoomId;
            return (
              <div
                key={room.id}
                onClick={() => { onSelectRoom(room.id); onClearUnread(room.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: isSelected ? '#f0fdf4' : 'transparent', borderLeft: isSelected ? '4px solid #22c55e' : '4px solid transparent', transition: 'all 0.15s' }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={room.avatar} alt={room.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  {room.online && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', position: 'absolute', bottom: 0, right: 0 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</span>
                    <span style={{ fontSize: '10px', color: TX2 }}>{room.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: room.unread > 0 ? TX : TX2, fontWeight: room.unread > 0 ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.lastMsg}
                    </span>
                    {room.unread > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {room.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Conversation */}
      {activeRoom && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {/* Header */}
          <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="d-flex align-items-center gap-3">
              <img src={activeRoom.avatar} alt={activeRoom.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TX }}>{activeRoom.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeRoom.online ? '#22c55e' : '#94a3b8' }} />
                  <span style={{ fontSize: '11px', color: TX2, fontWeight: 600 }}>{activeRoom.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => alert(`📞 Đang gọi đến ${activeRoom.name}...`)} style={{ border: '1px solid #e2e8f0', background: '#fff', color: TX2, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
              </button>
              <button onClick={() => alert(`📹 Đang gọi video đến ${activeRoom.name}...`)} style={{ border: '1px solid #e2e8f0', background: '#fff', color: TX2, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>videocam</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeRoom.messages.map((msg, i) => {
              const isOwner = msg.sender === 'owner';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isOwner ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '70%' }}>
                    <div style={{ padding: '12px 16px', borderRadius: isOwner ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isOwner ? '#0f3d22' : '#fff', color: isOwner ? '#fff' : TX, border: isOwner ? 'none' : '1px solid #e2e8f0', fontSize: '13px', fontWeight: 500, lineHeight: 1.5, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '10px', color: TX2, textAlign: isOwner ? 'right' : 'left', alignSelf: isOwner ? 'flex-end' : 'flex-start' }}>{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <form
              onSubmit={e => { e.preventDefault(); if (typedMessage.trim()) { onSendMessage(typedMessage.trim()); } }}
              className="d-flex align-items-center gap-3"
            >
              <button type="button" onClick={() => alert('📤 Chọn file đính kèm...')} style={{ border: 'none', background: 'transparent', color: TX2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>attach_file</span>
              </button>
              <input
                type="text"
                value={typedMessage}
                onChange={e => onTypedMessageChange(e.target.value)}
                placeholder="Nhập tin nhắn..."
                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '24px', padding: '10px 20px', fontSize: '13px', outline: 'none', background: '#f8fafc', color: TX, fontWeight: 500 }}
              />
              <button
                type="submit"
                style={{ border: 'none', background: typedMessage.trim() ? '#0f3d22' : '#cbd5e1', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: typedMessage.trim() ? 'pointer' : 'default', boxShadow: typedMessage.trim() ? '0 2px 6px rgba(15,61,34,0.2)' : 'none', transition: 'all 0.15s' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
