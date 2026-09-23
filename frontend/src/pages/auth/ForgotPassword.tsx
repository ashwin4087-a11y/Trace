import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { MainLayout } from "../../components/layout/MainLayout";
import { TraceLogo } from "../../components/trace/TraceLogo";
import { errorText } from "../../lib/errors";
import { forgotPassword } from "../../services/auth.service";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <MainLayout>
      <div className="mx-auto max-w-md my-6 md:my-10">
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-5"
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
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-[#DFC1B0]/60">
            <TraceLogo size="lg" to="/" />
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-normal mt-1">Recover Access</h1>
              <p className="font-sans text-xs text-[#5F524B] mt-1">
                Enter your registered scholar email address to receive password reset instructions.
              </p>
            </div>
          </div>

          <Input label="Email Address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          {error ? <ErrorState message={error} /> : null}
          {sent ? (
            <div className="p-3 bg-[#FFEDDB] border border-[#DFC1B0] rounded-lg text-xs font-sans text-[#1A1412]">
              If an account associated with this email exists, a password reset authorization code has been issued.
            </div>
          ) : null}

          <Button type="submit" className="w-full py-2.5 bg-[#BF9270] text-[#FFEDDB] font-semibold rounded-lg hover:bg-[#261D1A]">
            Send Reset Instructions
          </Button>

          <div className="pt-3 border-t border-[#DFC1B0]/60 flex items-center justify-center gap-1 text-xs font-sans text-[#5F524B]">
            <span>Remembered your password?</span>
            <Link to="/login" className="text-[#BF9270] font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
