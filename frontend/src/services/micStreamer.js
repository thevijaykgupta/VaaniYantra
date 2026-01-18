import { sendAudioChunk } from "./audioSocket";

let audioContext = null;
let processor = null;
let source = null;
let stream = null;

export async function startMicStreaming(onWebSocketStatus) {
  // Clean up any existing streaming first
  stopMicStreaming();

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
      // Only process if we have an active websocket connection
      if (onWebSocketStatus && !onWebSocketStatus()) {
        console.log("🔇 Skipping audio processing - websocket not connected");
        return;
      }

      const input = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);

      // Convert float32 to int16 PCM
      for (let i = 0; i < input.length; i++) {
        pcm[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
      }

      // Convert to base64
      const pcmBytes = new Uint8Array(pcm.buffer);
      const base64 = btoa(String.fromCharCode(...pcmBytes));

      sendAudioChunk(base64);
    };

    // Connect the audio graph
    source.connect(processor);
    processor.connect(audioContext.destination);

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
  console.log("🛑 Stopping microphone streaming");

  // Disconnect and clean up processor
  if (processor) {
    processor.disconnect();
    processor = null;
  }

  // Disconnect source
  if (source) {
    source.disconnect();
    source = null;
  }

  // Close audio context
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }

  // Stop media tracks
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

export function isMicStreaming() {
  return audioContext !== null && audioContext.state === 'running';
}