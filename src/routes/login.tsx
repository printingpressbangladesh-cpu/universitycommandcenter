import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { signIn, signUp } from "@/lib/db";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Sparkles, Loader2 } from "lucide-react";
import { getAdminCredentials } from "@/lib/admin";

const OTP_CONFIGURED = !!import.meta.env.VITE_OTP_API_URL;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const adminEmail = getAdminCredentials().email;
  const navigate = useNavigate();
  const { session, loading, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(!OTP_CONFIGURED || email.trim().toLowerCase() === adminEmail.toLowerCase());

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [session, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { session: s, error } = await signIn(email, password);
    setBusy(false);
    if (error) return toast.error(error);
    await refresh();
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
    void s;
  };

  const sendOtp = async () => {
    const isAd = email.trim().toLowerCase() === adminEmail.toLowerCase();
    if (!OTP_CONFIGURED || isAd) {
      setEmailVerified(true);
      return toast.info("Email verification skipped.");
    }
    if (!email) return toast.error("Enter your email first");
    setBusy(true);
    try {
      await sendEmailOtp(email);
      setOtpSent(true);
      toast.success("Verification code sent to your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) return toast.error("Enter the 6-digit code");
    setBusy(true);
    try {
      await verifyEmailOtp(email, otp);
      setEmailVerified(true);
      toast.success("Email verified — you can create your account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified) return toast.error("Verify your email with the OTP first");
    setBusy(true);
    const { error } = await signUp(email, password, name, username);
    setBusy(false);
    if (error) return toast.error(error);
    await refresh();
    toast.success("Account created — welcome!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:var(--gradient-hero)]" />
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
        <div className="glass-strong relative hidden flex-col justify-between rounded-3xl p-10 md:flex">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>University Command Center</span>
            </div>
            <h1 className="mt-10 text-4xl font-semibold tracking-tight">
              Make your semester <span className="text-gradient">feel inevitable.</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Track courses, attendance and deep work — all saved locally in your browser.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "Pomodoro deep work + study streaks",
              "Kanban assignments & exam readiness",
              "Weekly routine planner",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-[var(--cyan)]" /> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-semibold">Welcome</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in — your data is saved to Supabase in the cloud.</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw">Password</Label>
                  <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    minLength={3}
                    maxLength={24}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    placeholder="e.g. srijon_sharma"
                    autoComplete="username"
                  />
                  <p className="text-xs text-muted-foreground">3–24 characters · letters, numbers, underscore</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email2"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        const isAd = val.trim().toLowerCase() === adminEmail.toLowerCase();
                        setEmailVerified(!OTP_CONFIGURED || isAd);
                        setOtpSent(false);
                      }}
                      className="flex-1"
                    />
                    {OTP_CONFIGURED && email.trim().toLowerCase() !== adminEmail.toLowerCase() && (
                      <Button type="button" variant="outline" disabled={busy || !email} onClick={sendOtp}>
                        {otpSent ? "Resend" : "Send OTP"}
                      </Button>
                    )}
                  </div>
                </div>
                {OTP_CONFIGURED && email.trim().toLowerCase() !== adminEmail.toLowerCase() && otpSent && !emailVerified && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification code</Label>
                    <div className="flex gap-2">
                      <Input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" className="flex-1 tracking-widest" />
                      <Button type="button" variant="secondary" disabled={busy} onClick={verifyOtp}>Verify</Button>
                    </div>
                  </div>
                )}
                {emailVerified && OTP_CONFIGURED && email.trim().toLowerCase() !== adminEmail.toLowerCase() && (
                  <p className="text-xs text-[color:var(--success)]">Email verified</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="pw2">Password</Label>
                  <Input id="pw2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={busy || !emailVerified} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-[10px] text-muted-foreground">
            Administrator? Sign in with <span className="font-medium">{adminEmail}</span> — change password in
            Settings or Admin.
          </p>
        </div>
      </div>
    </div>
  );
}
