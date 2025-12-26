import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

function SessionHistory() {
  const { setSessionName, setCurrentSubject, setTranscriptionData } = useAppState();

  // Mock session history data
  const [sessionHistory] = useState([
    {
      id: 1,
      title: 'DSP – Fourier Transform',
      time: 'Today, 12:45 PM',
      subject: 'Digital Signal Processing'
    },
    {
      id: 2,
      title: 'Data Structures – Trees',
      time: 'Yesterday, 3:20 PM',
      subject: 'Data Structures'
    },
    {
      id: 3,
      title: 'ML – Neural Networks',
      time: 'Yesterday, 10:15 AM',
      subject: 'Machine Learning'
    }
  ]);

  const handleSessionClick = (session) => {
    setSessionName(session.title);
    setCurrentSubject(session.subject);
    setTranscriptionData([]); // Clear current transcription
  };

  return (
    <div className="session-history">
      <div className="session-history-header">
        <Clock size={16} />
        <span className="history-title">RECENT SESSIONS</span>
      </div>

      <div className="session-history-list">
        {sessionHistory.map(session => (
          <div
            key={session.id}
            className="session-history-item"
            onClick={() => handleSessionClick(session)}
          >
            <div className="session-title">{session.title}</div>
            <div className="session-time">{session.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionHistory;
