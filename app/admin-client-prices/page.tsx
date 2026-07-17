"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBan,
  FaEdit,
  FaPlus,
  FaRupeeSign,
  FaSave,
  FaSearch,
  FaTimes,
  FaUserShield,
  FaVial,
} from "react-icons/fa";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ClientPrice = {
  id: string;
  category: string;
  product: string;
  vial: string | null;
  client_rate: number;
  mrp: number;
  reporting_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EditPrice = {
  category: string;
  product: string;
  vial: string;
  client_rate: string;
  mrp: string;
  reporting_time: string;
  is_active: boolean;
};

export default function AdminClientPricesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<ClientPrice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState<EditPrice | null>(null);
  const [savingId, setSavingId] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTest, setNewTest] = useState<EditPrice>({
    category: "",
    product: "",
    vial: "",
    client_rate: "",
    mrp: "",
    reporting_time: "",
    is_active: true,
  });

  useEffect(() => {
    loadPriceList();
  }, []);

  async function loadPriceList() {
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
      .from("cytocare_client_price_list")
      .select("*")
      .order("category", { ascending: true })
      .order("product", { ascending: true });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setPrices((data ?? []) as ClientPrice[]);
    setLoading(false);
  }

  const categories = useMemo(() => {
    return Array.from(new Set(prices.map((item) => item.category))).filter(
      Boolean
    );
  }, [prices]);

  const filteredPrices = useMemo(() => {
    const text = searchText.toLowerCase().trim();

    return prices.filter((item) => {
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesSearch =
        !text ||
        item.product.toLowerCase().includes(text) ||
        item.category.toLowerCase().includes(text) ||
        (item.vial ?? "").toLowerCase().includes(text);

      return matchesCategory && matchesSearch;
    });
  }, [prices, searchText, categoryFilter]);

  const activeTests = prices.filter((item) => item.is_active);
  const inactiveTests = prices.filter((item) => !item.is_active);

  function rupees(value: number | string | null | undefined) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function startEdit(item: ClientPrice) {
    setEditingId(item.id);
    setEditForm({
      category: item.category || "",
      product: item.product || "",
      vial: item.vial || "",
      client_rate: String(item.client_rate ?? ""),
      mrp: String(item.mrp ?? ""),
      reporting_time: item.reporting_time || "",
      is_active: item.is_active,
    });
  }

  function cancelEdit() {
    setEditingId("");
    setEditForm(null);
  }

  async function saveEdit(itemId: string) {
    if (!editForm) return;

    if (!editForm.product.trim()) {
      alert("Please enter test name.");
      return;
    }

    if (!editForm.category.trim()) {
      alert("Please enter category.");
      return;
    }

    if (Number(editForm.client_rate) < 0 || Number(editForm.mrp) < 0) {
      alert("Rate cannot be negative.");
      return;
    }

    setSavingId(itemId);

    const { error } = await supabase
      .from("cytocare_client_price_list")
      .update({
        category: editForm.category.trim(),
        product: editForm.product.trim(),
        vial: editForm.vial.trim() || null,
        client_rate: Number(editForm.client_rate || 0),
        mrp: Number(editForm.mrp || 0),
        reporting_time: editForm.reporting_time.trim() || null,
        is_active: editForm.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      setSavingId("");
      alert(error.message);
      return;
    }

    await loadPriceList();
    setSavingId("");
    cancelEdit();
  }

  async function addNewTest() {
    if (!newTest.product.trim()) {
      alert("Please enter test name.");
      return;
    }

    if (!newTest.category.trim()) {
      alert("Please enter category.");
      return;
    }

    if (Number(newTest.client_rate) < 0 || Number(newTest.mrp) < 0) {
      alert("Rate cannot be negative.");
      return;
    }

    setSavingId("new");

    const { error } = await supabase.from("cytocare_client_price_list").insert({
      category: newTest.category.trim(),
      product: newTest.product.trim(),
      vial: newTest.vial.trim() || null,
      client_rate: Number(newTest.client_rate || 0),
      mrp: Number(newTest.mrp || 0),
      reporting_time: newTest.reporting_time.trim() || null,
      is_active: newTest.is_active,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setSavingId("");
      alert(error.message);
      return;
    }

    setNewTest({
      category: "",
      product: "",
      vial: "",
      client_rate: "",
      mrp: "",
      reporting_time: "",
      is_active: true,
    });

    setShowAddForm(false);
    await loadPriceList();
    setSavingId("");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-md">
          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading Client Price List...
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
            <h1 className="text-3xl font-extrabold">Client Price List</h1>
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
              href="/admin-client-orders"
              className="rounded-xl bg-[#0754dc] px-5 py-3 font-bold text-white"
            >
              Client Orders
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
            title="Total Tests"
            value={prices.length}
            icon={<FaVial />}
            color="bg-[#0754dc]"
          />

          <StatCard
            title="Active Tests"
            value={activeTests.length}
            icon={<FaSave />}
            color="bg-[#05a832]"
          />

          <StatCard
            title="Inactive Tests"
            value={inactiveTests.length}
            icon={<FaTimes />}
            color="bg-[#e71935]"
          />

          <StatCard
            title="Categories"
            value={categories.length}
            icon={<FaRupeeSign />}
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
                placeholder="Search test, category, vial..."
                className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-4 font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-[#0754dc]"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl bg-[#0754dc] px-6 py-4 font-extrabold text-white"
              >
                <FaPlus />
                Add Test
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-2xl font-extrabold">
              Add New Client Price Test
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={newTest.product}
                onChange={(e) =>
                  setNewTest((prev) => ({ ...prev, product: e.target.value }))
                }
                placeholder="Test Name"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                value={newTest.category}
                onChange={(e) =>
                  setNewTest((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Category"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                value={newTest.vial}
                onChange={(e) =>
                  setNewTest((prev) => ({ ...prev, vial: e.target.value }))
                }
                placeholder="Vial"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                type="number"
                value={newTest.client_rate}
                onChange={(e) =>
                  setNewTest((prev) => ({
                    ...prev,
                    client_rate: e.target.value,
                  }))
                }
                placeholder="Client/Lab Rate"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                type="number"
                value={newTest.mrp}
                onChange={(e) =>
                  setNewTest((prev) => ({ ...prev, mrp: e.target.value }))
                }
                placeholder="MRP"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />

              <input
                value={newTest.reporting_time}
                onChange={(e) =>
                  setNewTest((prev) => ({
                    ...prev,
                    reporting_time: e.target.value,
                  }))
                }
                placeholder="Reporting Time"
                className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={addNewTest}
                disabled={savingId === "new"}
                className="rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white disabled:bg-slate-300"
              >
                {savingId === "new" ? "Saving..." : "Save New Test"}
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl bg-slate-100 px-6 py-3 font-extrabold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {filteredPrices.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-[28px] border bg-white p-6 shadow-md ${
                  item.is_active ? "border-slate-100" : "border-[#e71935]/30"
                }`}
              >
                {!isEditing ? (
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                          {item.category}
                        </span>

                        {item.is_active ? (
                          <span className="rounded-full bg-[#eafff0] px-4 py-2 text-sm font-extrabold text-[#05a832]">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#fff0f3] px-4 py-2 text-sm font-extrabold text-[#e71935]">
                            Inactive
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-extrabold">
                        {item.product}
                      </h2>

                      <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-3">
                        <p>
                          <b>Vial:</b> {item.vial || "Not added"}
                        </p>

                        <p>
                          <b>Reporting:</b>{" "}
                          {item.reporting_time || "Not added"}
                        </p>

                        <p>
                          <b>Client/Lab Rate:</b>{" "}
                          <span className="font-extrabold text-[#0754dc]">
                            {rupees(item.client_rate)}
                          </span>
                        </p>

                        <p>
                          <b>MRP:</b>{" "}
                          <span className="font-extrabold text-[#07142f]">
                            {rupees(item.mrp)}
                          </span>
                        </p>

                        <p>
                          <b>Client Margin:</b>{" "}
                          <span className="font-extrabold text-[#05a832]">
                            {rupees(Number(item.mrp) - Number(item.client_rate))}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex items-center gap-3 rounded-xl bg-[#0754dc] px-5 py-3 font-extrabold text-white"
                    >
                      <FaEdit />
                      Edit
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={editForm?.product ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev ? { ...prev, product: e.target.value } : prev
                          )
                        }
                        placeholder="Test Name"
                        className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                      />

                      <input
                        value={editForm?.category ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev ? { ...prev, category: e.target.value } : prev
                          )
                        }
                        placeholder="Category"
                        className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                      />

                      <input
                        value={editForm?.vial ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev ? { ...prev, vial: e.target.value } : prev
                          )
                        }
                        placeholder="Vial"
                        className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                      />

                      <input
                        type="number"
                        value={editForm?.client_rate ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev
                              ? { ...prev, client_rate: e.target.value }
                              : prev
                          )
                        }
                        placeholder="Client/Lab Rate"
                        className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                      />

                      <input
                        type="number"
                        value={editForm?.mrp ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev ? { ...prev, mrp: e.target.value } : prev
                          )
                        }
                        placeholder="MRP"
                        className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                      />

                      <input
                        value={editForm?.reporting_time ?? ""}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev
                              ? { ...prev, reporting_time: e.target.value }
                              : prev
                          )
                        }
                        placeholder="Reporting Time"
                        className="rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
                      />

                      <select
                        value={editForm?.is_active ? "active" : "inactive"}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  is_active: e.target.value === "active",
                                }
                              : prev
                          )
                        }
                        className="rounded-xl border border-slate-200 p-4 font-bold outline-none focus:border-[#0754dc]"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        disabled={savingId === item.id}
                        className="flex items-center gap-3 rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white disabled:bg-slate-300"
                      >
                        <FaSave />
                        {savingId === item.id ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-xl bg-slate-100 px-6 py-3 font-extrabold text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredPrices.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="text-3xl font-extrabold">No tests found</h2>
              <p className="mt-3 text-slate-500">
                Try changing search or category filter.
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
  icon: ReactNode;
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