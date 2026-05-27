import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { type Venue } from '../../../services/venue.service';
import { W, TX, TX2 } from '../../../utils/theme';

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

interface CreateCourtModalProps {
  show: boolean;
  submitting: boolean;
  venue: Venue | null;
  onClose: () => void;
  onCreateCourt: (payloads: (FormData | any)[]) => Promise<void>;
  showPrice?: boolean; // Hiển thị phần giá tiền (mặc định: true)
}

export const CreateCourtModal: React.FC<CreateCourtModalProps> = ({ 
  show, 
  submitting, 
  venue, 
  onClose, 
  onCreateCourt,
  showPrice = true // Mặc định hiển thị giá
}) => {
  const [names, setNames] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [sportTypes, setSportTypes] = useState<string[]>(['badminton']);
  const [courtType, setCourtType] = useState<'indoor' | 'outdoor'>('indoor');
  const [pricePerHour, setPricePerHour] = useState('120000');
  const [status, setStatus] = useState<'available' | 'maintenance' | 'inactive'>('available');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (show) {
      setNames(['']);
      setDescription('');
      setSportTypes(['badminton']);
      setCourtType('indoor');
      setPricePerHour('120000');
      setStatus('available');
      setIsActive(true);
      setImageFile(null);
    }
  }, [show]);

  const toggleSport = (value: string) => {
    setSportTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    const validNames = names.filter(n => n.trim() !== '');
    if (!venue || validNames.length === 0) return;

    const payloads: (FormData | any)[] = [];
    for (const nameVal of validNames) {
      // If there's an image file, use FormData. Otherwise use plain object
      if (imageFile) {
        const payload = new FormData();
        payload.append('venue', venue._id);
        payload.append('name', nameVal.trim());
        payload.append('description', description);
        payload.append('sportTypes', JSON.stringify(sportTypes));
        payload.append('courtType', courtType);
        payload.append('emoji', SPORT_EMOJI[sportTypes[0]] || '🏟️');
        payload.append('pricePerHour', pricePerHour);
        payload.append('status', status);
        payload.append('isActive', String(isActive));
        payload.append('images', imageFile);
        payloads.push(payload);
      } else {
        // Send as JSON when no image
        const payload = {
          venue: venue._id,
          name: nameVal.trim(),
          description,
          sportTypes,
          courtType,
          emoji: SPORT_EMOJI[sportTypes[0]] || '🏟️',
          pricePerHour,
          status,
          isActive
        };
        payloads.push(payload);
      }
    }

    await onCreateCourt(payloads);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tạo sân mới cho địa điểm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: TX, marginBottom: '8px' }}>Địa điểm</div>
            <div style={{ fontSize: '14px', color: TX2 }}>{venue?.name || 'Chưa chọn địa điểm'}</div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Tên sân *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {names.map((n, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX, background: W }}
                    value={n}
                    onChange={e => {
                      const newNames = [...names];
                      newNames[idx] = e.target.value;
                      setNames(newNames);
                    }}
                    placeholder={`VD: Sân A${idx + 1}`}
                  />
                  {names.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setNames(names.filter((_, i) => i !== idx))}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid #fee2e2',
                        background: '#fff5f5',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNames([...names, ''])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: 'fit-content',
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f766e',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Thêm tên sân
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Loại sân</label>
            <select
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX, background: W }}
              value={courtType}
              onChange={e => setCourtType(e.target.value as 'indoor' | 'outdoor')}
            >
              <option value="indoor">Trong nhà</option>
              <option value="outdoor">Ngoài trời</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Môn thể thao</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SPORT_OPTIONS.map(opt => {
                const active = sportTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleSport(opt.value)}
                    style={{
                      border: active ? '1.5px solid #0f766e' : '1.5px solid #cbd5e1',
                      background: active ? '#d1fae5' : '#f8fafc',
                      color: active ? '#115e59' : TX2,
                      borderRadius: '20px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {showPrice && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Giá / giờ (VNĐ)</label>
              <input
                type="number"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX, background: W }}
                value={pricePerHour}
                onChange={e => setPricePerHour(e.target.value)}
                placeholder="120000"
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Mô tả</label>
            <textarea
              style={{ width: '100%', minHeight: '100px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX, background: W }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn cho sân"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Trạng thái</label>
              <select
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX, background: W }}
                value={status}
                onChange={e => setStatus(e.target.value as 'available' | 'maintenance' | 'inactive')}
              >
                <option value="available">Hoạt động</option>
                <option value="maintenance">Bảo trì</option>
                <option value="inactive">Tạm đóng</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Kích hoạt</label>
              <button
                type="button"
                onClick={() => setIsActive(prev => !prev)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isActive ? '#dcfce7' : '#f8fafc', color: isActive ? '#0f3d22' : TX2, fontWeight: 700, cursor: 'pointer' }}
              >
                {isActive ? 'Đang bật' : 'Đã tắt'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>Ảnh bìa</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Huỷ
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!venue || names.filter(n => n.trim() !== '').length === 0 || submitting}
        >
          {submitting ? <Spinner animation="border" size="sm" /> : 'Tạo sân'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
