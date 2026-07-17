"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FaBuilding,
  FaFileMedical,
  FaHome,
  FaPhoneAlt,
  FaRedo,
  FaSearch,
  FaSignOutAlt,
  FaTable,
  FaUser,
  FaDownload,
FaWhatsapp,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type ClientProfile = {
  id: string;
  client_name?: string | null;
  name?: string | null;
  lab_name?: string | null;
  client_code?: string | null;
  phone?: string | null;
  mobile?: string | null;
};

type ClientReport = {
  report_id: string;
  patient_name: string;
  patient_mobile: string;
  test_name: string;
  reference_number: string;
  report_url: string;
  report_status: string;
  report_uploaded_at: string | null;
  booking_date: string | null;
};

type ReportGroup = {
  patientKey: string;
  patientName: string;
  patientMobile: string;
  reports: ClientReport[];
};

type PriceListRpcRow = {
  row_data?: Record<string, unknown>;
};

type ClientPriceItem = {
  id: string;
  product: string;
  vials: string;
  clientRate: number;
  mrp: number;
  reportingTime: string;
  category: string;
};

export default function ClientPortalPage() {
  const [clientCode, setClientCode] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [client, setClient] = useState<ClientProfile | null>(null);

  const [reports, setReports] = useState<ClientReport[]>([]);
  const [priceList, setPriceList] = useState<ClientPriceItem[]>([]);
  const [reportWhatsappNumbers, setReportWhatsappNumbers] = useState<
  Record<string, string>
>({});

  const [activeTab, setActiveTab] = useState<"reports" | "priceList">(
    "reports"
  );

  const [search, setSearch] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  function getClientName(clientData: ClientProfile | null) {
    if (!clientData) return "Client";

    return (
      clientData.client_name ||
      clientData.lab_name ||
      clientData.name ||
      "Client"
    );
  }

  function rupees(value: number | null | undefined) {
    return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
  }

function updateReportWhatsappNumber(reportId: string, value: string) {
  setReportWhatsappNumbers((prev) => ({
    ...prev,
    [reportId]: value,
  }));
}

function cleanWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return digits;
}

function sendReportOnWhatsapp(report: ClientReport) {
  const rawNumber = reportWhatsappNumbers[report.report_id] ?? "";
  const whatsappNumber = cleanWhatsappNumber(rawNumber);

  if (whatsappNumber.length < 10) {
    alert("Please enter a valid WhatsApp mobile number.");
    return;
  }

  const message = encodeURIComponent(
    `Hello,\n\nYour Cytocare report is ready.\n\nPatient: ${report.patient_name}\nReport: ${report.test_name}\nReference No: ${report.reference_number}\n\nDownload Report:\n${report.report_url}\n\nRegards,\nCytocare Path Lab`
  );

  window.open(
    `https://wa.me/${whatsappNumber}?text=${message}`,
    "_blank",
    "noopener,noreferrer"
  );
}

  function formatDate(value: string | null | undefined) {
    if (!value) return "Not available";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRawText(raw: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = raw[key];

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value);
      }
    }

    return "";
  }

  function getRawNumber(raw: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = raw[key];

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        const numberValue = Number(value);

        if (!Number.isNaN(numberValue)) {
          return numberValue;
        }
      }
    }

    return 0;
  }

  function normalizePriceRow(row: PriceListRpcRow, index: number) {
    const raw = row.row_data ?? {};

    return {
      id:
        getRawText(raw, ["id", "test_id", "product_id"]) ||
        `price-row-${index}`,
      product:
        getRawText(raw, ["product", "test_name", "name", "test"]) ||
        "Unnamed Test",
      vials: getRawText(raw, ["vials", "vial", "sample_type", "sample"]),
      clientRate: getRawNumber(raw, [
        "client_rate",
        "client_lab_rate",
        "lab_rate",
        "rate",
        "clientRate",
      ]),
      mrp: getRawNumber(raw, ["mrp", "MRP", "price", "patient_price"]),
      reportingTime: getRawText(raw, [
        "reporting_time",
        "reportingTime",
        "report_time",
        "tat",
      ]),
      category: getRawText(raw, ["category", "department", "section"]),
    };
  }

  async function loginClient() {
    if (!clientCode.trim() || !loginPin.trim()) {
      alert("Please enter client code and PIN.");
      return;
    }

    setLoginLoading(true);

    const { data, error } = await supabase.rpc("client_portal_login", {
      p_client_code: clientCode.trim(),
      p_login_pin: loginPin.trim(),
    });

    if (error) {
      alert(error.message);
      setLoginLoading(false);
      return;
    }

    const loggedClient = Array.isArray(data) ? data[0] : data;

    if (!loggedClient?.id) {
      alert("Invalid client code or PIN.");
      setLoginLoading(false);
      return;
    }

    setClient(loggedClient as ClientProfile);

    await Promise.all([
      loadReports(loggedClient.id, loginPin.trim()),
      loadPriceList(loggedClient.id, loginPin.trim()),
    ]);

    setLoginLoading(false);
  }

  async function loadReports(clientId?: string, pin?: string) {
    const activeClientId = clientId ?? client?.id;
    const activePin = pin ?? loginPin;

    if (!activeClientId || !activePin) return;

    setReportsLoading(true);

    const { data, error } = await supabase.rpc("client_get_client_reports", {
      p_client_id: activeClientId,
      p_login_pin: activePin,
    });

    if (error) {
      alert(error.message);
      setReports([]);
      setReportsLoading(false);
      return;
    }

    setReports((data ?? []) as ClientReport[]);
    setReportsLoading(false);
  }

  async function loadPriceList(clientId?: string, pin?: string) {
    const activeClientId = clientId ?? client?.id;
    const activePin = pin ?? loginPin;

    if (!activeClientId || !activePin) return;

    setPriceLoading(true);

    const { data, error } = await supabase.rpc("client_get_price_list_v2", {
      p_client_id: activeClientId,
      p_login_pin: activePin,
    });

    if (error) {
      alert(error.message);
      setPriceList([]);
      setPriceLoading(false);
      return;
    }

    const normalized = ((data ?? []) as PriceListRpcRow[]).map((row, index) =>
      normalizePriceRow(row, index)
    );

    setPriceList(normalized);
    setPriceLoading(false);
  }

  async function refreshData() {
    await Promise.all([loadReports(), loadPriceList()]);
  }

  function logoutClient() {
    setClient(null);
    setReports([]);
    setPriceList([]);
    setSearch("");
    setClientCode("");
    setLoginPin("");
    setActiveTab("reports");
  }

  const filteredReports = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q || activeTab !== "reports") return reports;

    return reports.filter((report) =>
      [
        report.patient_name,
        report.patient_mobile,
        report.test_name,
        report.reference_number,
        report.report_status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [reports, search, activeTab]);

  const groupedReports = useMemo(() => {
    const map = new Map<string, ReportGroup>();

    filteredReports.forEach((report) => {
      const patientKey = `${report.patient_name}-${report.patient_mobile}`;

      if (!map.has(patientKey)) {
        map.set(patientKey, {
          patientKey,
          patientName: report.patient_name || "Patient",
          patientMobile: report.patient_mobile || "No mobile",
          reports: [],
        });
      }

      map.get(patientKey)?.reports.push(report);
    });

    return Array.from(map.values());
  }, [filteredReports]);

  const filteredPriceList = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q || activeTab !== "priceList") return priceList;

    return priceList.filter((item) =>
      [
        item.product,
        item.vials,
        item.category,
        item.reportingTime,
        item.clientRate,
        item.mrp,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [priceList, search, activeTab]);

  if (!client) {
    return (
      <main className="min-h-screen bg-[#f5f9ff] px-5 py-10 text-[#07142f]">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-xl">
          <Link
            href="/"
            className="mb-8 flex items-center gap-3 font-bold text-[#0754dc]"
          >
            <FaHome />
            Back to Home
          </Link>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#eef5ff] text-4xl text-[#0754dc]">
              <FaBuilding />
            </div>

            <h1 className="text-4xl font-extrabold">Client Portal</h1>

            <p className="mt-3 text-slate-500">
              Login to view price list and download patient report PDFs.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-bold text-slate-600">
                Client Code
              </label>

              <input
                value={clientCode}
                onChange={(event) => setClientCode(event.target.value)}
                placeholder="Enter client code"
                className="w-full rounded-2xl border border-slate-200 p-4 text-lg font-bold outline-none focus:border-[#0754dc]"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-600">
                Login PIN
              </label>

              <input
                type="password"
                value={loginPin}
                onChange={(event) => setLoginPin(event.target.value)}
                placeholder="Enter PIN"
                className="w-full rounded-2xl border border-slate-200 p-4 text-lg font-bold outline-none focus:border-[#0754dc]"
              />
            </div>

            <button
              type="button"
              onClick={loginClient}
              disabled={loginLoading}
              className="w-full rounded-2xl bg-[#0754dc] px-6 py-4 text-lg font-extrabold text-white disabled:bg-slate-300"
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#0754dc]">
              Client Portal
            </p>

            <h1 className="text-3xl font-extrabold">{getClientName(client)}</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshData}
              className="flex items-center gap-2 rounded-xl bg-[#eef5ff] px-5 py-3 font-bold text-[#0754dc]"
            >
              <FaRedo />
              Refresh
            </button>

            <button
              type="button"
              onClick={logoutClient}
              className="flex items-center gap-2 rounded-xl bg-[#e71935] px-5 py-3 font-bold text-white"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-10">
        <div className="mb-8 rounded-[32px] bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab("reports");
                setSearch("");
              }}
              className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
                activeTab === "reports"
                  ? "bg-[#0754dc] text-white"
                  : "bg-[#eef5ff] text-[#0754dc]"
              }`}
            >
              <FaFileMedical className="mr-2 inline" />
              Reports
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("priceList");
                setSearch("");
              }}
              className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
                activeTab === "priceList"
                  ? "bg-[#0754dc] text-white"
                  : "bg-[#eef5ff] text-[#0754dc]"
              }`}
            >
              <FaTable className="mr-2 inline" />
              Test Price List
            </button>
          </div>

          <h2 className="text-4xl font-extrabold">
            {activeTab === "reports" ? "Patient Reports" : "Client Test Price List"}
          </h2>

          <p className="mt-3 text-lg font-semibold text-slate-500">
            {activeTab === "reports"
              ? "Download report PDFs uploaded by Cytocare."
              : "View Cytocare client/lab rates and patient MRP list."}
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4">
            <FaSearch className="text-[#0754dc]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeTab === "reports"
                  ? "Search patient name, mobile, test name or reference number..."
                  : "Search test name, category, vial or price..."
              }
              className="w-full bg-transparent text-lg font-bold text-[#07142f] outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {activeTab === "reports" && (
          <>
            {reportsLoading ? (
              <div className="rounded-3xl bg-white p-10 text-center text-xl font-extrabold shadow-sm">
                Loading reports...
              </div>
            ) : groupedReports.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <FaFileMedical className="mx-auto text-6xl text-[#0754dc]" />

                <h3 className="mt-6 text-2xl font-extrabold">
                  No reports uploaded yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-slate-500">
                  Reports will appear here after Cytocare admin uploads PDFs for
                  this client.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedReports.map((group) => (
                  <div
                    key={group.patientKey}
                    className="rounded-[32px] bg-white p-7 shadow-sm"
                  >
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="flex items-center gap-3 text-3xl font-extrabold">
                          <FaUser className="text-[#0754dc]" />
                          {group.patientName}
                        </h3>

                        <p className="mt-2 flex items-center gap-2 font-bold text-slate-500">
                          <FaPhoneAlt />
                          {group.patientMobile}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#eafbff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                        {group.reports.length} Report
                        {group.reports.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {group.reports.map((report) => (
                        <div
                          key={report.report_id}
                          className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5"
                        >
                          <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                            Ref: {report.reference_number}
                          </p>

                          <h4 className="min-h-[56px] text-xl font-extrabold">
                            {report.test_name}
                          </h4>

                          <p className="mt-3 text-sm font-bold text-slate-500">
                            Uploaded:{" "}
                            {formatDate(
                              report.report_uploaded_at ?? report.booking_date
                            )}
                          </p>
<div className="mt-5 rounded-2xl bg-white p-4">
  <a
    href={report.report_url}
    target="_blank"
    rel="noreferrer"
    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0754dc] px-5 py-3 font-extrabold text-white"
  >
    <FaDownload />
    Download PDF
  </a>

  <div className="mt-4">
    <label className="mb-2 block text-sm font-extrabold text-slate-500">
      Send report to WhatsApp
    </label>

    <input
      value={reportWhatsappNumbers[report.report_id] ?? ""}
      onChange={(event) =>
        updateReportWhatsappNumber(report.report_id, event.target.value)
      }
      placeholder="Enter WhatsApp mobile number"
      className="w-full rounded-xl border border-slate-200 p-3 font-bold text-[#07142f] outline-none focus:border-[#05a832]"
    />

    <button
      type="button"
      onClick={() => sendReportOnWhatsapp(report)}
      className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-[#05a832] px-5 py-3 font-extrabold text-white"
    >
      <FaWhatsapp />
      Send Report on WhatsApp
    </button>
  </div>
</div>               </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "priceList" && (
          <>
            {priceLoading ? (
              <div className="rounded-3xl bg-white p-10 text-center text-xl font-extrabold shadow-sm">
                Loading price list...
              </div>
            ) : filteredPriceList.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <FaTable className="mx-auto text-6xl text-[#0754dc]" />

                <h3 className="mt-6 text-2xl font-extrabold">
                  No price list found
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-slate-500">
                  Client price list will appear here after it is added in
                  Supabase.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h3 className="text-2xl font-extrabold">
                    {filteredPriceList.length} Tests Available
                  </h3>

                  <p className="mt-2 text-sm font-bold text-slate-500">
                    Client rates are visible only after client login.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full border-collapse">
                    <thead>
                      <tr className="bg-[#07142f] text-left text-sm text-white">
                        <th className="px-5 py-4">Test Name</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Vial</th>
                        <th className="px-5 py-4">Client Rate</th>
                        <th className="px-5 py-4">MRP</th>
                        <th className="px-5 py-4">Reporting Time</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPriceList.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100 align-top"
                        >
                          <td className="px-5 py-4 font-extrabold text-[#07142f]">
                            {item.product}
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600">
                            {item.category || "Not added"}
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600">
                            {item.vials || "Not added"}
                          </td>

                          <td className="px-5 py-4 text-lg font-extrabold text-[#0754dc]">
                            {rupees(item.clientRate)}
                          </td>

                          <td className="px-5 py-4 text-lg font-extrabold text-[#07142f]">
                            {rupees(item.mrp)}
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600">
                            {item.reportingTime || "Not added"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}