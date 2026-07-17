"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardCheck,
  FaClock,
  FaDownload,
  FaFileMedical,
  FaFlask,
  FaHome,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRupeeSign,
  FaSignOutAlt,
  FaUserMd,
  FaVial,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/auth/AuthModal";

type TestBooking = {
  id: number;
  name: string;
  email: string;
  phone: string;
  test_name: string;
    test_for_name?: string | null;
  test_for_type?: string | null;
  address: string;
  booking_date: string;
  booking_time: string;
  booking_type: string;
  booking_status: string | null;
  payment_status: string | null;
  report_status: string | null;
  report_url: string | null;
    reference_number?: string | null;
  report_uploaded_at?: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  test_total?: number | null;
  final_payable?: number | null;
  amount_paid?: number | null;
};

type DoctorConsultation = {
  id: number;
  patient_name: string;
  patient_email: string;
  phone: string;
  age: number;
  specialty: string;
  doctor_name: string;
  doctor_qualification: string;
  doctor_clinic: string;
  doctor_timing: string;
  doctor_booking_number: string;
  consultation_fee: string;
  health_concern: string;
  consultation_mode: string;
  preferred_date: string;
  preferred_time: string;
  created_at: string;
};

type PatientReport = {
  booking_source: string;
  booking_id: string;
  reference_number: string;
  patient_name: string;
  patient_mobile: string;
  test_name: string;
  booking_date: string;
  amount_payable: number;
  amount_paid: number;
  pending_amount: number;
  report_url: string | null;
  report_status: string;
  can_view_report: boolean;
};

type BookingGroup = {
  groupId: string;
  latestCreatedAt: string;
  patientName: string;
  email: string;
  phone: string;
  address: string;
  bookingDate: string;
  bookingTime: string;
  bookingType: string;
  bookings: TestBooking[];
  totalPayable: number;
  totalPaid: number;
  totalPending: number;
};

function rupees(value: number | null | undefined) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function getWebsiteAmountPayable(booking: TestBooking) {
  return Number(booking.final_payable ?? booking.test_total ?? 0);
}

function getWebsiteAmountPaid(booking: TestBooking) {
  const payable = getWebsiteAmountPayable(booking);

  if ((booking.payment_status ?? "").toLowerCase() === "paid") {
    return payable;
  }

  return Number(booking.amount_paid ?? 0);
}

function getWebsitePendingAmount(booking: TestBooking) {
  return Math.max(
    getWebsiteAmountPayable(booking) - getWebsiteAmountPaid(booking),
    0
  );
}

function isWebsiteBookingFullyPaid(booking: TestBooking) {
  return getWebsiteAmountPayable(booking) > 0 && getWebsitePendingAmount(booking) <= 0;
}

function isReportReady(reportStatus: string | null, bookingStatus?: string | null) {
  return (
    reportStatus === "Report Ready" ||
    reportStatus === "Report Delivered" ||
    reportStatus === "Report Uploaded" ||
    bookingStatus === "Report Ready" ||
    bookingStatus === "Report Delivered"
  );
}

function getBookingGroupKey(booking: TestBooking) {
  const checkoutMinute = new Date(booking.created_at)
    .toISOString()
    .slice(0, 16);

  return [
    booking.name,
    booking.email,
    booking.phone,
    booking.address,
    booking.booking_date,
    booking.booking_time,
    checkoutMinute,
  ].join("|");
}

function getPayNowMessage(group: BookingGroup) {
  const testNames = group.bookings.map((booking) => booking.test_name).join(", ");

  return encodeURIComponent(
    `Hello Cytocare, I want to pay for my recent booking.\n\nPatient: ${group.patientName}\nPhone: ${group.phone}\nTests: ${testNames}\nTotal Payable: ₹${group.totalPayable}\nPending Amount: ₹${group.totalPending}`
  );
}
function getBookingReference(booking: TestBooking) {
  return booking.reference_number || `WEB-${booking.id}`;
}

function isGroupFullyPaid(group: BookingGroup) {
  return group.totalPayable > 0 && group.totalPending <= 0;
}

function isBookingReportReady(booking: TestBooking) {
  return isReportReady(booking.report_status, booking.booking_status);
}

function canDownloadBookingReport(group: BookingGroup, booking: TestBooking) {
  return (
    isGroupFullyPaid(group) &&
    isBookingReportReady(booking) &&
    Boolean(booking.report_url)
  );
}


export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "bookings" | "appointments" | "reports"
  >("bookings");

  const [testBookings, setTestBookings] = useState<TestBooking[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<
    DoctorConsultation[]
  >([]);
  const [patientReports, setPatientReports] = useState<PatientReport[]>([]);
  const [openBookingGroupId, setOpenBookingGroupId] = useState<string | null>(
  null
);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");

    if (tab === "reports") {
      setActiveTab("reports");
    }

    if (tab === "appointments") {
      setActiveTab("appointments");
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        setAuthOpen(true);
        return;
      }

      setUser(data.user);
      await loadPatientData(data.user.email ?? "");
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const loggedUser = session?.user ?? null;
      setUser(loggedUser);

      if (loggedUser?.email) {
        setLoading(true);
        await loadPatientData(loggedUser.email);
        setLoading(false);
      } else {
        setTestBookings([]);
        setDoctorAppointments([]);
        setPatientReports([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPatientData(email: string) {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("cytocare_bookings")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Bookings error:", bookingsError);
      alert(bookingsError.message);
    } else {
      setTestBookings((bookingsData ?? []) as TestBooking[]);
    }

    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("doctor_consultations")
      .select("*")
      .eq("patient_email", email)
      .order("created_at", { ascending: false });

    if (appointmentsError) {
      console.error("Appointments error:", appointmentsError);
      alert(appointmentsError.message);
    } else {
      setDoctorAppointments((appointmentsData ?? []) as DoctorConsultation[]);
    }

    const { data: reportsData, error: reportsError } = await supabase.rpc(
      "patient_get_my_reports"
    );

    if (reportsError) {
      console.error("Reports error:", reportsError);
      setPatientReports([]);
    } else {
      setPatientReports((reportsData ?? []) as PatientReport[]);
    }
  }

  async function logoutPatient() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  function formatDate(dateValue: string | null | undefined) {
    if (!dateValue) return "Not selected";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(dateValue: string | null | undefined) {
    if (!dateValue) return "Not selected";

    return new Date(dateValue).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

const groupedTestBookings = useMemo(() => {
  const map = new Map<string, BookingGroup>();

  testBookings.forEach((booking) => {
    const groupId = getBookingGroupKey(booking);

    if (!map.has(groupId)) {
      map.set(groupId, {
        groupId,
        latestCreatedAt: booking.created_at,
        patientName: booking.name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        bookingType: booking.booking_type,
        bookings: [],
        totalPayable: 0,
        totalPaid: 0,
        totalPending: 0,
      });
    }

    const group = map.get(groupId)!;

    group.bookings.push(booking);
    group.totalPayable += getWebsiteAmountPayable(booking);
    group.totalPaid += getWebsiteAmountPaid(booking);
    group.totalPending += getWebsitePendingAmount(booking);

    if (
      new Date(booking.created_at).getTime() >
      new Date(group.latestCreatedAt).getTime()
    ) {
      group.latestCreatedAt = booking.created_at;
    }
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.latestCreatedAt).getTime() -
      new Date(a.latestCreatedAt).getTime()
  );
}, [testBookings]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading your dashboard...
          </h1>
          <p className="mt-3 text-slate-500">
            Please wait while we fetch your bookings.
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-4xl font-extrabold text-[#07142f]">
            Patient Login Required
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Please login first to view your bookings, appointments and reports.
          </p>

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="mt-8 rounded-xl bg-[#0754dc] px-8 py-4 text-lg font-bold text-white"
          >
            Patient Login
          </button>

          <div className="mt-5">
            <Link href="/" className="font-bold text-[#0754dc]">
              Back to Home
            </Link>
          </div>
        </div>

        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-6 py-5">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <FaHome className="text-[#0754dc]" />
            Back to Home
          </Link>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500">
              Logged in as
            </p>
            <p className="break-all text-lg font-extrabold text-[#07142f]">
              {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={logoutPatient}
            className="flex items-center gap-3 rounded-xl bg-[#e71935] px-6 py-3 font-bold text-white"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-12">
        <div className="mb-10">
          <p className="font-bold text-[#0754dc]">PATIENT DASHBOARD</p>

          <h1 className="mt-3 text-4xl font-extrabold text-[#07142f] md:text-5xl">
            My Bookings & Reports
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            View your previous test bookings, doctor appointments, payment status
            and reports.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm ${
              activeTab === "bookings"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
            <FaFlask className="mr-2 inline" />
            Test Bookings
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appointments")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm ${
              activeTab === "appointments"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
            <FaUserMd className="mr-2 inline" />
            Doctor Appointments
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm ${
              activeTab === "reports"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
            <FaFileMedical className="mr-2 inline" />
            My Reports
          </button>
        </div>

        {activeTab === "bookings" && (
          <div>
            <h2 className="mb-6 text-3xl font-extrabold text-[#07142f]">
              My Test Bookings
            </h2>

            {groupedTestBookings.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-md">
                <h3 className="text-2xl font-extrabold">
                  No test booking found
                </h3>

                <p className="mt-3 text-slate-500">
                  Your test and package bookings will appear here.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-block rounded-xl bg-[#0754dc] px-6 py-3 font-bold text-white"
                >
                  Book a Test
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
  {groupedTestBookings.map((group, index) => {
    const isOpen = openBookingGroupId === group.groupId;
    const isRecent = index === 0;
    const allPaid = group.totalPending <= 0;

    return (
      <div
        key={group.groupId}
        className="rounded-3xl bg-white p-7 shadow-md"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#0754dc]">
              Website Direct Booking
            </p>

            <h3 className="mt-2 text-2xl font-extrabold text-[#07142f]">
              {group.bookings.length} Test
              {group.bookings.length > 1 ? "s" : ""} Booked
            </h3>

            <p className="mt-2 text-sm font-bold text-slate-500">
              {group.bookings
                .slice(0, 2)
                .map((booking) => booking.test_name)
                .join(", ")}
              {group.bookings.length > 2
                ? ` +${group.bookings.length - 2} more`
                : ""}
            </p>

            <p className="mt-2 inline-flex rounded-full bg-[#eafbff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
              Booked on {formatDateTime(group.latestCreatedAt)}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              allPaid
                ? "bg-[#e8fff0] text-[#05a832]"
                : "bg-[#fff0f0] text-[#e71935]"
            }`}
          >
            {allPaid ? "Paid" : "Payment Pending"}
          </span>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <AmountCard
            label="Total Payable"
            value={rupees(group.totalPayable)}
          />

          <AmountCard
            label="Amount Paid"
            value={rupees(group.totalPaid)}
            tone={allPaid ? "green" : "red"}
          />

          <AmountCard
            label="Pending Amount"
            value={rupees(group.totalPending)}
            tone={group.totalPending > 0 ? "red" : "green"}
          />
        </div>

        <GroupBookingFlow group={group} />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setOpenBookingGroupId(isOpen ? null : group.groupId)
            }
            className="rounded-xl bg-[#0754dc] px-5 py-3 font-extrabold text-white"
          >
            {isOpen ? "Hide Details" : "View More"}
          </button>

          {isRecent && group.totalPending > 0 && (
            <a
              href={`https://wa.me/919204344772?text=${getPayNowMessage(
                group
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-[#05a832] px-5 py-3 font-extrabold text-white"
            >
              Pay Now
            </a>
          )}
        </div>

        {isOpen && (
          <div className="mt-6 rounded-3xl border border-slate-100 bg-[#f8fbff] p-6">
            <div className="mb-5 grid gap-4 md:grid-cols-2">
              <p>
                <b>Patient:</b> {group.patientName}
              </p>

              <p>
                <b>Email:</b> {group.email}
              </p>

              <p>
                <b>Phone:</b> {group.phone}
              </p>

              <p>
                <b>Booking Date:</b> {formatDate(group.bookingDate)}
              </p>

              <p>
                <b>Booking Time:</b> {group.bookingTime}
              </p>

              <p>
                <b>Address:</b> {group.address}
              </p>
            </div>

            <div className="space-y-4">
              {group.bookings.map((booking) => {
                const payable = getWebsiteAmountPayable(booking);
                const paid = getWebsiteAmountPaid(booking);
                const pending = getWebsitePendingAmount(booking);

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold text-[#0754dc]">
                          Reference No: {getBookingReference(booking)}
                        </p>

                        <h4 className="mt-2 text-xl font-extrabold text-[#07142f]">
                          {booking.test_name}
                        </h4>
<p className="mt-2 rounded-xl bg-[#f8fbff] px-4 py-3 text-sm font-extrabold text-[#07142f]">
  For: {booking.test_for_name || group.patientName}
  {booking.test_for_type ? ` • ${booking.test_for_type}` : ""}
</p>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          pending <= 0
                            ? "bg-[#e8fff0] text-[#05a832]"
                            : "bg-[#fff0f0] text-[#e71935]"
                        }`}
                      >
                        {pending <= 0 ? "Paid" : `Pending ${rupees(pending)}`}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <AmountCard label="Payable" value={rupees(payable)} />
                      <AmountCard
                        label="Paid"
                        value={rupees(paid)}
                        tone={pending <= 0 ? "green" : "red"}
                      />
                      <AmountCard
                        label="Pending"
                        value={rupees(pending)}
                        tone={pending > 0 ? "red" : "green"}
                      />
                    </div>

<div className="mt-5 rounded-2xl bg-[#f8fbff] p-5">
  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-sm font-extrabold text-slate-500">
        Report PDF
      </p>

      <p className="mt-1 text-sm font-bold text-slate-500">
        Status: {booking.report_status || "Not Uploaded"}
      </p>
    </div>

    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        canDownloadBookingReport(group, booking)
          ? "bg-[#e8fff0] text-[#05a832]"
          : "bg-[#fff0f0] text-[#e71935]"
      }`}
    >
      {canDownloadBookingReport(group, booking)
        ? "Available"
        : "Locked / Not Ready"}
    </span>
  </div>

  {canDownloadBookingReport(group, booking) ? (
    <a
      href={booking.report_url ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-xl bg-[#05a832] px-5 py-3 font-extrabold text-white"
    >
      <FaDownload />
      Download Report
    </a>
  ) : (
    <button
      type="button"
      disabled
      className="inline-flex items-center gap-3 rounded-xl bg-slate-200 px-5 py-3 font-extrabold text-slate-500"
    >
      <FaLock />
      {group.totalPending > 0
        ? `Locked until full payment. Pending ${rupees(group.totalPending)}`
        : "Report not uploaded / not ready"}
    </button>
  )}
</div>
                   
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  })}
</div>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <h2 className="mb-6 text-3xl font-extrabold text-[#07142f]">
              My Doctor Appointments
            </h2>

            {doctorAppointments.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-md">
                <h3 className="text-2xl font-extrabold">
                  No doctor appointment found
                </h3>

                <p className="mt-3 text-slate-500">
                  Your doctor consultation requests will appear here.
                </p>

                <Link
                  href="/#doctor-consultation"
                  className="mt-6 inline-block rounded-xl bg-[#e71935] px-6 py-3 font-bold text-white"
                >
                  Book Appointment
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {doctorAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl bg-white p-7 shadow-md"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#0754dc]">
                          {appointment.specialty}
                        </p>

                        <h3 className="mt-2 text-2xl font-extrabold text-[#07142f]">
                          {appointment.doctor_name}
                        </h3>

                        <p className="mt-1 text-slate-500">
                          {appointment.doctor_qualification}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#fff0f2] px-4 py-2 text-sm font-bold text-[#e71935]">
                        Requested
                      </span>
                    </div>

                    <div className="space-y-3 text-slate-700">
                      <p>
                        <b>Patient:</b> {appointment.patient_name}
                      </p>

                      <p>
                        <b>Email:</b> {appointment.patient_email}
                      </p>

                      <p>
                        <b>Age:</b> {appointment.age}
                      </p>

                      <p>
                        <b>Concern:</b> {appointment.health_concern}
                      </p>

                      <p>
                        <b>Mode:</b> {appointment.consultation_mode}
                      </p>

                      <p className="flex items-center gap-3">
                        <FaCalendarAlt className="text-[#e71935]" />
                        {formatDate(appointment.preferred_date)}
                      </p>

                      <p className="flex items-center gap-3">
                        <FaClock className="text-[#0754dc]" />
                        {appointment.preferred_time}
                      </p>

                      <p className="flex items-start gap-3">
                        <FaMapMarkerAlt className="mt-1 text-[#e71935]" />
                        {appointment.doctor_clinic}
                      </p>

                      <p>
                        <b>Timing:</b> {appointment.doctor_timing}
                      </p>

                      <p>
                        <b>Fee:</b> {appointment.consultation_fee}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <h2 className="mb-6 text-3xl font-extrabold text-[#07142f]">
              My Reports
            </h2>

            {patientReports.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-md">
                <FaFileMedical className="mx-auto text-6xl text-[#0754dc]" />

                <h3 className="mt-6 text-2xl font-extrabold">
                  No reports found yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-slate-500">
                  Your reports will appear here after Cytocare uploads them.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {patientReports.map((report) => (
                  <ReportCard
                    key={`${report.booking_source}-${report.booking_id}-${report.reference_number}`}
                    report={report}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}

function AmountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
}) {
  const color =
    tone === "green"
      ? "text-[#05a832]"
      : tone === "red"
        ? "text-[#e71935]"
        : "text-[#07142f]";

  return (
    <div className="rounded-2xl bg-[#f8fbff] p-5">
      <p className="text-sm font-extrabold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function ReportCard({
  report,
  formatDateTime,
}: {
  report: PatientReport;
  formatDateTime: (value: string | null | undefined) => string;
}) {
  const pending = Number(report.pending_amount ?? 0);
  const canView = report.can_view_report && Boolean(report.report_url);
  const isClientBooking = report.booking_source.includes("Client");

  return (
    <div className="rounded-3xl bg-white p-7 shadow-md">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className={`inline-flex rounded-full px-4 py-2 text-xs font-extrabold ${
              isClientBooking
                ? "bg-[#fff8df] text-[#7a4f00]"
                : "bg-[#eafbff] text-[#0754dc]"
            }`}
          >
            {report.booking_source}
          </p>

          <h3 className="mt-4 text-2xl font-extrabold text-[#07142f]">
            {report.test_name}
          </h3>

          <p className="mt-2 font-bold text-slate-500">
            Reference No: {report.reference_number}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            canView
              ? "bg-[#e8fff0] text-[#05a832]"
              : "bg-[#fff0f0] text-[#e71935]"
          }`}
        >
          {canView ? "Report Unlocked" : "Report Locked"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AmountCard label="Amount Payable" value={rupees(report.amount_payable)} />

        <AmountCard
          label="Amount Paid"
          value={rupees(report.amount_paid)}
          tone={pending <= 0 ? "green" : "red"}
        />

        <AmountCard
          label="Pending Amount"
          value={rupees(pending)}
          tone={pending > 0 ? "red" : "green"}
        />
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl bg-[#f8fbff] p-5 md:grid-cols-2">
        <p>
          <b>Patient:</b> {report.patient_name}
        </p>

        <p>
          <b>Mobile:</b> {report.patient_mobile || "Not available"}
        </p>

        <p>
          <b>Booked On:</b> {formatDateTime(report.booking_date)}
        </p>

        <p>
          <b>Report Status:</b> {report.report_status}
        </p>
      </div>

      <div className="mt-6">
        {canView ? (
          <a
            href={report.report_url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-[#05a832] px-6 py-4 font-extrabold text-white"
          >
            <FaDownload />
            View / Download Report
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-3 rounded-xl bg-slate-200 px-6 py-4 font-extrabold text-slate-500"
          >
            <FaLock />
            {pending > 0
              ? `Locked until full payment. Pending ${rupees(pending)}`
              : "Report not ready / not uploaded"}
          </button>
        )}
      </div>
    </div>
  );
}

function GroupBookingFlow({ group }: { group: BookingGroup }) {
  const booking = group.bookings[0];

  if (!booking) return null;

  const bookingStatus = booking.booking_status ?? "Pending";
  const paymentDone = group.totalPending <= 0;
  const reportStatus = booking.report_status ?? "Not Uploaded";

  const bookingConfirmed = [
    "Confirmed",
    "Sample Collected",
    "Report Processing",
    "Report Ready",
    "Report Delivered",
  ].includes(bookingStatus);

  const sampleCollected = [
    "Sample Collected",
    "Report Processing",
    "Report Ready",
    "Report Delivered",
  ].includes(bookingStatus);

  const reportInProcess =
    reportStatus === "Report Processing" ||
    reportStatus === "Report Ready" ||
    reportStatus === "Report Delivered" ||
    bookingStatus === "Report Processing" ||
    bookingStatus === "Report Ready" ||
    bookingStatus === "Report Delivered";

  const reportReady =
    reportStatus === "Report Ready" ||
    reportStatus === "Report Delivered" ||
    bookingStatus === "Report Ready" ||
    bookingStatus === "Report Delivered";

  const reportDelivered =
    reportStatus === "Report Delivered" ||
    bookingStatus === "Report Delivered";

  const steps = [
    {
      title: "Booking Confirmed",
      subtitle: bookingConfirmed ? "Confirmed" : "Waiting",
      done: bookingConfirmed,
      icon: FaCheckCircle,
    },
    {
      title: "Sample Collected",
      subtitle: sampleCollected ? "Collected" : "Pending",
      done: sampleCollected,
      icon: FaVial,
    },
    {
      title: paymentDone ? "Payment Done" : "Payment Due",
      subtitle: paymentDone ? "Completed" : `Pending ${rupees(group.totalPending)}`,
      done: paymentDone,
      icon: FaRupeeSign,
    },
    {
      title: "Report In Process",
      subtitle: reportInProcess ? "Processing" : "Not started",
      done: reportInProcess,
      icon: FaClock,
    },
    {
      title: "Report Ready",
      subtitle: reportReady ? "Ready" : "Pending",
      done: reportReady,
      icon: FaClipboardCheck,
    },
    {
      title: "Report Delivered",
      subtitle: reportDelivered ? "Delivered" : "Pending",
      done: reportDelivered,
      icon: FaFileMedical,
    },
  ];

  return (
    <div className="mb-5 rounded-3xl border border-slate-100 bg-[#f8fbff] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-2xl font-extrabold text-[#07142f]">
            Booking Progress
          </h4>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            One progress status for all tests in this slot
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Booking: {bookingStatus}
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Payment: {paymentDone ? "Paid" : "Pending"}
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Report: {reportStatus}
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="grid min-w-[1100px] grid-cols-6 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[58%] top-8 h-[4px] w-[84%] rounded-full ${
                      step.done ? "bg-[#05a832]" : "bg-slate-200"
                    }`}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl shadow-sm ${
                      step.done
                        ? "border-[#05a832] bg-[#05a832] text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <Icon />
                  </div>

                  <div
                    className={`mt-4 min-h-[105px] w-full rounded-2xl border px-3 py-4 ${
                      step.done
                        ? "border-[#05a832]/30 bg-[#eafff0]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <h5
                      className={`text-base font-extrabold leading-snug ${
                        step.done ? "text-[#05a832]" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </h5>

                    <p
                      className={`mt-2 text-sm font-semibold ${
                        step.done ? "text-[#178a3a]" : "text-slate-400"
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BookingFlow({ booking }: { booking: TestBooking }) {
  const bookingStatus = booking.booking_status ?? "Pending";
  const paymentStatus = booking.payment_status ?? "Pending";
  const reportStatus = booking.report_status ?? "Not Uploaded";

  const paymentDone = isWebsiteBookingFullyPaid(booking);
  const pendingAmount = getWebsitePendingAmount(booking);

  const bookingConfirmed = [
    "Confirmed",
    "Sample Collected",
    "Report Processing",
    "Report Ready",
    "Report Delivered",
  ].includes(bookingStatus);

  const sampleCollected = [
    "Sample Collected",
    "Report Processing",
    "Report Ready",
    "Report Delivered",
  ].includes(bookingStatus);

  const reportInProcess =
    reportStatus === "Report Processing" ||
    reportStatus === "Report Ready" ||
    reportStatus === "Report Delivered" ||
    bookingStatus === "Report Processing" ||
    bookingStatus === "Report Ready" ||
    bookingStatus === "Report Delivered";

  const reportReady = isReportReady(reportStatus, bookingStatus);

  const reportDelivered =
    reportStatus === "Report Delivered" || bookingStatus === "Report Delivered";

  const canDownloadReport = paymentDone && reportReady && Boolean(booking.report_url);

  const steps = [
    {
      title: "Booking Confirmed",
      subtitle: bookingConfirmed ? "Confirmed" : "Waiting",
      done: bookingConfirmed,
      icon: FaCheckCircle,
    },
    {
      title: "Sample Collected",
      subtitle: sampleCollected ? "Collected" : "Pending",
      done: sampleCollected,
      icon: FaVial,
    },
    {
      title: paymentDone ? "Payment Done" : "Payment Due",
      subtitle: paymentDone ? "Completed" : `Pending ${rupees(pendingAmount)}`,
      done: paymentDone,
      icon: FaRupeeSign,
    },
    {
      title: "Report In Process",
      subtitle: reportInProcess ? "Processing" : "Not started",
      done: reportInProcess,
      icon: FaClock,
    },
    {
      title: "Report Ready",
      subtitle: reportReady ? "Ready" : "Pending",
      done: reportReady,
      icon: FaClipboardCheck,
    },
    {
      title: "Report Delivered",
      subtitle: reportDelivered ? "Delivered" : "Pending",
      done: reportDelivered,
      icon: FaFileMedical,
    },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-slate-100 bg-[#f8fbff] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-2xl font-extrabold text-[#07142f]">
            Booking Progress
          </h4>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Updated by Cytocare admin team
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Booking: {bookingStatus}
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Payment: {paymentStatus}
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Report: {reportStatus}
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="grid min-w-[1100px] grid-cols-6 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[58%] top-8 h-[4px] w-[84%] rounded-full ${
                      step.done ? "bg-[#05a832]" : "bg-slate-200"
                    }`}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl shadow-sm ${
                      step.done
                        ? "border-[#05a832] bg-[#05a832] text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <Icon />
                  </div>

                  <div
                    className={`mt-4 min-h-[105px] w-full rounded-2xl border px-3 py-4 ${
                      step.done
                        ? "border-[#05a832]/30 bg-[#eafff0]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <h5
                      className={`text-base font-extrabold leading-snug ${
                        step.done ? "text-[#05a832]" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </h5>

                    <p
                      className={`mt-2 text-sm font-semibold ${
                        step.done ? "text-[#178a3a]" : "text-slate-400"
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reportReady && booking.report_url && (
        <div className="mt-5">
          {canDownloadReport ? (
            <a
              href={booking.report_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-[#0754dc] px-5 py-3 font-bold text-white"
            >
              <FaDownload />
              Download Report
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-3 rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-500"
            >
              <FaLock />
              Locked until full payment. Pending {rupees(pendingAmount)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}