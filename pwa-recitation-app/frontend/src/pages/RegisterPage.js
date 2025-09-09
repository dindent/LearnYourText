import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const { name, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token } = res.data;
      login(token); // Use context to set auth state
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed';
      setError(errorMsg);
    }
  };

  return (
    <div>
      <h1>Inscription</h1>
      <form onSubmit={onSubmit}>
        <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required />
        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} minLength="6" required />
        <input type="password" placeholder="Confirm Password" name="password2" value={password2} onChange={onChange} minLength="6" required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input type="submit" value="Register" />
      </form>
    </div>
  );
};

export default RegisterPage;
