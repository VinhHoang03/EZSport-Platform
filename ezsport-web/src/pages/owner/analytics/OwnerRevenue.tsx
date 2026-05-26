import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { W, TX, TX2 } from '../../../utils/theme';

export const OwnerRevenue: React.FC = () => {
  return (
    <>
      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Tổng doanh thu (Tổng)</div>
                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>+12%</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px', marginBottom: '4px' }}>18,500,000đ</div>
              <div style={{ fontSize: '12px', color: TX2 }}>+2.1m so với tháng trước</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Doanh thu đặt sân</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX, letterSpacing: '-0.5px', marginBottom: '4px' }}>15,200,000đ</div>
              <div style={{ fontSize: '12px', color: TX2 }}>350 lượt đặt sân thành công</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Dịch vụ kèm theo</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_cart</span>
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#f97316', letterSpacing: '-0.5px', marginBottom: '4px' }}>3,300,000đ</div>
              <div style={{ fontSize: '12px', color: TX2 }}>Thuê vợt, nước uống, bóng</div>
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
                    <span style={{ color: TX2 }}>Đặt sân</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fed7aa' }} />
                    <span style={{ color: TX2 }}>Dịch vụ</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                  {[
                    { label: 'T2', booking: 43, service: 10 },
                    { label: 'T3', booking: 53, service: 12 },
                    { label: 'T4', booking: 60, service: 15 },
                    { label: 'T5', booking: 48, service: 10 },
                    { label: 'T6', booking: 68, service: 17 },
                    { label: 'T7', booking: 78, service: 22 },
                    { label: 'CN', booking: 72, service: 20 },
                  ].map((bar, idx) => (
                    <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '40px', cursor: 'pointer', zIndex: 2 }}>
                      <div style={{ width: '20px', height: '140px', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                        <div style={{ width: '100%', height: `${bar.booking}%`, background: '#0f3d22' }} />
                        <div style={{ width: '100%', height: `${bar.service}%`, background: '#fed7aa' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: TX2, marginTop: '8px' }}>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4 d-flex flex-column align-items-center">
              <div className="w-100 mb-3 text-start">
                <h5 style={{ fontSize: '15px', fontWeight: 800, color: TX, margin: 0 }}>Doanh thu theo sân</h5>
              </div>
              <div style={{ position: 'relative', width: '140px', height: '140px', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#0f3d22" strokeWidth="4.5" strokeDasharray="50 50" strokeDashoffset="25" />
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="30 70" strokeDashoffset="75" />
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4.5" strokeDasharray="20 80" strokeDashoffset="5" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: TX }}>100%</div>
                  <div style={{ fontSize: '10px', color: TX2, fontWeight: 700 }}>Tổng cộng</div>
                </div>
              </div>
              <div className="w-100" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {[
                  { name: 'Sân A1', pct: '50%', color: '#0f3d22' },
                  { name: 'Sân A2', pct: '30%', color: '#3b82f6' },
                  { name: 'Sân B1', pct: '20%', color: '#f97316' },
                ].map((court, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center" style={{ fontSize: '13px', fontWeight: 600 }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: court.color }} />
                      <span style={{ color: TX }}>{court.name}</span>
                    </div>
                    <span style={{ color: TX2, fontWeight: 700 }}>{court.pct}</span>
                  </div>
                ))}
              </div>
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
              <span className="material-symbols-outlined fs-5 text-muted">search</span>
              <input type="text" placeholder="Tìm kiếm hóa đơn..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '220px' }} />
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
                {[
                  { id: '#BK889025', name: 'Nguyễn Văn Nam', court: 'Sân A1', date: '18/05/2026', courtFee: '320.000đ', serviceFee: '+30.000đ', total: '350.000đ', status: 'confirmed' },
                  { id: '#BK889026', name: 'Trần Thị Hồng', court: 'Sân A2', date: '18/05/2026', courtFee: '320.000đ', serviceFee: '+0đ', total: '320.000đ', status: 'confirmed' },
                  { id: '#BK889027', name: 'Lê Hoàng Long', court: 'Sân B1', date: '18/05/2026', courtFee: '150.000đ', serviceFee: '+20.000đ', total: '170.000đ', status: 'pending' },
                  { id: '#BK889028', name: 'Phạm Minh Đức', court: 'Sân A1', date: '17/05/2026', courtFee: '400.000đ', serviceFee: '+50.000đ', total: '450.000đ', status: 'confirmed' },
                  { id: '#BK889029', name: 'Hoàng Thùy Linh', court: 'Sân A2', date: '17/05/2026', courtFee: '300.000đ', serviceFee: '+15.000đ', total: '315.000đ', status: 'confirmed' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                    <td style={{ border: 'none', padding: '16px', fontWeight: 700, color: TX }}>{row.id}</td>
                    <td style={{ border: 'none', padding: '16px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f3d22', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                          {row.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: TX }}>{row.name}</span>
                      </div>
                    </td>
                    <td style={{ border: 'none', padding: '16px', fontWeight: 600 }}>{row.court}</td>
                    <td style={{ border: 'none', padding: '16px', color: TX2 }}>{row.date}</td>
                    <td style={{ border: 'none', padding: '16px', color: TX }}>{row.courtFee}</td>
                    <td style={{ border: 'none', padding: '16px', color: '#f97316', fontWeight: 600 }}>{row.serviceFee}</td>
                    <td style={{ border: 'none', padding: '16px', fontWeight: 800, color: '#15803d' }}>{row.total}</td>
                    <td style={{ border: 'none', padding: '16px' }}>
                      <span style={{ display: 'inline-block', background: row.status === 'confirmed' ? '#dcfce7' : '#fffbeb', color: row.status === 'confirmed' ? '#15803d' : '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}>
                        {row.status === 'confirmed' ? 'Đã thanh toán' : 'Chờ duyệt'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                  <td colSpan={6} style={{ border: 'none', padding: '16px', textAlign: 'right', fontSize: '15px' }}>Tổng cộng:</td>
                  <td colSpan={2} style={{ border: 'none', padding: '16px', color: '#15803d', fontSize: '16px' }}>18,500,000đ</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-4" style={{ fontSize: '13px' }}>
            <span className="text-muted">Hiển thị 1 - 5 của 350 giao dịch</span>
            <div className="d-flex gap-1">
              <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined fs-5">chevron_left</span>
              </Button>
              <Button variant="success" size="sm" className="rounded-circle p-1 border-0" style={{ width: '32px', height: '32px', background: '#0f3d22', color: W }}>1</Button>
              <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>2</Button>
              <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>3</Button>
              <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>
                <span className="material-symbols-outlined fs-5">chevron_right</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};
