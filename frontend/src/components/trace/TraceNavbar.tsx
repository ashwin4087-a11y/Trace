import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useNotifications } from "../../hooks/useNotifications";

export function TraceNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useApp();
  const { data: notifications } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications?.filter((n) => !n.readAt).length ?? 0;

  const navItems = [
    { path: "/workshops", label: language === "TA" ? "கண்டுபிடி" : "Discover" },
    { path: "/participant", label: language === "TA" ? "கற்றல்" : "Learn", exact: true },
    { path: "/participant/communities", label: language === "TA" ? "சமூகங்கள்" : "Communities" },
    { path: "/participant/learning-paths", label: language === "TA" ? "கற்றல் பாதைகள்" : "Learning Paths" },
    { path: "/participant/skills", label: language === "TA" ? "திறன் கடவுச்சீட்டு" : "Skill Passport" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/workshops?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const userInitial = user?.firstName?.[0]?.toUpperCase() ?? "S";
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Scholar";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFEDDB]/95 backdrop-blur-md border-b border-[#DFC1B0]">
      <div className="h-20 max-w-[1240px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/participant" className="flex items-center gap-2.5 group">
            {/* TRACE Logo Symbol: Charcoal T with Terracotta Stroke */}
            <div className="w-9 h-9 rounded-lg bg-[#1A1412] flex items-center justify-center relative overflow-hidden shadow-sm border border-[#DFC1B0]">
              <span className="font-serif text-xl font-bold text-[#FFEDDB] z-10 leading-none">T</span>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#BF9270] rounded-tl-full opacity-90"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#E3B7A0]/40"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-semibold text-[#1A1412] tracking-tight group-hover:text-[#BF9270] transition-colors">
                TRACE
              </span>
              <span className="h-4 w-px bg-[#DFC1B0]"></span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#5F524B]">
                Academia
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`font-sans text-sm transition-colors py-1 relative ${
                  active
                    ? "text-[#BF9270] font-semibold border-b-2 border-[#BF9270] -mb-[2px]"
                    : "text-[#5F524B] hover:text-[#1A1412] font-normal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & User Info */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search Archive"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#EDCDBB]/50 text-[#261D1A] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Bilingual Toggle */}
          <div className="hidden sm:flex items-center font-sans text-xs text-[#5F524B] border border-[#DFC1B0] rounded-full px-3 py-1 bg-[#FFFFFF]/60">
            <button
              onClick={() => setLanguage("EN")}
              className={`transition-colors font-medium ${
                language === "EN" ? "text-[#1A1412] font-bold" : "text-[#5F524B] hover:text-[#BF9270]"
              }`}
            >
              EN
            </button>
            <span className="mx-1.5 text-[#DFC1B0]">/</span>
            <button
              onClick={() => setLanguage("TA")}
              className={`transition-colors ${
                language === "TA" ? "text-[#1A1412] font-bold font-serif" : "text-[#5F524B] hover:text-[#BF9270]"
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Notifications Trigger */}
          <Link
            to="/participant/notifications"
            aria-label="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#EDCDBB]/50 text-[#261D1A] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#BF9270] ring-2 ring-[#FFEDDB]" />
            )}
          </Link>

          <div className="h-5 w-px bg-[#DFC1B0] hidden sm:block"></div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1">
            <div className="hidden xl:flex flex-col text-right">
              <span className="font-sans text-xs font-semibold text-[#1A1412] leading-none">{fullName}</span>
              <span className="font-sans text-[11px] text-[#5F524B] mt-0.5">Scholar</span>
            </div>
            <div
              className="w-8 h-8 rounded-full bg-[#BF9270] text-[#FFEDDB] flex items-center justify-center font-serif text-sm font-semibold ring-1 ring-[#DFC1B0] shadow-xs cursor-pointer"
              title={`${fullName} - Click to log out`}
              onClick={() => {
                if (window.confirm("Do you wish to log out?")) logout();
              }}
            >
              {userInitial}
            </div>
          </div>

          {/* Mobile Hamburger Menu */}
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

      {/* Inline Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#DFC1B0] bg-[#FFFFFF] px-4 py-3 shadow-md">
          <form onSubmit={handleSearchSubmit} className="max-w-[1240px] mx-auto flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5F524B]">search</span>
            <input
              type="text"
              placeholder={language === "TA" ? "பட்டறைகள், திறன்களைத் தேடுங்கள்..." : "Search workshops, skills, topics..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-[#1A1412] focus:outline-none placeholder:text-[#5F524B]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#BF9270] text-[#FFEDDB] text-xs font-semibold rounded-lg hover:bg-[#261D1A] transition-colors"
            >
              {language === "TA" ? "தேடு" : "Search"}
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-xs text-[#5F524B] hover:text-[#1A1412] px-2"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DFC1B0] bg-[#FFEDDB] px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#DFC1B0]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5F524B]">Menu</span>
            <div className="flex items-center font-sans text-xs text-[#5F524B] border border-[#DFC1B0] rounded-full px-2.5 py-0.5 bg-[#FFFFFF]">
              <button
                onClick={() => setLanguage("EN")}
                className={`font-medium ${language === "EN" ? "text-[#1A1412] font-bold" : "text-[#5F524B]"}`}
              >
                EN
              </button>
              <span className="mx-1 text-[#DFC1B0]">/</span>
              <button
                onClick={() => setLanguage("TA")}
                className={`font-serif ${language === "TA" ? "text-[#1A1412] font-bold" : "text-[#5F524B]"}`}
              >
                தமிழ்
              </button>
            </div>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                isActive(item.path, item.exact)
                  ? "bg-[#BF9270] text-[#FFEDDB] font-semibold"
                  : "text-[#1A1412] hover:bg-[#EDCDBB]/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#DFC1B0] flex items-center justify-between text-xs text-[#5F524B]">
            <span>Signed in as <strong className="text-[#1A1412]">{fullName}</strong></span>
            <button
              onClick={() => logout()}
              className="text-[#BF9270] font-semibold hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
