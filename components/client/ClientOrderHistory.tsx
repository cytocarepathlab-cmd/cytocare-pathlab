"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaFileMedical,
  FaHistory,
  FaLock,
  FaPhoneAlt,
  FaRedo,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type HistoryRow = {
  order_id: string;
  order_created_at: string;
  order_status: string;
  order_total_mrp: number;
  order_elite_discount: number;
  order_client_margin: number;
  order_client_due_amount: number;
  order_patient_payable: number;
  order_patient_amount_received: number;

  item_id: string | null;
  reference_number: string | null;
  product: string | null;
  patient_name: string | null;
  patient_mobile: string | null;
  patient_type: string | null;
  mrp: number;
  client_rate: number;
  item_elite_discount: number;
  item_client_due_amount: number;
  item_patient_payable: number;

  item_patient_amount_received: number;
  item_report_url: string | null;
  item_report_status: string | null;
};

type OrderGroup = {
  order_id: string;
  order_created_at: string;
  order_status: string;
  order_total_mrp: number;
  order_elite_discount: number;
  order_client_margin: number;
  order_client_due_amount: number;
  order_patient_payable: number;
  order_patient_amount_received: number;
  items: HistoryRow[];
};

export default function ClientOrderHistory({
  clientId,
  loginPin,
}: {
  clientId: string;
  loginPin: string;
}) {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const [editingItemAmounts, setEditingItemAmounts] = useState<
    Record<string, string>
  >({});
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [clientId, loginPin]);

  async function loadHistory() {
    setLoading(true);

    const { data, error } = await supabase.rpc("client_get_order_history", {
      p_client_id: clientId,
      p_login_pin: loginPin,
    });

    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as HistoryRow[]);
    setLoading(false);
  }

  function rupees(value: number | null | undefined) {
    return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "No date";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function cleanText(value: string | null | undefined) {
    return (value ?? "").toLowerCase().trim();
  }

  function getOrderClientMargin(order: OrderGroup) {
    const patientPayable = Number(order.order_patient_payable ?? 0);
    const clientDue = Number(order.order_client_due_amount ?? 0);

    return Math.max(patientPayable - clientDue, 0);
  }

  function getItemClientMargin(item: HistoryRow) {
    const patientPayable = Number(item.item_patient_payable ?? 0);
    const clientDue = Number(item.item_client_due_amount ?? 0);

    return Math.max(patientPayable - clientDue, 0);
  }

  function getItemPendingAmount(item: HistoryRow) {
    const payable = Number(item.item_patient_payable ?? 0);
    const paid = Number(item.item_patient_amount_received ?? 0);

    return Math.max(payable - paid, 0);
  }

  function isItemFullyPaid(item: HistoryRow) {
    return (
      Number(item.item_patient_payable ?? 0) > 0 &&
      getItemPendingAmount(item) <= 0
    );
  }

  function canViewItemReport(item: HistoryRow) {
    return isItemFullyPaid(item) && Boolean(item.item_report_url);
  }

  function getOrderPatientPaid(order: OrderGroup) {
    const itemPaidTotal = order.items.reduce(
      (sum, item) => sum + Number(item.item_patient_amount_received ?? 0),
      0
    );

    if (itemPaidTotal > 0) return itemPaidTotal;

    return Number(order.order_patient_amount_received ?? 0);
  }

  function getOrderPendingAmount(order: OrderGroup) {
    const payable = Number(order.order_patient_payable ?? 0);
    const paid = getOrderPatientPaid(order);

    return Math.max(payable - paid, 0);
  }

  function isOrderFullyPaid(order: OrderGroup) {
    return (
      Number(order.order_patient_payable ?? 0) > 0 &&
      getOrderPendingAmount(order) <= 0
    );
  }

  const orders = useMemo(() => {
    const map = new Map<string, OrderGroup>();

    rows.forEach((row) => {
      if (!map.has(row.order_id)) {
        map.set(row.order_id, {
          order_id: row.order_id,
          order_created_at: row.order_created_at,
          order_status: row.order_status,
          order_total_mrp: Number(row.order_total_mrp ?? 0),
          order_elite_discount: Number(row.order_elite_discount ?? 0),
          order_client_margin: Number(row.order_client_margin ?? 0),
          order_client_due_amount: Number(row.order_client_due_amount ?? 0),
          order_patient_payable: Number(row.order_patient_payable ?? 0),
          order_patient_amount_received: Number(
            row.order_patient_amount_received ?? 0
          ),
          items: [],
        });
      }

      if (row.item_id) {
        map.get(row.order_id)?.items.push(row);
      }
    });

    return Array.from(map.values());
  }, [rows]);

  const filteredOrders = useMemo(() => {
    const q = cleanText(search);

    if (!q) return orders;

    return orders.filter((order) => {
      const orderText = [
        order.order_id,
        formatDate(order.order_created_at),
        order.order_patient_payable,
        order.order_client_due_amount,
      ]
        .join(" ")
        .toLowerCase();

      const itemMatch = order.items.some((item) =>
        [
          item.patient_name,
          item.patient_mobile,
          item.product,
          item.reference_number,
          item.patient_type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );

      return orderText.includes(q) || itemMatch;
    });
  }, [orders, search]);

  function getVisibleItems(order: OrderGroup) {
    const q = cleanText(search);

    if (!q) return order.items;

    const matchingItems = order.items.filter((item) =>
      [
        item.patient_name,
        item.patient_mobile,
        item.product,
        item.reference_number,
        item.patient_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );

    return matchingItems.length > 0 ? matchingItems : order.items;
  }

  function getEditingItemAmount(item: HistoryRow) {
    if (!item.item_id) return "0";

    return (
      editingItemAmounts[item.item_id] ??
      String(item.item_patient_amount_received ?? 0)
    );
  }

  async function saveItemPaidAmount(item: HistoryRow) {
    if (!item.item_id) {
      alert("Missing test item ID.");
      return;
    }

    const amount = Number(getEditingItemAmount(item));

    if (Number.isNaN(amount) || amount < 0) {
      alert("Please enter a valid paid amount.");
      return;
    }

    setSavingItemId(item.item_id);

    const { error } = await supabase.rpc(
      "client_update_item_patient_amount_received",
      {
        p_client_id: clientId,
        p_login_pin: loginPin,
        p_item_id: item.item_id,
        p_patient_amount_received: amount,
      }
    );

    if (error) {
      alert(error.message);
      setSavingItemId(null);
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.item_id === item.item_id
          ? {
              ...row,
              item_patient_amount_received: amount,
            }
          : row
      )
    );

    setSavingItemId(null);
  }

  function openReport(item: HistoryRow) {
    if (!canViewItemReport(item) || !item.item_report_url) return;

    window.open(item.item_report_url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="rounded-[32px] bg-white p-7 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-4xl font-extrabold text-[#07142f]">
            <FaHistory className="text-[#0754dc]" />
            Booking History
          </h2>

          <p className="mt-2 text-lg font-semibold text-slate-500">
            Search bookings, update patient payment and view reports only after
            full payment.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="flex items-center gap-2 rounded-2xl bg-[#0754dc] px-6 py-4 font-extrabold text-white"
        >
          <FaRedo />
          Refresh
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4">
        <FaSearch className="text-[#0754dc]" />

        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpenOrderId(null);
          }}
          placeholder="Search patient name, mobile, test name or reference number..."
          className="w-full bg-transparent text-lg font-bold text-[#07142f] outline-none placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[#f8fbff] p-8 text-center text-xl font-extrabold text-[#07142f]">
          Loading booking history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl bg-[#f8fbff] p-8 text-center text-xl font-extrabold text-slate-500">
          No matching bookings found.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const isOpen = openOrderId === order.order_id;
            const visibleItems = getVisibleItems(order);
            const firstPatient =
              order.items[0]?.patient_name || "Patient details available";
            const testCount = order.items.length;
            const orderPendingAmount = getOrderPendingAmount(order);
            const orderFullyPaid = isOrderFullyPaid(order);

            return (
              <div
                key={order.order_id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div>
                      <p className="text-sm font-extrabold text-slate-500">
                        Order Date
                      </p>

                      <h3 className="mt-1 text-xl font-extrabold text-[#07142f]">
                        {formatDate(order.order_created_at)}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {firstPatient} • {testCount} test
                        {testCount > 1 ? "s" : ""}
                      </p>

                      <p className="mt-2 inline-flex rounded-full bg-[#eafbff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                        Source: Client Partner Booking
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <AmountBox
                        label="Patient Payable"
                        value={rupees(order.order_patient_payable)}
                        tone={orderFullyPaid ? "green" : "red"}
                      />

                      <AmountBox
                        label="Patient Paid"
                        value={rupees(getOrderPatientPaid(order))}
                        tone={orderFullyPaid ? "green" : "red"}
                      />

                      <AmountBox
                        label="Client Due"
                        value={rupees(order.order_client_due_amount)}
                      />

                      <AmountBox
                        label="Client Margin"
                        value={rupees(getOrderClientMargin(order))}
                        tone="green"
                      />

                      <AmountBox
                        label="Pending Patient Amount"
                        value={rupees(orderPendingAmount)}
                        tone={orderPendingAmount > 0 ? "red" : "green"}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setOpenOrderId(isOpen ? null : order.order_id)
                        }
                        className="flex items-center gap-2 rounded-2xl bg-[#0754dc] px-5 py-4 font-extrabold text-white"
                      >
                        {isOpen ? "Hide Details" : "View Details"}
                        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-[#f8fbff] p-5">
                    <div className="mb-5 rounded-2xl bg-white p-4 text-sm font-bold text-slate-600">
                      Report will open only when the patient has paid the full
                      amount and Cytocare admin has uploaded the report.
                    </div>

                    <div className="space-y-4">
                      {visibleItems.map((item, index) => {
                        const itemPendingAmount = getItemPendingAmount(item);
                        const itemFullyPaid = isItemFullyPaid(item);
                        const reportReady = Boolean(item.item_report_url);
                        const reportAllowed = canViewItemReport(item);

                        return (
                          <div
                            key={`${item.item_id}-${index}`}
                            className="rounded-2xl bg-white p-5 shadow-sm"
                          >
                            <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr_0.9fr_1fr]">
                              <div>
                                <p className="flex items-center gap-2 font-extrabold text-[#07142f]">
                                  <FaUser className="text-[#0754dc]" />
                                  {item.patient_name || "No patient name"}
                                </p>

                                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
                                  <FaPhoneAlt />
                                  {item.patient_mobile || "No mobile"} •{" "}
                                  {item.patient_type || "Normal"}
                                </p>

                                <p className="mt-3 inline-flex rounded-full bg-[#eafbff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                                  Client Partner Booking
                                </p>
                              </div>

                              <div>
                                <p className="flex items-center gap-2 font-extrabold text-[#07142f]">
                                  <FaFileMedical className="text-[#e71935]" />
                                  {item.product || "Test"}
                                </p>

                                <p className="mt-2 text-sm font-bold text-slate-500">
                                  MRP: {rupees(item.mrp)} • Client Rate:{" "}
                                  {rupees(item.client_rate)}
                                </p>

                                <p className="mt-2 text-sm font-bold text-slate-500">
                                  Reference No.
                                </p>

                                <p className="mt-1 inline-flex rounded-full bg-[#eafbff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                                  {item.reference_number || "Generating"}
                                </p>
                              </div>

                              <div>
                                <CalculationBox
                                  label="Amount Payable"
                                  value={rupees(item.item_patient_payable)}
                                  tone={itemFullyPaid ? "green" : "red"}
                                />

                                <div className="mt-3 rounded-2xl bg-[#f8fbff] p-4">
                                  <p className="text-sm font-extrabold text-slate-500">
                                    Amount Paid by Patient
                                  </p>

                                  <input
                                    type="number"
                                    min="0"
                                    value={getEditingItemAmount(item)}
                                    onChange={(event) => {
                                      if (!item.item_id) return;

                                      setEditingItemAmounts((prev) => ({
                                        ...prev,
                                        [item.item_id as string]:
                                          event.target.value,
                                      }));
                                    }}
                                    className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-xl font-extrabold text-[#07142f] outline-none focus:border-[#0754dc]"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => saveItemPaidAmount(item)}
                                    disabled={
                                      savingItemId === item.item_id ||
                                      !item.item_id
                                    }
                                    className="mt-3 w-full rounded-xl bg-[#0754dc] px-4 py-3 font-extrabold text-white disabled:bg-slate-300"
                                  >
                                    {savingItemId === item.item_id
                                      ? "Saving..."
                                      : "Save Paid Amount"}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <CalculationBox
                                  label="Pending Amount"
                                  value={rupees(itemPendingAmount)}
                                  tone={itemPendingAmount > 0 ? "red" : "green"}
                                />

                                <CalculationBox
                                  label="Test Margin"
                                  value={rupees(getItemClientMargin(item))}
                                  tone="green"
                                />

                                <button
                                  type="button"
                                  onClick={() => openReport(item)}
                                  disabled={!reportAllowed}
                                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-extrabold ${
                                    reportAllowed
                                      ? "bg-[#05a832] text-white"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {reportAllowed ? (
                                    <>
                                      <FaDownload />
                                      View / Download Report
                                    </>
                                  ) : !itemFullyPaid ? (
                                    <>
                                      <FaLock />
                                      Locked Until Full Payment
                                    </>
                                  ) : !reportReady ? (
                                    <>
                                      <FaLock />
                                      Report Not Uploaded
                                    </>
                                  ) : (
                                    <>
                                      <FaCheckCircle />
                                      Report Ready
                                    </>
                                  )}
                                </button>

                                <p className="mt-3 text-xs font-bold text-slate-500">
                                  Patient Payable{" "}
                                  {rupees(item.item_patient_payable)} - Patient
                                  Paid{" "}
                                  {rupees(item.item_patient_amount_received)} =
                                  Pending {rupees(itemPendingAmount)}
                                </p>
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
        </div>
      )}
    </section>
  );
}

function AmountBox({
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
    <div className="rounded-2xl bg-[#f8fbff] px-5 py-3 shadow-sm">
      <p className="text-xs font-extrabold uppercase text-slate-500">
        {label}
      </p>

      <p className={`mt-1 text-lg font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function CalculationBox({
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
    <div className="mb-3 rounded-2xl bg-[#f8fbff] p-4 shadow-sm">
      <p className="text-sm font-extrabold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}