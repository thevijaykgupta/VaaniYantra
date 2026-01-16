import SubjectSelector from "./SubjectSelector.jsx";
import "./SessionBar.css";

export default function SessionBar() {
  return (
    <div className="session-bar">

      {/* SUBJECT SELECTOR */}
      <SubjectSelector />

      {/* LANGUAGE DIRECTION */}
      <div className="session-lang">
        English <span className="arrow">→</span> Hindi
      </div>

      {/* LIVE STATUS */}
      <div className="session-live">
        <span className="live-dot" />
        Live
      </div>

      {/* LATENCY */}
      <div className="session-latency">
        320 ms
      </div>

    </div>
  );
}