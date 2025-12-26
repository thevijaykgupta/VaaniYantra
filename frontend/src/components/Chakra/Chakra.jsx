import { useState, useEffect } from 'react';
import './Chakra.css';
import chakraVideo from '../../assets/videos/vaaniyantra_bg.mp4';

import { useAppState } from '../../context/AppStateContext';

const listeningText = {
  en: "Listening for speech…",
  hi: "वाणी सुन रहा है…",
  ta: "பேச்சைக் கேட்கிறது…",
  kn: "ಮಾತನ್ನು ಕೇಳುತ್ತಿದೆ…",
  te: "మాటలను వింటోంది…",
  bn: "কথা শুনছে…",
  mr: "वाणी ऐकत आहे…"
};

function Chakra() {
  const { connectionState, connected, reconnecting, targetLanguages } = useAppState();
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [speechDetectionTimeout, setSpeechDetectionTimeout] = useState(null);


  const updateSpeechDetection = (speechActive) => {
    if (speechActive === isSpeechDetected) return;

    setIsSpeechDetected(speechActive);

    if (speechActive) {
      // Clear any existing timeout
      if (speechDetectionTimeout) {
        clearTimeout(speechDetectionTimeout);
      }

      // Set timeout to stop pulsing after speech ends
      const timeout = setTimeout(() => {
        updateSpeechDetection(false);
      }, 2000); // Continue pulsing for 2s after speech stops

      setSpeechDetectionTimeout(timeout);
    }
  };

  return (
    <div className="chakra-container">
      {/* BACKGROUND VIDEO */}
      <video
        className="chakra-bg-video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={chakraVideo} type="video/mp4" />
        Your browser does not support background video.
      </video>


      {/* LANGUAGE PROCESSING CHAKRA SVG */}
      <svg className="chakra-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        {/* Chakra rings would be defined here */}
        <defs>
          <radialGradient id="chakraGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor: 'rgba(230,193,122,0.8)', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'rgba(230,193,122,0.2)', stopOpacity: 1}} />
          </radialGradient>
        </defs>

        {/* Outer rings */}
        <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(230,193,122,0.3)" strokeWidth="2" className="chakra-ring" />
        <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(230,193,122,0.4)" strokeWidth="2" className="chakra-ring" />
        <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(230,193,122,0.5)" strokeWidth="3" className="chakra-ring" />
        <circle cx="250" cy="250" r="50" fill="none" stroke="url(#chakraGradient)" strokeWidth="4" className="chakra-ring" />

        {/* Center dot */}
        <circle cx="250" cy="250" r="8" fill="rgba(230,193,122,0.9)" />
      </svg>
    </div>
  );
}

export default Chakra;
