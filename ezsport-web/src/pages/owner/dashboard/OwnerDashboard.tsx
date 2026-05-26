import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { G, W, TX, TX2 } from '../../../utils/theme';

interface OwnerOverviewTabProps {
  onNavigate: (menu: string) => void;
}

export const OwnerOverviewTab: React.FC<OwnerOverviewTabProps> = ({ onNavigate }) => {
  return (
    <>
      {/* KPI Cards Row */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
                </div>
                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>+15% so với tuần trước</span>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Lượt đặt sân hôm nay</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>12</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span>
                </div>
                <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> +8%
                </div>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Doanh thu hôm nay</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>4,500K</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #22c55e', borderRightColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: TX }}>
                  75%
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: TX }}>Rất tốt</div>
                  <div style={{ fontSize: '12px', color: TX2 }}>Tỉ lệ lấp đầy</div>
                </div>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#22c55e', borderRadius: '3px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef08a', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Đánh giá (500 đánh giá)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                4.8 <span style={{ fontSize: '16px', color: TX2, fontWeight: 600 }}>/ 5.0</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Middle Row: Chart & Today Bookings */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, margin: 0 }}>Doanh thu 7 ngày qua</h5>
                <div style={{ fontSize: '13px', fontWeight: 600, color: TX2 }}>Tổng: 22.45 Triệu</div>
              </div>
              <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                <svg viewBox="0 0 800 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,150 C100,150 150,140 200,130 C300,110 350,50 450,50 C550,50 600,160 650,140 C700,120 750,20 800,20 L800,200 L0,200 Z" fill="url(#chartGradient)" />
                  <path d="M0,150 C100,150 150,140 200,130 C300,110 350,50 450,50 C550,50 600,160 650,140 C700,120 750,20 800,20" fill="none" stroke="#22c55e" strokeWidth="4" />
                  <circle cx="200" cy="130" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                  <circle cx="450" cy="50" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                  <circle cx="650" cy="140" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                  <circle cx="800" cy="20" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px', color: TX2, fontSize: '11px', fontWeight: 600 }}>
                  <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4 d-flex flex-column">
              <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '20px' }}>Đặt sân hôm nay</h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {[
                  { name: 'Nguyễn Văn A', court: 'Sân A1', time: '18:00 - 19:00', status: 'Đã TT', color: '#15803d', bg: '#dcfce7' },
                  { name: 'Trần Thị B', court: 'Sân B2', time: '19:00 - 20:30', status: 'Chưa TT', color: '#a16207', bg: '#fef08a' },
                  { name: 'Hoàng Nam', court: 'Sân A1', time: '20:00 - 21:00', status: 'Đã TT', color: '#15803d', bg: '#dcfce7' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: G, border: '1px solid #e2e8f0' }}>
                      {item.time}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: TX2 }}>{item.court}</div>
                    </div>
                    <span style={{ display: 'inline-block', background: item.bg, color: item.color, border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div
                onClick={() => onNavigate('bookings')}
                style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer', color: G, fontSize: '13px', fontWeight: 700 }}
              >
                Xem tất cả lịch đặt
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row: Heatmap & Reviews */}
      <Row className="g-4">
        <Col lg={7}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4">
              <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '24px' }}>Mật độ lấp đầy (7 ngày)</h5>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '24px', paddingRight: '8px', color: TX2, fontSize: '12px', fontWeight: 600 }}>
                  <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>Sáng</div>
                  <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>Chiều</div>
                  <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>Tối</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: TX2, fontSize: '12px', fontWeight: 600, paddingLeft: '8px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>T2</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>T3</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>T4</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>T5</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>T6</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>T7</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>CN</div>
                  </div>
                  {[
                    ['#bbf7d0', '#86efac', '#f1f5f9', '#bbf7d0', '#4ade80', '#22c55e', '#22c55e'],
                    ['#22c55e', '#f1f5f9', '#4ade80', '#86efac', '#22c55e', '#16a34a', '#16a34a'],
                    ['#16a34a', '#15803d', '#15803d', '#16a34a', '#15803d', '#14532d', '#14532d'],
                  ].map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      {row.map((color, cIdx) => (
                        <div key={cIdx} style={{ flex: 1, height: '32px', backgroundColor: color, borderRadius: '4px' }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: TX2, fontWeight: 600 }}>
                <span>Trống</span>
                <div style={{ width: '12px', height: '12px', background: '#f1f5f9', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#bbf7d0', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '2px' }} />
                <div style={{ width: '12px', height: '12px', background: '#14532d', borderRadius: '2px' }} />
                <span>Kín</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
            <Card.Body className="p-4 d-flex flex-column">
              <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '20px' }}>Đánh giá gần đây</h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'Lê Minh', avatar: '12', rating: 5, text: '"Sân đẹp, mát về đêm. Nhân viên phục vụ rất nhiệt tình..."' },
                  { name: 'Quốc Bảo', avatar: '33', rating: 4, text: '"Ánh sáng ban đêm hơi yếu một chút nhưng nhìn chung ok."' },
                  { name: 'Thanh Trúc', avatar: '44', rating: 5, text: '"Giá cả hợp lý, khu vực vệ sinh sạch sẽ. Sẽ quay lại."' },
                ].map((review, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: W }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={`https://i.pravatar.cc/150?img=${review.avatar}`} alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: TX }}>{review.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: TX2, fontStyle: 'italic', lineHeight: 1.5 }}>
                      {review.text}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
