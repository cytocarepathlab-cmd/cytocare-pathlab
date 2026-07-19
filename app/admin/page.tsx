"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaCrown,
  FaFileMedical,
  FaFlask,
  FaHome,
  FaPhoneAlt,
  FaRupeeSign,
  FaSave,
  FaSignOutAlt,
  FaUser,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/auth/AuthModal";
import ClientBookingsSection from "@/components/admin/ClientBookingsSection";

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
  created_at: string;
  updated_at: string;
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
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  test_total?: number | null;
  final_payable?: number | null;
  amount_paid?: number | null;
  checkout_group_key?: string | null;
  checkout_total_payable?: number | null;
  checkout_amount_paid?: number | null;
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
  bookingStatus: string;
  paymentStatus: string;
  reportStatus: string;
  adminNotes: string;
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
  consultation_status: string | null;
  payment_status: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
};

const bookingStatuses = [
  "Pending",
  "Confirmed",
  "Sample Collected",
  "Report Processing",
  "Report Delivered",
  "Cancelled",
];

const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

const reportStatuses = [
  "Not Uploaded",
  "Report Processing",
  "Report Ready",
  "Report Delivered",
];

const consultationStatuses = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

function rupees(value: number | null | undefined) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function getBookingPayable(booking: TestBooking) {
  return Number(booking.final_payable ?? booking.test_total ?? 0);
}

function getBookingPaid(booking: TestBooking) {
  return Number(booking.amount_paid ?? 0);
}

function getBookingGroupKey(booking: TestBooking) {
  if (booking.checkout_group_key) return booking.checkout_group_key;

  const checkoutMinute = booking.created_at
    ? new Date(booking.created_at).toISOString().slice(0, 16)
    : "no-time";

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

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "appointments" | "patients" | "clientBookings"
  >("overview");

  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [eliteFamilyMembers, setEliteFamilyMembers] = useState<
    EliteFamilyMember[]
  >([]);
  const [bookings, setBookings] = useState<TestBooking[]>([]);
  const [appointments, setAppointments] = useState<DoctorConsultation[]>([]);

  const [search, setSearch] = useState("");
  const [openBookingGroupId, setOpenBookingGroupId] = useState<string | null>(
    null
  );
  const [editingGroupPaid, setEditingGroupPaid] = useState<
    Record<string, string>
  >({});
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        setAuthOpen(true);
        return;
      }

      setUser(data.user);

      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError) {
        console.error("Admin check error:", adminError);
      }

      if (!adminData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadAdminData();
      setLoading(false);
    }

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const loggedUser = session?.user ?? null;
      setUser(loggedUser);

      if (!loggedUser) {
        setIsAdmin(false);
        setAuthOpen(true);
        return;
      }

      const { data: adminData } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", loggedUser.id)
        .maybeSingle();

      if (adminData) {
        setIsAdmin(true);
        await loadAdminData();
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadAdminData() {
    const { data: patientsData, error: patientsError } = await supabase
      .from("patient_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: familyMembersData, error: familyMembersError } = await supabase
      .from("elite_family_members")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (familyMembersError) {
      console.log(familyMembersError.message);
    } else {
      setEliteFamilyMembers((familyMembersData ?? []) as EliteFamilyMember[]);
    }

    if (patientsError) {
      console.error("Patients error:", patientsError);
      alert(patientsError.message);
    } else {
      setPatients((patientsData ?? []) as PatientProfile[]);
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("cytocare_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Bookings error:", bookingsError);
      alert(bookingsError.message);
    } else {
      setBookings((bookingsData ?? []) as TestBooking[]);
    }

    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("doctor_consultations")
      .select("*")
      .order("created_at", { ascending: false });

    if (appointmentsError) {
      console.error("Appointments error:", appointmentsError);
      alert(appointmentsError.message);
    } else {
      setAppointments((appointmentsData ?? []) as DoctorConsultation[]);
    }
  }

  async function logoutAdmin() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function formatDate(dateValue: string | null) {
    if (!dateValue) return "Not set";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(dateValue: string | null) {
    if (!dateValue) return "Not set";

    return new Date(dateValue).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isActiveMember(patient: PatientProfile) {
    if (patient.membership_status !== "active") return false;
    if (!patient.membership_expires_at) return false;

    return new Date(patient.membership_expires_at).getTime() > Date.now();
  }

  function getEliteMembersForPatient(patientId: string) {
    return eliteFamilyMembers.filter((member) => member.user_id === patientId);
  }

  async function updateBookingField(
    bookingId: number,
    field:
      | "booking_status"
      | "payment_status"
      | "report_status"
      | "admin_notes"
      | "report_url",
    value: string
  ) {
    const { error } = await supabase
      .from("cytocare_bookings")
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (error) {
      alert(error.message);
      return;
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              [field]: value,
              updated_at: new Date().toISOString(),
            }
          : booking
      )
    );
  }

  async function updateBookingGroupField(
    group: BookingGroup,
    field: "booking_status" | "payment_status" | "report_status" | "admin_notes",
    value: string
  ) {
    const ids = group.bookings.map((booking) => booking.id);

    const { error } = await supabase
      .from("cytocare_bookings")
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      alert(error.message);
      return;
    }

    setBookings((prev) =>
      prev.map((booking) =>
        ids.includes(booking.id)
          ? {
              ...booking,
              [field]: value,
              updated_at: new Date().toISOString(),
            }
          : booking
      )
    );
  }

  function getEditingPaidAmount(group: BookingGroup) {
    return editingGroupPaid[group.groupId] ?? String(group.totalPaid ?? 0);
  }

  async function saveBookingGroupPayment(group: BookingGroup) {
    const paidAmount = Number(getEditingPaidAmount(group));

    if (Number.isNaN(paidAmount) || paidAmount < 0) {
      alert("Please enter a valid amount received.");
      return;
    }

    const now = new Date().toISOString();
    const groupPayable = group.totalPayable;
    const paymentStatus = paidAmount >= groupPayable && groupPayable > 0 ? "Paid" : "Pending";

    setSavingGroupId(group.groupId);

    let remainingPaid = paidAmount;

    for (const booking of group.bookings) {
      const bookingPayable = getBookingPayable(booking);
      const bookingPaid = Math.min(Math.max(remainingPaid, 0), bookingPayable);
      remainingPaid -= bookingPaid;

      const { error } = await supabase
        .from("cytocare_bookings")
        .update({
          amount_paid: bookingPaid,
          checkout_group_key: group.groupId,
          checkout_total_payable: groupPayable,
          checkout_amount_paid: paidAmount,
          payment_status: paymentStatus,
          payment_updated_at: now,
          updated_at: now,
        })
        .eq("id", booking.id);

      if (error) {
        alert(error.message);
        setSavingGroupId(null);
        return;
      }
    }

    setBookings((prev) =>
      prev.map((booking) => {
        if (!group.bookings.some((item) => item.id === booking.id)) {
          return booking;
        }

        let allocatedPaid = paidAmount;

        for (const item of group.bookings) {
          const itemPayable = getBookingPayable(item);
          const itemPaid = Math.min(Math.max(allocatedPaid, 0), itemPayable);
          allocatedPaid -= itemPaid;

          if (item.id === booking.id) {
            return {
              ...booking,
              amount_paid: itemPaid,
              checkout_group_key: group.groupId,
              checkout_total_payable: groupPayable,
              checkout_amount_paid: paidAmount,
              payment_status: paymentStatus,
              updated_at: now,
            };
          }
        }

        return booking;
      })
    );

    setSavingGroupId(null);
    alert("Amount received updated for this full checkout.");
  }

  async function updateConsultationField(
    consultationId: number,
    field: "consultation_status" | "payment_status" | "admin_notes",
    value: string
  ) {
    const { error } = await supabase
      .from("doctor_consultations")
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId);

    if (error) {
      alert(error.message);
      return;
    }

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === consultationId
          ? {
              ...appointment,
              [field]: value,
              updated_at: new Date().toISOString(),
            }
          : appointment
      )
    );
  }

  const bookingGroups = useMemo(() => {
    const map = new Map<string, BookingGroup>();

    bookings.forEach((booking) => {
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
          bookingStatus: booking.booking_status ?? "Pending",
          paymentStatus: booking.payment_status ?? "Pending",
          reportStatus: booking.report_status ?? "Not Uploaded",
          adminNotes: booking.admin_notes ?? "",
        });
      }

      const group = map.get(groupId)!;
      group.bookings.push(booking);

      if (
        new Date(booking.created_at).getTime() >
        new Date(group.latestCreatedAt).getTime()
      ) {
        group.latestCreatedAt = booking.created_at;
      }
    });

    return Array.from(map.values())
      .map((group) => {
        const rowTotalPayable = group.bookings.reduce(
          (sum, booking) => sum + getBookingPayable(booking),
          0
        );
        const storedTotalPayable = Math.max(
          ...group.bookings.map((booking) => Number(booking.checkout_total_payable ?? 0)),
          0
        );
        const storedPaid = Math.max(
          ...group.bookings.map((booking) => Number(booking.checkout_amount_paid ?? 0)),
          0
        );
        const rowPaid = group.bookings.reduce(
          (sum, booking) => sum + getBookingPaid(booking),
          0
        );

        const totalPayable = storedTotalPayable > 0 ? storedTotalPayable : rowTotalPayable;
        const totalPaid = storedPaid > 0 ? storedPaid : rowPaid;

        return {
          ...group,
          totalPayable,
          totalPaid,
          totalPending: Math.max(totalPayable - totalPaid, 0),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latestCreatedAt).getTime() -
          new Date(a.latestCreatedAt).getTime()
      );
  }, [bookings]);

  const filteredBookingGroups = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return bookingGroups;

    return bookingGroups.filter((group) => {
      const groupText = [
        group.patientName,
        group.email,
        group.phone,
        group.address,
        group.bookingDate,
        group.bookingTime,
        group.bookingType,
        group.bookingStatus,
        group.paymentStatus,
        group.reportStatus,
        group.bookings.map((booking) => booking.test_name).join(" "),
        group.bookings.map((booking) => booking.test_for_name ?? "").join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return groupText.includes(q);
    });
  }, [bookingGroups, search]);

  const filteredAppointments = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return appointments;

    return appointments.filter((appointment) =>
      [
        appointment.patient_name,
        appointment.patient_email,
        appointment.phone,
        appointment.specialty,
        appointment.doctor_name,
        appointment.consultation_status ?? "",
        appointment.payment_status ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [appointments, search]);

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return patients;

    return patients.filter((patient) =>
      [
        patient.full_name,
        patient.email,
        patient.phone,
        patient.membership_status ?? "",
        patient.membership_plan ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [patients, search]);

  const activeMembers = patients.filter((patient) => isActiveMember(patient));
  const normalUsers = patients.filter((patient) => !isActiveMember(patient));
  const pendingBookings = bookings.filter(
    (booking) => (booking.booking_status ?? "Pending") === "Pending"
  );
  const confirmedBookings = bookings.filter(
    (booking) => booking.booking_status === "Confirmed"
  );
  const sampleCollectedBookings = bookings.filter(
    (booking) => booking.booking_status === "Sample Collected"
  );
  const reportProcessingBookings = bookings.filter(
    (booking) => booking.booking_status === "Report Processing"
  );
  const reportDeliveredBookings = bookings.filter(
    (booking) => booking.booking_status === "Report Delivered"
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading admin dashboard...
          </h1>
          <p className="mt-3 text-slate-500">Please wait.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-4xl font-extrabold text-[#07142f]">
            Admin Login Required
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Login with your Cytocare admin email to access this page.
          </p>

          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="mt-8 rounded-xl bg-[#0754dc] px-8 py-4 text-lg font-bold text-white"
          >
            Admin Login
          </button>
        </div>

        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-4xl font-extrabold text-[#e71935]">
            Access Denied
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            This account is not registered as Cytocare admin.
          </p>

          <p className="mt-3 font-bold text-[#07142f]">{user.email}</p>

          <button
            type="button"
            onClick={logoutAdmin}
            className="mt-8 rounded-xl bg-[#e71935] px-8 py-4 text-lg font-bold text-white"
          >
            Logout
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div>
            <p className="font-bold text-[#0754dc]">CYTOCARE ADMIN</p>
            <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl bg-[#eef5ff] px-5 py-3 font-bold text-[#0754dc]"
            >
              <FaHome />
              Website
            </Link>

            <div className="rounded-2xl bg-[#f5f9ff] px-5 py-3">
              <p className="text-xs font-semibold text-slate-500">
                Logged in as
              </p>
              <p className="font-extrabold">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={logoutAdmin}
              className="flex items-center gap-3 rounded-xl bg-[#e71935] px-5 py-3 font-bold text-white"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm ${
              activeTab === "overview"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm ${
              activeTab === "bookings"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
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
            Doctor Appointments
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("patients")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm ${
              activeTab === "patients"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
            Patients
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clientBookings")}
            className={`rounded-2xl px-6 py-4 text-lg font-bold shadow-sm transition ${
              activeTab === "clientBookings"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#07142f]"
            }`}
          >
            Client Bookings
          </button>
          <Link
  href="/admin-software-upload"
  className="rounded-2xl bg-white px-6 py-4 text-lg font-bold text-[#07142f] shadow-sm transition hover:bg-[#0754dc] hover:text-white"
>
  Software Excel Upload
</Link>

<Link
  href="/admin-lab-booking"
  className="rounded-2xl bg-white px-6 py-4 text-lg font-bold text-[#07142f] shadow-sm transition hover:bg-[#0754dc] hover:text-white"
>
  Lab Booking
</Link>
        </div>

        {activeTab !== "overview" && (
          <div className="mb-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, status..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-lg outline-none focus:border-[#0754dc]"
            />
          </div>
        )}

        {activeTab === "overview" && (
          <div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                title="Total Patients"
                value={patients.length}
                icon={<FaUsers />}
                color="bg-[#0754dc]"
              />

              <AdminStatCard
                title="Exclusive Members"
                value={activeMembers.length}
                icon={<FaCrown />}
                color="bg-[#07142f]"
                premium
              />

              <AdminStatCard
                title="Normal Users"
                value={normalUsers.length}
                icon={<FaUser />}
                color="bg-[#05a832]"
              />

              <AdminStatCard
                title="Total Tests Booked"
                value={bookings.length}
                icon={<FaFlask />}
                color="bg-[#e71935]"
              />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              <MiniStat title="Pending" value={pendingBookings.length} />
              <MiniStat title="Confirmed" value={confirmedBookings.length} />
              <MiniStat
                title="Sample Collected"
                value={sampleCollectedBookings.length}
              />
              <MiniStat
                title="Report Processing"
                value={reportProcessingBookings.length}
              />
              <MiniStat
                title="Report Delivered"
                value={reportDeliveredBookings.length}
              />
            </div>

            <div className="mt-10 grid gap-8 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-7 shadow-md">
                <h2 className="mb-5 text-2xl font-extrabold">
                  Latest Test Bookings
                </h2>

                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl bg-[#f8fbff] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-extrabold">{booking.name}</p>
                          <p className="text-sm text-slate-500">
                            {booking.test_name}
                          </p>
                        </div>

                        <StatusBadge
                          status={booking.booking_status ?? "Pending"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-7 shadow-md">
                <h2 className="mb-5 text-2xl font-extrabold">
                  Latest Patients
                </h2>

                <div className="space-y-4">
                  {patients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.id}
                      className="rounded-2xl bg-[#f8fbff] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-extrabold">
                            {patient.full_name || "Unnamed Patient"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {patient.email}
                          </p>
                        </div>

                        {isActiveMember(patient) ? (
                          <span className="rounded-full bg-[#07142f] px-4 py-2 text-xs font-bold text-[#f7d774]">
                            Exclusive
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                            Normal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            {filteredBookingGroups.map((group) => {
              const isOpen = openBookingGroupId === group.groupId;
              const allPaid = group.totalPending <= 0 && group.totalPayable > 0;

              return (
                <div
                  key={group.groupId}
                  className="rounded-3xl bg-white p-7 shadow-md"
                >
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="font-bold text-[#0754dc]">
                        Checkout Booking
                      </p>

                      <h2 className="mt-2 text-3xl font-extrabold">
                        {group.bookings.length} Test
                        {group.bookings.length > 1 ? "s" : ""} Booked
                      </h2>

                      <p className="mt-2 text-slate-500">
                        {group.bookings
                          .slice(0, 2)
                          .map((booking) => booking.test_name)
                          .join(", ")}
                        {group.bookings.length > 2
                          ? ` +${group.bookings.length - 2} more`
                          : ""}
                      </p>

                      <p className="mt-2 text-slate-500">
                        Booked on {formatDateTime(group.latestCreatedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={group.bookingStatus} />
                      <StatusBadge status={allPaid ? "Paid" : "Pending"} />
                    </div>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AmountCard
                      label="Total Payable"
                      value={rupees(group.totalPayable)}
                    />

                    <AmountCard
                      label="Amount Received"
                      value={rupees(group.totalPaid)}
                      tone={allPaid ? "green" : "red"}
                    />

                    <AmountCard
                      label="Pending Amount"
                      value={rupees(group.totalPending)}
                      tone={group.totalPending > 0 ? "red" : "green"}
                    />

                    <AmountCard
                      label="Report Access"
                      value={allPaid ? "Unlocked" : "Locked"}
                      tone={allPaid ? "green" : "red"}
                    />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <div className="rounded-2xl bg-[#f8fbff] p-5">
                      <h3 className="mb-4 text-xl font-extrabold">
                        Patient Details
                      </h3>

                      <div className="grid gap-3 md:grid-cols-2 text-slate-700">
                        <p>
                          <b>Name:</b> {group.patientName}
                        </p>
                        <p>
                          <b>Email:</b> {group.email}
                        </p>
                        <p>
                          <b>Phone:</b> {group.phone}
                        </p>
                        <p>
                          <b>Date:</b> {formatDate(group.bookingDate)}
                        </p>
                        <p>
                          <b>Time:</b> {group.bookingTime}
                        </p>
                        <p>
                          <b>Type:</b> {group.bookingType}
                        </p>
                        <p className="md:col-span-2">
                          <b>Address:</b> {group.address}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f8fbff] p-5">
                      <h3 className="mb-4 text-xl font-extrabold">
                        Admin Controls
                      </h3>

                      <div className="grid gap-4 md:grid-cols-3">
                        <AdminSelect
                          label="Booking Status"
                          value={group.bookingStatus}
                          options={bookingStatuses}
                          onChange={(value) =>
                            updateBookingGroupField(
                              group,
                              "booking_status",
                              value
                            )
                          }
                        />

                        <AdminSelect
                          label="Payment Status"
                          value={group.paymentStatus}
                          options={paymentStatuses}
                          onChange={(value) =>
                            updateBookingGroupField(
                              group,
                              "payment_status",
                              value
                            )
                          }
                        />

                        <AdminSelect
                          label="Report Status"
                          value={group.reportStatus}
                          options={reportStatuses}
                          onChange={(value) =>
                            updateBookingGroupField(
                              group,
                              "report_status",
                              value
                            )
                          }
                        />
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-500">
                            Amount Received From Patient
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={getEditingPaidAmount(group)}
                            onChange={(e) =>
                              setEditingGroupPaid((prev) => ({
                                ...prev,
                                [group.groupId]: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 font-bold outline-none focus:border-[#0754dc]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => saveBookingGroupPayment(group)}
                          disabled={savingGroupId === group.groupId}
                          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white disabled:bg-slate-300"
                        >
                          <FaSave />
                          {savingGroupId === group.groupId
                            ? "Saving..."
                            : "Save Amount"}
                        </button>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-bold text-slate-500">
                          Admin Notes For This Checkout
                        </label>

                        <textarea
                          value={group.adminNotes}
                          onChange={(e) =>
                            updateBookingGroupField(
                              group,
                              "admin_notes",
                              e.target.value
                            )
                          }
                          placeholder="Write internal notes..."
                          className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-[#0754dc]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenBookingGroupId(isOpen ? null : group.groupId)
                      }
                      className="flex items-center gap-2 rounded-xl bg-[#07142f] px-5 py-3 font-extrabold text-white"
                    >
                      {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                      {isOpen ? "Hide Tests & Reports" : "View Tests & Reports"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-6 rounded-3xl border border-slate-100 bg-[#f8fbff] p-6">
                      <h3 className="mb-5 text-2xl font-extrabold">
                        Tests & Report PDFs
                      </h3>

                      <div className="space-y-4">
                        {group.bookings.map((booking) => {
                          const payable = getBookingPayable(booking);
                          const paid = getBookingPaid(booking);
                          const pending = Math.max(payable - paid, 0);

                          return (
                            <div
                              key={booking.id}
                              className="rounded-2xl bg-white p-5 shadow-sm"
                            >
                              <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr_1.2fr]">
                                <div>
                                  <p className="text-xs font-extrabold text-[#0754dc]">
                                    Booking #{booking.id}
                                  </p>

                                  <h4 className="mt-2 text-xl font-extrabold text-[#07142f]">
                                    {booking.test_name}
                                  </h4>

                                  <p className="mt-3 rounded-xl bg-[#f8fbff] px-4 py-3 text-sm font-extrabold text-[#07142f]">
                                    For: {booking.test_for_name || group.patientName}
                                    {booking.test_for_type
                                      ? ` • ${booking.test_for_type}`
                                      : ""}
                                  </p>
                                </div>

                                <div>
                                  <AmountMini label="Payable" value={rupees(payable)} />
                                  <AmountMini
                                    label="Paid"
                                    value={rupees(paid)}
                                    tone={pending <= 0 ? "green" : "red"}
                                  />
                                  <AmountMini
                                    label="Pending"
                                    value={rupees(pending)}
                                    tone={pending > 0 ? "red" : "green"}
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-bold text-slate-500">
                                    Report PDF URL / Link
                                  </label>

                                  <input
                                    value={booking.report_url ?? ""}
                                    onChange={(e) =>
                                      updateBookingField(
                                        booking.id,
                                        "report_url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Paste report PDF link for this test"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-[#0754dc]"
                                  />

                                  {booking.report_url ? (
                                    <a
                                      href={booking.report_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex rounded-xl bg-[#05a832] px-4 py-3 text-sm font-extrabold text-white"
                                    >
                                      Open PDF
                                    </a>
                                  ) : (
                                    <p className="mt-3 rounded-xl bg-[#fff8df] p-3 text-xs font-bold text-[#7a4f00]">
                                      No PDF added yet for this test.
                                    </p>
                                  )}
                                </div>
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

            {filteredBookingGroups.length === 0 && (
              <EmptyState title="No bookings found" />
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-3xl bg-white p-7 shadow-md"
              >
                <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="font-bold text-[#0754dc]">
                      Appointment #{appointment.id}
                    </p>

                    <h2 className="mt-2 text-3xl font-extrabold">
                      {appointment.doctor_name}
                    </h2>

                    <p className="mt-2 text-slate-500">
                      {appointment.specialty} • {appointment.doctor_qualification}
                    </p>
                  </div>

                  <StatusBadge
                    status={appointment.consultation_status ?? "Pending"}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-2xl bg-[#f8fbff] p-5">
                    <h3 className="mb-4 text-xl font-extrabold">
                      Patient Details
                    </h3>

                    <div className="space-y-2 text-slate-700">
                      <p>
                        <b>Name:</b> {appointment.patient_name}
                      </p>
                      <p>
                        <b>Email:</b> {appointment.patient_email}
                      </p>
                      <p>
                        <b>Phone:</b> {appointment.phone}
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
                      <p>
                        <b>Date:</b> {formatDate(appointment.preferred_date)}
                      </p>
                      <p>
                        <b>Time:</b> {appointment.preferred_time}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f8fbff] p-5">
                    <h3 className="mb-4 text-xl font-extrabold">
                      Admin Controls
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminSelect
                        label="Appointment Status"
                        value={appointment.consultation_status ?? "Pending"}
                        options={consultationStatuses}
                        onChange={(value) =>
                          updateConsultationField(
                            appointment.id,
                            "consultation_status",
                            value
                          )
                        }
                      />

                      <AdminSelect
                        label="Payment Status"
                        value={appointment.payment_status ?? "Pending"}
                        options={paymentStatuses}
                        onChange={(value) =>
                          updateConsultationField(
                            appointment.id,
                            "payment_status",
                            value
                          )
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-bold text-slate-500">
                        Admin Notes
                      </label>
                      <textarea
                        value={appointment.admin_notes ?? ""}
                        onChange={(e) =>
                          updateConsultationField(
                            appointment.id,
                            "admin_notes",
                            e.target.value
                          )
                        }
                        placeholder="Write internal notes..."
                        className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-[#0754dc]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <EmptyState title="No appointments found" />
            )}
          </div>
        )}

        {activeTab === "patients" && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-3xl bg-white p-7 shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold">
                      {patient.full_name || "Unnamed Patient"}
                    </h2>

                    <p className="mt-1 text-slate-500">{patient.email}</p>
                  </div>

                  {isActiveMember(patient) ? (
                    <span className="rounded-full bg-[#07142f] px-4 py-2 text-xs font-bold text-[#f7d774]">
                      Exclusive
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                      Normal
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-slate-700">
                  <p>
                    <b>Phone:</b> {patient.phone || "Not saved"}
                  </p>

                  <p>
                    <b>Last Address:</b> {patient.last_address || "No address saved"}
                  </p>

                  <p>
                    <b>Membership:</b> {patient.membership_plan || "No membership"}
                  </p>

                  <p>
                    <b>Status:</b> {isActiveMember(patient) ? "Active" : "Normal / Expired"}
                  </p>

                  <p>
                    <b>Expires:</b>{" "}
                    {patient.membership_expires_at
                      ? formatDate(patient.membership_expires_at)
                      : "Not applicable"}
                  </p>

                  {patient.membership_status === "active" && (
                    <EliteFamilyMembersBox
                      members={getEliteMembersForPatient(patient.id)}
                    />
                  )}

                  <p>
                    <b>Joined:</b> {formatDate(patient.created_at)}
                  </p>
                </div>
              </div>
            ))}

            {filteredPatients.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyState title="No patients found" />
              </div>
            )}
          </div>
        )}

        {activeTab === "clientBookings" && <ClientBookingsSection />}
      </section>
    </main>
  );
}

function AdminStatCard({
  title,
  value,
  icon,
  color,
  premium = false,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  premium?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl bg-white p-7 shadow-md ${
        premium
          ? "border border-[#d4af37]/30 shadow-[0_0_25px_rgba(212,175,55,0.12)]"
          : ""
      }`}
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
          premium
            ? "border border-[#d4af37]/70 bg-gradient-to-br from-[#050505] via-[#111111] to-[#1b1405] text-[#f7d774] shadow-[0_0_22px_rgba(212,175,55,0.35)]"
            : `${color} text-white`
        }`}
      >
        {icon}
      </div>

      <p className="text-slate-500">{title}</p>

      <h2
        className={`mt-2 text-4xl font-extrabold ${
          premium ? "text-[#07142f]" : ""
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-[#0754dc]">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isGood =
    status === "Confirmed" ||
    status === "Report Delivered" ||
    status === "Report Ready" ||
    status === "Completed" ||
    status === "Paid";

  const isWarning =
    status === "Pending" ||
    status === "Sample Collected" ||
    status === "Report Processing";

  const className = isGood
    ? "bg-[#e8fff0] text-[#05a832]"
    : isWarning
      ? "bg-[#fff7df] text-[#b77900]"
      : "bg-[#fff0f3] text-[#e71935]";

  return (
    <span className={`rounded-full px-4 py-2 text-sm font-bold ${className}`}>
      {status}
    </span>
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
    <div className="rounded-2xl bg-[#f8fbff] p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-extrabold text-slate-500">
        <FaRupeeSign className="text-[#0754dc]" />
        {label}
      </p>
      <p className={`mt-2 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function AmountMini({
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
    <div className="mb-3 rounded-xl bg-[#f8fbff] p-3">
      <p className="text-xs font-extrabold uppercase text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-base font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function AdminSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 font-bold outline-none focus:border-[#0754dc]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-md">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-3 text-slate-500">
        Data will appear here after customers start using the website.
      </p>
    </div>
  );
}

function EliteFamilyMembersBox({
  members,
}: {
  members: EliteFamilyMember[];
}) {
  return (
    <div className="mt-6 rounded-3xl border border-[#d4af37]/30 bg-[#fff8df] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h4 className="text-lg font-extrabold text-[#07142f]">
          Elite Family Members
        </h4>

        <span className="rounded-full bg-[#07142f] px-4 py-2 text-xs font-extrabold text-[#f7d774]">
          {members.length}/4
        </span>
      </div>

      {members.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm font-bold text-[#7a4f00]">
          No family members added yet.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={member.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold text-[#07142f]">
                    {index + 1}. {member.full_name}
                  </p>

                  <div className="mt-2 space-y-1 text-sm font-semibold text-slate-600">
                    <p>Relation: {member.relation || "Not added"}</p>
                    <p>Phone: {member.phone || "Not added"}</p>
                    <p>Age: {member.age || "Not added"}</p>
                    <p>Gender: {member.gender || "Not added"}</p>
                  </div>
                </div>

                <span className="rounded-full bg-[#eafff0] px-3 py-1 text-xs font-bold text-[#05a832]">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}