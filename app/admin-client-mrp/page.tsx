"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  FaArrowLeft,
  FaBan,
  FaEdit,
  FaSearch,
  FaTimes,
  FaUndo,
  FaUserShield,
} from "react-icons/fa";

import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  client_code: string;
  client_name: string;
  status: string;
};

type MasterPrice = {
  id: string;
  category: string;
  product: string;
  vial: string | null;
  client_rate: number;
  mrp: number;
  reporting_time: string | null;
  is_active: boolean;
};

type MrpOverride = {
  id: string;
  client_id: string;
  price_id: string;
  custom_mrp: number;
};

export default function AdminClientMrpPage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [prices, setPrices] =
    useState<MasterPrice[]>([]);

  const [overrides, setOverrides] =
    useState<MrpOverride[]>([]);

  const [selectedClientId, setSelectedClientId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [editingPriceId, setEditingPriceId] =
    useState("");

  const [editingMrp, setEditingMrp] =
    useState("");

  const [savingId, setSavingId] =
    useState("");

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    setLoading(true);

    const { data: userData } =
      await supabase.auth.getUser();

    if (!userData.user) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setUser(userData.user);

    const { data: adminData } =
      await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userData.user.id)
        .maybeSingle();

    if (!adminData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    const [
      clientsResult,
      pricesResult,
    ] = await Promise.all([
      supabase
        .from("cytocare_clients")
        .select(
          "id, client_code, client_name, status"
        )
        .order("client_name", {
          ascending: true,
        }),

      supabase
        .from("cytocare_client_price_list")
        .select(
          "id, category, product, vial, client_rate, mrp, reporting_time, is_active"
        )
        .eq("is_active", true)
        .order("category", {
          ascending: true,
        })
        .order("product", {
          ascending: true,
        }),
    ]);

    if (clientsResult.error) {
      alert(clientsResult.error.message);
    } else {
      setClients(
        (clientsResult.data ?? []) as Client[]
      );
    }

    if (pricesResult.error) {
      alert(pricesResult.error.message);
    } else {
      setPrices(
        (pricesResult.data ??
          []) as MasterPrice[]
      );
    }

    setLoading(false);
  }

  async function loadOverrides(
    clientId: string
  ) {
    setOverrides([]);

    if (!clientId) return;

    const { data, error } =
      await supabase
        .from(
          "cytocare_client_mrp_overrides"
        )
        .select("*")
        .eq("client_id", clientId);

    if (error) {
      alert(error.message);
      return;
    }

    setOverrides(
      (data ?? []) as MrpOverride[]
    );
  }

  async function selectClient(
    clientId: string
  ) {
    setSelectedClientId(clientId);
    setEditingPriceId("");
    setEditingMrp("");
    setSearch("");

    await loadOverrides(clientId);
  }

  const selectedClient =
    clients.find(
      (client) =>
        client.id === selectedClientId
    ) ?? null;

  function getOverride(
    priceId: string
  ) {
    return overrides.find(
      (item) =>
        item.price_id === priceId
    );
  }

  const filteredPrices =
    useMemo(() => {
      const q =
        search.toLowerCase().trim();

      if (!q) return prices;

      return prices.filter((item) =>
        [
          item.product,
          item.category,
          item.vial ?? "",
          item.reporting_time ?? "",
          String(item.client_rate),
          String(item.mrp),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }, [prices, search]);

  function startEdit(
    price: MasterPrice
  ) {
    const override =
      getOverride(price.id);

    setEditingPriceId(price.id);

    setEditingMrp(
      String(
        override?.custom_mrp ??
          price.mrp
      )
    );
  }

  function cancelEdit() {
    setEditingPriceId("");
    setEditingMrp("");
  }

  async function saveCustomMrp(
    price: MasterPrice
  ) {
    if (!selectedClientId) {
      alert("Please select a client.");
      return;
    }

    const customMrp =
      Number(editingMrp);

    if (
      Number.isNaN(customMrp) ||
      customMrp < 0
    ) {
      alert(
        "Please enter a valid MRP."
      );
      return;
    }

    setSavingId(price.id);

    const existing =
      getOverride(price.id);

    let error;

    if (existing) {
      const result =
        await supabase
          .from(
            "cytocare_client_mrp_overrides"
          )
          .update({
            custom_mrp:
              customMrp,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.id);

      error = result.error;
    } else {
      const result =
        await supabase
          .from(
            "cytocare_client_mrp_overrides"
          )
          .insert({
            client_id:
              selectedClientId,

            price_id:
              price.id,

            custom_mrp:
              customMrp,

            updated_at:
              new Date().toISOString(),
          });

      error = result.error;
    }

    if (error) {
      setSavingId("");
      alert(error.message);
      return;
    }

    await loadOverrides(
      selectedClientId
    );

    setSavingId("");
    cancelEdit();

   
  }

  async function removeCustomMrp(
    price: MasterPrice
  ) {
    const override =
      getOverride(price.id);

    if (
      !override ||
      !selectedClientId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove custom MRP for ${price.product}?\n\nThe client will return to the standard MRP of ₹${Number(
          price.mrp
        ).toLocaleString("en-IN")}.`
      );

    if (!confirmed) return;

    setSavingId(price.id);

    const { error } =
      await supabase
        .from(
          "cytocare_client_mrp_overrides"
        )
        .delete()
        .eq("id", override.id);

    if (error) {
      setSavingId("");
      alert(error.message);
      return;
    }

    await loadOverrides(
      selectedClientId
    );

    setSavingId("");

    
  }

  function rupees(
    value:
      | number
      | string
      | null
      | undefined
  ) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">

        <div className="rounded-3xl bg-white p-10 shadow-md">

          <h1 className="text-3xl font-extrabold text-[#07142f]">
            Loading Client MRP Management...
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

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">

        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-5 px-6 py-5">

          <div>

            <p className="font-bold text-[#0754dc]">
              CYTOCARE ADMIN
            </p>

            <h1 className="text-3xl font-extrabold">
              Client Specific MRP
            </h1>

          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              href="/admin-clients"
              className="flex items-center gap-2 rounded-xl bg-[#eef5ff] px-5 py-3 font-extrabold text-[#0754dc]"
            >
              <FaArrowLeft />
              Client Management
            </Link>

            <Link
              href="/admin-client-prices"
              className="rounded-xl bg-[#0754dc] px-5 py-3 font-extrabold text-white"
            >
              Master Price List
            </Link>

          </div>

        </div>

      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-8">

        {/* CLIENT SELECTION */}

        <div className="rounded-3xl bg-white p-7 shadow-md">

          <p className="text-sm font-extrabold uppercase text-[#0754dc]">
            Step 1
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Select Client
          </h2>

          <p className="mt-2 text-slate-500">
            Only MRP will change for the selected client.
            Client/Lab Rate remains unchanged.
          </p>

          <select
            value={selectedClientId}
            onChange={(e) =>
              selectClient(
                e.target.value
              )
            }
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-4 text-lg font-extrabold outline-none focus:border-[#0754dc]"
          >

            <option value="">
              Select Client
            </option>

            {clients.map(
              (client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.client_name}
                  {" — "}
                  {client.client_code}
                </option>
              )
            )}

          </select>

        </div>

        {selectedClient && (
          <>

            {/* CLIENT SUMMARY */}

            <div className="mt-6 rounded-3xl bg-[#07142f] p-7 text-white shadow-md">

              <p className="text-sm font-extrabold uppercase text-[#8cb9ff]">
                Editing MRP For
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                {selectedClient.client_name}
              </h2>

              <p className="mt-2 font-bold text-slate-300">
                {selectedClient.client_code}
              </p>

              <div className="mt-5 flex flex-wrap gap-4">

                <div className="rounded-2xl bg-white/10 px-5 py-4">

                  <p className="text-xs font-bold text-slate-300">
                    Custom MRP Tests
                  </p>

                  <p className="mt-1 text-3xl font-extrabold">
                    {overrides.length}
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 px-5 py-4">

                  <p className="text-xs font-bold text-slate-300">
                    Total Tests
                  </p>

                  <p className="mt-1 text-3xl font-extrabold">
                    {prices.length}
                  </p>

                </div>

              </div>

            </div>

            {/* SEARCH */}

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-md">

              <div className="relative">

                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0754dc]" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search test name, category, vial, rate..."
                  className="w-full rounded-2xl border border-slate-200 py-4 pl-14 pr-5 text-lg font-semibold outline-none focus:border-[#0754dc]"
                />

              </div>

            </div>

            {/* TEST LIST */}

            <div className="mt-6 space-y-4">

              {filteredPrices.map(
                (price) => {

                  const override =
                    getOverride(
                      price.id
                    );

                  const isEditing =
                    editingPriceId ===
                    price.id;

                  const displayedMrp =
                    override?.custom_mrp ??
                    price.mrp;

                  return (
                    <div
                      key={price.id}
                      className={`rounded-3xl border bg-white p-6 shadow-sm ${
                        override
                          ? "border-[#f59e0b]"
                          : "border-slate-100"
                      }`}
                    >

                      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_auto] xl:items-center">

                        {/* TEST */}

                        <div>

                          <div className="mb-2 flex flex-wrap gap-2">

                            <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                              {price.category}
                            </span>

                            {override && (
                              <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-extrabold text-[#a56600]">
                                CUSTOM MRP
                              </span>
                            )}

                          </div>

                          <h3 className="text-xl font-extrabold">
                            {price.product}
                          </h3>

                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            Vial:{" "}
                            {price.vial ||
                              "Not added"}
                          </p>

                        </div>

                        {/* CLIENT RATE */}

                        <div>

                          <p className="text-xs font-extrabold uppercase text-slate-400">
                            Client Rate
                          </p>

                          <p className="mt-1 text-xl font-extrabold text-[#0754dc]">
                            {rupees(
                              price.client_rate
                            )}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            Common
                          </p>

                        </div>

                        {/* STANDARD MRP */}

                        <div>

                          <p className="text-xs font-extrabold uppercase text-slate-400">
                            Standard MRP
                          </p>

                          <p className="mt-1 text-xl font-extrabold">
                            {rupees(
                              price.mrp
                            )}
                          </p>

                        </div>

                        {/* THIS CLIENT MRP */}

                        <div>

                          <p className="text-xs font-extrabold uppercase text-slate-400">
                            This Client MRP
                          </p>

                          <p
                            className={`mt-1 text-xl font-extrabold ${
                              override
                                ? "text-[#f59e0b]"
                                : "text-[#07142f]"
                            }`}
                          >
                            {rupees(
                              displayedMrp
                            )}
                          </p>

                        </div>

                        {/* ACTION */}

                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                price
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#0754dc] px-5 py-3 font-extrabold text-white"
                          >
                            <FaEdit />

                            {override
                              ? "Change MRP"
                              : "Set MRP"}
                          </button>
                        ) : (
                          <div className="min-w-[220px]">

                            <label className="mb-2 block text-xs font-extrabold text-slate-500">
                              New MRP
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                editingMrp
                              }
                              onChange={(e) =>
                                setEditingMrp(
                                  e.target
                                    .value
                                )
                              }
                              className="w-full rounded-xl border border-[#0754dc] p-3 text-lg font-extrabold outline-none"
                            />

                            <div className="mt-3 flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  saveCustomMrp(
                                    price
                                  )
                                }
                                disabled={
                                  savingId ===
                                  price.id
                                }
                                className="flex-1 rounded-xl bg-[#05a832] px-3 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                              >
                                {savingId ===
                                price.id
                                  ? "Saving..."
                                  : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEdit
                                }
                                className="rounded-xl bg-slate-100 px-4 py-3 text-slate-600"
                              >
                                <FaTimes />
                              </button>

                            </div>

                          </div>
                        )}

                      </div>

                      {/* REMOVE OVERRIDE */}

                      {override &&
                        !isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              removeCustomMrp(
                                price
                              )
                            }
                            disabled={
                              savingId ===
                              price.id
                            }
                            className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[#e71935]"
                          >
                            <FaUndo />
                            Restore Standard MRP
                          </button>
                        )}

                    </div>
                  );
                }
              )}

            </div>

          </>
        )}

      </section>

    </main>
  );
}