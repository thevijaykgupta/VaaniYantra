import { createContext, useContext, useState, useEffect } from "react";
import { connectAudioWS, disconnectAudioSocket } from "../services/audioSocket";
import { connectAudioSocket } from "../services/audioSocket";
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
  const [user, setUser] = useState({
    name:"Vijay",
    email:"demo@vaaniyantra.ai",
    photo:"https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay"
  });
  const [currentView, setCurrentView]=useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [transcripts, setTranscripts] = useState([]);
  const [error, setError] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Auto-enable demo mode for first-time users
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const onboardingComplete = localStorage.getItem("onboardingComplete") === "true";

    // Temporarily disable demo mode for testing real functionality
    setDemoMode(false);
    setConnectionStatus('CONNECTED');

    // Original logic (commented out for testing):
    // if (!storedUser) {
    //   // New user - enable demo mode
    //   setDemoMode(true);
    //   setConnectionStatus('DEMO');
    // } else {
    //   // Returning user - disable demo mode
    //   setUser(JSON.parse(storedUser));
    //   setDemoMode(false);
    //   setConnectionStatus('CONNECTED');
    // }
  }, []);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth <1024){
        setSidebarOpen(false)
      }
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

  useEffect(() => {
    const roomId = "classroom1";

    connectAudioWS(
      roomId,
      (msg) => {
        console.log("🔥 Received WebSocket message:", msg);
        if(msg.type === "transcript"){
          console.log("📝 Adding transcript:", msg.payload);
          setTranscriptionData(prev => {
            console.log("📊 Updating transcriptionData:", [...prev, msg.payload]);
            return [...prev, msg.payload];
          });

          // Also add to transcripts history
          setTranscripts(prev => {
            const exists = prev.some(t => t.id === msg.payload.id);
            if (exists) return prev;
            return [msg.payload, ...prev];
          });
        }
      },
      (status)=>{
        console.log("🔌 WebSocket status:", status);
        if (status === 'CONNECTED') {
          setConnectionState(prev => ({
            ...prev,
            backend: true,
            websocket: true,
            audio: true,
            status: 'connected'
          }));
        } else if (status === 'DISCONNECTED') {
          setConnectionState(prev => ({
            ...prev,
            websocket: false,
            audio: false,
            status: 'disconnected'
          }));
        }
      },
      // Store connection reference for potential manual reconnection
      connectAudioWS
    );

    // Cleanup function to disconnect websocket on unmount
    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      disconnectAudioSocket();
    };
  },
  []);

  // Connection status and transcript handling is now managed by the main audio WebSocket

  const getSessions = () => {
    const map = {};
    transcripts.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString();
      const key = `${t.room_id}-${date}`;
      if (!map[key]) {
        map[key] = {
          id: key,
          room_id: t.room_id,
          date,
          lastTime: t.created_at,
          count:0,
          transcripts: []
        };
      }
      map[key].count += 1;
      map[key].transcripts.push(t);
      if(new Date(t.created_at) > new Date(map[key].lastTime)){
        map[key].lastTime = t.created_at;
      }
    });
    return Object.values(map).sort((a,b) => new Date(b.lastTime) - new Date(a.lastTime));
  }
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

  const loadTranscripts = async (roomId = "classroom1") => {
    try {
      const res = await fetch('http://localhost:8000/transcripts?roomid=${roomId}');
      const data = await res.json();
      setTranscripts(data.items || []);
    }catch(err){
      console.error("Failed to load transcripts:", err);
    }
  }

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
      setUser,
      sidebarOpen,
      activeView,
      sessionName,
      currentSubject,
      currentView,
      transcriptionData,
      error,
      transcripts,
      getSessions,

      // Actions
      setTranscripts,
      setDemoMode,
      setSidebarOpen,
      setActiveView,
      setSessionName,
      setCurrentSubject,
      setCurrentView,
      setTranscriptionData,
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
      loadTranscripts,
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
