import { useState, useRef, useEffect } from "react";
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
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const inputRef = useRef(null);

  const handleSelect = (subject) => {
    setCurrentSubject(subject);
    setOpen(false);
    setIsAdding(false);
    setNewSubjectName("");
  };

  const handleAddSubjectClick = () => {
    setIsAdding(true);
  };

  const handleAddSubjectSubmit = (e) => {
    e.preventDefault();
    const name = newSubjectName.trim();
    if (!name) {
      setIsAdding(false);
      setNewSubjectName("");
      return;
    }

    if (!availableSubjects.includes(name)) {
      setAvailableSubjects(prev => [...prev, name]);
    }
    setCurrentSubject(name);
    setOpen(false);
    setIsAdding(false);
    setNewSubjectName("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewSubjectName("");
  };

  // Focus input when adding
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

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