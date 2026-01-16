import { useState } from "react";
import { useAppState } from "../../context/AppStateContext.jsx";
import { LANGUAGES } from "../../utils/languages";
import "./LanguageSelector.css";

export default function LanguageSelector() {
  const { targetLanguages, setTargetLanguages } = useAppState();
  const [open, setOpen] = useState(false);

  const current =
    LANGUAGES.find(l => l.code === targetLanguages?.[0]) || LANGUAGES[0];

  const handleSelect = (lang) => {
    setTargetLanguages([lang.code]);
    setOpen(false);
  };

  return (
    <div className="lang-wrapper">
      {/* Trigger Button */}
      <button
        className="lang-pill"
        onClick={() => setOpen(prev => !prev)}
        type="button"
      >
        {current.label}
        <span className="caret">▾</span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              type="button"
            >
              {lang.label}
            </button>
          ))}
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