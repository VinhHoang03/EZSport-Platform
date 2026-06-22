import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

export const PaymentConfigTab: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [bankAccountName, setBankAccountName] = useState(user?.bankAccountName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(user?.bankAccountNumber || '');
  
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>(user?.bankQrCode || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Popular Vietnamese banks list for dropdown
  const popularBanks = [
    'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    'Ngân hàng TMCP Quân đội (MB Bank)',
    'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
    'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
    'Ngân hàng TMCP Công thương Việt Nam (VietinBank)',
    'Ngân hàng TMCP Á Châu (ACB)',
    'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)',
    'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)',
    'Ngân hàng TMCP Tiên Phong (TPBank)',
    'Ngân hàng TMCP Hàng Hải Việt Nam (MSB)',
    'Ngân hàng TMCP Quốc tế Việt Nam (VIB)',
    'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)',
    'Khác...'
  ];

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      if (!bankName && user.bankName) setBankName(user.bankName);
      if (!bankAccountName && user.bankAccountName) setBankAccountName(user.bankAccountName);
      if (!bankAccountNumber && user.bankAccountNumber) setBankAccountNumber(user.bankAccountNumber);
      if (!qrPreview && user.bankQrCode) setQrPreview(user.bankQrCode);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('bankName', bankName);
      formData.append('bankAccountName', bankAccountName);
      formData.append('bankAccountNumber', bankAccountNumber);
      if (qrFile) {
        formData.append('bankQrCode', qrFile);
      }

      const res = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.data) {
        // Sync context state
        updateUser(res.data.data);
        setSuccessMsg('🎉 Cấu hình thông tin nhận tiền thành công!');
        if (res.data.data.bankQrCode) {
          setQrPreview(res.data.data.bankQrCode);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-4">
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cấu hình nhận tiền</h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
          Thiết lập thông tin tài khoản ngân hàng và mã QR thanh toán để Ban quản trị (Admin) thực hiện đối soát và thanh toán doanh thu của bạn.
        </p>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert" style={{ borderRadius: '12px' }}>
          <span className="material-symbols-outlined">check_circle</span>
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert" style={{ borderRadius: '12px' }}>
          <span className="material-symbols-outlined">error</span>
          <div>{errorMsg}</div>
        </div>
      )}

      <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Tên ngân hàng</Form.Label>
                  <Form.Select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px', border: '1px solid #cbd5e1' }}
                    required
                  >
                    <option value="">-- Chọn ngân hàng của bạn --</option>
                    {popularBanks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </Form.Select>
                  {bankName === 'Khác...' && (
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên ngân hàng khác..."
                      value={bankName === 'Khác...' ? '' : bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="mt-2"
                      style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px' }}
                      required
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Số tài khoản</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: 1903567890123"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Tên chủ tài khoản (viết hoa không dấu)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                    style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px', border: '1px solid #cbd5e1' }}
                    required
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                    Vui lòng nhập chính xác tên ghi trên thẻ ngân hàng của bạn.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group className="d-flex flex-column align-items-center justify-content-center h-100">
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', alignSelf: 'flex-start' }}>Mã QR thanh toán</Form.Label>
                  
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '240px', 
                      border: '2px dashed #cbd5e1', 
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      position: 'relative',
                      marginBottom: '16px'
                    }}
                  >
                    {qrPreview ? (
                      <img 
                        src={qrPreview} 
                        alt="QR Code Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="text-center p-3 text-secondary">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>qr_code_2</span>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>Chưa có hình ảnh mã QR</div>
                      </div>
                    )}
                  </div>

                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="bank-qr-upload"
                  />
                  
                  <label 
                    htmlFor="bank-qr-upload" 
                    className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 700, padding: '10px 0', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                    {qrPreview ? 'Thay đổi mã QR' : 'Tải lên mã QR'}
                  </label>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Button
                type="submit"
                disabled={loading}
                style={{
                  background: '#0f3d22',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 32px',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(15,61,34,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading && <Spinner size="sm" animation="border" />}
                Lưu cấu hình nhận tiền
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
