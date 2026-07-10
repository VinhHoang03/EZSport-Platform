import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coachService, type CoachProfile } from '../../../services/coach.service';

const CoachListPage = () => {
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  useEffect(() => { coachService.list(q ? { q } : undefined).then(setCoaches).finally(() => setLoading(false)); }, [q]);
  return <div className="container py-4">
    <div className="d-flex justify-content-between align-items-center mb-4"><div><h2 className="fw-bold mb-1">Huấn luyện viên</h2><p className="text-muted mb-0">Chọn người đồng hành cho buổi tập của bạn.</p></div><input className="form-control" style={{ maxWidth: 280 }} placeholder="Tìm tên hoặc chuyên môn" value={q} onChange={e => setQ(e.target.value)} /></div>
    {loading ? <div className="text-center py-5"><div className="spinner-border text-success" /></div> : <div className="row g-3">{coaches.map(coach => { const coachUser = coach.userId; const coachName = coachUser?.fullName || 'Huấn luyện viên EZSport'; return <div className="col-md-6 col-lg-4" key={coach._id}><div className="card h-100 shadow-sm border-0"><div className="card-body"><div className="d-flex align-items-center gap-3"><img className="rounded-circle" width="52" height="52" style={{ objectFit: 'cover' }} src={coachUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(coachName)}&background=16a34a&color=fff`} /><div><h5 className="mb-0">{coachName}</h5><small className="text-muted">{coach.sports.join(' · ')}</small></div></div><p className="mt-3 mb-2 text-muted small">{coach.specialties.join(' · ') || coach.bio || 'Huấn luyện cá nhân'}</p><div className="d-flex justify-content-between align-items-center"><strong className="text-success">{coach.pricePerHour.toLocaleString('vi-VN')}đ/giờ</strong><Link className="btn btn-success btn-sm" to={`/coaches/${coach._id}`}>Xem lịch</Link></div></div></div></div>; })}</div>}
    {!loading && !coaches.length && <p className="text-center text-muted py-5">Chưa tìm thấy huấn luyện viên phù hợp.</p>}
  </div>;
};
export default CoachListPage;
