"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaTimes } from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function BookingModal({
  isOpen,
  onClose,
  bookingType,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    test_name: "",
    address: "",
    booking_date: "",
    booking_time: "",
  });

  const tests = [
    "CBC",
    "Thyroid Profile",
    "Vitamin D",
    "Diabetes Profile",
    "Liver Function Test",
    "Kidney Function Test",
    "Lipid Profile",
    "Full Body Checkup",
  ];

  const today = new Date().toISOString().split("T")[0];

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      alert("Please enter a valid name.");
      return;
    }

    if (form.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("cytocare_bookings").insert([
      {
        name: form.name.trim(),
        phone: form.phone,
        test_name: form.test_name,
        address: form.address,
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        booking_type: bookingType,
      },
    ]);

    setLoading(false);

    if (error) {
  console.error("Supabase booking error:", error);
  alert(error.message);
  return;
}

    const whatsappText = `Hello CytoCare Path Lab, I want to book a test.%0A%0AType: ${bookingType}%0AName: ${form.name}%0APhone: ${form.phone}%0ATest: ${form.test_name}%0AAddress: ${form.address}%0ADate: ${form.booking_date}%0ATime: ${form.booking_time}`;

    alert("Booking submitted successfully!");

    window.open(
      `https://wa.me/${siteConfig.whatsapp}?text=${whatsappText}`,
      "_blank"
    );

    setForm({
      name: "",
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
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#07142f]">
              {bookingType}
            </h2>
            <p className="mt-1 text-slate-500">
              Fill the details and our team will contact you.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={submitBooking} className="mt-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
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

          <textarea
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Complete Address for Sample Collection"
            className="min-h-[100px] w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
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