import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import api from '../../../api/api';

// Haversine distance formula in KM
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface Shop {
  _id: string;
  fullName: string;
  avatar?: string;
  shopAddress?: string;
  shopLat?: number;
  shopLng?: number;
  phone?: string;
  distance?: number;
}

const ShopListPage: React.FC = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Auto-request GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('[ShopListPage] Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get('/users/shops');
        setShops(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch shops:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // Compute distances & sort
  const shopsWithDistance = shops.map(shop => {
    let distance: number | undefined = undefined;
    if (userLocation && shop.shopLat && shop.shopLng) {
      distance = getDistance(userLocation.lat, userLocation.lng, shop.shopLat, shop.shopLng);
    }
    return { ...shop, distance };
  }).sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

  if (loading) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-50 py-5">
        <Spinner variant="success" />
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-5 text-center text-md-start">
        <h2 className="fw-bold text-dark mb-2" style={{ fontWeight: 850, letterSpacing: '-0.5px' }}>
          Cửa hàng Thể thao & Dịch vụ đi kèm
        </h2>
        <p className="text-muted" style={{ fontSize: '15px' }}>
          Khám phá danh sách các cửa hàng cung cấp dụng cụ, đồ uống, và trang phục thể thao quanh bạn.
        </p>
      </div>

      {shopsWithDistance.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm rounded-4">
          <Card.Body className="py-5 text-muted">
            <span className="material-symbols-outlined fs-1 mb-3 text-secondary">storefront</span>
            <h5 className="fw-bold text-dark">Chưa có cửa hàng nào hoạt động</h5>
            <p className="small">Vui lòng quay lại sau.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {shopsWithDistance.map(shop => (
            <Col key={shop._id} md={6} lg={4}>
              <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative hover-scale transition-all" style={{ border: '1px solid rgba(0,0,0,0.03)' }}>
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={shop.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.fullName)}&background=16a34a&color=fff&size=100&bold=true`}
                      alt={shop.fullName}
                      className="rounded-circle border"
                      style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                    />
                    <div>
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '16px' }}>{shop.fullName}</h5>
                      <span className="small text-muted">{shop.phone || 'Chưa cập nhật số điện thoại'}</span>
                    </div>
                  </div>

                  <p className="text-secondary small mb-4 flex-grow-1" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <span className="material-symbols-outlined align-middle fs-6 me-1 text-muted">location_on</span>
                    {shop.shopAddress || 'Chưa thiết lập địa chỉ'}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      {shop.distance !== undefined ? (
                        <Badge className="bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill fw-bold" style={{ fontSize: '12px' }}>
                          Cách {shop.distance.toFixed(1)} km
                        </Badge>
                      ) : (
                        <Badge bg="secondary-subtle" className="text-secondary px-2.5 py-1.5 rounded-pill" style={{ fontSize: '12px' }}>
                          Vị trí chưa rõ
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/shops/${shop._id}`)}
                      className="rounded-pill px-4 py-2 border-0 fw-bold hover-scale"
                      style={{ background: '#1a6b3c', color: '#ffffff', fontSize: '12px' }}
                    >
                      Vào cửa hàng
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ShopListPage;
