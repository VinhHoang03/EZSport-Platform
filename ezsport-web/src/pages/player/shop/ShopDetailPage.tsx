import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal } from 'react-bootstrap';
import api from '../../../api/api';
import { type Product } from '../../../services/product.service';

interface Shop {
  _id: string;
  fullName: string;
  avatar?: string;
  shopAddress?: string;
  shopLat?: number;
  shopLng?: number;
  phone?: string;
  venueIds?: string[];
}

const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const CART_KEY = `shop_cart_${id}`;

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    // Restore cart from localStorage on mount
    try {
      const saved = localStorage.getItem(`shop_cart_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showRentOptionModal, setShowRentOptionModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchShopAndProducts = async () => {
      try {
        setLoading(true);
        // Load shops and find the current one by id
        const shopsRes = await api.get('/users/shops');
        const currentShop = (shopsRes.data.data || []).find((s: any) => s._id === id);
        if (currentShop) {
          setShop(currentShop);
        }

        // Load products by shop owner ID
        const prodsRes = await api.get(`/products/shop/${id}`);
        setProducts(prodsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load shop details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopAndProducts();
  }, [id]);

  // Persist cart to localStorage whenever quantities change
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(CART_KEY, JSON.stringify(quantities));
  }, [quantities, CART_KEY]);

  const updateQuantity = (productId: string, val: number, stock: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, Math.min(stock, (prev[productId] || 0) + val))
    }));
  };

  const selectedItemsCount = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = products.reduce((sum, p) => sum + (p.price * (quantities[p._id] || 0)), 0);

  const handleCheckout = () => {
    if (selectedItemsCount === 0 || !shop) return;

    // Check if there are rentable products selected
    const hasRentable = products.some(p => p.type === 'rent' && (quantities[p._id] || 0) > 0);
    if (hasRentable) {
      setShowRentOptionModal(true);
    } else {
      proceedToCheckout(false);
    }
  };

  const proceedToCheckout = (rentWithCourt: boolean) => {
    setShowRentOptionModal(false);
    if (!shop) return;

    // Filter quantities to only selected items
    const selectedProds: Record<string, number> = {};
    Object.entries(quantities).forEach(([prodId, qty]) => {
      if (qty > 0) selectedProds[prodId] = qty;
    });

    // Save selected quantities for checkout page to read
    sessionStorage.setItem('preselected_products', JSON.stringify(selectedProds));
    // Clear the persisted cart from localStorage — will be repopulated if user returns
    localStorage.removeItem(CART_KEY);

    const resolvedVenueId = shop.venueIds?.[0] || '6a37c7357d1920d53e81824e'; // Fallback to standard Pickleball venue

    if (rentWithCourt) {
      // Redirect to the venue detail page to choose court and slot
      navigate(`/venues/${resolvedVenueId}`);
    } else {
      // Standalone: go directly to shop-only checkout, no venue/court needed
      navigate(`/shops/${id}/checkout`);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-50 py-5">
        <Spinner variant="success" />
      </Container>
    );
  }

  if (!shop) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-danger fw-bold">Không tìm thấy thông tin cửa hàng</h4>
        <Button variant="success" className="mt-3 rounded-pill" onClick={() => navigate('/shops')}>Quay lại danh sách</Button>
      </Container>
    );
  }

  // Group products by category
  const categories = ['Đồ uống', 'Dụng cụ', 'Phụ kiện', 'Trang phục', 'Khác'];
  const getProductsByCategory = (cat: string) => {
    return products.filter(p => {
      if (cat === 'Khác') {
        return !p.category || p.category === 'Khác' || !categories.includes(p.category);
      }
      return p.category === cat;
    });
  };

  return (
    <Container className="py-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Back Button */}
      <Button
        variant="link"
        onClick={() => navigate('/shops')}
        className="text-success fw-semibold p-0 mb-4 d-flex align-items-center gap-1 border-0 shadow-none hover-scale"
        style={{ color: '#1a6b3c' }}
      >
        <span className="material-symbols-outlined fs-5">arrow_back</span>
        Quay lại danh sách cửa hàng
      </Button>

      {/* Shop Profile Banner */}
      <Card className="border-0 shadow-sm p-4 mb-5 bg-white rounded-4">
        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
          <img
            src={shop.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.fullName)}&background=16a34a&color=fff&size=120&bold=true`}
            alt={shop.fullName}
            className="rounded-circle border"
            style={{ width: '84px', height: '84px', objectFit: 'cover' }}
          />
          <div className="text-center text-md-start flex-grow-1">
            <div className="d-flex flex-column flex-md-row align-items-center gap-2.5 mb-2">
              <h3 className="fw-bold text-dark mb-0" style={{ fontWeight: 800 }}>{shop.fullName}</h3>
              <Badge className="bg-success text-white px-3 py-1.5 rounded-pill" style={{ fontSize: '11px' }}>Cửa hàng đối tác</Badge>
            </div>
            <p className="text-secondary mb-2 small d-flex align-items-center justify-content-center justify-content-md-start gap-1">
              <span className="material-symbols-outlined fs-6 text-muted">location_on</span>
              {shop.shopAddress || 'Chưa cập nhật địa điểm'}
            </p>
            <p className="text-secondary mb-0 small d-flex align-items-center justify-content-center justify-content-md-start gap-1">
              <span className="material-symbols-outlined fs-6 text-muted">call</span>
              Hotline: {shop.phone || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      </Card>

      <Row className="g-4">
        {/* Left Column: Products list */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-4" style={{ fontWeight: 800 }}>Gian hàng sản phẩm</h5>

            {products.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <span className="material-symbols-outlined fs-2 mb-2">shopping_bag</span>
                <p className="small">Cửa hàng hiện chưa đăng tải sản phẩm nào.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-5">
                {categories.map(cat => {
                  const catProducts = getProductsByCategory(cat);
                  if (catProducts.length === 0) return null;

                  return (
                    <div key={cat}>
                      <h6 className="fw-bold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center gap-1.5" style={{ fontSize: '15px' }}>
                        <span className="material-symbols-outlined fs-5">
                          {cat === 'Đồ uống' ? 'local_cafe' : cat === 'Dụng cụ' ? 'sports_tennis' : cat === 'Phụ kiện' ? 'shopping_bag' : 'style'}
                        </span>
                        {cat}
                      </h6>
                      <Row className="g-3">
                        {catProducts.map(p => {
                          const qty = quantities[p._id] || 0;
                          return (
                            <Col md={6} key={p._id}>
                              <div className="p-3 border rounded-4 d-flex justify-content-between align-items-center bg-light" style={{ borderRadius: '16px' }}>
                                <div className="d-flex align-items-center gap-2.5">
                                  <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center bg-white" style={{ width: '48px', height: '48px', border: '1px solid #e5e7eb' }}>
                                    {p.image ? (
                                      <img src={p.image} alt={p.name} className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                      <span className="material-symbols-outlined text-muted">shopping_bag</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="fw-bold text-dark d-block" style={{ fontSize: '13.5px' }}>{p.name}</span>
                                    <span className="text-success fw-bold" style={{ fontSize: '13px' }}>
                                      {p.price.toLocaleString('vi-VN')}đ
                                      {p.type === 'rent' && (p.chargeType === 'per_hour' ? '/giờ' : '/lượt')}
                                    </span>
                                  </div>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <Button
                                    variant="white"
                                    size="sm"
                                    className="rounded-circle border p-1 d-flex align-items-center justify-content-center bg-white shadow-none"
                                    style={{ width: '28px', height: '28px', color: '#000', border: '1px solid #cbd5e1' }}
                                    onClick={() => updateQuantity(p._id, -1, p.stock)}
                                    disabled={qty === 0}
                                  >
                                    -
                                  </Button>
                                  <span className="fw-bold px-1" style={{ fontSize: '14px', minWidth: '16px', textAlign: 'center' }}>{qty}</span>
                                  <Button
                                    variant="white"
                                    size="sm"
                                    className="rounded-circle border p-1 d-flex align-items-center justify-content-center bg-white shadow-none"
                                    style={{ width: '28px', height: '28px', color: '#000', border: '1px solid #cbd5e1' }}
                                    onClick={() => updateQuantity(p._id, 1, p.stock)}
                                    disabled={qty >= p.stock}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column: Checkout cart */}
        <Col lg={4}>
          <Card className="border-0 shadow-lg p-4 rounded-4 bg-white position-sticky" style={{ top: '110px' }}>
            <h6 className="fw-bold text-dark mb-3" style={{ fontWeight: 800 }}>ĐƠN HÀNG MUA SẮM</h6>

            <div className="d-flex flex-column gap-2 mb-4" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {products.filter(p => (quantities[p._id] || 0) > 0).map(p => {
                const qty = quantities[p._id];
                return (
                  <div key={p._id} className="d-flex justify-content-between text-secondary" style={{ fontSize: '13.5px' }}>
                    <span>{p.name} (x{qty})</span>
                    <span className="fw-semibold text-dark">{(p.price * qty).toLocaleString('vi-VN')}đ</span>
                  </div>
                );
              })}
              {selectedItemsCount === 0 && (
                <span className="text-muted small py-3 text-center">Chưa có sản phẩm nào được chọn.</span>
              )}
            </div>

            <hr className="my-3 opacity-50" />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted fw-bold small">TỔNG CỘNG</span>
              <span className="fw-extrabold text-success fs-4" style={{ color: '#1a6b3c', fontWeight: 900 }}>
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={selectedItemsCount === 0}
              className="w-100 py-3 rounded-pill fw-bold border-0 hover-scale mb-3"
              style={{
                background: '#1a6b3c',
                color: '#ffffff',
                fontSize: '14px',
                boxShadow: selectedItemsCount > 0 ? '0 8px 24px rgba(26, 107, 60, 0.3)' : 'none'
              }}
            >
              Thanh toán mua sắm
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Rent Options Modal */}
      <Modal show={showRentOptionModal} onHide={() => setShowRentOptionModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Lựa chọn hình thức thuê dụng cụ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          <p className="text-secondary small mb-4" style={{ fontSize: '13.5px' }}>
            Bạn đang có dụng cụ thể thao trong đơn hàng. Hãy chọn một trong hai phương thức thuê dưới đây:
          </p>

          <div className="d-flex flex-column gap-3">
            {/* Option 1: Only rent items */}
            <div
              onClick={() => proceedToCheckout(false)}
              className="p-3 border rounded-4 cursor-pointer hover-scale transition-all"
              style={{
                cursor: 'pointer',
                borderColor: '#cbd5e1',
                background: '#ffffff',
                borderRadius: '16px'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="material-symbols-outlined text-secondary fs-3">shopping_bag</span>
                <div>
                  <span className="fw-bold text-dark d-block" style={{ fontSize: '14.5px' }}>Chỉ thuê đồ lẻ</span>
                  <span className="text-muted small" style={{ fontSize: '11px' }}>Thuê với mức giá thông thường, nhận đồ tại cửa hàng.</span>
                </div>
              </div>
            </div>

            {/* Option 2: Rent with court */}
            <div
              onClick={() => proceedToCheckout(true)}
              className="p-3 border rounded-4 cursor-pointer hover-scale transition-all"
              style={{
                cursor: 'pointer',
                borderColor: '#16a34a',
                background: '#f0fdf4',
                borderRadius: '16px',
                borderWidth: '2px'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="material-symbols-outlined text-success fs-3" style={{ color: '#16a34a' }}>sports_tennis</span>
                <div>
                  <span className="fw-bold text-success d-block" style={{ fontSize: '14.5px' }}>Thuê đồ kèm đặt sân (Nhận ưu đãi)</span>
                  <span className="text-muted small" style={{ fontSize: '11px', color: '#15803d' }}>
                    Nhận ngay mức giá thuê ưu đãi (giảm đến 30%). Bạn sẽ được chuyển sang giao diện chọn giờ và đặt sân đấu.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ShopDetailPage;
