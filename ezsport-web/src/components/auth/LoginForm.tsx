import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  onRegisterClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      authLogin(data.user, data.token);
      onSuccess();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
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

      <Form.Group className="mb-4">
        <div className="d-flex justify-content-between">
          <Form.Label className="small fw-bold text-muted">Password</Form.Label>
          <a href="#" className="small text-success text-decoration-none">Forgot?</a>
        </div>
        <div className="position-relative">
          <Form.Control 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            className="bg-light border-0 py-2 shadow-none pe-5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

      <Button 
        variant="success" 
        type="submit" 
        className="w-100 py-2 fw-bold rounded-3 shadow-sm border-0"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      <div className="text-center mt-4 pt-3 border-top border-light">
        <p className="small text-muted mb-0">
          Don't have an account?{' '}
          <span className="text-success fw-bold cursor-pointer" onClick={onRegisterClick}>
            Register Now
          </span>
        </p>
      </div>
    </Form>
  );
};

export default LoginForm;
