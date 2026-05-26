import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/ai.service';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

interface CourtRecommendation {
  id: number | string;
  name: string;
  rating: number;
  location: string;
  distance: string;
  price: string;
  lat: number;
  lng: number;
  sportType: string;
  emoji: string;
  availableSlot?: string;
  image: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  recommendations?: CourtRecommendation[];
  isLocationScan?: boolean;
}

interface AIChatbotProps {
  onDirectionsClick?: (lat: number, lng: number, name?: string) => void;
  onDetailClick?: (id: number | string) => void;
  onBookingClick?: (id: number | string) => void;
  onLocationFound?: (lat: number, lng: number, address?: string) => void;
  setCurrentPage?: (page: any) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  onDirectionsClick,
  onDetailClick,
  onBookingClick,
  onLocationFound,
  setCurrentPage
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Xin chào! 🌟 Tôi là EZSport AI - trợ lý thông minh giúp bạn tìm sân thể thao. Bạn muốn tìm sân gì hôm nay? 🏃",
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load lịch sử chat từ server khi mở chatbot (chỉ khi đã login)
  const loadChatHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    try {
      const res = await api.get('/chat-history');
      const historyMessages: Message[] = res.data.data.map((msg: any, index: number) => ({
        id: `history-${index}-${msg.timestamp}`,
        sender: msg.sender as 'user' | 'ai',
        text: msg.text,
        timestamp: new Date(msg.timestamp),
        recommendations: msg.recommendations?.length > 0
          ? msg.recommendations.map((r: any) => ({
              id: r._id,
              name: r.name,
              rating: r.rating,
              location: r.location,
              distance: r.distance != null ? `${Number(r.distance).toFixed(1)} km` : 'N/A',
              price: r.price,
              lat: r.lat,
              lng: r.lng,
              sportType: r.sportType,
              emoji: r.emoji,
              image: r.image,
            }))
          : undefined,
      }));

      if (historyMessages.length > 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: `Chào mừng trở lại ${user?.fullName?.split(' ').pop() || ''}! 😊 Đây là lịch sử chat trước của bạn.`,
            timestamp: new Date()
          },
          ...historyMessages
        ]);
      }
    } catch (err) {
      console.log('Không tải được lịch sử chat');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated, user]);

  // Load history khi chatbot mở lần đầu
  const hasLoadedHistory = useRef(false);
  useEffect(() => {
    if (isOpen && isAuthenticated && !hasLoadedHistory.current) {
      hasLoadedHistory.current = true;
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated, loadChatHistory]);

  // Reset flag khi user logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedHistory.current = false;
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: "Xin chào! 🌟 Tôi là EZSport AI - trợ lý thông minh giúp bạn tìm sân thể thao. Bạn muốn tìm sân gì hôm nay? 🏃",
        timestamp: new Date()
      }]);
    }
  }, [isAuthenticated]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Lưu cặp message vào DB (chỉ khi đã login)
  const saveToHistory = async (userText: string, aiText: string, recommendations?: CourtRecommendation[]) => {
    if (!isAuthenticated) return;
    try {
      await api.post('/chat-history', {
        userMessage: { text: userText },
        aiMessage: {
          text: aiText,
          recommendations: recommendations?.map(r => ({
            _id: r.id,
            name: r.name,
            location: r.location,
            price: r.price,
            rating: r.rating,
            sportType: r.sportType,
            emoji: r.emoji,
            image: r.image,
            lat: r.lat,
            lng: r.lng,
          })) || [],
        },
      });
    } catch (err) {
      console.log('Không lưu được lịch sử chat');
    }
  };

  // Xóa lịch sử chat
  const handleClearHistory = async () => {
    if (!isAuthenticated) return;
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat không?')) return;
    try {
      await api.delete('/chat-history');
      hasLoadedHistory.current = false;
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: "Đã xóa lịch sử chat! 🗑️ Bạn có thể bắt đầu cuộc trò chuyện mới.",
        timestamp: new Date()
      }]);
    } catch (err) {
      console.log('Không xóa được lịch sử');
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    if (!textToSend) {
      setInputText('');
    }

    // 1. Add User Message
    const userMsgId = Math.random().toString(36).substring(7);
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // 2. Call Real AI API
    setIsTyping(true);

    try {
      let userLat: number | undefined;
      let userLng: number | undefined;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
        } catch (geoError) {
          console.log('Không lấy được vị trí, tiếp tục không có location');
        }
      }

      const result = await aiService.suggestCourts({
        prompt: query,
        userLat,
        userLng,
        maxDistance: 10,
        limit: 5
      });

      const recommendations: CourtRecommendation[] = result.suggestions.map(court => ({
        id: court._id,
        name: court.name,
        rating: court.rating,
        location: court.location,
        distance: court.distance != null ? `${Number(court.distance).toFixed(1)} km` : 'N/A',
        price: court.price, // Giữ nguyên giá gốc từ DB
        lat: court.lat,
        lng: court.lng,
        sportType: court.sportType,
        emoji: court.emoji,
        availableSlot: undefined,
        image: court.image
      }));

      const aiMsgId = Math.random().toString(36).substring(7);
      const aiMessage: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: result.aiExplanation,
        timestamp: new Date(),
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        isLocationScan: false
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // 3. Lưu vào database (nếu đã login)
      saveToHistory(query, result.aiExplanation, recommendations.length > 0 ? recommendations : undefined);

      if (userLat && userLng && onLocationFound) {
        onLocationFound(userLat, userLng);
      }

    } catch (error: any) {
      console.error('AI Error:', error);
      const errorMsgId = Math.random().toString(36).substring(7);
      const errorMessage: Message = {
        id: errorMsgId,
        sender: 'ai',
        text: `Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn: ${error.message}\n\nVui lòng thử lại.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleDirections = (rec: CourtRecommendation) => {
    if (onDirectionsClick) {
      onDirectionsClick(rec.lat, rec.lng, rec.name);
      // Automatically redirect to map dashboard if setCurrentPage is available
      if (setCurrentPage) {
        setCurrentPage('app');
      }
    }
  };

  const handleDetail = (rec: CourtRecommendation) => {
    if (onDetailClick) {
      onDetailClick(rec.id);
      if (setCurrentPage) {
        setCurrentPage('court-detail');
      }
    }
  };

  const handleBooking = (rec: CourtRecommendation) => {
    if (onBookingClick) {
      onBookingClick(rec.id);
      if (setCurrentPage) {
        setCurrentPage('checkout');
      }
    } else if (onDetailClick) {
      onDetailClick(rec.id);
      if (setCurrentPage) {
        setCurrentPage('court-detail');
      }
    }
  };

  // Format giá tiền từ DB để hiển thị đẹp
  const formatPrice = (price: string): string => {
    if (!price) return 'Liên hệ';
    
    // Nếu đã có định dạng đẹp (có chữ VNĐ, đ, /giờ, /h) → giữ nguyên
    if (/[a-zA-ZđĐ\/]/.test(price) && !/^\d+$/.test(price.replace(/[.,\s]/g, ''))) {
      return price;
    }
    
    // Tách số từ chuỗi (hỗ trợ range như "70000-120000" hay "70.000 - 120.000")
    const nums = price.replace(/[^\d]/g, ' ').trim().split(/\s+/).filter(Boolean).map(Number).filter(n => n > 0);
    
    if (nums.length === 0) return price;
    
    const fmt = (n: number) => n.toLocaleString('vi-VN');
    
    if (nums.length === 1) {
      return `${fmt(nums[0])}đ/h`;
    }
    // Range giá
    return `${fmt(Math.min(...nums))} - ${fmt(Math.max(...nums))}đ/h`;
  };

  return (
    <>
      {/* 1. Floating Action Chat Button */}
      <div className="position-fixed" style={{ bottom: '24px', right: '24px', zIndex: 2000 }}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewMessage(false);
          }}
          className="btn d-flex align-items-center justify-content-center shadow-lg position-relative border-0"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 12px 24px rgba(22, 163, 74, 0.4)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
            {isOpen ? 'close' : 'smart_toy'}
          </span>

          {hasNewMessage && !isOpen && (
            <span 
              className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle animate-pulse"
              style={{
                animation: 'pulse 1.5s infinite',
                boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.4)'
              }}
            />
          )}
        </button>
      </div>

      {/* 2. Chat Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="position-fixed d-flex flex-column shadow-2xl overflow-hidden"
            style={{
              bottom: '98px',
              right: '24px',
              width: '390px',
              height: '560px',
              borderRadius: '28px',
              zIndex: 2000,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.15)',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 d-flex align-items-center justify-content-between text-white"
              style={{
                background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)'
              }}
            >
              <div className="d-flex align-items-center gap-2" style={{ gap: '10px' }}>
                <div 
                  className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', flexShrink: 0 }}
                >
                  {isLoadingHistory
                    ? <span className="spinner-border spinner-border-sm text-white" />
                    : <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#fff' }}>smart_toy</span>
                  }
                </div>
                <div>
                  <h6 className="m-0 fw-bold d-flex align-items-center" style={{ fontSize: '15px', gap: '6px' }}>
                    EZSport AI Bot
                    <span 
                      className="rounded-circle" 
                      style={{ width: '8px', height: '8px', background: '#4ade80', display: 'inline-block' }}
                    />
                  </h6>
                  <span className="text-white text-opacity-75" style={{ fontSize: '11px' }}>
                    {isAuthenticated && user ? `👤 ${user.fullName}` : 'Hỗ trợ đặt sân tự động'}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                {/* Nút xóa lịch sử - chỉ hiện khi đã login */}
                {isAuthenticated && (
                  <button
                    onClick={handleClearHistory}
                    className="btn btn-link text-white p-1 border-0 shadow-none"
                    title="Xóa lịch sử chat"
                    style={{ opacity: 0.7 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_sweep</span>
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="btn btn-link text-white p-1 border-0 shadow-none"
                  style={{ opacity: 0.75 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>
            </div>

            {/* Content Feed */}
            <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" style={{ background: 'rgba(248, 250, 252, 0.4)' }}>
              
              {/* Loading history indicator */}
              {isLoadingHistory && (
                <div className="text-center py-3 text-muted" style={{ fontSize: '12px' }}>
                  <span className="spinner-border spinner-border-sm text-success me-2" />
                  Đang tải lịch sử chat...
                </div>
              )}

              {/* Login prompt for guests */}
              {!isAuthenticated && messages.length <= 1 && (
                <div className="text-center py-2 px-3 rounded-3 mb-1" style={{ background: 'rgba(22,163,74,0.08)', fontSize: '11.5px', color: '#166534' }}>
                  🔐 Đăng nhập để lưu lịch sử chat của bạn!
                </div>
              )}

              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`d-flex flex-column ${msg.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}
                >
                  {/* Avatar & Message container */}
                  <div className="d-flex align-items-end gap-2" style={{ maxWidth: '85%' }}>
                    {msg.sender === 'ai' && (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                        style={{ width: '28px', height: '28px', background: '#e2e8f0', border: '1px solid #cbd5e1' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#166534' }}>smart_toy</span>
                      </div>
                    )}
                    
                    <div 
                      className={`p-3 rounded-2xl shadow-xs`}
                      style={{
                        background: msg.sender === 'user' ? '#15803d' : '#ffffff',
                        color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.03)',
                        borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        fontSize: '13.5px',
                        lineHeight: '1.45',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {msg.isLocationScan && (
                        <div className="d-flex align-items-center gap-1.5 text-success fw-bold mb-2">
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                          <span>ĐANG QUÉT GPS THIẾT BỊ...</span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </div>

                  {/* Recommendations container (Inside bubble flow) */}
                  {msg.recommendations && (
                    <div className="w-100 d-flex flex-column gap-2 mt-2 ps-4">
                      {msg.recommendations.map((rec) => (
                        <div 
                          key={rec.id} 
                          className="bg-white border p-3 rounded-2xl shadow-sm d-flex gap-3 flex-column hover-scale"
                          style={{
                            border: '1px solid #e2e8f0',
                            maxWidth: '92%',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleDetail(rec)}
                          title="Xem chi tiết sân (Khách mới)"
                        >
                          <div className="d-flex gap-2">
                            <div 
                              className="rounded-xl flex-shrink-0 overflow-hidden" 
                              style={{ width: '60px', height: '60px', background: '#f1f5f9' }}
                            >
                              <img 
                                src={rec.image} 
                                alt={rec.name}
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px">${rec.emoji || '🏟️'}</div>`;
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="badge bg-success bg-opacity-10 text-success fw-bold" style={{ fontSize: '8px' }}>
                                  {rec.sportType.toUpperCase()}
                                </span>
                                <div className="d-flex align-items-center gap-0.5 text-warning" style={{ fontSize: '11px' }}>
                                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '13px' }}>star</span>
                                  <span className="fw-bold text-dark">{rec.rating}</span>
                                </div>
                              </div>
                              <h6 className="fw-bold text-dark m-0 mt-1 text-truncate" style={{ fontSize: '13px' }}>
                                {rec.name}
                              </h6>
                              <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                                {rec.location}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-1">
                            <div className="d-flex flex-column">
                              {rec.availableSlot && (
                                <span className="text-success fw-bold" style={{ fontSize: '12px' }}>
                                  {rec.availableSlot}
                                </span>
                              )}
                              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#16a34a' }}>
                                {formatPrice(rec.price)}
                                {rec.distance && rec.distance !== 'N/A' && (
                                  <span className="text-muted fw-normal" style={{ fontSize: '10px', marginLeft: '6px' }}>({rec.distance})</span>
                                )}
                              </span>
                            </div>
                            
                            <div className="d-flex gap-1.5">
                              <button 
                                onClick={() => handleDirections(rec)}
                                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center p-2 rounded-xl"
                                title="Chỉ đường"
                              >
                                <span className="material-symbols-outlined text-success" style={{ fontSize: '16px' }}>directions</span>
                              </button>
                              <button 
                                onClick={() => handleBooking(rec)}
                                className="btn btn-sm btn-success fw-bold px-3 py-1.5 rounded-pill d-flex align-items-center gap-1 border-0"
                                style={{ fontSize: '11.5px', background: '#15803d' }}
                              >
                                Đặt ngay
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-muted mt-1" style={{ fontSize: '9px', opacity: 0.6, marginRight: msg.sender === 'user' ? '8px' : '0', marginLeft: msg.sender === 'ai' ? '36px' : '0' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                    style={{ width: '28px', height: '28px', background: '#e2e8f0' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#166534' }}>smart_toy</span>
                  </div>
                  <div className="bg-white border p-3 rounded-2xl shadow-xs d-flex gap-1 align-items-center" style={{ borderRadius: '20px 20px 20px 4px' }}>
                    <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '6px', height: '6px' }}></span>
                    <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '6px', height: '6px', animationDelay: '0.2s' }}></span>
                    <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '6px', height: '6px', animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 py-2 d-flex gap-1.5 overflow-auto border-top flex-shrink-0 bg-white" style={{ whiteSpace: 'nowrap', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <button 
                onClick={() => handleSuggestClick("Tôi ở Đà Nẵng muốn chơi lúc 8h30 🏓")}
                className="btn btn-sm btn-outline-success rounded-pill fw-semibold border"
                style={{ fontSize: '11px', whiteSpace: 'nowrap', color: '#15803d', borderColor: '#dcfce7' }}
              >
                Tôi ở Đà Nẵng muốn chơi 8h30 🏓
              </button>
              <button 
                onClick={() => handleSuggestClick("Tìm sân Pickleball gần tôi nhất 📍")}
                className="btn btn-sm btn-outline-success rounded-pill fw-semibold border"
                style={{ fontSize: '11px', whiteSpace: 'nowrap', color: '#15803d', borderColor: '#dcfce7' }}
              >
                Sân Pickleball gần đây 📍
              </button>
              <button 
                onClick={() => handleSuggestClick("Tìm người chơi cùng cầu lông 🏸")}
                className="btn btn-sm btn-outline-success rounded-pill fw-semibold border"
                style={{ fontSize: '11px', whiteSpace: 'nowrap', color: '#15803d', borderColor: '#dcfce7' }}
              >
                Tìm đồng đội Cầu Lông 🏸
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-top flex-shrink-0 d-flex gap-2 align-items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi AI Trợ Lý đặt sân..."
                className="form-control rounded-pill border shadow-none px-3"
                style={{ fontSize: '13px', background: '#f8fafc', height: '40px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                className="btn btn-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 border-0"
                style={{ width: '40px', height: '40px', background: '#15803d' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Extra CSS injection for spinning loader and keyframes */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};
