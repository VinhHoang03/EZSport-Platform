import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import jsQR from 'jsqr';

// ─── VietQR BIN → Tên ngân hàng ─────────────────────────────────────────────
const BIN_TO_BANK: Record<string, string> = {
  '970436': 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  '970422': 'Ngân hàng TMCP Quân đội (MB Bank)',
  '970407': 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
  '970418': 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
  '970415': 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)',
  '970416': 'Ngân hàng TMCP Á Châu (ACB)',
  '970403': 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)',
  '970432': 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)',
  '970423': 'Ngân hàng TMCP Tiên Phong (TPBank)',
  '970426': 'Ngân hàng TMCP Hàng Hải Việt Nam (MSB)',
  '970441': 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)',
  '970443': 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)',
  '970448': 'Ngân hàng TMCP Đông Nam Á (SeABank)',
  '970454': 'Ngân hàng TMCP Bưu điện Liên Việt (LPBank)',
  '970462': 'Ngân hàng TMCP Bản Việt (VietCapitalBank)',
  '970400': 'Ngân hàng Nông nghiệp và PTNT Việt Nam (Agribank)',
  '970406': 'Ngân hàng TMCP Đông Á (DongABank)',
  '970430': 'Ngân hàng TMCP Phương Đông (OCB)',
  '970449': 'Ngân hàng TMCP Lộc Phát (LPBank)',
  '970440': 'Ngân hàng TMCP Sài Gòn (SCB)',
  '970412': 'Ngân hàng TMCP Kỹ Thương (Baoviet Bank)',
};

// ─── Parse EMVCo TLV format ────────────────────────────────────────────────
function parseTLV(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  let i = 0;
  while (i < data.length - 3) {
    const tag = data.substring(i, i + 2);
    const lenStr = data.substring(i + 2, i + 4);
    const len = parseInt(lenStr, 10);
    if (isNaN(len) || i + 4 + len > data.length) break;
    const value = data.substring(i + 4, i + 4 + len);
    result[tag] = value;
    i += 4 + len;
  }
  return result;
}

// ─── Trích xuất thông tin ngân hàng từ chuỗi QR VietQR ───────────────────────
function parseVietQR(rawData: string): { bankName: string; accountNumber: string } | null {
  try {
    const tlv = parseTLV(rawData);

    // Tag 38 hoặc 26: merchant account info
    const merchantInfo = tlv['38'] || tlv['26'];
    if (!merchantInfo) return null;

    const sub = parseTLV(merchantInfo);
    // Sub-tag 01: account/merchant ID (chứa BIN + số tài khoản)
    const merchantId = sub['01'];
    if (!merchantId) return null;

    // Cấu trúc: XXXXXX (6 ký tự BIN) + số tài khoản
    // Ví dụ: "0006970436011379732060400" → BIN 970436, STK 1379732060400
    // Thực tế tag 01 có thể bắt đầu bằng "000" prefix rồi BIN 6 số
    // VietQR: merchantId thường là: "0006" + BIN(6) + "01" + STK
    let bin = '';
    let accountNumber = '';

    // Thử parse cấu trúc sub-sub TLV bên trong merchantId
    const subSub = parseTLV(merchantId);
    if (Object.keys(subSub).length > 0) {
      // sub-sub '00' thường là GUID, '01' là account
      accountNumber = subSub['01'] || '';
      // Tìm BIN trong GUID '00'
      const guid = subSub['00'] || '';
      const binMatch = guid.match(/(\d{6})/);
      if (binMatch) bin = binMatch[1];
    } else {
      // Fallback: tìm BIN trực tiếp trong merchantId
      const knownBins = Object.keys(BIN_TO_BANK);
      for (const b of knownBins) {
        const idx = merchantId.indexOf(b);
        if (idx !== -1) {
          bin = b;
          // Số tài khoản nằm sau BIN
          accountNumber = merchantId.substring(idx + 6).replace(/\D/g, '');
          break;
        }
      }
    }

    if (!bin && !accountNumber) return null;

    return {
      bankName: BIN_TO_BANK[bin] || '',
      accountNumber: accountNumber.replace(/\D/g, ''),
    };
  } catch {
    return null;
  }
}

// ─── Đọc QR từ ảnh bằng jsQR ─────────────────────────────────────────────────
async function readQRFromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      resolve(code ? code.data : null);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export const OwnerPaymentConfig: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [bankName, setBankName] = useState(user?.bankName || '');
  const [customBankName, setCustomBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState(user?.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(user?.bankAccountName || '');

  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string>(user?.bankQrCode || '');
  const [qrScanMsg, setQrScanMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const bankList = [
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
    'Ngân hàng Nông nghiệp và PTNT Việt Nam (Agribank)',
    'Ngân hàng TMCP Đông Nam Á (SeABank)',
    'Ngân hàng TMCP Phương Đông (OCB)',
    'Khác...',
  ];

  // Sync state nếu user context thay đổi
  useEffect(() => {
    if (user) {
      if (!bankName && user.bankName) setBankName(user.bankName);
      if (!bankAccountName && user.bankAccountName) setBankAccountName(user.bankAccountName);
      if (!bankAccountNumber && user.bankAccountNumber) setBankAccountNumber(user.bankAccountNumber);
      if (!qrCodePreview && user.bankQrCode) setQrCodePreview(user.bankQrCode);
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setQrCodeFile(file);
    setQrCodePreview(URL.createObjectURL(file));
    setQrScanMsg(null);

    // ── Tự động quét QR ──────────────────────────────
    setQrScanMsg({ type: 'info', text: '🔍 Đang phân tích mã QR...' });
    const rawData = await readQRFromImage(file);

    if (!rawData) {
      setQrScanMsg({ type: 'warning', text: '⚠️ Không đọc được mã QR từ ảnh. Vui lòng điền thông tin thủ công.' });
      return;
    }

    const parsed = parseVietQR(rawData);
    if (!parsed) {
      setQrScanMsg({ type: 'warning', text: '⚠️ Đã đọc QR nhưng không nhận diện được định dạng VietQR. Vui lòng điền thủ công.' });
      return;
    }

    let filledFields: string[] = [];

    if (parsed.accountNumber) {
      setBankAccountNumber(parsed.accountNumber);
      filledFields.push('Số tài khoản');
    }

    if (parsed.bankName) {
      setBankName(parsed.bankName);
      filledFields.push('Ngân hàng');
    }

    if (filledFields.length > 0) {
      setQrScanMsg({
        type: 'success',
        text: `✅ Tự động nhận diện: ${filledFields.join(', ')}. Vui lòng kiểm tra lại trước khi lưu.`,
      });
    } else {
      setQrScanMsg({ type: 'warning', text: '⚠️ Đã đọc QR nhưng không trích xuất được thông tin. Vui lòng điền thủ công.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      const finalBankName = bankName === 'Khác...' ? customBankName : bankName;
      formData.append('bankName', finalBankName);
      formData.append('bankAccountName', bankAccountName);
      formData.append('bankAccountNumber', bankAccountNumber);
      if (qrCodeFile) {
        formData.append('bankQrCode', qrCodeFile);
      }

      const res = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.data) {
        updateUser(res.data.data);
        setMessage({ type: 'success', text: '🎉 Cấu hình thông tin nhận tiền thành công!' });
        if (res.data.data.bankQrCode) {
          setQrCodePreview(res.data.data.bankQrCode);
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'danger', text: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-4">
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Cấu hình nhận tiền</h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
          Thiết lập tài khoản ngân hàng và mã QR để Admin thực hiện đối soát và thanh toán doanh thu của bạn.
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type} d-flex align-items-center gap-2 mb-4`} role="alert" style={{ borderRadius: '12px' }}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          <div>{message.text}</div>
        </div>
      )}

      <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              {/* Left: Bank details */}
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
                    {bankList.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </Form.Select>
                  {bankName === 'Khác...' && (
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên ngân hàng..."
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
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
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    Tên chủ tài khoản <span style={{ fontWeight: 400, color: '#94a3b8' }}>(viết hoa không dấu)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                    style={{ borderRadius: '8px', padding: '10px 14px', fontSize: '14px', border: '1px solid #cbd5e1' }}
                    required
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                    Nhập chính xác tên ghi trên thẻ ngân hàng của bạn.
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Right: QR Code */}
              <Col md={5}>
                <Form.Group className="d-flex flex-column h-100">
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    Mã QR thanh toán
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        background: '#e0f2fe', color: '#0369a1', borderRadius: '6px',
                        fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                        marginLeft: '8px', verticalAlign: 'middle'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>auto_awesome</span>
                      Tự động nhận diện
                    </span>
                  </Form.Label>

                  {/* QR scan result message */}
                  {qrScanMsg && (
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        background: qrScanMsg.type === 'success' ? '#f0fdf4' : qrScanMsg.type === 'warning' ? '#fffbeb' : '#f0f9ff',
                        color: qrScanMsg.type === 'success' ? '#15803d' : qrScanMsg.type === 'warning' ? '#b45309' : '#0369a1',
                        border: `1px solid ${qrScanMsg.type === 'success' ? '#bbf7d0' : qrScanMsg.type === 'warning' ? '#fde68a' : '#bae6fd'}`,
                      }}
                    >
                      {qrScanMsg.text}
                    </div>
                  )}

                  <div
                    style={{
                      flex: 1,
                      minHeight: '200px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      marginBottom: '12px',
                    }}
                  >
                    {qrCodePreview ? (
                      <img
                        src={qrCodePreview}
                        alt="QR Code Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="text-center p-3 text-secondary">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>qr_code_2</span>
                        <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: 600, color: '#94a3b8' }}>Chưa có hình ảnh mã QR</div>
                        <div style={{ fontSize: '11px', marginTop: '4px', color: '#cbd5e1' }}>
                          Upload ảnh QR VietQR sẽ tự điền STK & ngân hàng
                        </div>
                      </div>
                    )}
                  </div>

                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="owner-bank-qr-upload"
                  />
                  <label
                    htmlFor="owner-bank-qr-upload"
                    className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: '8px', fontSize: '13px', fontWeight: 700, padding: '10px 0', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                    {qrCodePreview ? 'Thay đổi mã QR' : 'Tải lên mã QR'}
                  </label>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Button
                type="submit"
                disabled={submitting}
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
                  gap: '8px',
                }}
              >
                {submitting && <Spinner size="sm" animation="border" />}
                Lưu cấu hình nhận tiền
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OwnerPaymentConfig;
