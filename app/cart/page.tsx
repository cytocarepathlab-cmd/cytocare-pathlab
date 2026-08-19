"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCreditCard,
  FaCrown,
  FaRupeeSign,
  FaShoppingCart,
  FaTrash,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { cytocareTests } from "@/lib/cytocareTests";

type PatientProfile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  last_address: string | null;
  membership_plan: string | null;
  membership_status: string | null;
  membership_started_at: string | null;
  membership_expires_at: string | null;
};

type PaymentMode = "later" | "online";

type CartAssignment = {
  testName: string;
  patientName: string;
  patientPhone: string;
  patientType: "elite" | "other";
  eliteFamilyMemberId: string | null;
  eliteBenefitApplied: boolean;
};

type MappedCartTest = {
  cartName: string;
  price: number;
  category: string;
  reportingTime: string;
  assignment: CartAssignment;
  eliteEligible: boolean;
  eliteDiscount: number;
};

const MEMBERSHIP_PRICE = 89;
const HOME_COLLECTION_CHARGE = 200;
const FREE_COLLECTION_MINIMUM = 699;
const ELITE_DISCOUNT_MINIMUM = 699;

type CytocareTest = (typeof cytocareTests)[number];

const WORK_START_TIME = "08:00";
const WORK_END_TIME = "19:00";

function getTodayInputDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentInputTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function isPastBookingDate(dateValue: string) {
  return dateValue < getTodayInputDate();
}

function isSundayBookingDate(dateValue: string) {
  if (!dateValue) return false;

  const [year, month, day] = dateValue.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);

  return selectedDate.getDay() === 0;
}

function isOutsideWorkingTime(timeValue: string) {
  return timeValue < WORK_START_TIME || timeValue > WORK_END_TIME;
}

function isPastTimeForToday(dateValue: string, timeValue: string) {
  if (dateValue !== getTodayInputDate()) return false;

  return timeValue < getCurrentInputTime();
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [cartAssignments, setCartAssignments] = useState<CartAssignment[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] =
    useState<PatientProfile | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [collectionType, setCollectionType] = useState<"home" | "lab">("home");

  const [membershipPatientName, setMembershipPatientName] = useState("");
  const [membershipPatientPhone, setMembershipPatientPhone] = useState("");
  const [membershipRelation, setMembershipRelation] = useState("Self");

  const [loading, setLoading] = useState(false);
  const [todayInputDate, setTodayInputDate] = useState("");

  useEffect(() => {
  setTodayInputDate(getTodayInputDate());

  const savedCart = localStorage.getItem("cytocare_cart");
    const savedAssignments = localStorage.getItem("cytocare_cart_assignments");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }

    if (savedAssignments) {
      try {
        setCartAssignments(JSON.parse(savedAssignments));
      } catch {
        setCartAssignments([]);
      }
    }

    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    setUser(data.user);
    setEmail(data.user.email ?? "");

    const { data: profile } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile) {
      const typedProfile = profile as PatientProfile;

      setPatientProfile(typedProfile);
      setName(typedProfile.full_name ?? "");
      setPhone(typedProfile.phone ?? "");
      setEmail(typedProfile.email || data.user.email || "");
      setAddress(typedProfile.last_address ?? "");

      setMembershipPatientName(typedProfile.full_name ?? "");
      setMembershipPatientPhone(typedProfile.phone ?? "");
    }
  }

  function isMembershipItem(item: string) {
    return item.toLowerCase().includes("membership");
  }

  function normalText(value: string | null | undefined) {
    return (value ?? "").toLowerCase().trim();
  }

  function findTestByName(testName: string): CytocareTest | null {
    const normalName = testName.toLowerCase().trim();

    return (
      cytocareTests.find(
        (test) => test.name.toLowerCase().trim() === normalName
      ) ||
      cytocareTests.find((test) =>
        test.name.toLowerCase().includes(normalName)
      ) ||
      null
    );
  }

function getCustomCartItem(testName: string) {
  const savedCustomPrices = localStorage.getItem("cytocare_custom_prices");

  if (!savedCustomPrices) return null;

  try {
    const customPrices = JSON.parse(savedCustomPrices) as Record<
      string,
      {
        price: number;
        category: string;
        reportingTime: string;
      }
    >;

    return customPrices[testName] || null;
  } catch {
    return null;
  }
}

  function getAssignmentForTest(testName: string): CartAssignment {
    const found = cartAssignments.find(
      (assignment) => assignment.testName === testName
    );

    if (found) return found;

    return {
      testName,
      patientName: name || patientProfile?.full_name || "Patient",
      patientPhone: phone || patientProfile?.phone || "",
      patientType: "other",
      eliteFamilyMemberId: null,
      eliteBenefitApplied: false,
    };
  }

  const cartBreakup = useMemo(() => {
    const membershipItems = cartItems.filter((item) => isMembershipItem(item));
    const testItems = cartItems.filter((item) => !isMembershipItem(item));

    const buyingMembershipNow = membershipItems.length > 0;
    const membershipFee = buyingMembershipNow ? MEMBERSHIP_PRICE : 0;

    const firstMappedTests = testItems.map((item) => {
      const matchedTest = findTestByName(item);
const customItem = getCustomCartItem(item);
const assignment = getAssignmentForTest(item);
const price = matchedTest?.price ?? customItem?.price ?? 0;

      const matchesNewMembershipPatient =
        buyingMembershipNow &&
        normalText(assignment.patientName) === normalText(membershipPatientName);

      const eliteSelected =
        assignment.eliteBenefitApplied || matchesNewMembershipPatient;

      return {
        cartName: item,
        price,
        category: matchedTest?.category ?? customItem?.category ?? "Package",
reportingTime:
  matchedTest?.reportingTime ?? customItem?.reportingTime ?? "Ask lab",
        assignment,
        eliteSelected,
      };
    });

    const eliteSelectedTotal = firstMappedTests
      .filter((item) => item.eliteSelected)
      .reduce((sum, item) => sum + item.price, 0);

    const eliteDiscountAllowed = eliteSelectedTotal > ELITE_DISCOUNT_MINIMUM;

    const mappedTests: MappedCartTest[] = firstMappedTests.map((item) => {
      const eliteEligible = item.eliteSelected && eliteDiscountAllowed;

      const eliteDiscount = eliteEligible ? Math.round(item.price * 0.1) : 0;

      return {
        cartName: item.cartName,
        price: item.price,
        category: item.category,
        reportingTime: item.reportingTime,
        assignment: item.assignment,
        eliteEligible,
        eliteDiscount,
      };
    });

    const testTotal = mappedTests.reduce((sum, item) => sum + item.price, 0);

    const eliteEligibleTotal = mappedTests
      .filter((item) => item.assignment.eliteBenefitApplied)
      .reduce((sum, item) => sum + item.price, 0);

    const normalPatientTotal = mappedTests
      .filter((item) => !item.assignment.eliteBenefitApplied)
      .reduce((sum, item) => sum + item.price, 0);

    const eliteDiscount = mappedTests.reduce(
      (sum, item) => sum + item.eliteDiscount,
      0
    );

    const hasElitePatientTests = eliteEligibleTotal > 0;
    const hasNormalPatientTests = normalPatientTotal > 0;

    const eliteHomeCollectionCharge =
      collectionType === "home" && hasElitePatientTests
        ? HOME_COLLECTION_CHARGE
        : 0;

    const normalHomeCollectionCharge =
      collectionType === "home" && hasNormalPatientTests
        ? HOME_COLLECTION_CHARGE
        : 0;

    const homeCollectionCharge =
      eliteHomeCollectionCharge + normalHomeCollectionCharge;

    const homeCollectionDiscount =
      collectionType === "home" && eliteSelectedTotal > FREE_COLLECTION_MINIMUM
        ? eliteHomeCollectionCharge
        : 0;

    const finalPayable =
      testTotal +
      membershipFee +
      homeCollectionCharge -
      eliteDiscount -
      homeCollectionDiscount;

    return {
      membershipItems,
      testItems,
      mappedTests,
      buyingMembershipNow,
      membershipFee,
      testTotal,
      eliteSelectedTotal,
      eliteDiscountAllowed,
      eliteEligibleTotal,
      normalPatientTotal,
      eliteDiscount,
      eliteHomeCollectionCharge,
      normalHomeCollectionCharge,
      homeCollectionCharge,
      homeCollectionDiscount,
      finalPayable,
    };
  }, [
    cartItems,
    cartAssignments,
    collectionType,
    membershipPatientName,
    name,
    phone,
    patientProfile,
  ]);

  function removeItem(itemName: string) {
    const updatedCart = cartItems.filter((item) => item !== itemName);
    const updatedAssignments = cartAssignments.filter(
      (assignment) => assignment.testName !== itemName
    );

    setCartItems(updatedCart);
    setCartAssignments(updatedAssignments);

    localStorage.setItem("cytocare_cart", JSON.stringify(updatedCart));
    localStorage.setItem(
      "cytocare_cart_assignments",
      JSON.stringify(updatedAssignments)
    );
  }

  function clearCart() {
    setCartItems([]);
    setCartAssignments([]);

    localStorage.removeItem("cytocare_cart");
    localStorage.removeItem("cytocare_cart_assignments");
  }

function handleBookingDateChange(dateValue: string) {
  if (!dateValue) {
    setBookingDate("");
    return;
  }

  if (isPastBookingDate(dateValue)) {
    alert("Past date is not allowed. Please select today or a future date.");
    setBookingDate("");
    return;
  }

  if (isSundayBookingDate(dateValue)) {
    alert("Sunday is holiday. Please select Monday to Saturday.");
    setBookingDate("");
    return;
  }

  setBookingDate(dateValue);
}

function handleBookingTimeChange(timeValue: string) {
  if (!timeValue) {
    setBookingTime("");
    return;
  }

  if (isOutsideWorkingTime(timeValue)) {
    alert("Please select time between 8:00 AM and 7:00 PM.");
    setBookingTime("");
    return;
  }

  setBookingTime(timeValue);
}

function validateBookingSchedule() {
  if (cartBreakup.testItems.length === 0) return "";

  if (!bookingDate || !bookingTime) {
    return "Please select booking date and time.";
  }

  if (isPastBookingDate(bookingDate)) {
    return "Past date is not allowed. Please select today or a future date.";
  }

  if (isSundayBookingDate(bookingDate)) {
    return "Sunday is holiday. Please select Monday to Saturday.";
  }

  if (isOutsideWorkingTime(bookingTime)) {
    return "Please select time between 8:00 AM and 7:00 PM.";
  }

  if (isPastTimeForToday(bookingDate, bookingTime)) {
    return "Past time is not allowed for today's booking.";
  }

  return "";
}

  async function startOnlinePayment(
    checkoutGroupKey: string,
    paymentAmount: number
  ) {
    try {
      const response = await fetch("/api/payu/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
  amount: paymentAmount,
  checkoutGroupKey,
  patientName: name,
  patientEmail: email,
  patientPhone: phone,
  userId: user?.id || "",
}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoading(false);
        alert(data.message || "Unable to start PayU payment.");
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.action;

      Object.entries(data.params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("PayU payment error:", error);
      setLoading(false);
      alert("Payment could not start. Please try again.");
    }
  }

  async function submitCheckout(paymentMode: PaymentMode = "later") {
  if (!user) {
    alert("Please login first.");
    window.location.href = "/";
    return;
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!name.trim() || !phone.trim() || !email.trim()) {
    alert("Please fill account name, phone and email.");
    return;
  }

  if (cartBreakup.buyingMembershipNow && !membershipPatientName.trim()) {
    alert("Please enter the first Elite member name.");
    return;
  }

  const scheduleError = validateBookingSchedule();

if (scheduleError) {
  alert(scheduleError);
  return;
}

  if (collectionType === "home" && cartBreakup.testItems.length > 0) {
    if (!address.trim()) {
      alert("Please enter home collection address.");
      return;
    }
  }

  setLoading(true);

  const checkoutGroupKey = `CYTO-${user.id.slice(0, 8)}-${Date.now()}`;
  const now = new Date();

  const { error: profileError } = await supabase.from("patient_profiles").upsert({
    id: user.id,
    full_name: name,
    phone,
    email,
    last_address: address,
    updated_at: now.toISOString(),
  });

  if (profileError) {
    setLoading(false);
    alert(profileError.message);
    return;
  }

  const bookingRows: Record<string, unknown>[] = [];

  if (cartBreakup.buyingMembershipNow) {
    bookingRows.push({
  name,
  phone,
  email,
  address: address || "Not provided",
  test_name: "Cytocare Elite Membership - ₹89/year",
  booking_date: bookingDate || now.toISOString().slice(0, 10),
  booking_time: bookingTime || "Membership",
  booking_type: "Elite Membership",
  booking_status: paymentMode === "online" ? "Payment Pending" : "Pending",
  payment_status: paymentMode === "online" ? "Payment Pending" : "Pending",
  report_status: "Not Applicable",
  reference_number: `${checkoutGroupKey}-MEMBERSHIP`,
  amount_paid: 0,
  checkout_group_key: checkoutGroupKey,
  checkout_total_payable: cartBreakup.finalPayable,
  checkout_amount_paid: 0,
  admin_notes: `
ELITE MEMBERSHIP ORDER
Membership Fee: ₹${cartBreakup.membershipFee}
Member Name: ${membershipPatientName.trim()}
Member Phone: ${membershipPatientPhone.trim() || "Not added"}
Relation: ${membershipRelation.trim() || "Self"}
Payment Mode Selected: ${paymentMode}
Membership will activate only after payment confirmation.
`,
  order_type: "elite_membership",
  membership_member_name: membershipPatientName.trim(),
  membership_member_phone: membershipPatientPhone.trim() || null,
  membership_member_relation: membershipRelation.trim() || "Self",

  test_for_name: membershipPatientName.trim(),
  test_for_type: "Elite Membership",
  elite_family_member_id: null,
  elite_benefit_applied: false,

  test_total: 0,
  membership_fee: cartBreakup.membershipFee,
  elite_discount: 0,
  home_collection_charge: 0,
  home_collection_discount: 0,
  final_payable: cartBreakup.membershipFee,
});
  }

  if (cartBreakup.mappedTests.length > 0) {
    const testRows = cartBreakup.mappedTests.map((item, index) => {
      const itemHomeCharge =
        index === 0 ? cartBreakup.homeCollectionCharge : 0;

      const itemHomeDiscount =
        index === 0 ? cartBreakup.homeCollectionDiscount : 0;

      const itemFinalPayable =
        item.price + itemHomeCharge - item.eliteDiscount - itemHomeDiscount;

      const isNewElitePatient =
        cartBreakup.buyingMembershipNow &&
        normalText(item.assignment.patientName) ===
          normalText(membershipPatientName);

      const patientType = item.eliteEligible
        ? isNewElitePatient
          ? "New Elite Registered Member"
          : "Elite Registered Member"
        : "Other Patient";

      const priceNote = `
ORDER PRICE BREAKUP
Order Test Total: ₹${cartBreakup.testTotal}
Order Elite Eligible Total: ₹${cartBreakup.eliteEligibleTotal}
Order Normal Patient Total: ₹${cartBreakup.normalPatientTotal}
Order Elite Discount: -₹${cartBreakup.eliteDiscount}
Order Home Collection Charge: ₹${cartBreakup.homeCollectionCharge}
Order Home Collection Discount: -₹${cartBreakup.homeCollectionDiscount}
Order Membership Fee: ₹${cartBreakup.membershipFee}
Order Final Payable: ₹${cartBreakup.finalPayable}

THIS TEST
Test Name: ${item.cartName}
Test Price: ₹${item.price}
Patient Name: ${item.assignment.patientName}
Patient Phone: ${item.assignment.patientPhone || "Not added"}
Patient Type: ${patientType}
Elite Benefit Applied: ${item.eliteEligible ? "Yes" : "No"}
This Test Discount: -₹${item.eliteDiscount}
This Test Final Payable: ₹${itemFinalPayable}
Collection Type: ${collectionType === "home" ? "Home Collection" : "Lab Visit"}
`;

      return {
        name,
        phone,
        email,
        address: collectionType === "home" ? address : "Lab Visit",
        test_name: item.cartName,
        booking_date: bookingDate,
        booking_time: bookingTime,
        booking_type:
          collectionType === "home" ? "Home Collection" : "Book Test",
        booking_status:
          paymentMode === "online" ? "Payment Pending" : "Pending",
        payment_status:
          paymentMode === "online" ? "Payment Pending" : "Pending",
        report_status: "Not Uploaded",
        reference_number: `${checkoutGroupKey}-${index + 1}`,
        amount_paid: 0,
        checkout_group_key: checkoutGroupKey,
        checkout_total_payable: cartBreakup.finalPayable,
        checkout_amount_paid: 0,
        admin_notes: priceNote,

        order_type: "test_booking",

        test_for_name: item.assignment.patientName,
        test_for_type: patientType,
        elite_family_member_id: item.assignment.eliteFamilyMemberId,
        elite_benefit_applied: item.eliteEligible,

        test_total: item.price,
        membership_fee: 0,
        elite_discount: item.eliteDiscount,
        home_collection_charge: itemHomeCharge,
        home_collection_discount: itemHomeDiscount,
        final_payable: itemFinalPayable,
      };
    });

    bookingRows.push(...testRows);
  }

  const { error: bookingError } = await supabase
    .from("cytocare_bookings")
    .insert(bookingRows);

  if (bookingError) {
    setLoading(false);
    alert(bookingError.message);
    return;
  }

  if (paymentMode === "online") {
    await startOnlinePayment(checkoutGroupKey, cartBreakup.finalPayable);
    return;
  }

  clearCart();
  setLoading(false);

  if (cartBreakup.buyingMembershipNow) {
    alert(
      "Elite membership request saved. Membership will activate only after payment confirmation."
    );
    window.location.href = "/patient-dashboard";
    return;
  }

  alert("Checkout submitted successfully.");
  window.location.href = "/patient-dashboard";
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

          <h1 className="text-2xl font-extrabold">Checkout</h1>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 xl:grid-cols-[1fr_430px]">
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-7 shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <FaShoppingCart className="text-2xl text-[#0754dc]" />
              <h2 className="text-3xl font-extrabold">Your Cart</h2>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-2xl bg-[#f8fbff] p-8 text-center">
                <p className="text-xl font-extrabold">Your cart is empty.</p>

                <Link
                  href="/tests"
                  className="mt-5 inline-flex rounded-xl bg-[#0754dc] px-6 py-3 font-bold text-white"
                >
                  Add Tests
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const isMembership = isMembershipItem(item);
                  const mappedTest = cartBreakup.mappedTests.find(
                    (test) => test.cartName === item
                  );

                  return (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-extrabold">{item}</p>

                          {isMembership ? (
                            <p className="mt-1 text-sm font-bold text-[#b77900]">
                              Elite Membership • Valid for 1 year
                            </p>
                          ) : (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-semibold text-slate-500">
                                {mappedTest?.category ?? "Test"} •{" "}
                                {mappedTest?.reportingTime ?? "Ask lab"}
                              </p>

                              <p className="text-sm font-bold text-[#07142f]">
                                For:{" "}
                                {mappedTest?.assignment.patientName ||
                                  "Patient"}
                              </p>

                              {mappedTest?.eliteEligible ? (
                                <span className="inline-flex rounded-full bg-[#eafff0] px-3 py-1 text-xs font-bold text-[#05a832]">
                                  Elite Benefit Applied
                                </span>
                              ) : mappedTest?.assignment.eliteBenefitApplied ? (
                                <span className="inline-flex rounded-full bg-[#fff8df] px-3 py-1 text-xs font-bold text-[#7a4f00]">
                                  Elite selected, combined value below ₹699
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                  Normal Price
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-extrabold">
                              ₹
                              {isMembership
                                ? MEMBERSHIP_PRICE
                                : mappedTest?.price ?? 0}
                            </p>

                            {!isMembership &&
                              mappedTest &&
                              mappedTest.eliteDiscount > 0 && (
                                <p className="text-sm font-bold text-[#05a832]">
                                  -₹{mappedTest.eliteDiscount}
                                </p>
                              )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            className="rounded-xl bg-red-50 p-3 text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartBreakup.buyingMembershipNow && (
            <div className="rounded-3xl bg-white p-7 shadow-md">
              <div className="mb-6 flex items-center gap-3">
                <FaCrown className="text-2xl text-[#b77900]" />
                <h2 className="text-3xl font-extrabold">
                  First Elite Member
                </h2>
              </div>

              <p className="mb-5 rounded-2xl bg-[#fff8df] p-4 text-sm font-bold leading-6 text-[#7a4f00]">
                This person will be added as the first registered Elite member.
                Only registered Elite members get the 10% discount and free home
                collection benefit.
              </p>

              <div className="grid gap-5 md:grid-cols-3">
                <input
                  value={membershipPatientName}
                  onChange={(e) => setMembershipPatientName(e.target.value)}
                  placeholder="Elite Member Name"
                  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />

                <input
                  value={membershipPatientPhone}
                  onChange={(e) => setMembershipPatientPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />

                <input
                  value={membershipRelation}
                  onChange={(e) => setMembershipRelation(e.target.value)}
                  placeholder="Relation e.g. Self"
                  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                />
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white p-7 shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <FaUser className="text-2xl text-[#0754dc]" />
              <h2 className="text-3xl font-extrabold">Account Details</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Account Holder Name"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Account Phone Number"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Account Email"
                autoComplete="email"
                suppressHydrationWarning
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <select
                value={collectionType}
                onChange={(e) =>
                  setCollectionType(e.target.value as "home" | "lab")
                }
                className="rounded-xl border border-slate-200 p-4 font-bold outline-none focus:border-[#0754dc]"
              >
                <option value="home">Home Collection</option>
                <option value="lab">Lab Visit</option>
              </select>

              {cartBreakup.testItems.length > 0 && (
                <>
                  <input
  type="date"
  min={todayInputDate}
  value={bookingDate}
  onChange={(e) => handleBookingDateChange(e.target.value)}
  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
/>

<input
  type="time"
  min={WORK_START_TIME}
  max={WORK_END_TIME}
  step="900"
  value={bookingTime}
  onChange={(e) => handleBookingTimeChange(e.target.value)}
  className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
/>

<p className="text-sm font-bold text-slate-500 md:col-span-2">
  Available Monday to Saturday, 8:00 AM to 7:00 PM. Sunday closed.
</p>
                </>
              )}

              {collectionType === "home" && cartBreakup.testItems.length > 0 && (
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Home Collection Address"
                  className="min-h-[120px] rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc] md:col-span-2"
                />
              )}
            </div>
          </div>

          {cartBreakup.mappedTests.length > 0 && (
            <div className="rounded-3xl bg-white p-7 shadow-md">
              <div className="mb-6 flex items-center gap-3">
                <FaUserFriends className="text-2xl text-[#0754dc]" />
                <h2 className="text-3xl font-extrabold">
                  Test Patient Summary
                </h2>
              </div>

              <div className="space-y-3">
                {cartBreakup.mappedTests.map((item) => (
                  <div
                    key={item.cartName}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#f8fbff] p-4"
                  >
                    <div>
                      <p className="font-extrabold">{item.cartName}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        For: {item.assignment.patientName}
                      </p>
                    </div>

                    {item.eliteEligible ? (
                      <span className="rounded-full bg-[#eafff0] px-4 py-2 text-xs font-bold text-[#05a832]">
                        Elite Benefit
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                        Normal Price
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-fit rounded-3xl bg-white p-7 shadow-md">
          <div className="mb-6 flex items-center gap-3">
            <FaRupeeSign className="text-2xl text-[#0754dc]" />
            <h2 className="text-3xl font-extrabold">Price Breakup</h2>
          </div>

          {cartBreakup.eliteEligibleTotal > 0 && (
            <div className="mb-5 rounded-2xl border border-[#d4af37]/40 bg-[#fff8df] p-4">
              <div className="flex items-center gap-3">
                <FaCrown className="text-[#b77900]" />
                <p className="font-extrabold text-[#7a4f00]">
                  Elite Benefits Applied
                </p>
              </div>

              <p className="mt-2 text-sm font-semibold text-[#7a4f00]">
                10% test discount and free home collection above ₹699 applied
                only for eligible registered members.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <PriceRow label="Tests Total" value={`₹${cartBreakup.testTotal}`} />

            <PriceRow
              label="Elite Eligible Tests"
              value={`₹${cartBreakup.eliteEligibleTotal}`}
            />

            <PriceRow
              label="Normal Patient Tests"
              value={`₹${cartBreakup.normalPatientTotal}`}
            />

            {cartBreakup.buyingMembershipNow && (
              <PriceRow
                label="Elite Membership Fee"
                value={`₹${cartBreakup.membershipFee}`}
              />
            )}

            <PriceRow
              label="Elite 10% Discount"
              value={`-₹${cartBreakup.eliteDiscount}`}
              green
            />

            <PriceRow
              label="Home Collection Charge"
              value={`₹${cartBreakup.homeCollectionCharge}`}
            />

            {cartBreakup.normalHomeCollectionCharge > 0 && (
              <PriceRow
                label="Normal Patient Home Collection Charge"
                value={`₹${cartBreakup.normalHomeCollectionCharge}`}
              />
            )}

            {cartBreakup.eliteHomeCollectionCharge > 0 &&
              cartBreakup.homeCollectionDiscount > 0 && (
                <div className="rounded-2xl bg-[#eafff0] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-[#05a832]">
                        Elite Home Collection
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#05a832]">
                        ₹{cartBreakup.homeCollectionDiscount} waived
                      </p>
                    </div>

                    <p className="text-xl font-extrabold text-[#05a832]">
                      FREE
                    </p>
                  </div>
                </div>
              )}

            {cartBreakup.eliteHomeCollectionCharge > 0 &&
              cartBreakup.homeCollectionDiscount === 0 && (
                <PriceRow
                  label="Elite Home Collection Charge"
                  value={`₹${cartBreakup.eliteHomeCollectionCharge}`}
                />
              )}

            {cartBreakup.homeCollectionCharge === 0 && (
              <PriceRow label="Home Collection Charge" value="₹0" />
            )}

            <div className="my-4 border-t border-dashed border-slate-200" />

            <div className="flex items-center justify-between">
              <p className="text-xl font-extrabold">Final Payable</p>

              <p className="text-4xl font-extrabold text-[#0754dc]">
                ₹{cartBreakup.finalPayable}
              </p>
            </div>

            <p className="rounded-2xl bg-[#f8fbff] p-4 text-sm font-semibold leading-6 text-slate-500">
              Elite benefits apply only for tests assigned to registered Elite
              members. Other patients are charged normal price.
            </p>

            <button
              type="button"
              onClick={() => submitCheckout("online")}
              disabled={
                loading || cartItems.length === 0 || cartBreakup.finalPayable <= 0
              }
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#05a832] px-6 py-5 text-xl font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FaCreditCard />
              {loading ? "Processing..." : "Pay Online by UPI"}
            </button>

            <button
              type="button"
              onClick={() => submitCheckout("later")}
              disabled={loading || cartItems.length === 0}
              className="mt-3 w-full rounded-2xl border border-[#0754dc] bg-white px-6 py-4 text-lg font-extrabold text-[#0754dc] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300"
            >
              {loading ? "Submitting..." : "Confirm Booking & Pay Later"}
            </button>

            <p className="mt-3 rounded-2xl bg-[#f8fbff] p-4 text-sm font-bold leading-6 text-slate-500">
              UPI will be shown first. Card, net banking and other payment
              options may also appear inside the secure payment window.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function PriceRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-bold text-slate-600">{label}</p>

      <p
        className={`text-lg font-extrabold ${
          green ? "text-[#05a832]" : "text-[#07142f]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}