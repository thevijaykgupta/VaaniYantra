import OriginalTranscription from "../../Transcription/OriginalTranscription.jsx";
import LiveTranslation from "../../Transcription/LiveTranslation.jsx";
import { useAppState } from "../../../context/AppStateContext.jsx";
import "./CenterStagePanels.css";

function CenterStagePanels() {
  const { transcriptionData, demoMode } = useAppState();

  return (
    <div className="center-panels">
      <OriginalTranscription
        transcriptionData={demoMode ? [] : transcriptionData}
      />
      <LiveTranslation
        transcriptionData={demoMode ? [] : transcriptionData}
      />
    </div>
  );
}

export default CenterStagePanels;