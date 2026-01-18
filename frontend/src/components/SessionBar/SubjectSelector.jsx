import { useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import "./SubjectSelector.css";

export default function SubjectSelector() {
  const {
    currentSubject,
    setCurrentSubject,
    availableSubjects,
    setAvailableSubjects,
  } = useAppState();

  const [open, setOpen] = useState(false);

  const handleSelect = (subject) => {
    setCurrentSubject(subject);
    setOpen(false);
  };

  const handleAddSubject = () => {
    const name = prompt("Enter new subject name");
    if (!name) return;

    if (!availableSubjects.includes(name)) {
      setAvailableSubjects(prev => [...prev, name]);
    }
    setCurrentSubject(name);
    setOpen(false);
  };

  return (
    <div className="subject-wrapper">
      {/* Trigger */}
      <button
        className="subject-pill"
        onClick={() => setOpen(prev => !prev)}
        type="button"
      >
        {currentSubject}
        <span className="caret">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="subject-dropdown">
          {availableSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSelect(sub)}
              type="button"
            >
              {sub}
            </button>
          ))}

          <div className="divider" />

          <button
            className="add-subject"
            onClick={handleAddSubject}
            type="button"
          >
            ＋ Add Subject
          </button>
        </div>
      )}

      {/* Overlay */}
      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}