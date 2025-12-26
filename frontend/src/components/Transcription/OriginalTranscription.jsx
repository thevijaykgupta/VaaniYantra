import { useState, useEffect } from 'react';
import './Transcription.css';

function OriginalTranscription({ transcriptionData = [] }) {
  const [transcriptionLines, setTranscriptionLines] = useState([
    { id: 1, speaker: 'Speaker A', text: 'Listening...', timestamp: new Date() }
  ]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Simulate adding transcription lines
  useEffect(() => {
    if (transcriptionData.length > 0) {
      const newLines = transcriptionData.map((data) => ({
  id: crypto.randomUUID(),
  speaker: data.speaker || 'Speaker A',
  text: data.text || '',
  timestamp: new Date()
  }));
      setTranscriptionLines(prev => [...prev, ...newLines]);
    }
  }, [transcriptionData]);

  // useEffect(() => {
  //   if (transcriptionData.length > 0) {
  //     const newLines = transcriptionData.map((data, index) => ({
  //       id: Date.now() + index,
  //       speaker: data.speaker || 'Speaker A',
  //       text: data.text || '',
  //       timestamp: new Date()
  //     }));
  //     setTranscriptionLines(prev => [...prev, ...newLines]);
  //   }
  // }, [transcriptionData]);

  const handleCopy = () => {
    const text = transcriptionLines.map(line => `${line.speaker}: ${line.text}`).join('\n');
    navigator.clipboard.writeText(text);
    // You could show a toast here
  };

  return (
    <div className={`transcription-panel original-panel ${isExpanded ? '' : 'collapsed'}`}>
      <div className="panel-header">
        <h3 className="panel-title">Original Transcription</h3>
        <div className="panel-controls">
          <button
            className="panel-control-btn"
            onClick={handleCopy}
            title="Copy transcription"
          >
            ⧉
          </button>
          <button
            className="panel-control-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse panel" : "Expand panel"}
          >
            {isExpanded ? '⬆' : '⬇'}
          </button>
        </div>
        <span className="panel-count">{transcriptionLines.length} lines</span>
      </div>
      {isExpanded && (
        <div className="panel-content">
          <div className="transcription-text">
            {transcriptionLines.map(line => (
              <div key={line.id} className="speaker-line">
                <span className="speaker-label">{line.speaker}:</span>
                <span className="speaker-text">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OriginalTranscription;

