import React, { useState, useEffect } from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { bookingService } from '../../services/booking.service';

interface AvailableSlot {
  time: string;
  available: boolean;
  price?: number;
}

interface SlotPickerProps {
  courtId: string;
  onSlotSelect: (slot: { date: string; startTime: string; endTime: string; duration: number; basePrice: number }) => void;
  selectedDate?: string;
  selectedStartTime?: string;
  openTime?: string;
  closeTime?: string;
}

const DURATIONS = [1, 2, 3];

// Generate next 7 days
const getNextDays = () => {
  const days: { label: string; dayName: string; value: string }[] = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      dayName: dayNames[d.getDay()],
      value: `${year}-${month}-${day}`,
    });
  }
  return days;

};

const toMinutes = (time: string) => {
  const [hour = 0, minute = 0] = String(time || '00:00').split(':').map(Number);
  return hour * 60 + minute;
};

const SlotPicker: React.FC<SlotPickerProps> = ({ courtId, onSlotSelect, selectedDate, selectedStartTime, openTime = '06:00', closeTime = '22:00' }) => {
  const days = getNextDays();
  const [activeDate, setActiveDate] = useState(selectedDate || days[0].value);
  const [activeTime, setActiveTime] = useState(selectedStartTime || '');
  const [duration, setDuration] = useState(1);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courtId || !activeDate) return;
    setLoading(true);
    bookingService
      .getAvailableSlots(courtId, activeDate)
      .then((data: AvailableSlot[]) => {
        setSlots(
          data.map((s: AvailableSlot) => ({
            time: s.time,
            available: s.available,
            price: s.price ?? 0,
          }))
        );
      })
      .catch((err) => {
        console.error('[SlotPicker] Failed to load slots:', err?.message);
        setSlots([]); // Trả về rỗng thay vì mock - tránh hiển thị slot giả
      })
      .finally(() => setLoading(false));
  }, [courtId, activeDate]);

  const calcEndTime = (start: string, dur: number) => {
    const totalMin = toMinutes(start) + dur * 60;
    const eh = Math.floor(totalMin / 60);
    const em = totalMin % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  };

  // Check if a time slot is available for the selected duration
  const isSlotAvailableForDuration = (startTime: string, dur: number): boolean => {
    const startIdx = slots.findIndex(s => s.time === startTime);
    if (startIdx === -1) return false;

    const startMinutes = toMinutes(startTime);
    const endMinutes = startMinutes + dur * 60;
    const openMinutes = toMinutes(openTime);
    const closeMinutes = toMinutes(closeTime);
    if (startMinutes < openMinutes || endMinutes > closeMinutes) return false;

    // Check if start slot is available
    if (!slots[startIdx].available) return false;

    // Check if all slots within duration are available
    const slotsNeeded = Math.ceil(dur); // 1.5h needs 2 slots
    for (let i = 0; i < slotsNeeded; i++) {
      if (startIdx + i >= slots.length) return false;
      if (!slots[startIdx + i].available) return false;
    }

    return true;
  };


  const selectedSlot = slots.find((s) => s.time === activeTime);
  const basePrice = (selectedSlot?.price ?? 0) * duration;

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
            {slots
              .filter(s => s.available && isSlotAvailableForDuration(s.time, duration)) // ✅ CHECK CẢ DURATION
              .map((s) => (
                <button
                  key={s.time}
                  onClick={() => {
                    setActiveTime(s.time);
                    onSlotSelect({
                      date: activeDate,
                      startTime: s.time,
                      endTime: calcEndTime(s.time, duration),
                      duration,
                      basePrice: (s.price ?? 0) * duration,
                    });
                  }}
                  style={{
                    border: activeTime === s.time ? '2px solid #16a34a' : '1.5px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    background: activeTime === s.time ? '#f0fdf4' : '#fff',
                    color: activeTime === s.time ? '#16a34a' : '#374151',
                    fontWeight: activeTime === s.time ? 700 : 400,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {s.time}
                </button>
              ))}
            {slots.filter(s => s.available && isSlotAvailableForDuration(s.time, duration)).length === 0 && (
              <div style={{ 
                width: '100%', 
                textAlign: 'center', 
                padding: '24px', 
                color: '#9ca3af',
                fontSize: '14px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px dashed #e5e7eb'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>event_busy</span>
                Không còn slot trống {duration}h liên tiếp trong ngày này
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="mb-4">
        <p className="fw-semibold mb-2" style={{ fontSize: '14px', color: '#374151' }}>Thời lượng</p>
        <div className="d-flex gap-2">
          {DURATIONS.map((d) => {
            const availableSlotsForDuration = slots.filter(s => s.available && isSlotAvailableForDuration(s.time, d)).length;
            const isDisabled = availableSlotsForDuration === 0;
            
            return (
              <button
                key={d}
                onClick={() => {
                  if (isDisabled) return;
                  setDuration(d);
                  // Clear selected time if it's no longer available for new duration
                  if (activeTime && !isSlotAvailableForDuration(activeTime, d)) {
                    setActiveTime('');
                  } else if (activeTime) {
                    const selectedSlot = slots.find((s) => s.time === activeTime);
                    onSlotSelect({
                      date: activeDate,
                      startTime: activeTime,
                      endTime: calcEndTime(activeTime, d),
                      duration: d,
                      basePrice: (selectedSlot?.price ?? 0) * d,
                    });
                  }
                }}
                disabled={isDisabled}
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '16px',
                  border: duration === d ? '2px solid #16a34a' : '1px solid #e5e7eb',
                  background: isDisabled ? '#f3f4f6' : duration === d ? '#f0fdf4' : '#f3f4f6',
                  padding: '0 16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: isDisabled ? '#9ca3af' : duration === d ? '#16a34a' : '#111827',
                  outline: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                }}
                title={isDisabled ? 'Không còn slot trống cho thời lượng này' : ''}
              >
                {d}h
                {isDisabled && <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.7 }}>Hết chỗ</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
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
            {basePrice.toLocaleString('vi-VN')}đ
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
