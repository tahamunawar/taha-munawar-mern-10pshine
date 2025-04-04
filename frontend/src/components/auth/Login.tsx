import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import authService from '../../services/authService';

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loginError, setLoginError] = useState<string>('');
  const navigate = useNavigate();

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoginError('');
      const authResponse = await authService.login(values);
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login to Your Account</h2>
      {loginError && <div className="auth-error">{loginError}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Field
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
            />
            <ErrorMessage name="email" component="div" className="error-message" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <Field
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
            />
            <ErrorMessage name="password" component="div" className="error-message" />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
          
          <div className="auth-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default Login; 