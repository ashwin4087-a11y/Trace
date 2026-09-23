import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { MainLayout } from "../../components/layout/MainLayout";
import { errorText } from "../../lib/errors";
import { verifyEmail } from "../../services/auth.service";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <MainLayout>
      <form
        className="mx-auto grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await verifyEmail(token);
            setMessage("Email verified. You can log in.");
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <h1 className="text-2xl font-bold">Verify email</h1>
        <p className="text-sm">If SMTP is not configured, the verification link is written to the backend log and to public/uploads.</p>
        <Input label="Verification token" value={token} onChange={(event) => setToken(event.target.value)} required />
        {error ? <ErrorState message={error} /> : null}
        {message ? <p className="text-sm">{message}</p> : null}
        <Button type="submit">Verify</Button>
      </form>
    </MainLayout>
  );
}
