import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../../api/api';

interface RegisterFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onError, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, fullName, phone });
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
        <Form.Label className="small fw-bold text-muted">Full Name</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Enter your name" 
          className="bg-light border-0 py-2 shadow-none"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold text-muted">Phone Number</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Enter phone number" 
          className="bg-light border-0 py-2 shadow-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Form.Group>

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
        <Form.Label className="small fw-bold text-muted">Password</Form.Label>
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
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center mt-4 pt-3 border-top border-light">
        <p className="small text-muted mb-0">
          Already have an account?{' '}
          <span className="text-success fw-bold cursor-pointer" onClick={onLoginClick}>
            Login Here
          </span>
        </p>
      </div>
    </Form>
  );
};

export default RegisterForm;
