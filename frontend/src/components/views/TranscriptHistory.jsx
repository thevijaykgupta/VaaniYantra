import { useState } from 'react';
import './Views.css';

function TranscriptHistory() {
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  // Mock transcript history data
  const [transcripts] = useState([
    {
      id: 1,
      date: '2025-12-24',
      time: '14:30',
      duration: '45:23',
      languages: 'English → Hindi, Tamil',
      speakers: 3,
      subject: 'DSP',
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-12-24',
      time: '13:15',
      duration: '32:18',
      languages: 'English → Hindi',
      speakers: 2,
      subject: 'Data Structures',
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-12-23',
      time: '16:45',
      duration: '28:52',
      languages: 'English → Hindi, Kannada',
      speakers: 4,
      subject: 'Analog Communication',
      status: 'completed'
    },
    {
      id: 4,
      date: '2025-12-23',
      time: '11:20',
      duration: '67:34',
      languages: 'English → Multiple',
      speakers: 5,
      subject: 'Machine Learning',
      status: 'completed'
    }
  ]);

  // Mock transcript content
  const mockTranscriptContent = {
    1: {
      original: [
        { speaker: 'Speaker A', time: '00:05', text: 'Good afternoon everyone.' },
        { speaker: 'Speaker B', time: '00:08', text: 'Welcome to our presentation.' },
        { speaker: 'Speaker A', time: '00:12', text: 'Today we will discuss the VaaniYantra project.' },
        { speaker: 'Speaker C', time: '00:18', text: 'This multilingual transcription system is impressive.' }
      ],
      translation: [
        { speaker: 'Speaker A', time: '00:05', text: 'सभी को नमस्ते।' },
        { speaker: 'Speaker B', time: '00:08', text: 'हमारे प्रस्तुतीकरण में आपका स्वागत है।' },
        { speaker: 'Speaker A', time: '00:12', text: 'आज हम VaaniYantra परियोजना पर चर्चा करेंगे।' },
        { speaker: 'Speaker C', time: '00:18', text: 'यह बहुभाषी ट्रांसक्रिप्शन सिस्टम प्रभावशाली है।' }
      ]
    }
  };

  const handleDownload = (format) => {
    // Mock download functionality
    console.log(`Downloading transcript ${selectedTranscript?.id} as ${format}`);
  };

  if (selectedTranscript) {
    const content = mockTranscriptContent[selectedTranscript.id];
    return (
      <div className="transcript-viewer">
        <div className="viewer-header">
          <button
            className="back-button"
            onClick={() => setSelectedTranscript(null)}
          >
            ← Back to History
          </button>
          <div className="transcript-info">
            <h2>Transcript #{selectedTranscript.id}</h2>
            <p>{selectedTranscript.date} • {selectedTranscript.duration} • {selectedTranscript.languages}</p>
          </div>
          <div className="download-buttons">
            <button onClick={() => handleDownload('pdf')} className="download-btn">PDF</button>
            <button onClick={() => handleDownload('docx')} className="download-btn">DOCX</button>
            <button onClick={() => handleDownload('srt')} className="download-btn">SRT</button>
          </div>
        </div>

        <div className="transcript-content">
          <div className="transcript-panel">
            <h3>Original Transcription</h3>
            <div className="transcript-lines">
              {content?.original.map((line, index) => (
                <div key={index} className="transcript-line">
                  <span className="timestamp">{line.time}</span>
                  <span className="speaker">{line.speaker}:</span>
                  <span className="text">{line.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="transcript-panel">
            <h3>Live Translation</h3>
            <div className="transcript-lines">
              {content?.translation.map((line, index) => (
                <div key={index} className="transcript-line">
                  <span className="timestamp">{line.time}</span>
                  <span className="speaker">{line.speaker}:</span>
                  <span className="text">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-view">
      <div className="history-header">
        <h2 className="history-title">Transcript History</h2>
        <p className="history-subtitle">Access and manage your past transcription sessions</p>
      </div>

      <div className="history-table">
        <div className="table-header">
          <div className="col-date">Date & Time</div>
          <div className="col-subject">Subject</div>
          <div className="col-duration">Duration</div>
          <div className="col-languages">Languages</div>
          <div className="col-speakers">Speakers</div>
          <div className="col-actions">Actions</div>
        </div>

        {transcripts.map(transcript => (
          <div key={transcript.id} className="table-row">
            <div className="col-date">
              <div className="date">{transcript.date}</div>
              <div className="time">{transcript.time}</div>
            </div>
            <div className="col-subject">{transcript.subject}</div>
            <div className="col-duration">{transcript.duration}</div>
            <div className="col-languages">{transcript.languages}</div>
            <div className="col-speakers">{transcript.speakers}</div>
            <div className="col-actions">
              <button
                className="view-btn"
                onClick={() => setSelectedTranscript(transcript)}
              >
                View
              </button>
              <button
                className="download-btn"
                onClick={() => handleDownload('pdf')}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TranscriptHistory;
