import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge, Form, Card } from 'react-bootstrap';
import Navigation from './Navigation';
import Footer from './Footer';

interface CourtDetailProps {
  courtId: number;
  onBackClick: () => void;
  onConfirmBooking?: (bookingDetails: any) => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

export const CourtDetail: React.FC<CourtDetailProps> = ({ courtId, onBackClick, onConfirmBooking, onPageChange, onLogoClick }) => {
  const [selectedDate, setSelectedDate] = useState<number>(18); // default MON 18
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('2 Giờ');
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Mock data for EZSport Arena Central (ID: 1)
  const venue = {
    name: 'EZSport Arena Central',
    location: '81C Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
    rating: 4.9,
    reviewsCount: 1128,
    price: 180,
    openHours: '06:00 - 22:00',
    sports: ['PICKLEBALL', 'CẦU LÔNG'],
    description:
      'Chào mừng bạn đến với EZSport Arena Central, điểm đến thể thao hàng đầu tại Đà Nẵng. Cơ sở của chúng tôi cung cấp các sân đấu trong nhà đẳng cấp quốc tế được thiết kế đặc biệt cho Pickleball và Cầu lông hiệu suất cao. Với hệ thống chiếu sáng đạt chuẩn thi đấu và mặt sàn tiêu chuẩn Olympic, chúng tôi mang đến môi trường không thể tuyệt vời hơn cho cả vận động viên chuyên nghiệp lẫn người chơi phong trào.\n\nVị trí trung tâm giúp chúng tôi trở thành điểm đến hoàn hảo cho các buổi tập sáng sớm, các trận đấu giờ nghỉ trưa hay các giải đấu buổi tối. Đội ngũ nhân viên chuyên nghiệp của chúng tôi luôn tận tâm đảm bảo trải nghiệm của bạn luôn mượt mà, từ lúc nhận sân cho đến lúc nghỉ ngơi tại khu vực phòng chờ cao cấp.',
    amenities: [
      { name: 'Bãi đậu xe miễn phí', icon: 'local_parking' },
      { name: 'Tủ đồ & Phòng tắm', icon: 'shower' },
      { name: 'Wi-Fi miễn phí', icon: 'wifi' },
      { name: 'Cà phê thể thao', icon: 'local_cafe' }
    ]
  };

  const dates = [
    { day: 'MON', num: 18 },
    { day: 'TUE', num: 19 },
    { day: 'WED', num: 20 },
    { day: 'THU', num: 21 },
    { day: 'FRI', num: 22 }
  ];

  const timeSlots = [
    { time: '07:00', disabled: true },
    { time: '08:00', disabled: false },
    { time: '09:00', disabled: false },
    { time: '10:00', disabled: true },
    { time: '11:00', disabled: true },
    { time: '12:00', disabled: true },
    { time: '13:00', disabled: false },
    { time: '14:00', disabled: false },
    { time: '15:00', disabled: false }
  ];

  const handleBooking = () => {
    if (onConfirmBooking) {
      onConfirmBooking({
        courtId,
        date: `2026-05-${selectedDate}`,
        time: selectedTime,
        duration,
        totalPrice: 375000
      });
    } else {
      alert(`Đặt sân thành công!\nSân: ${venue.name}\nNgày: Thứ Hai, ngày ${selectedDate}/05/2026\nGiờ: ${selectedTime} (${duration})\nTổng cộng: 375.000đ`);
    }
  };

  return (
    <div className="vh-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation */}
      <Navigation
        currentPage="venues"
        onLogoClick={onLogoClick || onBackClick}
        onPageChange={onPageChange || onBackClick}
      />

      {/* Main Content Area */}
      <div className="overflow-auto flex-grow-1 py-4">
        <Container>

          {/* Back Button */}
          <Button
            variant="link"
            onClick={onBackClick}
            className="text-success fw-semibold p-0 mb-3 d-flex align-items-center gap-1 border-0 shadow-none hover-scale"
            style={{ color: '#1a6b3c !important', textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined fs-5">arrow_back</span>
            Quay lại danh sách
          </Button>

          {/* Premium Image Gallery Grid */}
          <Row className="g-3 mb-4">
            {/* Left Big Main Image Card */}
            <Col lg={6}>
              <div
                className="position-relative overflow-hidden w-100 shadow-sm"
                style={{ height: '450px', borderRadius: '24px' }}
              >
                <img
                  src="/images/pickleball.png"
                  alt="Main Arena"
                  className="w-100 h-100 object-fit-cover"
                />
                {/* Dark Gradient Overlay */}
                <div
                  className="position-absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                  }}
                />
                {/* Text overlays */}
                <div className="position-absolute bottom-0 start-0 m-4 text-white">
                  <div className="d-flex align-items-center gap-1 small opacity-75 mb-2" style={{ fontSize: '13px' }}>
                    <span>Danh sách sân</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chevron_right</span>
                    <span>Đà Nẵng</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chevron_right</span>
                    <span>Ngũ Hành Sơn</span>
                  </div>

                  <h2 className="fw-extrabold mb-3" style={{ fontSize: '32px', fontWeight: 800 }}>
                    {venue.name}
                  </h2>

                  <div className="d-flex align-items-center gap-3">
                    <Badge className="bg-success rounded-pill px-3 py-2 text-uppercase fw-bold border-0" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
                      ✓ Cơ sở xác thực
                    </Badge>
                    <div className="d-flex align-items-center gap-1">
                      <span className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>star</span>
                      <span className="fw-bold">{venue.rating}</span>
                      <span className="opacity-75">({venue.reviewsCount} Đánh giá)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right 2x2 Small Images Grid */}
            <Col lg={6}>
              <Row className="g-3 h-100">
                <Col sm={6}>
                  <div className="overflow-hidden shadow-sm" style={{ height: '217px', borderRadius: '18px' }}>
                    <img
                      src="/images/badminton.png"
                      alt="Court view 1"
                      className="w-100 h-100 object-fit-cover hover-scale"
                    />
                  </div>
                </Col>

                <Col sm={6}>
                  <div className="position-relative overflow-hidden shadow-sm" style={{ height: '217px', borderRadius: '18px' }}>
                    <img
                      src="/images/football.png"
                      alt="Locker view"
                      className="w-100 h-100 object-fit-cover hover-scale"
                    />
                    {/* Share and wishlist outline buttons in the top-right corner */}
                    <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
                      <Button
                        variant="white"
                        onClick={() => alert('Đã sao chép liên kết chia sẻ!')}
                        className="rounded-circle d-flex align-items-center justify-content-center border-0 p-0 shadow-sm"
                        style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
                      >
                        <span className="material-symbols-outlined text-dark fs-5">share</span>
                      </Button>
                      <Button
                        variant="white"
                        onClick={() => setIsLiked(!isLiked)}
                        className="rounded-circle d-flex align-items-center justify-content-center border-0 p-0 shadow-sm"
                        style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
                      >
                        <span className="material-symbols-outlined fs-5" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0", color: isLiked ? '#ef4444' : '#64748b' }}>favorite</span>
                      </Button>
                    </div>
                  </div>
                </Col>

                <Col sm={6}>
                  <div className="overflow-hidden shadow-sm" style={{ height: '217px', borderRadius: '18px' }}>
                    <img
                      src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"
                      alt="Player Lounge"
                      className="w-100 h-100 object-fit-cover hover-scale"
                    />
                  </div>
                </Col>

                <Col sm={6}>
                  <div className="position-relative overflow-hidden shadow-sm" style={{ height: '217px', borderRadius: '18px' }}>
                    <img
                      src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80"
                      alt="Tennis view"
                      className="w-100 h-100 object-fit-cover"
                    />
                    {/* Glassmorphic photo count overlay */}
                    <div
                      className="position-absolute inset-0 d-flex align-items-center justify-content-center"
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(2px)',
                        cursor: 'pointer'
                      }}
                    >
                      <span className="text-white fw-bold" style={{ fontSize: '16px', letterSpacing: '0.5px' }}>
                        + 12 Ảnh
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Main Content Details Panel */}
          <Row className="g-4">

            {/* Left Main column (65%) */}
            <Col lg={8}>

              {/* Title and Base information Card */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                  <div>
                    <h3 className="fw-bold text-dark mb-2" style={{ fontWeight: 800 }}>{venue.name}</h3>
                    <div className="d-flex gap-2">
                      {venue.sports.map(s => (
                        <Badge
                          key={s}
                          className="px-3 py-1.5 fw-bold text-success"
                          style={{ background: '#dcfce7', fontSize: '10px', letterSpacing: '0.5px' }}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm-end">
                    <span className="text-success fw-bold d-block" style={{ color: '#16a34a', fontSize: '15px' }}>
                      ● Mở cửa {venue.openHours}
                    </span>
                    <span className="text-muted small">Mỗi ngày bao gồm ngày lễ</span>
                  </div>
                </div>

                {/* Elongated gray Address block */}
                <div
                  className="d-flex justify-content-between align-items-center p-3 mt-3 w-100 flex-wrap gap-2"
                  style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-success" style={{ color: '#1a6b3c' }}>location_on</span>
                    <span className="text-dark fw-medium" style={{ fontSize: '14.5px' }}>{venue.location}</span>
                  </div>
                  <Button
                    variant="link"
                    className="text-success fw-bold p-0 shadow-none border-0"
                    style={{ color: '#1a6b3c !important', textDecoration: 'none', fontSize: '14px' }}
                    onClick={() => alert('Hiển thị chỉ đường trên bản đồ!')}
                  >
                    Xem trên bản đồ
                  </Button>
                </div>

                {/* Venue Amenities */}
                <h5 className="fw-bold text-dark mt-4 mb-3" style={{ fontWeight: 700 }}>Tiện ích sân</h5>
                <Row className="g-3">
                  {venue.amenities.map(amenity => (
                    <Col xs={6} sm={3} key={amenity.name}>
                      <div
                        className="d-flex align-items-center gap-2 p-3 w-100"
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <span className="material-symbols-outlined text-success" style={{ color: '#1a6b3c', fontSize: '20px' }}>
                          {amenity.icon}
                        </span>
                        <span className="text-dark fw-semibold" style={{ fontSize: '13px' }}>
                          {amenity.name}
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* About the Venue Card */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <h5 className="fw-bold text-dark mb-3" style={{ fontWeight: 700 }}>Về cơ sở này</h5>
                <div
                  className="text-secondary"
                  style={{
                    fontSize: '14.5px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {venue.description}
                </div>
              </Card>

              {/* Guest Reviews Card */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-dark m-0" style={{ fontWeight: 700 }}>Đánh giá của khách hàng</h5>
                  <Button
                    variant="link"
                    className="text-success fw-bold p-0 shadow-none border-0"
                    style={{ color: '#1a6b3c !important', textDecoration: 'none', fontSize: '14.5px' }}
                    onClick={() => alert('Tính năng Viết đánh giá sẽ khả dụng sau khi đặt sân!')}
                  >
                    Viết đánh giá
                  </Button>
                </div>

                {/* Rating display card */}
                <Row className="g-4 align-items-center mb-4">
                  <Col md={4} className="text-center border-end py-2">
                    <h1 className="fw-extrabold text-dark m-0" style={{ fontSize: '56px', fontWeight: 900 }}>
                      {venue.rating}
                    </h1>
                    <div className="d-flex justify-content-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1", fontSize: '22px' }}>
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-muted small">Dựa trên 1.259 đánh giá</span>
                  </Col>

                  <Col md={8}>
                    <div className="d-flex flex-column gap-2 px-3">
                      {[
                        { stars: 5, pct: 92, count: 916 },
                        { stars: 4, pct: 6, count: 62 },
                        { stars: 3, pct: 2, count: 21 },
                        { stars: 2, pct: 0, count: 0 },
                        { stars: 1, pct: 0, count: 0 }
                      ].map(row => (
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: '13px' }} key={row.stars}>
                          <span className="fw-bold text-secondary" style={{ width: '12px' }}>{row.stars}</span>
                          <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '6px' }}>
                            <div
                              className="h-100 bg-success rounded-pill"
                              style={{ width: `${row.pct}%`, background: '#16a34a' }}
                            />
                          </div>
                          <span className="text-muted" style={{ width: '30px', textAlign: 'right' }}>{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>

                {/* Reviews List */}
                <hr className="my-4 opacity-50" />
                <div className="d-flex flex-column gap-4">
                  {/* Review 1 */}
                  <div className="d-flex flex-column p-3 bg-light rounded-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src="https://ui-avatars.com/api/?name=Minh+Hoang&background=1a6b3c&color=fff"
                          alt="Minh Hoang"
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div>
                          <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>Minh Hoàng</span>
                          <span className="text-muted small">14 Th11, 2024</span>
                        </div>
                      </div>
                      <div className="d-flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-dark mb-0" style={{ fontSize: '13.5px', lineHeight: '1.5' }}>
                      "Sân pickleball tốt nhất tại Ngũ Hành Sơn. Ánh sáng tuyệt vời và mặt sàn rất êm ái cho đầu gối. Rất khuyên dùng quán cà phê ở đây!"
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div className="d-flex flex-column p-3 bg-light rounded-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src="https://ui-avatars.com/api/?name=Linh+Nguyen&background=1a6b3c&color=fff"
                          alt="Linh Nguyen"
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div>
                          <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>Linh Nguyễn</span>
                          <span className="text-muted small">28 Th10, 2024</span>
                        </div>
                      </div>
                      <div className="d-flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-dark mb-0" style={{ fontSize: '13.5px', lineHeight: '1.5' }}>
                      "Nơi hoàn hảo cho nhóm cầu lông hàng tuần của chúng tôi. Phòng thay đồ sạch sẽ hơn hầu hết các khách sạn 5 sao. Đặt sân qua ứng dụng siêu nhanh."
                    </p>
                  </div>
                </div>
              </Card>

              {/* Isometric Map Representation Card */}
              <div
                className="position-relative overflow-hidden w-100 shadow-sm"
                style={{ height: '300px', borderRadius: '24px', background: '#e2e8f0' }}
              >
                {/* Visual Placeholder for premium isometric grid map */}
                <div
                  className="w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                  style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)',
                    backgroundSize: '30px 30px',
                    backgroundPosition: '0 0, 15px 15px',
                    background: '#cbd5e1'
                  }}
                >
                  <div
                    className="p-4 bg-white shadow-lg text-center"
                    style={{ borderRadius: '20px', maxWidth: '300px' }}
                  >
                    <span className="material-symbols-outlined text-success fs-2 d-block mb-2" style={{ color: '#1a6b3c' }}>
                      location_on
                    </span>
                    <h6 className="fw-bold text-dark mb-1">{venue.name}</h6>
                    <span className="text-muted small d-block mb-3">{venue.location}</span>
                    <Button
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(venue.location)}`, '_blank')}
                      className="rounded-pill px-4 py-2 border-0 fw-bold"
                      style={{ background: '#0f172a', color: '#ffffff', fontSize: '11px', letterSpacing: '0.5px' }}
                    >
                      MỞ TRÊN GOOGLE MAPS
                    </Button>
                  </div>
                </div>
              </div>

            </Col>

            {/* Right Sticky booking widget column (35%) */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: '110px', zIndex: 10 }}>
                <Card
                  className="border-0 shadow-lg overflow-hidden w-100"
                  style={{
                    borderRadius: '24px',
                    borderTop: '6px solid #1a6b3c'
                  }}
                >
                  <Card.Body className="p-4">

                    {/* Price display header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <span className="text-muted small d-block" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          BẮT ĐẦU TỪ
                        </span>
                        <span className="fw-extrabold text-success fs-3" style={{ color: '#1a6b3c', fontWeight: 900 }}>
                          {venue.price}k<span className="text-muted fw-normal" style={{ fontSize: '14px' }}>/ giờ</span>
                        </span>
                      </div>
                      <Badge className="bg-light text-dark border py-2 px-3 rounded-pill fw-bold d-flex align-items-center gap-1">
                        <span className="material-symbols-outlined text-warning" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>flash_on</span>
                        Đặt ngay
                      </Badge>
                    </div>

                    {/* Date Selector */}
                    <h6 className="text-muted small fw-bold mb-2.5" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Chọn ngày
                    </h6>
                    <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
                      {dates.map(d => (
                        <div
                          key={d.num}
                          onClick={() => setSelectedDate(d.num)}
                          className="d-flex flex-column align-items-center justify-content-center p-2 flex-shrink-0 cursor-pointer"
                          style={{
                            width: '54px',
                            height: '62px',
                            borderRadius: '16px',
                            background: selectedDate === d.num ? '#1a6b3c' : '#ffffff',
                            color: selectedDate === d.num ? '#ffffff' : '#0f172a',
                            border: selectedDate === d.num ? '1px solid #1a6b3c' : '1px solid #e2e8f0',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span className="small fw-semibold opacity-75" style={{ fontSize: '10px' }}>{d.day}</span>
                          <span className="fw-bold fs-6">{d.num}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pick a Time slots */}
                    <h6 className="text-muted small fw-bold mb-2.5" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Chọn giờ
                    </h6>
                    <Row className="g-2 mb-4">
                      {timeSlots.map(slot => (
                        <Col xs={4} key={slot.time}>
                          <Button
                            disabled={slot.disabled}
                            variant={selectedTime === slot.time ? 'success' : 'light'}
                            onClick={() => setSelectedTime(slot.time)}
                            className="w-100 py-2.5 rounded-3 fw-bold shadow-none text-center"
                            style={{
                              background: slot.disabled
                                ? '#f8fafc'
                                : selectedTime === slot.time
                                  ? '#1a6b3c'
                                  : '#ffffff',
                              color: slot.disabled
                                ? '#cbd5e1'
                                : selectedTime === slot.time
                                  ? '#ffffff'
                                  : '#0f172a',
                              border: slot.disabled
                                ? '1px solid #f1f5f9'
                                : selectedTime === slot.time
                                  ? '1px solid #1a6b3c'
                                  : '1px solid #e2e8f0',
                              fontSize: '13px',
                              textDecoration: slot.disabled ? 'line-through' : 'none'
                            }}
                          >
                            {slot.time}
                          </Button>
                        </Col>
                      ))}
                    </Row>

                    {/* Duration selector */}
                    <h6 className="text-muted small fw-bold mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Thời lượng
                    </h6>
                    <Form.Select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="py-2.5 rounded-3 border-secondary mb-4 shadow-none"
                      style={{ fontSize: '14.5px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                    >
                      <option>1 Giờ</option>
                      <option>2 Giờ</option>
                      <option>3 Giờ</option>
                      <option>4 Giờ</option>
                    </Form.Select>

                    {/* Horizontal Divider */}
                    <hr className="my-4 opacity-50" style={{ borderStyle: 'dashed' }} />

                    {/* Price breakdown details */}
                    <div className="d-flex flex-column gap-2 mb-4" style={{ fontSize: '14px' }}>
                      <div className="d-flex justify-content-between text-secondary">
                        <span>Tiền sân ({duration === '1 Giờ' ? '1h' : duration === '2 Giờ' ? '2h' : duration === '3 Giờ' ? '3h' : '4h'} x {venue.price}k)</span>
                        <span className="fw-semibold text-dark">
                          {duration === '1 Giờ' ? '180.000đ' : duration === '2 Giờ' ? '360.000đ' : duration === '3 Giờ' ? '540.000đ' : '720.000đ'}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between text-secondary">
                        <span>Phí dịch vụ</span>
                        <span className="fw-semibold text-dark">15.000đ</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="fw-bold text-dark fs-5">Tổng cộng</span>
                        <span className="fw-extrabold text-success fs-4" style={{ color: '#1a6b3c', fontWeight: 900 }}>
                          {duration === '1 Giờ' ? '195.000đ' : duration === '2 Giờ' ? '375.000đ' : duration === '3 Giờ' ? '555.000đ' : '735.000đ'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Action Button */}
                    <Button
                      onClick={handleBooking}
                      className="w-100 py-3 rounded-pill fw-bold border-0 hover-scale mb-3"
                      style={{
                        background: '#1a6b3c',
                        color: '#ffffff',
                        fontSize: '15px',
                        boxShadow: '0 8px 24px rgba(26, 107, 60, 0.3)'
                      }}
                    >
                      Xác nhận đặt sân
                    </Button>

                    {/* Footer Trust badging */}
                    <div className="text-center mt-3 pt-2">
                      <span className="text-muted d-block mb-2" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        THANH TOÁN AN TOÀN BỞI
                      </span>
                      <div className="d-flex justify-content-center align-items-center gap-3 text-muted">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_balance_wallet</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>credit_card</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified_user</span>
                      </div>
                      <span className="text-muted d-block mt-2" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                        🛡️ GIAO DỊCH ĐƯỢC MÃ HÓA 256-BIT
                      </span>
                    </div>

                  </Card.Body>
                </Card>
              </div>
            </Col>

          </Row>

        </Container>

        {/* ── FOOTER ── */}
        <Footer />
      </div>
    </div>
  );
};
