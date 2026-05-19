import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { G, W, TX, TX2 } from '../utils/theme';
import Footer from './Footer';

interface BookingSuccessPageProps {
  onGoHome: () => void;
  onViewMyBookings?: () => void;
  bookingCode?: string;
  email?: string;
}

export const BookingSuccessPage: React.FC<BookingSuccessPageProps> = ({
  onGoHome,
  onViewMyBookings,
  bookingCode = '#SP2025051901',
  email = 'an.nguyen@email.com'
}) => {
  const [showBanner, setShowBanner] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Inter', sans-serif" }}>

      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5">
        <Card style={{
          maxWidth: '640px',
          width: '100%',
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          <Card.Body className="p-5 d-flex flex-column align-items-center text-center">

            {/* Header / Success Icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: G,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
            }}>
              <span className="material-symbols-outlined" style={{ color: W, fontSize: '32px', fontWeight: 600 }}>check</span>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 800, color: TX, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Đặt sân thành công!
            </h2>
            <p style={{ color: TX2, fontSize: '15px', marginBottom: '24px' }}>
              Xác nhận đã được gửi đến <span style={{ fontWeight: 600, color: TX }}>{email}</span>
            </p>

            {/* Booking Code Badge */}
            <div
              onClick={handleCopy}
              style={{
                background: '#eff6ff', color: '#1e40af', padding: '8px 16px', borderRadius: '999px',
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px',
                fontSize: '14px', fontWeight: 600, border: '1px solid #bfdbfe', transition: 'all 0.2s'
              }}
            >
              <span>Mã đặt sân: {bookingCode}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {copied ? 'check' : 'content_copy'}
              </span>
            </div>

            {/* Booking Details Card */}
            <div style={{
              background: '#f1f5f9', borderRadius: '16px', padding: '24px', width: '100%',
              textAlign: 'left', marginBottom: '32px'
            }}>
              <h6 style={{ fontSize: '11px', fontWeight: 700, color: TX2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                Chi tiết đặt sân
              </h6>

              <Row>
                <Col md={8}>
                  <Row className="gy-4">
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Sân</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>EZSport Arena Central</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Loại sân</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: TX }}>Cầu lông</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Địa chỉ</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: TX }}>81C Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Sân số</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: TX }}>Sân B2</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Ngày</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>Thứ 6, 16/05/2025</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Thời lượng</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: TX }}>2 giờ</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Giờ</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: G }}>18:00 - 20:00</div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ fontSize: '13px', color: TX2, marginBottom: '4px' }}>Tổng tiền</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: TX }}>235,000đ</div>
                    </Col>
                  </Row>
                </Col>
                <Col md={4} className="d-flex align-items-center justify-content-end mt-4 mt-md-0">
                  <img
                    src="/images/badminton.png"
                    alt="Court"
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </Col>
              </Row>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button style={{
                background: '#0f172a', border: 'none', borderRadius: '999px', padding: '12px 24px',
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                Thêm vào lịch
              </Button>
              <Button
                onClick={onViewMyBookings}
                style={{
                  background: 'transparent', border: '1.5px solid #cbd5e1', color: TX, borderRadius: '999px',
                  padding: '12px 24px', fontWeight: 600, fontSize: '14px'
                }}>
                Xem lịch đặt sân của tôi
              </Button>
            </div>

            <div onClick={onGoHome} style={{ color: '#2563eb', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Về trang chủ <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>

            {/* Cross-sell Section */}
            <div style={{ width: '100%', marginTop: '40px', background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <h6 style={{ fontSize: '13px', fontWeight: 700, color: TX, marginBottom: '16px' }}>Bạn có muốn...</h6>
              <Row className="g-3">
                <Col md={6}>
                  <div style={{ background: W, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_bag</span>
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      <div style={{ color: TX2 }}>Mua thiết bị thể thao?</div>
                      <div style={{ color: '#3b82f6', fontWeight: 600 }}>Xem Shop</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div style={{ background: W, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>groups</span>
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      <div style={{ color: TX2 }}>Tìm đối thủ cùng trình độ?</div>
                      <div style={{ color: '#22c55e', fontWeight: 600 }}>Tham gia cộng đồng</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

          </Card.Body>
        </Card>
      </Container>

      {/* Floating Reward Banner */}
      {showBanner && (
        <div style={{
          position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: 1000,
          background: '#eab308', padding: '16px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '640px', width: '100%', justifyContent: 'center', position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ color: '#713f12', fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span style={{ color: '#713f12', fontWeight: 700, fontSize: '15px' }}>
              Bạn vừa nhận được +150 điểm thưởng từ lượt đặt này!
            </span>
            <span
              className="material-symbols-outlined"
              onClick={() => setShowBanner(false)}
              style={{ position: 'absolute', right: '0', cursor: 'pointer', color: '#713f12', fontSize: '20px' }}
            >
              close
            </span>
          </div>
        </div>
      )}

      {/* Reusing existing Footer, but simpler background to match */}
      <div style={{ background: '#07160a', marginTop: 'auto' }}>
        <Footer />
      </div>
    </div>
  );
};
