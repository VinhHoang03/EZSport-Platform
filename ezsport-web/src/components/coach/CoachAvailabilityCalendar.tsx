import { useMemo, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';

type ViewMode = 'day' | 'week' | 'month';
export type WeeklySlot = { dayOfWeek: number; startTime: string; endTime: string };
export type DateException = { date: string | Date; isAvailable: boolean; startTime?: string; endTime?: string };

interface Props {
  weeklyAvailability: WeeklySlot[];
  dateExceptions: DateException[];
  saving?: boolean;
  onSave: (weeklyAvailability: WeeklySlot[], dateExceptions: DateException[]) => Promise<void>;
}

const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const SHORT_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const exceptionKey = (value: string | Date) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?\+07:00$/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const startOfWeek = (value: Date) => {
  const result = new Date(value);
  const offset = result.getDay() === 0 ? -6 : 1 - result.getDay();
  result.setDate(result.getDate() + offset);
  return result;
};

const CoachAvailabilityCalendar = ({ weeklyAvailability, dateExceptions, saving, onSave }: Props) => {
  const [view, setView] = useState<ViewMode>('week');
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [weekly, setWeekly] = useState<WeeklySlot[]>(weeklyAvailability);
  const [exceptions, setExceptions] = useState<DateException[]>(dateExceptions);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [scope, setScope] = useState<'weekly' | 'date'>('weekly');
  const [message, setMessage] = useState('');

  const selected = parseDate(selectedDate);
  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [cursor]);

  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [cursor]);

  const slotsForDate = (date: Date) => {
    const exception = exceptions.find(item => exceptionKey(item.date) === dateKey(date));
    if (exception) return exception.isAvailable && exception.startTime && exception.endTime
      ? [{ startTime: exception.startTime, endTime: exception.endTime }]
      : [];
    return weekly.filter(slot => slot.dayOfWeek === date.getDay());
  };

  const selectDate = (date: Date) => {
    setSelectedDate(dateKey(date));
    const exception = exceptions.find(item => exceptionKey(item.date) === dateKey(date));
    const slot = exception?.isAvailable ? exception : weekly.find(item => item.dayOfWeek === date.getDay());
    if (slot?.startTime) setStartTime(slot.startTime);
    if (slot?.endTime) setEndTime(slot.endTime);
  };

  const addSlot = () => {
    if (startTime >= endTime) return setMessage('Giờ kết thúc phải sau giờ bắt đầu.');
    setMessage('');
    if (scope === 'date') {
      setExceptions(current => [
        ...current.filter(item => exceptionKey(item.date) !== selectedDate),
        { date: `${selectedDate}T00:00:00.000+07:00`, isAvailable: true, startTime, endTime },
      ]);
      return;
    }
    const next = { dayOfWeek: selected.getDay(), startTime, endTime };
    setWeekly(current => [...current.filter(slot => !(slot.dayOfWeek === next.dayOfWeek && slot.startTime === startTime && slot.endTime === endTime)), next]
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
  };

  const markUnavailable = () => setExceptions(current => [
    ...current.filter(item => exceptionKey(item.date) !== selectedDate),
    { date: `${selectedDate}T00:00:00.000+07:00`, isAvailable: false },
  ]);

  const removeSlot = (slot: { startTime: string; endTime: string }) => {
    const exception = exceptions.find(item => exceptionKey(item.date) === selectedDate);
    if (exception) setExceptions(current => current.filter(item => exceptionKey(item.date) !== selectedDate));
    else setWeekly(current => current.filter(item => !(item.dayOfWeek === selected.getDay() && item.startTime === slot.startTime && item.endTime === slot.endTime)));
  };

  const move = (direction: number) => {
    const next = new Date(cursor);
    if (view === 'day') next.setDate(next.getDate() + direction);
    if (view === 'week') next.setDate(next.getDate() + direction * 7);
    if (view === 'month') next.setMonth(next.getMonth() + direction);
    setCursor(next);
    selectDate(next);
  };

  const title = view === 'month'
    ? `Tháng ${cursor.getMonth() + 1}, ${cursor.getFullYear()}`
    : view === 'week'
      ? `${weekDays[0].toLocaleDateString('vi-VN')} — ${weekDays[6].toLocaleDateString('vi-VN')}`
      : cursor.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  const renderDay = (date: Date, compact = false) => {
    const slots = slotsForDate(date);
    const active = dateKey(date) === selectedDate;
    const today = dateKey(date) === dateKey(new Date());
    return <button type="button" className={`coach-calendar-day ${active ? 'is-selected' : ''} ${today ? 'is-today' : ''}`} onClick={() => selectDate(date)}>
      <span className="coach-calendar-date">{compact ? date.getDate() : `${SHORT_DAYS[date.getDay()]} · ${date.getDate()}/${date.getMonth() + 1}`}</span>
      <span className="coach-calendar-slots">
        {slots.map((slot, index) => <span className="coach-calendar-slot" key={`${slot.startTime}-${index}`}>{slot.startTime}–{slot.endTime}</span>)}
        {!slots.length && <span className="coach-calendar-empty">Chưa mở lịch</span>}
      </span>
    </button>;
  };

  return <div className="coach-calendar-shell">
    <div className="coach-calendar-toolbar">
      <div><div className="coach-calendar-kicker">Lịch nhận học viên</div><h4>{title}</h4></div>
      <div className="coach-calendar-actions">
        <div className="coach-view-switch" aria-label="Chế độ xem">
          {(['day', 'week', 'month'] as ViewMode[]).map(mode => <button type="button" className={view === mode ? 'active' : ''} onClick={() => setView(mode)} key={mode}>{mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}</button>)}
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => move(-1)} aria-label="Kỳ trước">‹</Button>
        <Button variant="outline-secondary" size="sm" onClick={() => { const now = new Date(); setCursor(now); selectDate(now); }}>Hôm nay</Button>
        <Button variant="outline-secondary" size="sm" onClick={() => move(1)} aria-label="Kỳ sau">›</Button>
      </div>
    </div>

    <div className="coach-calendar-layout">
      <section className="coach-calendar-main">
        {view === 'day' && <div className="coach-day-view">{renderDay(cursor)}</div>}
        {view === 'week' && <div className="coach-week-view">{weekDays.map(date => <div key={dateKey(date)}>{renderDay(date)}</div>)}</div>}
        {view === 'month' && <div className="coach-month-wrap">
          <div className="coach-month-head">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span key={day}>{day}</span>)}</div>
          <div className="coach-month-view">{monthDays.map(date => <div className={date.getMonth() !== cursor.getMonth() ? 'is-outside' : ''} key={dateKey(date)}>{renderDay(date, true)}</div>)}</div>
        </div>}
      </section>

      <aside className="coach-calendar-editor">
        <div className="coach-editor-heading"><span className="material-symbols-outlined">edit_calendar</span><div><strong>{DAYS[selected.getDay()]}</strong><small>{selected.toLocaleDateString('vi-VN')}</small></div></div>
        <Form.Label>Áp dụng lịch</Form.Label>
        <div className="coach-scope-switch">
          <button type="button" className={scope === 'weekly' ? 'active' : ''} onClick={() => setScope('weekly')}>Hàng tuần</button>
          <button type="button" className={scope === 'date' ? 'active' : ''} onClick={() => setScope('date')}>Riêng ngày này</button>
        </div>
        <div className="row g-2 mt-2">
          <Form.Group className="col-6"><Form.Label>Bắt đầu</Form.Label><Form.Control type="time" value={startTime} onChange={event => setStartTime(event.target.value)} /></Form.Group>
          <Form.Group className="col-6"><Form.Label>Kết thúc</Form.Label><Form.Control type="time" value={endTime} onChange={event => setEndTime(event.target.value)} /></Form.Group>
        </div>
        <Button className="w-100 mt-3" variant="success" onClick={addSlot}>Thêm khung giờ</Button>
        <div className="coach-editor-list">
          {slotsForDate(selected).map(slot => <div key={`${slot.startTime}-${slot.endTime}`}><span>{slot.startTime} — {slot.endTime}</span><button type="button" onClick={() => removeSlot(slot)} aria-label="Xóa khung giờ"><span className="material-symbols-outlined">close</span></button></div>)}
        </div>
        <button type="button" className="coach-unavailable" onClick={markUnavailable}>Đánh dấu nghỉ riêng ngày này</button>
        {message && <div className="coach-calendar-message">{message}</div>}
      </aside>
    </div>
    <div className="coach-calendar-footer"><span>Thay đổi chỉ có hiệu lực sau khi bấm lưu.</span><Button variant="success" disabled={saving} onClick={() => onSave(weekly, exceptions)}>{saving && <Spinner size="sm" className="me-2" />}Lưu lịch rảnh</Button></div>
  </div>;
};

export default CoachAvailabilityCalendar;
