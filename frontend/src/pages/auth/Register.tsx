import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { PasswordInput } from "../../components/common/PasswordInput";
import { Select } from "../../components/common/Select";
import { MainLayout } from "../../components/layout/MainLayout";
import { TraceLogo } from "../../components/trace/TraceLogo";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";

const INTEREST_OPTIONS = [
  "Technology",
  "AI & ML",
  "Cybersecurity",
  "Law",
  "Business",
  "Entrepreneurship",
  "Design",
  "Finance",
  "Research",
  "Leadership",
  "Social Impact",
  "Communication",
];

export function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    preferredLanguage: "EN" as "EN" | "TA" | "EN_TA",
    interests: [] as string[],
  });
  const [error, setError] = useState("");
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toggleInterest = (interest: string) => setForm((current) => ({
    ...current,
    interests: current.interests.includes(interest)
      ? current.interests.filter((item) => item !== interest)
      : [...current.interests, interest],
  }));

  return (
    <MainLayout>
      <div className="mx-auto max-w-md my-6 md:my-10">
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await register(form);
            } catch (caught) {
              setError(errorText(caught));
            }
          }}
        >
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-[#DFC1B0]/60">
            <TraceLogo size="lg" to="/" />
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-normal mt-1">Scholar Registration</h1>
              <p className="font-sans text-xs text-[#5F524B] mt-1">
                Create your academic account to enroll in accredited workshops and build your skill passport.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(event) => set("firstName", event.target.value)} required />
            <Input label="Last name" value={form.lastName} onChange={(event) => set("lastName", event.target.value)} required />
          </div>

          <Input label="Email Address" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} required />
          <PasswordInput label="Password" value={form.password} onChange={(event) => set("password", event.target.value)} required />

          <Select label="Preferred Language" value={form.preferredLanguage} onChange={(event) => set("preferredLanguage", event.target.value)}>
            <option value="EN">English</option>
            <option value="TA">Tamil (தமிழ்)</option>
            <option value="EN_TA">Bilingual (English + தமிழ்)</option>
          </Select>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-[#1A1412]">Areas of interest</legend>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <label key={interest} className="flex items-center gap-2 text-xs text-[#5F524B]">
                  <input
                    type="checkbox"
                    checked={form.interests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className="accent-[#BF9270]"
                  />
                  {interest}
                </label>
              ))}
            </div>
          </fieldset>

          {error ? <ErrorState message={error} /> : null}

          <Button type="submit" className="w-full py-2.5 bg-[#BF9270] text-[#FFEDDB] font-semibold rounded-lg hover:opacity-90">
            Create Scholar Account
          </Button>

          <div className="pt-3 border-t border-[#DFC1B0]/60 flex items-center justify-center gap-1.5 text-xs font-sans text-[#5F524B]">
            <span>Already have an account?</span>
            <Link to="/login" className="text-[#BF9270] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
