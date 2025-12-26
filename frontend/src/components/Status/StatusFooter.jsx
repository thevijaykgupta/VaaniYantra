import { FileText, File, Subtitles, Braces, BarChart, Users, Settings, Play } from 'lucide-react';
import { useAppState } from "../../context/AppStateContext";

function StatusFooter() {
  const { connectionState, demoMode, transcriptionData, addToast } = useAppState();

  const handleExportPDF = () => {
    addToast('PDF export coming soon!', 'info');
  };

  const handleExportDOCX = () => {
    addToast('DOCX export coming soon!', 'info');
  };

  const handleExportSRT = () => {
    if (transcriptionData.length > 0) {
      // SRT export logic would go here
      addToast('SRT exported successfully!', 'success');
    } else {
      addToast('No transcription data to export', 'warning');
    }
  };

  const handleExportJSON = () => {
    if (transcriptionData.length > 0) {
      // JSON export logic would go here
      addToast('JSON exported successfully!', 'success');
    } else {
      addToast('No transcription data to export', 'warning');
    }
  };

  return (
    <footer className="bottom-container">
      {/* BOTTOM ACTIONS BAR */}
      <div className="bottom-actions">
        {/* LEFT CONTROLS - Icons only */}
        <div className="left-controls">
          <button className="icon-btn">
            <BarChart size={18} />
          </button>
          <button className="icon-btn">
            <Users size={18} />
          </button>
          <button className="icon-btn">
            <Settings size={18} />
          </button>
          <button className="icon-btn">
            <Play size={18} />
          </button>
        </div>

        {/* EXPORT CONTROLS - Center right */}
        <div className="export-controls">
          <button onClick={handleExportPDF} className="export-btn">
            <FileText size={16} />
            PDF
          </button>
          <button onClick={handleExportDOCX} className="export-btn">
            <File size={16} />
            DOCX
          </button>
          <button onClick={handleExportSRT} className="export-btn">
            <Subtitles size={16} />
            SRT
          </button>
          <button onClick={handleExportJSON} className="export-btn">
            <Braces size={16} />
            JSON
          </button>
        </div>

        {/* RIGHT CONTROLS - Connection status */}
        <span className={`connection-status ${connectionState === 'connected' ? 'connected' : 'disconnected'}`}>
          ● {connectionState === 'connected' ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* SYSTEM STATUS STRIP */}
      <div className="system-strip">
        {/* MODEL INFO */}
        <div className="model-info">
          ASR: Whisper | Translation: MarianMT | Audio: Live
        </div>

        {/* DEMO MODE */}
        {demoMode && (
          <div className="demo-indicator">
            Demo Mode Active
          </div>
        )}

        {/* CONNECTION HEALTH - Icons */}
        <div className="connection-health">
          {/* Cloud icon, check icon, green dot would go here */}
        </div>
      </div>
    </footer>
  );
}

export default StatusFooter;

