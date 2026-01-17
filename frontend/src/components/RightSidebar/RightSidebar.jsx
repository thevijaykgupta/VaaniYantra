import { useState, useEffect } from "react";
import { useAppState } from "../../context/AppStateContext";
import "./RightSidebar.css";

function RightSidebar({ isOpen, onToggle }) {
  const { transcriptionData, connectionState } = useAppState();
  const [insights, setInsights] = useState({
    detectedLanguage: "English",
    confidence: 97,
    speakers: 1,
    processingTime: "0.3s"
  });

  // Update insights based on transcription data
  useEffect(() => {
    if (transcriptionData.length > 0) {
      const latestTranscript = transcriptionData[transcriptionData.length - 1];
      setInsights({
        detectedLanguage: "English", // Could be detected dynamically
        confidence: 97, // Could be calculated
        speakers: 1, // Could be detected
        processingTime: "0.3s" // Could be measured
      });
    }
  }, [transcriptionData]);

  return (
    <>
      {/* SIDEBAR TOGGLE */}
      <button
        className={`right-sidebar-toggle ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
        onClick={onToggle}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? "→" : "←"}
      </button>

      {/* RIGHT SIDEBAR */}
      <aside className={`right-sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">

          {/* INSIGHTS CARD */}
          <div className="sidebar-card insights-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="title-icon">📊</span>
                Insights
              </h3>
            </div>

            <div className="card-body">
              <div className="insight-row">
                <div className="insight-item">
                  <span className="item-label">Detected Language</span>
                  <div className="item-value">
                    <span className="language-text">{insights.detectedLanguage}</span>
                    <div className="confidence-indicator">
                      <div
                        className="confidence-bar"
                        style={{ width: `${insights.confidence}%` }}
                      ></div>
                    </div>
                    <span className="confidence-text">{insights.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="insight-row">
                <div className="insight-item">
                  <span className="item-label">Speakers</span>
                  <span className="item-value speakers">
                    <span className="speaker-icon">👤</span>
                    {insights.speakers}
                  </span>
                </div>
              </div>

              <div className="insight-row">
                <div className="insight-item">
                  <span className="item-label">Processing Time</span>
                  <span className="item-value processing-time">
                    <span className="speed-icon">⚡</span>
                    {insights.processingTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SIGHTS CARD */}
          <div className="sidebar-card sights-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="title-icon">👁</span>
                Sights
              </h3>
            </div>

            <div className="card-body">
              <div className="sight-row">
                <div className="sight-item">
                  <span className="item-label">Insights</span>
                  <span className="item-value active">
                    <span className="activity-icon">●</span>
                    Active
                  </span>
                </div>
              </div>

              <div className="sight-row">
                <div className="sight-item">
                  <span className="item-label">Detected Language</span>
                  <span className="item-value language-confirm">
                    {insights.detectedLanguage}
                  </span>
                </div>
              </div>

              <div className="sight-row">
                <div className="sight-item">
                  <span className="item-label">Confidence</span>
                  <div className="confidence-display">
                    <div className="confidence-bar-bg">
                      <div
                        className="confidence-bar-fill"
                        style={{ width: `${insights.confidence}%` }}
                      ></div>
                    </div>
                    <span className="confidence-percent">{insights.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="sight-row">
                <div className="sight-item">
                  <span className="item-label">Speakers</span>
                  <span className="item-value speakers-count">
                    {insights.speakers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVITY GRAPH */}
          <div className="sidebar-card activity-card">
            <div className="activity-graph">
              <div className="waveform-container">
                <div className="waveform-line"></div>
                <div className="waveform-line"></div>
                <div className="waveform-line"></div>
                <div className="waveform-line"></div>
                <div className="waveform-line"></div>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}

export default RightSidebar;
