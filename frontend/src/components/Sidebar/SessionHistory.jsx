import { Clock } from "lucide-react";
import { useAppState } from "../../context/AppStateContext";

function SessionHistory() {
  const {
    transcripts,
    setSessionName,
    setCurrentSubject,
    setTranscriptionData,
  } = useAppState();

  // Create sessions from transcripts
  const recentSessions = [...transcripts]
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.room_id,
      time: new Date(t.created_at).toLocaleTimeString(),
      room_id: t.room_id,
      transcript: t,
    }));

  const handleSessionClick = (session) => {
    setSessionName(`${session.room_id}-${session.id}`);
    setCurrentSubject(session.room_id);
    setTranscriptionData([session.transcript]);
  };

  return (
    <div className="session-history">
      <div className="session-history-header">
        <Clock size={16} />
        <span className="history-title">RECENT SESSIONS</span>
      </div>

      <div className="session-history-list">
        {recentSessions.map(session => (
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