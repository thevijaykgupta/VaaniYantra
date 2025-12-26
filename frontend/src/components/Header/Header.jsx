import AuthButtons from "./AuthButtons";
import { LANGUAGES } from "../../utils/constants";

function Header({ user, onShowAuth, onLogout }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <div className="brand-info">
          <h1 className="brand-title">VAANIYANTRA</h1>
          <p className="brand-subtitle">Where Every Language Speaks Every Language</p>
        </div>
      </div>

      <div className="header-right">
        <select className="language-selector">
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <AuthButtons
          user={user}
          onShowAuth={onShowAuth}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}

export default Header;