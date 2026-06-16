import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { W, TX, TX2 } from '../../../utils/theme';
import { analyticsService, type RevenueChartData, type TopCourt } from '../../../services/analytics.service';

export const OwnerRevenue: React.FC = () => {
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [topCourts, setTopCourts] = useState<TopCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days] = useState(7); // setDays not used yet

  const [transactions, setTransactions] = useState<any[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txTotalRevenue, setTxTotalRevenue] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txLimit] = useState(5); // Show 5 per page
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Load everything on initial mount or when debounced search query changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chartData, courtsData, txData] = await Promise.all([
          analyticsService.getRevenueChart(days),
          analyticsService.getTopCourts(5),
          analyticsService.getOwnerTransactions(1, txLimit, debouncedSearch),
        ]);
        setRevenueChart(chartData);
        setTopCourts(courtsData);
        setTransactions(txData.bookings);
        setTxTotal(txData.total);
        setTxTotalRevenue(txData.totalRevenue);
        setTxPage(1);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching revenue data:', err);
        setError(err.message || 'Không thể tải dữ liệu doanh thu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days, debouncedSearch]);

  // Load transaction page updates
  useEffect(() => {
    if (loading) return;
    const fetchPageData = async () => {
      try {
        setTxLoading(true);
        const txData = await analyticsService.getOwnerTransactions(txPage, txLimit, debouncedSearch);
        setTransactions(txData.bookings);
        setTxTotal(txData.total);
        setTxTotalRevenue(txData.totalRevenue);
      } catch (err: any) {
        console.error('Error fetching page data:', err);
      } finally {
        setTxLoading(false);
      }
    };

    fetchPageData();
  }, [txPage]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        ⚠️ {error}
      </div>
    );
  }

  const totalRevenue = revenueChart.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = revenueChart.reduce((sum, item) => sum + item.bookings, 0);
  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const formatVND = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <>
      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Tổng doanh thu ({days} ngày)</div>
                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>
                  {totalBookings} đơn
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {formatVND(totalRevenue)}
              </div>
              <div style={{ fontSize: '12px', color: TX2 }}>
                Trung bình: {formatVND(Math.round(avgRevenuePerBooking))}/đơn
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Tổng lượt đặt sân</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX, letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {totalBookings}
              </div>
              <div style={{ fontSize: '12px', color: TX2 }}>
                Trung bình: {(totalBookings / days).toFixed(1)} đơn/ngày
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Sân hoạt động tốt nhất</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>emoji_events</span>
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f97316', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {topCourts.length > 0 ? topCourts[0].courtName : 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: TX2 }}>
                {topCourts.length > 0 ? `${formatVND(topCourts[0].revenue)} - ${topCourts[0].bookings} đơn` : 'Chưa có dữ liệu'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{ fontSize: '15px', fontWeight: 800, color: TX, margin: 0 }}>Doanh thu theo ngày</h5>
                <div className="d-flex gap-3" style={{ fontSize: '12px', fontWeight: 600 }}>
                  <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f3d22' }} />
                    <span style={{ color: TX2 }}>Doanh thu</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '200px' }}>
                {revenueChart.length > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                    {revenueChart.map((item, idx) => {
                      const maxRevenue = Math.max(...revenueChart.map(d => d.revenue));
                      const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      return (
                        <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '40px', cursor: 'pointer', zIndex: 2 }}>
                          <div style={{ width: '20px', height: '140px', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                            <div 
                              style={{ width: '100%', height: `${heightPercent}%`, background: '#0f3d22' }}
                              title={`${item.label}: ${formatVND(item.revenue)} (${item.bookings} đơn)`}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: TX2, marginTop: '8px' }}>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span style={{ color: TX2, fontSize: '14px' }}>Chưa có dữ liệu doanh thu</span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4 d-flex flex-column align-items-center">
              <div className="w-100 mb-3 text-start">
                <h5 style={{ fontSize: '15px', fontWeight: 800, color: TX, margin: 0 }}>Top sân theo doanh thu</h5>
              </div>
              {topCourts.length > 0 ? (
                <>
                  <div style={{ position: 'relative', width: '140px', height: '140px', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100%" height="100%" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                      {topCourts.map((court, idx) => {
                        const totalRev = topCourts.reduce((sum, c) => sum + c.revenue, 0);
                        const pct = totalRev > 0 ? (court.revenue / totalRev) * 100 : 0;
                        const colors = ['#0f3d22', '#3b82f6', '#f97316', '#eab308', '#8b5cf6'];
                        const prevPct = topCourts.slice(0, idx).reduce((sum, c) => sum + (totalRev > 0 ? (c.revenue / totalRev) * 100 : 0), 0);
                        return (
                          <circle 
                            key={idx}
                            cx="20" 
                            cy="20" 
                            r="15.915" 
                            fill="transparent" 
                            stroke={colors[idx % colors.length]} 
                            strokeWidth="4.5" 
                            strokeDasharray={`${pct} ${100 - pct}`} 
                            strokeDashoffset={25 - prevPct}
                          />
                        );
                      })}
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: TX }}>100%</div>
                      <div style={{ fontSize: '10px', color: TX2, fontWeight: 700 }}>Tổng cộng</div>
                    </div>
                  </div>
                  <div className="w-100" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {topCourts.map((court, idx) => {
                      const colors = ['#0f3d22', '#3b82f6', '#f97316', '#eab308', '#8b5cf6'];
                      const totalRev = topCourts.reduce((sum, c) => sum + c.revenue, 0);
                      const pct = totalRev > 0 ? ((court.revenue / totalRev) * 100).toFixed(0) : '0';
                      return (
                        <div key={idx} className="d-flex justify-content-between align-items-center" style={{ fontSize: '13px', fontWeight: 600 }}>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors[idx % colors.length] }} />
                            <span style={{ color: TX }}>{court.courtName}</span>
                          </div>
                          <span style={{ color: TX2, fontWeight: 700 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <span style={{ color: TX2, fontSize: '14px' }}>Chưa có dữ liệu</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Heatmap Golden Hours */}
      <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: '24px' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Khung giờ vàng</h5>
              <span style={{ fontSize: '12px', color: TX2 }}>Phân tích mật độ đặt sân theo giờ trong tuần</span>
            </div>
            <span style={{ display: 'inline-flex', background: '#dcfce7', color: '#15803d', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span className="material-symbols-outlined fs-6">bolt</span>
              Giờ vàng: 17:00 - 20:00 (mật độ thanh toán 95%)
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '800px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0', color: TX2, fontSize: '11px', fontWeight: 700 }}>
                <div style={{ width: '80px' }} />
                {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map((h, idx) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center' }}>{h}</div>
                ))}
              </div>
              {[
                { name: 'Thứ 2', peaks: [9,10,11,12] },
                { name: 'Thứ 3', peaks: [9,10,11,12] },
                { name: 'Thứ 4', peaks: [9,10,11,12,13] },
                { name: 'Thứ 5', peaks: [9,10,11,12,13] },
                { name: 'Thứ 6', peaks: [8,9,10,11,12,13] },
                { name: 'Thứ 7', peaks: [6,7,8,9,10,11,12,13,14] },
                { name: 'Chủ nhật', peaks: [6,7,8,9,10,11,12,13,14] },
              ].map((day, dIdx) => (
                <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', fontSize: '13px', fontWeight: 700, color: TX }}>{day.name}</div>
                  {Array.from({ length: 15 }).map((_, hIdx) => {
                    const isPeak = day.peaks.includes(hIdx);
                    const isMid = hIdx >= 7 && hIdx <= 13 && !isPeak;
                    let bg = '#f1f5f9';
                    if (isPeak) bg = '#0f3d22';
                    else if (isMid) bg = '#4ade80';
                    else if (hIdx >= 6) bg = '#bbf7d0';
                    return (
                      <div key={hIdx} style={{ flex: 1, height: '36px', backgroundColor: bg, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: TX2, fontWeight: 700 }}>
            <span>Mật độ thanh toán:</span>
            <div style={{ width: '12px', height: '12px', background: '#f1f5f9', borderRadius: '2px' }} /> <span>Trống (10%)</span>
            <div style={{ width: '12px', height: '12px', background: '#bbf7d0', borderRadius: '2px' }} /> <span>Thấp (40%)</span>
            <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '2px' }} /> <span>Trung bình (65%)</span>
            <div style={{ width: '12px', height: '12px', background: '#0f3d22', borderRadius: '2px' }} /> <span>Cao (95%)</span>
          </div>
        </Card.Body>
      </Card>

      {/* Transaction History */}
      <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: '24px' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Lịch sử giao dịch</h5>
            <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 gap-2" style={{ fontSize: '13px' }}>
              {txLoading ? (
                <Spinner size="sm" animation="border" variant="success" style={{ width: '14px', height: '14px' }} />
              ) : (
                <span className="material-symbols-outlined fs-5 text-muted">search</span>
              )}
              <input
                type="text"
                placeholder="Tìm kiếm hóa đơn..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setTxPage(1); // Reset page on new search
                }}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '220px' }}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle" style={{ fontSize: '14px', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr className="text-muted" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Mã GD</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Khách hàng</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Sân</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Ngày</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Tiền sân</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Dịch vụ</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Tổng thanh toán</th>
                  <th style={{ border: 'none', padding: '12px 16px' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((row) => {
                    const dateText = new Date(row.bookingDate).toLocaleDateString('vi-VN');
                    const idText = `#BK${row._id.slice(-8).toUpperCase()}`;
                    const initial = row.bookerName
                      ? row.bookerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'KH';
                    const serviceFeeVal = row.serviceFee || 0;
                    
                    // Status styling mapping
                    let statusLabel = row.status;
                    let statusBg = '#f1f5f9';
                    let statusColor = '#475569';
                    
                    if (row.status === 'CONFIRMED' || row.status === 'COMPLETED') {
                      statusLabel = 'Đã thanh toán';
                      statusBg = '#dcfce7';
                      statusColor = '#15803d';
                    } else if (row.status === 'CHECKED_IN') {
                      statusLabel = 'Đã check-in';
                      statusBg = '#eff6ff';
                      statusColor = '#3b82f6';
                    } else if (row.status === 'PENDING') {
                      statusLabel = 'Chờ duyệt';
                      statusBg = '#fffbeb';
                      statusColor = '#d97706';
                    } else if (row.status === 'CANCELLED') {
                      statusLabel = 'Đã hủy';
                      statusBg = '#fee2e2';
                      statusColor = '#dc2626';
                    }

                    return (
                      <tr key={row._id} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                        <td style={{ border: 'none', padding: '16px', fontWeight: 700, color: TX }}>{idText}</td>
                        <td style={{ border: 'none', padding: '16px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f3d22', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                              {initial}
                            </div>
                            <span style={{ fontWeight: 600, color: TX }}>{row.bookerName}</span>
                          </div>
                        </td>
                        <td style={{ border: 'none', padding: '16px', fontWeight: 600 }}>{row.courtId?.name || 'Sân EZSport'}</td>
                        <td style={{ border: 'none', padding: '16px', color: TX2 }}>{dateText}</td>
                        <td style={{ border: 'none', padding: '16px', color: TX }}>{formatVND(row.basePrice)}</td>
                        <td style={{ border: 'none', padding: '16px', color: '#f97316', fontWeight: 600 }}>
                          {serviceFeeVal > 0 ? `+${formatVND(serviceFeeVal)}` : '+0đ'}
                        </td>
                        <td style={{ border: 'none', padding: '16px', fontWeight: 800, color: '#15803d' }}>{formatVND(row.totalPrice)}</td>
                        <td style={{ border: 'none', padding: '16px' }}>
                          <span style={{ display: 'inline-block', background: statusBg, color: statusColor, border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      {txLoading ? <Spinner size="sm" animation="border" variant="success" /> : 'Không có giao dịch nào'}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                  <td colSpan={6} style={{ border: 'none', padding: '16px', textAlign: 'right', fontSize: '15px' }}>Tổng cộng:</td>
                  <td colSpan={2} style={{ border: 'none', padding: '16px', color: '#15803d', fontSize: '16px' }}>{formatVND(txTotalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-4" style={{ fontSize: '13px' }}>
            <span className="text-muted">
              Hiển thị {txTotal > 0 ? (txPage - 1) * txLimit + 1 : 0} - {Math.min(txPage * txLimit, txTotal)} của {txTotal} giao dịch
            </span>
            {Math.ceil(txTotal / txLimit) > 1 && (
              <div className="d-flex gap-1">
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-circle border p-1"
                  style={{ width: '32px', height: '32px' }}
                  disabled={txPage === 1}
                  onClick={() => setTxPage(prev => prev - 1)}
                >
                  <span className="material-symbols-outlined fs-5">chevron_left</span>
                </Button>
                {Array.from({ length: Math.ceil(txTotal / txLimit) }).map((_, idx) => {
                  const p = idx + 1;
                  const isCurrent = p === txPage;
                  return (
                    <Button
                      key={p}
                      variant={isCurrent ? 'success' : 'light'}
                      size="sm"
                      className={`rounded-circle p-1 ${isCurrent ? 'border-0' : 'border'}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: isCurrent ? '#0f3d22' : undefined,
                        color: isCurrent ? W : undefined,
                      }}
                      onClick={() => setTxPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-circle border p-1"
                  style={{ width: '32px', height: '32px' }}
                  disabled={txPage === Math.ceil(txTotal / txLimit)}
                  onClick={() => setTxPage(prev => prev + 1)}
                >
                  <span className="material-symbols-outlined fs-5">chevron_right</span>
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </>
  );
};
