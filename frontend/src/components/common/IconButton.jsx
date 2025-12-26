function IconButton({ icon, onClick, disabled, className = '', title }) {
  return (
    <button
      className={`icon-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
}

export default IconButton;

