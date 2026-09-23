export type Language = "EN" | "TA";

const dictionary = {
  EN: {
    platform: "AUREX LMS",
    tagline: "Workshops, attendance, and lifelong learning",
    home: "Home",
    workshops: "Workshops",
    about: "About",
    login: "Log in",
    register: "Create account",
    logout: "Log out",
    dashboard: "Dashboard",
    language: "தமிழ்",
    verify: "Verify certificate",
  },
  TA: {
    platform: "AUREX கற்றல் தளம்",
    tagline: "பட்டறைகள், வருகை மற்றும் வாழ்நாள் கற்றல்",
    home: "முகப்பு",
    workshops: "பட்டறைகள்",
    about: "பற்றி",
    login: "உள்நுழை",
    register: "கணக்கு உருவாக்கு",
    logout: "வெளியேறு",
    dashboard: "கட்டுப்பாட்டுப் பலகை",
    language: "English",
    verify: "சான்றிதழ் சரிபார்ப்பு",
  },
} as const;

export type MessageKey = keyof (typeof dictionary)["EN"];

export function translate(language: Language, key: MessageKey): string {
  return dictionary[language][key];
}
