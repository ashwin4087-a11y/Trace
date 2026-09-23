import { useState } from "react";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { MainLayout } from "../../components/layout/MainLayout";
import { errorText } from "../../lib/errors";
import { forgotPassword } from "../../services/auth.service";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <MainLayout>
      <form
        className="mx-auto grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await forgotPassword(email);
            setSent(true);
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        {error ? <ErrorState message={error} /> : null}
        {sent ? <p className="text-sm">If the account exists, a reset link was issued.</p> : null}
        <Button type="submit">Send reset link</Button>
      </form>
    </MainLayout>
  );
}
