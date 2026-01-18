let socket = null;

/**
 * Connect to backend audio WebSocket
 */
export function connectAudioSocket(roomId, onMessage, onStatus) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket(`ws://localhost:8000/ws/audio/${roomId}`);

  socket.onopen = () => {
    console.log("🔊 Audio WebSocket connected");
    if (onStatus) onStatus('CONNECTED');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 WS message received:", data);
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
    console.error("❌ WebSocket error:", err);
    if (onStatus) onStatus('DISCONNECTED');
  };

  socket.onclose = () => {
    console.log("🔴 Audio WebSocket closed");
    socket = null;
    if (onStatus) onStatus('DISCONNECTED');
  };

  return socket;
}

/**
 * Send base64 PCM chunk to backend
 */
export function sendAudioChunk(base64Data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log("❌ Cannot send audio chunk - socket not ready:", socket?.readyState);
    return;
  }

  console.log("🎤 Sending audio chunk, size:", base64Data.length);
  socket.send(
    JSON.stringify({
      type: "audio",
      data: base64Data,
    })
  );
}

// Export alias for backward compatibility
export { connectAudioSocket as connectAudioWS };