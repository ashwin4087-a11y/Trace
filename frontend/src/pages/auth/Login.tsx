import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { MainLayout } from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <MainLayout>
      <form
        className="mx-auto grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await login(email, password);
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <h1 className="text-2xl font-bold">Log in</h1>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error ? <ErrorState message={error} /> : null}
        <Button type="submit">Log in</Button>
        <Link to="/forgot-password" className="text-sm text-brand">Forgot password</Link>
        <Link to="/register" className="text-sm">Create a participant account</Link>
      </form>
    </MainLayout>
  );
}
