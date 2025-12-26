import { useState } from 'react';
import OriginalTranscription from '../Transcription/OriginalTranscription';
import LiveTranslation from '../Transcription/LiveTranslation';
import './Views.css';

function SpeakerDiarization({ transcriptionData = [] }) {
  const [diarizationEnabled, setDiarizationEnabled] = useState(true);
  const [maxSpeakers, setMaxSpeakers] = useState(4);

  // Mock speaker data for demonstration
  const mockTranscriptionData = [
    { speaker: 'Speaker A', text: 'Hello everyone, welcome to the presentation.', timestamp: new Date() },
    { speaker: 'Speaker B', text: 'Thank you for having us here today.', timestamp: new Date() },
    { speaker: 'Speaker A', text: 'Let me introduce our project.', timestamp: new Date() },
    { speaker: 'Speaker C', text: 'This looks very interesting.', timestamp: new Date() },
  ];

  const speakerColors = {
    'Speaker A': '#4dc9c9',
    'Speaker B': '#d8b76a',
    'Speaker C': '#c94d4d',
    'Speaker D': '#4d94c9',
  };

  return (
    <div className="diarization-view">
      {/* Settings Panel */}
      <div className="diarization-settings">
        <div className="settings-card">
          <h3 className="card-title">Speaker Diarization</h3>

          <div className="setting-row">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={diarizationEnabled}
                onChange={(e) => setDiarizationEnabled(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Enable Speaker Detection</span>
            </label>
          </div>

          <div className="setting-row">
            <label className="select-label">Maximum Speakers</label>
            <select
              value={maxSpeakers}
              onChange={(e) => setMaxSpeakers(e.target.value)}
              className="speaker-select"
            >
              {[2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Speaker Legend */}
          <div className="speaker-legend">
            <h4 className="legend-title">Active Speakers</h4>
            <div className="legend-items">
              {Object.entries(speakerColors).slice(0, maxSpeakers).map(([speaker, color]) => (
                <div key={speaker} className="legend-item">
                  <div
                    className="speaker-dot"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="speaker-name">{speaker}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Panels */}
      <div className="diarization-transcription">
        <OriginalTranscription transcriptionData={diarizationEnabled ? mockTranscriptionData : []} />
        <LiveTranslation transcriptionData={diarizationEnabled ? mockTranscriptionData : []} />
      </div>
    </div>
  );
}

export default SpeakerDiarization;
