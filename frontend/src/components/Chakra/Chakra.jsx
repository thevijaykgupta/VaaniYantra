import { useState, useEffect } from 'react';
import './Chakra.css';
import chakraVideo from '../../assets/videos/vaaniyantra_bg.mp4';
import { startMicStreaming, stopMicStreaming } from '../../services/micStreamer.js';
import { useAppState } from '../../context/AppStateContext.jsx';

const listeningText = {
  en: "Listening for speech…",
  hi: "वाणी सुन रहा है…",
  ta: "பேச்சைக் கேட்கிறது…",
  kn: "ಮಾತನ್ನು ಕೇಳುತ್ತಿದೆ…",
  te: "ಮಾತನ್ನು ಕೇಳುತ್ತಿದೆ…",
  bn: "কথা শুনছে…",
  mr: "वाणी ऐकत आहे…"
};

// export default function Chakra() {
//   return (
//     <video
//       src={chakraVideo}
//       autoPlay
//       loop
//       muted
//       style={{
//         width: "400px",
//         height: "400px",
//         border: "2px solid red",
//       }}
//     />
//   );
// }

function Chakra() {
  const { connectionState, connected, reconnecting, targetLanguages, addToast } = useAppState();
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [speechDetectionTimeout, setSpeechDetectionTimeout] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micStream, setMicStream] = useState(null);


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

  const startCapture = async () => {
    // Check if websocket is connected before starting mic
    if (!connected) {
      addToast('Please wait for connection to backend before starting audio capture', 'warning');
      return;
    }

    try {
      setIsRecording(true);
      addToast('Audio capture started', 'success');
      // Start the audio processing with websocket status check
      await startMicStreaming(() => connected);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      addToast('Microphone access denied. Please check permissions.', 'error');
    }
  };

  const stopCapture = () => {
    stopMicStreaming();
    setIsRecording(false);
    addToast('Audio capture stopped', 'info');
  };

  // Auto-stop recording when websocket disconnects
  useEffect(() => {
    if (!connected && isRecording) {
      console.log("🔌 WebSocket disconnected - stopping microphone");
      stopCapture();
    }
  }, [connected, isRecording]);

  return (
    <div className="chakra-container">
      {/* CAPTURE BUTTON */}
      <div className="capture-controls">
        <button
          className={`capture-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopCapture : startCapture}
        >
          <div className="capture-icon">
            {isRecording ? '⏹️' : '🎤'}
          </div>
          <div className="capture-text">
            {isRecording ? 'Stop Capture' : 'Start Capture'}
          </div>
        </button>
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            Recording...
          </div>
        )}
      </div>

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


      {/* LANGUAGE PROCESSING CHAKRA SVG
      <svg className="chakra-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        {/* Chakra rings would be defined here */}
        {/* <defs>
          <radialGradient id="chakraGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor: 'rgba(230,193,122,0.8)', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'rgba(230,193,122,0.2)', stopOpacity: 1}} />
          </radialGradient>
        </defs> */}

        {/* Outer rings */}
        {/* <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(230,193,122,0.3)" strokeWidth="2" className="chakra-ring" />
        <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(230,193,122,0.4)" strokeWidth="2" className="chakra-ring" />
        <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(230,193,122,0.5)" strokeWidth="3" className="chakra-ring" />
        <circle cx="250" cy="250" r="50" fill="none" stroke="url(#chakraGradient)" strokeWidth="4" className="chakra-ring" /> */}

        {/* Center dot */}
        {/* <circle cx="250" cy="250" r="8" fill="rgba(230,193,122,0.9)" />
      </svg> */}
    </div>
  );
}

export default Chakra;
