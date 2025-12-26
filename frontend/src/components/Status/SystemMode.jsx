function SystemMode({ connectionStatus }) {
  const getMode = (status) => {
    return status === 'CONNECTED' ? 'ONLINE' : 'OFFLINE';
  };

  const mode = getMode(connectionStatus);

  return (
    <div className={`mode-indicator ${mode}`}>
      Mode: {mode}
    </div>
  );
}

export default SystemMode;

