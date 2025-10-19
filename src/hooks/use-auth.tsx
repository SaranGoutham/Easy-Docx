"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { AuthError, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  requiresEmailVerification: boolean;
  pendingEmail: string | null;
  resendVerificationEmail: () => Promise<{ error?: string }>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
  resetVerification: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
  requiresEmailVerification: false,
  pendingEmail: null,
  resendVerificationEmail: async () => ({}),
  refreshSession: async () => false,
  clearError: () => { },
  resetVerification: () => { },
  signOut: async () => { },
});

const supabaseErrorMessage = (err: AuthError | Error): string => {
  if ("status" in err) {
    switch (err.status) {
      case 400:
        return "Invalid credentials. Please double-check your email and password.";
      case 401:
        return "Your session is no longer valid. Please sign in again.";
      case 422:
        return "Please provide a valid email and password.";
      default:
        break;
    }
  }
  return err.message || "An unexpected authentication error occurred.";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresEmailVerification, setRequiresEmailVerification] =
    useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthError = useCallback(
    (err: AuthError | Error | null): string => {
      if (!err) {
        const fallback = "An unexpected authentication error occurred.";
        setError(fallback);
        setLoading(false);
        return fallback;
      }

      console.error("Supabase Auth Error:", err);
      const message = supabaseErrorMessage(err);
      setError(message);
      setLoading(false);
      return message;
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initialiseAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          handleAuthError(error);
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setRequiresEmailVerification(false);
          setPendingEmail(null);
        }
      } catch (err) {
        if (err instanceof Error) {
          handleAuthError(err);
        }
      }
    };

    initialiseAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setRequiresEmailVerification(false);
          setPendingEmail(null);
        }
        if (typeof window !== "undefined") {
          console.debug("Supabase auth state changed", {
            hasUser: Boolean(session?.user),
            event: _event,
          });
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [handleAuthError]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) {
      return;
    }

    const isAuthPage = pathname === "/";
    const isWorkspace = pathname.startsWith("/workspace");

    if (user && isAuthPage) {
      router.replace("/workspace");
    } else if (!user && isWorkspace) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) {
      return { error: handleAuthError(authError) };
    }

    setUser(data.user);
    setLoading(false);
    setRequiresEmailVerification(false);
    setPendingEmail(null);
    setError(null);
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    const getRedirectUrl = () => {
      const base =
        (typeof window !== 'undefined' && window.location.origin) ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://easy-docx.vercel.app';
      return `${base}/auth/callback`;
    };

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (authError) {
      return { error: handleAuthError(authError) };
    }

    if (!data.session) {
      setLoading(false);
      setRequiresEmailVerification(true);
      setPendingEmail(email);
      return {};
    }

    setUser(data.user ?? null);
    setLoading(false);
    setError(null);
    setRequiresEmailVerification(false);
    setPendingEmail(null);
    return {};
  };

  const resendVerificationEmail = async () => {
    if (!pendingEmail) {
      return { error: "No email available to verify." };
    }
    setLoading(true);
    const base =
      (typeof window !== 'undefined' && window.location.origin) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://easy-docx.vercel.app';
    const emailRedirectTo = `${base}/auth/callback`;

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,

      options: { emailRedirectTo },
    });
    if (resendError) {
      return { error: handleAuthError(resendError) };
    }
    setLoading(false);
    setError(null);
    return {};
  };

  const refreshSession = async () => {
    setLoading(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      handleAuthError(sessionError);
      return false;
    }
    setUser(session?.user ?? null);
    if (session?.user) {
      setRequiresEmailVerification(false);
      setPendingEmail(null);
    }
    setLoading(false);
    return Boolean(session?.user);
  };

  const clearError = () => setError(null);
  const resetVerification = () => {
    setRequiresEmailVerification(false);
    setPendingEmail(null);
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signOut();
    if (authError) {
      handleAuthError(authError);
      return;
    }
    setUser(null);
    setLoading(false);
    setRequiresEmailVerification(false);
    setPendingEmail(null);
    router.replace("/");
  };

  const value = {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    requiresEmailVerification,
    pendingEmail,
    resendVerificationEmail,
    refreshSession,
    clearError,
    resetVerification,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
