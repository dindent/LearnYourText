import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token } = res.data;
      login(token); // Use context to set auth state
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed';
      setError(errorMsg);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginPage;
