import { useState, useEffect, useRef } from 'react';

function useWebSocket(url) {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [transcriptionData, setTranscriptionData] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimeout;

    function connect() {
      setConnectionStatus('RECONNECTING');

      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setConnectionStatus('CONNECTED');
      };

      wsRef.current.onclose = () => {
        setConnectionStatus('DISCONNECTED');
        // Auto-retry connection after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };

      wsRef.current.onerror = () => {
        wsRef.current.close();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript' || data.text) {
            setTranscriptionData(prev => [...prev, data]);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    connectionStatus,
    transcriptionData,
    sendMessage
  };
}

export default useWebSocket;

