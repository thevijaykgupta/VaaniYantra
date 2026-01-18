export default function TopBar({ user }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <img src="/logo.svg" />
        <span>VAANIYANTRA</span>
      </div>

      <div className="topbar-center">
        DSP Lecture → English → Hindi • Live 320ms
      </div>

      <div className="topbar-right">
        <select>Hindi</select>
        <div className="profile">
          <img src={user?.photoURL} />
          <span>Hello, {user?.name}</span>
        </div>
      </div>
    </div>
  );
}