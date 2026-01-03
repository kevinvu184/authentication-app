import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Welcome to Auth App
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          A minimal authentication application with secure user management.
        </p>
        
        {user ? (
          <div>
            <p style={{ marginBottom: '1rem' }}>
              Hello, {user.firstName}! You are successfully signed in.
            </p>
            <Link
              to="/profile"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '1.1rem',
              }}
            >
              View Profile
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '2rem' }}>
              Get started by creating an account or signing in.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link
                to="/signup"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '1.1rem',
                }}
              >
                Sign Up
              </Link>
              <Link
                to="/signin"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '1.1rem',
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Features</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>Secure user registration and authentication</li>
          <li>JWT-based session management</li>
          <li>Protected profile pages</li>
          <li>Profile editing capabilities</li>
          <li>Responsive design</li>
          <li>Persistent login sessions</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        backgroundColor: '#e9ecef', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Technology Stack</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <strong>Backend:</strong>
            <ul>
              <li>Go Lambda Functions</li>
              <li>AWS API Gateway</li>
              <li>DynamoDB</li>
              <li>JWT Authentication</li>
            </ul>
          </div>
          <div>
            <strong>Frontend:</strong>
            <ul>
              <li>React with TypeScript</li>
              <li>React Router</li>
              <li>Context API</li>
              <li>Local Storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;