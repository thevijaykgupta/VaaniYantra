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

  // 3️ Transcript detail view
  if (selectedTranscript) {
    return (
      <div className="transcript-viewer">
        <button onClick={() => setSelectedTranscript(null)}>← Back</button>

        <h2>Transcript #{selectedTranscript.id}</h2>
        <p>{new Date(selectedTranscript.created_at).toLocaleString()}</p>

        <h3>Original</h3>
        <p><b>{selectedTranscript.speaker}:</b> {selectedTranscript.text}</p>

        <h3>Translation</h3>
        <p><b>{selectedTranscript.speaker}:</b> {selectedTranscript.translation}</p>
      </div>
    );
  }

  // 4️ Transcript list (DB history)
  return (
  <div className="history-view">
    <div className="history-header">
      <h2 className="history-title">Transcript History</h2>
      <p className="history-subtitle">
        Access and manage your past transcription sessions
      </p>
    </div>

    <div className="history-table">
      <div className="table-header">
        <div>Date & Time</div>
        <div>Room</div>
        <div>Duration</div>
        <div>Languages</div>
        <div>Speaker</div>
        <div>Action</div>
      </div>

      {transcripts.map(t => (
        <div key={t.id} className="table-row">
          <div>
            {new Date(t.created_at).toLocaleDateString()} <br />
            {new Date(t.created_at).toLocaleTimeString()}
          </div>
          <div>{t.room_id}</div>
          <div>—</div>
          <div>EN → HI</div>
          <div>{t.speaker}</div>
          <div>
            <button
              className="view-btn"
              onClick={() => setSelectedTranscript(t)}
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}

export default TranscriptHistory;