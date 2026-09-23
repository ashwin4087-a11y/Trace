import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, type Language, type MessageKey } from "../lib/i18n";

type AppState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem("aurex-lang") as Language) || "EN",
  );

  useEffect(() => {
    localStorage.setItem("aurex-lang", language);
    document.documentElement.lang = language === "TA" ? "ta" : "en";
  }, [language]);

  const value = useMemo<AppState>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key) => translate(language, key),
    }),
    [language],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
