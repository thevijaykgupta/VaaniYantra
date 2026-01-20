let socket = null;
let isConnecting = false;
let heartbeatInterval = null;
let micControlCallback = null;
let reconnectInterval = null;
let reconnectAttempts = 0;
let maxReconnectAttempts = 10;
let currentRoomId = null;
let currentOnMessage = null;
let currentOnStatus = null;
let currentTargetLanguage = "en";
let intentionallyClosed = false;

/**
 * Set microphone control callback
 */
export function setMicControlCallback(callback) {
  micControlCallback = callback;
}

/**
 * Connect to backend audio WebSocket
 */
export function connectAudioSocket(roomId, onMessage, onStatus, targetLanguage = "en") {
  // BLOCK Cursor preview WebSocket connections
  if (navigator.userAgent.includes("Cursor")) {
    console.warn("Skipping WS in Cursor preview");
    return null;
  }

  // Store connection parameters for reconnection
  currentRoomId = roomId;
  currentOnMessage = onMessage;
  currentOnStatus = onStatus;
  currentTargetLanguage = targetLanguage;

  // Reset intentional close flag on new connection attempt
  intentionallyClosed = false;

  // Reset reconnection attempts on new connection attempt
  reconnectAttempts = 0;
  if (reconnectInterval) {
    clearTimeout(reconnectInterval);
    reconnectInterval = null;
  }

  // Prevent multiple simultaneous connections
  if (isConnecting) {
    console.log("Already connecting to WebSocket...");
    return null;
  }

  // HARD GUARD: Block any connection attempt if WebSocket is already active
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.warn("WS already active — refusing new connection");
    return socket;
  }

  // If already connected to the same room, return existing socket
  if (socket && socket.readyState === WebSocket.OPEN && currentRoomId === roomId) {
    console.log("WebSocket already connected to room:", roomId);
    return socket;
  }

  // Clean up any existing connection before creating new one
  disconnectAudioSocket();

  console.log("Connecting to audio WebSocket...");
  isConnecting = true;

  try {
    socket = new WebSocket(`ws://localhost:8000/ws/audio/${roomId}`);

    socket.onopen = () => {
      console.log("Audio WebSocket connected");
      isConnecting = false;
      reconnectAttempts = 0; // Reset reconnection attempts on successful connection
      window.audioSocketState = 'CONNECTED'; // Global state for debugging

      if (onStatus) onStatus('CONNECTED');

      // Send target language configuration
      socket.send(JSON.stringify({
        type: "config",
        target_language: targetLanguage
      }));
      console.log("🎯 Sent target language config:", targetLanguage);

      // Immediately signal that microphone can start
      if (micControlCallback) {
        micControlCallback('START_ALLOWED');
      }

      // Note: Using WebSocket protocol ping/pong instead of JSON messages
      // Backend handles keepalive with timeout-based pings
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WS message received:", data);

        // Handle connection confirmation
        if (data.type === "connected") {
          console.log("📩 WebSocket connected confirmation:", data.type);
          return;
        }

        // 🚫 BLOCK: Reject any ping/pong messages
        if (data.type === "ping" || data.type === "pong") {
          console.error("🚫 BLOCKED: Received forbidden ping/pong message:", data);
          return;
        }

        if (onMessage) {
          console.log("📩 Calling onMessage callback with:", data);
          onMessage(data);
        }
      } catch (e) {
        console.log("📩 WS raw message:", event.data);
        console.error("📩 Failed to parse WS message:", e);
      }
    };

    socket.onerror = (err) => {
      console.warn("⚠️ WebSocket error (non-fatal):", err);
      isConnecting = false;

      // ❌ DO NOT stop mic on WS errors - let reconnection handle it
      // Only stop on permanent disconnects (onclose)

      if (onStatus) onStatus('DISCONNECTED');
    };

    socket.onclose = (event) => {
      console.log("🔴 Audio WebSocket closed", event.code, event.reason);
      isConnecting = false;
      window.audioSocketState = 'CLOSED'; // Global state for debugging

      // Check if this was an intentional close
      if (intentionallyClosed) {
        console.log("🔌 Intentional close — no reconnection");
        if (micControlCallback) {
          micControlCallback('STOP_IMMEDIATE');
        }
        // Clean up heartbeat
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
        socket = null;
        return;
      }

      // TEMPORARILY DISABLED: Auto-reconnect and mic stopping logic
      console.log("🔌 WS closed - auto-reconnect disabled for testing");
      // Don't stop mic on WebSocket close during testing

      // Small delay to ensure mic stop completes
      setTimeout(() => {
        // Clean up heartbeat
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }

        // NOW set socket to null (after mic is stopped)
        socket = null;

        // TEMPORARILY DISABLED: Auto-reconnect logic
        // if (reconnectAttempts < maxReconnectAttempts && currentRoomId) {
        //   reconnectAttempts++;
        //   console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
        //
        //   reconnectInterval = setTimeout(() => {
        //     if (currentRoomId && currentOnMessage && currentOnStatus) {
        //       connectAudioSocket(currentRoomId, currentOnMessage, currentOnStatus);
        //     }
        //   }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)); // Exponential backoff
        // } else {
          console.log("❌ Connection lost - no auto-reconnect");
          if (onStatus) onStatus('DISCONNECTED');
        // }
      }, 100); // 100ms delay for mic cleanup
    };

    return socket;
  } catch (error) {
    console.error("❌ Failed to create WebSocket:", error);
    isConnecting = false;
    if (onStatus) onStatus('DISCONNECTED');
    return null;
  }
}

/**
 * Disconnect the audio WebSocket
 */
export function disconnectAudioSocket() {
  console.log("🔌 Disconnecting audio WebSocket...");

  isConnecting = false;
  intentionallyClosed = true; // Mark as intentional close
  reconnectAttempts = maxReconnectAttempts; // Prevent reconnection

  // Clear reconnection timer
  if (reconnectInterval) {
    clearTimeout(reconnectInterval);
    reconnectInterval = null;
  }

  // Clear heartbeat
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  // Close socket if it exists
  if (socket) {
    try {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "Client disconnect");
      }
    } catch (e) {
      console.error("❌ Error closing socket:", e);
    }
    socket = null;
  }
}

/**
 * Get current socket state
 */
export function getSocketState() {
  if (!socket) return 'DISCONNECTED';
  switch (socket.readyState) {
    case WebSocket.CONNECTING: return 'CONNECTING';
    case WebSocket.OPEN: return 'CONNECTED';
    case WebSocket.CLOSING: return 'CLOSING';
    case WebSocket.CLOSED: return 'DISCONNECTED';
    default: return 'UNKNOWN';
  }
}

/**
 * Send raw PCM audio buffer to backend (binary mode)
 */
export function sendAudioChunk(audioBuffer) {
  // Triple check socket state for robustness
  if (!socket) {
    console.error("❌ Cannot send audio chunk - no socket");
    return false;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    console.error("❌ Cannot send audio chunk - socket not open:", socket.readyState);
    return false;
  }

  try {
    console.log("🎤 Sending raw audio chunk, size:", audioBuffer.byteLength, "bytes");
    // Send raw binary data directly - NO JSON, NO base64
    socket.send(audioBuffer);
    return true;
  } catch (error) {
    console.error("❌ Failed to send audio chunk:", error);
    return false;
  }
}

// Export alias for backward compatibility
export { connectAudioSocket as connectAudioWS };
