import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { G, TX, TX2 } from '../../../utils/theme'; // W not used
import { analyticsService, type OwnerStats, type RevenueChartData } from '../../../services/analytics.service';

interface OwnerOverviewTabProps {
  onNavigate: (menu: string) => void;
}

export const OwnerOverviewTab: React.FC<OwnerOverviewTabProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, chartData] = await Promise.all([
          analyticsService.getOwnerStats(),
          analyticsService.getRevenueChart(7),
        ]);
        setStats(statsData);
        setRevenueChart(chartData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!stats) {
    return (
      <div className="alert alert-info" role="alert">
        Không có dữ liệu thống kê
      </div>
    );
  }

  const formatVND = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString('vi-VN');
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

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
                <span style={{ display: 'inline-block', background: stats.bookingsChange >= 0 ? '#dcfce7' : '#fee2e2', color: stats.bookingsChange >= 0 ? '#15803d' : '#dc2626', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>
                  {formatChange(stats.bookingsChange)} so với tháng trước
                </span>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Tổng lượt đặt sân</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>{stats.totalBookings}</div>
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
                <div style={{ fontSize: '12px', color: stats.revenueChange >= 0 ? '#22c55e' : '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {stats.revenueChange >= 0 ? 'trending_up' : 'trending_down'}
                  </span> {formatChange(stats.revenueChange)}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Tổng doanh thu</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>{formatVND(stats.totalRevenue)}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>sports_tennis</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Tổng số sân</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>
                {stats.totalCourts}
                <span style={{ fontSize: '16px', color: TX2, fontWeight: 600, marginLeft: '8px' }}>
                  ({stats.activeCourts} hoạt động)
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef08a', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pending</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Đặt sân chờ duyệt</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>{stats.pendingBookings}</div>
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
                <div style={{ fontSize: '13px', fontWeight: 600, color: TX2 }}>
                  Tổng: {formatVND(revenueChart.reduce((sum, item) => sum + item.revenue, 0))}
                </div>
              </div>
              <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                {revenueChart.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                      {revenueChart.map((item, idx) => {
                        const maxRevenue = Math.max(...revenueChart.map(d => d.revenue));
                        const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '40px', cursor: 'pointer', zIndex: 2 }}>
                            <div style={{ width: '20px', height: '180px', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                              <div 
                                style={{ width: '100%', height: `${heightPercent}%`, background: '#22c55e', borderRadius: '3px' }}
                                title={`${item.label}: ${item.revenue.toLocaleString('vi-VN')}đ`}
                              />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: TX2, marginTop: '8px' }}>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
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
            <Card.Body className="p-4 d-flex flex-column">
              <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '20px' }}>Thống kê nhanh</h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '8px' }}>Tổng địa điểm</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: TX }}>{stats.totalVenues}</div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '8px' }}>Sân hoạt động</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e' }}>{stats.activeCourts}/{stats.totalCourts}</div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '8px' }}>Chờ xác nhận</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{stats.pendingBookings}</div>
                </div>
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

      {/* Bottom Row: Heatmap & Quick Stats */}
      <Row className="g-4">
        <Col lg={12}>
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
      </Row>
    </>
  );
};
