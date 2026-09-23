import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { PasswordInput } from "../../components/common/PasswordInput";
import { MainLayout } from "../../components/layout/MainLayout";
import { TraceLogo } from "../../components/trace/TraceLogo";
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
      <div className="mx-auto max-w-md my-6 md:my-10">
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-4"
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
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-[#DFC1B0]/60">
            <TraceLogo size="lg" to="/" />
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-normal mt-1">Reset Password</h1>
              <p className="font-sans text-xs text-[#5F524B] mt-1">
                Enter your security token and choose a new password.
              </p>
            </div>
          </div>

          <Input label="Reset Token" value={token} onChange={(event) => setToken(event.target.value)} required />
          <PasswordInput label="New Password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error ? <ErrorState message={error} /> : null}
          {done ? (
            <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs text-[#1A1412] font-medium text-center">
              Password successfully updated. You can now{" "}
              <Link to="/login" className="text-[#BF9270] font-bold underline">
                Sign In
              </Link>
              .
            </div>
          ) : null}

          <Button type="submit" className="w-full py-2.5 bg-[#BF9270] text-[#FFEDDB] font-semibold rounded-lg hover:opacity-90">
            Update Password
          </Button>

          <div className="pt-3 border-t border-[#DFC1B0]/60 flex items-center justify-center text-xs font-sans text-[#5F524B]">
            <Link to="/login" className="text-[#BF9270] font-semibold hover:underline">
              Return to Sign In
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

