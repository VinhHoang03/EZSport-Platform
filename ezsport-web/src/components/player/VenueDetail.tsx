import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Footer from '../shared/Footer';
import SlotPicker from './SlotPicker';
import { courtService, venueService, type Court, type Venue } from '../../services/venue.service';
import { conversationService } from '../../services/conversation.service';
import { reviewService, type Review, type ReviewsResponse } from '../../services/review.service';
import { ROUTES } from '../../constants';

type BookingDetails = {
  venueId: number | string;
  slot?: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    basePrice: number;
  };
};

interface VenueDetailProps {
  venueId: number | string;
  onBackClick: () => void;
  onConfirmBooking?: (bookingDetails: BookingDetails) => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
  venueData?: Venue | null;
  venueLoading?: boolean;
}

export const VenueDetail: React.FC<VenueDetailProps> = ({ venueId, onBackClick, onConfirmBooking, venueData: externalVenueData, venueLoading: externalVenueLoading }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [internalVenueData, setInternalVenueData] = useState<Venue | null>(null);
  const [internalLoading, setInternalLoading] = useState<boolean>(!externalVenueData && !!venueId);
  const [selectedSlot, setSelectedSlot] = useState<BookingDetails['slot'] | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  // Review states
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState<{ canReview: boolean; reason?: string } | null>(null);
  const venueData = externalVenueData ?? internalVenueData;
  const loading = externalVenueLoading ?? internalLoading;

  useEffect(() => {
    if (externalVenueData || !venueId) {
      return;
    }

    let isCanceled = false;
    setInternalLoading(true);
    setFetchError(null);
    setInternalVenueData(null);
    setCourts([]);
    setSelectedCourtId('');

    const fetchVenueAndCourts = async () => {
      try {
        let venue = await venueService.getVenueById(String(venueId)).catch(() => null);
        let preferredCourtId = '';

        if (!venue) {
          const court = await courtService.getCourtById(String(venueId)).catch(() => null);
          if (court?.venue) {
            preferredCourtId = court._id;
            const courtVenue = court.venue as any;
            const courtVenueId = typeof courtVenue === 'string' ? courtVenue : courtVenue._id;
            if (courtVenueId) {
              venue = await venueService.getVenueById(String(courtVenueId)).catch(() => null);
            }
          }
        }

        if (!venue) {
          throw new Error('Khong tim thay thong tin san');
        }

        const venueCourts = await courtService
          .getCourts({ venue: String(venue._id), active: 'true' })
          .catch(() => []);

        if (!isCanceled) {
          setInternalVenueData(venue);
          setCourts(venueCourts);
          if (preferredCourtId && venueCourts.some((court) => court._id === preferredCourtId)) {
            setSelectedCourtId(preferredCourtId);
          } else if (venueCourts.length) {
            setSelectedCourtId(venueCourts[0]._id);
          }
        }
      } catch (err: any) {
        if (!isCanceled) {
          console.error('[VenueDetail] Failed to fetch venue:', err?.response?.status, err?.message);
          setFetchError(err?.message || 'Khong the tai thong tin san');
          setInternalVenueData(null);
        }
      } finally {
        if (!isCanceled) {
          setInternalLoading(false);
        }
      }
    };

    fetchVenueAndCourts();

    return () => {
      isCanceled = true;
    };
  }, [venueId, externalVenueData]);

  const selectedCourt = courts.find((court) => court._id === selectedCourtId) ?? courts[0] ?? null;

  // Fetch reviews when venueId is resolved
  useEffect(() => {
    if (!venueId) return;
    // Prefer the real venue _id if available
    const resolvedId = venueData?._id ? String(venueData._id) : String(venueId);
    setReviewsLoading(true);
    reviewService.getVenueReviews(resolvedId)
      .then(setReviewsData)
      .catch(() => setReviewsData(null))
      .finally(() => setReviewsLoading(false));

    // Check if logged-in user can write a review
    const token = localStorage.getItem('token');
    if (token) {
      reviewService.checkCanReview(resolvedId).then(setCanReview);
    }
  }, [venueId, venueData?._id]);

  const handleSubmitReview = async () => {
    const resolvedId = venueData?._id ? String(venueData._id) : String(venueId);
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview(resolvedId, { rating: reviewRating, comment: reviewComment });
      const fresh = await reviewService.getVenueReviews(resolvedId);
      setReviewsData(fresh);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };
  // Use pricePerHour directly from model (numeric), fallback parse from price string
  const pricePerHour = selectedCourt?.pricePerHour
    ?? venueData?.pricePerHour
    ?? (() => {
        if (!venueData?.price) return 180000;
        const raw = venueData.price.replace(/[^0-9]/g, '');
        const num = parseInt(raw, 10);
        return num < 10000 ? num * 1000 : num;
      })();

  const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  // Use real API data if available, otherwise fallback to mock
  const venue = {
    name: venueData?.name ?? 'EZSport Arena Central',
    location: venueData?.location ?? '81C Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
    rating: venueData?.rating ?? 4.9,
    reviewsCount: venueData?.reviewsCount ?? 1128,
    price: venueData?.pricePerHour ?? 180000,
    openHours: venueData ? `${venueData.openTime} - ${venueData.closeTime}` : '06:00 - 22:00',
    sports: venueData?.sportTypes?.length
      ? venueData.sportTypes.map(s => s.toUpperCase())
      : ['PICKLEBALL', 'CẦU LÔNG'],
    description: venueData?.description ?? 'Chào mừng bạn đến với EZSport Arena Central, điểm đến thể thao hàng đầu tại Đà Nẵng. Cơ sở của chúng tôi cung cấp các sân đấu trong nhà đẳng cấp quốc tế được thiết kế đặc biệt cho Pickleball và Cầu lông hiệu suất cao. Với hệ thống chiếu sáng đạt chuẩn thi đấu và mặt sàn tiêu chuẩn Olympic, chúng tôi mang đến môi trường không thể tuyệt vời hơn cho cả vận động viên chuyên nghiệp lẫn người chơi phong trào.\n\nVị trí trung tâm giúp chúng tôi trở thành điểm đến hoàn hảo cho các buổi tập sáng sớm, các trận đấu giờ nghỉ trưa hay các giải đấu buổi tối. Đội ngũ nhân viên chuyên nghiệp của chúng tôi luôn tận tâm đảm bảo trải nghiệm của bạn luôn mượt mà, từ lúc nhận sân cho đến lúc nghỉ ngơi tại khu vực phòng chờ cao cấp.',
    image: venueData?.image ?? '/images/pickleball.png',
    amenities: (venueData?.amenities?.filter(a => a.available) ?? []).length
      ? (venueData?.amenities ?? []).filter(a => a.available).map(a => ({ name: a.label, icon: a.icon }))
      : [
          { name: 'Bãi đậu xe miễn phí', icon: 'local_parking' },
          { name: 'Tủ đồ & Phòng tắm', icon: 'shower' },
          { name: 'Wi-Fi miễn phí', icon: 'wifi' },
          { name: 'Cà phê thể thao', icon: 'local_cafe' },
        ],
  };

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="vh-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <Spinner variant="success" />
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (onConfirmBooking) {
      onConfirmBooking({
        venueId,
        slot: selectedSlot ?? undefined,
        courtId: selectedCourt?._id ?? String(venueId),
        courtName: selectedCourt?.name ?? venue.name,
        courtAddress: venue.location,
        courtImage: venue.image,
        sport: selectedCourt?.sportTypes?.[0] ?? venue.sports[0] ?? '',
        basePrice: selectedSlot?.basePrice ?? pricePerHour,
      } as any);
    }
  };

  const handleSlotSelect = (slot: { date: string; startTime: string; endTime: string; duration: number; basePrice: number }) => {
    // Do not auto-confirm. Store the selected slot and let the user press the confirm button.
    setSelectedSlot(slot);
  };

  const handleChatWithOwner = async () => {
    console.log('🔍 handleChatWithOwner called');
    console.log('📦 venueData:', venueData);
    console.log('👤 owner:', venueData?.owner);
    
    if (!venueData?.owner) {
      alert('Không tìm thấy thông tin chủ sân');
      return;
    }

    try {
      setCreatingChat(true);
      console.log('⏳ Creating chat...');
      
      // Get owner ID (handle both string and object)
      const ownerId = typeof venueData.owner === 'string' 
        ? venueData.owner 
        : venueData.owner._id;
      
      console.log('🆔 Owner ID:', ownerId);
      console.log('🏟️ Venue ID:', venueData._id);
      
      // Tạo hoặc lấy conversation
      const conversation = await conversationService.createOrGetConversation({
        otherUserId: ownerId,
        venueId: String(venueData._id),
      });

      console.log('✅ Conversation created:', conversation);
      console.log('🚀 Navigating to:', ROUTES.MESSAGES);

      // Chuyển đến trang chat
      navigate(ROUTES.MESSAGES, { state: { conversationId: conversation._id } });
      
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      alert('Không thể tạo hội thoại. Vui lòng thử lại.');
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <div className="vh-100 w-100 d-flex flex-column bg-light" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Main Content Area */}
      <div className="overflow-auto flex-grow-1 py-4">
        <Container>

          {fetchError && (
            <div className="alert alert-warning mb-4" style={{ fontSize: '13px' }}>
              ⚠️ Không thể tải dữ liệu sân. Đang hiển thị nội dung dự phòng.
            </div>
          )}

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
                  src={venue.image}
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
                      alt="Venue view 1"
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
                    onClick={() => {
                      if (venueData?.lat && venueData?.lng) {
                        navigate(ROUTES.MAP, {
                          state: {
                            directionsTo: {
                              lat: venueData.lat,
                              lng: venueData.lng,
                              name: venueData.name,
                            },
                          },
                        });
                      } else {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(venue.location)}`, '_blank');
                      }
                    }}
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
                  {canReview?.canReview ? (
                    <Button
                      variant="link"
                      className="text-success fw-bold p-0 shadow-none border-0"
                      style={{ color: '#1a6b3c !important', textDecoration: 'none', fontSize: '14.5px' }}
                      onClick={() => setShowReviewForm(v => !v)}
                    >
                      {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
                    </Button>
                  ) : canReview && !canReview.canReview ? (
                    <span className="text-muted small" style={{ fontSize: '12.5px' }}>
                      {canReview.reason === 'already_reviewed'
                        ? '✓ Bạn đã đánh giá'
                        : canReview.reason === 'no_completed_booking'
                        ? '🔒 Cần đặt sân trước'
                        : null}
                    </span>
                  ) : null}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <div className="mb-4 p-3 border rounded-4" style={{ background: '#f8fafc' }}>
                    <p className="fw-semibold mb-2" style={{ fontSize: '13px' }}>Chọn số sao</p>
                    <div className="d-flex gap-1 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <span
                          key={s}
                          onClick={() => setReviewRating(s)}
                          className="material-symbols-outlined"
                          style={{
                            cursor: 'pointer',
                            fontSize: '28px',
                            color: s <= reviewRating ? '#facc15' : '#cbd5e1',
                            fontVariationSettings: s <= reviewRating ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >star</span>
                      ))}
                    </div>
                    <textarea
                      className="form-control mb-3"
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      style={{ borderRadius: '12px', fontSize: '14px' }}
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewComment.trim()}
                      className="rounded-pill px-4 py-2 border-0 fw-bold"
                      style={{ background: '#1a6b3c', color: '#fff', fontSize: '13px' }}
                    >
                      {submittingReview ? <Spinner size="sm" animation="border" /> : 'Gửi đánh giá'}
                    </Button>
                  </div>
                )}

                {/* Rating summary */}
                {reviewsLoading ? (
                  <div className="text-center py-3"><Spinner variant="success" /></div>
                ) : (
                  <>
                    <Row className="g-4 align-items-center mb-4">
                      <Col md={4} className="text-center border-end py-2">
                        <h1 className="fw-extrabold text-dark m-0" style={{ fontSize: '56px', fontWeight: 900 }}>
                          {venue.rating || '–'}
                        </h1>
                        <div className="d-flex justify-content-center gap-1 my-2">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1", fontSize: '22px' }}>star</span>
                          ))}
                        </div>
                        <span className="text-muted small">Dựa trên {reviewsData?.total ?? venue.reviewsCount} đánh giá</span>
                      </Col>
                      <Col md={8}>
                        <div className="d-flex flex-column gap-2 px-3">
                          {[5,4,3,2,1].map(star => {
                            const count = reviewsData?.breakdown?.[star] ?? 0;
                            const total = reviewsData?.total ?? 1;
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                              <div className="d-flex align-items-center gap-2" style={{ fontSize: '13px' }} key={star}>
                                <span className="fw-bold text-secondary" style={{ width: '12px' }}>{star}</span>
                                <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '6px' }}>
                                  <div className="h-100 rounded-pill" style={{ width: `${pct}%`, background: '#16a34a' }} />
                                </div>
                                <span className="text-muted" style={{ width: '30px', textAlign: 'right' }}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </Col>
                    </Row>

                    {/* Reviews list */}
                    {reviewsData && reviewsData.data.length > 0 && (
                      <>
                        <hr className="my-4 opacity-50" />
                        <div className="d-flex flex-column gap-4">
                          {reviewsData.data.map((review: Review) => {
                            const name = review.userId?.fullName ?? 'Người dùng';
                            const avatar = review.userId?.avatar
                              ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a6b3c&color=fff`;
                            const date = new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
                            return (
                              <div key={review._id} className="d-flex flex-column p-3 bg-light rounded-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <img src={avatar} alt={name} className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                    <div>
                                      <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>{name}</span>
                                      <span className="text-muted small">{date}</span>
                                    </div>
                                  </div>
                                  <div className="d-flex">
                                    {[1,2,3,4,5].map(s => (
                                      <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0", color: '#facc15', fontSize: '16px' }}>star</span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-dark mb-0" style={{ fontSize: '13.5px', lineHeight: '1.5' }}>"{review.comment}"</p>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {reviewsData && reviewsData.data.length === 0 && (
                      <p className="text-muted text-center py-3" style={{ fontSize: '14px' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    )}
                  </>
                )}
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
                          {formatVND(pricePerHour)}<span className="text-muted fw-normal" style={{ fontSize: '14px' }}>/ giờ</span>
                        </span>
                      </div>
                      <Badge className="bg-light text-dark border py-2 px-3 rounded-pill fw-bold d-flex align-items-center gap-1">
                        <span className="material-symbols-outlined text-warning" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>flash_on</span>
                        Đặt ngay
                      </Badge>
                    </div>
                    {courts.length > 0 && (
                      <div className="mb-4">
                        <p className="fw-semibold mb-2" style={{ fontSize: '13px', color: '#374151' }}>Chọn sân</p>
                        <div className="d-flex flex-column gap-2">
                          {courts.map((court) => (
                            <button
                              key={court._id}
                              type="button"
                              onClick={() => setSelectedCourtId(court._id)}
                              className="text-start"
                              style={{
                                border: selectedCourtId === court._id ? '2px solid #16a34a' : '1px solid #e5e7eb',
                                borderRadius: '14px',
                                background: selectedCourtId === court._id ? '#f0fdf4' : '#fff',
                                padding: '10px 12px',
                                color: '#111827',
                                cursor: 'pointer',
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <strong style={{ fontSize: '13px' }}>{court.name}</strong>
                                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>{court.pricePerHour?.toLocaleString('vi-VN')}đ/giờ</span>
                              </div>
                              <div className="text-muted" style={{ fontSize: '12px' }}>{court.sportTypes?.join(', ')}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Slot picker from Figma design */}
                    <div className="mb-4">
                      <SlotPicker
                        courtId={selectedCourtId || String(venueId)}
                        onSlotSelect={handleSlotSelect}
                      />
                    </div>

                    {/* Booking Action Button */}
                    <Button
                      onClick={handleBooking}
                      className="w-100 py-3 rounded-pill fw-bold border-0 hover-scale mb-3"
                      style={{
                        background: selectedSlot ? '#1a6b3c' : '#94d3b6',
                        color: '#ffffff',
                        fontSize: '15px',
                        boxShadow: selectedSlot ? '0 8px 24px rgba(26, 107, 60, 0.3)' : 'none'
                      }}
                      disabled={!selectedSlot}
                    >
                      Xác nhận đặt sân
                    </Button>

                    {/* Chat with Owner Button */}
                    <Button
                      onClick={handleChatWithOwner}
                      disabled={creatingChat}
                      variant="outline-success"
                      className="w-100 py-3 rounded-pill fw-bold hover-scale mb-3"
                      style={{
                        fontSize: '14px',
                        borderWidth: '2px',
                        borderColor: '#1a6b3c',
                        color: '#1a6b3c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: creatingChat ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {creatingChat ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          <span>Đang tạo...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
                          <span>Nhắn tin với chủ sân</span>
                        </>
                      )}
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
