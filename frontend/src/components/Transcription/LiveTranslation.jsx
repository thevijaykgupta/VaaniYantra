import { useState, useEffect } from 'react';
import './Transcription.css';
import { useAppState } from '../../context/AppStateContext.jsx';

const listeningText = {
  en: "Listening for speech…",
  hi: "वाणी सुन रहा है…",
  ta: "பேச்சைக் கேட்கிறது…",
  kn: "ಮಾತನ್ನು ಕೇಳುತ್ತಿದೆ…",
  te: "మాటలను వింటోంది…",
  bn: "কথা শুনছে…",
  mr: "वाणी ऐकत आहे…"
};

function LiveTranslation({ transcriptionData = [] }) {
  const [translationLines, setTranslationLines] = useState([]);
let selectedLang = 'en';

try {
  const appState = useAppState();
  selectedLang = appState?.targetLanguages?.[0] || 'en';
} catch (e) {
  // Context not available — fallback safely
  selectedLang = 'en';
}
  // const selectedLang = targetLanguages?.[0] || 'en';
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
    console.log("🌐 LiveTranslation received data:", transcriptionData);
    if (transcriptionData.length > 0) {
      const newTranslations = transcriptionData.map((data) => ({
        id: data.id || Date.now(),
        speaker: data.speaker || 'Speaker A',
        originalText: data.text || '',
        translatedText: data.translation || data.text || '', // Use real translation from backend
        detectedLanguage: data.detected_language || 'auto', // Include detected language
        timestamp: data.created_at ? new Date(data.created_at) : new Date()
      }));
      console.log("🌐 Setting translation lines:", newTranslations);
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
                  <small className="language-label" style={{color: '#666', fontSize: '0.8em', marginLeft: '8px'}}>
                    {line.detectedLanguage} → en
                  </small>
                </div>
              ))
            ) :  (
              <div className="placeholder-text">
                {listeningText[selectedLang] || listeningText.en}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTranslation;