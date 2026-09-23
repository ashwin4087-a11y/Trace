import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { homeForRole } from "../../context/AuthContext";
import { TraceLogo } from "../trace/TraceLogo";

export function Navbar() {
  const { t, language, setLanguage } = useApp();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFEDDB]/95 backdrop-blur-md border-b border-[#DFC1B0]">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-4 px-4 md:px-8">
        <TraceLogo to="/" size="md" />

        <nav className="hidden lg:flex items-center gap-8 text-sm font-sans">
          <NavLink
            to="/workshops"
            className={({ isActive }) =>
              `transition-colors py-1 ${
                isActive ? "text-[#BF9270] font-semibold border-b-2 border-[#BF9270] -mb-[2px]" : "text-[#5F524B] hover:text-[#1A1412]"
              }`
            }
          >
            {t("workshops")}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `transition-colors py-1 ${
                isActive ? "text-[#BF9270] font-semibold border-b-2 border-[#BF9270] -mb-[2px]" : "text-[#5F524B] hover:text-[#1A1412]"
              }`
            }
          >
            {t("about")}
          </NavLink>
          <NavLink
            to="/verify/lookup"
            className={({ isActive }) =>
              `transition-colors py-1 ${
                isActive ? "text-[#BF9270] font-semibold border-b-2 border-[#BF9270] -mb-[2px]" : "text-[#5F524B] hover:text-[#1A1412]"
              }`
            }
          >
            {t("verify")}
          </NavLink>
          {user ? (
            <NavLink
              to={homeForRole(user.role)}
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive ? "text-[#BF9270] font-semibold border-b-2 border-[#BF9270] -mb-[2px]" : "text-[#5F524B] hover:text-[#1A1412]"
                }`
              }
            >
              {t("dashboard")}
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {/* Bilingual Toggle */}
          <div className="hidden sm:flex items-center font-sans text-xs text-[#5F524B] border border-[#DFC1B0] rounded-full px-3 py-1 bg-[#FFFFFF]/60">
            <button
              onClick={() => setLanguage(language === "EN" ? "TA" : "EN")}
              className={`transition-colors font-medium ${language === "EN" ? "text-[#1A1412] font-bold" : "text-[#5F524B]"}`}
            >
              EN
            </button>
            <span className="mx-1.5 text-[#DFC1B0]">/</span>
            <button
              onClick={() => setLanguage(language === "TA" ? "EN" : "TA")}
              className={`transition-colors ${language === "TA" ? "text-[#1A1412] font-bold font-serif" : "text-[#5F524B]"}`}
            >
              தமிழ்
            </button>
          </div>

          {user ? (
            <button
              onClick={() => void logout()}
              className="px-4 py-1.5 rounded-lg border border-[#DFC1B0] bg-[#FFFFFF] text-xs font-semibold text-[#1A1412] hover:bg-[#FFEDDB] transition-colors"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg bg-[#BF9270] text-xs font-semibold text-[#FFEDDB] hover:bg-[#261D1A] transition-colors shadow-xs"
            >
              {t("login")}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#1A1412] hover:bg-[#EDCDBB]/50"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DFC1B0] bg-[#FFEDDB] px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg">
          <NavLink
            to="/workshops"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg text-sm text-[#1A1412] hover:bg-[#EDCDBB]/50"
          >
            {t("workshops")}
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg text-sm text-[#1A1412] hover:bg-[#EDCDBB]/50"
          >
            {t("about")}
          </NavLink>
          <NavLink
            to="/verify/lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg text-sm text-[#1A1412] hover:bg-[#EDCDBB]/50"
          >
            {t("verify")}
          </NavLink>
          {user ? (
            <NavLink
              to={homeForRole(user.role)}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm text-[#1A1412] hover:bg-[#EDCDBB]/50"
            >
              {t("dashboard")}
            </NavLink>
          ) : null}
        </div>
      )}
    </header>
  );
}
