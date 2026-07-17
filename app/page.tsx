"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import RoutineCheckups from "@/components/home/RoutineCheckups";
import PopularTests from "@/components/home/PopularTests";
import Packages from "@/components/home/Packages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/layout/Footer";
import FloatingCall from "@/components/common/FloatingCall";
import FloatingWhatsapp from "@/components/common/FloatingWhatsapp";
import BookingModal from "@/components/common/BookingModal";
import HealthCategories from "@/components/home/HealthCategories";
import DoctorConsultation from "@/components/home/DoctorConsultation";
import AuthModal from "@/components/auth/AuthModal";
import MembershipPlans from "@/components/home/MembershipPlans";
import UnhealthyHabits from "@/components/home/UnhealthyHabits";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { FaCrown, FaTimes, FaUser, FaUserFriends } from "react-icons/fa";

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

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState("Book Test");
  const [selectedTest, setSelectedTest] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [patientProfile, setPatientProfile] =
    useState<PatientProfile | null>(null);

  const [eliteMembers, setEliteMembers] = useState<EliteFamilyMember[]>([]);

  const [pendingTestName, setPendingTestName] = useState("");
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

    const membershipExpired =
      existingProfile.membership_status === "active" &&
      existingProfile.membership_expires_at &&
      new Date(existingProfile.membership_expires_at).getTime() <= Date.now();

    if (membershipExpired) {
      await supabase
        .from("patient_profiles")
        .update({
          membership_status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", loggedUser.id);
    }

    const finalStatus = membershipExpired
      ? "inactive"
      : existingProfile.membership_status || "inactive";

    setPatientProfile({
      full_name: existingProfile.full_name || metadata.full_name || "",
      phone: existingProfile.phone || metadata.phone || "",
      email: existingProfile.email || loggedUser.email || "",
      last_address: existingProfile.last_address || null,
      membership_plan: existingProfile.membership_plan || null,
      membership_status: finalStatus,
      membership_started_at: existingProfile.membership_started_at || null,
      membership_expires_at: existingProfile.membership_expires_at || null,
    });

    setOtherPatientName(existingProfile.full_name || metadata.full_name || "");
    setOtherPatientPhone(existingProfile.phone || metadata.phone || "");
  }

  useEffect(() => {
    const savedCart = localStorage.getItem("cytocare_cart");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);

      if (data.user) {
        await syncPatientProfile(data.user);
        await loadEliteMembers(data.user.id);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const loggedUser = session?.user ?? null;

      setUser(loggedUser);

      if (loggedUser) {
        await syncPatientProfile(loggedUser);
        await loadEliteMembers(loggedUser.id);
      } else {
        clearLocalCart();
        setPatientProfile(null);
        setEliteMembers([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  function openBooking(type: string, testName = "") {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setBookingType(type);
    setSelectedTest(testName);
    setIsBookingOpen(true);
  }

  function addToCart(testName: string, goToCartAfterAdd = false) {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const cleanTestName = testName.trim();

    if (!cleanTestName) return;

   

    setPendingTestName(cleanTestName);
    setRedirectToCartAfterAdd(goToCartAfterAdd);

    if (isEliteActive() && eliteMembers.length > 0) {
      setSelectedPatientType("elite");
      setSelectedEliteMemberId(eliteMembers[0].id);
    } else {
      setSelectedPatientType("other");
    }

    setIsPatientPopupOpen(true);
  }

 function getSavedCartAssignments(): CartAssignment[] {
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
    if (!pendingTestName) return;

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
        testName: pendingTestName,
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
        testName: pendingTestName,
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

const updatedCart = [...cartItems, pendingTestName];

    setCartItems(updatedCart);
    localStorage.setItem("cytocare_cart", JSON.stringify(updatedCart));
    saveCartAssignment(assignment);

    const shouldGoToCart = redirectToCartAfterAdd;

    setIsPatientPopupOpen(false);
    setPendingTestName("");
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

  function chooseMembershipPlan(planName: string) {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    let existingCart: string[] = cartItems;

    const savedCart = localStorage.getItem("cytocare_cart");

    if (savedCart) {
      try {
        existingCart = JSON.parse(savedCart);
      } catch {
        existingCart = cartItems;
      }
    }

    const cartWithoutOldMembership = existingCart.filter(
      (item) => !item.toLowerCase().includes("membership")
    );

    const updatedCart = [...cartWithoutOldMembership, planName];

    setCartItems(updatedCart);
    localStorage.setItem("cytocare_cart", JSON.stringify(updatedCart));

    window.location.href = "/cart";
  }

  function clearLocalCart() {
    setCartItems([]);
    localStorage.removeItem("cytocare_cart");
    localStorage.removeItem("cytocare_cart_assignments");
  }

  async function logoutPatient() {
    clearLocalCart();

    await supabase.auth.signOut();

    setUser(null);
    setPatientProfile(null);
    setEliteMembers([]);
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <Navbar
        onBookClick={() => {
  window.location.href = "/tests";
}}
        userEmail={user?.email ?? ""}
        patientName={patientProfile?.full_name ?? ""}
        isPremiumMember={patientProfile?.membership_status === "active"}
        membershipPlan={patientProfile?.membership_plan ?? ""}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={logoutPatient}
        cartCount={cartItems.length}
        onCartClick={() => {
          window.location.href = "/cart";
        }}
      />

      <MembershipPlans
        onChoosePlan={chooseMembershipPlan}
        isEliteMember={patientProfile?.membership_status === "active"}
        patientName={patientProfile?.full_name ?? ""}
        membershipPlan={patientProfile?.membership_plan ?? ""}
        membershipExpiresAt={patientProfile?.membership_expires_at ?? null}
      />

      <Hero
  onBookClick={() => {
    window.location.href = "/tests";
  }}
  onHomeCollectionClick={() => {
    window.location.href = "/tests";
  }}
  onSearchSelect={(testName) => addToCart(testName)}
/>

      <Stats />

      <HealthCategories
  onCategoryClick={(packageName) => addToCart(packageName)}
/>

     <DoctorConsultation
  userEmail={patientProfile?.email || ""}
  onRequireLogin={() => alert("Please login first to book doctor consultation.")}
  isEliteMember={
    patientProfile?.membership_status === "active" &&
    !!patientProfile?.membership_expires_at &&
    new Date(patientProfile.membership_expires_at) > new Date()
  }
/>

      <RoutineCheckups
        onCheckupClick={(packageName) => addToCart(packageName, true)}
      />

      <UnhealthyHabits onAddToCart={addToCart} />

      <PopularTests
        onBookClick={(testName) => openBooking("Book Test", testName)}
      />

      <Packages
        onBookClick={(packageName) =>
          openBooking("Health Package", packageName)
        }
      />

      <WhyChooseUs />

      <FAQ />

      <Footer />

      <FloatingCall />
      <FloatingWhatsapp />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        bookingType={bookingType}
        selectedTest={selectedTest}
        userEmail={user?.email ?? ""}
        patientName={patientProfile?.full_name ?? ""}
        patientPhone={patientProfile?.phone ?? ""}
        savedAddress={patientProfile?.last_address ?? ""}
        cartTests={cartItems}
        onBookingSuccess={async () => {
          clearLocalCart();

          if (user) {
            await syncPatientProfile(user);
          }
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {isPatientPopupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#07142f]">
                  Who is this test for?
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {pendingTestName}
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
                        10% discount and free home collection benefit will
                        apply if eligible.
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
                      Normal price applies. Elite discount will not apply.
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
    </main>
  );
}