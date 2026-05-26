import React, { useState, useEffect } from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { bookingService } from '../../services/booking.service';

interface SlotPickerProps {
  venueId: string;
  onSlotSelect: (slot: { date: string; startTime: string; endTime: string; duration: number; basePrice: number }) => void;
  selectedDate?: string;
  selectedStartTime?: string;
}

const DURATIONS = [1, 1.5, 2, 3];

// Generate next 7 days
const getNextDays = () => {
  const days: { label: string; dayName: string; value: string }[] = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      dayName: dayNames[d.getDay()],
      value: d.toISOString().split('T')[0],
    });
  }
  return days;
};

const SlotPicker: React.FC<SlotPickerProps> = ({ venueId, onSlotSelect, selectedDate, selectedStartTime }) => {
  const days = getNextDays();
  const [activeDate, setActiveDate] = useState(selectedDate || days[0].value);
  const [activeTime, setActiveTime] = useState(selectedStartTime || '');
  const [duration, setDuration] = useState(1);
  const [slots, setSlots] = useState<{ time: string; available: boolean; price: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venueId || !activeDate) return;
    setLoading(true);
    bookingService
      .getAvailableSlots(venueId, activeDate)
      .then((data: any[]) => {
        setSlots(
          data.map((s: any) => ({
            time: s.time,          // backend returns { time, available }
            available: s.available,
            price: s.price ?? 150000,
          }))
        );
      })
      .catch(() => {
        // fallback mock slots
        setSlots([
          { time: '07:00', available: false, price: 150000 },
          { time: '08:00', available: true, price: 150000 },
          { time: '09:00', available: true, price: 150000 },
          { time: '10:00', available: false, price: 150000 },
          { time: '11:00', available: true, price: 180000 },
          { time: '13:00', available: true, price: 180000 },
          { time: '14:00', available: true, price: 180000 },
          { time: '15:00', available: true, price: 180000 },
          { time: '16:00', available: false, price: 200000 },
          { time: '17:00', available: true, price: 200000 },
          { time: '18:00', available: true, price: 200000 },
          { time: '19:00', available: true, price: 200000 },
          { time: '20:00', available: false, price: 200000 },
          { time: '21:00', available: true, price: 150000 },
          { time: '22:00', available: true, price: 150000 },
        ]);
      })
      .finally(() => setLoading(false));
  }, [venueId, activeDate]);

  const calcEndTime = (start: string, dur: number) => {
    const [h, m] = start.split(':').map(Number);
    const totalMin = h * 60 + m + dur * 60;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  };


  return (
    <div>
      {/* Date picker */}
      <div className="mb-3">
        <p className="fw-semibold mb-2" style={{ fontSize: '14px', color: '#374151' }}>Chọn ngày</p>
        <div className="d-flex gap-2 flex-wrap">
          {days.map((d) => (
            <button
              key={d.value}
              onClick={() => { setActiveDate(d.value); setActiveTime(''); }}
              style={{
                border: activeDate === d.value ? '2px solid #16a34a' : '1.5px solid #e5e7eb',
                borderRadius: '12px',
                padding: '8px 14px',
                background: activeDate === d.value ? '#f0fdf4' : '#fff',
                color: activeDate === d.value ? '#16a34a' : '#374151',
                fontWeight: activeDate === d.value ? 700 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                minWidth: '60px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{d.dayName}</div>
              <div>{d.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-3">
        <p className="fw-semibold mb-2" style={{ fontSize: '14px', color: '#374151' }}>Chọn giờ</p>
        {loading ? (
          <div className="text-center py-3"><Spinner size="sm" variant="success" /></div>
        ) : (
          <div className="d-flex gap-2 flex-wrap">
            {slots.map((s) => (
              <button
                key={s.time}
                disabled={!s.available}
                onClick={() => setActiveTime(s.time)}
                style={{
                  border: activeTime === s.time ? '2px solid #16a34a' : '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  background: !s.available ? '#f3f4f6' : activeTime === s.time ? '#f0fdf4' : '#fff',
                  color: !s.available ? '#9ca3af' : activeTime === s.time ? '#16a34a' : '#374151',
                  fontWeight: activeTime === s.time ? 700 : 400,
                  fontSize: '13px',
                  cursor: s.available ? 'pointer' : 'not-allowed',
                  textDecoration: !s.available ? 'line-through' : 'none',
                }}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="mb-4">
        <p className="fw-semibold mb-2" style={{ fontSize: '14px', color: '#374151' }}>Thời lượng</p>
        <div className="d-flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
               style={{
            width: '100%',
            height: '56px',
            borderRadius: '16px',
            border: 'none',
            background: '#f3f4f6',
            padding: '0 16px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            outline: 'none',
          }}
            >
              {d}h
            </button>
          ))}
        </div>
      </div>

      {/* Summary + confirm */}
      {activeTime && (
        <div
          className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
        >
          <div style={{ fontSize: '13px', color: '#374151' }}>
            <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '16px', color: '#16a34a' }}>schedule</span>
            {activeTime} → {calcEndTime(activeTime, duration)} &nbsp;·&nbsp; {duration}h
          </div>
          <Badge bg="success" style={{ fontSize: '13px' }}>
            {((slots.find((s) => s.time === activeTime)?.price ?? 150000) * duration).toLocaleString('vi-VN')}đ
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
