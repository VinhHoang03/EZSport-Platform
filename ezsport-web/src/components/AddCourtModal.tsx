import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, InputGroup, Spinner, ListGroup } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/api';

// Map updater component to fly to new coordinates
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16);
  }, [center, map]);
  return null;
};

// Map click handler to set coordinates
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface AddCourtModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AddCourtModal: React.FC<AddCourtModalProps> = ({ show, onHide, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1626224580194-49c84910e591?q=80&w=2070&auto=format&fit=crop',
    location: '',
    price: '300.000',
    lat: 16.0544,
    lng: 108.2022,
    emoji: '🎾',
    sportType: 'Pickleball'
  });

  // Fetch suggestions from Photon
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length > 2) {
        try {
          const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(formData.location)}&lat=16.0544&lon=108.2022&limit=5`);
          const data = await response.json();
          setSuggestions(data.features || []);
        } catch (err) {
          console.error("Autocomplete error:", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'lat' || name === 'lng') ? parseFloat(value) : value
    }));
  };

  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const { name, street, city, country } = feature.properties;
    const fullAddress = [name, street, city, country].filter(Boolean).join(', ');
    
    setFormData(prev => ({
      ...prev,
      location: fullAddress,
      lat,
      lng,
      name: prev.name || name || ''
    }));
    setSuggestions([]);
  };

  const handleManualSearch = async () => {
    if (!formData.location) return;
    setGeocoding(true);
    setError(null);
    setSuggestions([]);
    
    // Using ESRI World Geocoding Service (Free and very accurate for Vietnam)
    const esriUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(formData.location + ", Da Nang, Vietnam")}&outFields=Match_addr,Addr_type&maxLocations=1`;

    try {
      const response = await fetch(esriUrl);
      const data = await response.json();

      if (data && data.candidates && data.candidates.length > 0) {
        const result = data.candidates[0];
        setFormData(prev => ({
          ...prev,
          lat: result.location.y,
          lng: result.location.x,
          // Update location to the full matched address if it's much better
          // location: result.address 
        }));
      } else {
        setError("Không tìm thấy địa chỉ chính xác. Bạn có thể chọn vị trí bằng cách click trực tiếp lên bản đồ bên phải.");
      }
    } catch (err) {
      setError("Lỗi kết nối khi tìm kiếm.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/courts', formData);
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add court');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Thêm sân mới</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <div className="row">
          <div className="col-md-6 border-end">
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">Tên sân</Form.Label>
                <Form.Control 
                  name="name" 
                  placeholder="Ví dụ: Aura Sports Complex"
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="bg-light border-0 py-2 shadow-none"
                />
              </Form.Group>

              <Form.Group className="mb-3 position-relative">
                <Form.Label className="small fw-bold text-muted">Địa chỉ / Địa điểm</Form.Label>
                <InputGroup>
                  <Form.Control 
                    name="location" 
                    placeholder="Nhập địa chỉ hoặc tên địa điểm"
                    value={formData.location} 
                    onChange={handleChange} 
                    required 
                    autoComplete="off"
                    className="bg-light border-0 py-2 shadow-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleManualSearch())}
                  />
                  <Button variant="success" onClick={handleManualSearch} disabled={geocoding}>
                    {geocoding ? <Spinner animation="border" size="sm" /> : <span className="material-symbols-outlined fs-5">search</span>}
                  </Button>
                </InputGroup>

                {suggestions.length > 0 && (
                  <ListGroup className="position-absolute w-100 shadow-lg border-0 mt-1 z-3" style={{ zIndex: 2000 }}>
                    {suggestions.map((s, i) => (
                      <ListGroup.Item key={i} action onClick={() => handleSelectSuggestion(s)} className="border-0 py-2 small">
                        <div className="fw-bold text-dark">{s.properties.name}</div>
                        <div className="text-muted extra-small">
                          {[s.properties.street, s.properties.city].filter(Boolean).join(', ')}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Form.Group>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Loại sân</Form.Label>
                    <Form.Select name="sportType" value={formData.sportType} onChange={handleChange} className="bg-light border-0 py-2 shadow-none">
                      <option value="Pickleball">Pickleball</option>
                      <option value="Football">Bóng đá</option>
                      <option value="Badminton">Cầu lông</option>
                      <option value="Tennis">Tennis</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Giá thuê</Form.Label>
                    <Form.Control name="price" value={formData.price} onChange={handleChange} className="bg-light border-0 py-2 shadow-none" />
                  </Form.Group>
                </div>
              </div>

              <div className="p-3 bg-success bg-opacity-10 rounded-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-success">TỌA ĐỘ CHÍNH XÁC</span>
                  <span className="material-symbols-outlined text-success fs-5">location_on</span>
                </div>
                <div className="row g-2">
                  <div className="col-6 text-center">
                    <small className="text-muted d-block" style={{ fontSize: '10px' }}>LATITUDE</small>
                    <code className="text-dark fw-bold">{formData.lat.toFixed(6)}</code>
                  </div>
                  <div className="col-6 text-center">
                    <small className="text-muted d-block" style={{ fontSize: '10px' }}>LONGITUDE</small>
                    <code className="text-dark fw-bold">{formData.lng.toFixed(6)}</code>
                  </div>
                </div>
              </div>

              <Button variant="success" type="submit" className="w-100 fw-bold py-2 shadow-sm border-0 rounded-3" disabled={loading}>
                {loading ? 'Đang thêm sân...' : 'Xác nhận thêm sân'}
              </Button>
            </Form>
          </div>

          <div className="col-md-6 p-0 position-relative" style={{ minHeight: '400px' }}>
            <MapContainer center={[formData.lat, formData.lng]} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
              <Marker position={[formData.lat, formData.lng]} />
              <MapUpdater center={[formData.lat, formData.lng]} />
              <MapClickHandler onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} />
            </MapContainer>
            <div className="position-absolute top-0 end-0 m-3 p-2 bg-white shadow-sm rounded-3 small z-3" style={{ maxWidth: '200px', pointerEvents: 'none' }}>
              💡 <b>Mẹo:</b> Bạn có thể click trực tiếp lên bản đồ để chọn vị trí chính xác nhất.
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddCourtModal;
