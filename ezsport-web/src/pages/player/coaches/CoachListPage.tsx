import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { coachService, type CoachProfile } from '../../../services/coach.service';

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const initialSchedule = () => {
  const now = new Date();
  const rounded = new Date(now);
  rounded.setMinutes(Math.ceil((now.getMinutes() + 15) / 30) * 30, 0, 0);
  if (rounded.getHours() >= 21 || rounded.getDate() !== now.getDate()) {
    rounded.setDate(now.getDate() + 1);
    rounded.setHours(8, 0, 0, 0);
  }
  return { date: dateKey(rounded), time: `${String(rounded.getHours()).padStart(2, '0')}:${String(rounded.getMinutes()).padStart(2, '0')}` };
};

const CoachListPage = () => {
  const initial = initialSchedule();
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [date, setDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(initial.time);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [mode, setMode] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { date, startTime, durationMinutes: String(durationMinutes) };
      if (q.trim()) params.q = q.trim();
      if (mode) params.mode = mode;
      setCoaches(await coachService.list(params));
    } catch (requestError: any) {
      setCoaches([]);
      setError(requestError.response?.data?.message || 'Không thể tìm Coach theo lịch đã chọn.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const submit = (event: FormEvent) => { event.preventDefault(); void load(); };

  return <div className="container py-4">
    <div className="mb-4"><h2 className="fw-bold mb-1">Tìm Coach đang rảnh</h2><p className="text-muted mb-0">Chọn thời gian trước, hệ thống chỉ hiển thị Coach có thể nhận lịch.</p></div>

    <form className="card border-0 shadow-sm mb-4" onSubmit={submit}>
      <div className="card-body p-3 p-md-4"><div className="row g-3 align-items-end">
        <div className="col-md-4"><label className="form-label">Tên hoặc chuyên môn</label><input className="form-control" placeholder="Ví dụ: Pickleball" value={q} onChange={event => setQ(event.target.value)} /></div>
        <div className="col-6 col-md-2"><label className="form-label">Ngày tập</label><input type="date" className="form-control" min={dateKey(new Date())} value={date} onChange={event => setDate(event.target.value)} required /></div>
        <div className="col-6 col-md-2"><label className="form-label">Bắt đầu</label><input type="time" step="1800" className="form-control" value={startTime} onChange={event => setStartTime(event.target.value)} required /></div>
        <div className="col-6 col-md-2"><label className="form-label">Thời lượng</label><select className="form-select" value={durationMinutes} onChange={event => setDurationMinutes(Number(event.target.value))}><option value={30}>30 phút</option><option value={60}>60 phút</option><option value={90}>90 phút</option><option value={120}>120 phút</option></select></div>
        <div className="col-6 col-md-2"><label className="form-label">Hình thức</label><select className="form-select" value={mode} onChange={event => setMode(event.target.value)}><option value="">Tất cả</option><option value="offline">Trực tiếp</option><option value="online">Online</option></select></div>
        <div className="col-12 d-grid d-md-flex justify-content-md-end"><button className="btn btn-success px-4" type="submit" disabled={loading}><span className="material-symbols-outlined align-middle me-1" style={{ fontSize: 18 }}>search</span>Tìm Coach rảnh</button></div>
      </div></div>
    </form>

    {!loading && !error && <p className="text-muted small mb-3">Tìm thấy <strong>{coaches.length}</strong> Coach còn trống lúc <strong>{startTime}</strong>, ngày <strong>{new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN')}</strong>.</p>}
    {loading && <div className="text-center py-5"><div className="spinner-border text-success" /></div>}
    {!loading && error && <div className="alert alert-danger">{error}</div>}
    {!loading && !error && <div className="row g-3">{coaches.map(coach => {
      const coachName = coach.userId?.fullName || 'Huấn luyện viên EZSport';
      const detailUrl = `/coaches/${coach._id}?date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&duration=${durationMinutes}${mode ? `&mode=${mode}` : ''}`;
      return <div className="col-md-6 col-lg-4" key={coach._id}><div className="card h-100 shadow-sm border-0"><div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center gap-3"><img className="rounded-circle" width="52" height="52" style={{ objectFit: 'cover' }} src={coach.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(coachName)}&background=16a34a&color=fff`} /><div><h5 className="mb-0">{coachName}</h5><small className="text-muted">{coach.sports.join(' · ')}</small></div></div>
        <p className="mt-3 mb-2 text-muted small">{coach.specialties.join(' · ') || coach.bio || 'Huấn luyện cá nhân'}</p>
        <div className="rounded-3 px-3 py-2 mb-3" style={{ background: '#f0fdf4', color: '#166534' }}><span className="material-symbols-outlined align-middle me-1" style={{ fontSize: 17 }}>event_available</span><strong>Còn trống lúc {coach.availableStartTime || startTime}</strong></div>
        <div className="d-flex justify-content-between align-items-center mt-auto"><strong className="text-success">{coach.pricePerHour.toLocaleString('vi-VN')}đ/buổi</strong><Link className="btn btn-success btn-sm" to={detailUrl}>Chọn Coach</Link></div>
      </div></div></div>;
    })}</div>}
    {!loading && !error && !coaches.length && <div className="text-center text-muted py-5"><span className="material-symbols-outlined d-block mb-2" style={{ fontSize: 48 }}>event_busy</span>Không có Coach trống ở thời gian này. Hãy thử giờ hoặc ngày khác.</div>}
  </div>;
};

export default CoachListPage;
