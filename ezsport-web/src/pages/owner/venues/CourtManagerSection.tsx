import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { courtService, type Court, type Venue, venueService } from '../../../services/venue.service';
import { parseVenuePriceRange } from '../../../utils/pricing';
import { TX, TX2, W } from '../../../utils/theme';
import { CreateCourtModal } from './CreateCourtModal';
import { EditCourtModal } from './EditCourtModal';

type PricingRule = {
  label?: string;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
};

const SPORT_LABELS: Record<string, { label: string; icon: string }> = {
  badminton: { label: 'Cầu lông', icon: 'sports_tennis' },
  pickleball: { label: 'Pickleball', icon: 'sports_tennis' },
  soccer: { label: 'Bóng đá', icon: 'sports_soccer' },
  tennis: { label: 'Tennis', icon: 'sports_tennis' },
  basketball: { label: 'Bóng rổ', icon: 'sports_basketball' },
};

const STATUS_STYLE = {
  available: { bg: '#e7f8ec', color: '#166534', label: 'Đang mở' },
  inactive: { bg: '#ffe8e8', color: '#b91c1c', label: 'Đang đóng' },
};

const DAY_COLUMNS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const toMinutes = (time: string) => {
  const [hour = 0, minute = 0] = String(time || '00:00').split(':').map(Number);
  return hour * 60 + minute;
};

const formatPrice = (value?: number) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`;
const formatHourPrice = (value?: number) => `${formatPrice(value)}/giờ`;

const defaultPricingRules = (court?: Court | null, venue?: Venue | null): PricingRule[] => {
  const venuePriceRange = parseVenuePriceRange(venue?.price, venue?.pricePerHour);
  const fallbackPrice = Number(court?.pricePerHour || 0);
  const base = venuePriceRange.min || fallbackPrice;
  const peak = venuePriceRange.max || base;
  return [
    { label: 'Giờ thấp điểm', startTime: '06:00', endTime: '16:00', price: base, isActive: true },
    { label: 'Giờ cao điểm', startTime: '16:00', endTime: '24:00', price: peak, isActive: true },
  ];
};

const normalizePricingRules = (court?: Court | null, venue?: Venue | null): PricingRule[] => {
  if (court?.pricingRules?.length) {
    return court.pricingRules.map(rule => ({
      label: rule.label || '',
      startTime: rule.startTime,
      endTime: rule.endTime,
      price: Number(rule.price || 0),
      isActive: rule.isActive !== false,
    }));
  }

  return defaultPricingRules(court, venue);
};

const getPriceForHour = (rules: PricingRule[], hour: number, fallback: number) => {
  const minute = hour * 60;
  const rule = rules.find(item => item.isActive && minute >= toMinutes(item.startTime) && minute < toMinutes(item.endTime));
  return rule?.price ?? fallback;
};

const buttonBase: React.CSSProperties = {
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 800,
  transition: 'all 0.18s ease',
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 34,
  border: '1px solid #dce5df',
  borderRadius: 7,
  background: W,
  color: TX,
  outline: 'none',
  padding: '0 9px',
  fontSize: 12,
  fontWeight: 700,
};

export const CourtManagerSection: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [pricingDraft, setPricingDraft] = useState<PricingRule[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [updatingCourt, setUpdatingCourt] = useState(false);

  const selectedVenue = venues.find(v => v._id === selectedVenueId) || null;
  const selectedCourt = courts.find(c => c._id === selectedCourtId) || null;
  const activeCourts = courts.filter(c => c.isActive !== false).length;

  useEffect(() => {
    venueService.getMyVenues({ active: 'all' })
      .then(v => {
        setVenues(v);
        if (v.length > 0) setSelectedVenueId(v[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoadingVenues(false));
  }, []);

  const fetchCourts = useCallback((venueId: string) => {
    if (!venueId) return;
    setLoadingCourts(true);
    courtService.getCourts({ venue: venueId, active: 'all' })
      .then(data => {
        setCourts(data);
        setSelectedCourtId(current => data.find(c => c._id === current)?._id || data[0]?._id || '');
      })
      .catch(console.error)
      .finally(() => setLoadingCourts(false));
  }, []);

  useEffect(() => {
    if (selectedVenueId) fetchCourts(selectedVenueId);
  }, [selectedVenueId, fetchCourts]);

  useEffect(() => {
    const rules = normalizePricingRules(selectedCourt, selectedVenue);
    setPricingDraft(rules);
    
    // Auto-save default pricing rules for courts that don't have any
    if (selectedCourt && (!selectedCourt.pricingRules || selectedCourt.pricingRules.length === 0)) {
      const defaultRules = defaultPricingRules(selectedCourt, selectedVenue);
      
      // Silently save to backend
      courtService.updateCourt(selectedCourt._id, {
        pricingRules: defaultRules,
      } as Partial<Court>).catch(() => {
        // Ignore error, user can manually save later
      });
    }
  }, [selectedCourtId, selectedCourt?._id, selectedVenue?._id, selectedVenue?.price, selectedVenue?.pricePerHour]);

  const stats = useMemo(() => {
    const rules = pricingDraft.filter(rule => rule.isActive);
    const prices = rules.map(rule => Number(rule.price || 0)).filter(Boolean);
    const min = prices.length ? Math.min(...prices) : selectedCourt?.pricePerHour || 0;
    const max = prices.length ? Math.max(...prices) : selectedCourt?.pricePerHour || 0;
    return { rules: rules.length, min, max };
  }, [pricingDraft, selectedCourt]);

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
    if (!window.confirm(`Xóa sân "${court.name}"?`)) return;
    setDeletingId(court._id);
    try {
      await courtService.deleteCourt(court._id);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi xóa sân');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (court: Court) => {
    const nextActive = !court.isActive;
    try {
      await courtService.updateCourt(court._id, {
        isActive: nextActive,
        status: nextActive ? 'available' : 'inactive',
      } as Partial<Court>);
      fetchCourts(selectedVenueId);
    } catch {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleSavePricing = async () => {
    if (!selectedCourt) return;

    const cleanRules = pricingDraft
      .map(rule => ({
        ...rule,
        label: rule.label?.trim() || 'Khung giờ',
        price: Number(rule.price || 0),
      }))
      .filter(rule => rule.startTime && rule.endTime && toMinutes(rule.startTime) < toMinutes(rule.endTime));

    if (!cleanRules.length) {
      alert('Vui lòng thêm ít nhất một khung giờ hợp lệ.');
      return;
    }

    setSavingPricing(true);
    try {
      await courtService.updateCourt(selectedCourt._id, {
        pricePerHour: cleanRules[0].price,
        pricingRules: cleanRules,
      } as Partial<Court>);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi lưu bảng giá');
    } finally {
      setSavingPricing(false);
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

  const updateRule = (index: number, patch: Partial<PricingRule>) => {
    setPricingDraft(items => items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const addPricingRule = () => {
    const venuePriceRange = parseVenuePriceRange(selectedVenue?.price, selectedVenue?.pricePerHour);
    setPricingDraft(items => [
      ...items,
      { label: 'Khung giờ mới', startTime: '06:00', endTime: '07:00', price: selectedCourt?.pricePerHour || venuePriceRange.min, isActive: true },
    ]);
  };

  return (
    <div className="court-pricing" style={{ paddingBottom: 40 }}>
      <style>{`
        .court-pricing .hover-rise:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(15, 61, 34, 0.12);
        }

        .court-pricing .price-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
        }

        .court-pricing .price-table th {
          background: #e9edfb;
          color: #344057;
          font-weight: 900;
          padding: 10px;
          border-bottom: 1px solid #dfe5f4;
          white-space: nowrap;
        }

        .court-pricing .price-table td {
          padding: 9px 10px;
          border-bottom: 1px solid #edf1f5;
          background: #fff;
          vertical-align: middle;
        }

        .court-pricing .price-table tr:nth-child(even) td {
          background: #fff9e8;
        }

        .court-pricing .price-table tr.inactive-row td {
          opacity: 0.56;
          background: #f8fafc;
        }

        .court-pricing .court-tab.active {
          background: #f0fdf4;
          border-color: #9fd7b0;
          color: #0f3d22;
        }

        @media (max-width: 900px) {
          .court-pricing .pricing-grid {
            grid-template-columns: 1fr !important;
          }

          .court-pricing .topbar {
            align-items: stretch !important;
            flex-direction: column;
          }

          .court-pricing .table-scroll {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div>
          <h5 style={{ margin: 0, color: TX, fontSize: 22, fontWeight: 900 }}>Bảng giá theo khung giờ</h5>
          <p style={{ margin: '5px 0 0', color: TX2, fontSize: 13 }}>
            Chọn sân, thiết lập giá từng khoảng giờ và lưu để khách thấy đúng giá khi đặt lịch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            className="hover-rise"
            onClick={() => setShowModal(true)}
            disabled={!selectedVenueId}
            style={{
              ...buttonBase,
              height: 38,
              padding: '0 14px',
              background: selectedVenueId ? '#0f3d22' : '#cbd5e1',
              color: W,
              cursor: selectedVenueId ? 'pointer' : 'not-allowed',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add</span>
            Thêm sân
          </button>
          <button
            className="hover-rise"
            onClick={handleSavePricing}
            disabled={!selectedCourt || savingPricing}
            style={{
              ...buttonBase,
              height: 38,
              padding: '0 14px',
              background: !selectedCourt || savingPricing ? '#cbd5e1' : '#fff',
              color: !selectedCourt || savingPricing ? W : '#0f3d22',
              border: !selectedCourt || savingPricing ? 'none' : '1px solid #9fd7b0',
              cursor: !selectedCourt || savingPricing ? 'not-allowed' : 'pointer',
            }}
          >
            {savingPricing ? <Spinner size="sm" /> : <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>}
            Lưu bảng giá
          </button>
        </div>
      </div>

      <div
        style={{
          background: W,
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          display: 'grid',
          gridTemplateColumns: 'minmax(230px, 1fr) repeat(4, minmax(120px, auto))',
          gap: 10,
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <div style={{ color: TX2, fontSize: 11, fontWeight: 900, marginBottom: 5 }}>Địa điểm</div>
          {loadingVenues ? (
            <Spinner size="sm" variant="success" />
          ) : venues.length === 0 ? (
            <span style={{ color: TX2, fontSize: 13 }}>Chưa có địa điểm</span>
          ) : (
            <select
              value={selectedVenueId}
              onChange={e => setSelectedVenueId(e.target.value)}
              style={{ ...fieldStyle, height: 38, fontSize: 13 }}
            >
              {venues.map(venue => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
            </select>
          )}
        </div>

        {[
          { label: 'Tổng sân', value: courts.length },
          { label: 'Đang mở', value: activeCourts },
          { label: 'Khung giá', value: stats.rules },
          { label: 'Khoảng giá', value: stats.min === stats.max ? formatPrice(stats.min) : `${formatPrice(stats.min)} - ${formatPrice(stats.max)}` },
        ].map(item => (
          <div key={item.label} style={{ background: '#f8fafc', border: '1px solid #edf1f5', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ color: TX, fontSize: 14, fontWeight: 900, whiteSpace: 'nowrap' }}>{item.value}</div>
            <div style={{ color: TX2, fontSize: 11, fontWeight: 700 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {loadingCourts ? (
        <div style={{ textAlign: 'center', padding: '54px 0', color: TX2 }}>
          <Spinner variant="success" />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Đang tải danh sách sân...</p>
        </div>
      ) : !selectedVenueId ? (
        <EmptyState icon="location_searching" title="Chưa chọn địa điểm" desc="Chọn một địa điểm để bắt đầu cấu hình giá." />
      ) : courts.length === 0 ? (
        <EmptyState
          icon="add_circle"
          title="Chưa có sân nào"
          desc={`Tạo sân đầu tiên cho ${selectedVenue?.name || 'địa điểm này'} để thiết lập bảng giá.`}
          action={<button onClick={() => setShowModal(true)} style={{ ...buttonBase, background: '#0f3d22', color: W, padding: '10px 16px' }}>Thêm sân đầu tiên</button>}
        />
      ) : (
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12 }}>
          <div style={{ background: W, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 900, color: TX }}>
              Danh sách sân
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10 }}>
              {courts.map(court => {
                const status = court.isActive !== false ? STATUS_STYLE.available : STATUS_STYLE.inactive;
                const active = selectedCourtId === court._id;
                const sports = court.sportTypes?.map(s => SPORT_LABELS[s]?.label || s).join(', ');

                return (
                  <button
                    key={court._id}
                    className={`court-tab ${active ? 'active' : ''}`}
                    onClick={() => setSelectedCourtId(court._id)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      background: active ? '#f0fdf4' : W,
                      color: active ? '#0f3d22' : TX,
                      padding: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{court.name}</span>
                      <span style={{ background: status.bg, color: status.color, borderRadius: 999, padding: '2px 7px', fontSize: 10, fontWeight: 900 }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ marginTop: 5, color: TX2, fontSize: 11, fontWeight: 700 }}>{sports || 'Chưa chọn môn'}</div>
                    <div style={{ marginTop: 5, color: '#0f3d22', fontSize: 12, fontWeight: 900 }}>
                      {(() => {
                        if (court.pricingRules && court.pricingRules.length > 0) {
                          const prices = court.pricingRules
                            .filter(r => r.isActive !== false)
                            .map(r => Number(r.price || 0))
                            .filter(p => p > 0);
                          
                          if (prices.length > 0) {
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            if (minPrice === maxPrice) {
                              return formatHourPrice(minPrice);
                            } else {
                              return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}/giờ`;
                            }
                          }
                        }
                        return formatHourPrice(court.pricePerHour);
                      })()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedCourt && (
              <div style={{ background: W, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span className="material-symbols-outlined" style={{ color: '#0f3d22', fontSize: 20 }}>sell</span>
                      <h6 style={{ margin: 0, color: TX, fontSize: 15, fontWeight: 900 }}>{selectedCourt.name}</h6>
                    </div>
                    <div style={{ color: TX2, fontSize: 12, fontWeight: 700 }}>
                      {selectedVenue?.name} · {selectedCourt.courtType === 'outdoor' ? 'Ngoài trời' : 'Trong nhà'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleToggleStatus(selectedCourt)}
                      style={{
                        ...buttonBase,
                        height: 34,
                        padding: '0 10px',
                        background: selectedCourt.isActive !== false ? '#e7f8ec' : '#ffe8e8',
                        color: selectedCourt.isActive !== false ? '#166534' : '#b91c1c',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                        {selectedCourt.isActive !== false ? 'toggle_on' : 'toggle_off'}
                      </span>
                      {selectedCourt.isActive !== false ? 'Nhận lịch' : 'Tạm đóng'}
                    </button>
                    <button onClick={() => handleEditCourt(selectedCourt)} title="Chỉnh sửa sân" style={{ ...buttonBase, width: 34, height: 34, background: '#eef7f1', color: '#0f3d22', border: '1px solid #cfe8d7' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
                    </button>
                    <button onClick={() => handleDeleteCourt(selectedCourt)} disabled={deletingId === selectedCourt._id} title="Xóa sân" style={{ ...buttonBase, width: 34, height: 34, background: '#fff1f2', color: '#dc2626', border: '1px solid #ffd6dc' }}>
                      {deletingId === selectedCourt._id ? <Spinner size="sm" variant="danger" /> : <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: W, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ color: TX, fontSize: 13, fontWeight: 900 }}>Bảng giá theo khung giờ</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedCourt && (!selectedCourt.pricingRules || selectedCourt.pricingRules.length === 0) && (
                    <div style={{
                      fontSize: 11,
                      color: '#dc2626',
                      background: '#fee2e2',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                      Chưa có bảng giá
                    </div>
                  )}
                  <button onClick={addPricingRule} style={{ ...buttonBase, height: 30, padding: '0 10px', background: '#eef7f1', color: '#0f3d22' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Thêm khung
                  </button>
                </div>
              </div>

              <div className="table-scroll">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Tên khung</th>
                      <th>Từ</th>
                      <th>Đến</th>
                      {DAY_COLUMNS.map(day => <th key={day}>{day}</th>)}
                      <th>Giá/giờ</th>
                      <th>TT</th>
                      <th style={{ width: 52 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingDraft.map((rule, index) => (
                      <tr key={`${rule.startTime}-${index}`} className={!rule.isActive ? 'inactive-row' : ''}>
                        <td>
                          <span style={{ background: '#eef7f1', color: '#0f3d22', borderRadius: 6, padding: '4px 7px', fontWeight: 900 }}>
                            {index + 1}
                          </span>
                        </td>
                        <td style={{ minWidth: 150 }}>
                          <input value={rule.label || ''} onChange={e => updateRule(index, { label: e.target.value })} style={fieldStyle} placeholder="VD: Giờ cao điểm" />
                        </td>
                        <td><input type="time" value={rule.startTime} onChange={e => updateRule(index, { startTime: e.target.value })} style={fieldStyle} /></td>
                        <td><input type="time" value={rule.endTime} onChange={e => updateRule(index, { endTime: e.target.value })} style={fieldStyle} /></td>
                        {DAY_COLUMNS.map(day => (
                          <td key={day} style={{ color: rule.isActive ? '#166534' : TX2, fontWeight: 900, whiteSpace: 'nowrap' }}>
                            {formatPrice(rule.price)}
                          </td>
                        ))}
                        <td style={{ minWidth: 120 }}>
                          <input
                            type="number"
                            min={0}
                            value={rule.price}
                            onChange={e => updateRule(index, { price: Number(e.target.value || 0) })}
                            style={{ ...fieldStyle, color: '#b91c1c', fontWeight: 900 }}
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => updateRule(index, { isActive: !rule.isActive })}
                            style={{
                              ...buttonBase,
                              height: 28,
                              padding: '0 8px',
                              background: rule.isActive ? '#e7f8ec' : '#f1f5f9',
                              color: rule.isActive ? '#166534' : TX2,
                            }}
                          >
                            {rule.isActive ? 'Bật' : 'Tắt'}
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => setPricingDraft(items => items.filter((_, idx) => idx !== index))}
                            disabled={pricingDraft.length <= 1}
                            title="Xóa khung giá"
                            style={{
                              ...buttonBase,
                              width: 30,
                              height: 30,
                              background: pricingDraft.length <= 1 ? '#f1f5f9' : '#fff1f2',
                              color: pricingDraft.length <= 1 ? '#94a3b8' : '#dc2626',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: W, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: TX, fontSize: 13, fontWeight: 900 }}>
                  Giá cặp đang dùng
                </div>
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pricingDraft.filter(rule => rule.isActive).map((rule, index) => (
                    <div key={`${rule.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f7f8ff', border: '1px solid #e4e8fa', borderRadius: 8, padding: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 8, background: '#ffe8e8', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: TX, fontSize: 13, fontWeight: 900 }}>{rule.label || 'Khung giờ'}</div>
                        <div style={{ color: TX2, fontSize: 12, fontWeight: 700 }}>{rule.startTime} - {rule.endTime}</div>
                      </div>
                      <div style={{ color: '#b91c1c', fontSize: 13, fontWeight: 900 }}>{formatHourPrice(rule.price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: W, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: TX, fontSize: 13, fontWeight: 900 }}>
                  Preview giá theo giờ
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
                    {Array.from({ length: 19 }, (_, idx) => idx + 6).map(hour => {
                      const price = getPriceForHour(pricingDraft, hour, selectedCourt?.pricePerHour || 0);
                      const isHigh = price >= stats.max && stats.max > stats.min;
                      return (
                        <div
                          key={hour}
                          style={{
                            borderRadius: 7,
                            border: '1px solid #edf1f5',
                            background: isHigh ? '#ffe8e8' : '#effaf2',
                            color: isHigh ? '#b91c1c' : '#166534',
                            padding: '7px 4px',
                            textAlign: 'center',
                            minHeight: 50,
                          }}
                        >
                          <div style={{ fontSize: 11, color: TX2, fontWeight: 800 }}>{String(hour).padStart(2, '0')}:00</div>
                          <div style={{ fontSize: 11, fontWeight: 900 }}>{formatPrice(price)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateCourtModal
        show={showModal}
        submitting={submitting}
        venue={selectedVenue}
        onClose={() => setShowModal(false)}
        onCreateCourt={handleCreateCourt}
      />

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

const EmptyState: React.FC<{ icon: string; title: string; desc: string; action?: React.ReactNode }> = ({ icon, title, desc, action }) => (
  <div style={{ textAlign: 'center', padding: '54px 20px', color: TX2, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
    <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#0f3d22', display: 'block', marginBottom: 10 }}>
      {icon}
    </span>
    <div style={{ color: TX, fontSize: 16, fontWeight: 900, marginBottom: 5 }}>{title}</div>
    <p style={{ margin: action ? '0 0 16px' : 0, fontSize: 13, fontWeight: 700 }}>{desc}</p>
    {action}
  </div>
);
