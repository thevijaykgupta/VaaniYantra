function ConnectionStatus({ status }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONNECTED':
        return 'var(--status-connected)';
      case 'DISCONNECTED':
        return 'var(--status-disconnected)';
      case 'RECONNECTING':
        return 'var(--status-reconnecting)';
      default:
        return 'var(--status-disconnected)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONNECTED':
        return 'Connected';
      case 'DISCONNECTED':
        return 'Disconnected';
      case 'RECONNECTING':
        return 'Reconnecting';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={`connection-status ${status?.toLowerCase()}`}
      title={`Status: ${status}`}
    >
      <span
        className="dot"
        style={{ backgroundColor: getStatusColor(status) }}
      />
      {getStatusText(status)}
    </div>
  );
}

export default ConnectionStatus;

