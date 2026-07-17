"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBan,
  FaCheckCircle,
  FaCreditCard,
  FaExclamationTriangle,
  FaHospital,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaSearch,
  FaUserShield,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type CytocareClient = {
  id: string;
  client_code: string;
  client_name: string;
  reporting_type: string | null;
  report_method: string | null;
  whatsapp: string | null;
  email: string | null;
  login_pin: string;
  status: "active" | "blocked";
  credit_limit: number;
  unpaid_due: number;
  blocked_due_amount: number;
  paid_after_block: number;
  minimum_reopen_payment: number;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminClientsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<CytocareClient[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">(
    "all"
  );

  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>(
    {}
  );
  const [paymentModes, setPaymentModes] = useState<Record<string, string>>({});
  const [paymentNotes, setPaymentNotes] = useState<Record<string, string>>({});
  const [savingClientId, setSavingClientId] = useState("");

  useEffect(() => {
    loadAdminClients();
  }, []);

  async function loadAdminClients() {
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

    const { data: clientsData, error } = await supabase
      .from("cytocare_clients")
      .select("*")
      .order("client_code", { ascending: true });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setClients((clientsData ?? []) as CytocareClient[]);
    setLoading(false);
  }

  const filteredClients = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;

      const matchesSearch =
        !text ||
        client.client_code.toLowerCase().includes(text) ||
        client.client_name.toLowerCase().includes(text) ||
        (client.whatsapp ?? "").toLowerCase().includes(text) ||
        (client.email ?? "").toLowerCase().includes(text);

      return matchesStatus && matchesSearch;
    });
  }, [clients, searchText, statusFilter]);

  const totalDue = clients.reduce(
    (sum, client) => sum + Number(client.unpaid_due || 0),
    0
  );

  const blockedClients = clients.filter((client) => client.status === "blocked");
  const activeClients = clients.filter((client) => client.status === "active");

  function rupees(value: number | string | null | undefined) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  async function recordPayment(client: CytocareClient) {
    const amount = Number(paymentAmounts[client.id] || 0);

    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setSavingClientId(client.id);

    const { error } = await supabase.from("cytocare_client_payments").insert({
      client_id: client.id,
      amount,
      payment_mode: paymentModes[client.id] || "Cash",
      notes: paymentNotes[client.id] || null,
    });

    if (error) {
      setSavingClientId("");
      alert(error.message);
      return;
    }

    setPaymentAmounts((prev) => ({ ...prev, [client.id]: "" }));
    setPaymentModes((prev) => ({ ...prev, [client.id]: "Cash" }));
    setPaymentNotes((prev) => ({ ...prev, [client.id]: "" }));

    await loadAdminClients();

    setSavingClientId("");
    alert("Payment recorded successfully.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-md">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading Clients...
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
            <h1 className="text-3xl font-extrabold">Client Code Management</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            
            <Link
  href="/admin-client-orders"
  className="rounded-xl bg-[#0754dc] px-5 py-3 font-bold text-white"
>
  Client Orders
</Link>

<Link
  href="/admin-client-prices"
  className="rounded-xl bg-[#f59e0b] px-5 py-3 font-bold text-white"
>
  Client Price List
</Link>
            
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl bg-[#eef5ff] px-5 py-3 font-bold text-[#0754dc]"
            >
              <FaArrowLeft />
              Admin Dashboard
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-[#07142f] px-5 py-3 font-bold text-white"
            >
              Website
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid gap-5 md:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={clients.length}
            icon={<FaHospital />}
            color="bg-[#0754dc]"
          />

          <StatCard
            title="Active Clients"
            value={activeClients.length}
            icon={<FaCheckCircle />}
            color="bg-[#05a832]"
          />

          <StatCard
            title="Blocked Clients"
            value={blockedClients.length}
            icon={<FaExclamationTriangle />}
            color="bg-[#e71935]"
          />

          <StatCard
            title="Total Unpaid Due"
            value={rupees(totalDue)}
            icon={<FaMoneyBillWave />}
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
                placeholder="Search client code, name, phone, email..."
                className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-4 font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "blocked")
              }
              className="rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-[#0754dc]"
            >
              <option value="all">All Clients</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {filteredClients.map((client) => {
            const isBlocked = client.status === "blocked";

            return (
              <div
                key={client.id}
                className={`rounded-[30px] border bg-white p-6 shadow-md ${
                  isBlocked
                    ? "border-[#e71935]/30"
                    : "border-slate-100"
                }`}
              >
                <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                            {client.client_code}
                          </span>

                          {isBlocked ? (
                            <span className="rounded-full bg-[#fff0f3] px-4 py-2 text-sm font-extrabold text-[#e71935]">
                              Blocked
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#eafff0] px-4 py-2 text-sm font-extrabold text-[#05a832]">
                              Active
                            </span>
                          )}
                        </div>

                        <h2 className="text-3xl font-extrabold">
                          {client.client_name}
                        </h2>

                        <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-2">
                          <p>
                            <b>Reporting Type:</b>{" "}
                            {client.reporting_type || "Not added"}
                          </p>

                          <p>
                            <b>Report Method:</b>{" "}
                            {client.report_method || "Not added"}
                          </p>

                          <p>
                            <b>WhatsApp:</b>{" "}
                            {client.whatsapp || "Not added"}
                          </p>

                          <p>
                            <b>Email:</b> {client.email || "Not added"}
                          </p>

                          <p>
                            <b>Login PIN:</b> {client.login_pin}
                          </p>

                          <p>
                            <b>Credit Limit:</b> {rupees(client.credit_limit)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-[#f8fbff] p-5 text-center">
                        <p className="text-sm font-bold text-slate-500">
                          Unpaid Due
                        </p>

                        <h3
                          className={`mt-2 text-4xl font-extrabold ${
                            isBlocked ? "text-[#e71935]" : "text-[#0754dc]"
                          }`}
                        >
                          {rupees(client.unpaid_due)}
                        </h3>
                      </div>
                    </div>

                    {isBlocked && (
                      <div className="mt-6 rounded-3xl bg-[#fff0f3] p-5">
                        <div className="flex items-start gap-3">
                          <FaExclamationTriangle className="mt-1 text-[#e71935]" />

                          <div>
                            <p className="font-extrabold text-[#e71935]">
                              Client code is blocked because unpaid due crossed{" "}
                              {rupees(client.credit_limit)}.
                            </p>

                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                              Minimum payment required to reopen:{" "}
                              <span className="font-extrabold text-[#07142f]">
                                {rupees(client.minimum_reopen_payment)}
                              </span>
                              . Paid after block:{" "}
                              <span className="font-extrabold text-[#07142f]">
                                {rupees(client.paid_after_block)}
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <FaCreditCard className="text-xl text-[#0754dc]" />
                      <h3 className="text-2xl font-extrabold">
                        Record Payment
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="number"
                        value={paymentAmounts[client.id] || ""}
                        onChange={(e) =>
                          setPaymentAmounts((prev) => ({
                            ...prev,
                            [client.id]: e.target.value,
                          }))
                        }
                        placeholder="Payment Amount"
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-[#0754dc]"
                      />

                      <select
                        value={paymentModes[client.id] || "Cash"}
                        onChange={(e) =>
                          setPaymentModes((prev) => ({
                            ...prev,
                            [client.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 font-bold outline-none focus:border-[#0754dc]"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                      </select>

                      <textarea
                        value={paymentNotes[client.id] || ""}
                        onChange={(e) =>
                          setPaymentNotes((prev) => ({
                            ...prev,
                            [client.id]: e.target.value,
                          }))
                        }
                        placeholder="Payment notes optional"
                        className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-[#0754dc]"
                      />

                      <button
                        type="button"
                        onClick={() => recordPayment(client)}
                        disabled={savingClientId === client.id}
                        className="w-full rounded-2xl bg-[#0754dc] px-6 py-4 text-lg font-extrabold text-white disabled:bg-slate-300"
                      >
                        {savingClientId === client.id
                          ? "Saving..."
                          : "Save Payment"}
                      </button>

                      {client.whatsapp && client.whatsapp !== "TEAM CYTOCARE" && (
                        <a
                          href={`https://wa.me/91${client.whatsapp}`}
                          target="_blank"
                          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#05a832] px-6 py-4 text-lg font-extrabold text-white"
                        >
                          <FaPhoneAlt />
                          WhatsApp Client
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="text-3xl font-extrabold">No clients found</h2>
              <p className="mt-3 text-slate-500">
                Try changing your search or filter.
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
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-md">
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