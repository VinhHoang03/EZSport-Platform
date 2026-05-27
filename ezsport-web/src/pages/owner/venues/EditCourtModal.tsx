import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { type Court } from '../../../services/venue.service';
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

interface EditCourtModalProps {
  show: boolean;
  submitting: boolean;
  court: Court | null;
  onClose: () => void;
  onUpdateCourt: (courtId: string, data: any) => Promise<void>;
}

export const EditCourtModal: React.FC<EditCourtModalProps> = ({ 
  show, 
  submitting, 
  court, 
  onClose, 
  onUpdateCourt 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sportTypes, setSportTypes] = useState<string[]>(['badminton']);
  const [courtType, setCourtType] = useState<'indoor' | 'outdoor'>('indoor');

  const [status, setStatus] = useState<'available' | 'maintenance' | 'inactive'>('available');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (show && court) {
      setName(court.name);
      setDescription((court as any).description || '');
      setSportTypes(court.sportTypes || ['badminton']);
      setCourtType((court as any).courtType || 'indoor');

      setStatus((court as any).status || 'available');
      setIsActive((court as any).isActive !== false);
    }
  }, [show, court]);

  const toggleSport = (value: string) => {
    setSportTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!court || !name.trim()) return;

    const data = {
      name: name.trim(),
      description,
      sportTypes,
      courtType,
      emoji: SPORT_EMOJI[sportTypes[0]] || '🏟️',
      status,
      isActive,
    };

    await onUpdateCourt(court._id, data);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa sân</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
              Tên sân *
            </label>
            <input
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                outline: 'none', 
                fontSize: '14px', 
                color: TX, 
                background: W 
              }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Sân A1"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
              Loại sân
            </label>
            <select
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                outline: 'none', 
                fontSize: '14px', 
                color: TX, 
                background: W 
              }}
              value={courtType}
              onChange={e => setCourtType(e.target.value as 'indoor' | 'outdoor')}
            >
              <option value="indoor">Trong nhà</option>
              <option value="outdoor">Ngoài trời</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
              Môn thể thao
            </label>
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



          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
              Mô tả
            </label>
            <textarea
              style={{ 
                width: '100%', 
                minHeight: '100px', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                outline: 'none', 
                fontSize: '14px', 
                color: TX, 
                background: W 
              }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn cho sân"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
                Trạng thái
              </label>
              <select
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  outline: 'none', 
                  fontSize: '14px', 
                  color: TX, 
                  background: W 
                }}
                value={status}
                onChange={e => setStatus(e.target.value as 'available' | 'maintenance' | 'inactive')}
              >
                <option value="available">✅ Hoạt động</option>
                <option value="maintenance">🔧 Bảo trì</option>
                <option value="inactive">🔒 Tạm đóng</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: TX, display: 'block', marginBottom: '6px' }}>
                Kích hoạt
              </label>
              <button
                type="button"
                onClick={() => setIsActive(prev => !prev)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  background: isActive ? '#dcfce7' : '#f8fafc', 
                  color: isActive ? '#0f3d22' : TX2, 
                  fontWeight: 700, 
                  cursor: 'pointer' 
                }}
              >
                {isActive ? '✅ Đang bật' : '❌ Đã tắt'}
              </button>
            </div>
          </div>

          {/* Status explanation */}
          <div style={{ 
            background: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '8px', 
            padding: '12px',
            fontSize: '12px',
            color: '#0c4a6e',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>💡 Giải thích trạng thái:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• <strong>Hoạt động:</strong> Sân mở cửa bình thường, khách có thể đặt</div>
              <div>• <strong>Bảo trì:</strong> Sân đang sửa chữa, tạm ngưng nhận đặt</div>
              <div>• <strong>Tạm đóng:</strong> Sân đóng cửa, không nhận đặt</div>
            </div>
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
          disabled={!name.trim() || submitting}
        >
          {submitting ? <Spinner animation="border" size="sm" /> : 'Cập nhật'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
