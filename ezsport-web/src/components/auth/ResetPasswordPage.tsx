import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ROUTES } from '../../constants';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token!, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <h4 className="fw-black text-success mb-1">EZSport</h4>
          <p className="text-muted small mb-0">{success ? 'Password updated' : 'Set a new password'}</p>
        </div>

        {success ? (
          <div className="text-center py-3">
            <span className="material-symbols-outlined text-success" style={{ fontSize: 48 }}>check_circle</span>
            <h6 className="fw-bold mt-3">Password reset successful</h6>
            <p className="small text-muted">You can now login with your new password.</p>
            <Button variant="success" className="px-4 rounded-3" onClick={() => navigate(ROUTES.LOGIN)}>
              Go to Login
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">New Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-light border-0 py-2 shadow-none pe-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y text-muted p-2 shadow-none d-flex align-items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined fs-5">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted">Confirm Password</Form.Label>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="bg-light border-0 py-2 shadow-none"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              className="w-100 py-2 fw-bold rounded-3 shadow-sm border-0"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
