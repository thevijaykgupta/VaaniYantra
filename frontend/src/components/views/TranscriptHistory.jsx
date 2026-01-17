import { useState, useEffect } from "react";
import "./Views.css";

function TranscriptHistory() {
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const handleDownload = (format) => {
    if(!selectedTranscript) return;
    window.open(
      'http://localhost:8000/transcripts/${selectedTranscript.id}/download?format=${format}',
    "_blank"
    );
    };

  // 1️Load ALL transcripts from backend (DB)
  useEffect(() => {
    fetch("http://127.0.0.1:8000/transcripts?room_id=classroom1")
      .then(res => res.json())
      .then(data => {
        setTranscripts(data.items || []);
      })
      .catch(err => console.error("Failed to load transcripts", err));
  }, []);

  // 2️ Listen for live transcripts via WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/audio/classroom1");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.type === "transcript") {
          setTranscripts(prev => {
            if (prev.some(t => t.id === msg.payload.id)) return prev;
            return [msg.payload, ...prev];
          });
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    return () => ws.close();
  }, []);

  // 3️ Transcript detail view - Beautiful Design
  if (selectedTranscript) {
    return (
      <div className="transcript-detail-view">
        <div className="detail-header">
          <button
            className="back-btn"
            onClick={() => setSelectedTranscript(null)}
          >
            ← Back to History
          </button>
          <div className="transcript-info">
            <h2 className="transcript-title">📄 Transcript #{selectedTranscript.id}</h2>
            <div className="transcript-meta">
              <span className="meta-item">
                🕒 {new Date(selectedTranscript.created_at).toLocaleString()}
              </span>
              <span className="meta-item">
                🏠 Room: {selectedTranscript.room_id}
              </span>
              <span className="meta-item">
                👤 Speaker: {selectedTranscript.speaker || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="transcript-content-grid">
          <div className="content-card original-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="lang-icon">🇺🇸</span>
                Original Text (English)
              </h3>
            </div>
            <div className="card-body">
              <div className="speaker-tag">
                <span className="speaker-avatar">{(selectedTranscript.speaker || 'S')[0].toUpperCase()}</span>
                <span className="speaker-name">{selectedTranscript.speaker || 'Speaker'}</span>
              </div>
              <p className="transcript-text original-text">
                {selectedTranscript.text || 'No original text available'}
              </p>
            </div>
          </div>

          <div className="content-card translation-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="lang-icon">🇮🇳</span>
                Translation (हिंदी)
              </h3>
            </div>
            <div className="card-body">
              <div className="speaker-tag">
                <span className="speaker-avatar">{(selectedTranscript.speaker || 'S')[0].toUpperCase()}</span>
                <span className="speaker-name">{selectedTranscript.speaker || 'Speaker'}</span>
              </div>
              <p className="transcript-text translation-text">
                {selectedTranscript.translation || 'No translation available'}
              </p>
            </div>
          </div>
        </div>

        <div className="export-actions">
          <h4>Download Options</h4>
          <div className="export-buttons">
            <button onClick={() => handleDownload('pdf')} className="export-btn">
              📄 PDF
            </button>
            <button onClick={() => handleDownload('docx')} className="export-btn">
              📝 DOCX
            </button>
            <button onClick={() => handleDownload('srt')} className="export-btn">
              🎬 SRT
            </button>
            <button onClick={() => handleDownload('json')} className="export-btn">
              💾 JSON
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4️ Transcript list (DB history) - Modern Card Design
  return (
  <div className="history-view">
    <div className="history-header">
      <h2 className="history-title">📜 Transcript History</h2>
      <p className="history-subtitle">
        Access and manage your past transcription sessions with beautiful, organized cards
      </p>
    </div>

    <div className="history-grid">
      {transcripts.length > 0 ? (
        transcripts.map(t => (
          <div
            key={t.id}
            className="history-card"
            onClick={() => setSelectedTranscript(t)}
          >
            <div className="card-header">
              <h3 className="session-title">
                <span className="session-icon">🎙</span>
                Session #{t.id}
              </h3>
              <span className="session-date">
                {new Date(t.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="session-meta">
              <div className="meta-item">
                <span className="meta-icon">🏠</span>
                <span>Room: {t.room_id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span>Speaker: {t.speaker || 'Unknown'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🌐</span>
                <span>Languages: EN → HI</span>
              </div>
            </div>

            <div className="card-content">
              <p className="transcript-preview">
                {t.text ? t.text.substring(0, 120) + (t.text.length > 120 ? '...' : '') : 'No transcript content available'}
              </p>
            </div>

            <div className="card-actions">
              <button
                className="view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTranscript(t);
                }}
              >
                👁 View Details
              </button>
              <span className="session-date">
                {new Date(t.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Transcripts Yet</h3>
          <p>Start a live transcription session to see your history here.</p>
        </div>
      )}
    </div>
  </div>
);
}

export default TranscriptHistory;