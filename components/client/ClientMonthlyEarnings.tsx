"use client";

import { useEffect, useMemo, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type HistoryRow = {
  order_id: string;
  order_created_at: string;
  order_patient_payable: number;
  order_client_due_amount: number;
};

type OrderSummary = {
  order_id: string;
  order_created_at: string;
  order_patient_payable: number;
  order_client_due_amount: number;
};

export default function ClientMonthlyEarnings({
  clientId,
  loginPin,
}: {
  clientId: string;
  loginPin: string;
}) {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());

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
      console.log(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as HistoryRow[]);
    setLoading(false);
  }

  const orders = useMemo(() => {
    const map = new Map<string, OrderSummary>();

    rows.forEach((row) => {
      if (!map.has(row.order_id)) {
        map.set(row.order_id, {
          order_id: row.order_id,
          order_created_at: row.order_created_at,
          order_patient_payable: Number(row.order_patient_payable ?? 0),
          order_client_due_amount: Number(row.order_client_due_amount ?? 0),
        });
      }
    });

    return Array.from(map.values());
  }, [rows]);

  const monthOptions = useMemo(() => {
    const months = Array.from(
      new Set(orders.map((order) => getMonthValue(order.order_created_at)))
    );

    return months.sort().reverse();
  }, [orders]);

  useEffect(() => {
    if (monthOptions.length > 0 && !monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const selectedMonthOrders = orders.filter(
    (order) => getMonthValue(order.order_created_at) === selectedMonth
  );

  const patientCollected = selectedMonthOrders.reduce(
    (sum, order) => sum + Number(order.order_patient_payable ?? 0),
    0
  );

  const cytocareDue = selectedMonthOrders.reduce(
    (sum, order) => sum + Number(order.order_client_due_amount ?? 0),
    0
  );

  const earnedMargin = Math.max(patientCollected - cytocareDue, 0);

  function rupees(value: number) {
    return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
  }

  return (
    <div className="mt-6 rounded-[28px] border border-[#d7e6ff] bg-[#f8fbff] p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-3 text-2xl font-extrabold text-[#07142f]">
            <FaChartLine className="text-[#0754dc]" />
            Monthly Earnings
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-500">
            Your margin for selected month.
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-extrabold text-[#07142f] outline-none"
        >
          {monthOptions.length === 0 ? (
            <option value={selectedMonth}>{formatMonthLabel(selectedMonth)}</option>
          ) : (
            monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))
          )}
        </select>
      </div>

      {loading ? (
        <p className="rounded-2xl bg-white p-4 font-bold text-slate-500">
          Loading monthly earnings...
        </p>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-extrabold text-slate-500">
              Patient Amount Received
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#05a832]">
              {rupees(patientCollected)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-extrabold text-slate-500">
              Payable to Cytocare
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#07142f]">
              {rupees(cytocareDue)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#eafff0] p-4">
            <p className="text-sm font-extrabold text-[#05a832]">
              Your Earned Margin
            </p>
            <p className="mt-1 text-3xl font-extrabold text-[#05a832]">
              {rupees(earnedMargin)}
            </p>
          </div>

          <p className="text-sm font-bold text-slate-500">
            Formula: Patient Amount Received - Payable to Cytocare = Your Margin
          </p>
        </div>
      )}
    </div>
  );
}

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthValue(dateValue: string) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-");

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
}