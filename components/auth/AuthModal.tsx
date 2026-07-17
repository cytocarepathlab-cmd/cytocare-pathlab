"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaTimes } from "react-icons/fa";

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

  if (!isOpen) return null;

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
      await supabase.from("patient_profiles").upsert({
        id: data.session.user.id,
        full_name: fullName.trim(),
        phone,
        email,
        updated_at: new Date().toISOString(),
      });
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
              {mode === "login" ? "Patient Login" : "Create Patient Account"}
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          >
            <FaTimes />
          </button>
        </div>

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
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10 Digit Phone Number"
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
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#0754dc] py-4 text-lg font-bold text-white disabled:opacity-60"
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
              Already have account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}