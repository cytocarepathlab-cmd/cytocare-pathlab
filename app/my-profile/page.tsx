"use client";

import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaSave,
  FaTrash,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type PatientProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  last_address: string | null;
};

type FamilyMember = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  relation: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

type MemberForm = {
  full_name: string;
  phone: string;
  relation: string;
  address: string;
};

const emptyMember: MemberForm = {
  full_name: "",
  phone: "",
  relation: "",
  address: "",
};

export default function MyProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMember);
  const [editingMemberId, setEditingMemberId] = useState("");
  const [savingMember, setSavingMember] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/";
      return;
    }

    setUser(userData.user);

    const { data: profileData, error: profileError } = await supabase
      .from("patient_profiles")
      .select("id, full_name, email, phone, last_address")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    const currentProfile: PatientProfile = {
      id: userData.user.id,
      full_name:
        profileData?.full_name ||
        userData.user.user_metadata?.full_name ||
        "",
      email: profileData?.email || userData.user.email || "",
      phone:
        profileData?.phone ||
        userData.user.user_metadata?.phone ||
        "",
      last_address: profileData?.last_address || "",
    };

    setProfile(currentProfile);
    setProfileName(currentProfile.full_name);
    setProfilePhone(currentProfile.phone);
    setProfileAddress(currentProfile.last_address || "");

    await loadMembers(userData.user.id);
    setLoading(false);
  }

  async function loadMembers(userId: string) {
    const { data, error } = await supabase
      .from("patient_family_members")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMembers((data ?? []) as FamilyMember[]);
  }

  async function saveProfile() {
    if (!user) return;

    if (!profileName.trim()) {
      setMessage("Please enter the patient name.");
      return;
    }

    if (!profilePhone.trim()) {
      setMessage("Please enter a phone number.");
      return;
    }

    setSavingProfile(true);
    setMessage("");

    const { error } = await supabase
      .from("patient_profiles")
      .upsert(
        {
          id: user.id,
          full_name: profileName.trim(),
          email: user.email || profile?.email || "",
          phone: profilePhone.trim(),
          last_address: profileAddress.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    setSavingProfile(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            full_name: profileName.trim(),
            phone: profilePhone.trim(),
            last_address: profileAddress.trim() || null,
          }
        : prev
    );

    setMessage("Profile saved successfully.");
  }

  function startAddMember() {
    setEditingMemberId("");
    setMemberForm(emptyMember);
    setShowAddMember(true);
    setMessage("");
  }

  function startEditMember(member: FamilyMember) {
    setEditingMemberId(member.id);
    setMemberForm({
      full_name: member.full_name || "",
      phone: member.phone || "",
      relation: member.relation || "",
      address: member.address || "",
    });
    setShowAddMember(true);
    setMessage("");
  }

  async function saveMember() {
    if (!user) return;

    if (!memberForm.full_name.trim()) {
      setMessage("Please enter the patient name.");
      return;
    }

    setSavingMember(true);
    setMessage("");

    const payload = {
      user_id: user.id,
      full_name: memberForm.full_name.trim(),
      phone: memberForm.phone.trim() || null,
      relation: memberForm.relation.trim() || null,
      address: memberForm.address.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (editingMemberId) {
      const result = await supabase
        .from("patient_family_members")
        .update(payload)
        .eq("id", editingMemberId)
        .eq("user_id", user.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("patient_family_members")
        .insert(payload);

      error = result.error;
    }

    setSavingMember(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadMembers(user.id);
    setShowAddMember(false);
    setEditingMemberId("");
    setMemberForm(emptyMember);
    setMessage(
      editingMemberId
        ? "Patient updated successfully."
        : "Patient added successfully."
    );
  }

  async function deleteMember(member: FamilyMember) {
    if (!user) return;

    const confirmed = window.confirm(
      `Remove "${member.full_name}" from your saved patients?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("patient_family_members")
      .delete()
      .eq("id", member.id)
      .eq("user_id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMembers((prev) => prev.filter((item) => item.id !== member.id));
    setMessage("Patient removed successfully.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-2xl font-extrabold shadow-md">
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="font-extrabold text-[#0754dc]">CYTOCARE PATIENT</p>
            <h1 className="text-3xl font-extrabold">My Profile</h1>
          </div>

          <a
            href="/"
            className="flex items-center gap-2 rounded-xl bg-[#eef5ff] px-5 py-3 font-extrabold text-[#0754dc]"
          >
            <FaArrowLeft />
            Home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        {message && (
          <div className="mb-6 rounded-2xl bg-[#eef5ff] p-4 font-bold text-[#0754dc]">
            {message}
          </div>
        )}

        <div className="rounded-[30px] bg-white p-7 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0754dc]">
              <FaUser />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Primary Patient</h2>
              <p className="text-sm font-semibold text-slate-500">
                These details will be used for bookings and admin patient search.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-600">
                Full Name
              </label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

            <div>
              <label className="text-sm font-extrabold text-slate-600">
                Phone Number
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4">
                <FaPhoneAlt className="text-[#0754dc]" />
                <input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  className="w-full py-4 font-semibold outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-extrabold text-slate-600">
                Email
              </label>
              <input
                value={profile?.email || ""}
                readOnly
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-extrabold text-slate-600">
                Address
              </label>
              <div className="mt-2 flex items-start gap-3 rounded-2xl border border-slate-200 px-4">
                <FaMapMarkerAlt className="mt-5 text-[#0754dc]" />
                <textarea
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  rows={3}
                  className="w-full py-4 font-semibold outline-none"
                  placeholder="House / area / landmark / city"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#0754dc] px-6 py-4 font-extrabold text-white disabled:bg-slate-300"
          >
            <FaSave />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="mt-7 rounded-[30px] bg-white p-7 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0754dc]">
                <FaUsers />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">
                  Family / Other Patients
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  Save people whose tests you may book from this account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={startAddMember}
              className="flex items-center gap-2 rounded-xl bg-[#05a832] px-5 py-3 font-extrabold text-white"
            >
              <FaPlus />
              Add Patient
            </button>
          </div>

          {showAddMember && (
            <div className="mt-6 rounded-3xl border border-[#0754dc]/20 bg-[#f8fbff] p-6">
              <h3 className="text-xl font-extrabold">
                {editingMemberId ? "Edit Patient" : "Add Patient"}
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  value={memberForm.full_name}
                  onChange={(e) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Patient Name"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold outline-none focus:border-[#0754dc]"
                />

                <input
                  value={memberForm.phone}
                  onChange={(e) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  inputMode="numeric"
                  placeholder="Phone Number (optional)"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold outline-none focus:border-[#0754dc]"
                />

                <select
                  value={memberForm.relation}
                  onChange={(e) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      relation: e.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold outline-none focus:border-[#0754dc]"
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  value={memberForm.address}
                  onChange={(e) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Address (optional)"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 font-semibold outline-none focus:border-[#0754dc]"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveMember}
                  disabled={savingMember}
                  className="rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white disabled:bg-slate-300"
                >
                  {savingMember ? "Saving..." : "Save Patient"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setEditingMemberId("");
                    setMemberForm(emptyMember);
                  }}
                  className="rounded-xl bg-slate-200 px-6 py-3 font-extrabold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {members.length === 0 && (
              <div className="rounded-2xl bg-[#fff8df] p-5 font-bold text-[#7a4f00]">
                No additional patients saved yet.
              </div>
            )}

            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-[#f8fbff] p-5"
              >
                <div>
                  <h3 className="text-lg font-extrabold">{member.full_name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {member.relation || "Other Patient"}
                    {member.phone ? ` • ${member.phone}` : ""}
                  </p>
                  {member.address && (
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {member.address}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditMember(member)}
                    className="flex items-center gap-2 rounded-xl bg-[#0754dc] px-4 py-3 font-extrabold text-white"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMember(member)}
                    className="flex items-center gap-2 rounded-xl bg-[#e71935] px-4 py-3 font-extrabold text-white"
                  >
                    <FaTrash />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}