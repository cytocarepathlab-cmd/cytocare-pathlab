"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaClock,
  FaCrown,
  FaSearch,
  FaTag,
  FaTimes,
  FaUser,
  FaUserFriends,
  FaVial,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { cytocareTests } from "@/lib/cytocareTests";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/auth/AuthModal";

type PatientProfile = {
  full_name: string;
  phone: string;
  email: string;
  last_address: string | null;
  membership_plan: string | null;
  membership_status: string | null;
  membership_started_at: string | null;
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
};

type CartAssignment = {
  testName: string;
  patientName: string;
  patientPhone: string;
  patientType: "elite" | "other";
  eliteFamilyMemberId: string | null;
  eliteBenefitApplied: boolean;
};

type CytocareTest = (typeof cytocareTests)[number];

export default function AllTestsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] =
    useState<PatientProfile | null>(null);
  const [eliteMembers, setEliteMembers] = useState<EliteFamilyMember[]>([]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cartItems, setCartItems] = useState<string[]>([]);
  const [pendingTest, setPendingTest] = useState<CytocareTest | null>(null);
  const [isPatientPopupOpen, setIsPatientPopupOpen] = useState(false);
  const [redirectToCartAfterAdd, setRedirectToCartAfterAdd] = useState(false);

  const [selectedPatientType, setSelectedPatientType] = useState<
    "elite" | "other"
  >("other");
  const [selectedEliteMemberId, setSelectedEliteMemberId] = useState("");
  const [otherPatientName, setOtherPatientName] = useState("");
  const [otherPatientPhone, setOtherPatientPhone] = useState("");

  const [toast, setToast] = useState<{
    title: string;
    message: string;
    type: "success" | "warning";
  } | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(cytocareTests.map((test) => test.category))).sort();
  }, []);

  const filteredTests = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    return cytocareTests.filter((test) => {
      const matchesCategory =
        selectedCategory === "All" || test.category === selectedCategory;

      const matchesSearch =
        !text ||
        test.name.toLowerCase().includes(text) ||
        test.category.toLowerCase().includes(text) ||
        (test.vial ?? "").toLowerCase().includes(text) ||
        (test.reportingTime ?? "").toLowerCase().includes(text);

      return matchesCategory && matchesSearch;
    });
  }, [searchText, selectedCategory]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cytocare_cart");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }

    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    setUser(data.user);

    if (!data.user) return;

    await syncPatientProfile(data.user);
    await loadEliteMembers(data.user.id);
  }

  async function loadEliteMembers(userId: string) {
    const { data } = await supabase
      .from("elite_family_members")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    const members = (data ?? []) as EliteFamilyMember[];

    setEliteMembers(members);

    if (members.length > 0) {
      setSelectedEliteMemberId(members[0].id);
    }
  }

  async function syncPatientProfile(loggedUser: User) {
    const metadata = loggedUser.user_metadata as {
      full_name?: string;
      phone?: string;
    };

    const { data: existingProfile } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("id", loggedUser.id)
      .maybeSingle();

    if (!existingProfile) {
      const newProfile = {
        id: loggedUser.id,
        full_name: metadata.full_name || "",
        phone: metadata.phone || "",
        email: loggedUser.email || "",
        last_address: null,
        membership_plan: null,
        membership_status: "inactive",
        membership_started_at: null,
        membership_expires_at: null,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("patient_profiles").upsert(newProfile);

      setPatientProfile({
        full_name: newProfile.full_name,
        phone: newProfile.phone,
        email: newProfile.email,
        last_address: newProfile.last_address,
        membership_plan: newProfile.membership_plan,
        membership_status: newProfile.membership_status,
        membership_started_at: newProfile.membership_started_at,
        membership_expires_at: newProfile.membership_expires_at,
      });

      setOtherPatientName(newProfile.full_name);
      setOtherPatientPhone(newProfile.phone);

      return;
    }

    setPatientProfile({
      full_name: existingProfile.full_name || metadata.full_name || "",
      phone: existingProfile.phone || metadata.phone || "",
      email: existingProfile.email || loggedUser.email || "",
      last_address: existingProfile.last_address || null,
      membership_plan: existingProfile.membership_plan || null,
      membership_status: existingProfile.membership_status || "inactive",
      membership_started_at: existingProfile.membership_started_at || null,
      membership_expires_at: existingProfile.membership_expires_at || null,
    });

    setOtherPatientName(existingProfile.full_name || metadata.full_name || "");
    setOtherPatientPhone(existingProfile.phone || metadata.phone || "");
  }

  function isEliteActive() {
    if (!patientProfile) return false;
    if (patientProfile.membership_status !== "active") return false;
    if (!patientProfile.membership_expires_at) return false;

    return new Date(patientProfile.membership_expires_at).getTime() > Date.now();
  }

  function showToast(
    title: string,
    message: string,
    type: "success" | "warning" = "success"
  ) {
    setToast({ title, message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  function openPatientPopup(test: CytocareTest, goToCartAfterAdd = false) {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setPendingTest(test);
    setRedirectToCartAfterAdd(goToCartAfterAdd);

    if (isEliteActive() && eliteMembers.length > 0) {
      setSelectedPatientType("elite");
      setSelectedEliteMemberId(eliteMembers[0].id);
    } else {
      setSelectedPatientType("other");
    }

    setIsPatientPopupOpen(true);
  }

  function getSavedCartAssignments() {
  const savedAssignments = localStorage.getItem("cytocare_cart_assignments");

  if (!savedAssignments) return [];

  try {
    return JSON.parse(savedAssignments) as CartAssignment[];
  } catch {
    return [];
  }
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().trim();
}

function isSameTestForSamePatient(
  oldItem: CartAssignment,
  newItem: CartAssignment
) {
  const sameTest = oldItem.testName === newItem.testName;

  const sameEliteMember =
    oldItem.patientType === "elite" &&
    newItem.patientType === "elite" &&
    oldItem.eliteFamilyMemberId === newItem.eliteFamilyMemberId;

  const sameOtherPatient =
    oldItem.patientType === "other" &&
    newItem.patientType === "other" &&
    normalizeText(oldItem.patientName) === normalizeText(newItem.patientName) &&
    normalizeText(oldItem.patientPhone) === normalizeText(newItem.patientPhone);

  return sameTest && (sameEliteMember || sameOtherPatient);
}

function saveCartAssignment(assignment: CartAssignment) {
  const assignments = getSavedCartAssignments();

  const updatedAssignments = [...assignments, assignment];

  localStorage.setItem(
    "cytocare_cart_assignments",
    JSON.stringify(updatedAssignments)
  );
}

  function confirmAddToCart() {
    if (!pendingTest) return;

    let assignment: CartAssignment | null = null;

    if (selectedPatientType === "elite") {
      const selectedMember = eliteMembers.find(
        (member) => member.id === selectedEliteMemberId
      );

      if (!selectedMember) {
        showToast("Select member", "Please select an Elite member.", "warning");
        return;
      }

      assignment = {
        testName: pendingTest.name,
        patientName: selectedMember.full_name,
        patientPhone: selectedMember.phone ?? "",
        patientType: "elite",
        eliteFamilyMemberId: selectedMember.id,
        eliteBenefitApplied: true,
      };
    }

    if (selectedPatientType === "other") {
      if (!otherPatientName.trim()) {
        showToast("Patient required", "Please enter patient name.", "warning");
        return;
      }

      assignment = {
        testName: pendingTest.name,
        patientName: otherPatientName.trim(),
        patientPhone: otherPatientPhone.trim(),
        patientType: "other",
        eliteFamilyMemberId: null,
        eliteBenefitApplied: false,
      };
    }

    if (!assignment) return;

const existingAssignments = getSavedCartAssignments();

const alreadyAddedForSamePatient = existingAssignments.some((item) =>
  isSameTestForSamePatient(item, assignment)
);

if (alreadyAddedForSamePatient) {
  showToast(
    "Already in cart",
    `${assignment.testName} is already added for ${assignment.patientName}.`,
    "warning"
  );
  return;
}

const updatedCart = [...cartItems, pendingTest.name];
    setCartItems(updatedCart);
    localStorage.setItem("cytocare_cart", JSON.stringify(updatedCart));
    saveCartAssignment(assignment);

    const shouldGoToCart = redirectToCartAfterAdd;

    setPendingTest(null);
    setIsPatientPopupOpen(false);
    setRedirectToCartAfterAdd(false);

    if (shouldGoToCart) {
      window.location.href = "/cart";
      return;
    }

    showToast(
      "Added to cart",
      `${assignment.testName} added for ${assignment.patientName}.`,
      "success"
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] px-4 py-8 text-[#07142f] md:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 font-extrabold text-[#0754dc]"
            >
              <FaArrowLeft />
              Back to Home
            </Link>

            <h1 className="text-5xl font-extrabold">All Tests</h1>
            <p className="mt-3 text-lg font-semibold text-slate-500">
              Search tests and add them to cart after selecting the patient.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/cart";
            }}
            className="rounded-2xl bg-[#0754dc] px-7 py-4 text-lg font-extrabold text-white"
          >
            View Cart ({cartItems.length})
          </button>
        </div>

        <div className="sticky top-0 z-40 rounded-[28px] bg-white p-5 shadow-md">
          <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
            <div className="relative">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search CBC, LFT, TSH, Vitamin D, Fever Panel..."
                className="w-full rounded-2xl border border-slate-200 py-5 pl-14 pr-5 text-lg font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-5 text-lg font-extrabold outline-none focus:border-[#0754dc]"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-5 py-3 text-sm font-extrabold ${
                selectedCategory === "All"
                  ? "bg-[#0754dc] text-white"
                  : "bg-[#eef5ff] text-[#0754dc]"
              }`}
            >
              All ({cytocareTests.length})
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-3 text-sm font-extrabold ${
                  selectedCategory === category
                    ? "bg-[#0754dc] text-white"
                    : "bg-[#eef5ff] text-[#0754dc]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <h2 className="mt-10 text-4xl font-extrabold">
          {filteredTests.length} Tests Found
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTests.map((test) => (
            <div
              key={test.name}
              className="rounded-[28px] bg-white p-6 shadow-md"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                  {test.category}
                </span>

                <span className="rounded-full bg-[#eafff0] px-4 py-2 text-sm font-extrabold text-[#05a832]">
                  ₹{test.price}
                </span>
              </div>

              <h3 className="min-h-[70px] text-2xl font-extrabold">
                {test.name}
              </h3>

              <div className="mt-6 space-y-3">
                <p className="flex items-center gap-3 font-semibold text-slate-600">
                  <FaVial className="text-[#0754dc]" />
                  {test.vial || "Ask lab"}
                </p>

                <p className="flex items-center gap-3 font-semibold text-slate-600">
                  <FaClock className="text-[#0754dc]" />
                  {test.reportingTime || "Ask lab"}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => openPatientPopup(test)}
                  className="rounded-2xl border border-[#0754dc] px-5 py-4 font-extrabold text-[#0754dc]"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => openPatientPopup(test, true)}
                  className="rounded-2xl bg-[#0754dc] px-5 py-4 font-extrabold text-white"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPatientPopupOpen && pendingTest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#07142f]">
                  Who is this test for?
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {pendingTest.name} • ₹{pendingTest.price}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPatientPopupOpen(false)}
                className="rounded-xl bg-slate-100 p-3 text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {isEliteActive() && eliteMembers.length > 0 && (
                <label className="block cursor-pointer rounded-2xl border border-[#d4af37]/40 bg-[#fff8df] p-5">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedPatientType === "elite"}
                      onChange={() => setSelectedPatientType("elite")}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-extrabold text-[#7a4f00]">
                        <FaCrown />
                        Registered Elite Member
                      </div>

                      <p className="mt-1 text-sm font-semibold text-[#7a4f00]">
                        Elite benefits will apply only for registered family
                        members.
                      </p>

                      {selectedPatientType === "elite" && (
                        <select
                          value={selectedEliteMemberId}
                          onChange={(e) =>
                            setSelectedEliteMemberId(e.target.value)
                          }
                          className="mt-4 w-full rounded-xl border border-[#d4af37]/40 bg-white p-4 font-bold outline-none"
                        >
                          {eliteMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.full_name}
                              {member.relation ? ` - ${member.relation}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </label>
              )}

              <label className="block cursor-pointer rounded-2xl border border-slate-200 bg-[#f8fbff] p-5">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedPatientType === "other"}
                    onChange={() => setSelectedPatientType("other")}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-extrabold text-[#07142f]">
                      <FaUser />
                      Other Patient
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Normal price applies. Elite benefit will not apply.
                    </p>

                    {selectedPatientType === "other" && (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                          value={otherPatientName}
                          onChange={(e) =>
                            setOtherPatientName(e.target.value)
                          }
                          placeholder="Patient Name"
                          className="rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-[#0754dc]"
                        />

                        <input
                          value={otherPatientPhone}
                          onChange={(e) =>
                            setOtherPatientPhone(e.target.value)
                          }
                          placeholder="Patient Phone"
                          className="rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-[#0754dc]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {isEliteActive() && eliteMembers.length === 0 && (
                <div className="rounded-2xl bg-[#fff8df] p-5">
                  <div className="flex items-start gap-3">
                    <FaUserFriends className="mt-1 text-[#7a4f00]" />

                    <p className="text-sm font-bold leading-6 text-[#7a4f00]">
                      You are an Elite member, but no family member is
                      registered yet. Add family members first to use Elite
                      benefits.
                    </p>
                  </div>

                  <a
                    href="/elite-family"
                    className="mt-4 inline-flex rounded-xl bg-[#07142f] px-5 py-3 font-bold text-[#f7d774]"
                  >
                    Add Elite Family Members
                  </a>
                </div>
              )}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPatientPopupOpen(false)}
                className="rounded-xl bg-slate-100 px-6 py-3 font-extrabold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAddToCart}
                className="rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-5 top-24 z-[9999] w-[360px] max-w-[calc(100vw-40px)] rounded-3xl bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white ${
                toast.type === "success" ? "bg-[#05a832]" : "bg-[#f59e0b]"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-[#07142f]">
                {toast.title}
              </h3>

              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {toast.message}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setToast(null);
                    window.location.href = "/cart";
                  }}
                  className="rounded-xl bg-[#0754dc] px-4 py-2 text-sm font-extrabold text-white"
                >
                  View Cart
                </button>

                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-600"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}