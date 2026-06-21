import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import { type Court } from '../../../services/venue.service';
import { bookingService } from '../../../services/booking.service';
import { TX, TX2 } from '../../../utils/theme';

interface CreateManualBookingModalProps {
  show: boolean;
  onClose: () => void;
  courts: Court[];
  selectedDate: Date;
  onSuccess: () => void;
  prefills?: { courtId?: string; startTime?: string } | null;
}

const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hr = 6 + i;
  return `${hr.toString().padStart(2, '0')}:00`;
});

export const CreateManualBookingModal: React.FC<CreateManualBookingModalProps> = ({
  show,
  onClose,
  courts,
  selectedDate,
  onSuccess,
  prefills = null,
}) => {
  const [courtId, setCourtId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [bookerName, setBookerName] = useState('Khách vãng lai');
  const [bookerPhone, setBookerPhone] = useState('');
  const [sport, setSport] = useState('');
  const [notes, setNotes] = useState('');
  const [priceOverride, setPriceOverride] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date to YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setBookingDate(formatDateString(selectedDate));
      
      const initialCourtId = prefills?.courtId || (courts.filter(c => (c as any).isActive !== false)[0]?._id || '');
      setCourtId(initialCourtId);
      
      const initialStartTime = prefills?.startTime || '08:00';
      setStartTime(initialStartTime);
      
      const [startHourStr] = initialStartTime.split(':');
      const startHour = Number(startHourStr);
      const initialEndTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
      setEndTime(initialEndTime);
      
      setBookerName('Khách vãng lai');
      setBookerPhone('');
      setNotes('');
      setError(null);
      
      const court = courts.find(c => c._id === initialCourtId);
      if (court) {
        if (court.sportTypes?.length > 0) {
          setSport(court.sportTypes[0]);
        } else {
          setSport('');
        }
        setPriceOverride(String(court.pricePerHour || 0));
      } else {
        setSport('');
        setPriceOverride('0');
      }
    }
  }, [show, courts, selectedDate, prefills]);

  // Update sport and price when selected court changes
  const handleCourtChange = (id: string) => {
    setCourtId(id);
    const court = courts.find(c => c._id === id);
    if (court) {
      if (court.sportTypes?.length > 0) {
        setSport(court.sportTypes[0]);
      } else {
        setSport('');
      }
      setPriceOverride(String(court.pricePerHour || 0));
    }
  };

  // Get current selected court object
  const selectedCourt = courts.find(c => c._id === courtId);

  // Calculate standard duration
  const getDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return Math.max(0.5, (endH - startH) + (endM - startM) / 60);
  };

  // Calculate default total price
  const duration = getDuration();
  const basePricePerHour = selectedCourt?.pricePerHour || 0;
  const calculatedTotalPrice = Math.floor(basePricePerHour * duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId) {
      setError('Vui lòng chọn sân');
      return;
    }
    if (!bookerName.trim()) {
      setError('Vui lòng nhập tên khách hàng');
      return;
    }
    if (!bookerPhone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    const durationVal = getDuration();
    if (durationVal <= 0) {
      setError('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const finalPrice = priceOverride ? Number(priceOverride) : calculatedTotalPrice;
      
      const payload = {
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        duration: durationVal,
        sport,
        basePrice: finalPrice,
        serviceFee: 0,
        discount: 0,
        pointsUsed: 0,
        totalPrice: finalPrice,
        paymentMethod: 'cash' as const,
        bookerName: bookerName.trim(),
        bookerPhone: bookerPhone.trim().replace(/\s/g, ''),
        notes: notes.trim(),
        comboType: undefined,
      };

      // 1. Create booking (created as PENDING)
      const booking = await bookingService.createBooking(payload);
      
      // 2. Automatically confirm the booking as we are the owner
      if (booking && booking._id) {
        await bookingService.confirmBooking(booking._id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đặt sân thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCourts = courts.filter(c => (c as any).isActive !== false);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton style={{ background: '#f8fafc' }}>
        <Modal.Title style={{ fontWeight: 800, color: TX }}>Đặt sân hộ khách (Đặt trực tiếp)</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && (
            <div className="alert alert-danger py-2 px-3 border-0 rounded-3 small mb-4">
              {error}
            </div>
          )}

          <Row className="g-3">
            {/* Sân */}
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Chọn Sân *</Form.Label>
                <Form.Select
                  value={courtId}
                  onChange={e => handleCourtChange(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                >
                  <option value="" disabled>-- Chọn sân --</option>
                  {activeCourts.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({(c as any).emoji || '🏟️'}) - {c.sportTypes.join(', ')}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Môn thể thao */}
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Môn thể thao *</Form.Label>
                <Form.Select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                >
                  <option value="" disabled>-- Chọn bộ môn --</option>
                  {selectedCourt?.sportTypes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Ngày đặt */}
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Ngày đặt sân *</Form.Label>
                <Form.Control
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                />
              </Form.Group>
            </Col>

            {/* Giờ bắt đầu */}
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Giờ bắt đầu *</Form.Label>
                <Form.Select
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Giờ kết thúc */}
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Giờ kết thúc *</Form.Label>
                <Form.Select
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Tên khách hàng */}
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Tên khách hàng *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={bookerName}
                  onChange={e => setBookerName(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                />
              </Form.Group>
            </Col>

            {/* Số điện thoại */}
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Số điện thoại *</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="VD: 0987654321"
                  value={bookerPhone}
                  onChange={e => setBookerPhone(e.target.value)}
                  required
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                />
              </Form.Group>
            </Col>


            {/* Giá tiền thanh toán */}
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>
                  Tổng tiền (VNĐ) <span className="text-muted" style={{ fontSize: '11px', fontWeight: 'normal' }}>(Gốc: {calculatedTotalPrice.toLocaleString('vi-VN')}đ)</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Số tiền thực nhận"
                  value={priceOverride}
                  onChange={e => setPriceOverride(e.target.value)}
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px', fontWeight: 800, color: '#16a34a' }}
                />
              </Form.Group>
            </Col>

            {/* Ghi chú */}
            <Col md={12}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: TX2, marginBottom: '6px' }}>Ghi chú đặt sân</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="VD: Khách hàng gọi điện đặt sân trực tiếp, trả trước tiền mặt."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ borderRadius: '10px', fontSize: '14px', padding: '10px 14px' }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8fafc' }}>
          <Button variant="light" onClick={onClose} disabled={submitting} className="px-4 py-2" style={{ borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={submitting || !courtId}
            className="px-4 py-2"
            style={{ borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: '#16a34a' }}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              'Đặt sân ngay'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
