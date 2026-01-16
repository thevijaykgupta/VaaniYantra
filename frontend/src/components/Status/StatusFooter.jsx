import { FileText, File, Subtitles, Braces, BarChart, Users, Settings, Play } from 'lucide-react';
import { useAppState } from "../../context/AppStateContext.jsx";
import "./StatusFooter.css";

function StatusFooter() {
  const { connectionState, demoMode, transcriptionData, addToast } = useAppState();

  const generateSRT = (data) => {
    data.map((line,i)=>{
      const start ='00:00:${String(i*3)).padStart(2,"0)},000';
      const end ='00:00:${String(i*3+2)).padStart(2,"0)},999';
      return `${i+1}\n${start} --> ${end}\n${line.text}\n\n`;
    }).join('\n');
  }

  const handleExportPDF = () => {
    addToast('PDF export coming soon!', 'info');
  };

  const handleExportDOCX = () => {
    addToast('DOCX export coming soon!', 'info');
  };

  const handleExportSRT = () => {
    if (!transcriptionData.length) {
      addToast('No transcription data to export', 'warning');
      return;
    }
    downloadFile('transcription.srt', generateSRT(transcriptionData));
    addToast('SRT exported successfully!', 'success');
  };

  const handleExportJSON = () => {
    if(!transcriptionData.length){
      addToast('No transcription data to export', 'warning');
      return;
    }
    downloadFile('transcription.json', JSON.stringify(transcriptionData, null, 2));
    addToast('JSON exported successfully!', 'success');
  };
  const downloadFile = (filename, content) => {
    const blob=new Blob([content], { type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <footer className="bottom-container">
      {/* BOTTOM ACTIONS BAR */}
      <div className="bottom-actions">
        {/* LEFT CONTROLS - Icons only */}
        <div className="left-controls">
          <button className="icon-btn" onClick={() => setActiveView('ANALYTICS')}>
            <BarChart size={18} />
          </button>
          <button className="icon-btn" onClick={() => setActiveView("DIARIZATION")}>
            <Users size={18} />
          </button>
          <button className="icon-btn" onClick={() => setActiveView("SETTINGS")}>
            <Settings size={18} />
          </button>
          <button className="icon-btn" onClick={() => setActiveView("LIVE")}>
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

    </footer>
  );
}

export default StatusFooter;

