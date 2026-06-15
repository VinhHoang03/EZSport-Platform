import React, { useState } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { G, W, TX, TX2 } from '../../../utils/theme';
import { bookingService } from '../../../services/booking.service';

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  court: string;
  date: string;
  timeSlot: string;
  duration: string;
  paymentMethod: string;
  amount: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  top: number;
  height: number;
  column: number;
}

interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
  onStatusUpdate: (id: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED') => void;
}

export const BookingDetail: React.FC<BookingDetailProps> = ({ booking, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#10b981';
      case 'CHECKED_IN': return '#8b5cf6';
      case 'COMPLETED': return '#6b7280';
      case 'CANCELLED': return '#ef4444';
      case 'PENDING':
      default:
        return '#f59e0b';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#ecfdf5';
      case 'CHECKED_IN': return '#f3e8ff';
      case 'COMPLETED': return '#f3f4f6';
      case 'CANCELLED': return '#fef2f2';
      case 'PENDING':
      default:
        return '#fffbeb';
    }
  };

  const handleStatusChange = async (newStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED') => {
    if (newStatus === booking.status) return;

    const confirmMsg: Record<string, string> = {
      CONFIRMED: 'Xác nhận phê duyệt và đổi trạng thái đơn đặt sân sang [ĐÃ THANH TOÁN / DUYỆT]?',
      CHECKED_IN: 'Xác nhận khách hàng đã đến nhận sân (CHECK-IN)?',
      COMPLETED: 'Xác nhận kết thúc lượt chơi của khách hàng (HOÀN THÀNH)?',
      CANCELLED: 'Bạn có chắc chắn muốn HỦY đơn đặt sân này? Điểm tích lũy và voucher (nếu có) sẽ tự động hoàn trả.',
    };
    const msg = confirmMsg[newStatus];

    if (msg && !window.confirm(msg)) return;

    setUpdating(true);
    try {
      if (newStatus === 'CONFIRMED') {
        await bookingService.confirmBooking(booking.id);
      } else if (newStatus === 'CHECKED_IN') {
        await bookingService.checkInBooking(booking.id);
      } else if (newStatus === 'COMPLETED') {
        await bookingService.completeBooking(booking.id);
      } else if (newStatus === 'CANCELLED') {
        await bookingService.cancelBookingByOwner(booking.id);
      }
      onStatusUpdate(booking.id, newStatus);
      alert('🎉 Cập nhật trạng thái đơn hàng thành công!');
    } catch (error: any) {
      alert('❌ Lỗi cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };


  return (
    <div
      style={{
        width: '360px', background: W, borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.03)', zIndex: 5, animation: 'slideIn 0.3s ease'
      }}
    >
      {/* Header */}
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ background: '#f8fafc' }}>
        <div>
          <span className="material-symbols-outlined text-success mb-1" style={{ fontSize: '24px' }}>check_circle</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: TX }}>#{booking.id}</div>
          <span style={{ fontSize: '12px', color: TX2 }}>Chi tiết lịch đặt sân</span>
        </div>
        <Button
          variant="light"
          className="rounded-circle border-0 d-flex align-items-center justify-content-center p-2"
          onClick={onClose}
        >
          <span className="material-symbols-outlined fs-5">close</span>
        </Button>
      </div>

      {/* Body */}
      <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-4">
        {/* Customer Card */}
        <div className="p-3 border rounded-4 d-flex align-items-center gap-3" style={{ background: '#f8fafc' }}>
          <img
            src={booking.avatar && (booking.avatar.startsWith('http://') || booking.avatar.startsWith('https://'))
              ? booking.avatar
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.name || 'K')}&background=1a6b3c&color=fff`
            }
            alt="Customer"
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h6 style={{ fontSize: '14px', fontWeight: 800, color: TX, margin: 0 }}>{booking.name}</h6>
            <span style={{ fontSize: '11px', color: TX2 }}>{booking.phone}</span>
            <div style={{ fontSize: '11px', color: TX2 }}>{booking.email}</div>
          </div>
        </div>

        {/* Booking Info */}
        <div>
          <h6 style={{ fontSize: '12px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Thông tin đặt sân</h6>
          <Row className="g-3">
            <Col xs={6}>
              <span style={{ fontSize: '11px', color: TX2 }}>Sân đặt</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{booking.court}</div>
            </Col>
            <Col xs={6}>
              <span style={{ fontSize: '11px', color: TX2 }}>Ngày chơi</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{booking.date}</div>
            </Col>
            <Col xs={6}>
              <span style={{ fontSize: '11px', color: TX2 }}>Thời gian</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{booking.timeSlot}</div>
            </Col>
            <Col xs={6}>
              <span style={{ fontSize: '11px', color: TX2 }}>Thời lượng</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{booking.duration}</div>
            </Col>
            <Col xs={6}>
              <span style={{ fontSize: '11px', color: TX2 }}>Phương thức</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{booking.paymentMethod}</div>
            </Col>
            <Col xs={6}>
              <span style={{ fontSize: '11px', color: TX2 }}>Tổng tiền</span>
              <div style={{ fontSize: '15px', fontWeight: 800, color: G, marginTop: '2px' }}>{booking.amount}</div>
            </Col>
          </Row>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div>
            <h6 style={{ fontSize: '12px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Ghi chú của khách</h6>
            <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '13px', color: '#b45309', fontStyle: 'italic', lineHeight: 1.5 }}>
              {booking.notes}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-top">
        <label className="d-block mb-2 text-uppercase fw-bold text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
          Trạng thái đặt sân
        </label>
        
        <div className="position-relative mb-3">
          <select
            value={booking.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            disabled={updating}
            className="form-select fw-bold px-3 py-2.5 rounded-4 shadow-none border-2"
            style={{
              borderColor: getStatusColor(booking.status),
              color: getStatusColor(booking.status),
              backgroundColor: getStatusBg(booking.status),
              cursor: updating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <option value="PENDING" disabled={booking.status !== 'PENDING'}>⏳ Chờ duyệt (PENDING)</option>
            <option value="CONFIRMED" disabled={['COMPLETED', 'CANCELLED'].includes(booking.status)}>✅ Đã duyệt / TT (CONFIRMED)</option>
            <option value="CHECKED_IN" disabled={['COMPLETED', 'CANCELLED', 'PENDING'].includes(booking.status)}>🔑 Đã Check-in (CHECKED_IN)</option>
            <option value="COMPLETED" disabled={['CANCELLED', 'PENDING', 'CONFIRMED'].includes(booking.status)}>🏆 Hoàn thành (COMPLETED)</option>
            <option value="CANCELLED" disabled={['COMPLETED', 'CANCELLED'].includes(booking.status)}>❌ Đã hủy (CANCELLED)</option>
          </select>
          {updating && (
            <div className="position-absolute end-0 top-0 h-100 d-flex align-items-center pe-5" style={{ pointerEvents: 'none' }}>
              <Spinner size="sm" animation="border" variant="secondary" />
            </div>
          )}
        </div>

        <Button
          variant="outline-success"
          className="w-100 rounded-pill fw-bold border-success border-opacity-20 text-success d-flex align-items-center justify-content-center gap-2 py-2"
          onClick={() => alert(`📞 Đang kết nối cuộc gọi đến số: ${booking.phone}`)}
          disabled={updating}
        >
          <span className="material-symbols-outlined fs-5">call</span>
          Liên hệ khách
        </Button>
      </div>

    </div>
  );
};
