import React from "react";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Chakra from "./components/Chakra/Chakra";
import OriginalTranscription from "./components/Transcription/OriginalTranscription";
import LiveTranslation from "./components/Transcription/LiveTranslation";
import StatusFooter from "./components/Status/StatusFooter";
import TranslationSettings from "./components/views/TranslationSettings";
import SpeakerDiarization from "./components/views/SpeakerDiarization";
import TranscriptHistory from "./components/views/TranscriptHistory";
import AppAnalytics from "./components/views/AppAnalytics";
import OfflineMode from "./components/views/OfflineMode";
import AuthModal from "./components/auth/AuthModal";
import ProfileSetup from "./components/auth/ProfileSetup";
import OnboardingModal from "./components/auth/OnboardingModal";
import SessionBar from "./components/Header/SessionBar";
import Toast from "./components/common/Toast";
import { useAppState } from "./context/AppStateContext";

function App() {
  const {
    connectionState,
    demoMode,
    user,
    sidebarOpen,
    activeView,
    sessionName,
    currentSubject,
    transcriptionData,
    toasts,
    addToast,
    removeToast,
    setSidebarOpen,
    setActiveView,
    loginUser,
    logoutUser,
    completeProfile,
    setConnectionStatus
  } = useAppState();

  // Show auth modal for authentication (not for demo users)
  const [showAuth, setShowAuth] = React.useState(false);

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
        return (
          <>
            {/* Central Processing Area - Language Processing Chakra */}
            <section className="processing-area">
              <Chakra />


              {/* Transcription Panels Overlay */}
              <section className="transcription-section overlay-panels">
                <OriginalTranscription transcriptionData={demoMode ? [] : transcriptionData} />
                <LiveTranslation transcriptionData={demoMode ? [] : transcriptionData} />
              </section>
            </section>


          </>
        );

      case "SETTINGS":
        return (
          <div className="main-content-flex">
            {/* Central Processing Area - Language Processing Chakra (scaled down) */}
            <section className="processing-area">
              <Chakra />
            </section>

            {/* Settings Panel */}
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

      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      />


      <div className={`main-content ${sidebarOpen ? 'shifted' : 'full'}`}>
        <Header
          user={user}
          onShowAuth={() => setShowAuth(true)}
          onLogout={logoutUser}
        />

        <SessionBar />

        {renderMainContent()}

        <StatusFooter />

        {/* Toast Notifications */}
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