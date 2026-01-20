import { useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import TranslationSettings from "../overlays/TranslationSettings";
import SpeakerDiarization from "../overlays/SpeakerDiarization";
import "./Sidebar.css";

import mic from "../../assets/sidebar/mic.svg";
import offline from "../../assets/sidebar/offline.svg";
import translate from "../../assets/sidebar/translate.svg";
import diarization from "../../assets/sidebar/diarization.svg";
import transcript from "../../assets/sidebar/transcript.svg";
import history from "../../assets/sidebar/history.svg";
import settings from "../../assets/sidebar/settings.svg";
import chevron from "../../assets/sidebar/chevron.svg";

function Sidebar({ sidebarOpen, activeView, onViewChange, toggleSidebar }) {
  const { addToast } = useAppState();

  // ALL OPEN BY DEFAULT
  const [open, setOpen] = useState({
    capture: true,
    processing: true,
    results: true,
  });

  const [showTranslationSettings, setShowTranslationSettings] = useState(false);
  const [showSpeakerDiarization, setShowSpeakerDiarization] = useState(false);

  const toggle = (key) =>
    setOpen((p) => ({ ...p, [key]: !p[key] }));

  return (
    <>
      {/* SIDEBAR TOGGLE BUTTON */}
      <button
        className={`sidebar-toggle ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        onClick={toggleSidebar}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? "←" : "→"}
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-inner">

          {/* ================= CAPTURE ================= */}
          <div className="sidebar-section">
            <div className="section-header" onClick={() => toggle("capture")}>
              <div className="section-title">
                <img src={mic} alt="" />
                <span>Capture</span>
              </div>
              <img
                src={chevron}
                className={`chevron ${open.capture ? "open" : ""}`}
                alt=""
              />
            </div>

            {open.capture && (
              <div className="section-body">
                <div
                  className={`item ${activeView === "LIVE" ? "active" : ""}`}
                  onClick={() => onViewChange("LIVE")}
                >
                  <img src={mic} alt="" />
                  <span>Live Transcription</span>
                </div>

                <div
                  className="item"
                  onClick={() => {
                    addToast("Offline mode coming soon", "info");
                    onViewChange("OFFLINE");
                  }}
                >
                  <img src={offline} alt="" />
                  <span>Offline Mode</span>
                </div>
              </div>
            )}
          </div>

          {/* ================= PROCESSING ================= */}
          <div className="sidebar-section">
            <div className="section-header" onClick={() => toggle("processing")}>
              <div className="section-title">
                <img src={settings} alt="" />
                <span>Processing</span>
              </div>
              <img
                src={chevron}
                className={`chevron ${open.processing ? "open" : ""}`}
                alt=""
              />
            </div>

            {open.processing && (
              <div className="section-body">
                <div
                  className="item"
                  onClick={() => setShowTranslationSettings(true)}
                >
                  <img src={translate} alt="" />
                  <span>Translation</span>
                </div>

                <div
                  className="item"
                  onClick={() => setShowSpeakerDiarization(true)}
                >
                  <img src={diarization} alt="" />
                  <span>Diarization</span>
                </div>
              </div>
            )}
          </div>

          {/* ================= RESULTS ================= */}
          <div className="sidebar-section">
            <div className="section-header" onClick={() => toggle("results")}>
              <div className="section-title">
                <img src={transcript} alt="" />
                <span>Results</span>
              </div>
              <img
                src={chevron}
                className={`chevron ${open.results ? "open" : ""}`}
                alt=""
              />
            </div>

            {open.results && (
              <div className="section-body">
                <div
                  className={`item ${activeView === "TRANSCRIPT" ? "active" : ""}`}
                  onClick={() => onViewChange("TRANSCRIPT")}
                >
                  <img src={transcript} alt="" />
                  <span>Transcript</span>
                </div>

                <div
                  className={`item ${activeView === "HISTORY" ? "active" : ""}`}
                  onClick={() => onViewChange("HISTORY")}
                >
                  <img src={history} alt="" />
                  <span>History</span>
                </div>

                <div
                  className={`item ${activeView === "SETTINGS" ? "active" : ""}`}
                  onClick={() => onViewChange("SETTINGS")}
                >
                  <img src={settings} alt="" />
                  <span>Settings</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {showTranslationSettings && (
        <TranslationSettings onClose={() => setShowTranslationSettings(false)} />
      )}
      {showSpeakerDiarization && (
        <SpeakerDiarization onClose={() => setShowSpeakerDiarization(false)} />
      )}
    </>
  );
}

export default Sidebar;