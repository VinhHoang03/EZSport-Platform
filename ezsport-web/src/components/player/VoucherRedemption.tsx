import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { voucherService, type Voucher, type UserVoucher } from '../../services/voucher.service';
import { G, W, TX, TX2 } from '../../utils/theme';

interface VoucherRedemptionProps {
  userPoints: number;
  onPointsUpdate: (newPoints: number) => void;
}

export const VoucherRedemption: React.FC<VoucherRedemptionProps> = ({ userPoints, onPointsUpdate }) => {
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Load vouchers
  const loadVouchers = async () => {
    try {
      setLoading(true);
      const [available, mine] = await Promise.all([
        voucherService.listAvailable(),
        voucherService.listMine(),
      ]);
      setAvailableVouchers(available);
      setMyVouchers(mine);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleRedeem = async (voucher: Voucher) => {
    if (userPoints < voucher.pointCost) {
      alert(`Bạn cần ${voucher.pointCost} điểm để đổi voucher này. Hiện tại bạn có ${userPoints} điểm.`);
      return;
    }

    const confirm = window.confirm(
      `Bạn có chắc muốn đổi voucher ${voucher.code} với ${voucher.pointCost} điểm?`
    );
    if (!confirm) return;

    try {
      setRedeeming(voucher._id);
      const { totalPoints } = await voucherService.redeem(voucher._id);
      onPointsUpdate(totalPoints);
      await loadVouchers();
      alert(`✅ Đã đổi voucher ${voucher.code} thành công! Còn ${totalPoints} điểm.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể đổi voucher');
    } finally {
      setRedeeming(null);
    }
  };

  const openDetail = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowDetailModal(true);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Không giới hạn';
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.type === 'fixed') {
      return `${voucher.value.toLocaleString('vi-VN')}đ`;
    }
    const maxText = voucher.maxDiscount ? ` (tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')}đ)` : '';
    return `${voucher.value}%${maxText}`;
  };

  return (
    <div>
      {/* Header with tabs */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 style={{ fontSize: '20px', fontWeight: 800, color: TX, marginBottom: '4px' }}>
            Kho voucher
          </h4>
          <p style={{ fontSize: '14px', color: TX2, margin: 0 }}>
            Đổi điểm lấy voucher hoặc xem voucher của bạn
          </p>
        </div>
        <Badge style={{ background: G, color: W, padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 700 }}>
          {userPoints.toLocaleString('vi-VN')} điểm
        </Badge>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        <Button
          onClick={() => setActiveTab('available')}
          style={{
            background: activeTab === 'available' ? G : 'transparent',
            color: activeTab === 'available' ? W : TX2,
            border: `1px solid ${activeTab === 'available' ? G : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Đổi voucher ({availableVouchers.length})
        </Button>
        <Button
          onClick={() => setActiveTab('mine')}
          style={{
            background: activeTab === 'mine' ? G : 'transparent',
            color: activeTab === 'mine' ? W : TX2,
            border: `1px solid ${activeTab === 'mine' ? G : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Voucher của tôi ({myVouchers.length})
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner variant="success" />
          <p style={{ color: TX2, fontSize: '14px', marginTop: '12px' }}>Đang tải voucher...</p>
        </div>
      ) : (
        <>
          {/* Available vouchers */}
          {activeTab === 'available' && (
            <Row className="g-3">
              {availableVouchers.length === 0 ? (
                <Col xs={12}>
                  <Card style={{ borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: TX2, marginBottom: '12px' }}>card_giftcard</span>
                    <p style={{ color: TX2, fontSize: '14px', margin: 0 }}>Không có voucher khả dụng</p>
                  </Card>
                </Col>
              ) : (
                availableVouchers.map(voucher => (
                  <Col md={6} lg={4} key={voucher._id}>
                    <Card
                      style={{
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        height: '100%',
                      }}
                      className="hover-lift"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Header */}
                      <div style={{ background: `linear-gradient(135deg, ${G} 0%, #0f3d22 100%)`, padding: '16px', color: W }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge style={{ background: 'rgba(255,255,255,0.2)', color: W, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>
                            {voucher.target}
                          </Badge>
                          <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                            HSD: {formatDate(voucher.expiresAt)}
                          </span>
                        </div>
                        <h5 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0', letterSpacing: '1px' }}>
                          {voucher.code}
                        </h5>
                        <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>
                          GIẢM {formatDiscount(voucher)}
                        </div>
                        {voucher.minOrderValue > 0 && (
                          <div style={{ fontSize: '12px', opacity: 0.9 }}>
                            Cho đơn từ {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div style={{ fontSize: '13px', color: TX2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>inventory</span>
                            Còn {voucher.quantity - voucher.redeemedCount} voucher
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: G }}>
                            {voucher.pointCost} điểm
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => openDetail(voucher)}
                            style={{
                              flex: 1,
                              background: 'transparent',
                              border: '1px solid #e2e8f0',
                              color: TX2,
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '13px',
                              padding: '8px',
                            }}
                          >
                            Chi tiết
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRedeem(voucher)}
                            disabled={redeeming === voucher._id || userPoints < voucher.pointCost}
                            style={{
                              flex: 1,
                              background: userPoints >= voucher.pointCost ? G : '#94a3b8',
                              border: 'none',
                              color: W,
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '13px',
                              padding: '8px',
                            }}
                          >
                            {redeeming === voucher._id ? <Spinner size="sm" /> : 'Đổi ngay'}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}

          {/* My vouchers */}
          {activeTab === 'mine' && (
            <Row className="g-3">
              {myVouchers.length === 0 ? (
                <Col xs={12}>
                  <Card style={{ borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: TX2, marginBottom: '12px' }}>receipt_long</span>
                    <p style={{ color: TX2, fontSize: '14px', margin: 0 }}>Bạn chưa có voucher nào</p>
                  </Card>
                </Col>
              ) : (
                myVouchers.map(userVoucher => {
                  const voucher = userVoucher.voucherId;
                  const isExpired = voucher.expiresAt && new Date(voucher.expiresAt) < new Date();
                  
                  return (
                    <Col md={6} lg={4} key={userVoucher._id}>
                      <Card
                        style={{
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          opacity: isExpired ? 0.6 : 1,
                          height: '100%',
                        }}
                      >
                        {/* Header */}
                        <div style={{ background: isExpired ? '#94a3b8' : `linear-gradient(135deg, ${G} 0%, #0f3d22 100%)`, padding: '16px', color: W }}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Badge style={{ 
                              background: userVoucher.status === 'used' ? '#ef4444' : 'rgba(255,255,255,0.2)', 
                              color: W, 
                              fontSize: '11px', 
                              fontWeight: 600, 
                              padding: '4px 10px', 
                              borderRadius: '6px' 
                            }}>
                              {userVoucher.status === 'used' ? 'Đã dùng' : isExpired ? 'Hết hạn' : 'Khả dụng'}
                            </Badge>
                            <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                              HSD: {formatDate(voucher.expiresAt)}
                            </span>
                          </div>
                          <h5 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0', letterSpacing: '1px' }}>
                            {voucher.code}
                          </h5>
                          <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>
                            GIẢM {formatDiscount(voucher)}
                          </div>
                          {voucher.minOrderValue > 0 && (
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                              Cho đơn từ {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <Card.Body className="p-3">
                          <Button
                            size="sm"
                            onClick={() => openDetail(voucher)}
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: '1px solid #e2e8f0',
                              color: TX2,
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '13px',
                              padding: '8px',
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 800, color: TX }}>
            Chi tiết voucher
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedVoucher && (
            <div>
              {/* Voucher code */}
              <div style={{ 
                background: `linear-gradient(135deg, ${G} 0%, #0f3d22 100%)`, 
                borderRadius: '12px', 
                padding: '20px', 
                color: W, 
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>MÃ VOUCHER</div>
                <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '2px', marginBottom: '8px' }}>
                  {selectedVoucher.code}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>
                  GIẢM {formatDiscount(selectedVoucher)}
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: '14px', color: TX }}>
                {[
                  { icon: 'label', label: 'Loại giảm giá', value: selectedVoucher.type === 'fixed' ? 'Giảm trực tiếp' : 'Giảm theo %' },
                  { icon: 'shopping_cart', label: 'Đơn tối thiểu', value: selectedVoucher.minOrderValue > 0 ? `${selectedVoucher.minOrderValue.toLocaleString('vi-VN')}đ` : 'Không giới hạn' },
                  { icon: 'stars', label: 'Điểm đổi', value: `${selectedVoucher.pointCost} điểm` },
                  { icon: 'group', label: 'Đối tượng', value: selectedVoucher.target },
                  { icon: 'event', label: 'Hết hạn', value: formatDate(selectedVoucher.expiresAt) },
                  { icon: 'inventory', label: 'Số lượng', value: `${selectedVoucher.quantity - selectedVoucher.redeemedCount} còn lại` },
                ].map(item => (
                  <div key={item.icon} className="d-flex align-items-start gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: G }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: TX2, marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontWeight: 600 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setShowDetailModal(false)}
            style={{ background: G, border: 'none', borderRadius: '8px', fontWeight: 600, padding: '10px 24px' }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
