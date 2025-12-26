import { useState, useEffect } from 'react';
import './Transcription.css';

function LiveTranslation({ transcriptionData = [] }) {
  const [translationLines, setTranslationLines] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Simple mock translation function
  const simulateTranslation = (text) => {
    const translations = {
      'Hello': 'नमस्ते',
      'How are you': 'आप कैसे हैं',
      'Thank you': 'धन्यवाद',
      'Good morning': 'सुप्रभात',
      'What is your name': 'आपका नाम क्या है'
    };
    return translations[text] || text + ' (translated)';
  };

  // Update translations when transcription data changes
  useEffect(() => {
    if (transcriptionData.length > 0) {
      const newTranslations = transcriptionData.map((data, index) => ({
        id: Date.now() + index,
        speaker: data.speaker || 'Speaker A',
        originalText: data.text || '',
        translatedText: simulateTranslation(data.text || ''),
        timestamp: new Date()
      }));
      setTranslationLines(prev => [...prev, ...newTranslations]);
    }
  }, [transcriptionData]);

  const handleCopy = () => {
    const text = translationLines.map(line => `${line.speaker}: ${line.translatedText}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`transcription-panel translation-panel ${isExpanded ? '' : 'collapsed'}`}>
      <div className="panel-header">
        <h3 className="panel-title">Live Translation</h3>
        <div className="panel-controls">
          <button
            className="panel-control-btn"
            onClick={handleCopy}
            title="Copy translation"
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
        <span className="panel-count">{translationLines.length} lines</span>
      </div>
      {isExpanded && (
        <div className="panel-content">
          <div className="transcription-text">
            {translationLines.length > 0 ? (
              translationLines.map(line => (
                <div key={line.id} className="speaker-line">
                  <span className="speaker-label">{line.speaker}:</span>
                  <span className="speaker-text">{line.translatedText}</span>
                </div>
              ))
            ) : (
              <div className="placeholder-text">Listening for speech...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTranslation;

