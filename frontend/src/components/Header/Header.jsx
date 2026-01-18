import { useState } from "react";
import AuthButtons from "./AuthButtons";
import LanguageSelector from "./LanguageSelector";
import "./Header.css";
import { useAppState } from "../../context/AppStateContext";

function Header({ onShowAuth, onLogout }) {
  const { user, setActiveView } = useAppState();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const goToHome = () => {
    setActiveView("LIVE");
  };

  return (
    <header className="top-header">
      {/* ================= LEFT ================= */}
      <div className="header-left">
        <div className="logo-container" onClick={goToHome} style={{cursor: 'pointer'}}>
          <img src="/logo.svg" alt="VAANIYANTRA" className="logo" />
        </div>

        <div className="brand-info" onClick={goToHome} style={{cursor: 'pointer'}}>
          <h1 className="brand-title">VAANIYANTRA</h1>
          <p className="brand-subtitle">
            Where Every Language Speaks Every Language
          </p>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="header-right">
        <LanguageSelector />

        {/* ================= AUTH ================= */}
        {!user ? (
          <AuthButtons onShowAuth={onShowAuth} />
        ) : (
          <div className="profile-wrapper">
            <div
              className="profile-pill"
              onClick={() => setShowProfileMenu(prev => !prev)}
            >
              <img
                src={user.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                alt="User"
                className="profile-avatar"
              />
              <span className="profile-name">
                Hello, {user.name || "User"}
              </span>
              <span className="caret">▼</span>
            </div>

            {showProfileMenu && (
              <>
                <div className="profile-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setActiveView("PROFILE");
                      setShowProfileMenu(false);
                    }}
                  >
                    My Profile
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setActiveView("HISTORY");
                      setShowProfileMenu(false);
                    }}
                  >
                    Session History
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setActiveView("SETTINGS");
                      setShowProfileMenu(false);
                    }}
                  >
                    Account Settings
                  </button>

                  <button
                    className="dropdown-item danger"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>

                <div
                  className="menu-overlay"
                  onClick={() => setShowProfileMenu(false)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;