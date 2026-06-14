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
  status: 'confirmed' | 'pending_payment' | 'pending_confirm' | 'cancelled';
  notes: string;
  top: number;
  height: number;
  column: number;
}

interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export const BookingDetail: React.FC<BookingDetailProps> = ({ booking, onClose, onComplete, onCancel }) => {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async () => {
    if (!window.confirm('Xác nhận phê duyệt đặt sân này?')) return;
    
    setConfirming(true);
    try {
      await bookingService.confirmBooking(booking.id);
      onComplete(booking.id);
      alert('✅ Đã phê duyệt đặt sân thành công!');
    } catch (error: any) {
      alert('❌ Lỗi phê duyệt: ' + (error.response?.data?.message || error.message));
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đặt sân này?')) return;
    
    setCancelling(true);
    try {
      await bookingService.cancelBooking(booking.id);
      onCancel(booking.id);
      alert('✅ Đã hủy đặt sân thành công!');
      onClose();
    } catch (error: any) {
      alert('❌ Lỗi hủy booking: ' + (error.response?.data?.message || error.message));
    } finally {
      setCancelling(false);
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
            src={`https://i.pravatar.cc/150?img=${booking.avatar}`}
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
      <div className="p-4 border-top d-flex flex-column gap-2">
        {booking.status !== 'confirmed' && (
          <Button
            variant="success"
            className="w-100 rounded-pill fw-bold border-0 shadow-sm"
            style={{ background: '#10b981', color: W }}
            onClick={handleConfirm}
            disabled={confirming || cancelling}
          >
            {confirming ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              'Phê duyệt & Hoàn thành'
            )}
          </Button>
        )}
        <Button
          variant="outline-success"
          className="w-100 rounded-pill fw-bold border-success border-opacity-20 text-success d-flex align-items-center justify-content-center gap-2"
          onClick={() => alert(`📞 Đang kết nối cuộc gọi đến số: ${booking.phone}`)}
          disabled={confirming || cancelling}
        >
          <span className="material-symbols-outlined fs-5">call</span>
          Liên hệ khách
        </Button>
        <Button
          variant="link"
          className="w-100 text-danger fw-bold border-0 shadow-none mt-1"
          style={{ fontSize: '13px' }}
          onClick={handleCancel}
          disabled={confirming || cancelling}
        >
          {cancelling ? 'Đang hủy...' : 'Hủy đặt sân'}
        </Button>
      </div>
    </div>
  );
};
