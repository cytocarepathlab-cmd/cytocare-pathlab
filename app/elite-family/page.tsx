"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCrown,
  FaPlus,
  FaShieldAlt,
  FaUserFriends,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type PatientProfile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  membership_plan: string | null;
  membership_status: string | null;
  membership_expires_at: string | null;
};

type EliteFamilyMember = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  relation: string | null;
  age: number | null;
  gender: string | null;
  is_active: boolean;
  created_at: string;
};

export default function EliteFamilyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [members, setMembers] = useState<EliteFamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    loadEliteData();
  }, []);

  async function loadEliteData() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(userData.user);

    const { data: profileData, error: profileError } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    setProfile(profileData as PatientProfile | null);

    const { data: membersData, error: membersError } = await supabase
      .from("elite_family_members")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (membersError) {
      alert(membersError.message);
      setLoading(false);
      return;
    }

    setMembers((membersData ?? []) as EliteFamilyMember[]);
    setLoading(false);
  }

  function isEliteActive() {
    if (!profile) return false;
    if (profile.membership_status !== "active") return false;
    if (!profile.membership_expires_at) return false;

    return new Date(profile.membership_expires_at).getTime() > Date.now();
  }

  function fillMyDetails() {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setRelation("Self");
  }

  async function addFamilyMember() {
    if (!user) {
      alert("Please login first.");
      window.location.href = "/";
      return;
    }

    if (!isEliteActive()) {
      alert("Elite membership is not active.");
      return;
    }

    if (members.length >= 4) {
      alert("Maximum 4 members are allowed in one Elite membership.");
      return;
    }

    if (!fullName.trim()) {
      alert("Please enter member full name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("elite_family_members").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      relation: relation.trim() || null,
      age: age ? Number(age) : null,
      gender: gender || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    setFullName("");
    setPhone("");
    setRelation("");
    setAge("");
    setGender("");

    await loadEliteData();
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-md">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading Elite Members...
          </h1>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-md">
          <h1 className="text-4xl font-extrabold text-[#07142f]">
            Login Required
          </h1>

          <p className="mt-4 text-slate-600">
            Please login first to manage Elite family members.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-[#0754dc] px-6 py-3 font-bold text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  if (!isEliteActive()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-md">
          <FaCrown className="mx-auto text-5xl text-[#d4af37]" />

          <h1 className="mt-5 text-4xl font-extrabold text-[#07142f]">
            Elite Membership Not Active
          </h1>

          <p className="mt-4 text-slate-600">
            You need an active Elite membership to add family members.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-[#0754dc] px-6 py-3 font-bold text-white"
          >
            Buy Elite Membership
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-extrabold text-[#0754dc]"
          >
            <FaArrowLeft />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-[#07142f] px-5 py-3 text-[#f7d774]">
            <FaCrown />
            <span className="font-extrabold">Elite Active</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-10">
        <div className="mb-8 rounded-[34px] bg-gradient-to-br from-[#050505] via-[#101010] to-[#1f1706] p-8 text-white shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#f7d774]">
                <FaShieldAlt />
                Elite Family Members
              </div>

              <h1 className="text-4xl font-extrabold md:text-6xl">
                Register your 4 Elite members
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                Only these registered members will get 10% discount and free
                home collection above ₹699. Other patients can still book tests,
                but they will be charged normal price.
              </p>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/40 bg-white/5 p-6 text-center">
              <p className="text-sm font-bold text-slate-300">Members Added</p>
              <h2 className="mt-2 text-5xl font-extrabold text-[#f7d774]">
                {members.length}/4
              </h2>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
          {/* MEMBERS LIST */}
          <div className="rounded-3xl bg-white p-7 shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <FaUserFriends className="text-2xl text-[#0754dc]" />
              <h2 className="text-3xl font-extrabold">
                Registered Elite Members
              </h2>
            </div>

            {members.length === 0 ? (
              <div className="rounded-2xl bg-[#f8fbff] p-8 text-center">
                <p className="text-xl font-extrabold">
                  No family member added yet.
                </p>

                <p className="mt-2 text-slate-500">
                  Add yourself and your family members to use Elite benefits.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0754dc] text-lg font-extrabold text-white">
                        {index + 1}
                      </div>

                      <span className="rounded-full bg-[#eafff0] px-4 py-2 text-xs font-bold text-[#05a832]">
                        Elite Benefit
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold">
                      {member.full_name}
                    </h3>

                    <div className="mt-3 space-y-2 text-sm font-semibold text-slate-500">
                      <p>Relation: {member.relation || "Not added"}</p>
                      <p>Phone: {member.phone || "Not added"}</p>
                      <p>Age: {member.age || "Not added"}</p>
                      <p>Gender: {member.gender || "Not added"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-[#fff8df] p-5">
              <p className="text-sm font-bold leading-6 text-[#7a4f00]">
                Once members are added, patients cannot edit or delete them
                directly. For spelling correction or member replacement, contact
                Cytocare admin.
              </p>
            </div>
          </div>

          {/* ADD MEMBER FORM */}
          <div className="h-fit rounded-3xl bg-white p-7 shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <FaPlus className="text-2xl text-[#0754dc]" />
              <h2 className="text-3xl font-extrabold">Add Member</h2>
            </div>

            {members.length >= 4 ? (
              <div className="rounded-2xl bg-[#fff0f3] p-6 text-center">
                <h3 className="text-2xl font-extrabold text-[#e71935]">
                  Member Limit Reached
                </h3>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  You have already added 4 members. No more members can be added
                  under this Elite membership.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={fillMyDetails}
                  className="w-full rounded-xl bg-[#eef5ff] px-5 py-4 font-extrabold text-[#0754dc]"
                >
                  Add Myself as Member
                </button>

                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Member Full Name"
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />

                <input
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="Relation e.g. Self, Father, Mother, Spouse"
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />

                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <button
                  type="button"
                  onClick={addFamilyMember}
                  disabled={saving}
                  className="w-full rounded-2xl bg-[#0754dc] px-6 py-5 text-lg font-extrabold text-white disabled:bg-slate-300"
                >
                  {saving ? "Saving..." : "Save Elite Member"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}