"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/constants/site";


type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
  selectedTest: string;
  userEmail?: string;
  patientName?: string;
  patientPhone?: string;
  savedAddress?: string;
  cartTests?: string[];
  onBookingSuccess?: () => void | Promise<void>;
};

const tests = [
"Cytocare Essential Family Membership",
  "CBC",
  "Thyroid Profile",
  "Vitamin D",
  "Diabetes Profile",
  "Liver Function Test",
  "Kidney Function Test",
  "Lipid Profile",
  "Full Body Checkup",
  "CARE PLUS - Advance Health Checkup",
  "Fitness Plus - Whole Body Checkup",
  "Diabetics Monitor",
  "Diabetics Monitor Plus",
  "Iron Profile",
  "Fever Panel",
  "Anaemia Profile - 1",
  "Anaemia Profile - 2",
  "Arthritis Panel - 1",
  "Arthritis Panel - 2",
  "ANC Profile - Antenatal Profile",
  "CA 125, Cancer Marker, Serum",
];

export default function BookingModal({
  isOpen,
  onClose,
  bookingType,
  selectedTest,
  userEmail = "",
  patientName = "",
  patientPhone = "",
  savedAddress = "",
  cartTests = [],
  onBookingSuccess,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    test_name: "",
    address: "",
    booking_date: "",
    booking_time: "",
  });

  const today = new Date().toISOString().split("T")[0];

 useEffect(() => {
  if (!isOpen) return;

  setForm((prev) => ({
    ...prev,
    name: patientName || prev.name,
    phone: patientPhone || prev.phone,
    email: userEmail || prev.email,
    test_name:
      cartTests.length > 0
        ? cartTests.join(", ")
        : selectedTest || prev.test_name,
  }));
}, [isOpen, selectedTest, userEmail, patientName, patientPhone, cartTests]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      alert("Please enter a valid name.");
      return;
    }

    if (!form.email.includes("@") || !form.email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (form.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    if (!form.test_name) {
      alert("Please select a test or package.");
      return;
    }

    if (!form.address.trim()) {
      alert("Please enter complete address.");
      return;
    }

    if (!form.booking_date) {
      alert("Please select booking date.");
      return;
    }

    if (!form.booking_time) {
      alert("Please select booking time.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("cytocare_bookings").insert([
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        test_name: form.test_name,
        address: form.address.trim(),
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        booking_type: bookingType,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Booking error:", error);
      alert(error.message);
      return;
    }

    const whatsappMessage = `
Hello CytoCare Path Lab,

I want to book a test/package.

Booking Type: ${bookingType}

Patient Details:
Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone}

Test / Package:
${form.test_name}

Sample Collection Address:
${form.address}

Preferred Date: ${form.booking_date}
Preferred Time: ${form.booking_time}
`;
const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  const profileUpdate: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    last_address: string;
    updated_at: string;
    membership_plan?: string;
    membership_status?: string;
    membership_started_at?: string;
    membership_expires_at?: string;
  } = {
    id: user.id,
    full_name: form.name.trim(),
    phone: form.phone,
    email: userEmail || form.email.trim(),
    last_address: form.address.trim(),
    updated_at: new Date().toISOString(),
  };

  if (bookingType === "Membership Plan") {
    const startedAt = new Date();
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 365);

    profileUpdate.membership_plan =
      form.test_name || "Cytocare Essential Family Membership";
    profileUpdate.membership_status = "active";
    profileUpdate.membership_started_at = startedAt.toISOString();
    profileUpdate.membership_expires_at = expiresAt.toISOString();
  }

  await supabase.from("patient_profiles").upsert(profileUpdate);
}
    alert("Booking submitted successfully!");
    await onBookingSuccess?.();

    window.open(
      `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );

  setForm({
  name: "",
  email: userEmail,
  phone: "",
  test_name: "",
  address: "",
  booking_date: "",
  booking_time: "",
});

    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <h2 className="text-4xl font-extrabold text-[#07142f]">
              {bookingType}
            </h2>

            <p className="mt-3 text-xl text-slate-500">
              Fill the details and our team will contact you.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={submitBooking} className="space-y-5">
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          <input
  type="email"
  value={form.email}
  onChange={(e) => updateField("email", e.target.value)}
  readOnly={!!userEmail}
  placeholder="Email Address"
  className={`w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc] ${
    userEmail ? "bg-slate-100 text-slate-600" : ""
  }`}
  required
/>

          <input
            value={form.phone}
            onChange={(e) =>
              updateField(
                "phone",
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="10 Digit Phone Number"
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          {cartTests.length > 0 ? (
  <div className="rounded-2xl border border-slate-200 bg-[#f5f9ff] p-5">
    <p className="mb-3 font-bold text-[#0754dc]">Selected Tests</p>

    <div className="space-y-2">
      {cartTests.map((test, index) => (
        <div
          key={test}
          className="rounded-xl bg-white px-4 py-3 font-bold text-[#07142f]"
        >
          {index + 1}. {test}
        </div>
      ))}
    </div>
  </div>
) : (
  <select
    value={form.test_name}
    onChange={(e) => updateField("test_name", e.target.value)}
    className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
    required
  >
    <option value="">Select Test / Package</option>

    {tests.map((test) => (
      <option key={test} value={test}>
        {test}
      </option>
    ))}
  </select>
)}
          <textarea
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Complete Address for Sample Collection"
            className="min-h-[120px] w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />
{savedAddress && (
  <div className="rounded-2xl border border-[#0754dc]/20 bg-[#eef5ff] p-4">
    <p className="mb-2 text-sm font-bold text-[#0754dc]">
      Last used address
    </p>

    <p className="text-slate-700">{savedAddress}</p>

    <button
      type="button"
      onClick={() => updateField("address", savedAddress)}
      className="mt-3 rounded-xl bg-[#0754dc] px-5 py-2 font-bold text-white"
    >
      Use this address
    </button>
  </div>
)}
          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="date"
              min={today}
              value={form.booking_date}
              onChange={(e) => updateField("booking_date", e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
              required
            />

            <input
              type="time"
              value={form.booking_time}
              onChange={(e) => updateField("booking_time", e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#0754dc] py-4 text-xl font-bold text-white hover:bg-[#0647c9] disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}