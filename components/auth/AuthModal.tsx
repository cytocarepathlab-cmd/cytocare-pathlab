"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaTimes } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  async function handleGoogleLogin() {
  try {
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
      setGoogleLoading(false);
    }
  } catch (error) {
    console.error("Google login error:", error);
    alert("Unable to continue with Google. Please try again.");
    setGoogleLoading(false);
  }
}

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signup") {
      if (fullName.trim().length < 2) {
        alert("Please enter your full name.");
        return;
      }

      if (phone.length !== 10) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Login successful!");
      onClose();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    if (data.session?.user) {
      const { error: profileError } = await supabase
        .from("patient_profiles")
        .upsert({
          id: data.session.user.id,
          full_name: fullName.trim(),
          phone,
          email,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Patient profile error:", profileError);
      }
    }

    setLoading(false);

    alert(
      "Account created successfully. Please login. If email confirmation is required, first confirm from your email inbox."
    );

    setMode("login");
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <h2 className="text-3xl font-extrabold text-[#07142f]">
              {mode === "login"
                ? "Patient Login"
                : "Create Patient Account"}
            </h2>

            <p className="mt-2 text-slate-500">
              {mode === "login"
                ? "Login to book tests, appointments and view history."
                : "Enter your details once. We will save them for future bookings."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Close login window"
          >
            <FaTimes />
          </button>
        </div>

        {/* Google login button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle className="text-2xl" />

          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-sm font-semibold uppercase text-slate-400">
            Or
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Email and password form */}
        <form onSubmit={handleAuth} className="space-y-5">
          {mode === "signup" && (
            <>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10 Digit Phone Number"
                inputMode="numeric"
                maxLength={10}
                className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              />
            </>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl bg-[#0754dc] py-4 text-lg font-bold text-white transition hover:bg-[#0648bd] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-bold text-[#0754dc]"
            >
              New patient? Create account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-bold text-[#0754dc]"
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}