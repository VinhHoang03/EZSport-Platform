import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { bookingService } from '../../../services/booking.service';
import { type Product } from '../../../services/product.service';

interface Shop {
  _id: string;
  fullName: string;
  avatar?: string;
  shopAddress?: string;
  phone?: string;
  venueIds?: string[];
}

// Generate time options every 30 minutes: 06:00 – 22:30
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let h = 6; h <= 22; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) options.push(`${String(h).padStart(2, '0')}:30`);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();
const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5, 6];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addHoursToTime = (startTime: string, hours: number): string => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + hours * 60;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

const ShopCheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [cartProducts, setCartProducts] = useState<{ product: Product; qty: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rental time
  const [rentalDate, setRentalDate] = useState<string>(todayStr());
  const [startTime, setStartTime] = useState<string>('08:00');
  const [duration, setDuration] = useState<number>(1); // hours

  // Booker info
  const [bookerName, setBookerName] = useState(user?.fullName || '');
  const [bookerPhone, setBookerPhone] = useState(user?.phone || '');
  const [bookerEmail, setBookerEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payos' | 'cash'>('payos');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const shopsRes = await api.get('/users/shops');
        const currentShop = (shopsRes.data.data || []).find((s: any) => s._id === id);
        if (!currentShop) throw new Error('Không tìm thấy cửa hàng');
        setShop(currentShop);

        const savedStr = sessionStorage.getItem('preselected_products');
        if (!savedStr) { setCartProducts([]); setLoading(false); return; }

        const savedQtys: Record<string, number> = JSON.parse(savedStr);
        const prodsRes = await api.get(`/products/shop/${id}`);
        const allProducts: Product[] = prodsRes.data.data || [];

        const cart = Object.keys(savedQtys)
          .map(pid => ({ product: allProducts.find(p => p._id === pid)!, qty: savedQtys[pid] }))
          .filter(item => item.product && item.qty > 0);

        setCartProducts(cart);
        sessionStorage.removeItem('preselected_products');
      } catch (err: any) {
        setError(err?.message || 'Không thể tải dữ liệu đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // True if any selected item is rentable
  const hasRentable = useMemo(
    () => cartProducts.some(({ product }) => product.type === 'rent'),
    [cartProducts]
  );

  // Price per item — per_hour items multiply by duration
  const getItemCost = (product: Product, qty: number) => {
    const unitPrice = product.price;
    if (product.type === 'rent' && product.chargeType === 'per_hour') {
      return unitPrice * qty * duration;
    }
    return unitPrice * qty;
  };

  const endTime = addHoursToTime(startTime, duration);
  const serviceFee = 10000;
  const subtotal = cartProducts.reduce((sum, { product, qty }) => sum + getItemCost(product, qty), 0);
  const total = subtotal + serviceFee;

  const handleConfirm = async () => {
    if (!shop || cartProducts.length === 0) return;
    if (!bookerName.trim() || !bookerPhone.trim()) {
      setError('Vui lòng nhập đầy đủ tên và số điện thoại'); return;
    }
    if (hasRentable && !rentalDate) {
      setError('Vui lòng chọn ngày thuê đồ'); return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const venueId = shop.venueIds?.[0];
      if (!venueId) throw new Error('Cửa hàng chưa liên kết với sân nào');

      const productsPayload = cartProducts.map(({ product, qty }) => ({
        productId: product._id,
        name: product.name,
        type: product.type,
        chargeType: product.chargeType,
        quantity: qty,
        price: getItemCost(product, qty) / qty, // effective unit price
      }));

      // Do NOT send courtId for standalone shop orders — backend casts it as ObjectId
      // and throws CastError. Also ensure duration >= 0.5 to pass schema validation.
      const effectiveDuration = hasRentable ? Math.max(duration, 0.5) : 0.5;

      const payload = {
        venueId,
        bookingDate: new Date(rentalDate),
        startTime,
        endTime,
        duration: effectiveDuration,
        sport: 'Cửa hàng',
        basePrice: 0,
        serviceFee,
        discount: 0,
        pointsUsed: 0,
        totalPrice: total,
        paymentMethod,
        bookerName: bookerName.trim(),
        bookerPhone: bookerPhone.trim(),
        bookerEmail: bookerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        products: productsPayload,
      };

      const booking = await bookingService.createBooking(payload);

      if (paymentMethod === 'payos' && booking.payUrl) {
        window.location.href = booking.payUrl;
      } else {
        navigate(`/booking/success/${booking._id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Tạo đơn hàng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex align-items-center justify-content-center py-5">
        <Spinner variant="success" />
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Container>

        {/* Back */}
        <Button
          variant="link"
          onClick={() => navigate(`/shops/${id}`)}
          className="text-success fw-semibold p-0 mb-4 d-flex align-items-center gap-1 border-0 shadow-none"
          style={{ textDecoration: 'none' }}
        >
          <span className="material-symbols-outlined fs-5">arrow_back</span>
          Quay lại cửa hàng
        </Button>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">{error}</Alert>
        )}

        {cartProducts.length === 0 ? (
          <Card className="border-0 shadow-sm p-5 text-center rounded-4">
            <span className="material-symbols-outlined fs-1 text-muted mb-3">shopping_bag</span>
            <h5 className="fw-bold text-secondary">Không có sản phẩm nào trong đơn hàng</h5>
            <Button variant="success" className="rounded-pill mt-3 px-4" onClick={() => navigate(`/shops/${id}`)}>
              Quay lại chọn sản phẩm
            </Button>
          </Card>
        ) : (
          <Row className="g-4">

            {/* Left column */}
            <Col lg={8}>

              {/* Shop banner */}
              <Card className="border-0 shadow-sm p-3 mb-4 rounded-4 bg-white d-flex flex-row align-items-center gap-3">
                <img
                  src={shop?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop?.fullName || '')}&background=16a34a&color=fff&size=64&bold=true`}
                  alt={shop?.fullName}
                  className="rounded-circle border flex-shrink-0"
                  style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                />
                <div>
                  <span className="fw-bold text-dark d-block" style={{ fontSize: '15px' }}>{shop?.fullName}</span>
                  <Badge bg="success" className="rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>
                    Thuê lẻ – Không kèm đặt sân
                  </Badge>
                </div>
              </Card>

              {/* ───── Rental time ───── */}
              {hasRentable && (
                <Card className="border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
                  <h5 className="fw-bold text-dark mb-1" style={{ fontWeight: 800 }}>Thời gian thuê đồ</h5>
                  <p className="text-muted small mb-4" style={{ fontSize: '12px' }}>
                    Dùng để tính giá thuê theo giờ và giúp cửa hàng chuẩn bị đồ đúng giờ.
                  </p>

                  <Row className="g-3">
                    {/* Date */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-secondary small mb-1">Ngày thuê *</Form.Label>
                        <Form.Control
                          type="date"
                          value={rentalDate}
                          min={todayStr()}
                          onChange={e => setRentalDate(e.target.value)}
                          className="rounded-3"
                          style={{ border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                        />
                      </Form.Group>
                    </Col>

                    {/* Start time */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-secondary small mb-1">Giờ bắt đầu *</Form.Label>
                        <Form.Select
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className="rounded-3"
                          style={{ border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Duration */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-secondary small mb-1">Thời lượng thuê *</Form.Label>
                        <Form.Select
                          value={duration}
                          onChange={e => setDuration(Number(e.target.value))}
                          className="rounded-3"
                          style={{ border: '1.5px solid #e2e8f0', fontSize: '14px' }}
                        >
                          {DURATION_OPTIONS.map(d => (
                            <option key={d} value={d}>{d} giờ</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Summary badge */}
                  <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span className="material-symbols-outlined text-success" style={{ fontSize: '20px', color: '#16a34a' }}>schedule</span>
                    <span className="fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      {rentalDate
                        ? new Date(rentalDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '---'
                      }
                      &nbsp;·&nbsp;{startTime} – {endTime}&nbsp;({duration} giờ)
                    </span>
                  </div>
                </Card>
              )}

              {/* ───── Booker info ───── */}
              <Card className="border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
                <h5 className="fw-bold text-dark mb-4" style={{ fontWeight: 800 }}>Thông tin người đặt</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small mb-1">Họ và tên *</Form.Label>
                      <Form.Control value={bookerName} onChange={e => setBookerName(e.target.value)} placeholder="Nguyễn Văn A"
                        className="rounded-3" style={{ border: '1.5px solid #e2e8f0', fontSize: '14px' }} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small mb-1">Số điện thoại *</Form.Label>
                      <Form.Control value={bookerPhone} onChange={e => setBookerPhone(e.target.value)} placeholder="090 xxx xxxx"
                        className="rounded-3" style={{ border: '1.5px solid #e2e8f0', fontSize: '14px' }} />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small mb-1">Email (tuỳ chọn)</Form.Label>
                      <Form.Control value={bookerEmail} onChange={e => setBookerEmail(e.target.value)} placeholder="email@example.com"
                        className="rounded-3" style={{ border: '1.5px solid #e2e8f0', fontSize: '14px' }} />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small mb-1">Ghi chú</Form.Label>
                      <Form.Control as="textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Ví dụ: Cho mình lấy đồ lúc 8h sáng thứ 6..."
                        className="rounded-3" style={{ border: '1.5px solid #e2e8f0', fontSize: '14px', resize: 'none' }} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card>

              {/* ───── Payment method ───── */}
              <Card className="border-0 shadow-sm p-4 rounded-4 bg-white">
                <h5 className="fw-bold text-dark mb-4" style={{ fontWeight: 800 }}>Phương thức thanh toán</h5>
                <div className="d-flex flex-column gap-3">
                  <div onClick={() => setPaymentMethod('payos')} className="p-3 d-flex align-items-center gap-3 rounded-4"
                    style={{ border: paymentMethod === 'payos' ? '2px solid #1a6b3c' : '1px solid #cbd5e1', background: paymentMethod === 'payos' ? '#f0fdf4' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Form.Check type="radio" checked={paymentMethod === 'payos'} onChange={() => setPaymentMethod('payos')} />
                    <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center"
                      style={{ width: '64px', height: '38px', background: '#fff', border: '1px solid #e2e8f0' }}>
                      <img src="https://img.vietqr.io/image/vietqr_logo.png" alt="PayOS" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>Cổng thanh toán PayOS</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>Thanh toán qua mã QR Ngân hàng</span>
                    </div>
                  </div>

                  <div onClick={() => setPaymentMethod('cash')} className="p-3 d-flex align-items-center gap-3 rounded-4"
                    style={{ border: paymentMethod === 'cash' ? '2px solid #1a6b3c' : '1px solid #cbd5e1', background: paymentMethod === 'cash' ? '#f0fdf4' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Form.Check type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '38px', background: '#16a34a' }}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>payments</span>
                    </div>
                    <div>
                      <span className="fw-bold text-dark d-block" style={{ fontSize: '14px' }}>Tiền mặt</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>Trả tiền trực tiếp tại cửa hàng</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Right: Order summary */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: '110px' }}>
                <Card className="border-0 shadow-lg p-4 rounded-4 bg-white">
                  <h6 className="fw-bold text-dark mb-4" style={{ fontWeight: 900, letterSpacing: '0.5px' }}>
                    TÓM TẮT ĐƠN HÀNG
                  </h6>

                  {/* Rental time summary (compact) */}
                  {hasRentable && rentalDate && (
                    <div className="mb-3 p-2 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                      <span className="text-muted">Thời gian thuê: </span>
                      <span className="fw-semibold text-dark">{startTime} – {endTime} · {duration}h</span>
                    </div>
                  )}

                  {/* Items */}
                  <div className="d-flex flex-column gap-3 mb-4" style={{ fontSize: '13.5px' }}>
                    {cartProducts.map(({ product, qty }) => {
                      const cost = getItemCost(product, qty);
                      return (
                        <div key={product._id} className="d-flex justify-content-between align-items-start text-secondary">
                          <div>
                            <span className="fw-semibold text-dark d-block">{product.name}</span>
                            <span className="text-muted" style={{ fontSize: '11.5px' }}>
                              {product.price.toLocaleString('vi-VN')}đ
                              {product.type === 'rent' && product.chargeType === 'per_hour'
                                ? ` × ${qty} × ${duration}h`
                                : ` × ${qty}`}
                            </span>
                          </div>
                          <span className="fw-semibold text-dark flex-shrink-0">
                            {cost.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <hr className="my-2 opacity-50" style={{ borderStyle: 'dashed' }} />

                  <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '14px' }}>
                    <div className="d-flex justify-content-between text-secondary">
                      <span>Tạm tính</span>
                      <span className="fw-semibold text-dark">{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="d-flex justify-content-between text-secondary">
                      <span>Phí dịch vụ</span>
                      <span className="fw-semibold text-dark">{serviceFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  <hr className="my-2 opacity-50" />

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="text-secondary fw-bold">Tổng thanh toán</span>
                    <span className="fw-extrabold text-dark fs-3" style={{ fontWeight: 900 }}>
                      {total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting || cartProducts.length === 0}
                    className="w-100 py-3 rounded-pill fw-bold border-0 d-flex align-items-center justify-content-center gap-2"
                    style={{ background: '#0f172a', color: '#ffffff', fontSize: '15px', boxShadow: '0 8px 24px rgba(15,23,42,0.2)', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? (
                      <><Spinner as="span" animation="border" size="sm" /> Đang xử lý...</>
                    ) : 'Xác nhận & Thanh toán'}
                  </Button>

                  <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: '12px' }}>
                    <span className="material-symbols-outlined text-success" style={{ fontSize: '16px', color: '#16a34a' }}>verified_user</span>
                    <span className="text-muted fw-semibold">Thanh toán bảo mật 256-bit SSL</span>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default ShopCheckoutPage;
