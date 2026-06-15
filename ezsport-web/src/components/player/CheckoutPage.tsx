import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/bookingStore';
import { bookingService } from '../../services/booking.service';
import { courtService, venueService, type Court, type Venue } from '../../services/venue.service';
import { voucherService, type Voucher } from '../../services/voucher.service';
import { useAuth } from '../../context/AuthContext';

interface CheckoutPageProps {
  venueId: number | string;
  onBackClick: () => void;
  onSuccessClick: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ venueId, onBackClick }) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { draft } = useBookingStore();
  const [venueData, setVenueData] = useState<Venue | null>(null);
  const [courtData, setCourtData] = useState<Court | null>(null);
  const [isLoadingBookingData, setIsLoadingBookingData] = useState<boolean>(true);
  
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [validatingVoucher, setValidatingVoucher] = useState<boolean>(false);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [selectedPoints, setSelectedPoints] = useState<number>(500); // Points selected to use
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash'>('momo');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User's available loyalty points
  const userPoints = Number(user?.loyaltyPoints) || 0;
  
  // Available point options (100 points = 10,000đ)
  const pointOptions = [100, 200, 300, 500, 1000];
  const availablePointOptions = pointOptions.filter(p => p <= userPoints);
  
  const canUsePoints = userPoints >= selectedPoints;
  const pointsDiscountValue = Math.floor(selectedPoints * 100); // 100 points = 10,000đ
  
  // Debug log
  console.log('🎯 Points Debug:', { 
    userPoints, 
    selectedPoints,
    pointsDiscountValue,
    canUsePoints,
    loyaltyPoints: user?.loyaltyPoints, 
    user 
  });



  // Booker info states - get from user or draft
  const [bookerName, setBookerName] = useState<string>(draft?.bookerName || user?.fullName || 'Nguyễn Văn An');
  const [bookerPhone, setBookerPhone] = useState<string>(draft?.bookerPhone || user?.phone || '090 123 4567');
  const [bookerEmail, setBookerEmail] = useState<string>(draft?.bookerEmail || user?.email || 'an.nguyen@email.com');

  useEffect(() => {
    if (!draft?.slot) {
      setError('Khong tim thay thong tin dat san. Vui long chon lai.');
    }
  }, [draft]);

  useEffect(() => {
    voucherService.listMine()
      .then(setMyVouchers)
      .catch(() => setMyVouchers([]));
  }, []);

  useEffect(() => {
    let isCanceled = false;

    const fetchBookingData = async () => {
      if (!venueId) {
        setIsLoadingBookingData(false);
        return;
      }

      setIsLoadingBookingData(true);
      try {
        // Step 1: Try to load court (using draft.courtId which is always the court's _id)
        const court = draft?.courtId
          ? await courtService.getCourtById(String(draft.courtId)).catch(() => null)
          : null;

        // Step 2: Resolve real venueId — prefer court.venue (populated) to avoid using
        // a stale/incorrect venueId prop (e.g. court ID passed from legacy chat history)
        let resolvedVenueId: string | null = null;
        if (court?.venue) {
          const courtVenue = court.venue as any;
          resolvedVenueId = typeof courtVenue === 'string' ? courtVenue : (courtVenue._id ?? null);
        }
        // Fallback: use the prop venueId only if we couldn't get it from court
        if (!resolvedVenueId) {
          resolvedVenueId = String(venueId);
        }

        // Step 3: Fetch the venue using the resolved ID
        const venue = await venueService.getVenueById(resolvedVenueId).catch(() => null);

        const resolvedCourt =
          court ??
          (venue
            ? await courtService
                .getCourts({ venue: String(venue._id), active: 'true' })
                .then((courts) => courts[0] ?? null)
                .catch(() => null)
            : null);

        if (!venue) {
          throw new Error('Khong tim thay thong tin san');
        }

        if (!isCanceled) {
          setVenueData(venue);
          setCourtData(resolvedCourt);
        }
      } catch (err: any) {
        if (!isCanceled) {
          setVenueData(null);
          setCourtData(null);
          setError(err?.response?.data?.message || err?.message || 'Khong the tai du lieu checkout');
        }
      } finally {
        if (!isCanceled) {
          setIsLoadingBookingData(false);
        }
      }
    };

    fetchBookingData();

    return () => {
      isCanceled = true;
    };
  }, [venueId, draft?.courtId]);

  const selectedSport = draft?.sport || courtData?.sportTypes?.[0] || venueData?.sportTypes?.[0] || '';
  const selectedBasePrice = draft?.basePrice || (courtData?.pricePerHour ?? venueData?.pricePerHour ?? 0) * (draft?.slot?.duration || 1);

  const booking = {
    venueName: venueData?.name || courtData?.name || draft?.courtName || '',
    sport: selectedSport,
    address: venueData?.location || draft?.courtAddress || '',
    image: venueData?.image || venueData?.images?.[0] || courtData?.images?.[0] || draft?.courtImage || '',
    date: draft?.slot ? new Date(draft.slot.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    time: draft?.slot ? `${draft.slot.startTime} - ${draft.slot.endTime}` : '',
    courtNo: courtData?.name || draft?.courtName || '',
    duration: `${draft?.slot?.duration || 0} gio`,
    basePrice: selectedBasePrice,
    serviceFee: draft?.serviceFee ?? 15000,
    discount: draft?.discount ?? 0,
    pointsDiscount: draft?.pointsUsed ?? 0
  };

  // Live order calculations
  const subtotal = booking.basePrice;
  const serviceFee = booking.serviceFee;
  const discountVal = appliedVoucher 
    ? (appliedVoucher.type === 'percent' 
        ? Math.min(Math.floor(subtotal * appliedVoucher.value / 100), appliedVoucher.maxDiscount || Infinity) 
        : appliedVoucher.value)
    : 0;
  const pointsVal = usePoints && canUsePoints ? pointsDiscountValue : 0;
  const total = Math.max(0, subtotal + serviceFee - discountVal - pointsVal);

  const handleApplyVoucher = async (code: string) => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setValidatingVoucher(true);
      setError(null);
      
      const { voucher, discount } = await voucherService.validate(code.toUpperCase(), subtotal);
      
      setAppliedVoucher(voucher);
      setVoucherCode(voucher.code);
      setShowVoucherModal(false);
      alert(`✅ Áp dụng mã ${voucher.code} thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedVoucher(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.type === 'fixed') {
      return `${voucher.value.toLocaleString('vi-VN')}đ`;
    }
    const maxText = voucher.maxDiscount ? ` (tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')}đ)` : '';
    return `${voucher.value}%${maxText}`;
  };

  const handleConfirmPayment = async () => {
    if (!draft || !draft.slot || !courtData?._id) {
      setError('Thông tin đặt sân không đầy đủ');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingPayload = {
        courtId: courtData._id,
        bookingDate: new Date(draft.slot.date),
        startTime: draft.slot.startTime,
        endTime: draft.slot.endTime,
        duration: draft.slot.duration,
        sport: selectedSport,
        basePrice: subtotal,
        serviceFee: serviceFee,
        discount: discountVal,
        pointsUsed: usePoints && canUsePoints ? selectedPoints : 0,
        totalPrice: total,
        paymentMethod: paymentMethod,
        bookerName: bookerName,
        bookerPhone: bookerPhone.replace(/\s/g, ''),
        bookerEmail: bookerEmail,
        voucherCode: appliedVoucher?.code || undefined,
        notes: '',
      };

      const createdBooking = await bookingService.createBooking(bookingPayload);

      // Update user's loyalty points locally if points were used
      if (usePoints && canUsePoints) {
        const newPoints = Math.max(0, userPoints - selectedPoints);
        updateUser({ loyaltyPoints: newPoints });
      }

      // Sync final total back to store so BookingSuccessPage can display it
      useBookingStore.getState().setDraft({ totalPrice: total });
      useBookingStore.getState().setConfirmedBookingId(createdBooking._id);

      if (paymentMethod === 'momo' && createdBooking.payUrl) {
        console.log('Redirecting to MoMo payment page:', createdBooking.payUrl);
        window.location.href = createdBooking.payUrl;
      } else {
        navigate(`/booking/success/${createdBooking._id}`);
      }
    } catch (err: any) {
      console.error('Booking creation failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Tạo đơn đặt sân thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingBookingData) {
    return (
      <div className="vh-100 w-100 d-flex align-items-center justify-content-center bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Spinner variant="success" />
      </div>
    );
  }

  return (
    <div className="vh-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                    Chỉnh 
                  </Button>
                </div>

                <div className="d-flex gap-3 align-items-center mb-4 flex-wrap flex-sm-nowrap">
                  <div className="overflow-hidden flex-shrink-0" style={{ width: '80px', height: '80px', borderRadius: '16px' }}>
                    {booking.image && <img
                      src={booking.image}
                      alt={booking.venueName || booking.courtNo}
                      className="w-100 h-100 object-fit-cover"
                    />}
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

                {/* Applied Voucher Display or Input */}
                {appliedVoucher ? (
                  <div className="mb-4">
                    <span className="text-muted small d-block mb-2">Mã giảm giá đã áp dụng</span>
                    <div 
                      className="p-3 rounded-4 d-flex justify-content-between align-items-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #16a34a 0%, #0f3d22 100%)', 
                        color: '#fff' 
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>
                          {appliedVoucher.code}
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>
                          Giảm {formatDiscount(appliedVoucher)}
                        </div>
                      </div>
                      <Button
                        onClick={handleRemoveVoucher}
                        size="sm"
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          border: 'none', 
                          color: '#fff',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '13px',
                          padding: '6px 12px'
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-muted small d-block mb-2">Mã giảm giá</span>
                    
                    {/* Voucher input */}
                    <div className="d-flex gap-2 mb-3" style={{ maxWidth: '400px' }}>
                      <Form.Control
                        placeholder="Nhập mã voucher"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyVoucher(voucherCode);
                          }
                        }}
                        className="py-2 border-secondary shadow-none"
                        style={{ fontSize: '14px', borderRadius: '12px', textTransform: 'uppercase' }}
                        disabled={validatingVoucher}
                      />
                      <Button
                        onClick={() => handleApplyVoucher(voucherCode)}
                        disabled={validatingVoucher || !voucherCode.trim()}
                        className="px-3 fw-bold text-white flex-shrink-0"
                        style={{ background: '#0f172a', border: 'none', fontSize: '13px', borderRadius: '12px' }}
                      >
                        {validatingVoucher ? <Spinner size="sm" /> : 'Áp dụng'}
                      </Button>
                    </div>

                    {/* My vouchers quick select */}
                    {myVouchers.length > 0 && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                            Voucher của tôi ({myVouchers.length})
                          </span>
                          <Button
                            variant="link"
                            onClick={() => setShowVoucherModal(true)}
                            className="p-0 text-success fw-bold shadow-none border-0"
                            style={{ fontSize: '13px', textDecoration: 'none' }}
                          >
                            Xem tất cả →
                          </Button>
                        </div>
                        
                        {/* Show first 2 vouchers */}
                        <div className="d-flex flex-column gap-2">
                          {myVouchers.slice(0, 2).map((uv) => {
                            const voucher = uv.voucherId;
                            const isExpired = voucher.expiresAt && new Date(voucher.expiresAt) < new Date();
                            const isUsed = uv.status === 'used';
                            
                            if (isExpired || isUsed) return null;

                            return (
                              <div
                                key={uv._id}
                                onClick={() => handleApplyVoucher(voucher.code)}
                                className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                                style={{
                                  border: '1px solid #e2e8f0',
                                  background: '#f8fafc',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4';
                                  e.currentTarget.style.borderColor = '#16a34a';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f8fafc';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                                    {voucher.code}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    Giảm {formatDiscount(voucher)}
                                    {voucher.minOrderValue > 0 && ` • Đơn từ ${voucher.minOrderValue.toLocaleString('vi-VN')}đ`}
                                  </div>
                                </div>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16a34a' }}>
                                  arrow_forward
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Points Reward Toggle switch */}
                <div
                  className="p-3 rounded-4"
                  style={{ 
                    background: canUsePoints ? '#f8fafc' : '#fef3c7', 
                    border: canUsePoints ? '1px solid rgba(0,0,0,0.03)' : '1px solid #fbbf24',
                    opacity: userPoints > 0 ? 1 : 0.5
                  }}
                >
                  {/* Header with toggle */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          background: canUsePoints ? '#dcfce7' : '#fee2e2' 
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: canUsePoints ? '#16a34a' : '#dc2626' }}>
                          {userPoints > 0 ? 'stars' : 'cancel'}
                        </span>
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>
                          Dùng điểm thưởng
                        </span>
                        <span className="text-muted small" style={{ fontSize: '12px' }}>
                          Bạn có {userPoints.toLocaleString('vi-VN')} điểm
                        </span>
                      </div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="points-toggle"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      disabled={userPoints === 0}
                      className="custom-switch-success fs-4"
                      style={{ cursor: userPoints > 0 ? 'pointer' : 'not-allowed' }}
                    />
                  </div>

                  {/* Point selection dropdown (shown when toggle is on) */}
                  {usePoints && userPoints > 0 && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <label className="text-muted small d-block mb-2" style={{ fontSize: '12px', fontWeight: 600 }}>
                        Chọn số điểm muốn dùng
                      </label>
                      <div className="d-flex gap-2 flex-wrap">
                        {availablePointOptions.map(points => {
                          const discount = points * 100;
                          const isSelected = selectedPoints === points;
                          return (
                            <button
                              key={points}
                              type="button"
                              onClick={() => setSelectedPoints(points)}
                              style={{
                                border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                borderRadius: '12px',
                                background: isSelected ? '#dcfce7' : '#fff',
                                color: isSelected ? '#0f3d22' : '#374151',
                                padding: '10px 16px',
                                cursor: 'pointer',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '13px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minWidth: '90px'
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 800 }}>{points} điểm</span>
                              <span style={{ fontSize: '11px', opacity: 0.8 }}>= {discount.toLocaleString('vi-VN')}đ</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Custom point input */}
                      <div className="mt-3">
                        <label className="text-muted small d-block mb-2" style={{ fontSize: '11px' }}>
                          Hoặc nhập số điểm khác (tối đa {userPoints})
                        </label>
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max={userPoints}
                            value={selectedPoints}
                            onChange={(e) => {
                              const val = Math.min(Number(e.target.value) || 0, userPoints);
                              setSelectedPoints(val);
                            }}
                            className="form-control form-control-sm"
                            style={{ 
                              maxWidth: '150px', 
                              fontSize: '13px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1'
                            }}
                          />
                          <span className="d-flex align-items-center text-muted" style={{ fontSize: '13px' }}>
                            = {pointsDiscountValue.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      {/* Info message */}
                      {!canUsePoints && (
                        <div className="mt-2 p-2 rounded-3" style={{ background: '#fef3c7', fontSize: '12px', color: '#92400e' }}>
                          ⚠️ Không đủ điểm. Vui lòng chọn số điểm nhỏ hơn.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Block 4: Phương thức thanh toán */}
              <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '24px' }}>
                <h5 className="fw-bold text-dark mb-4" style={{ fontWeight: 800 }}>Phương thức thanh toán</h5>

                <div className="d-flex flex-column gap-3">

                  {/* Option 1: MoMo */}
                  <div
                    onClick={() => setPaymentMethod('momo')}
                    className="p-3 d-flex align-items-center justify-content-between rounded-4"
                    style={{
                      border: paymentMethod === 'momo' ? '2px solid #1a6b3c' : '1px solid #cbd5e1',
                      background: paymentMethod === 'momo' ? '#f0fdf4' : '#ffffff',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Form.Check
                        type="radio"
                        checked={paymentMethod === 'momo'}
                        onChange={() => setPaymentMethod('momo')}
                        style={{ cursor: 'pointer' }}
                      />
                      <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#a50064', flexShrink: 0 }}>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                          alt="MoMo"
                          style={{ width: '75%', height: '75%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '14.5px' }}>Ví điện tử MoMo</span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>Thanh toán nhanh qua ví MoMo</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#1a6b3c' }}>bolt</span>
                  </div>

                  {/* Option 2: Tiền mặt */}
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className="p-3 d-flex align-items-center justify-content-between rounded-4"
                    style={{
                      border: paymentMethod === 'cash' ? '2px solid #1a6b3c' : '1px solid #cbd5e1',
                      background: paymentMethod === 'cash' ? '#f0fdf4' : '#ffffff',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Form.Check
                        type="radio"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        style={{ cursor: 'pointer' }}
                      />
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#16a34a', flexShrink: 0 }}>
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>payments</span>
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '14.5px' }}>Tiền mặt</span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>Thanh toán trực tiếp tại sân</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>storefront</span>
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
                    disabled={isSubmitting || !draft?.slot || !courtData?._id}
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

      {/* Voucher Selection Modal */}
      <Modal show={showVoucherModal} onHide={() => setShowVoucherModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Chọn voucher
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {myVouchers.length === 0 ? (
            <div className="text-center py-5">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1' }}>card_giftcard</span>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>
                Bạn chưa có voucher nào. <br />
                Đổi voucher bằng điểm tích lũy trong hồ sơ!
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {myVouchers.map((uv) => {
                const voucher = uv.voucherId;
                const isExpired = voucher.expiresAt && new Date(voucher.expiresAt) < new Date();
                const isUsed = uv.status === 'used';
                const canUse = !isExpired && !isUsed && voucher.minOrderValue <= subtotal;

                return (
                  <div
                    key={uv._id}
                    onClick={() => canUse && handleApplyVoucher(voucher.code)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      opacity: canUse ? 1 : 0.5,
                      cursor: canUse ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (canUse) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Header */}
                    <div style={{ 
                      background: isExpired || isUsed 
                        ? '#94a3b8' 
                        : 'linear-gradient(135deg, #16a34a 0%, #0f3d22 100%)', 
                      padding: '16px', 
                      color: '#fff' 
                    }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          padding: '4px 10px', 
                          borderRadius: '6px' 
                        }}>
                          {isUsed ? 'Đã dùng' : isExpired ? 'Hết hạn' : 'Khả dụng'}
                        </Badge>
                        {voucher.expiresAt && (
                          <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                            HSD: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <h5 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0', letterSpacing: '1px' }}>
                        {voucher.code}
                      </h5>
                      <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px' }}>
                        GIẢM {formatDiscount(voucher)}
                      </div>
                      {voucher.minOrderValue > 0 && (
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>
                          Cho đơn từ {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '12px 16px', background: '#f8fafc' }}>
                      {canUse ? (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>
                          ✓ Có thể sử dụng cho đơn hàng này
                        </div>
                      ) : isUsed ? (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                          Voucher đã được sử dụng
                        </div>
                      ) : isExpired ? (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                          Voucher đã hết hạn
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
                          Đơn hàng chưa đủ {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
          <Button
            onClick={() => setShowVoucherModal(false)}
            style={{ 
              background: '#0f172a', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 600, 
              padding: '10px 24px' 
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
