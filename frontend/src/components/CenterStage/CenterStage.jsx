import "./CenterStage.css";
// import { useEffect } from "react";
// import { startMicStreaming } from "../../services/micStreamer.js";
import SessionBar from "../SessionBar/SessionBar.jsx"
// import CenterStageSession from "./CenterStageSession/CenterStageSession";
import CenterStageChakra from "./CenterStageChakra/CenterStageChakra.jsx";
import CenterStagePanels from "./CenterStagePanels/CenterStagePanels.jsx";

export default function CenterStage() {
  // Removed automatic mic streaming - now controlled by capture button in Chakra component
  // useEffect(() => {
  //   startMicStreaming();
  // }, []);

  return (
    <div className="center-stage glass-panels">
      <SessionBar/>
      <CenterStageChakra />
      <CenterStagePanels />
    </div>
  );
}