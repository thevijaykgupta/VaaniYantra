import { createContext, useContext, useState, useEffect } from "react";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState({
    status: 'disconnected', // 'connected' | 'disconnected' | 'reconnecting' | 'demo'
    backend: false,
    websocket: false,
    audio: false,
    latency: 0
  });
  const [demoMode, setDemoMode] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [activeView, setActiveView] = useState("LIVE");
  const [sessionName, setSessionName] = useState("Classroom Lecture – DSP");
  const [currentSubject, setCurrentSubject] = useState("Digital Signal Processing");
  const [availableSubjects, setAvailableSubjects] = useState([
    "Digital Signal Processing",
    "Data Structures",
    "Analog Communication",
    "Machine Learning",
    "Control Systems"
  ]);
  const [targetLanguages, setTargetLanguages] = useState(['hi', 'ta']);
  const [transcriptionData, setTranscriptionData] = useState([]);
  const [error, setError] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Auto-enable demo mode for first-time users
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const onboardingComplete = localStorage.getItem("onboardingComplete") === "true";

    if (!storedUser) {
      // New user - enable demo mode
      setDemoMode(true);
      setConnectionStatus('DEMO');
    } else {
      // Returning user - disable demo mode
      setUser(JSON.parse(storedUser));
      setDemoMode(false);
      setConnectionStatus('CONNECTED');
    }
  }, []);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1025;
      setSidebarOpen(isDesktop);
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // Check if this is a first-time user
    const hasSeenDemo = localStorage.getItem("hasSeenDemo") === "true";
    if (!hasSeenDemo) {
      setDemoMode(true); // Enable demo for first-time users
      localStorage.setItem("hasSeenDemo", "true");
    } else {
      setDemoMode(false); // Disable demo for returning users
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("profileComplete");
    setDemoMode(true); // Re-enable demo for logged out users
    setActiveView("LIVE");
  };

  const completeProfile = () => {
    localStorage.setItem("profileComplete", "true");
    setDemoMode(false);
  };

  const addTranscriptionLine = (line) => {
    setTranscriptionData(prev => [...prev, line]);
  };

  const clearTranscription = () => {
    setTranscriptionData([]);
  };

  const setConnectionStatus = (status) => {
    switch (status) {
      case 'CONNECTED':
        setConnectionState({
          status: 'connected',
          backend: true,
          websocket: true,
          audio: true,
          latency: 210
        });
        setError(null);
        addToast('Connected to server', 'success');
        break;
      case 'RECONNECTING':
        setConnectionState(prev => ({
          ...prev,
          status: 'reconnecting',
          websocket: false
        }));
        addToast('Reconnecting...', 'warning');
        break;
      case 'DISCONNECTED':
        setConnectionState({
          status: 'disconnected',
          backend: false,
          websocket: false,
          audio: false,
          latency: 0
        });
        addToast('Connection lost', 'error');
        break;
      case 'DEMO':
        setConnectionState({
          status: 'demo',
          backend: true,
          websocket: true,
          audio: true,
          latency: 0
        });
        break;
      default:
        break;
    }
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <AppStateContext.Provider value={{
      // State
      connectionState,
      demoMode,
      user,
      sidebarOpen,
      activeView,
      sessionName,
      currentSubject,
      transcriptionData,
      error,

      // Actions
      setDemoMode,
      setSidebarOpen,
      setActiveView,
      setSessionName,
      setCurrentSubject,
      availableSubjects,
      setAvailableSubjects,
      setError,
      setMicPermission,
      setOfflineMode,
      toasts,
      addToast,
      removeToast,
      loginUser,
      logoutUser,
      completeProfile,
      addTranscriptionLine,
      clearTranscription,
      setConnectionStatus,
      targetLanguages,
      setTargetLanguages
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
