import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, ProgressBar, Toast, ToastContainer } from 'react-bootstrap';
import Footer from '../shared/Footer';

interface PlaymatesPageProps {
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

interface MatchRequest {
  id: string;
  creatorName: string;
  creatorAvatar: string;
  creatorLevel: 'Mới chơi' | 'Trung bình' | 'Khá / Pro';
  sport: 'Pickleball' | 'Cầu lông' | 'Bóng đá' | 'Tennis';
  title: string;
  description: string;
  venueName: string;
  timeSlot: string;
  dateStr: string;
  slotsTotal: number;
  slotsFilled: number;
  hasJoined: boolean;
}

export const PlaymatesPage: React.FC<PlaymatesPageProps> = () => {
  // State for matchmaking requests
  const [requests, setRequests] = useState<MatchRequest[]>([
    {
      id: '1',
      creatorName: 'Nguyễn Hoàng Nam',
      creatorAvatar: 'https://i.pravatar.cc/150?img=33',
      creatorLevel: 'Trung bình',
      sport: 'Pickleball',
      title: 'Tìm 2 bạn đánh đôi Pickleball tối thứ 3',
      description: 'Đã đặt sẵn sân 2 giờ, tìm 2 bạn trình độ trung bình vào giao lưu cọ xát vui vẻ, share tiền nước trà đá sau trận.',
      venueName: 'EZSport Arena Central - Sân số 3',
      timeSlot: '18:00 - 20:00',
      dateStr: 'Thứ 3, 19/05/2026',
      slotsTotal: 4,
      slotsFilled: 2,
      hasJoined: false
    },
    {
      id: '2',
      creatorName: 'Trần Thị Mai',
      creatorAvatar: 'https://i.pravatar.cc/150?img=47',
      creatorLevel: 'Mới chơi',
      sport: 'Cầu lông',
      title: 'Giao lưu cầu lông sáng sớm giữ dáng',
      description: 'Tìm 1 bạn nữ đánh đôi hoặc đánh đơn sáng sớm rèn luyện sức khỏe. Sân trong nhà mát mẻ, đã chuẩn bị sẵn cầu.',
      venueName: 'CLB Cầu Lông Sông Hàn',
      timeSlot: '06:00 - 08:00',
      dateStr: 'Thứ 4, 20/05/2026',
      slotsTotal: 2,
      slotsFilled: 1,
      hasJoined: false
    },
    {
      id: '3',
      creatorName: 'Lê Minh Quân',
      creatorAvatar: 'https://i.pravatar.cc/150?img=12',
      creatorLevel: 'Khá / Pro',
      sport: 'Bóng đá',
      title: 'Cần 3 chân sút đá phủi sân 7 người',
      description: 'Đội văn phòng thiếu người cho trận đá tối. Yêu cầu trình độ khá, chạy nhiệt tình, bóng đá sạch sẽ không va chạm mạnh.',
      venueName: 'Tuyên Sơn Sport Complex - Sân 7B',
      timeSlot: '20:00 - 21:30',
      dateStr: 'Thứ 5, 21/05/2026',
      slotsTotal: 7,
      slotsFilled: 4,
      hasJoined: false
    },
    {
      id: '4',
      creatorName: 'Hoàng Anh Tuấn',
      creatorAvatar: 'https://i.pravatar.cc/150?img=15',
      creatorLevel: 'Trung bình',
      sport: 'Tennis',
      title: 'Tìm đối thủ giao hữu Tennis tối cuối tuần',
      description: 'Tìm bác nào rảnh tối thứ 7 làm vài sét Tennis giao lưu. Mình chơi được khoảng 1 năm, lối chơi cởi mở.',
      venueName: 'Sân Tennis Chi Lăng',
      timeSlot: '17:00 - 19:00',
      dateStr: 'Thứ Bảy, 23/05/2026',
      slotsTotal: 2,
      slotsFilled: 1,
      hasJoined: false
    }
  ]);

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

  // Toast notification states
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchSport = selectedSport === 'Tất cả' || req.sport === selectedSport;
    const matchLevel = selectedLevel === 'Tất cả' || req.creatorLevel === selectedLevel;
    const matchSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.venueName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchLevel && matchSearch;
  });

  // Handle join request
  const handleJoin = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (req.hasJoined) {
          // Leave
          setToastMessage(`Đã rút khỏi nhóm: "${req.title}"`);
          setShowToast(true);
          return { ...req, slotsFilled: req.slotsFilled - 1, hasJoined: false };
        } else {
          // Join
          if (req.slotsFilled >= req.slotsTotal) {
            alert('Rất tiếc! Nhóm đấu này đã đủ người tham gia.');
            return req;
          }
          setToastMessage(`Chúc mừng! Bạn đã tham gia thành công trận đấu: "${req.title}"`);
          setShowToast(true);
          return { ...req, slotsFilled: req.slotsFilled + 1, hasJoined: true };
        }
      }
      return req;
    }));
  };

  // Handle submit new request
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVenue.trim()) {
      alert('Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }

    const newReq: MatchRequest = {
      id: Date.now().toString(),
      creatorName: 'Nguyễn Sư Minh Nhật', // current logged in player
      creatorAvatar: 'https://i.pravatar.cc/150?img=11',
      creatorLevel: newLevel,
      sport: newSport,
      title: newTitle,
      description: newDesc || 'Tìm bạn chơi cùng giao lưu thể thao lành mạnh!',
      venueName: newVenue,
      timeSlot: newTime,
      dateStr: newDate,
      slotsTotal: newSlots,
      slotsFilled: 1, // creator is the first one
      hasJoined: true
    };

    setRequests(prev => [newReq, ...prev]);
    setShowCreateModal(false);
    setToastMessage('Đã đăng yêu cầu tìm bạn chơi thành công!');
    setShowToast(true);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewVenue('');
  };

  return (
    <div className="vh-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                      src="https://i.pravatar.cc/150?img=11"
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
                        }}
                      >
                        <span className="material-symbols-outlined fs-5">close</span>
                      </Button>
                    </div>
                    <Form onSubmit={(e) => {
                      handleCreateSubmit(e);
                      setIsQuickPostExpanded(false); // collapse on submit!
                    }}>
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
                            <Form.Control
                              type="text"
                              placeholder="VD: Sân EZSport Arena..."
                              value={newVenue}
                              onChange={e => setNewVenue(e.target.value)}
                              required
                              className="py-2 border-0 bg-light rounded-3"
                              style={{ fontSize: '13px' }}
                            />
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

              {filteredRequests.length > 0 ? (
                <Row className="g-4">
                  {filteredRequests.map(req => {
                    const progress = (req.slotsFilled / req.slotsTotal) * 100;
                    const isFull = req.slotsFilled >= req.slotsTotal;

                    return (
                      <Col md={6} key={req.id}>
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
                                  src={req.creatorAvatar}
                                  alt={req.creatorName}
                                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>{req.creatorName}</h6>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>Người tạo</span>
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
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '12px' }}>
                                <span className="text-muted fw-medium">Tiến độ tuyển thành viên</span>
                                <span className="fw-bold text-dark">{req.slotsFilled}/{req.slotsTotal} Slots</span>
                              </div>
                              <ProgressBar
                                now={progress}
                                variant={isFull ? "success" : "info"}
                                style={{ height: '6px', borderRadius: '99px' }}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                              <Button
                                onClick={() => handleJoin(req.id)}
                                variant={req.hasJoined ? "success" : isFull ? "secondary" : "outline-success"}
                                className="flex-grow-1 fw-bold rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                                style={{
                                  fontSize: '14px',
                                  background: req.hasJoined ? '#0f3d22' : '',
                                  borderColor: req.hasJoined ? '#0f3d22' : '',
                                }}
                                disabled={isFull && !req.hasJoined}
                              >
                                {req.hasJoined ? (
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

                              <Button
                                variant="light"
                                className="border rounded-3 p-2 d-flex align-items-center justify-content-center"
                                style={{ width: '42px', height: '42px' }}
                                onClick={() => alert(`Tính năng nhắn tin nhanh tới ${req.creatorName} đang được kết nối!`)}
                              >
                                <span className="material-symbols-outlined text-success">chat</span>
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
                  <Form.Control
                    type="text"
                    placeholder="VD: Sân EZSport Arena Central - Sân số 3"
                    value={newVenue}
                    onChange={e => setNewVenue(e.target.value)}
                    required
                    className="py-2 border"
                  />
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
