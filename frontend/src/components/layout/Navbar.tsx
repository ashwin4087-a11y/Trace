import { Link, NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { homeForRole } from "../../context/AuthContext";
import { Button } from "../common/Button";

export function Navbar() {
  const { t, language, setLanguage } = useApp();
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand">{t("platform")}</Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <NavLink to="/workshops">{t("workshops")}</NavLink>
          <NavLink to="/about">{t("about")}</NavLink>
          <NavLink to="/verify/lookup">{t("verify")}</NavLink>
          {user ? <NavLink to={homeForRole(user.role)}>{t("dashboard")}</NavLink> : null}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLanguage(language === "EN" ? "TA" : "EN")}>{t("language")}</Button>
          {user ? <Button variant="secondary" onClick={() => void logout()}>{t("logout")}</Button> : <Link to="/login"><Button>{t("login")}</Button></Link>}
        </div>
      </div>
    </header>
  );
}
