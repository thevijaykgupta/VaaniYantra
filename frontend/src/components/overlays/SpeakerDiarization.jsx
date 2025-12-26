import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import './Overlays.css';

function SpeakerDiarization({ onClose }) {
  const { transcriptionData, addToast } = useAppState();
  const [diarizationEnabled, setDiarizationEnabled] = useState(true);
  const [speakerColors, setSpeakerColors] = useState({
    'Speaker A': '#4CAF50',
    'Speaker B': '#2196F3',
    'Speaker C': '#FF9800',
    'Speaker D': '#E91E63'
  });
  const [speakerNames, setSpeakerNames] = useState({
    'Speaker A': 'Speaker A',
    'Speaker B': 'Speaker B',
    'Speaker C': 'Speaker C',
    'Speaker D': 'Speaker D'
  });

  // Get unique speakers from transcription data
  const uniqueSpeakers = [...new Set(transcriptionData.map(line => line.speaker))];

  const handleRenameSpeaker = (originalName, newName) => {
    setSpeakerNames({...speakerNames, [originalName]: newName});
  };

  const handleColorChange = (speaker, color) => {
    setSpeakerColors({...speakerColors, [speaker]: color});
  };

  const handleSave = () => {
    addToast('Speaker settings saved!', 'success');
    onClose();
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel speaker-diarization" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <h3>Speaker Diarization</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="overlay-content">
          <div className="setting-group">
            <label className="setting-toggle">
              <input
                type="checkbox"
                checked={diarizationEnabled}
                onChange={(e) => setDiarizationEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Enable speaker diarization</span>
            </label>
          </div>

          {diarizationEnabled && (
            <div className="speaker-list">
              <h4>Speaker Configuration</h4>
              {uniqueSpeakers.map((speaker, index) => (
                <div key={speaker} className="speaker-item">
                  <div className="speaker-info">
                    <div
                      className="speaker-color"
                      style={{ backgroundColor: speakerColors[speaker] || '#666' }}
                      onClick={() => {
                        const newColor = prompt('Enter color (hex):', speakerColors[speaker]);
                        if (newColor) handleColorChange(speaker, newColor);
                      }}
                    ></div>
                    <input
                      type="text"
                      value={speakerNames[speaker] || speaker}
                      onChange={(e) => handleRenameSpeaker(speaker, e.target.value)}
                      className="speaker-name-input"
                      placeholder={`Speaker ${index + 1}`}
                    />
                  </div>
                  <div className="speaker-stats">
                    {transcriptionData.filter(line => line.speaker === speaker).length} lines
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overlay-footer">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}

export default SpeakerDiarization;
