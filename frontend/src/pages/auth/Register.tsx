import { useState } from "react";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { MainLayout } from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";

export function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", preferredLanguage: "EN" as "EN" | "TA" | "EN_TA" });
  const [error, setError] = useState("");
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <MainLayout>
      <form
        className="mx-auto grid max-w-md gap-3"
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
        <h1 className="text-2xl font-bold">Create account</h1>
        <Input label="First name" value={form.firstName} onChange={(event) => set("firstName", event.target.value)} required />
        <Input label="Last name" value={form.lastName} onChange={(event) => set("lastName", event.target.value)} required />
        <Input label="Email" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} required />
        <Input label="Password" type="password" value={form.password} onChange={(event) => set("password", event.target.value)} required />
        <Select label="Preferred language" value={form.preferredLanguage} onChange={(event) => set("preferredLanguage", event.target.value)}>
          <option value="EN">English</option>
          <option value="TA">Tamil</option>
          <option value="EN_TA">Tamil + English</option>
        </Select>
        {error ? <ErrorState message={error} /> : null}
        <Button type="submit">Register</Button>
      </form>
    </MainLayout>
  );
}
