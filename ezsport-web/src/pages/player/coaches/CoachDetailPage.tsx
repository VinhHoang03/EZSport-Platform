import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { coachService, type CoachProfile } from '../../../services/coach.service';

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Availability is entered as Vietnam wall-clock time. Explicitly keep that
// timezone when the Player's device is configured for another region.
const formatCoachTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const nextAvailableDate = (availability: CoachProfile['weeklyAvailability']) => {
  if (!availability?.length) return null;
  const availableDays = new Set(availability.map(slot => slot.dayOfWeek));
  const candidate = new Date();
  for (let offset = 0; offset < 14; offset += 1) {
    if (availableDays.has(candidate.getDay())) return formatLocalDate(candidate);
    candidate.setDate(candidate.getDate() + 1);
  }
  return null;
};

const CoachDetailPage = () => {
  const { id = '' } = useParams(); const navigate = useNavigate(); const [searchParams] = useSearchParams();
  const requestedDate = searchParams.get('date') || '';
  const requestedTime = searchParams.get('startTime') || '';
  const requestedDuration = Number(searchParams.get('duration'));
  const requestedMode = searchParams.get('mode');
  const [coach, setCoach] = useState<CoachProfile | null>(null); const [date, setDate] = useState(() => requestedDate || formatLocalDate(new Date())); const [slots, setSlots] = useState<any[]>([]); const [startTime, setStartTime] = useState(''); const [duration, setDuration] = useState(() => requestedDuration || 60); const [mode, setMode] = useState<'online' | 'offline'>(() => requestedMode === 'online' ? 'online' : 'offline'); const [error, setError] = useState('');
  useEffect(() => { coachService.get(id).then(c => { setCoach(c); if (!requestedDuration || !c.sessionDurations.includes(requestedDuration)) setDuration(c.sessionDurations[0]); if (!requestedMode || !c.teachingModes.includes(requestedMode as 'online' | 'offline')) setMode(c.teachingModes[0]); if (!requestedDate) { const nearest = nextAvailableDate(c.weeklyAvailability); if (nearest) setDate(nearest); } }).catch(() => setError('Không tìm thấy huấn luyện viên.')); }, [id]);
  useEffect(() => { if (id) { setError(''); coachService.slots(id, date).then(setSlots).catch((e: { response?: { data?: { message?: string } } }) => { setSlots([]); setError(e.response?.data?.message || 'Không thể tải lịch rảnh của Coach.'); }); } }, [id, date]);
  const options = useMemo(() => slots.flatMap(slot => { if (typeof slot?.startTime !== 'string' || typeof slot?.endTime !== 'string') return []; const out: string[] = []; let [h, m] = slot.startTime.split(':').map(Number); const [eh, em] = slot.endTime.split(':').map(Number); if (![h, m, eh, em].every(Number.isFinite)) return out; while (h * 60 + m + duration <= eh * 60 + em) { const iso = `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+07:00`; if (!(slot.booked || []).some((b: any) => new Date(iso) < new Date(b.endAt) && new Date(new Date(iso).getTime() + duration * 60000) > new Date(b.startAt))) out.push(iso); m += 30; h += Math.floor(m / 60); m %= 60; } return out; }), [slots, date, duration]);
  useEffect(() => { if (requestedTime && !startTime) { const match = options.find(value => value.slice(11, 16) === requestedTime); if (match) setStartTime(match); } }, [options, requestedTime, startTime]);
  const book = async () => { try { setError(''); const result = await coachService.createBooking(id, { startAt: startTime, durationMinutes: duration, teachingMode: mode, sport: coach!.sports[0] }); window.location.assign(result.payUrl); } catch (e: any) { setError(e.response?.data?.message || 'Không thể tạo lịch hẹn.'); } };
  if (!coach) return <div className="container py-5">{error || 'Đang tải...'}</div>;
  const coachName = coach.userId?.fullName || 'Huấn luyện viên EZSport';
  return <div className="container py-4" style={{ maxWidth: 850 }}><button className="btn btn-link px-0 mb-3" onClick={() => navigate('/coaches')}>← Quay lại</button><div className="card border-0 shadow-sm"><div className="card-body p-4"><div className="d-flex gap-3"><img className="rounded-circle" width="72" height="72" src={coach.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(coachName)}&background=16a34a&color=fff`} /><div><h3>{coachName}</h3><p className="text-muted mb-1">{coach.sports.join(' · ')} · {coach.area || 'Dạy online'}</p><strong className="text-success">{coach.pricePerHour.toLocaleString('vi-VN')}đ/buổi</strong></div></div><hr /><div className="row g-3"><div className="col-md-4"><label className="form-label">Ngày tập</label><input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)} value={date} onChange={e => { setDate(e.target.value); setStartTime(''); }} /></div><div className="col-md-4"><label className="form-label">Thời lượng</label><select className="form-select" value={duration} onChange={e => { setDuration(Number(e.target.value)); setStartTime(''); }}>{coach.sessionDurations.map(value => <option value={value} key={value}>{value} phút</option>)}</select></div><div className="col-md-4"><label className="form-label">Hình thức</label><select className="form-select" value={mode} onChange={e => setMode(e.target.value as any)}>{coach.teachingModes.map(value => <option value={value} key={value}>{value === 'online' ? 'Online' : 'Trực tiếp'}</option>)}</select></div><div className="col-12"><label className="form-label">Khung giờ trống</label><div className="d-flex flex-wrap gap-2">{options.map(value => <button className={`btn btn-sm ${startTime === value ? 'btn-success' : 'btn-outline-success'}`} key={value} onClick={() => setStartTime(value)}>{formatCoachTime(value)}</button>)}{!options.length && <span className="text-muted">Chưa có khung giờ phù hợp.</span>}</div></div></div>{error && <p className="text-danger mt-3 mb-0">{error}</p>}<button className="btn btn-success mt-4" disabled={!startTime} onClick={book}>Đặt lịch và thanh toán</button></div></div></div>;
};
export default CoachDetailPage;
