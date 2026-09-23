import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { MainLayout } from "../../components/layout/MainLayout";
import { TraceLogo } from "../../components/trace/TraceLogo";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              await login(email, password);
            } catch (caught) {
              setError(errorText(caught));
            }
          }}
        >
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-[#DFC1B0]/60">
            <TraceLogo size="lg" to="/" />
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-normal mt-1">Scholar Authentication</h1>
              <p className="font-sans text-xs text-[#5F524B] mt-1">
                Access your verifiable learning passport, workshops, and academic trajectory.
              </p>
            </div>
          </div>

          <Input label="Email Address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error ? <ErrorState message={error} /> : null}

          <Button type="submit" className="w-full py-2.5 bg-[#BF9270] text-[#FFEDDB] font-semibold rounded-lg hover:opacity-90">
            Sign In to TRACE
          </Button>

          <div className="pt-3 border-t border-[#DFC1B0]/60 flex flex-col items-center gap-2 text-xs font-sans text-[#5F524B]">
            <Link to="/forgot-password" className="text-[#BF9270] hover:underline font-semibold">
              Forgot your password?
            </Link>
            <div className="flex items-center gap-1">
              <span>Don't have an account?</span>
              <Link to="/register" className="text-[#1A1412] font-semibold hover:underline">
                Create a scholar account
              </Link>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
