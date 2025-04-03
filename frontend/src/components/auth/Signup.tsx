import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import authService from '../../services/authService';

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [signupError, setSignupError] = useState<string>('');
  const navigate = useNavigate();

  const initialValues: SignupFormValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values: SignupFormValues) => {
    try {
      setSignupError('');
      const { confirmPassword, ...userData } = values;
      const authResponse = await authService.register(userData);
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      navigate('/dashboard');
    } catch (error: any) {
      setSignupError(error.response?.data?.message || 'An error occurred during signup');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create a New Account</h2>
      {signupError && <div className="auth-error">{signupError}</div>}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <Field
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter your name"
            />
            <ErrorMessage name="name" component="div" className="error-message" />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Field
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm your password"
            />
            <ErrorMessage name="confirmPassword" component="div" className="error-message" />
          </div>

          <button type="submit" className="auth-button">
            Sign Up
          </button>
          
          <div className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default Signup; 