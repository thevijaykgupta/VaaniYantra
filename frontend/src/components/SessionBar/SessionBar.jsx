import SubjectSelector from "./SubjectSelector.jsx";
import { useAppState } from "../../context/AppStateContext.jsx";
import "./SessionBar.css";

export default function SessionBar() {
  const {
    activeView,
    connectionState,
    transcriptionData,
    setActiveView
  } = useAppState();

  // Auto-hide sidebar based on current view
  const shouldShowSidebar = activeView === "LIVE" || activeView === "TRANSCRIPT";

  // Get current status based on view and connection
  const getStatusInfo = () => {
    switch (activeView) {
      case "LIVE":
        return {
          status: connectionState.status === 'connected' ? "Live" : "Disconnected",
          latency: connectionState.latency ? `${connectionState.latency}ms` : "--",
          isLive: connectionState.status === 'connected'
        };
      case "TRANSCRIPT":
        return {
          status: "Review",
          latency: "--",
          isLive: false
        };
      case "HISTORY":
        return {
          status: "History",
          latency: "--",
          isLive: false
        };
      case "SETTINGS":
        return {
          status: "Settings",
          latency: "--",
          isLive: false
        };
      case "PROFILE":
        return {
          status: "Profile",
          latency: "--",
          isLive: false
        };
      default:
        return {
          status: "Ready",
          latency: "--",
          isLive: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="session-bar">

      {/* SUBJECT SELECTOR */}
      <SubjectSelector />

      {/* LANGUAGE DIRECTION */}
      <div className="session-lang">
        English <span className="arrow">→</span> Hindi
      </div>

      {/* STATUS BASED ON CURRENT VIEW */}
      <div className="session-live">
        <span className={`live-dot ${statusInfo.isLive ? 'active' : ''}`} />
        {statusInfo.status}
      </div>

      {/* LATENCY - ONLY SHOW WHEN LIVE */}
      {activeView === "LIVE" && (
        <div className="session-latency">
          {statusInfo.latency}
        </div>
      )}

      {/* TRANSCRIPT COUNT - SHOW WHEN AVAILABLE */}
      {transcriptionData.length > 0 && (
        <div className="session-count">
          {transcriptionData.length} segments
        </div>
      )}

    </div>
  );
}