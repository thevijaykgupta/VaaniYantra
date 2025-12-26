import { useState } from 'react';
import './Auth.css';

function AuthModal({ onClose, onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Mock authentication - in real app, this would call an API
    const user = {
      id: Date.now(),
      email: formData.email,
      name: formData.fullName || formData.email.split('@')[0],
      photo: null
    };

    localStorage.setItem('user', JSON.stringify(user));
    onAuth(user);
    onClose();
  };

  const handleGoogleAuth = () => {
    // Simulate Google OAuth flow
    const user = {
      id: Date.now(),
      email: 'user@gmail.com',
      name: 'Demo User',
      photo: 'https://lh3.googleusercontent.com/a/default-user-avatar',
      provider: 'google'
    };

    localStorage.setItem('user', JSON.stringify(user));
    onAuth(user);
    onClose();
  };

  const handleAppleAuth = () => {
    // Simulate Apple Sign-In
    const user = {
      id: Date.now(),
      email: 'user@icloud.com',
      name: 'Apple User',
      photo: '/default-avatar.png',
      provider: 'apple'
    };

    localStorage.setItem('user', JSON.stringify(user));
    onAuth(user);
    onClose();
  };

  const handleGithubAuth = () => {
    // Simulate GitHub OAuth
    const user = {
      id: Date.now(),
      email: 'user@github.com',
      name: 'GitHub User',
      photo: 'https://github.com/identicons/user.png',
      provider: 'github'
    };

    localStorage.setItem('user', JSON.stringify(user));
    onAuth(user);
    onClose();
  };

  const handleDemoAccess = () => {
    onAuth(null); // Demo mode
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <img src="/logo.png" alt="VaaniYantra" className="auth-logo" />
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to your account' : 'Join VaaniYantra'}</p>
        </div>

        <div className="auth-providers">
          <button className="auth-btn google" onClick={handleGoogleAuth}>
            Continue with Google
          </button>

          <button className="auth-btn apple" onClick={handleAppleAuth}>
            Continue with Apple
          </button>

          <button className="auth-btn github" onClick={handleGithubAuth}>
            Continue with GitHub
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <button
            type="button"
            className="demo-access"
            onClick={handleDemoAccess}
          >
            Continue with Demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
