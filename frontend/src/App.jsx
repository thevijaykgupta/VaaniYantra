import React, { useEffect } from "react";
import Header from "./components/Header/Header.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Chakra from "./components/Chakra/Chakra.jsx";
import OriginalTranscription from "./components/Transcription/OriginalTranscription.jsx";
import LiveTranslation from "./components/Transcription/LiveTranslation.jsx";
import StatusFooter from "./components/Status/StatusFooter.jsx";
import TranslationSettings from "./components/views/TranslationSettings.jsx";
import SpeakerDiarization from "./components/views/SpeakerDiarization.jsx";
import TranscriptHistory from "./components/views/TranscriptHistory.jsx";
import AppAnalytics from "./components/views/AppAnalytics.jsx";
import OfflineMode from "./components/views/OfflineMode.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import ProfileSetup from "./components/auth/ProfileSetup.jsx";
import OnboardingModal from "./components/auth/OnboardingModal.jsx";
import Toast from "./components/common/Toast.jsx";
import RightSidebar from "./components/RightSidebar/RightSidebar.jsx";
import { useAppState } from "./context/AppStateContext.jsx";
import CenterStage from "./components/CenterStage/CenterStage.jsx";
import { connectAudioSocket } from "./services/audioSocket.js";

function App() {

  // WebSocket connection is now handled in AppStateContext
  // useEffect(() => {
  // connectAudioSocket("classroom_1");
  // },[]);

  const {
    demoMode,
    user,
    sidebarOpen,
    activeView,
    sessionName,
    currentSubject,
    transcriptionData,
    toasts,
    removeToast,
    setActiveView,
    setSidebarOpen,
    loginUser,
    logoutUser
  } = useAppState();

  // Auto-manage sidebar visibility based on active view
  React.useEffect(() => {
    // Keep sidebar open for main content views, close for utility views
    const shouldKeepOpen = ['LIVE', 'TRANSCRIPT', 'HISTORY'].includes(activeView);
    if (sidebarOpen !== shouldKeepOpen) {
      setSidebarOpen(shouldKeepOpen);
    }
  }, [activeView, setSidebarOpen]);

  // Show auth modal for authentication (not for demo users)
  const [showAuth, setShowAuth] = React.useState(false);

  // Right sidebar state
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(false);

  // Show auth modal when requested
  if (showAuth) {
    return <AuthModal onClose={() => setShowAuth(false)} onAuth={loginUser} />;
  }

  // Show onboarding for first-time users (user exists but onboarding not complete)
  const onboardingComplete = localStorage.getItem("onboardingComplete") === "true";
  if (user && !onboardingComplete) {
    return <OnboardingModal onComplete={() => {
      localStorage.setItem("onboardingComplete", "true");
      window.location.reload(); // Refresh to load complete profile
    }} />;
  }

const renderMainContent = () => {
  switch (activeView) {
    case "LIVE":
      return <CenterStage />;

    case "SETTINGS":
      return (
        <div className="main-content-flex">
          <section className="processing-area">
            <Chakra />
          </section>
          <TranslationSettings />
        </div>
      );

    case "DIARIZATION":
      return <SpeakerDiarization transcriptionData={demoMode ? [] : transcriptionData} />;

    case "OFFLINE":
      return <OfflineMode />;

    case "HISTORY":
      return <TranscriptHistory />;

    case "ANALYTICS":
      return <AppAnalytics />;

    case "TRANSCRIPT":
      return (
        <div className="main-content-flex">
          <section className="processing-area">
            <Chakra />
          </section>
          <div className="transcript-view">
            <div className="transcript-header">
              <h2>Current Session Transcript</h2>
              <div className="transcript-info">
                <span className="session-title">{sessionName}</span>
                <span className="subject-tag">{currentSubject}</span>
              </div>
            </div>

            <div className="transcript-content">
              {transcriptionData.length > 0 ? (
                transcriptionData.map((item, index) => (
                  <div key={index} className="transcript-item">
                    <div className="speaker-info">
                      <span className="speaker">{item.speaker || 'Speaker'}</span>
                      <span className="timestamp">{item.timestamp || new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="transcript-text">
                      <p className="original">{item.text}</p>
                      {item.translation && (
                        <p className="translation">{item.translation}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No transcript yet</h3>
                  <p>Start a live transcription to see your session content here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "PROFILE":
      return (
        <div className="main-content-flex">
          <section className="processing-area">
            <Chakra />
          </section>
          <div className="profile-view">
            <div className="profile-header">
              <h2>My Profile</h2>
            </div>

            <div className="profile-content">
              <div className="profile-card">
                <div className="profile-avatar-large">
                  <img
                    src={user?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                    alt="Profile"
                    className="avatar-img"
                  />
                </div>

                <div className="profile-details">
                  <div className="detail-group">
                    <label>Name</label>
                    <span>{user?.name || "User"}</span>
                  </div>

                  <div className="detail-group">
                    <label>Email</label>
                    <span>{user?.email || "demo@vaaniyantra.ai"}</span>
                  </div>

                  <div className="detail-group">
                    <label>Account Type</label>
                    <span>Premium User</span>
                  </div>

                  <div className="detail-group">
                    <label>Member Since</label>
                    <span>January 2025</span>
                  </div>
                </div>

                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-number">42</span>
                    <span className="stat-label">Sessions</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">1.2K</span>
                    <span className="stat-label">Minutes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">5</span>
                    <span className="stat-label">Languages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

  return (
  <div className="app-root">

    {/* SIDEBAR */}
    <Sidebar
      sidebarOpen={sidebarOpen}
      activeView={activeView}
      onViewChange={setActiveView}
      toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    />


    {/* MAIN AREA */}
    {/* <div className={`app-main ${sidebarOpen ? "with-sidebar" : "full"}`}> */}
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* TOP HEADER */}
      <Header
        user={user}
        onShowAuth={() => setShowAuth(true)}
        onLogout={logoutUser}
      />
      {
        renderMainContent()
      }

      {/* BOTTOM BAR */}
      <StatusFooter />
      {/* RIGHT SIDEBAR */}
      <RightSidebar
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
      />

      {/* TOASTS */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
    </div>
  </div>
);
}

export default App;