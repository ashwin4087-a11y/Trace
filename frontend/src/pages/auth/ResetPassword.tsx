import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { MainLayout } from "../../components/layout/MainLayout";
import { errorText } from "../../lib/errors";
import { resetPassword } from "../../services/auth.service";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return (
    <MainLayout>
      <form
        className="mx-auto grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await resetPassword(token, password);
            setDone(true);
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <h1 className="text-2xl font-bold">Reset password</h1>
        <Input label="Reset token" value={token} onChange={(event) => setToken(event.target.value)} required />
        <Input label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error ? <ErrorState message={error} /> : null}
        {done ? <p className="text-sm">Password updated. Log in with the new password.</p> : null}
        <Button type="submit">Update password</Button>
      </form>
    </MainLayout>
  );
}
