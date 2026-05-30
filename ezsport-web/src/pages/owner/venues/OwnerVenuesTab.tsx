import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { venueService, type Venue, type Amenity } from '../../../services/venue.service';
import { W, TX, TX2 } from '../../../utils/theme';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapEventsHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const SPORT_OPTIONS = [
  { value: 'badminton', label: 'Cầu lông', emoji: '🏸' },
  { value: 'pickleball', label: 'Pickleball', emoji: '🏓' },
  { value: 'soccer', label: 'Bóng đá', emoji: '⚽' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'basketball', label: 'Bóng rổ', emoji: '🏀' },
];

const SPORT_EMOJI: Record<string, string> = {
  badminton: '🏸', pickleball: '🏓', soccer: '⚽', tennis: '🎾', basketball: '🏀',
};

const DEFAULT_AMENITIES: Amenity[] = [
  { key: 'parking', label: 'Bãi đỗ xe', icon: 'local_parking', available: false },
  { key: 'shower', label: 'Tủ đồ & Phòng tắm', icon: 'shower', available: false },
  { key: 'wifi', label: 'Wi-Fi miễn phí', icon: 'wifi', available: false },
  { key: 'lights', label: 'Hệ thống đèn', icon: 'emoji_objects', available: false },
  { key: 'water', label: 'Nước uống', icon: 'water_drop', available: false },
  { key: 'racket', label: 'Cho thuê vợt', icon: 'sports_tennis', available: false },
  { key: 'canteen', label: 'Căng tin', icon: 'local_cafe', available: false },
  { key: 'shop', label: 'Cửa hàng đồ tập', icon: 'shopping_bag', available: false },
];

const emptyForm = () => ({
  name: '',
  description: '',
  location: '',
  price: '',
  lat: '',
  lng: '',
  sportTypes: ['badminton'] as string[],
  openTime: '06:00',
  closeTime: '22:00',
  phone: '',
  email: '',
  isActive: true,
  amenities: DEFAULT_AMENITIES.map(a => ({ ...a })),
  imageFile: null as File | null,
});

type FormState = ReturnType<typeof emptyForm>;

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX,
  background: '#fff',
};

const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <div
    onClick={onChange}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: on ? '#10b981' : '#cbd5e1',
      position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'all 0.2s',
    }} />
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
    {children}
  </label>
);

const Section: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
    <Card.Body className="p-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>{icon}</span>
        <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>{title}</h5>
      </div>
      {children}
    </Card.Body>
  </Card>
);

interface OwnerVenuesTabProps {
  onOpenCreateCourt?: (venue: Venue) => void;
}

export const OwnerVenuesTab: React.FC<OwnerVenuesTabProps> = ({ onOpenCreateCourt }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editTarget, setEditTarget] = useState<Venue | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Helper to extract house number prefix from query (e.g. "81C", "k12/4", "150")
  const getHouseNumberPrefix = (q: string): string => {
    const match = q.match(/^((?:hẻm|kiệt|ngõ|k)?\s*\d+[a-z]?(?:\/\d+)*\s*)/i);
    return match ? match[1] : '';
  };

  // Fetch suggestions from Nominatim (OpenStreetMap)
  const fetchSuggestions = async (query: string) => {
    const prefix = getHouseNumberPrefix(query);
    const cleanQuery = prefix ? query.substring(prefix.length).trim() : query;

    if (cleanQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&addressdetails=1&limit=5&countrycodes=vn`;
      const response = await fetch(searchUrl, { headers: { 'Accept-Language': 'vi' } });
      
      if (response.ok) {
        const rawData = await response.json();
        const formattedData = rawData.map((item: any) => ({
          ...item,
          _originalPrefix: prefix ? prefix.trim() : undefined
        }));
        setSuggestions(formattedData);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching Nominatim suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleLocationChange = (val: string) => {
    setForm(f => ({ ...f, location: val }));
    setShowSuggestions(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const selectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon); // Nominatim uses 'lon'

    let finalAddress = item.display_name;
    if (item._originalPrefix) {
      finalAddress = `${item._originalPrefix}, ${item.display_name}`;
    }

    setForm(f => ({
      ...f,
      location: finalAddress,
      lat: String(lat.toFixed(6)),
      lng: String(lng.toFixed(6)),
    }));
    
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsContainerRef.current && 
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setForm(f => ({ ...f, lat: String(lat.toFixed(6)), lng: String(lng.toFixed(6)) }));
  };


  const fetchVenues = () => {
    setLoading(true);
    venueService.getVenues({ active: 'all' }).then(setVenues).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVenues(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setView('form');
  };

  const openEdit = (c: Venue) => {
    setEditTarget(c);
    setForm({
      name: c.name,
      description: c.description || '',
      location: c.location,
      price: c.price,
      lat: String(c.lat),
      lng: String(c.lng),
      sportTypes: c.sportTypes?.length ? c.sportTypes : ['badminton'],
      openTime: c.openTime || '06:00',
      closeTime: c.closeTime || '22:00',
      phone: c.phone || '',
      email: c.email || '',
      isActive: c.isActive,
      amenities: DEFAULT_AMENITIES.map(def => {
        const existing = c.amenities?.find(a => a.key === def.key);
        return existing ? { ...existing } : { ...def };
      }),
      imageFile: null,
    });
    setView('form');
  };

  const handleSave = async () => {
    if (!form.name || !form.location || !form.price) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('location', form.location);
      fd.append('price', form.price);
      fd.append('lat', form.lat);
      fd.append('lng', form.lng);
      fd.append('sportTypes', JSON.stringify(form.sportTypes));
      fd.append('openTime', form.openTime);
      fd.append('closeTime', form.closeTime);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('isActive', String(form.isActive));
      fd.append('amenities', JSON.stringify(form.amenities));
      if (form.imageFile) fd.append('image', form.imageFile);

      if (editTarget) {
        await venueService.updateVenue(editTarget._id, fd);
      } else {
        await venueService.createVenue(fd);
      }
      setView('list');
      fetchVenues();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi lưu địa điểm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Venue) => {
    if (!window.confirm(`Xoá địa điểm "${c.name}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      await venueService.deleteVenue(c._id);
      fetchVenues();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi xoá địa điểm');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSport = (val: string) => {
    setForm(f => ({
      ...f,
      sportTypes: f.sportTypes.includes(val)
        ? f.sportTypes.filter(s => s !== val)
        : [...f.sportTypes, val],
    }));
  };

  const toggleAmenity = (key: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.map(a => a.key === key ? { ...a, available: !a.available } : a),
    }));
  };

  // ── FORM VIEW ──
  if (view === 'form') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            onClick={() => setView('list')}
            style={{ border: 'none', background: 'transparent', color: '#0f3d22', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            Quay lại danh sách
          </button>
          <h5 style={{ fontWeight: 800, color: TX, margin: 0 }}>
            {editTarget ? `Chỉnh sửa: ${editTarget.name}` : 'Thêm địa điểm'}
          </h5>
        </div>

        <Section icon="image" title="Ảnh & Media">
          <div
            style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#0f3d22'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            onClick={() => document.getElementById('venue-image-input')?.click()}
          >
            <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '40px' }}>cloud_upload</span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>
              {form.imageFile ? form.imageFile.name : 'Kéo thả ảnh hoặc nhấp vào đây để tải lên'}
            </div>
            <div style={{ fontSize: '12px', color: TX2, marginTop: '4px' }}>JPG, PNG, WEBP · Tối đa 5MB</div>
          </div>
          <input
            id="venue-image-input" type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] || null }))}
          />
          {editTarget?.image && !form.imageFile && (
            <div className="d-flex gap-3 flex-wrap">
              <div style={{ width: '100px', height: '75px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={editTarget.image} alt="current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}
        </Section>

        <Section icon="info" title="Thông tin cơ bản">
          <div className="d-flex flex-column gap-4">
            <div>
              <Label>Tên địa điểm *</Label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Sân Cầu Lông Kỳ Đồng" />
            </div>
            <div>
              <Label>Môn thể thao *</Label>
              <div className="d-flex gap-2 flex-wrap">
                {SPORT_OPTIONS.map(opt => {
                  const active = form.sportTypes.includes(opt.value);
                  return (
                    <span
                      key={opt.value}
                      onClick={() => toggleSport(opt.value)}
                      style={{
                        background: active ? '#dcfce7' : '#f1f5f9',
                        color: active ? '#15803d' : TX2,
                        border: active ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
                        padding: '8px 16px', borderRadius: '20px', fontWeight: 700,
                        fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.emoji} {opt.label}
                      {active && <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Mô tả</Label>
              <textarea
                style={{ ...inp, minHeight: '100px', lineHeight: '1.5', resize: 'vertical' }}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả về sân, tiện ích, không gian..."
              />
            </div>
            <div className="position-relative" ref={suggestionsContainerRef}>
              <Label>Địa chỉ *</Label>
              <input 
                style={inp} 
                value={form.location} 
                onChange={e => handleLocationChange(e.target.value)} 
                onFocus={() => form.location.length >= 3 && setShowSuggestions(true)}
                placeholder="VD: 81C Lê Văn Hiến, Đà Nẵng..." 
              />
              {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                <div 
                  className="position-absolute w-100 bg-white shadow-lg rounded-3 mt-1" 
                  style={{ 
                    zIndex: 9999, 
                    maxHeight: '280px', 
                    overflowY: 'auto',
                    border: '1px solid #cbd5e1',
                    top: '100%',
                  }}
                >
                  {loadingSuggestions ? (
                    <div className="p-3 text-muted text-center d-flex align-items-center justify-content-center gap-2">
                      <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                      <span style={{ fontSize: '13px' }}>Đang tìm kiếm vị trí...</span>
                    </div>
                  ) : (
                    <>
                      {suggestions[0]?._originalPrefix && (
                        <div style={{ 
                          padding: '6px 12px', 
                          background: '#f0fdf4', 
                          borderBottom: '1px solid #dcfce7',
                          fontSize: '11px',
                          color: '#15803d',
                          fontWeight: 600,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
                          Số nhà "<strong>{suggestions[0]._originalPrefix}</strong>" sẽ được thêm tự động khi bạn chọn địa chỉ
                        </div>
                      )}
                      {suggestions.map((item, idx) => (
                        <div
                          key={idx}
                          style={{ 
                            padding: '10px 14px',
                            fontSize: '13px', 
                            borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                            transition: 'background-color 0.15s',
                            cursor: 'pointer',
                            backgroundColor: '#fff'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                          onClick={() => selectSuggestion(item)}
                        >
                          <div className="d-flex align-items-start gap-2">
                            <span className="material-symbols-outlined text-success" style={{ fontSize: '18px', marginTop: '1px', flexShrink: 0 }}>location_on</span>
                            <div style={{ textAlign: 'left', minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item._originalPrefix ? `${item._originalPrefix}, ` : ''}{item.display_name.split(',')[0]}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.display_name.split(',').slice(1).join(',').trim()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Label>Vĩ độ (lat)</Label>
                <input style={inp} value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="16.0544" />
              </Col>
              <Col md={6}>
                <Label>Kinh độ (lng)</Label>
                <input style={inp} value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="108.2022" />
              </Col>
            </Row>
            <div>
              <div style={{ fontSize: '12px', color: TX2, marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined text-success" style={{ fontSize: '16px' }}>info</span>
                Nhấp chuột lên bản đồ hoặc chọn địa chỉ gợi ý từ ô Tìm kiếm để lấy tọa độ tự động (Được hỗ trợ bởi OpenStreetMap)
              </div>
              <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <MapContainer
                  center={[parseFloat(form.lat) || 16.0544, parseFloat(form.lng) || 108.2022]}
                  zoom={15}
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['0', '1', '2', '3']}
                    attribution='&copy; Google Maps'
                  />
                  {parseFloat(form.lat) && parseFloat(form.lng) && (
                    <Marker position={[parseFloat(form.lat), parseFloat(form.lng)]} icon={DefaultIcon} />
                  )}
                  <ChangeView center={[parseFloat(form.lat) || 16.0544, parseFloat(form.lng) || 108.2022]} />
                  <MapEventsHandler onMapClick={handleMapClick} />
                </MapContainer>
              </div>
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Label>Số điện thoại</Label>
                <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901 234 567" />
              </Col>
              <Col md={6}>
                <Label>Email liên hệ</Label>
                <input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@ezsport.vn" />
              </Col>
            </Row>
          </div>
        </Section>

        <Section icon="widgets" title="Tiện ích & Dịch vụ">
          <Row className="g-3">
            {form.amenities.map(item => (
              <Col md={3} sm={6} key={item.key}>
                <div
                  onClick={() => toggleAmenity(item.key)}
                  style={{
                    padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    background: item.available ? '#f0fdf4' : W,
                    transition: 'all 0.2s', cursor: 'pointer',
                    borderColor: item.available ? '#86efac' : '#e2e8f0',
                  }}
                >
                  <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: TX, textAlign: 'center' }}>{item.label}</span>
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: item.available ? '#10b981' : '#cbd5e1', position: 'relative', transition: 'all 0.2s' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: item.available ? '21px' : '3px', transition: 'all 0.2s' }} />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Section>

        <Section icon="payments" title="Giá & Giờ hoạt động">
          <div className="d-flex flex-column gap-4">
            <div>
              <Label>Giá hiển thị *</Label>
              <input style={inp} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="VD: 150.000 - 200.000 VNĐ / Giờ" />
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Label>Giờ mở cửa</Label>
                <input style={inp} type="time" value={form.openTime} onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))} />
              </Col>
              <Col md={6}>
                <Label>Giờ đóng cửa</Label>
                <input style={inp} type="time" value={form.closeTime} onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))} />
              </Col>
            </Row>
            <div
              className="d-flex justify-content-between align-items-center p-3"
              style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>Trạng thái sân</div>
                <div style={{ fontSize: '12px', color: TX2, marginTop: '2px' }}>
                  {form.isActive ? 'Sân đang mở và nhận đặt lịch' : 'Sân tạm đóng, không nhận đặt lịch'}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 700, color: form.isActive ? '#15803d' : TX2 }}>
                  {form.isActive ? 'Hoạt động' : 'Tạm đóng'}
                </span>
                <Toggle on={form.isActive} onChange={() => setForm(f => ({ ...f, isActive: !f.isActive }))} />
              </div>
            </div>
          </div>
        </Section>

        <div className="d-flex justify-content-end gap-3">
          <button
            onClick={() => setView('list')}
            style={{ border: '1px solid #e2e8f0', background: W, borderRadius: '8px', padding: '12px 24px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: TX2 }}
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.location || !form.price}
            style={{
              background: saving || !form.name ? '#94a3b8' : '#0f3d22',
              color: W, border: 'none', borderRadius: '8px', padding: '12px 32px',
              fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(15,61,34,0.15)',
            }}
          >
            {saving && <Spinner size="sm" />}
            {editTarget ? 'Lưu thay đổi' : 'Tạo địa điểm'}
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 style={{ fontWeight: 800, color: TX, margin: 0 }}>Quản lý địa điểm ({venues.length})</h5>
          <span style={{ fontSize: '13px', color: TX2 }}>Thêm, sửa, xoá và quản lý trạng thái các sân</span>
        </div>
        <button
          onClick={openCreate}
          style={{ background: '#0f3d22', color: W, border: 'none', borderRadius: '20px', padding: '10px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner variant="success" /></div>
      ) : venues.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '48px', color: '#d1d5db' }}>sports_tennis</span>
          Chưa có địa điểm nào. Nhấn "Thêm địa điểm" để bắt đầu.
        </div>
      ) : (
        <Row className="g-4">
          {venues.map(venue => (
            <Col md={6} lg={4} key={venue._id}>
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden', height: '100%' }}>
                <div style={{ position: 'relative', height: '160px' }}>
                  <img
                    src={venue.image}
                    alt={venue.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/images/pickleball.png'; }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span style={{
                      background: venue.isActive ? '#dcfce7' : '#fee2e2',
                      color: venue.isActive ? '#15803d' : '#dc2626',
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                    }}>
                      {venue.isActive ? '● Hoạt động' : '● Tạm đóng'}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px' }}>
                    {venue.sportTypes?.map(s => SPORT_EMOJI[s] || '🏟️').join(' ')}
                  </div>
                </div>
                <Card.Body className="p-3 d-flex flex-column">
                  <h6 style={{ fontWeight: 800, fontSize: '15px', color: TX, marginBottom: '4px' }}>{venue.name}</h6>
                  <p style={{ fontSize: '12px', color: TX2, marginBottom: '8px', flex: 1 }}>
                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '13px' }}>location_on</span>
                    {venue.location}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 700 }}>{venue.price}</span>
                    <span style={{ fontSize: '12px', color: TX2 }}>⭐ {venue.rating}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => openEdit(venue)}
                      style={{ flex: 1, border: '1px solid #0f3d22', background: '#f0fdf4', borderRadius: '8px', padding: '7px', fontSize: '12px', fontWeight: 700, color: '#0f3d22', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(venue)}
                      disabled={deleting}
                      style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
