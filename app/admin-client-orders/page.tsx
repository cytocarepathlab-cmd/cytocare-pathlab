"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBan,
  FaCheckCircle,
  FaClipboardList,
  FaCrown,
  FaFileInvoiceDollar,
  FaHospital,
  FaMoneyBillWave,
  FaSearch,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ClientMini = {
  client_code: string;
  client_name: string;
  status: "active" | "blocked";
};

type ClientOrderItem = {
  id: string;
  order_id: string;
  product: string;
  vial: string | null;
  mrp: number;
  client_rate: number;
  elite_discount: number;
  patient_payable: number;
  client_due_amount: number;
  elite_benefit_applied: boolean;
  created_at: string;
};

type ClientOrder = {
  id: string;
  client_id: string;
  patient_name: string;
  patient_mobile: string;
  elite_family_member_id: string | null;
  elite_member_name: string | null;
  elite_benefit_applied: boolean;
  total_mrp: number;
  total_client_rate: number;
  elite_discount: number;
  patient_payable: number;
  client_due_amount: number;
  order_status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client: ClientMini | null;
  items: ClientOrderItem[];
};

type ClientBillItem = {
  id: string;
  price_id: string | null;
  test_name: string;
  category: string | null;
  rate: number;
  created_at: string;
};

type ClientBillPatient = {
  id: string;
  bill_id: string;
  patient_order: number;
  patient_name: string;
  sex: string | null;
  mobile: string | null;
  gross_amount: number;
  discount_amount: number;
  final_amount: number;
  created_at: string;
  items: ClientBillItem[];
};

type ClientBill = {
  id: string;
  serial_no: number;
  client_id: string;
  client_name: string | null;
  client_code: string | null;
  total_patients: number;
  gross_amount: number;
  discount_amount: number;
  final_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  patients: ClientBillPatient[];
};

const orderStatuses = [
  "Pending",
  "Sample Received",
  "Report Processing",
  "Report Ready",
  "Report Delivered",
  "Cancelled",
];

const paymentStatuses = ["Unpaid", "Partially Paid", "Paid"];

export default function AdminClientOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [bills, setBills] = useState<ClientBill[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "billing">("orders");
  const [selectedBillingDates, setSelectedBillingDates] = useState<
    Record<string, string>
  >({});
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingOrderId, setSavingOrderId] = useState("");
  const [deletingBillItemId, setDeletingBillItemId] = useState("");
  const [deletingBillPatientId, setDeletingBillPatientId] = useState("");

  useEffect(() => {
    loadClientOrders();
  }, []);

  async function loadClientOrders() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setUser(userData.user);

    const { data: adminData } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!adminData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    const { data, error } = await supabase
      .from("cytocare_client_orders")
      .select(
        `
        *,
        client:cytocare_clients (
          client_code,
          client_name,
          status
        ),
        items:cytocare_client_order_items (
          *
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setOrders((data ?? []) as ClientOrder[]);

    const { data: billsData, error: billsError } = await supabase
      .from("cytocare_client_bills")
      .select(
        `
        *,
        patients:cytocare_client_bill_patients (
          *,
          items:cytocare_client_bill_items (
            *
          )
        )
        `
      )
      .order("created_at", { ascending: false });

    if (billsError) {
      alert(billsError.message);
      setBills([]);
      setLoading(false);
      return;
    }

    setBills((billsData ?? []) as ClientBill[]);
    setLoading(false);
  }

  const filteredOrders = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;

      const matchesSearch =
        !text ||
        order.patient_name.toLowerCase().includes(text) ||
        order.patient_mobile.toLowerCase().includes(text) ||
        order.client?.client_name.toLowerCase().includes(text) ||
        order.client?.client_code.toLowerCase().includes(text) ||
        order.items?.some((item) =>
          item.product.toLowerCase().includes(text)
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchText, statusFilter]);

  const filteredBills = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    return bills.filter((bill) => {
      if (!text) return true;

      const serial = String(bill.serial_no ?? "");
      const clientName = (bill.client_name ?? "").toLowerCase();
      const clientCode = (bill.client_code ?? "").toLowerCase();

      return (
        serial.includes(text) ||
        clientName.includes(text) ||
        clientCode.includes(text) ||
        (bill.patients ?? []).some(
          (patient) =>
            patient.patient_name.toLowerCase().includes(text) ||
            (patient.mobile ?? "").toLowerCase().includes(text) ||
            (patient.items ?? []).some((item) =>
              item.test_name.toLowerCase().includes(text)
            )
        )
      );
    });
  }, [bills, searchText]);

  function getBillingDateKey(value: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(value));

    const year = parts.find((part) => part.type === "year")?.value || "";
    const month = parts.find((part) => part.type === "month")?.value || "";
    const day = parts.find((part) => part.type === "day")?.value || "";

    return `${year}-${month}-${day}`;
  }

  function formatBillingDate(dateKey: string) {
    if (!dateKey) return "Select date";

    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const billingClientGroups = useMemo(() => {
    const groupMap = new Map<
      string,
      {
        clientId: string;
        clientName: string;
        clientCode: string;
        bills: ClientBill[];
      }
    >();

    for (const bill of filteredBills) {
      const key =
        bill.client_id ||
        `${bill.client_code || ""}-${bill.client_name || ""}`;

      const existing = groupMap.get(key);

      if (existing) {
        existing.bills.push(bill);
      } else {
        groupMap.set(key, {
          clientId: key,
          clientName: bill.client_name || "Unknown Client",
          clientCode: bill.client_code || "No client code",
          bills: [bill],
        });
      }
    }

    return Array.from(groupMap.values()).map((group) => {
      const availableDates = Array.from(
        new Set(group.bills.map((bill) => getBillingDateKey(bill.created_at)))
      ).sort((a, b) => b.localeCompare(a));

      const selectedDate =
        selectedBillingDates[group.clientId] || availableDates[0] || "";

      const billsForDate = group.bills.filter(
        (bill) => getBillingDateKey(bill.created_at) === selectedDate
      );

      const totalPatients = billsForDate.reduce(
        (sum, bill) => sum + Number(bill.total_patients || 0),
        0
      );

      const totalGross = billsForDate.reduce(
        (sum, bill) => sum + Number(bill.gross_amount || 0),
        0
      );

      const totalDiscount = billsForDate.reduce(
        (sum, bill) => sum + Number(bill.discount_amount || 0),
        0
      );

      const totalFinalBilled = billsForDate.reduce(
        (sum, bill) => sum + Number(bill.final_amount || 0),
        0
      );

      return {
        ...group,
        availableDates,
        selectedDate,
        billsForDate,
        totalPatients,
        totalGross,
        totalDiscount,
        totalFinalBilled,
      };
    });
  }, [filteredBills, selectedBillingDates]);

  const totalOrders = orders.length;

  const totalPatientPayable = orders.reduce(
    (sum, order) => sum + Number(order.patient_payable || 0),
    0
  );

  const totalClientDue = orders.reduce(
    (sum, order) => sum + Number(order.client_due_amount || 0),
    0
  );

  const eliteOrders = orders.filter((order) => order.elite_benefit_applied);

  const totalBillingCycles = bills.length;

  const totalBillingPatients = bills.reduce(
    (sum, bill) => sum + Number(bill.total_patients || 0),
    0
  );

  const totalBillingDiscount = bills.reduce(
    (sum, bill) => sum + Number(bill.discount_amount || 0),
    0
  );

  const totalBilledAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.final_amount || 0),
    0
  );

  function rupees(value: number | string | null | undefined) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function updateClientOrderStatus(
    orderId: string,
    field: "order_status" | "payment_status",
    value: string
  ) {
    setSavingOrderId(orderId);

    const { error } = await supabase
      .from("cytocare_client_orders")
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      setSavingOrderId("");
      alert(error.message);
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              [field]: value,
              updated_at: new Date().toISOString(),
            }
          : order
      )
    );

    setSavingOrderId("");
  }

  async function deleteBillingItem(
    item: ClientBillItem,
    patientName: string
  ) {
    const confirmed = window.confirm(
      `Delete "${item.test_name}" from ${patientName}'s bill? The patient and billing totals will be recalculated automatically.`
    );

    if (!confirmed) return;

    setDeletingBillItemId(item.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Admin session expired. Please login again.");
      }

      const response = await fetch(
        "/api/admin/client-billing/delete-item",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            itemId: item.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete billed test."
        );
      }

      await loadClientOrders();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete billed test."
      );
    } finally {
      setDeletingBillItemId("");
    }
  }

  async function deleteBillingPatient(
    patient: ClientBillPatient
  ) {
    const confirmed = window.confirm(
      `Delete patient "${patient.patient_name}" and all booked tests from this bill?`
    );

    if (!confirmed) return;

    setDeletingBillPatientId(patient.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      const response = await fetch(
        "/api/admin/client-billing/delete-patient",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            patientId: patient.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to delete billed patient."
        );
      }

      await loadClientOrders();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete billed patient."
      );
    } finally {
      setDeletingBillPatientId("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-md">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading Client Orders...
          </h1>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-md">
          <FaUserShield className="mx-auto text-5xl text-[#0754dc]" />

          <h1 className="mt-5 text-4xl font-extrabold text-[#07142f]">
            Admin Login Required
          </h1>

          <p className="mt-4 text-slate-600">
            Please login with your admin account first.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-[#0754dc] px-6 py-3 font-bold text-white"
          >
            Back to Website
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-5">
        <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-md">
          <FaBan className="mx-auto text-5xl text-[#e71935]" />

          <h1 className="mt-5 text-4xl font-extrabold text-[#07142f]">
            Access Denied
          </h1>

          <p className="mt-4 text-slate-600">
            This page is only for Cytocare admins.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-[#0754dc] px-6 py-3 font-bold text-white"
          >
            Back to Website
          </Link>
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
            <h1 className="text-3xl font-extrabold">Client Orders & Billing</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin-clients"
              className="flex items-center gap-3 rounded-xl bg-[#eef5ff] px-5 py-3 font-bold text-[#0754dc]"
            >
              <FaArrowLeft />
              Client Management
            </Link>

            <Link
              href="/admin"
              className="rounded-xl bg-[#07142f] px-5 py-3 font-bold text-white"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              setSearchText("");
              setStatusFilter("all");
            }}
            className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
              activeTab === "orders"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#0754dc] shadow-sm"
            }`}
          >
            <FaClipboardList className="mr-2 inline" />
            Client Orders
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("billing");
              setSearchText("");
            }}
            className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
              activeTab === "billing"
                ? "bg-[#0754dc] text-white"
                : "bg-white text-[#0754dc] shadow-sm"
            }`}
          >
            <FaFileInvoiceDollar className="mr-2 inline" />
            Client Billing
          </button>
        </div>

        {activeTab === "orders" ? (
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={<FaClipboardList />}
              color="bg-[#0754dc]"
            />

            <StatCard
              title="Elite Orders"
              value={eliteOrders.length}
              icon={<FaCrown />}
              color="bg-[#07142f]"
              premium
            />

            <StatCard
              title="Patient Payable"
              value={rupees(totalPatientPayable)}
              icon={<FaMoneyBillWave />}
              color="bg-[#05a832]"
            />

            <StatCard
              title="Client Due"
              value={rupees(totalClientDue)}
              icon={<FaHospital />}
              color="bg-[#f59e0b]"
            />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard
              title="Billing Cycles"
              value={totalBillingCycles}
              icon={<FaFileInvoiceDollar />}
              color="bg-[#0754dc]"
            />

            <StatCard
              title="Patients Billed"
              value={totalBillingPatients}
              icon={<FaHospital />}
              color="bg-[#07142f]"
            />

            <StatCard
              title="Discount Given"
              value={rupees(totalBillingDiscount)}
              icon={<FaMoneyBillWave />}
              color="bg-[#f59e0b]"
            />

            <StatCard
              title="Final Billed"
              value={rupees(totalBilledAmount)}
              icon={<FaCheckCircle />}
              color="bg-[#05a832]"
            />
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="relative w-full max-w-xl">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={
                  activeTab === "orders"
                    ? "Search client, patient mobile, test name..."
                    : "Search bill no., client, patient, mobile or test..."
                }
                className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-4 font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

            {activeTab === "orders" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-[#0754dc]"
              >
                <option value="all">All Orders</option>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {activeTab === "orders" && (
          <div className="mt-8 grid gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-md"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                          {order.client?.client_code || "Client"}
                        </span>

                        {order.elite_benefit_applied ? (
                          <span className="rounded-full bg-[#fff8df] px-4 py-2 text-sm font-extrabold text-[#7a4f00]">
                            Elite Benefit Applied
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-600">
                            Normal Patient
                          </span>
                        )}

                        <span className="rounded-full bg-[#f8fbff] px-4 py-2 text-sm font-extrabold text-slate-600">
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <h2 className="text-3xl font-extrabold">
                        {order.client?.client_name || "Unknown Client"}
                      </h2>

                      <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-2">
                        <p>
                          <b>Patient:</b> {order.patient_name}
                        </p>

                        <p>
                          <b>Mobile:</b> {order.patient_mobile}
                        </p>

                        <p>
                          <b>Order Status:</b> {order.order_status}
                        </p>

                        <p>
                          <b>Payment Status:</b> {order.payment_status}
                        </p>

                        {order.notes && (
                          <p className="md:col-span-2">
                            <b>Notes:</b> {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#f8fbff] p-5 text-center">
                      <p className="text-sm font-bold text-slate-500">
                        Patient Payable
                      </p>

                      <h3 className="mt-2 text-4xl font-extrabold text-[#0754dc]">
                        {rupees(order.patient_payable)}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-[#f8fbff] p-5">
                    <h3 className="mb-4 text-xl font-extrabold">
                      Selected Tests
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      {(order.items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white p-4 shadow-sm"
                        >
                          <p className="font-extrabold">{item.product}</p>

                          <div className="mt-2 space-y-1 text-sm font-semibold text-slate-600">
                            <p>Vial: {item.vial || "Not added"}</p>
                            <p>MRP: {rupees(item.mrp)}</p>
                            <p>Client Rate: {rupees(item.client_rate)}</p>
                            <p>Elite Discount: -{rupees(item.elite_discount)}</p>
                            <p>
                              Patient Payable: {rupees(item.patient_payable)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-5">
                  <h3 className="mb-5 text-2xl font-extrabold">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    <SummaryRow label="Total MRP" value={rupees(order.total_mrp)} />

                    <SummaryRow
                      label="Client/Lab Rate"
                      value={rupees(order.total_client_rate)}
                    />

                    <SummaryRow
                      label="Elite Discount"
                      value={`-${rupees(order.elite_discount)}`}
                      green
                    />

                    <SummaryRow
                      label="Patient Payable"
                      value={rupees(order.patient_payable)}
                    />

                    <SummaryRow
                      label="Client Due"
                      value={rupees(order.client_due_amount)}
                    />

                    <div className="my-4 border-t border-dashed border-slate-200" />

                    <label className="block">
                      <p className="mb-2 text-sm font-bold text-slate-500">
                        Order Status
                      </p>

                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateClientOrderStatus(
                            order.id,
                            "order_status",
                            e.target.value
                          )
                        }
                        disabled={savingOrderId === order.id}
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 font-bold outline-none focus:border-[#0754dc]"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <p className="mb-2 text-sm font-bold text-slate-500">
                        Payment Status
                      </p>

                      <select
                        value={order.payment_status}
                        onChange={(e) =>
                          updateClientOrderStatus(
                            order.id,
                            "payment_status",
                            e.target.value
                          )
                        }
                        disabled={savingOrderId === order.id}
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 font-bold outline-none focus:border-[#0754dc]"
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    {savingOrderId === order.id && (
                      <p className="rounded-2xl bg-[#fff8df] p-4 text-sm font-bold text-[#7a4f00]">
                        Saving changes...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="text-3xl font-extrabold">No client orders found</h2>
              <p className="mt-3 text-slate-500">
                Client portal orders will appear here.
              </p>
            </div>
          )}
          </div>
        )}

        {activeTab === "billing" && (
          <div className="mt-8 grid gap-7">
            {billingClientGroups.map((group) => (
              <div
                key={group.clientId}
                className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-md"
              >
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <p className="text-sm font-extrabold uppercase text-[#0754dc]">
                      Client Billing
                    </p>

                    <h2 className="mt-1 text-3xl font-extrabold">
                      {group.clientName}
                    </h2>

                    <p className="mt-2 font-bold text-[#0754dc]">
                      {group.clientCode}
                    </p>
                  </div>

                  <div className="w-full max-w-sm">
                    <label className="mb-2 block text-sm font-extrabold text-slate-600">
                      Select Billing Date
                    </label>

                    <select
                      value={group.selectedDate}
                      onChange={(event) =>
                        setSelectedBillingDates((prev) => ({
                          ...prev,
                          [group.clientId]: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-extrabold outline-none focus:border-[#0754dc]"
                    >
                      {group.availableDates.map((dateKey) => (
                        <option key={dateKey} value={dateKey}>
                          {formatBillingDate(dateKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-[#07142f] p-6 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-300">
                        Selected Date
                      </p>

                      <h3 className="mt-1 text-2xl font-extrabold">
                        {formatBillingDate(group.selectedDate)}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-300">
                        Total Billed That Day
                      </p>

                      <p className="mt-1 text-4xl font-extrabold">
                        {rupees(group.totalFinalBilled)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <SummaryBox
                    label="Billing Cycles"
                    value={String(group.billsForDate.length)}
                  />

                  <SummaryBox
                    label="Patients"
                    value={String(group.totalPatients)}
                  />

                  <SummaryBox
                    label="Gross / Client MRP"
                    value={rupees(group.totalGross)}
                  />

                  <SummaryBox
                    label="Final Billed"
                    value={rupees(group.totalFinalBilled)}
                    green
                  />
                </div>

                {group.totalDiscount > 0 && (
                  <div className="mt-4 rounded-2xl bg-[#fff8df] p-4 font-extrabold text-[#7a4f00]">
                    Total Discount Given on {formatBillingDate(group.selectedDate)}:
                    {" "}
                    -{rupees(group.totalDiscount)}
                  </div>
                )}

                <div className="mt-7 space-y-6">
                  {group.billsForDate.map((bill) => (
                    <div
                      key={bill.id}
                      className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                              Bill #{String(bill.serial_no).padStart(6, "0")}
                            </span>

                            <span className="rounded-full bg-[#eafff0] px-4 py-2 text-sm font-extrabold text-[#057a28]">
                              {bill.status || "Confirmed"}
                            </span>

                            <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-600">
                              {formatDate(bill.created_at)}
                            </span>
                          </div>

                          <p className="font-bold text-slate-500">
                            {bill.total_patients} patient
                            {Number(bill.total_patients) !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="min-w-[230px] rounded-2xl bg-white p-4 text-right shadow-sm">
                          <p className="text-xs font-bold text-slate-500">
                            Bill Amount
                          </p>

                          <p className="mt-1 text-3xl font-extrabold text-[#05a832]">
                            {rupees(bill.final_amount)}
                          </p>

                          {Number(bill.discount_amount || 0) > 0 && (
                            <p className="mt-2 text-sm font-bold text-[#7a4f00]">
                              Discount: -{rupees(bill.discount_amount)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 space-y-5">
                        {(bill.patients ?? []).map((patient) => (
                          <div
                            key={patient.id}
                            className="rounded-3xl bg-white p-5 shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-extrabold uppercase text-[#0754dc]">
                                  Patient {patient.patient_order}
                                </p>

                                <h3 className="mt-1 text-2xl font-extrabold">
                                  {patient.patient_name}
                                </h3>

                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-500">
                                  <span>
                                    Sex: {patient.sex || "Not added"}
                                  </span>

                                  <span>
                                    Mobile: {patient.mobile || "Not added"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteBillingPatient(patient)
                                  }
                                  disabled={
                                    deletingBillPatientId === patient.id
                                  }
                                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-2 text-sm font-extrabold text-[#e71935] transition hover:bg-[#e71935] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <FaTrash />
                                  {deletingBillPatientId === patient.id
                                    ? "Deleting..."
                                    : "Delete Patient"}
                                </button>
                              </div>

                              <div className="rounded-2xl bg-[#eafff0] px-5 py-4 text-right">
                                <p className="text-xs font-bold text-[#057a28]">
                                  Patient Billed
                                </p>

                                <p className="mt-1 text-2xl font-extrabold text-[#05a832]">
                                  {rupees(patient.final_amount)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5">
                              <h4 className="text-lg font-extrabold">
                                Booked Tests
                              </h4>

                              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {(patient.items ?? []).map((item) => (
                                  <div
                                    key={item.id}
                                    className="relative rounded-2xl bg-[#f8fbff] p-4 pr-12"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteBillingItem(
                                          item,
                                          patient.patient_name
                                        )
                                      }
                                      disabled={
                                        deletingBillItemId === item.id
                                      }
                                      title="Delete this billed test"
                                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0f3] text-sm text-[#e71935] transition hover:bg-[#e71935] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <FaTrash />
                                    </button>

                                    <p className="font-extrabold">
                                      {item.test_name}
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-slate-400">
                                      {item.category || "Test"}
                                    </p>

                                    <p className="mt-3 text-lg font-extrabold text-[#0754dc]">
                                      {rupees(item.rate)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                              <SummaryBox
                                label="Gross MRP"
                                value={rupees(patient.gross_amount)}
                              />

                              <SummaryBox
                                label="Discount"
                                value={
                                  Number(patient.discount_amount || 0) > 0
                                    ? `-${rupees(patient.discount_amount)}`
                                    : rupees(0)
                                }
                              />

                              <SummaryBox
                                label="Billed Price"
                                value={rupees(patient.final_amount)}
                                green
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {group.billsForDate.length === 0 && (
                    <div className="rounded-3xl bg-[#f8fbff] p-8 text-center">
                      <h3 className="text-2xl font-extrabold">
                        No billing found for this date
                      </h3>

                      <p className="mt-2 text-slate-500">
                        Select another date to view this client's billing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {billingClientGroups.length === 0 && (
              <div className="rounded-3xl bg-white p-10 text-center shadow-md">
                <FaFileInvoiceDollar className="mx-auto text-6xl text-[#0754dc]" />

                <h2 className="mt-5 text-3xl font-extrabold">
                  No client bills found
                </h2>

                <p className="mt-3 text-slate-500">
                  Bills generated from the Client Portal will appear here.
                </p>
              </div>
            )}
          </div>
        )}

      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  premium = false,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  premium?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl bg-white p-6 shadow-md ${
        premium ? "border border-[#d4af37]/40" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-500">{title}</p>
          <h2 className="mt-2 text-4xl font-extrabold text-[#07142f]">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-extrabold ${
          green ? "text-[#05a832]" : "text-[#07142f]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
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
