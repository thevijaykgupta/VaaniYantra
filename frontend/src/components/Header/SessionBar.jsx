import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

function SessionBar() {
  const {
    sessionName,
    setSessionName,
    currentSubject,
    setCurrentSubject,
    availableSubjects,
    setAvailableSubjects
  } = useAppState();

  const [isEditingSession, setIsEditingSession] = useState(false);
  const [tempSessionName, setTempSessionName] = useState(sessionName);

  const handleSessionSave = () => {
    setSessionName(tempSessionName);
    setIsEditingSession(false);
  };

  const handleAddSubject = () => {
    const newSubject = prompt('Enter new subject name:');
    if (newSubject && newSubject.trim()) {
      setAvailableSubjects(prev => [...prev, newSubject.trim()]);
      setCurrentSubject(newSubject.trim());
    }
  };

  return (
    <div className="session-bar">
      {/* Left Zone: Session */}
      <div className="session-zone">
        <span className="label">Session:</span>
        {isEditingSession ? (
          <input
            type="text"
            value={tempSessionName}
            onChange={(e) => setTempSessionName(e.target.value)}
            onBlur={handleSessionSave}
            onKeyPress={(e) => e.key === 'Enter' && handleSessionSave()}
            autoFocus
            className="editable-text"
          />
        ) : (
          <span
            onClick={() => setIsEditingSession(true)}
            className="editable-text"
          >
            {sessionName}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="session-divider"></div>

      {/* Right Zone: Subject */}
      <div className="subject-zone">
        <span className="label">Subject:</span>
        <select
          value={currentSubject}
          onChange={(e) => setCurrentSubject(e.target.value)}
          className="subject-dropdown"
        >
          {availableSubjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>

        <button onClick={handleAddSubject} className="add-subject">
          + Add Subject
        </button>
      </div>
    </div>
  );
}

export default SessionBar;
