"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBan,
  FaCheckCircle,
  FaClipboardList,
  FaCrown,
  FaHospital,
  FaMoneyBillWave,
  FaSearch,
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
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingOrderId, setSavingOrderId] = useState("");

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
            <h1 className="text-3xl font-extrabold">Client Orders</h1>
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

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="relative w-full max-w-xl">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search client, patient mobile, test name..."
                className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-4 font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

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
          </div>
        </div>

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