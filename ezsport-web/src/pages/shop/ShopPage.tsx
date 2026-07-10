import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { venueService, type Venue } from '../../services/venue.service';
import { productService, type Product } from '../../services/product.service';
import { bookingService, type Booking } from '../../services/booking.service';
import api from '../../api/api';

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

interface ShopPageProps {
  onGoHome: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onGoHome }) => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'venues' | 'inventory' | 'orders'>('inventory');

  // Multi-venue selection states
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [venuesWithDistance, setVenuesWithDistance] = useState<(Venue & { distance?: number })[]>([]);
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>(user?.venueIds || []);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    user?.shopLat && user?.shopLng ? { lat: user.shopLat, lng: user.shopLng } : null
  );
  const [shopAddressInput, setShopAddressInput] = useState(user?.shopAddress || '');
  const [shopLatInput, setShopLatInput] = useState(user?.shopLat ? String(user.shopLat) : '');
  const [shopLngInput, setShopLngInput] = useState(user?.shopLng ? String(user.shopLng) : '');
  const [savingLocation, setSavingLocation] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [savingVenues, setSavingVenues] = useState(false);

  // Active venue switch for products/orders
  const [currentVenueId, setCurrentVenueId] = useState<string>('');

  // Products states
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Đồ uống',
    description: '',
    price: 0,
    priceWithCourt: '',
    stock: 0,
    image: '',
    type: 'sell' as 'sell' | 'rent',
    chargeType: 'per_booking' as 'per_booking' | 'per_hour'
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Orders states
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 1. Fetch user location and venues
  useEffect(() => {
    const fetchVenues = async () => {
      setLoadingVenues(true);
      try {
        const venues = await venueService.getVenues({ active: 'true' });
        setAllVenues(venues);
      } catch (err) {
        console.error('Error fetching venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();

    // Get browser geolocation only if user hasn't saved a store location
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('GPS geolocation permission denied:', err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Compute and sort distances when location or venues list changes
  useEffect(() => {
    if (!allVenues.length) return;

    if (userLocation) {
      const computed = allVenues.map(v => ({
        ...v,
        distance: getDistance(userLocation.lat, userLocation.lng, v.lat, v.lng)
      })).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
      setVenuesWithDistance(computed);
    } else {
      setVenuesWithDistance(allVenues);
    }
  }, [allVenues, userLocation]);

  // Set default selected venue once user venueIds load
  useEffect(() => {
    if (user?.venueIds) {
      setSelectedVenueIds(user.venueIds);
      if (user.venueIds.length > 0) {
        setCurrentVenueId(user.venueIds[0]);
      } else {
        setActiveTab('venues'); // Send directly to venue linking page if empty
      }
    }
  }, [user]);

  // Sync state if user profile is reloaded
  useEffect(() => {
    if (user) {
      setShopAddressInput(user.shopAddress || '');
      setShopLatInput(user.shopLat ? String(user.shopLat) : '');
      setShopLngInput(user.shopLng ? String(user.shopLng) : '');
      if (user.shopLat && user.shopLng) {
        setUserLocation({ lat: user.shopLat, lng: user.shopLng });
      }
    }
  }, [user]);

  // Handler to fetch coordinates using browser GPS
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setShopLatInput(String(lat));
          setShopLngInput(String(lng));

          setSavingLocation(true);
          let resolvedAddress = shopAddressInput;

          try {
            // Fetch human-readable address from OpenStreetMap Nominatim API in Vietnamese, targeting building level
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'vi,en;q=0.9'
                }
              }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData && geoData.address) {
                const addr = geoData.address;
                const parts = [];

                // 1. House number + Street (e.g. 123 Nguyen Van Linh)
                if (addr.house_number && addr.road) {
                  parts.push(`${addr.house_number} ${addr.road}`);
                } else if (addr.road) {
                  parts.push(addr.road);
                } else if (addr.house_number) {
                  parts.push(addr.house_number);
                }

                // 2. Ward/Commune (Phường/Xã)
                const ward = addr.suburb || addr.quarter || addr.neighbourhood || addr.village || addr.townland;
                if (ward) parts.push(ward);

                // 3. District (Quận/Huyện)
                const district = addr.subdistrict || addr.city_district || addr.district || addr.county;
                if (district) parts.push(district);

                // 4. City/Province (Thành phố/Tỉnh)
                let city = addr.city || addr.town || addr.municipality || addr.state || addr.province;
                const isDaNangProvince = (geoData.display_name && geoData.display_name.toLowerCase().includes("đà nẵng")) || addr["ISO3166-2-lvl4"] === "VN-DN";
                if (isDaNangProvince) {
                  city = "Thành phố Đà Nẵng";
                }
                if (city) parts.push(city);

                // 5. Country (Quốc gia)
                if (addr.country) parts.push(addr.country);

                resolvedAddress = parts.join(', ');
                setShopAddressInput(resolvedAddress);
              } else if (geoData && geoData.display_name) {
                resolvedAddress = geoData.display_name;
                setShopAddressInput(resolvedAddress);
              }
            }
          } catch (geoErr) {
            console.warn('Reverse geocoding failed, falling back to existing input:', geoErr);
          }

          try {
            await api.put('/users/me', {
              shopAddress: resolvedAddress,
              shopLat: lat,
              shopLng: lng
            });
            // Sync local context state
            updateUser({
              shopAddress: resolvedAddress,
              shopLat: lat,
              shopLng: lng
            });
            setUserLocation({ lat, lng });
            alert('Định vị GPS và tự động lưu địa chỉ cửa hàng thành công!');
          } catch (err: any) {
            alert('Lấy GPS thành công nhưng không thể tự động lưu: ' + (err.response?.data?.message || err.message));
          } finally {
            setSavingLocation(false);
          }
        },
        (err) => alert('Không thể lấy GPS: ' + err.message),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
    }
  };

  // Handler to save shop location details to profile
  const handleSaveShopLocation = async () => {
    setSavingLocation(true);
    try {
      const lat = shopLatInput ? Number(shopLatInput) : undefined;
      const lng = shopLngInput ? Number(shopLngInput) : undefined;
      await api.put('/users/me', {
        shopAddress: shopAddressInput,
        shopLat: lat,
        shopLng: lng
      });
      // Sync local context state
      updateUser({
        shopAddress: shopAddressInput,
        shopLat: lat,
        shopLng: lng
      });
      if (lat && lng) {
        setUserLocation({ lat, lng });
      }
      alert('Cập nhật thông tin vị trí cửa hàng thành công!');
    } catch (err: any) {
      alert('Lỗi lưu vị trí: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingLocation(false);
    }
  };

  // 2. Fetch products and orders for current selected venue
  const fetchVenueData = useCallback(async () => {
    if (!currentVenueId) return;

    // Fetch Products
    setLoadingProducts(true);
    try {
      const prodList = await productService.getProductsByVenueAll(currentVenueId);
      setProducts(prodList);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }

    // Fetch Orders
    setLoadingOrders(true);
    try {
      const res = await bookingService.getVenueBookings(currentVenueId, { limit: 100 });
      // Filter bookings containing products
      const bookingsWithProducts = (res.bookings || []).filter(b => b.products && b.products.length > 0);
      setOrders(bookingsWithProducts);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [currentVenueId]);

  useEffect(() => {
    fetchVenueData();
  }, [currentVenueId, fetchVenueData]);

  // 3. Save linked venues
  const handleSaveVenues = async () => {
    setSavingVenues(true);
    try {
      await api.put('/users/me', { venueIds: selectedVenueIds });
      updateUser({ venueIds: selectedVenueIds });
      alert('🎉 Đã liên kết địa điểm thành công!');
      if (selectedVenueIds.length > 0) {
        setCurrentVenueId(selectedVenueIds[0]);
        setActiveTab('inventory');
      }
    } catch (err: any) {
      alert('Lỗi lưu địa điểm: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingVenues(false);
    }
  };

  const toggleVenueSelect = (venueId: string) => {
    setSelectedVenueIds(prev => 
      prev.includes(venueId) ? prev.filter(id => id !== venueId) : [...prev, venueId]
    );
  };

  // 4. Products CRUD Handlers
  const handleOpenProductModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setProductForm({
        name: product.name,
        category: product.category || 'Đồ uống',
        description: product.description || '',
        price: product.price,
        priceWithCourt: product.priceWithCourt !== undefined ? String(product.priceWithCourt) : '',
        stock: product.stock,
        image: product.image || '',
        type: product.type,
        chargeType: product.chargeType || 'per_booking'
      });
    } else {
      setProductForm({
        name: '',
        category: 'Đồ uống',
        description: '',
        price: 0,
        priceWithCourt: '',
        stock: 0,
        image: '',
        type: 'sell',
        chargeType: 'per_booking'
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVenueId) return;

    setSubmittingProduct(true);
    try {
      const payload: Partial<Product> = {
        name: productForm.name,
        category: productForm.category,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image: productForm.image,
        type: productForm.type,
        chargeType: productForm.type === 'rent' ? productForm.chargeType : undefined,
        priceWithCourt: (productForm.type === 'rent' && productForm.priceWithCourt !== '') ? Number(productForm.priceWithCourt) : undefined
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productService.createProduct(currentVenueId, payload);
        alert('Thêm sản phẩm thành công!');
      }
      setShowProductModal(false);
      fetchVenueData();
    } catch (err: any) {
      alert('Lỗi lưu sản phẩm: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm/dịch vụ này?')) return;
    try {
      await productService.deleteProduct(productId);
      alert('Đã xóa sản phẩm.');
      fetchVenueData();
    } catch (err: any) {
      alert('Lỗi xóa sản phẩm: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: '260px',
          backgroundColor: '#0f3d22',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center cursor-pointer"
          onClick={onGoHome}
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '8px',
            padding: '15px 0px 20px 0px',
          }}
        >
          <img
            src="/logo1.png"
            alt="EZSport Logo"
            style={{ width: '100%', height: 'auto', maxHeight: '110px', objectFit: 'cover' }}
          />
        </div>

        <div className="px-4 mb-4">
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {user?.fullName
                ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'SH'
              }
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'Người bán hàng'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '4px',
                }}
              >
                Cửa hàng
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow-1 px-3" style={{ overflowY: 'auto' }}>
          {[
            { id: 'inventory', icon: 'inventory', label: 'Kho hàng' },
            { id: 'orders', icon: 'receipt_long', label: 'Đơn hàng dịch vụ' },
            { id: 'venues', icon: 'explore', label: 'Liên kết địa điểm' }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '4px',
                background: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeTab === item.id ? '#ffffff' : 'rgba(255,255,255,0.7)',
                fontWeight: activeTab === item.id ? 600 : 500,
                transition: 'all 0.2s',
                borderLeft: activeTab === item.id ? '4px solid #ea580c' : '4px solid transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div
            onClick={() => { logout(); onGoHome(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '12px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              logout
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Đăng xuất</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOP BAR WITH VENUE SELECTOR */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom"
          style={{ height: '70px', borderColor: '#e2e8f0' }}
        >
          <div className="d-flex align-items-center gap-3">
            <h5 className="fw-bold text-dark m-0" style={{ fontSize: '18px' }}>
              {activeTab === 'inventory' && 'Quản lý Kho hàng'}
              {activeTab === 'orders' && 'Danh sách Đơn hàng'}
              {activeTab === 'venues' && 'Cấu hình Địa điểm hoạt động'}
            </h5>

            {/* Dropdown switch between linked venues */}
            {activeTab !== 'venues' && selectedVenueIds.length > 0 && (
              <Form.Select
                value={currentVenueId}
                onChange={(e) => setCurrentVenueId(e.target.value)}
                className="py-1 px-3 border shadow-none"
                style={{ fontSize: '13.5px', borderRadius: '10px', width: '280px', fontWeight: 600, color: '#1e293b' }}
              >
                {allVenues
                  .filter(v => selectedVenueIds.includes(v._id))
                  .map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))
                }
              </Form.Select>
            )}
          </div>
          <div className="text-end" style={{ fontSize: '13px', color: '#64748b' }}>
            <div className="mb-0.5">
              <span className="fw-bold text-dark">Địa chỉ cửa hàng: </span>
              <span>{user?.shopAddress || 'Chưa cấu hình vị trí'}</span>
            </div>
            {currentVenueId && activeTab !== 'venues' && (
              <div style={{ fontSize: '12px' }}>
                <span className="fw-semibold">Cơ sở hoạt động: </span>
                <span>{allVenues.find(v => v._id === currentVenueId)?.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* TAB BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* TAB 1: VENUE LINKING WITH GPS DISTANCE SORTING */}
          {activeTab === 'venues' && (
            <Card className="border-0 shadow-sm p-4 rounded-4">
              {/* Store Location Settings Form */}
              <div className="mb-4 p-4 border border-light-subtle rounded-4" style={{ backgroundColor: '#f8fafc' }}>
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '15px' }}>Địa chỉ & Vị trí Cửa hàng của bạn</h6>
                <p className="text-muted small mb-3" style={{ fontSize: '12.5px' }}>
                  Cấu hình địa chỉ của cửa hàng để tính toán chính xác khoảng cách địa lý đến các sân đấu. Bạn có thể tự nhập địa chỉ/tọa độ hoặc lấy trực tiếp từ GPS thiết bị.
                </p>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px' }}>Địa chỉ hiển thị</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: 123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng"
                        value={shopAddressInput}
                        onChange={(e) => setShopAddressInput(e.target.value)}
                        className="py-2.5 border-light-subtle shadow-none rounded-3"
                        style={{ fontSize: '13px' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} xs={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px' }}>Vĩ độ (Latitude)</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        placeholder="Ví dụ: 16.047"
                        value={shopLatInput}
                        onChange={(e) => setShopLatInput(e.target.value)}
                        className="py-2.5 border-light-subtle shadow-none rounded-3"
                        style={{ fontSize: '13px' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} xs={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted" style={{ fontSize: '11px' }}>Kinh độ (Longitude)</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        placeholder="Ví dụ: 108.206"
                        value={shopLngInput}
                        onChange={(e) => setShopLngInput(e.target.value)}
                        className="py-2.5 border-light-subtle shadow-none rounded-3"
                        style={{ fontSize: '13px' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleDetectGPS}
                    className="rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1.5"
                    style={{ fontSize: '12px', color: '#0f3d22', borderColor: '#0f3d22' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span>
                    Lấy vị trí GPS thiết bị hiện tại
                  </Button>
                  <Button
                    onClick={handleSaveShopLocation}
                    disabled={savingLocation}
                    className="rounded-pill px-4 py-2 fw-bold text-white border-0 hover-scale"
                    style={{ background: '#ea580c', fontSize: '12px' }}
                  >
                    {savingLocation ? <Spinner size="sm" /> : 'Lưu cài đặt vị trí'}
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-2" style={{ fontWeight: 800 }}>Chọn địa điểm liên kết hoạt động</h5>
                <p className="text-muted small m-0" style={{ fontSize: '13px' }}>
                  Vui lòng chọn các địa điểm sân bạn đang cung cấp dịch vụ ăn uống, cho thuê phụ kiện. Danh sách được đo khoảng cách từ địa chỉ cửa hàng của bạn ở trên và sắp xếp từ gần đến xa.
                </p>
              </div>

              {loadingVenues ? (
                <div className="text-center py-5"><Spinner variant="warning" /></div>
              ) : (
                <>
                  <div className="d-flex flex-column gap-3 mb-4 max-vh-50 overflow-auto">
                    {venuesWithDistance.map(venue => {
                      const isChecked = selectedVenueIds.includes(venue._id);
                      return (
                        <div
                           key={venue._id}
                           onClick={() => toggleVenueSelect(venue._id)}
                           className="p-3 border rounded-4 d-flex align-items-center justify-content-between"
                           style={{
                             cursor: 'pointer',
                             borderColor: isChecked ? '#ea580c' : '#e2e8f0',
                             backgroundColor: isChecked ? '#fff7ed' : '#ffffff',
                             transition: 'all 0.2s',
                           }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <Form.Check
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              style={{ cursor: 'pointer' }}
                            />
                            <div className="overflow-hidden rounded-3" style={{ width: '60px', height: '60px', background: '#e2e8f0' }}>
                              <img src={venue.image} alt={venue.name} className="w-100 h-100 object-fit-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/80c450?text=Venue' }} />
                            </div>
                            <div>
                              <h6 className="fw-bold m-0 text-dark" style={{ fontSize: '15px' }}>{venue.name}</h6>
                              <small className="text-muted d-block" style={{ fontSize: '12px' }}>{venue.location}</small>
                              <div className="d-flex gap-2.5 mt-1 align-items-center">
                                {venue.sportTypes.map(s => (
                                  <Badge key={s} className="bg-light text-secondary border px-2 py-0.5 rounded-pill" style={{ fontSize: '9px' }}>{s}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            {venue.distance !== undefined ? (
                              <Badge className="bg-warning text-dark px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '11px' }}>
                                {venue.distance.toFixed(1)} km
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="px-3 py-2 rounded-pill small">Vị trí chưa rõ</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-end">
                    <Button
                      onClick={handleSaveVenues}
                      disabled={savingVenues}
                      className="px-5 py-2.5 rounded-pill fw-bold text-white border-0 shadow-lg hover-scale"
                      style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                    >
                      {savingVenues ? <Spinner size="sm" /> : 'Lưu và kích hoạt'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* TAB 2: INVENTORY & PRODUCTS CRUD */}
          {activeTab === 'inventory' && (
            <div>
              {selectedVenueIds.length === 0 ? (
                <Card className="text-center py-5 border-0 shadow-sm rounded-4">
                  <span className="material-symbols-outlined fs-1 text-muted mb-3">explore</span>
                  <h6>Bạn chưa liên kết sân hoạt động nào.</h6>
                  <p className="text-muted small">Vui lòng chọn tab "Liên kết địa điểm" để bắt đầu kinh doanh.</p>
                  <Button variant="warning" className="rounded-pill px-4" onClick={() => setActiveTab('venues')}>Đi liên kết ngay</Button>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold m-0" style={{ fontSize: '16px', fontWeight: 800 }}>Danh mục sản phẩm & dịch vụ</h6>
                      <small className="text-muted">Quản lý các mặt hàng bán nước, thuê vợt, dụng cụ tại sân.</small>
                    </div>
                    <Button
                      onClick={() => handleOpenProductModal(null)}
                      className="rounded-pill px-4 py-2 border-0 text-white d-flex align-items-center gap-1.5 fw-bold"
                      style={{ background: '#ea580c' }}
                    >
                      <span className="material-symbols-outlined fs-5">add</span>
                      Thêm sản phẩm
                    </Button>
                  </div>

                  {loadingProducts ? (
                    <div className="text-center py-5"><Spinner variant="warning" /></div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <span className="material-symbols-outlined fs-2 mb-2">inventory_2</span>
                      <p className="small">Chưa có sản phẩm nào cho sân này. Hãy click "Thêm sản phẩm" ở trên để bắt đầu!</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle m-0" style={{ borderCollapse: 'separate' }}>
                         <thead className="table-light">
                          <tr style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                            <th className="ps-4">TÊN SẢN PHẨM</th>
                            <th>DANH MỤC</th>
                            <th>LOẠI HÌNH</th>
                            <th>GIÁ TIÊU CHUẨN</th>
                            <th>GIÁ THUÊ KÈM SÂN</th>
                            <th>TỒN KHO</th>
                            <th>TRẠNG THÁI</th>
                            <th className="pe-4 text-end">THAO TÁC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product._id} style={{ fontSize: '13.5px' }}>
                              <td className="ps-4 py-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', background: '#f1f5f9' }}>
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                      <span className="material-symbols-outlined text-muted">{product.type === 'rent' ? 'sports_tennis' : 'local_cafe'}</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="fw-bold text-dark d-block">{product.name}</span>
                                    {product.description && <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>{product.description}</small>}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge className="bg-light text-dark border px-2.5 py-1 rounded-pill" style={{ fontSize: '12px', fontWeight: 600 }}>
                                  {product.category || 'Khác'}
                                </Badge>
                              </td>
                              <td>
                                {product.type === 'rent' ? (
                                  <Badge bg="info" className="text-white px-2 py-1 rounded-pill">
                                    Thuê ({product.chargeType === 'per_hour' ? 'Giờ' : 'Lượt'})
                                  </Badge>
                                ) : (
                                  <Badge bg="success" className="px-2 py-1 rounded-pill">Bán đứt</Badge>
                                )}
                              </td>
                              <td className="fw-bold text-dark">{product.price.toLocaleString('vi-VN')}đ</td>
                              <td>
                                {product.type === 'rent' && product.priceWithCourt !== undefined ? (
                                  <span className="text-success fw-bold">{product.priceWithCourt.toLocaleString('vi-VN')}đ</span>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td>
                                <span className={product.stock === 0 ? 'text-danger fw-bold' : 'text-dark'}>
                                  {product.stock} {product.type === 'rent' ? 'dụng cụ' : 'món'}
                                </span>
                              </td>
                              <td>
                                {product.isActive ? (
                                  <Badge className="bg-success-subtle text-success border border-success border-opacity-20 rounded-pill px-2.5">Hoạt động</Badge>
                                ) : (
                                  <Badge bg="secondary" className="rounded-pill px-2.5">Tạm ẩn</Badge>
                                )}
                              </td>
                              <td className="pe-4 text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                  <Button
                                    variant="link"
                                    onClick={() => handleOpenProductModal(product)}
                                    className="p-1 border-0 shadow-none text-muted hover-scale"
                                  >
                                    <span className="material-symbols-outlined fs-5">edit</span>
                                  </Button>
                                  <Button
                                    variant="link"
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="p-1 border-0 shadow-none text-danger hover-scale"
                                  >
                                    <span className="material-symbols-outlined fs-5">delete</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: ORDER PRODUCTS LIST */}
          {activeTab === 'orders' && (
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="p-4 bg-white border-bottom">
                <h6 className="fw-bold m-0" style={{ fontSize: '16px', fontWeight: 800 }}>Đơn hàng chuẩn bị sản phẩm</h6>
                <small className="text-muted">Theo dõi và chuẩn bị đồ uống, dụng cụ thuê tương ứng với lịch đặt sân của khách.</small>
              </div>

              {loadingOrders ? (
                <div className="text-center py-5"><Spinner variant="warning" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <span className="material-symbols-outlined fs-2 mb-2">receipt</span>
                  <p className="small">Chưa có đơn đặt sân nào kèm dịch vụ/sản phẩm tại địa điểm này.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle m-0">
                    <thead className="table-light">
                      <tr style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                        <th className="ps-4">MÃ ĐƠN & KHÁCH HÀNG</th>
                        <th>LỊCH CHƠI</th>
                        <th>SÂN</th>
                        <th>DANH SÁCH MÓN ĐẶT</th>
                        <th>TRẠNG THÁI</th>
                        <th className="pe-4 text-end">LIÊN HỆ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id} style={{ fontSize: '13px' }}>
                          <td className="ps-4 py-3">
                            <div>
                              <span className="fw-bold text-dark d-block">#{order._id.substring(0, 10)}...</span>
                              <span className="fw-bold text-secondary d-block">{order.bookerName}</span>
                              <small className="text-muted d-block">{order.bookerPhone}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <span className="fw-semibold text-dark d-block">{order.bookingDate ? new Date(order.bookingDate).toLocaleDateString('vi-VN') : ''}</span>
                              <span className="text-muted small">{order.startTime} - {order.endTime} ({order.duration} giờ)</span>
                            </div>
                          </td>
                          <td>
                            <Badge className="bg-light text-dark border px-2.5 py-1 rounded-pill">{order.courtId ? (order.courtId as any).name : 'Sân đấu'}</Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1.5">
                              {order.products?.map((item: any) => (
                                <div key={item.productId} className="d-flex align-items-center justify-content-between p-2 rounded bg-light border border-light" style={{ minWidth: '220px' }}>
                                  <div>
                                    <span className="fw-bold text-dark">{item.name}</span>
                                    <Badge bg={item.type === 'rent' ? 'info' : 'success'} className="ms-1.5" style={{ fontSize: '8px' }}>
                                      {item.type === 'rent' ? 'Thuê' : 'Mua'}
                                    </Badge>
                                  </div>
                                  <span className="fw-extrabold text-secondary">
                                    {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                                    {item.chargeType === 'per_hour' && ` / giờ`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge
                              className="px-2.5 py-1 rounded-pill"
                              style={{
                                backgroundColor:
                                  order.status === 'CONFIRMED' ? '#ecfdf5' :
                                  order.status === 'CHECKED_IN' ? '#f3e8ff' :
                                  order.status === 'COMPLETED' ? '#f3f4f6' :
                                  order.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb',
                                color:
                                  order.status === 'CONFIRMED' ? '#10b981' :
                                  order.status === 'CHECKED_IN' ? '#8b5cf6' :
                                  order.status === 'COMPLETED' ? '#6b7280' :
                                  order.status === 'CANCELLED' ? '#ef4444' : '#f59e0b',
                              }}
                            >
                              {order.status === 'PENDING' && 'Chờ duyệt'}
                              {order.status === 'CONFIRMED' && 'Đã duyệt/TT'}
                              {order.status === 'CHECKED_IN' && 'Đã Checkin'}
                              {order.status === 'COMPLETED' && 'Hoàn thành'}
                              {order.status === 'CANCELLED' && 'Đã hủy'}
                            </Badge>
                          </td>
                          <td className="pe-4 text-end">
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-circle p-2 border-success border-opacity-20 text-success"
                              onClick={() => alert(`Đang gọi đến số khách: ${order.bookerPhone}`)}
                            >
                              <span className="material-symbols-outlined fs-6">call</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card>
          )}

        </div>
      </div>

      {/* CREATE/EDIT PRODUCT MODAL */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered style={{ fontFamily: "'Inter', sans-serif" }}>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold" style={{ fontWeight: 800 }}>
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Tên sản phẩm/dịch vụ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Nước ngọt Pocari, Thuê vợt Li-ning..."
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="py-2.5 border-light-subtle shadow-none rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Danh mục</Form.Label>
              <Form.Select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="py-2.5 border-light-subtle shadow-none rounded-3"
              >
                <option value="Đồ uống">Đồ uống</option>
                <option value="Dụng cụ">Dụng cụ thể thao</option>
                <option value="Phụ kiện">Phụ kiện / Khác</option>
                <option value="Trang phục">Trang phục / Giày</option>
                <option value="Khác">Khác</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Mô tả chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Mô tả sản phẩm, kích cỡ vợt, loại nước uống..."
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                className="border-light-subtle shadow-none rounded-3"
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label className="small fw-bold text-muted">Loại sản phẩm</Form.Label>
                <Form.Select
                  value={productForm.type}
                  onChange={(e) => setProductForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="py-2.5 border-light-subtle shadow-none rounded-3"
                >
                  <option value="sell">🛍️ Bán đứt</option>
                  <option value="rent">🔑 Cho thuê</option>
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label className="small fw-bold text-muted">Số lượng tồn kho</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  required
                  className="py-2.5 border-light-subtle shadow-none rounded-3"
                />
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Label className="small fw-bold text-muted">Giá tiêu chuẩn (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  className="py-2.5 border-light-subtle shadow-none rounded-3"
                />
              </Col>
              <Col xs={6}>
                {productForm.type === 'rent' ? (
                  <>
                    <Form.Label className="small fw-bold text-muted">Giá thuê kèm sân (VNĐ)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Để trống nếu bằng giá chuẩn"
                      value={productForm.priceWithCourt}
                      onChange={(e) => setProductForm(prev => ({ ...prev, priceWithCourt: e.target.value }))}
                      className="py-2.5 border-light-subtle shadow-none rounded-3"
                    />
                  </>
                ) : (
                  <>
                    <Form.Label className="small fw-bold text-muted">Link ảnh (tùy chọn)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://..."
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      className="py-2.5 border-light-subtle shadow-none rounded-3"
                    />
                  </>
                )}
              </Col>
            </Row>

            {productForm.type === 'rent' && (
              <Row className="g-3 mb-3">
                <Col xs={6}>
                  <Form.Label className="small fw-bold text-muted">Hình thức tính phí thuê</Form.Label>
                  <Form.Select
                    value={productForm.chargeType}
                    onChange={(e) => setProductForm(prev => ({ ...prev, chargeType: e.target.value as any }))}
                    className="py-2.5 border-light-subtle shadow-none rounded-3"
                  >
                    <option value="per_booking">Lượt đặt (Fixed/Booking)</option>
                    <option value="per_hour">Tính theo giờ (Hourly)</option>
                  </Form.Select>
                </Col>
                <Col xs={6}>
                  <Form.Label className="small fw-bold text-muted">Link ảnh (tùy chọn)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="https://..."
                    value={productForm.image}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    className="py-2.5 border-light-subtle shadow-none rounded-3"
                  />
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowProductModal(false)} className="rounded-pill px-4 py-2 border">Hủy</Button>
            <Button
              type="submit"
              disabled={submittingProduct}
              className="rounded-pill px-4 py-2 border-0 text-white fw-bold"
              style={{ background: '#ea580c' }}
            >
              {submittingProduct ? <Spinner size="sm" /> : 'Lưu sản phẩm'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ShopPage;
