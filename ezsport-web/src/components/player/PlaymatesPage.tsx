import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, ProgressBar, Toast, ToastContainer, Alert, Spinner } from 'react-bootstrap';
import Footer from '../shared/Footer';
import { useAuth } from '../../context/AuthContext';
import { playmateService, type Playmate } from '../../services/playmate.service';
import { conversationService } from '../../services/conversation.service';
import { venueService } from '../../services/venue.service';
import type { Venue } from '../../services/venue.service';
import { userRatingService } from '../../services/userRating.service';
import type { UserRating, UserRatingStats } from '../../services/userRating.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

const mapPlaymateSportToVenueSport = (playmateSport: string): string => {
  const normalized = playmateSport.toLowerCase();
  if (normalized.includes('pickleball')) return 'pickleball';
  if (normalized.includes('cầu lông') || normalized.includes('badminton')) return 'badminton';
  if (normalized.includes('bóng đá') || normalized.includes('soccer') || normalized.includes('football')) return 'soccer';
  if (normalized.includes('tennis')) return 'tennis';
  return playmateSport.toLowerCase();
};

interface PlaymatesPageProps {
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

export const PlaymatesPage: React.FC<PlaymatesPageProps> = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<Playmate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filtering states
  const [selectedSport, setSelectedSport] = useState<string>('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuickPostExpanded, setIsQuickPostExpanded] = useState<boolean>(false);

  // Modal creation states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSport, setNewSport] = useState<'Pickleball' | 'Cầu lông' | 'Bóng đá' | 'Tennis'>('Pickleball');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newVenue, setNewVenue] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('18:00 - 20:00');
  const [newDate, setNewDate] = useState<string>('Thứ Ba, 19/05/2026');
  const [newSlots, setNewSlots] = useState<number>(4);
  const [newLevel, setNewLevel] = useState<'Mới chơi' | 'Trung bình' | 'Khá / Pro'>('Trung bình');

  // Venue-related states
  const [verifiedVenues, setVerifiedVenues] = useState<Venue[]>([]);
  const [isCustomVenue, setIsCustomVenue] = useState<boolean>(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const venues = await venueService.getVenues({ active: 'all' });
        const verified = venues.filter(v => v.isVerified && v.isActive);
        setVerifiedVenues(verified);
      } catch (err) {
        console.error('Failed to fetch venues:', err);
      }
    };
    fetchVenues();
  }, []);

  // Update default venue when newSport or verifiedVenues changes
  useEffect(() => {
    const key = mapPlaymateSportToVenueSport(newSport);
    const filtered = verifiedVenues.filter(v => v.sportTypes.some(s => s.toLowerCase() === key));
    if (filtered.length > 0) {
      setNewVenue(filtered[0].name);
      setIsCustomVenue(false);
    } else {
      setNewVenue('');
      setIsCustomVenue(true);
    }
  }, [newSport, verifiedVenues]);

  // Toast notification states
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Player Rating Modal states
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [ratingTargetPlayer, setRatingTargetPlayer] = useState<any | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [playerRatings, setPlayerRatings] = useState<UserRating[]>([]);
  const [playerStats, setPlayerStats] = useState<UserRatingStats | null>(null);
  const [loadingRatings, setLoadingRatings] = useState<boolean>(false);
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  const fetchPlayerRatings = async (targetId: string) => {
    try {
      setLoadingRatings(true);
      const [ratingsData, statsData] = await Promise.all([
        userRatingService.getUserRatings(targetId),
        userRatingService.getUserRatingStats(targetId),
      ]);
      setPlayerRatings(ratingsData);
      setPlayerStats(statsData);
      
      const myRating = ratingsData.find(r => {
        const reviewerId = typeof r.reviewer === 'object' ? r.reviewer._id : r.reviewer;
        return currentUser && reviewerId === currentUser.id;
      });
      if (myRating) {
        setRatingScore(myRating.rating);
        setRatingComment(myRating.comment || '');
      } else {
        setRatingScore(5);
        setRatingComment('');
      }
    } catch (err) {
      console.error('Failed to fetch player ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    if (ratingTargetPlayer) {
      fetchPlayerRatings(ratingTargetPlayer._id);
    }
  }, [ratingTargetPlayer]);

  useEffect(() => {
    if (!showCreateModal) {
      setValidationError(null);
    }
  }, [showCreateModal]);

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đánh giá người chơi!');
      return;
    }
    if (!ratingTargetPlayer) return;

    try {
      setSubmittingRating(true);
      await userRatingService.createOrUpdateRating({
        revieweeId: ratingTargetPlayer._id,
        rating: ratingScore,
        comment: ratingComment.trim(),
      });
      setToastMessage(`Đã gửi đánh giá cho ${ratingTargetPlayer.fullName}!`);
      setShowToast(true);
      fetchPlayerRatings(ratingTargetPlayer._id);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingRating(false);
    }
  };

  const fetchPlaymates = async () => {
    try {
      setLoading(true);
      const data = await playmateService.getPlaymates({
        sport: selectedSport,
        level: selectedLevel,
        search: searchQuery,
      });
      setRequests(data);
    } catch (err: any) {
      console.error('Failed to fetch playmates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaymates();
  }, [selectedSport, selectedLevel, searchQuery]);

  // Handle join/leave request
  const handleJoin = async (req: Playmate) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để tham gia nhóm chơi!');
      return;
    }
    const hasJoined = req.participants.some(p => p._id === currentUser.id);
    try {
      if (hasJoined) {
        // Leave
        await playmateService.leavePlaymate(req._id);
        setToastMessage(`Đã rút khỏi nhóm: "${req.title}"`);
        setShowToast(true);
      } else {
        // Join
        if (req.participants.length >= req.slotsTotal) {
          alert('Rất tiếc! Nhóm đấu này đã đủ người tham gia.');
          return;
        }
        await playmateService.joinPlaymate(req._id);
        setToastMessage(`Chúc mừng! Bạn đã tham gia thành công trận đấu: "${req.title}"`);
        setShowToast(true);
      }
      fetchPlaymates();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Thao tác thất bại');
    }
  };

  // Handle delete request
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy tin đăng "${title}" không?`)) {
      return;
    }
    try {
      await playmateService.deletePlaymate(id);
      setToastMessage(`Đã hủy tin đăng: "${title}"`);
      setShowToast(true);
      fetchPlaymates();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Xóa tin thất bại');
    }
  };

  // Handle chat with creator
  const handleChatWithCreator = async (creatorId: string) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để nhắn tin!');
      return;
    }
    if (currentUser.id === creatorId) {
      alert('Bạn không thể tự nhắn tin cho chính mình!');
      return;
    }
    try {
      const conversation = await conversationService.createOrGetConversation({
        otherUserId: creatorId,
      });
      navigate(ROUTES.MESSAGES, { state: { conversationId: conversation._id } });
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      alert(err.message || 'Không thể tạo hội thoại');
    }
  };

  // Handle submit new request
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!newTitle.trim() || !newVenue.trim()) {
      setValidationError('Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      await playmateService.createPlaymate({
        sport: newSport,
        creatorLevel: newLevel,
        title: newTitle,
        description: newDesc,
        venueName: newVenue,
        timeSlot: newTime,
        dateStr: newDate,
        slotsTotal: newSlots,
      });

      setShowCreateModal(false);
      setIsQuickPostExpanded(false);
      setToastMessage('Đã đăng yêu cầu tìm bạn chơi thành công!');
      setShowToast(true);

      // Reset Form
      setNewTitle('');
      setNewDesc('');
      setNewVenue('');
      setValidationError(null);
      fetchPlaymates();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Đăng tin thất bại';
      setValidationError(errMsg);
    }
  };

  return (
    <div className="h-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Main Container */}
      <div className="flex-grow-1 overflow-auto py-4">
        {/* Banner Section */}
        <div
          className="text-white py-5 px-4 mb-4 rounded-4 shadow-sm position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f3d22 0%, #16a34a 100%)',
            margin: '0 24px',
            borderRadius: '24px'
          }}
        >
          {/* Subtle background graphic details */}
          <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '180px', fontWeight: 900, color: 'rgba(255,255,255,0.06)', lineHeight: 1, userSelect: 'none' }}>
            EZPLAY
          </div>

          <Container>
            <Row className="align-items-center">
              <Col md={8}>
                <Badge style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                  CỘNG ĐỒNG EZSPORT
                </Badge>
                <h1 className="fw-extrabold" style={{ fontSize: '38px', letterSpacing: '-1px' }}>Tìm Bạn Chơi & Giao Lưu</h1>
                <p className="lead mb-0 text-white-50" style={{ fontSize: '16px', maxWidth: '600px' }}>
                  Thiếu chân, thiếu đối thủ giao lưu? Đừng lo! Tìm kiếm hoặc tự tạo yêu cầu ghép cặp đấu với các người chơi cùng khu vực nhanh chóng.
                </p>
              </Col>
              <Col md={4} className="text-md-end mt-4 mt-md-0">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: '#ffffff',
                    color: '#0f3d22',
                    border: 'none',
                    fontWeight: 700,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                  className="hover-scale d-inline-flex align-items-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Đăng Tin Tìm Bạn
                </Button>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Content Section */}
        <Container fluid className="px-4">
          <Row>
            {/* Sidebar Filters */}
            <Col lg={3} className="mb-4">
              <Card className="border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '90px', zIndex: 10 }}>
                <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-success" style={{ color: '#1a6b3c' }}>filter_alt</span>
                  Bộ lọc tìm kiếm
                </h5>

                {/* Search input */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary small fw-bold uppercase">Tìm kiếm từ khóa</Form.Label>
                  <div className="d-flex align-items-center bg-light border rounded-3 px-3 py-2 gap-2">
                    <span className="material-symbols-outlined fs-5 text-muted">search</span>
                    <input
                      type="text"
                      placeholder="Tên sân, từ khóa..."
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </Form.Group>

                {/* Sports pills */}
                <div className="mb-4">
                  <label className="text-secondary small fw-bold uppercase mb-2 d-block">Bộ môn thể thao</label>
                  <div className="d-flex flex-wrap gap-2">
                    {['Tất cả', 'Pickleball', 'Cầu lông', 'Bóng đá', 'Tennis'].map(sport => {
                      const isActive = selectedSport === sport;
                      return (
                        <button
                          key={sport}
                          onClick={() => setSelectedSport(sport)}
                          style={{
                            border: 'none',
                            background: isActive ? '#0f3d22' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#64748b',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level selection */}
                <div>
                  <label className="text-secondary small fw-bold uppercase mb-2 d-block">Trình độ yêu cầu</label>
                  <div className="d-flex flex-wrap gap-2">
                    {['Tất cả', 'Mới chơi', 'Trung bình', 'Khá / Pro'].map(lvl => {
                      const isActive = selectedLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          onClick={() => setSelectedLevel(lvl)}
                          style={{
                            border: 'none',
                            background: isActive ? '#1a6b3c' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#64748b',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </Col>

            {/* Matchmaking Grid */}
            <Col lg={9}>
              {/* Dedicated Quick Post Card */}
              <Card className="border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
                {!isQuickPostExpanded ? (
                  /* Collapsed Social Post Box Style */
                  <div
                    onClick={() => setIsQuickPostExpanded(true)}
                    className="d-flex align-items-center gap-3 cursor-pointer p-1"
                    style={{ transition: 'all 0.2s' }}
                  >
                    <img
                      src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || 'User')}&background=1a6b3c&color=fff`}
                      alt="User"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div
                      className="flex-grow-1 text-secondary px-4 py-2.5 rounded-pill border-0 d-flex align-items-center justify-content-between hover-bg-gray"
                      style={{
                        fontSize: '14px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                      <span>Bạn muốn đăng tin tìm đồng đội hay đối thủ giao lưu? Click đăng ngay...</span>
                      <span className="material-symbols-outlined text-success" style={{ color: '#1a6b3c' }}>add_circle</span>
                    </div>
                  </div>
                ) : (
                  /* Expanded Form Style */
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success animate-pulse" style={{ fontSize: '24px', color: '#1a6b3c' }}>add_circle</span>
                        <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>Đăng tin tìm bạn chơi nhanh</h5>
                      </div>
                      <Button
                        variant="link"
                        className="text-muted p-1 d-flex align-items-center justify-content-center border-0 shadow-none hover-text-dark"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsQuickPostExpanded(false);
                          setValidationError(null);
                        }}
                      >
                        <span className="material-symbols-outlined fs-5">close</span>
                      </Button>
                    </div>

                    {validationError && (
                      <Alert variant="danger" className="py-2 px-3 border-0 rounded-3 small mb-3" onClose={() => setValidationError(null)} dismissible>
                        {validationError}
                      </Alert>
                    )}

                    <Form onSubmit={handleCreateSubmit}>
                      <Row className="g-3">
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>BỘ MÔN</Form.Label>
                            <Form.Select
                              value={newSport}
                              onChange={e => setNewSport(e.target.value as any)}
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}
                            >
                              <option value="Pickleball">Pickleball</option>
                              <option value="Cầu lông">Cầu lông</option>
                              <option value="Bóng đá">Bóng đá</option>
                              <option value="Tennis">Tennis</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>TRÌNH ĐỘ YÊU CẦU</Form.Label>
                            <Form.Select
                              value={newLevel}
                              onChange={e => setNewLevel(e.target.value as any)}
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}
                            >
                              <option value="Mới chơi">Mới chơi</option>
                              <option value="Trung bình">Trung bình</option>
                              <option value="Khá / Pro">Khá / Pro</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>TIÊU ĐỀ LỜI MỜI *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="VD: Cần 2 bạn đánh đôi..."
                              value={newTitle}
                              onChange={e => setNewTitle(e.target.value)}
                              required
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px' }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>SLOTS *</Form.Label>
                            <Form.Control
                              type="number"
                              min={2}
                              max={20}
                              value={newSlots}
                              onChange={e => setNewSlots(parseInt(e.target.value, 10))}
                              required
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px' }}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>ĐỊA ĐIỂM / TÊN SÂN *</Form.Label>
                            {(() => {
                              const key = mapPlaymateSportToVenueSport(newSport);
                              const filtered = verifiedVenues.filter(v => v.sportTypes.some(s => s.toLowerCase() === key));
                              if (filtered.length > 0) {
                                return (
                                  <div className="d-flex flex-column gap-2">
                                    <Form.Select
                                      value={isCustomVenue ? 'custom' : newVenue}
                                      onChange={e => {
                                        const val = e.target.value;
                                        if (val === 'custom') {
                                          setIsCustomVenue(true);
                                          setNewVenue('');
                                        } else {
                                          setIsCustomVenue(false);
                                          setNewVenue(val);
                                        }
                                      }}
                                      className="py-2 border-0 bg-light rounded-3"
                                      style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}
                                    >
                                      {filtered.map(v => (
                                        <option key={v._id} value={v.name}>{v.name}</option>
                                      ))}
                                      <option value="custom">Tự nhập địa điểm khác...</option>
                                    </Form.Select>
                                    {isCustomVenue && (
                                      <Form.Control
                                        type="text"
                                        placeholder="Nhập tên sân chơi..."
                                        value={newVenue}
                                        onChange={e => setNewVenue(e.target.value)}
                                        required
                                        className="py-2 border-0 bg-light rounded-3"
                                        style={{ fontSize: '13px' }}
                                      />
                                    )}
                                  </div>
                                );
                              } else {
                                return (
                                  <Form.Control
                                    type="text"
                                    placeholder="Nhập tên sân chơi..."
                                    value={newVenue}
                                    onChange={e => setNewVenue(e.target.value)}
                                    required
                                    className="py-2 border-0 bg-light rounded-3"
                                    style={{ fontSize: '13px' }}
                                  />
                                );
                              }
                            })()}
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>NGÀY CHƠI *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="VD: Thứ Ba, 19/05"
                              value={newDate}
                              onChange={e => setNewDate(e.target.value)}
                              required
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px' }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small" style={{ fontSize: '11px' }}>KHUNG GIỜ *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="VD: 18:00 - 20:00"
                              value={newTime}
                              onChange={e => setNewTime(e.target.value)}
                              required
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px' }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end gap-2">
                          <Button
                            variant="light"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsQuickPostExpanded(false);
                            }}
                            className="py-2 border rounded-3 text-secondary"
                            style={{ fontSize: '13px', fontWeight: 600 }}
                          >
                            Hủy
                          </Button>
                          <Button
                            type="submit"
                            style={{ background: '#0f3d22', border: 'none', fontWeight: 700, flexGrow: 1 }}
                            className="py-2 rounded-3 hover-scale d-flex align-items-center justify-content-center gap-2"
                          >
                            <span className="material-symbols-outlined fs-5">send</span>
                            Đăng Tin
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                )}
              </Card>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" className="mb-2" />
                  <p className="text-muted small">Đang tải danh sách tin tìm bạn chơi...</p>
                </div>
              ) : requests.length > 0 ? (
                <Row className="g-4">
                  {requests.map(req => {
                    const progress = (req.participants.length / req.slotsTotal) * 100;
                    const isFull = req.participants.length >= req.slotsTotal;
                    const hasJoined = currentUser ? req.participants.some(p => p._id === currentUser.id) : false;
                    const isCreator = currentUser ? (req.creator?._id === currentUser.id) : false;
                    const creatorName = req.creator?.fullName || 'Người chơi';
                    const creatorAvatar = req.creator?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=1a6b3c&color=fff`;

                    return (
                      <Col md={6} key={req._id}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 card-hover-effect overflow-hidden">
                          {/* Card Top Border Accent */}
                          <div
                            style={{
                              height: '4px',
                              background: req.sport === 'Pickleball' ? '#f59e0b' :
                                req.sport === 'Cầu lông' ? '#10b981' :
                                  req.sport === 'Bóng đá' ? '#3b82f6' : '#ec4899'
                            }}
                          />
                          <Card.Body className="p-4 d-flex flex-column">
                            {/* Header Info */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={creatorAvatar}
                                  alt={creatorName}
                                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>{creatorName}</h6>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>{isCreator ? 'Chủ phòng (Bạn)' : 'Người đăng'}</span>
                                </div>
                              </div>
                              <Badge
                                style={{
                                  background: req.creatorLevel === 'Khá / Pro' ? '#fee2e2' :
                                    req.creatorLevel === 'Trung bình' ? '#eff6ff' : '#fef9c3',
                                  color: req.creatorLevel === 'Khá / Pro' ? '#991b1b' :
                                    req.creatorLevel === 'Trung bình' ? '#1e40af' : '#854d0e',
                                  fontSize: '11px',
                                  padding: '5px 10px',
                                  borderRadius: '6px'
                                }}
                              >
                                Trình độ: {req.creatorLevel}
                              </Badge>
                            </div>

                            {/* Sport Title */}
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Badge
                                style={{
                                  background: req.sport === 'Pickleball' ? '#fef3c7' :
                                    req.sport === 'Cầu lông' ? '#dcfce7' :
                                      req.sport === 'Bóng đá' ? '#dbeafe' : '#fce7f3',
                                  color: req.sport === 'Pickleball' ? '#d97706' :
                                    req.sport === 'Cầu lông' ? '#15803d' :
                                      req.sport === 'Bóng đá' ? '#1d4ed8' : '#be185d',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}
                              >
                                {req.sport.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Title & Description */}
                            <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '18px', lineHeight: '1.4' }}>{req.title}</h5>
                            <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>{req.description}</p>

                            {/* Details Block */}
                            <div className="bg-light rounded-3 p-3 mb-4" style={{ fontSize: '13px' }}>
                              <div className="d-flex align-items-center gap-2 mb-2 text-dark">
                                <span className="material-symbols-outlined text-muted fs-5">apartment</span>
                                <span className="fw-semibold">{req.venueName}</span>
                              </div>
                              <div className="d-flex align-items-center gap-2 mb-2 text-dark">
                                <span className="material-symbols-outlined text-muted fs-5">schedule</span>
                                <span>{req.timeSlot}</span>
                              </div>
                              <div className="d-flex align-items-center gap-2 text-dark">
                                <span className="material-symbols-outlined text-muted fs-5">calendar_today</span>
                                <span>{req.dateStr}</span>
                              </div>
                            </div>

                            {/* Slots Progress Bar */}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px' }}>
                                <span className="text-muted fw-medium">Tiến độ tuyển thành viên</span>
                                <span className="fw-bold text-dark">{req.participants.length}/{req.slotsTotal} Slots</span>
                              </div>
                              <ProgressBar
                                now={progress}
                                variant={isFull ? "success" : "info"}
                                style={{ height: '6px', borderRadius: '99px' }}
                              />
                            </div>

                            {/* Participants List */}
                            <div className="mb-4">
                              <span className="text-muted d-block small mb-2 fw-semibold" style={{ fontSize: '11.5px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Thành viên ({req.participants.length}):</span>
                              <div className="d-flex flex-wrap gap-2 align-items-center">
                                {req.participants.map(p => {
                                  const isMe = currentUser && p._id === currentUser.id;
                                  const name = p.fullName || 'Người chơi';
                                  const avatar = p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`;
                                  return (
                                    <div
                                      key={p._id}
                                      className="d-flex align-items-center gap-1 bg-white border px-2 py-1 rounded-pill cursor-pointer hover-bg-gray position-relative shadow-sm"
                                      style={{ fontSize: '12px', transition: 'all 0.15s', border: '1px solid #e2e8f0' }}
                                      onClick={() => {
                                        if (isMe) {
                                          alert("Bạn không thể tự đánh giá chính mình.");
                                        } else {
                                          setRatingTargetPlayer(p);
                                          setShowRateModal(true);
                                        }
                                      }}
                                      title={isMe ? `${name} (Bạn)` : `Click để xem thông tin & đánh giá ${name}`}
                                    >
                                      <img
                                        src={avatar}
                                        alt={name}
                                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                                      />
                                      <span className="fw-bold" style={{ color: '#334155' }}>
                                        {isMe ? 'Bạn' : name.split(' ').pop()}
                                      </span>
                                      {!isMe && (
                                        <span className="material-symbols-outlined text-warning" style={{ fontSize: '14px', marginLeft: '2px' }}>
                                          star
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                              {isCreator ? (
                                <Button
                                  onClick={() => handleDelete(req._id, req.title)}
                                  variant="danger"
                                  className="flex-grow-1 fw-bold rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                                  style={{ fontSize: '14px' }}
                                >
                                  <span className="material-symbols-outlined fs-5">delete</span>
                                  Hủy tin đăng
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleJoin(req)}
                                  variant={hasJoined ? "success" : isFull ? "secondary" : "outline-success"}
                                  className="flex-grow-1 fw-bold rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                                  style={{
                                    fontSize: '14px',
                                    background: hasJoined ? '#0f3d22' : '',
                                    borderColor: hasJoined ? '#0f3d22' : '',
                                  }}
                                  disabled={isFull && !hasJoined}
                                >
                                  {hasJoined ? (
                                    <>
                                      <span className="material-symbols-outlined fs-5">task_alt</span>
                                      Đã tham gia
                                    </>
                                  ) : isFull ? (
                                    'Đã đủ người'
                                  ) : (
                                    <>
                                      <span className="material-symbols-outlined fs-5">add</span>
                                      Tham gia ngay
                                    </>
                                  )}
                                </Button>
                              )}

                              <Button
                                variant="light"
                                className="border rounded-3 p-2 d-flex align-items-center justify-content-center"
                                style={{ width: '42px', height: '42px' }}
                                onClick={() => handleChatWithCreator(req.creator?._id)}
                                disabled={isCreator}
                              >
                                <span className="material-symbols-outlined text-success" style={{ color: isCreator ? '#cbd5e1' : '#16a34a' }}>chat</span>
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '64px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', border: '1px dashed #e2e8f0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '40px' }}>group</span>
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Không tìm thấy yêu cầu phù hợp</h4>
                  <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '460px', fontSize: '14.5px', lineHeight: '1.6' }}>
                    Hiện tại chưa có người chơi nào đăng tin tìm bạn chơi trùng khớp với bộ lọc của bạn. Hãy thử thay đổi bộ môn hoặc tự tạo tin đăng của riêng bạn!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    style={{ background: '#0f3d22', border: 'none', fontWeight: 700, padding: '10px 24px', borderRadius: '10px' }}
                  >
                    Tạo Yêu Cầu Tìm Bạn Ngay
                  </Button>
                </div>
              )}
                        </Col>
          </Row>
        </Container>

        {/* Footer sits naturally at the bottom of the scrollable container */}
        <div className="mt-5 w-100">
          <Footer />
        </div>
      </div>

      {/* Floating Plus Button for Mobile/Tablet */}
      <div
        className="d-lg-none position-fixed"
        style={{ right: '24px', bottom: '24px', zIndex: 1000 }}
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0f3d22', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined fs-2 text-white">add</span>
        </Button>
      </div>

      {/* Create Request Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-success" style={{ fontSize: '28px', color: '#1a6b3c' }}>add_circle</span>
            Đăng tin Tìm bạn chơi cùng
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body className="px-4 pb-4">
            {validationError && (
              <Alert variant="danger" className="py-2 px-3 border-0 rounded-3 small mb-3" onClose={() => setValidationError(null)} dismissible>
                {validationError}
              </Alert>
            )}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">MÔN THỂ THAO *</Form.Label>
                  <Form.Select
                    value={newSport}
                    onChange={e => setNewSport(e.target.value as any)}
                    className="py-2 border"
                  >
                    <option value="Pickleball">Pickleball</option>
                    <option value="Cầu lông">Cầu lông</option>
                    <option value="Bóng đá">Bóng đá</option>
                    <option value="Tennis">Tennis</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">TRÌNH ĐỘ YÊU CẦU *</Form.Label>
                  <Form.Select
                    value={newLevel}
                    onChange={e => setNewLevel(e.target.value as any)}
                    className="py-2 border"
                  >
                    <option value="Mới chơi">Mới chơi (Beginner)</option>
                    <option value="Trung bình">Trung bình (Intermediate)</option>
                    <option value="Khá / Pro">Khá / Pro (Advanced)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">TIÊU ĐỀ BÀI ĐĂNG *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Cần 2 người đánh đôi Pickleball tối thứ 3 giao lưu vui vẻ"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    className="py-2 border"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">ĐỊA ĐIỂM / TÊN SÂN *</Form.Label>
                  {(() => {
                    const key = mapPlaymateSportToVenueSport(newSport);
                    const filtered = verifiedVenues.filter(v => v.sportTypes.some(s => s.toLowerCase() === key));
                    if (filtered.length > 0) {
                      return (
                        <div className="d-flex flex-column gap-2">
                          <Form.Select
                            value={isCustomVenue ? 'custom' : newVenue}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                setIsCustomVenue(true);
                                setNewVenue('');
                              } else {
                                setIsCustomVenue(false);
                                setNewVenue(val);
                              }
                            }}
                            className="py-2 border"
                          >
                            {filtered.map(v => (
                              <option key={v._id} value={v.name}>{v.name}</option>
                            ))}
                            <option value="custom">Tự nhập địa điểm khác...</option>
                          </Form.Select>
                          {isCustomVenue && (
                            <Form.Control
                              type="text"
                              placeholder="VD: Sân EZSport Arena Central - Sân số 3"
                              value={newVenue}
                              onChange={e => setNewVenue(e.target.value)}
                              required
                              className="py-2 border"
                            />
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <Form.Control
                          type="text"
                          placeholder="VD: Sân EZSport Arena Central - Sân số 3"
                          value={newVenue}
                          onChange={e => setNewVenue(e.target.value)}
                          required
                          className="py-2 border"
                        />
                      );
                    }
                  })()}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">NGÀY CHƠI *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Thứ Ba, 19/05/2026"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    required
                    className="py-2 border"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">KHUNG GIỜ *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: 18:00 - 20:00"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    required
                    className="py-2 border"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">SỐ LƯỢT SLOTS CẦN *</Form.Label>
                  <Form.Control
                    type="number"
                    min={2}
                    max={20}
                    value={newSlots}
                    onChange={e => setNewSlots(parseInt(e.target.value, 10))}
                    required
                    className="py-2 border"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">MÔ TẢ CHI TIẾT LỜI MỜI</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Mô tả cụ thể hơn: mục tiêu trận đấu, hình thức chia sẻ chi phí nước nôi bóng nảy..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="border"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 pt-0">
            <Button variant="light" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border">Hủy bỏ</Button>
            <Button
              type="submit"
              style={{ background: '#0f3d22', border: 'none', fontWeight: 700 }}
              className="px-4 py-2"
            >
              Đăng tin ngay
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Player Rating Modal */}
      <Modal show={showRateModal} onHide={() => { setShowRateModal(false); setRatingTargetPlayer(null); }} centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-warning" style={{ fontSize: '28px' }}>star</span>
            Đánh giá người chơi
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {ratingTargetPlayer && (
            <div>
              {/* Target Player Info */}
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
                <img
                  src={ratingTargetPlayer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ratingTargetPlayer.fullName)}&background=16a34a&color=fff`}
                  alt={ratingTargetPlayer.fullName}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h5 className="fw-bold text-dark mb-1">{ratingTargetPlayer.fullName}</h5>
                  {loadingRatings ? (
                    <Spinner size="sm" animation="border" variant="warning" />
                  ) : (
                    <div className="d-flex align-items-center gap-2 text-warning fw-bold" style={{ fontSize: '14.5px' }}>
                      <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>star</span>
                      <span>{playerStats?.averageRating || 0} / 5</span>
                      <span className="text-secondary fw-normal">({playerStats?.totalRatings || 0} lượt đánh giá)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review History */}
              <h6 className="fw-bold text-dark mb-3">Nhận xét từ cộng đồng</h6>
              <div className="mb-4 overflow-auto" style={{ maxHeight: '200px' }}>
                {loadingRatings ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" variant="success" size="sm" />
                  </div>
                ) : playerRatings.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {playerRatings.map(r => {
                      const reviewerName = r.reviewer && typeof r.reviewer === 'object' ? r.reviewer.fullName : 'Thành viên';
                      const reviewerAvatar = r.reviewer && typeof r.reviewer === 'object' && r.reviewer.avatar ? r.reviewer.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=1a6b3c&color=fff`;
                      const ratingDate = new Date(r.createdAt).toLocaleDateString('vi-VN');
                      return (
                        <div key={r._id} className="border-bottom pb-2">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={reviewerAvatar}
                                alt={reviewerName}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{reviewerName}</span>
                            </div>
                            <div className="d-flex align-items-center gap-1 text-warning">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined" style={{ fontSize: '12.5px', color: i < r.rating ? '#eab308' : '#cbd5e1' }}>star</span>
                              ))}
                              <span className="text-muted small ms-1" style={{ fontSize: '11px' }}>{ratingDate}</span>
                            </div>
                          </div>
                          {r.comment && <p className="text-secondary small mb-0 px-4">{r.comment}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted small py-3">Chưa có nhận xét nào dành cho người chơi này.</p>
                )}
              </div>

              {/* Add/Edit Review Form */}
              <hr />
              <Form onSubmit={handleRateSubmit}>
                <h6 className="fw-bold text-dark mb-3">Đánh giá của bạn</h6>
                
                {/* Stars selector */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small d-block">SỐ SAO *</Form.Label>
                  <div className="d-flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => {
                      const active = star <= ratingScore;
                      return (
                        <span
                          key={star}
                          className="material-symbols-outlined cursor-pointer text-warning"
                          style={{ fontSize: '32px', color: active ? '#eab308' : '#cbd5e1', transition: 'color 0.15s' }}
                          onClick={() => setRatingScore(star)}
                        >
                          star
                        </span>
                      );
                    })}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary small">Ý KIẾN / BÌNH LUẬN</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Nhập ý kiến nhận xét của bạn về thái độ chơi, trình độ..."
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    className="border"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="light" onClick={() => { setShowRateModal(false); setRatingTargetPlayer(null); }} className="px-4 py-2 border">Hủy</Button>
                  <Button
                    type="submit"
                    disabled={submittingRating}
                    style={{ background: '#0f3d22', border: 'none', fontWeight: 700 }}
                    className="px-4 py-2"
                  >
                    {submittingRating ? <Spinner size="sm" /> : 'Gửi Đánh Giá'}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Dynamic Toast Success Popup */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 2000 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={4000} autohide className="bg-success text-white rounded-3 shadow-lg border-0">
          <Toast.Header className="bg-success text-white border-0 rounded-t-3">
            <span className="material-symbols-outlined me-2">sports_handball</span>
            <strong className="me-auto">Cộng đồng EZSport</strong>
            <small>Vừa xong</small>
          </Toast.Header>
          <Toast.Body className="fw-bold">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};
