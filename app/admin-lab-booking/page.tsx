"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cytocareTests } from "@/lib/cytocareTests";
import {
  FaSearch,
  FaUser,
  FaCrown,
  FaPlus,
  FaCheckCircle,
  FaRupeeSign,
} from "react-icons/fa";

type PatientProfile = {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  membership_status?: string;
  membership_plan?: string;
  membership_expires_at?: string | null;
};

type SelectedTest = {
  name: string;
  price: number;
};

function isEliteActive(profile: PatientProfile | null) {
  if (!profile) return false;

  if (profile.membership_status !== "active") return false;

  if (!profile.membership_expires_at) return false;

  return new Date(profile.membership_expires_at) > new Date();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function generateGroupKey() {
  return `LAB-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AdminLabBookingPage() {
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(
    null
  );

  const [patientForTest, setPatientForTest] = useState("");
  const [relation, setRelation] = useState("Self");
  const [accessionNumber, setAccessionNumber] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [bookingDate, setBookingDate] = useState(todayDate());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const eliteActive = isEliteActive(selectedPatient);

  const filteredTests = useMemo(() => {
    const query = testSearch.trim().toLowerCase();

    if (!query) return cytocareTests.slice(0, 20);

    return cytocareTests
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 30);
  }, [testSearch]);

  const subtotal = selectedTests.reduce((sum, item) => sum + item.price, 0);
  const eliteDiscount = eliteActive ? Math.round(subtotal * 0.1) : 0;
  const finalAmount = Math.max(subtotal - eliteDiscount, 0);
  const paid = Number(paidAmount || 0);
  const balance = Math.max(finalAmount - paid, 0);

  async function searchPatients() {
    const query = searchText.trim();

    if (!query) {
      alert("Enter patient name, mobile number, or email.");
      return;
    }

    setSearching(true);
    setPatients([]);
    setSelectedPatient(null);
    setMessage("");

    const { data, error } = await supabase
      .from("patient_profiles")
      .select("*")
      .or(
        `full_name.ilike.%${query}%,name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
      )
      .limit(20);

    setSearching(false);

    if (error) {
      alert(error.message);
      return;
    }

    setPatients(data || []);

    if (!data || data.length === 0) {
      setMessage("No registered patient found.");
    }
  }

  function addTest(testName: string, price: number) {
    const alreadyAdded = selectedTests.some((item) => item.name === testName);

    if (alreadyAdded) {
      alert("This test is already added.");
      return;
    }

    setSelectedTests((prev) => [...prev, { name: testName, price }]);
  }

  function removeTest(testName: string) {
    setSelectedTests((prev) => prev.filter((item) => item.name !== testName));
  }

  async function createLabBooking() {
    if (!selectedPatient) {
      alert("Please select a registered patient first.");
      return;
    }

    if (!patientForTest.trim()) {
      alert("Please enter patient/family member name.");
      return;
    }

    if (!accessionNumber.trim()) {
      alert("Please enter PCode / accession number from lab software.");
      return;
    }

    if (selectedTests.length === 0) {
      alert("Please add at least one test.");
      return;
    }

    setSaving(true);
    setMessage("");

    const checkoutGroupKey = generateGroupKey();
    const patientEmail = selectedPatient.email || "";
    const patientPhone = selectedPatient.phone || "";
    const mainPatientName =
      selectedPatient.full_name || selectedPatient.name || patientForTest.trim();

    const rows = selectedTests.map((test, index) => {
      const individualDiscount = eliteActive
        ? Math.round(test.price * 0.1)
        : 0;

      const individualFinal = Math.max(test.price - individualDiscount, 0);

      return {
        name: mainPatientName,
        phone: patientPhone,
        email: patientEmail,
        address: selectedPatient.address || "",
        test_name: test.name,
        date: bookingDate,
        time: "Lab Visit",
        slot: "Lab Visit",
        location: "Lab Visit",
        notes: `Booked by admin from lab. PCode: ${accessionNumber.trim()}`,

        booking_source: "lab_admin",
        booked_by_admin: true,
        family_member_name: patientForTest.trim(),
        family_member_relation: relation,
        accession_number: accessionNumber.trim(),
        software_pcode: accessionNumber.trim(),

        reference_number:
          selectedTests.length === 1
            ? accessionNumber.trim()
            : `${accessionNumber.trim()}-${index + 1}`,

        checkout_group_key: checkoutGroupKey,
        checkout_total_payable: finalAmount,
        checkout_amount_paid: paid,
        amount_paid: selectedTests.length === 1 ? paid : 0,

        total_amount: test.price,
        discount_amount: individualDiscount,
        final_amount: individualFinal,

        payment_status: balance <= 0 ? "Paid" : "Pending",
        booking_status: "Booking Confirmed",
        report_status: "Not Uploaded",
      };
    });

    const { error } = await supabase.from("cytocare_bookings").insert(rows);

    setSaving(false);

    if (error) {
      alert(error.message);
      setMessage(error.message);
      return;
    }

    alert("Lab booking created successfully.");
    setMessage("Lab booking created successfully. It will now show in patient dashboard.");

    setAccessionNumber("");
    setTestSearch("");
    setSelectedTests([]);
    setPaidAmount("");
    setPatientForTest("");
    setRelation("Self");
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Admin Lab Booking
          </h1>

          <p className="mt-2 text-slate-600">
            Create lab bookings for registered website patients using old
            software PCode / accession number.
          </p>

          <div className="mt-8 rounded-3xl bg-slate-50 p-5">
            <h2 className="text-xl font-extrabold text-[#07142f]">
              Search Registered Patient
            </h2>

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, mobile number, or email"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-4 font-semibold outline-none focus:border-[#0754dc]"
              />

              <button
                type="button"
                onClick={searchPatients}
                disabled={searching}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0754dc] px-6 py-4 font-extrabold text-white disabled:opacity-60"
              >
                <FaSearch />
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-[#0754dc]">
                {message}
              </div>
            )}

            {patients.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {patients.map((patient) => {
                  const active = isEliteActive(patient);

                  return (
                    <button
                      key={patient.id || patient.email}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientForTest(
                          patient.full_name || patient.name || ""
                        );
                        setRelation("Self");
                      }}
                      className={`rounded-3xl border p-5 text-left transition ${
                        selectedPatient?.email === patient.email
                          ? "border-[#0754dc] bg-blue-50"
                          : "border-slate-200 bg-white hover:border-[#0754dc]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="flex items-center gap-2 text-lg font-extrabold text-[#07142f]">
                            <FaUser className="text-[#0754dc]" />
                            {patient.full_name || patient.name || "Unnamed Patient"}
                          </p>

                          <p className="mt-2 text-sm font-semibold text-slate-600">
                            {patient.phone || "No phone"} •{" "}
                            {patient.email || "No email"}
                          </p>
                        </div>

                        {active && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-extrabold text-[#f7d774]">
                            <FaCrown />
                            Elite
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-extrabold text-[#07142f]">
                  Booking Details
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-slate-600">
                      Patient / Family Member Name
                    </label>
                    <input
                      value={patientForTest}
                      onChange={(e) => setPatientForTest(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-[#0754dc]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-600">
                      Relation
                    </label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-[#0754dc]"
                    >
                      <option>Self</option>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Spouse</option>
                      <option>Son</option>
                      <option>Daughter</option>
                      <option>Brother</option>
                      <option>Sister</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-600">
                      PCode / Accession Number
                    </label>
                    <input
                      value={accessionNumber}
                      onChange={(e) => setAccessionNumber(e.target.value)}
                      placeholder="Example: 160711"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-[#0754dc]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-600">
                      Booking Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-[#0754dc]"
                    />
                  </div>
                </div>

                {eliteActive && (
                  <div className="mt-5 rounded-2xl bg-black p-4 text-[#f7d774]">
                    <p className="flex items-center gap-2 font-extrabold">
                      <FaCrown />
                      Elite membership active. 10% discount will be applied.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <label className="text-sm font-bold text-slate-600">
                    Search Test / Package
                  </label>

                  <input
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    placeholder="Search CBC, Thyroid, Full Body Checkup..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-[#0754dc]"
                  />

                  <div className="mt-3 max-h-[320px] overflow-y-auto rounded-2xl border border-slate-200">
                    {filteredTests.map((test) => (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => addTest(test.name, test.price)}
                        className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50"
                      >
                        <div>
                          <p className="font-extrabold text-[#07142f]">
                            {test.name}
                          </p>
                          <p className="text-xs font-semibold text-slate-500">
                            {test.category}
                          </p>
                        </div>

                        <span className="font-extrabold text-[#0754dc]">
                          ₹{test.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-extrabold text-[#07142f]">
                  Booking Summary
                </h2>

                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-sm font-bold text-slate-500">
                    Registered Account
                  </p>
                  <p className="mt-1 font-extrabold text-[#07142f]">
                    {selectedPatient.full_name || selectedPatient.name}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">
                    {selectedPatient.email}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedTests.length === 0 && (
                    <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">
                      No test added yet.
                    </p>
                  )}

                  {selectedTests.map((test) => (
                    <div
                      key={test.name}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4"
                    >
                      <div>
                        <p className="font-extrabold text-[#07142f]">
                          {test.name}
                        </p>
                        <p className="text-sm font-semibold text-slate-500">
                          ₹{test.price}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTest(test.name)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-white p-5">
                  <div className="flex justify-between text-sm font-bold text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm font-bold text-green-600">
                    <span>Elite Discount</span>
                    <span>-₹{eliteDiscount}</span>
                  </div>

                  <div className="mt-3 flex justify-between border-t pt-3 text-lg font-extrabold text-[#07142f]">
                    <span>Payable</span>
                    <span>₹{finalAmount}</span>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-bold text-slate-600">
                      Paid Amount
                    </label>
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <FaRupeeSign className="text-slate-400" />
                      <input
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="0"
                        className="w-full font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-base font-extrabold text-red-600">
                    <span>Balance</span>
                    <span>₹{balance}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={createLabBooking}
                  disabled={saving}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0754dc] px-6 py-4 font-extrabold text-white disabled:opacity-60"
                >
                  <FaPlus />
                  {saving ? "Saving..." : "Create Lab Booking"}
                </button>

                {message && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
                    <FaCheckCircle />
                    {message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
