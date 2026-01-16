let socket = null;

/**
 * Connect to backend audio WebSocket
 */
export function connectAudioSocket(roomId) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket(`ws://127.0.0.1:8000/ws/audio/${roomId}`);

  socket.onopen = () => {
    console.log("🔊 Audio WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 WS message:", data);
    } catch {
      console.log("📩 WS raw:", event.data);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("🔴 Audio WebSocket closed");
    socket = null;
  };

  return socket;
}

/**
 * Send base64 PCM chunk to backend
 */
export function sendAudioChunk(base64Data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(
    JSON.stringify({
      type: "audio",
      data: base64Data,
    })
  );
}

// Export alias for backward compatibility
export { connectAudioSocket as connectAudioWS };