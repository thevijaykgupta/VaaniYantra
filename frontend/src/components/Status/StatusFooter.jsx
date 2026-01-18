import { FileText, File, Subtitles, Braces, BarChart, Users, Settings, Play } from 'lucide-react';
import { useAppState } from "../../context/AppStateContext.jsx";
import "./StatusFooter.css";

function StatusFooter() {
  const { connectionState, demoMode, transcriptionData, addToast, setActiveView } = useAppState();

  const generateSRT = (data) => {
    return data.map((line, i) => {
      const start = `00:00:${String(i * 3).padStart(2, "0")},000`;
      const end = `00:00:${String(i * 3 + 2).padStart(2, "0")},999`;
      return `${i + 1}\n${start} --> ${end}\n${line.text}\n\n`;
    }).join('\n');
  };

  const handleExportPDF = () => {
    if (!transcriptionData.length) {
      addToast('No transcription data to export', 'warning');
      return;
    }
    const content = generatePDFContent(transcriptionData);
    downloadFile('transcription.pdf', content, 'application/pdf');
    addToast('PDF exported successfully!', 'success');
  };

  const handleExportDOCX = () => {
    if (!transcriptionData.length) {
      addToast('No transcription data to export', 'warning');
      return;
    }
    const content = generateDOCXContent(transcriptionData);
    downloadFile('transcription.docx', content, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    addToast('DOCX exported successfully!', 'success');
  };

  const handleExportSRT = () => {
    if (!transcriptionData.length) {
      addToast('No transcription data to export', 'warning');
      return;
    }
    downloadFile('transcription.srt', generateSRT(transcriptionData), 'text/plain');
    addToast('SRT exported successfully!', 'success');
  };

  const handleExportJSON = () => {
    if(!transcriptionData.length){
      addToast('No transcription data to export', 'warning');
      return;
    }
    downloadFile('transcription.json', JSON.stringify(transcriptionData, null, 2), 'application/json');
    addToast('JSON exported successfully!', 'success');
  };

  const generatePDFContent = (data) => {
    // Simple text-based PDF content
    let content = '%PDF-1.4\n';
    content += '1 0 obj\n';
    content += '<<\n';
    content += '/Type /Catalog\n';
    content += '/Pages 2 0 R\n';
    content += '>>\n';
    content += 'endobj\n';

    content += '2 0 obj\n';
    content += '<<\n';
    content += '/Type /Pages\n';
    content += '/Kids [3 0 R]\n';
    content += '/Count 1\n';
    content += '>>\n';
    content += 'endobj\n';

    content += '3 0 obj\n';
    content += '<<\n';
    content += '/Type /Page\n';
    content += '/Parent 2 0 R\n';
    content += '/MediaBox [0 0 612 792]\n';
    content += '/Contents 4 0 R\n';
    content += '/Resources << /Font << /F1 5 0 R >> >>\n';
    content += '>>\n';
    content += 'endobj\n';

    // Add transcription content
    let textContent = 'BT\n';
    textContent += '/F1 12 Tf\n';
    textContent += '50 750 Td\n';
    textContent += '(Transcription Report) Tj\n';
    textContent += '0 -20 Td\n';

    data.forEach((item, index) => {
      const speaker = item.speaker || 'Speaker';
      const text = item.text || '';
      textContent += `(${speaker}: ${text}) Tj\n`;
      textContent += '0 -15 Td\n';
    });

    textContent += 'ET\n';

    content += `4 0 obj\n<< /Length ${textContent.length} >>\nstream\n${textContent}endstream\nendobj\n`;

    content += '5 0 obj\n';
    content += '<<\n';
    content += '/Type /Font\n';
    content += '/Subtype /Type1\n';
    content += '/BaseFont /Helvetica\n';
    content += '>>\n';
    content += 'endobj\n';

    content += 'xref\n';
    content += '0 6\n';
    content += '0000000000 65535 f \n';
    content += '0000000009 00000 n \n';
    content += '0000000058 00000 n \n';
    content += '0000000115 00000 n \n';
    content += 'trailer\n';
    content += '<<\n';
    content += '/Size 6\n';
    content += '/Root 1 0 R\n';
    content += '>>\n';
    content += 'startxref\n';
    content += '0\n';
    content += '%%EOF\n';

    return content;
  };

  const generateDOCXContent = (data) => {
    // Simple XML-based DOCX content (minimal implementation)
    let content = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    content += '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n';
    content += '<w:body>\n';

    // Title
    content += '<w:p><w:r><w:t>Transcription Report</w:t></w:r></w:p>\n';

    // Content
    data.forEach((item) => {
      const speaker = item.speaker || 'Speaker';
      const text = item.text || '';
      content += `<w:p><w:r><w:t>${speaker}: ${text}</w:t></w:r></w:p>\n`;
    });

    content += '</w:body>\n';
    content += '</w:document>\n';

    return content;
  };

  const downloadFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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
        <span className={`connection-status ${connectionState.status === 'connected' ? 'connected' : connectionState.status === 'disconnected' ? 'disconnected' : 'reconnecting'}`}>
          ● {connectionState.status === 'connected' ? `Connected (${connectionState.latency}ms)` :
             connectionState.status === 'reconnecting' ? 'Reconnecting...' :
             'Disconnected'}
        </span>
      </div>

    </footer>
  );
}

export default StatusFooter;

