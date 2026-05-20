import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { authService } from '../../services/auth.service';

interface ForgotPasswordFormProps {
  onLoginClick: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-3">
        <span className="material-symbols-outlined text-success" style={{ fontSize: 48 }}>mark_email_read</span>
        <h6 className="fw-bold mt-3">Check your email</h6>
        <p className="small text-muted">We sent a password reset link to <strong>{email}</strong></p>
        <Button variant="link" className="text-success text-decoration-none small fw-bold" onClick={onLoginClick}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <p className="small text-muted mb-4">Enter your email and we'll send you a reset link.</p>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <Form.Group className="mb-4">
        <Form.Label className="small fw-bold text-muted">Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="name@example.com"
          className="bg-light border-0 py-2 shadow-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Button
        variant="success"
        type="submit"
        className="w-100 py-2 fw-bold rounded-3 shadow-sm border-0"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <div className="text-center mt-4 pt-3 border-top border-light">
        <p className="small text-muted mb-0">
          Remember your password?{' '}
          <span className="text-success fw-bold cursor-pointer" onClick={onLoginClick}>
            Back to Login
          </span>
        </p>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
