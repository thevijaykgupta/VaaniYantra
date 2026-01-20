import { sendAudioChunk, getSocketState, setMicControlCallback } from "./audioSocket";

let audioContext = null;
let processor = null;
let source = null;
let stream = null;
let isStreaming = false;
let isStartAllowed = false;
let hasEverStarted = false; // ONE-WAY flag - once started, never auto-reset

// Set up microphone control callback from websocket
setMicControlCallback((action) => {
  console.log("🎤 Microphone control signal:", action, "| currently streaming:", isStreaming, "| everStarted:", hasEverStarted);

  if (action === 'START_ALLOWED') {
    isStartAllowed = true;
    hasEverStarted = true; // ONE-WAY: Once started, never auto-reset
    console.log("✅ Microphone start allowed by websocket");
  } else if (action === 'STOP_IMMEDIATE') {
    isStartAllowed = false;
    console.log("🛑 Immediate microphone stop requested by websocket");
    // Immediately stop streaming
    if (isStreaming) {
      console.log("🛑 Executing immediate stop from WS callback");
      stopMicStreaming();
    } else {
      console.log("ℹ️ Microphone was already stopped");
    }
  } else if (action === 'PAUSE_TEMPORARY') {
    // ⏸️ Temporary pause - but don't reset allowed flag if mic has ever started
    if (!hasEverStarted) {
      isStartAllowed = false;
    }
    console.log("⏸️ Temporary microphone pause requested by websocket (will resume on reconnect)");
    // Don't stop streaming, just pause by blocking new audio chunks
    // This allows automatic resume when START_ALLOWED is called again
  }
});

export async function startMicStreaming(onWebSocketStatus) {
  // 🚫 CRITICAL GUARD: Prevent duplicate streaming
  if (isStreaming) {
    console.warn("⚠️ Mic already streaming — ignoring duplicate start");
    return; // Silently return, don't throw error
  }

  // Note: WebSocket permission check removed - rely on hasEverStarted flag

  console.log("🎤 Starting microphone streaming...");
  // Clean up any existing streaming first
  stopMicStreaming();

  // 🔧 FORCE ALLOW: Once mic starts, audio must flow continuously
  isStartAllowed = true;
  hasEverStarted = true;

  try {
    // Get microphone access
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // Create audio context
    audioContext = new AudioContext({ sampleRate: 16000 });

    // Create nodes
    source = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    // Set up audio processing
    processor.onaudioprocess = (e) => {
      console.log(
        "🎧 onaudioprocess fired | streaming:",
        isStreaming,
        "| socket:",
        window.audioSocketState || "unknown"
      );

      // 🚫 ABSOLUTE FIRST CHECK: Block if not supposed to stream
      if (!isStreaming) {
        return; // HARD BLOCK - no processing
      }

      // 🚫 SECOND CHECK: Skip sending if websocket is not connected
      if (getSocketState() !== 'CONNECTED') {
        console.warn("🚫 Audio blocked — WebSocket not connected, skipping this chunk");
        return; // Skip this audio chunk, don't stop mic
      }

      try {
        const input = e.inputBuffer.getChannelData(0);

        // Convert float32 to int16 PCM
        const pcm16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
        }

        // Send RAW BINARY DATA directly - no JSON, no base64
        const sent = sendAudioChunk(pcm16.buffer);
        if (!sent) {
          console.warn("⚠️ Failed to send audio chunk - will retry on next chunk");
          // Don't stop mic, let it retry on next audio chunk
        }
      } catch (error) {
        console.error("❌ Error processing audio chunk:", error);
        // Don't stop mic on processing errors - let it continue
      }
    };

    // Connect the audio graph
    source.connect(processor);
    processor.connect(audioContext.destination);

    isStreaming = true;
    console.log("🎤 Microphone streaming started");
    return true;

  } catch (error) {
    console.error("❌ Failed to start microphone streaming:", error);
    // Clean up on error
    stopMicStreaming();
    throw error;
  }
}

export function stopMicStreaming() {
  console.log("🛑 HARD STOP microphone streaming");

  // CRITICAL: Set flags FIRST to prevent any new processing
  isStreaming = false;
  isStartAllowed = false;
  hasEverStarted = false; // Reset for next start

  // 🔥 CRITICAL: Immediately detach the audio processor event handler
  if (processor) {
    try {
      processor.onaudioprocess = null; // This prevents onaudioprocess from firing
      processor.disconnect();
      console.log("🔌 Processor disconnected and event handler detached");
    } catch (e) {
      console.error("Error disconnecting processor:", e);
    }
    processor = null;
  }

  // Disconnect source
  if (source) {
    try {
      source.disconnect();
      console.log("🔌 Audio source disconnected");
    } catch (e) {
      console.error("Error disconnecting source:", e);
    }
    source = null;
  }

  // Close audio context
  if (audioContext && audioContext.state !== 'closed') {
    try {
      audioContext.close();
      console.log("🔌 Audio context closed");
    } catch (e) {
      console.error("Error closing audio context:", e);
    }
    audioContext = null;
  }

  // Stop media tracks
  if (stream) {
    try {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped media track:", track.label);
      });
    } catch (e) {
      console.error("Error stopping media tracks:", e);
    }
    stream = null;
  }

  console.log("✅ Microphone streaming completely stopped");
}

export function isMicStreaming() {
  return isStreaming && audioContext !== null && audioContext.state === 'running';
}
