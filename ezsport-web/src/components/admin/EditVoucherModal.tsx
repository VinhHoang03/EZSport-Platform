import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import type { Voucher } from '../../services/voucher.service';

interface EditVoucherModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (voucherId: string, voucherData: Partial<VoucherFormData>) => void;
  voucher: Voucher | null;
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

export const EditVoucherModal: React.FC<EditVoucherModalProps> = ({ 
  show, 
  onHide, 
  onSubmit, 
  voucher 
}) => {
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

  // Load voucher data when modal opens
  useEffect(() => {
    if (voucher) {
      setFormData({
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        minOrderValue: voucher.minOrderValue,
        pointCost: voucher.pointCost,
        quantity: voucher.quantity,
        target: voucher.target,
        expiresAt: voucher.expiresAt ? new Date(voucher.expiresAt).toISOString().split('T')[0] : '',
        active: voucher.active,
      });
    }
  }, [voucher]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    
    if (!validateForm() || !voucher) {
      return;
    }

    const submitData = {
      value: formData.value,
      maxDiscount: formData.maxDiscount,
      minOrderValue: formData.minOrderValue,
      pointCost: formData.pointCost,
      quantity: formData.quantity,
      target: formData.target,
      expiresAt: formData.expiresAt || undefined,
      active: formData.active,
    };

    onSubmit(voucher._id, submitData);
    onHide();
  };

  const handleChange = (field: keyof VoucherFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!voucher) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <div>
          <Modal.Title style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Chỉnh sửa voucher
          </Modal.Title>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Cập nhật thông tin mã giảm giá <strong>{voucher.code}</strong>
          </p>
        </div>
      </Modal.Header>

      <Modal.Body style={{ padding: '24px' }}>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Voucher Code - Read Only */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Mã voucher
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.code}
                  disabled
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    background: '#f1f5f9',
                    cursor: 'not-allowed'
                  }}
                />
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Mã voucher không thể thay đổi
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Voucher Type - Read Only */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Loại khuyến mãi
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.type === 'fixed' ? 'Giảm giá trực tiếp (VNĐ)' : 'Giảm theo phần trăm (%)'}
                  disabled
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    cursor: 'not-allowed'
                  }}
                />
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Loại voucher không thể thay đổi
                </Form.Text>
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
                <Form.Text style={{ fontSize: '11px', color: '#64748b' }}>
                  Đã sử dụng: {voucher.usedCount} / {voucher.quantity}
                </Form.Text>
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
              </Form.Group>
            </Col>

            {/* Active Status */}
            <Col xs={12}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  id="voucher-active-edit"
                  label="Kích hoạt voucher"
                  checked={formData.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                />
                <Form.Text style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  {formData.active ? 'Voucher đang hoạt động' : 'Voucher đã tạm dừng'}
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Preview Summary */}
            <Col xs={12}>
              <div style={{ 
                background: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                borderRadius: '12px', 
                padding: '16px',
                marginTop: '8px'
              }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#1e40af' }}>info</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>Xem trước thay đổi</span>
                </div>
                <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6' }}>
                  <strong>{formData.code}</strong> - 
                  {formData.type === 'fixed' 
                    ? ` Giảm ${formData.value.toLocaleString('vi-VN')}đ` 
                    : ` Giảm ${formData.value}%${formData.maxDiscount ? ` (tối đa ${formData.maxDiscount.toLocaleString('vi-VN')}đ)` : ''}`}
                  {formData.minOrderValue > 0 && ` cho đơn từ ${formData.minOrderValue.toLocaleString('vi-VN')}đ`}
                  {formData.pointCost > 0 && ` • Đổi ${formData.pointCost} điểm`}
                  {` • Còn lại: ${formData.quantity - voucher.usedCount}`}
                  {formData.expiresAt && ` • Hết hạn: ${new Date(formData.expiresAt).toLocaleDateString('vi-VN')}`}
                  {` • Trạng thái: ${formData.active ? 'Đang hoạt động' : 'Tạm dừng'}`}
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <Button
          variant="light"
          onClick={onHide}
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
            background: '#1e40af', 
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          Lưu thay đổi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
