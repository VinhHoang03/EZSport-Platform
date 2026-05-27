import React, { useEffect, useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import { venueService, courtService, type Venue, type Court } from '../../../services/venue.service';
import { TX, TX2, W } from '../../../utils/theme';
import { CreateCourtModal } from './CreateCourtModal';
import { EditCourtModal } from './EditCourtModal';

const SPORT_EMOJI: Record<string, string> = {
  badminton: '🏸', pickleball: '🏓', soccer: '⚽', tennis: '🎾', basketball: '🏀',
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  available:   { bg: '#dcfce7', color: '#15803d', label: 'Hoạt động', icon: '✅' },
  maintenance: { bg: '#fef9c3', color: '#92400e', label: 'Bảo trì', icon: '🔧' },
  inactive:    { bg: '#fee2e2', color: '#dc2626', label: 'Tạm đóng', icon: '🔒' },
};

const inp: React.CSSProperties = {
  padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid #e2e8f0', outline: 'none',
  fontSize: '14px', color: TX, background: W,
  width: '100%', fontWeight: 600,
};

export const CourtManagerSection: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [updatingCourt, setUpdatingCourt] = useState(false);

  // Load venues on mount
  useEffect(() => {
    venueService.getVenues({ active: 'all' })
      .then(v => {
        setVenues(v);
        if (v.length > 0) setSelectedVenueId(v[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoadingVenues(false));
  }, []);

  // Load courts when venue changes
  const fetchCourts = useCallback((venueId: string) => {
    if (!venueId) return;
    setLoadingCourts(true);
    courtService.getCourts({ venue: venueId, active: 'all' })
      .then(setCourts)
      .catch(console.error)
      .finally(() => setLoadingCourts(false));
  }, []);

  useEffect(() => {
    if (selectedVenueId) fetchCourts(selectedVenueId);
  }, [selectedVenueId, fetchCourts]);

  const selectedVenue = venues.find(v => v._id === selectedVenueId) || null;

  const handleCreateCourt = async (payloads: (FormData | any)[]) => {
    setSubmitting(true);
    try {
      await courtService.createCourt(payloads);
      setShowModal(false);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi tạo sân');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourt = async (court: Court) => {
    if (!window.confirm(`Xoá sân "${court.name}"?`)) return;
    setDeletingId(court._id);
    try {
      await courtService.deleteCourt(court._id);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi xoá sân');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (court: Court) => {
    const nextActive = !(court as any).isActive;
    try {
      await courtService.updateCourt(court._id, {
        isActive: nextActive,
        status: nextActive ? 'available' : 'inactive',
      } as any);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court);
    setShowEditModal(true);
  };

  const handleUpdateCourt = async (courtId: string, data: any) => {
    setUpdatingCourt(true);
    try {
      await courtService.updateCourt(courtId, data);
      setShowEditModal(false);
      setEditingCourt(null);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi cập nhật sân');
    } finally {
      setUpdatingCourt(false);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h5 style={{ fontWeight: 800, color: TX, margin: 0 }}>Quản lý sân 🏟️</h5>
        <p style={{ fontSize: 13, color: TX2, marginTop: 4, marginBottom: 0 }}>
          Chọn địa điểm để xem và quản lý từng sân con bên trong
        </p>
      </div>

      {/* Venue Dropdown + Add button */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#f8fafc', borderRadius: 16,
          padding: '16px 20px', marginBottom: 28,
          border: '1px solid #e2e8f0',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: '#0f3d22', fontSize: 22 }}>
          location_on
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TX2, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Địa điểm
          </div>
          {loadingVenues ? (
            <Spinner size="sm" variant="success" />
          ) : venues.length === 0 ? (
            <span style={{ fontSize: 13, color: TX2 }}>Chưa có địa điểm nào. Hãy thêm địa điểm trước.</span>
          ) : (
            <select
              style={{ ...inp, border: 'none', background: 'transparent', padding: '2px 0', fontSize: 16, fontWeight: 800 }}
              value={selectedVenueId}
              onChange={e => setSelectedVenueId(e.target.value)}
            >
              {venues.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* + Add court button */}
        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedVenueId}
          title="Thêm sân mới"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: selectedVenueId ? '#0f3d22' : '#e2e8f0',
            border: 'none', color: W, cursor: selectedVenueId ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: selectedVenueId ? '0 4px 12px rgba(15,61,34,0.25)' : 'none',
            transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add</span>
        </button>
      </div>

      {/* Court count badge */}
      {selectedVenue && !loadingCourts && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac',
            borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700,
          }}>
            {courts.length} sân trong "{selectedVenue.name}"
          </span>
          {courts.filter(c => (c as any).isActive !== false).length > 0 && (
            <span style={{
              background: '#dcfce7', color: '#15803d',
              borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700,
            }}>
              ● {courts.filter(c => (c as any).isActive !== false).length} hoạt động
            </span>
          )}
        </div>
      )}

      {/* Courts List */}
      {loadingCourts ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spinner variant="success" />
          <p style={{ marginTop: 12, color: TX2, fontSize: 14 }}>Đang tải danh sách sân...</p>
        </div>
      ) : !selectedVenueId ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: TX2 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 12 }}>
            sports_tennis
          </span>
          Chọn một địa điểm để xem các sân
        </div>
      ) : courts.length === 0 ? (
        <div
          style={{
            textAlign: 'center', padding: '48px 24px',
            border: '2px dashed #e2e8f0', borderRadius: 16,
            background: '#fafafa',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 12 }}>
            add_circle
          </span>
          <p style={{ fontWeight: 700, color: TX, marginBottom: 4 }}>Chưa có sân nào</p>
          <p style={{ fontSize: 13, color: TX2, marginBottom: 20 }}>
            Nhấn <strong>+</strong> để thêm sân đầu tiên cho <strong>{selectedVenue?.name}</strong>
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#0f3d22', color: W, border: 'none', borderRadius: 20,
              padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Thêm sân đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {courts.map((court, idx) => {
            const st = (court as any).isActive !== false ? STATUS_STYLE.available : STATUS_STYLE.inactive;
            const isDeleting = deletingId === court._id;
            return (
              <div
                key={court._id}
                style={{
                  background: W, borderRadius: 14, border: '1px solid #e2e8f0',
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
              >
                {/* Index bubble */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#f0fdf4', border: '2px solid #86efac',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15, color: '#15803d', flexShrink: 0,
                }}>
                  {idx + 1}
                </div>

                {/* Court info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: TX, marginBottom: 4 }}>
                    {(court as any).emoji || '🏟️'} {court.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {/* Sports */}
                    {((court as any).sportTypes as string[] || []).map((s: string) => (
                      <span key={s} style={{ fontSize: 12, color: TX2 }}>
                        {SPORT_EMOJI[s] || '🏟️'} {s}
                      </span>
                    ))}
                    <span style={{ color: '#d1d5db' }}>·</span>
                    {/* Type */}
                    <span style={{ fontSize: 12, color: TX2 }}>
                      {(court as any).courtType === 'outdoor' ? '🌤 Ngoài trời' : '🏠 Trong nhà'}
                    </span>
                    <span style={{ color: '#d1d5db' }}>·</span>
                    {/* Price */}
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                      {((court as any).pricePerHour || 0).toLocaleString('vi-VN')}đ/giờ
                    </span>
                  </div>
                </div>

                {/* Status badge (clickable toggle) */}
                <button
                  onClick={() => handleToggleStatus(court)}
                  title="Nhấn để chuyển trạng thái"
                  style={{
                    background: st.bg, color: st.color,
                    border: 'none', borderRadius: 20,
                    padding: '5px 12px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', flexShrink: 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {st.icon} {st.label}
                </button>

                {/* Edit button */}
                <button
                  onClick={() => handleEditCourt(court)}
                  title="Chỉnh sửa sân"
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: '1px solid #dbeafe', background: '#eff6ff',
                    color: '#1d4ed8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#dbeafe';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteCourt(court)}
                  disabled={isDeleting}
                  title="Xoá sân"
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: '1px solid #fee2e2', background: '#fff5f5',
                    color: '#dc2626', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}
                >
                  {isDeleting
                    ? <Spinner size="sm" variant="danger" />
                    : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  }
                </button>
              </div>
            );
          })}

          {/* Quick add at bottom of list */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#f8fafc', border: '2px dashed #cbd5e1',
              borderRadius: 14, padding: '14px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              color: TX2, fontWeight: 700, fontSize: 14,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#0f3d22';
              e.currentTarget.style.color = '#0f3d22';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = TX2;
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
            Thêm sân mới vào {selectedVenue?.name}
          </button>
        </div>
      )}

      {/* Create Court Modal */}
      <CreateCourtModal
        show={showModal}
        submitting={submitting}
        venue={selectedVenue}
        onClose={() => setShowModal(false)}
        onCreateCourt={handleCreateCourt}
      />

      {/* Edit Court Modal */}
      <EditCourtModal
        show={showEditModal}
        submitting={updatingCourt}
        court={editingCourt}
        onClose={() => {
          setShowEditModal(false);
          setEditingCourt(null);
        }}
        onUpdateCourt={handleUpdateCourt}
      />
    </div>
  );
};
