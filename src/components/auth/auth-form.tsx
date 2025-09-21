"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Loader2 } from "lucide-react";

const featureHighlights = [
  {
    icon: Sparkles,
    title: "AI-led insights",
    description: "Summaries, Q&A, and translation that keep your team aligned.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "Granular access controls keep sensitive docs safe and compliant.",
  },
  {
    icon: Clock3,
    title: "Faster decisions",
    description:
      "Condense hours of reading into minutes with guided workflows.",
  },
];

const getEmailProviderUrl = (email: string): string => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return "https://mail.google.com";
  }

  const directory: Record<string, string> = {
    "gmail.com": "https://mail.google.com",
    "googlemail.com": "https://mail.google.com",
    "outlook.com": "https://outlook.live.com/mail",
    "hotmail.com": "https://outlook.live.com/mail",
    "live.com": "https://outlook.live.com/mail",
    "msn.com": "https://outlook.live.com/mail",
    "yahoo.com": "https://mail.yahoo.com",
    "icloud.com": "https://www.icloud.com/mail",
    "me.com": "https://www.icloud.com/mail",
    "mac.com": "https://www.icloud.com/mail",
    "proton.me": "https://mail.proton.me/u/0/inbox",
    "protonmail.com": "https://mail.proton.me/u/0/inbox",
    "zoho.com": "https://mail.zoho.com",
    "hey.com": "https://app.hey.com",
    "fastmail.com": "https://www.fastmail.com/mail",
  };

  return directory[domain] ?? `https://${domain}`;
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-card/90 shadow-2xl backdrop-blur">
      <div className="grid min-h-[620px] gap-0 lg:grid-cols-[1.1fr,0.9fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-12 text-foreground lg:flex">
          <div className="absolute inset-0 bg-black" />
          <div className="relative z-10 flex flex-col justify-between">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="w-max bg-white/20 text-white/90 backdrop-blur"
              >
                EasyDox AI Workspace
              </Badge>
              <header className="space-y-4 text-white">
                <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
                  A polished home for your legal intelligence
                </h1>
                <p className="max-w-xl text-lg text-white/80">
                  Upload, analyse, and brief stakeholders in one shared hub.
                  Designed for deal teams, legal ops, and founders who need
                  clarity fast.
                </p>
              </header>
            </div>

            <div className="mt-16 space-y-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Why teams choose EasyDox
              </p>
              <div className="space-y-5">
                {featureHighlights.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="rounded-full bg-white/20 p-2 text-white">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-white">
                        {feature.title}
                      </p>
                      <p className="text-sm text-white/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/60">
                Loved by legal, compliance, and finance teams across high-growth
                companies.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex flex-col justify-center border-l border-border/60 bg-background/95 px-6 py-10 sm:px-12">
          {children}
        </div>
      </div>
    </div>
  );
};

const VerificationCard = ({
  email,
  loading,
  error,
  onOpenInbox,
  onResend,
  onRefresh,
  onUseDifferentEmail,
}: {
  email: string;
  loading: boolean;
  error: string | null;
  onOpenInbox: () => void;
  onResend: () => void;
  onRefresh: () => void;
  onUseDifferentEmail: () => void;
}) => {
  const firstName = useMemo(
    () => email.split("@")[0]?.split(/[._-]/)[0] ?? "there",
    [email]
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-3">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/5 text-primary"
        >
          Verification sent
        </Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Check your inbox, {firstName}.
        </h2>
        <p className="text-sm text-muted-foreground">
          We emailed a secure verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Open
          your email and confirm access to continue into EasyDox.
        </p>
      </div>

      <Card className="border border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <MailCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-sm text-primary/90">
            <p className="font-medium">Didn&apos;t see it?</p>
            <p>
              Check your spam folder or click resend. Verification links expire
              after 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        <Button
          size="lg"
          className="h-12 text-base font-medium"
          onClick={onOpenInbox}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Open my inbox
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-12 text-base font-medium"
          onClick={onResend}
          disabled={loading}
        >
          Resend verification email
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 text-base font-medium"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          I&apos;ve already verified
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <RefreshCcw className="h-3 w-3" />
        <span>Need to change the email?</span>
        <button
          type="button"
          onClick={onUseDifferentEmail}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Use a different email address
        </button>
      </div>
    </div>
  );
};

export function AuthForm() {
  const {
    signInWithEmail,
    signUpWithEmail,
    loading,
    error,
    requiresEmailVerification,
    pendingEmail,
    resendVerificationEmail,
    refreshSession,
    clearError,
    resetVerification,
  } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const disabled = loading || !email || !password;

  const handleAuthAction = async (action: "login" | "signup") => {
    clearError();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast({
        variant: "destructive",
        title: "Missing credentials",
        description: "Enter both email and password to continue.",
      });
      return;
    }

    const handler = action === "login" ? signInWithEmail : signUpWithEmail;
    const result = await handler(trimmedEmail, trimmedPassword);

    if (result && result.error) {
      toast({
        variant: "destructive",
        title: action === "login" ? "Login failed" : "Sign-up failed",
        description: result.error,
      });
    } else if (action === "signup") {
      toast({
        title: "Almost there!",
        description:
          "We just sent you a verification email. Confirm it to finish onboarding.",
      });
    }
  };

  const handleResendVerification = async () => {
    const response = await resendVerificationEmail();
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Could not resend email",
        description: response.error,
      });
      return;
    }
    toast({
      title: "Verification email resent",
      description: "Check your inbox for the newest message from EasyDox AI.",
    });
  };

  const handleOpenInbox = () => {
    if (!pendingEmail) return;
    const inboxUrl = getEmailProviderUrl(pendingEmail);
    window.open(inboxUrl, "_blank", "noopener");
  };

  const handleRefreshSession = async () => {
    const restored = await refreshSession();
    if (restored) {
      toast({
        title: "Email verified",
        description: "Welcome back to EasyDox AI.",
      });
    } else {
      toast({
        title: "Still waiting on verification",
        description:
          "Once you click the email link, return here and refresh to continue.",
      });
    }
  };

  const handleUseDifferentEmail = () => {
    resetVerification();
    clearError();
    setEmail("");
    setPassword("");
    setActiveTab("signup");
  };

  const verificationView = requiresEmailVerification && pendingEmail;

  return (
    <AuthLayout>
      {verificationView ? (
        <VerificationCard
          email={pendingEmail}
          loading={loading}
          error={error}
          onOpenInbox={handleOpenInbox}
          onResend={handleResendVerification}
          onRefresh={handleRefreshSession}
          onUseDifferentEmail={handleUseDifferentEmail}
        />
      ) : (
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-3">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Secure access portal
            </Badge>
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Welcome to EasyDox AI
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your work email to unlock document intelligence.
                New here? Create a password in seconds.
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          <Card className="border border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                {activeTab === "login"
                  ? "Sign in to continue"
                  : "Create your account"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {activeTab === "login"
                  ? "Use your registered credentials to access projects and transcripts."
                  : "Choose a strong password to secure your new workspace."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  clearError();
                  setActiveTab(value as "login" | "signup");
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Work email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button
                    onClick={() => handleAuthAction("login")}
                    className="h-12 w-full text-base font-medium"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enter workspace
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Work email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <Button
                    onClick={() => handleAuthAction("signup")}
                    disabled={disabled}
                    className="h-12 w-full text-base font-medium"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create account & send invite
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    By creating an account you agree to our confidentiality
                    policy and confirm you have organisational approval to
                    process documents within EasyDox AI.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthLayout>
  );
}
