import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navigation from '../shared/Navigation';
import { useBookingStore } from '../../store/bookingStore';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../context/AuthContext';

interface CheckoutPageProps {
  venueId: number | string;
  onBackClick: () => void;
  onSuccessClick: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ venueId: _venueId, onBackClick, onSuccessClick, onPageChange, onLogoClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { draft } = useBookingStore();
  
  const [usePoints, setUsePoints] = useState<boolean>(true);
  const [voucherCode, setVoucherCode] = useState<string>('EZSPORT50');
  const [appliedVoucher, setAppliedVoucher] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'zalopay' | 'card' | 'bank'>('card');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Visa card states
  const [cardNumber, setCardNumber] = useState<string>('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('***');
  const [cardName, setCardName] = useState<string>('NGUYEN VAN AN');

  // Booker info states - get from user or draft
  const [bookerName, setBookerName] = useState<string>(draft?.bookerName || user?.name || 'Nguyễn Văn An');
  const [bookerPhone, setBookerPhone] = useState<string>(draft?.bookerPhone || user?.phone || '090 123 4567');
  const [bookerEmail, setBookerEmail] = useState<string>(draft?.bookerEmail || user?.email || 'an.nguyen@email.com');

  useEffect(() => {
    if (!draft || !draft.slot) {
      setError('Không tìm thấy thông tin đặt sân. Vui lòng chọn lại.');
    }
  }, [draft]);

  // Booking details from draft
  const booking = draft ? {
    venueName: draft.courtName,
    sport: draft.sport,
    address: draft.courtAddress,
    image: draft.courtImage || '/images/badminton.png',
    date: draft.slot ? new Date(draft.slot.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    time: draft.slot ? `${draft.slot.startTime} - ${draft.slot.endTime}` : '',
    courtNo: draft.courtName || `Sân ${draft.courtId}`,
    duration: `${draft.slot?.duration || 0} giờ`,
    basePrice: draft.basePrice,
    serviceFee: draft.serviceFee,
    discount: draft.discount,
    pointsDiscount: draft.pointsUsed
  } : {
    venueName: 'EZSport Arena Central',
    sport: 'CẦU LÔNG',
    address: '81C Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
    image: '/images/badminton.png',
    date: 'Thứ 6, 16/05/2025',
    time: '18:00 - 20:00',
    courtNo: 'Sân B2',
    duration: '2 giờ',
    basePrice: 300000,
    serviceFee: 15000,
    discount: 30000,
    pointsDiscount: 50000
  };

  // Live order calculations
  const subtotal = booking.basePrice;
  const serviceFee = booking.serviceFee;
  const discountVal = appliedVoucher ? booking.discount : 0;
  const pointsVal = usePoints ? booking.pointsDiscount : 0;
  const total = subtotal + serviceFee - discountVal - pointsVal;

  const handleConfirmPayment = async () => {
    if (!draft || !draft.slot) {
      setError('Thông tin đặt sân không đầy đủ');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingPayload = {
        courtId: draft.courtId,
        bookingDate: new Date(draft.slot.date),
        startTime: draft.slot.startTime,
        endTime: draft.slot.endTime,
        duration: draft.slot.duration,
        sport: draft.sport,
        basePrice: subtotal,
        serviceFee: serviceFee,
        discount: discountVal,
        pointsUsed: usePoints ? 500 : 0,
        totalPrice: total,
        paymentMethod: paymentMethod,
        bookerName: bookerName,
        bookerPhone: bookerPhone.replace(/\s/g, ''),
        bookerEmail: bookerEmail,
        notes: '',
      };

      const createdBooking = await bookingService.createBooking(bookingPayload);

      // Sync final total back to store so BookingSuccessPage can display it
      useBookingStore.getState().setDraft({ totalPrice: total });
      useBookingStore.getState().setConfirmedBookingId(createdBooking._id);

      navigate(`/booking/success/${createdBooking._id}`);
      onSuccessClick();
    } catch (err: any) {
      console.error('Booking creation failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Tạo đơn đặt sân thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vh-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation Header */}
      <Navigation
        currentPage="venues"
        onLogoClick={onLogoClick || onBackClick}
        onPageChange={onPageChange || onBackClick}
      />

      {/* Main Content Area */}
      <div className="overflow-auto flex-grow-1 py-4">
        <Container>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
              <Alert.Heading>Lỗi!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {/* Breadcrumbs or Back Link */}
          <Button
            variant="link"
            onClick={onBackClick}
            className="text-success fw-semibold p-0 mb-3 d-flex align-items-center gap-1 border-0 shadow-none hover-scale"
            style={{ color: '#1a6b3c !important', textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined fs-5">arrow_back</span>
            Quay lại chi tiết sân
          </Button>

          <Row className="g-4">

            {/* Left Column: Form Details (65%) */}
            <Col lg={8}>

              {/* Block 1: Thông tin đặt sân */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark m-0" style={{ fontWeight: 800 }}>Thông tin đặt sân</h5>
                  <Button
                    variant="link"
                    onClick={() => alert('Thay đổi thông tin đặt sân!')}
                    className="text-success fw-bold p-0 shadow-none border-0"
                    style={{ color: '#1a6b3c !important', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Chỉnh sửa
                  </Button>
                </div>

                <div className="d-flex gap-3 align-items-center mb-4 flex-wrap flex-sm-nowrap">
                  <div className="overflow-hidden flex-shrink-0" style={{ width: '80px', height: '80px', borderRadius: '16px' }}>
                    <img
                      src={booking.image}
                      alt="Sunrise Premium"
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
                      <h6 className="fw-extrabold text-dark m-0" style={{ fontSize: '16.5px', fontWeight: 800 }}>
                        {booking.venueName}
                      </h6>
                      <Badge className="rounded-pill px-2.5 py-1 text-uppercase fw-bold border-0" style={{ fontSize: '9px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                        {booking.sport}
                      </Badge>
                    </div>
                    <div className="text-muted d-flex align-items-center gap-1 small">
                      <span className="material-symbols-outlined text-muted" style={{ fontSize: '15px' }}>location_on</span>
                      <span>{booking.address}</span>
                    </div>
                  </div>
                </div>

                {/* 4-Item Grid Details */}
                <hr className="my-3 opacity-50" />
                <Row className="g-3">
                  <Col xs={6} sm={3}>
                    <span className="text-muted small d-block mb-1">Ngày</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{booking.date}</span>
                  </Col>
                  <Col xs={6} sm={3}>
                    <span className="text-muted small d-block mb-1">Giờ</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{booking.time}</span>
                  </Col>
                  <Col xs={6} sm={3}>
                    <span className="text-muted small d-block mb-1">Sân</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{booking.courtNo}</span>
                  </Col>
                  <Col xs={6} sm={3}>
                    <span className="text-muted small d-block mb-1">Thời lượng</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{booking.duration}</span>
                  </Col>
                </Row>
              </Card>

              {/* Block 2: Thông tin người đặt */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark m-0" style={{ fontWeight: 800 }}>Thông tin người đặt</h5>
                  <Button
                    variant="link"
                    onClick={() => {
                      const name = prompt('Nhập họ và tên:', bookerName);
                      const phone = prompt('Nhập số điện thoại:', bookerPhone);
                      const email = prompt('Nhập email:', bookerEmail);
                      if (name) setBookerName(name);
                      if (phone) setBookerPhone(phone);
                      if (email) setBookerEmail(email);
                    }}
                    className="text-success fw-bold p-0 shadow-none border-0"
                    style={{ color: '#1a6b3c !important', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Chỉnh sửa
                  </Button>
                </div>

                <Row className="g-3">
                  <Col xs={12} sm={4}>
                    <span className="text-muted small d-block mb-1">HỌ VÀ TÊN</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>{bookerName}</span>
                  </Col>
                  <Col xs={12} sm={4}>
                    <span className="text-muted small d-block mb-1">SỐ ĐIỆN THOẠI</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>{bookerPhone}</span>
                  </Col>
                  <Col xs={12} sm={4}>
                    <span className="text-muted small d-block mb-1">EMAIL</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>{bookerEmail}</span>
                  </Col>
                </Row>
              </Card>

              {/* Block 3: Ưu đãi & Điểm thưởng */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <h5 className="fw-bold text-dark mb-3" style={{ fontWeight: 800 }}>Ưu đãi & Điểm thưởng</h5>

                {/* Promo Input */}
                <div className="mb-4">
                  <span className="text-muted small d-block mb-2">Mã giảm giá</span>
                  <InputGroup style={{ maxWidth: '400px' }}>
                    <Form.Control
                      placeholder="Nhập mã voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="py-2.5 rounded-start-3 border-secondary shadow-none"
                      style={{ fontSize: '14px' }}
                    />
                    <Button
                      onClick={() => {
                        setAppliedVoucher(!appliedVoucher);
                        if (!appliedVoucher) {
                          alert('Áp dụng mã giảm giá EZSPORT50 thành công!');
                        }
                      }}
                      className="px-4 fw-bold text-white"
                      style={{ background: '#0f172a', border: '1px solid #0f172a', fontSize: '13px' }}
                    >
                      {appliedVoucher ? 'Hủy' : 'Áp dụng'}
                    </Button>
                  </InputGroup>
                </div>

                {/* Points Reward Toggle switch */}
                <div
                  className="d-flex align-items-center justify-content-between p-3 rounded-4"
                  style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.03)' }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '36px', height: '36px', background: '#dcfce7' }}
                    >
                      <span className="material-symbols-outlined text-success" style={{ color: '#16a34a' }}>add_circle</span>
                    </div>
                    <div>
                      <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>
                        Dùng 500 điểm thưởng
                      </span>
                      <span className="text-muted small" style={{ fontSize: '12px' }}>
                        Tương đương 50.000đ
                      </span>
                    </div>
                  </div>
                  <Form.Check
                    type="switch"
                    id="points-toggle"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="custom-switch-success fs-4"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </Card>

              {/* Block 4: Phương thức thanh toán */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <h5 className="fw-bold text-dark mb-4" style={{ fontWeight: 800 }}>Phương thức thanh toán</h5>

                <div className="d-flex flex-column gap-3">

                  {/* Option 1: MoMo */}
                  <div
                    onClick={() => setPaymentMethod('momo')}
                    className="p-3 d-flex align-items-center justify-content-between cursor-pointer rounded-4"
                    style={{
                      border: paymentMethod === 'momo' ? '2px solid #1a6b3c' : '1px solid #cbd5e1',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      <Form.Check
                        type="radio"
                        checked={paymentMethod === 'momo'}
                        onChange={() => setPaymentMethod('momo')}
                        style={{ cursor: 'pointer' }}
                      />
                      <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: '#a50064' }}>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                          alt="MoMo"
                          className="w-75 h-75 object-fit-contain"
                        />
                      </div>
                      <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Ví điện tử MoMo</span>
                    </div>
                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>bolt</span>
                  </div>

                  {/* Option 2: ZaloPay */}
                  <div
                    onClick={() => setPaymentMethod('zalopay')}
                    className="p-3 d-flex align-items-center gap-2.5 cursor-pointer rounded-4"
                    style={{
                      border: paymentMethod === 'zalopay' ? '2px solid #1a6b3c' : '1px solid #cbd5e1',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <Form.Check
                      type="radio"
                      checked={paymentMethod === 'zalopay'}
                      onChange={() => setPaymentMethod('zalopay')}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center bg-info" style={{ width: '40px', height: '40px' }}>
                      <span className="text-white fw-bold" style={{ fontSize: '10px' }}>ZaloPay</span>
                    </div>
                    <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>ZaloPay</span>
                  </div>

                  {/* Option 3: Visa Card (Active & Expanded) */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className="d-flex flex-column rounded-4 overflow-hidden"
                    style={{
                      border: paymentMethod === 'card' ? '2px solid #1a6b3c' : '1px solid #cbd5e1',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Header line */}
                    <div className="p-3 d-flex align-items-center gap-2.5 border-bottom bg-light">
                      <Form.Check
                        type="radio"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        style={{ cursor: 'pointer' }}
                      />
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '20px', color: '#1a6b3c' }}>credit_card</span>
                      <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Thẻ tín dụng (Visa/Mastercard)</span>
                    </div>

                    {/* Expaned Panel Form */}
                    {paymentMethod === 'card' && (
                      <div className="p-3 bg-white" onClick={(e) => e.stopPropagation()}>
                        <Row className="g-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold mb-1">SỐ THẺ</Form.Label>
                              <InputGroup>
                                <Form.Control
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  placeholder="0000 0000 0000 0000"
                                  className="py-2 rounded-start-3 shadow-none border-secondary"
                                  style={{ fontSize: '13.5px' }}
                                />
                                <InputGroup.Text className="bg-light border-secondary">
                                  <span className="fw-bold text-primary small">VISA</span>
                                </InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>

                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold mb-1">HẠN SỬ DỤNG (MM/YY)</Form.Label>
                              <Form.Control
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="py-2 rounded-3 shadow-none border-secondary"
                                style={{ fontSize: '13.5px' }}
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold mb-1">CVV</Form.Label>
                              <Form.Control
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="***"
                                className="py-2 rounded-3 shadow-none border-secondary"
                                style={{ fontSize: '13.5px' }}
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold mb-1">TÊN CHỦ THẺ</Form.Label>
                              <Form.Control
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                placeholder="NGUYEN VAN AN"
                                className="py-2 rounded-3 shadow-none border-secondary"
                                style={{ fontSize: '13.5px' }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>

                  {/* Option 4: Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('bank')}
                    className="p-3 d-flex align-items-center gap-2.5 cursor-pointer rounded-4"
                    style={{
                      border: paymentMethod === 'bank' ? '2px solid #1a6b3c' : '1px solid #cbd5e1',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <Form.Check
                      type="radio"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>account_balance</span>
                    <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Chuyển khoản ngân hàng</span>
                  </div>

                </div>
              </Card>

            </Col>

            {/* Right Column: Order Summary (35%) */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: '110px', zIndex: 10 }}>

                {/* Order Summary Card */}
                <Card className="border-0 shadow-lg p-4 mb-3" style={{ borderRadius: '24px' }}>
                  <h6 className="fw-extrabold text-dark mb-4" style={{ fontWeight: 900, letterSpacing: '0.5px' }}>
                    TÓM TẮT ĐƠN HÀNG
                  </h6>

                  <div className="d-flex flex-column gap-3 mb-4" style={{ fontSize: '14.5px' }}>
                    <div className="d-flex justify-content-between text-secondary">
                      <span>Phí thuê sân</span>
                      <span className="fw-semibold text-dark">
                        {subtotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="d-flex justify-content-between text-secondary">
                      <span>Phí dịch vụ</span>
                      <span className="fw-semibold text-dark">
                        {serviceFee.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {appliedVoucher && (
                      <div className="d-flex justify-content-between text-danger">
                        <span>Mã giảm giá</span>
                        <span className="fw-bold">
                          -{discountVal.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}

                    {usePoints && (
                      <div className="d-flex justify-content-between text-success">
                        <span>Điểm thưởng</span>
                        <span className="fw-bold text-success" style={{ color: '#16a34a' }}>
                          -{pointsVal.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}

                    <hr className="my-2 opacity-50" style={{ borderStyle: 'dashed' }} />

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-secondary">Tổng thanh toán</span>
                      <span className="fw-extrabold text-dark fs-3" style={{ fontWeight: 900 }}>
                        {total.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isSubmitting}
                    className="w-100 py-3 rounded-pill fw-bold border-0 hover-scale mb-1 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '15px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận & Thanh toán'
                    )}
                  </Button>
                </Card>

                {/* Sub-card security details */}
                <div className="px-3">
                  <div className="d-flex align-items-center gap-2 text-success mb-2" style={{ fontSize: '12px' }}>
                    <span className="material-symbols-outlined text-success" style={{ fontSize: '18px', color: '#16a34a' }}>verified_user</span>
                    <span className="fw-semibold text-dark">Thanh toán bảo mật 256-bit SSL</span>
                  </div>

                  <div className="d-flex align-items-center gap-2 text-muted mb-4" style={{ fontSize: '12px' }}>
                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>info</span>
                    <span className="fw-semibold text-secondary">Hủy miễn phí trước 24 giờ</span>
                  </div>

                  <div className="d-flex justify-content-start align-items-center gap-3 text-muted ps-1" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    <span>VISA</span>
                    <span>MasterCard</span>
                    <span>NAPAS</span>
                  </div>
                </div>

              </div>
            </Col>

          </Row>

        </Container>
      </div>
    </div>
  );
};
