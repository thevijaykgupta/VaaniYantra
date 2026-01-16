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
import { useAppState } from "./context/AppStateContext.jsx";
import CenterStage from "./components/CenterStage/CenterStage.jsx";
import { connectAudioSocket } from "./services/audioSocket.js";

function App() {

  useEffect(() => {
  connectAudioSocket("frontend_test");
  },[]);

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
    loginUser,
    logoutUser
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