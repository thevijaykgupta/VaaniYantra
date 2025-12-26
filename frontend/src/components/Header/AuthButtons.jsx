import { useState } from 'react';

function AuthButtons({ user, onShowAuth, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (user) {
    return (
      <>
        <div
          className="profile-pill"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <img
            src={user.photo || "/assets/profile/avatar.jpg"}
            alt="Profile"
            className="profile-avatar"
          />
          <span className="profile-name">Hello, {user.name}</span>
          <span className="caret">▼</span>
        </div>

        {showUserMenu && (
          <div className="profile-dropdown">
            <button className="dropdown-item">My Profile</button>
            <button className="dropdown-item">Session History</button>
            <button className="dropdown-item">Settings</button>
            <button
              className="dropdown-item danger"
              onClick={() => {
                onLogout();
                setShowUserMenu(false);
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Overlay to close menu when clicking outside */}
        {showUserMenu && (
          <div
            className="menu-overlay"
            onClick={() => setShowUserMenu(false)}
          ></div>
        )}
      </>
    );
  }

  return (
    <div className="auth-buttons">
      <button className="auth-btn login" onClick={onShowAuth}>
        Login
      </button>
      <button className="auth-btn signup primary" onClick={onShowAuth}>
        Sign Up
      </button>
    </div>
  );
}

export default AuthButtons;
