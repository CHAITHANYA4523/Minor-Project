import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
const OwnerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Add registration logic here
    try {
      const response =  axios.post('http://localhost:5000/register', formData);
      setMessage(response.data.message || 'Registration successful!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '35rem' }}>
        <h3 className="text-center mb-4">Owner Register</h3>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="empid" className="form-label">Employee ID</label>
            <input
              type="text"
              id="empid"
              name="empid"
              className="form-control"
              value={formData.empid}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">Register</button>
        </form>
        <div className="mt-3 text-center">
          <p>
            Already have an account? <a href="/ownerlogin">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerRegister;
