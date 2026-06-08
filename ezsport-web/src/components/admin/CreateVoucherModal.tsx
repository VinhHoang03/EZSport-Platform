import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

interface CreateVoucherModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (voucherData: VoucherFormData) => void;
}

export interface VoucherFormData {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  pointCost: number;
  quantity: number;
  target: string;
  expiresAt?: string;
  active: boolean;
}

export const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({ show, onHide, onSubmit }) => {
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    type: 'fixed',
    value: 0,
    maxDiscount: undefined,
    minOrderValue: 0,
    pointCost: 0,
    quantity: 100,
    target: 'Tất cả người dùng',
    expiresAt: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã voucher';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Mã voucher chỉ được chứa chữ in hoa và số';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Giá trị giảm phải lớn hơn 0';
    }

    if (formData.type === 'percent' && formData.value > 100) {
      newErrors.value = 'Phần trăm giảm không được vượt quá 100%';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }

    if (formData.minOrderValue < 0) {
      newErrors.minOrderValue = 'Giá trị đơn tối thiểu không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert code to uppercase before submit
    const submitData = {
      ...formData,
      code: formData.code.toUpperCase(),
      expiresAt: formData.expiresAt || undefined,
    };

    onSubmit(submitData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      code: '',
      type: 'fixed',
      value: 0,
      maxDiscount: undefined,
      minOrderValue: 0,
      pointCost: 0,
      quantity: 100,
      target: 'Tất cả người dùng',
      expiresAt: '',
      active: true,
    });
    setErrors({});
  };

  const handleChange = (field: keyof VoucherFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <div>
          <Modal.Title style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Tạo mã voucher mới
          </Modal.Title>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Tạo mã giảm giá cho người dùng trên hệ thống
          </p>
        </div>
      </Modal.Header>

      <Modal.Body style={{ padding: '24px' }}>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Voucher Code */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Mã voucher <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: EZSPORT50"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  isInvalid={!!errors.code}
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}
                />
                <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Chỉ chữ IN HOA và số, không dấu, không khoảng trắng
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Voucher Type */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Loại khuyến mãi <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as 'fixed' | 'percent')}
                  style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                >
                  <option value="fixed">Giảm giá trực tiếp (VNĐ)</option>
                  <option value="percent">Giảm theo phần trăm (%)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Discount Value */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  {formData.type === 'fixed' ? 'Số tiền giảm' : 'Phần trăm giảm'} <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="0"
                    max={formData.type === 'percent' ? 100 : undefined}
                    placeholder={formData.type === 'fixed' ? 'VD: 50000' : 'VD: 10'}
                    value={formData.value || ''}
                    onChange={(e) => handleChange('value', parseInt(e.target.value) || 0)}
                    isInvalid={!!errors.value}
                    style={{ borderRadius: '8px 0 0 8px', fontSize: '14px', fontWeight: 600 }}
                  />
                  <InputGroup.Text style={{ 
                    background: '#f1f5f9', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '0 8px 8px 0',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    {formData.type === 'fixed' ? 'VNĐ' : '%'}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">{errors.value}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* Max Discount (only for percent type) */}
            {formData.type === 'percent' && (
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Giảm tối đa
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="VD: 100000"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => handleChange('maxDiscount', parseInt(e.target.value) || undefined)}
                      style={{ borderRadius: '8px 0 0 8px', fontSize: '14px', fontWeight: 600 }}
                    />
                    <InputGroup.Text style={{ 
                      background: '#f1f5f9', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '0 8px 8px 0',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>
                      VNĐ
                    </InputGroup.Text>
                  </InputGroup>
                  <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                    Để trống nếu không giới hạn
                  </Form.Text>
                </Form.Group>
              </Col>
            )}

            {/* Min Order Value */}
            <Col xs={12} md={formData.type === 'fixed' ? 6 : 12}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Giá trị đơn tối thiểu
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="VD: 200000"
                    value={formData.minOrderValue || ''}
                    onChange={(e) => handleChange('minOrderValue', parseInt(e.target.value) || 0)}
                    isInvalid={!!errors.minOrderValue}
                    style={{ borderRadius: '8px 0 0 8px', fontSize: '14px', fontWeight: 600 }}
                  />
                  <InputGroup.Text style={{ 
                    background: '#f1f5f9', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '0 8px 8px 0',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    VNĐ
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">{errors.minOrderValue}</Form.Control.Feedback>
                </InputGroup>
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Để 0 nếu không có yêu cầu tối thiểu
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Quantity */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Số lượng <span style={{ color: '#ef4444' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  placeholder="VD: 100"
                  value={formData.quantity || ''}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  isInvalid={!!errors.quantity}
                  style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
                <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Point Cost */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Điểm đổi voucher
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="VD: 500"
                    value={formData.pointCost || ''}
                    onChange={(e) => handleChange('pointCost', parseInt(e.target.value) || 0)}
                    style={{ borderRadius: '8px 0 0 8px', fontSize: '14px', fontWeight: 600 }}
                  />
                  <InputGroup.Text style={{ 
                    background: '#f1f5f9', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '0 8px 8px 0',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    điểm
                  </InputGroup.Text>
                </InputGroup>
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Để 0 nếu voucher miễn phí
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Target Audience */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Đối tượng áp dụng
                </Form.Label>
                <Form.Select
                  value={formData.target}
                  onChange={(e) => handleChange('target', e.target.value)}
                  style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                >
                  <option value="Tất cả người dùng">Tất cả người dùng</option>
                  <option value="Người dùng mới">Người dùng mới</option>
                  <option value="Khách hàng thân thiết">Khách hàng thân thiết</option>
                  <option value="VIP">Thành viên VIP</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Expiry Date */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Ngày hết hạn
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleChange('expiresAt', e.target.value)}
                  style={{ borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Để trống nếu không có thời hạn
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Active Status */}
            <Col xs={12}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  id="voucher-active"
                  label="Kích hoạt voucher ngay sau khi tạo"
                  checked={formData.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                />
              </Form.Group>
            </Col>

            {/* Preview Summary */}
            <Col xs={12}>
              <div style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                borderRadius: '12px', 
                padding: '16px',
                marginTop: '8px'
              }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803d' }}>info</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803d' }}>Xem trước voucher</span>
                </div>
                <div style={{ fontSize: '13px', color: '#166534', lineHeight: '1.6' }}>
                  <strong>{formData.code || '[MÃ VOUCHER]'}</strong> - 
                  {formData.type === 'fixed' 
                    ? ` Giảm ${formData.value.toLocaleString('vi-VN')}đ` 
                    : ` Giảm ${formData.value}%${formData.maxDiscount ? ` (tối đa ${formData.maxDiscount.toLocaleString('vi-VN')}đ)` : ''}`}
                  {formData.minOrderValue > 0 && ` cho đơn từ ${formData.minOrderValue.toLocaleString('vi-VN')}đ`}
                  {formData.pointCost > 0 && ` • Đổi ${formData.pointCost} điểm`}
                  {` • Số lượng: ${formData.quantity}`}
                  {formData.expiresAt && ` • Hết hạn: ${new Date(formData.expiresAt).toLocaleDateString('vi-VN')}`}
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <Button
          variant="light"
          onClick={() => {
            handleReset();
            onHide();
          }}
          style={{ 
            borderRadius: '8px', 
            padding: '10px 20px', 
            fontSize: '14px', 
            fontWeight: 700,
            border: '1px solid #cbd5e1'
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          style={{ 
            background: '#15803d', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '10px 24px', 
            fontSize: '14px', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          Tạo voucher
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
