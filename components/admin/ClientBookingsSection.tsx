"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaFileMedical,
  FaPhoneAlt,
  FaPlus,
  FaRedo,
  FaSave,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type ClientRow = {
  id: string;
  client_name?: string | null;
  name?: string | null;
  lab_name?: string | null;
  client_code?: string | null;
  phone?: string | null;
  mobile?: string | null;
};

type ClientReportRow = {
  id: string;
  client_id: string;
  patient_name: string;
  patient_mobile: string;
  test_name: string;
  reference_number: string;
  report_url: string;
  report_status: string;
  report_uploaded_at: string | null;
  created_at: string | null;
};

type ReportForm = {
  patientName: string;
  referenceNumber: string;
  reportUrl: string;
};

const emptyReportForm: ReportForm = {
  patientName: "",
  referenceNumber: "",
  reportUrl: "",
};

export default function ClientBookingsSection() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [reports, setReports] = useState<ClientReportRow[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingClientId, setSavingClientId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, ReportForm>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: clientsData, error: clientsError } = await supabase
      .from("cytocare_clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientsError) {
      alert(clientsError.message);
      setLoading(false);
      return;
    }

    const { data: reportsData, error: reportsError } = await supabase.rpc(
      "admin_get_all_client_reports"
    );

    if (reportsError) {
      alert(reportsError.message);
      setReports([]);
    } else {
      setReports((reportsData ?? []) as ClientReportRow[]);
    }

    setClients((clientsData ?? []) as ClientRow[]);
    setLoading(false);
  }

  function getClientName(client: ClientRow) {
    return client.client_name || client.lab_name || client.name || "Unnamed Client";
  }

  function getClientPhone(client: ClientRow) {
    return client.phone || client.mobile || "No phone";
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

  function getClientReports(clientId: string) {
    return reports.filter((report) => report.client_id === clientId);
  }

  function getForm(clientId: string) {
    return forms[clientId] ?? emptyReportForm;
  }

  function updateForm(
    clientId: string,
    field: keyof ReportForm,
    value: string
  ) {
    setForms((prev) => ({
      ...prev,
      [clientId]: {
        ...(prev[clientId] ?? emptyReportForm),
        [field]: value,
      },
    }));
  }

  async function saveReport(client: ClientRow) {
    const form = getForm(client.id);

    if (!form.patientName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    if (!form.reportUrl.trim()) {
      alert("Please paste PDF report link.");
      return;
    }

    setSavingClientId(client.id);

    const { data, error } = await supabase.rpc("admin_create_client_report", {
      p_client_id: client.id,
      p_patient_name: form.patientName.trim(),
      p_patient_mobile: "",
p_test_name: "Lab Report",
      p_reference_number: form.referenceNumber.trim(),
      p_report_url: form.reportUrl.trim(),
    });

    if (error) {
      alert(error.message);
      setSavingClientId(null);
      return;
    }

    const createdReport = Array.isArray(data) ? data[0] : data;

    if (createdReport) {
      setReports((prev) => [createdReport as ClientReportRow, ...prev]);
    }

    setForms((prev) => ({
      ...prev,
      [client.id]: emptyReportForm,
    }));

    setSavingClientId(null);
    alert("Report added successfully.");
  }

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        getClientName(client),
        client.client_code ?? "",
        getClientPhone(client),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, search]);

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-[#07142f]">
            Client Report Uploads
          </h2>

          <p className="mt-2 text-lg font-semibold text-slate-500">
            Add patient name and PDF report link for each client. Clients will
            only see download buttons in their portal.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-2 rounded-2xl bg-[#0754dc] px-6 py-4 font-extrabold text-white shadow-lg"
        >
          <FaRedo />
          Refresh
        </button>
      </div>

      <div className="mb-8 rounded-[28px] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <FaSearch className="text-[#0754dc]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client name, code or phone..."
            className="w-full bg-transparent text-lg font-bold text-[#07142f] outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-[32px] bg-white p-10 text-center text-xl font-extrabold text-[#07142f] shadow-sm">
          Loading clients...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-[32px] bg-white p-10 text-center text-xl font-extrabold text-[#07142f] shadow-sm">
          No clients found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClients.map((client) => {
            const isOpen = selectedClientId === client.id;
            const clientReports = getClientReports(client.id);
            const form = getForm(client.id);

            return (
              <div
                key={client.id}
                className="overflow-hidden rounded-[32px] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setSelectedClientId(isOpen ? null : client.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-5 p-6 text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef5ff] text-2xl text-[#0754dc]">
                      <FaBuilding />
                    </div>

                    <div>
                      <h3 className="text-2xl font-extrabold text-[#07142f]">
                        {getClientName(client)}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
                        <span>Code: {client.client_code || "Not added"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-2">
                          <FaPhoneAlt />
                          {getClientPhone(client)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-2xl bg-[#f8fbff] px-5 py-3 text-center">
                      <p className="text-xs font-extrabold uppercase text-slate-500">
                        Reports
                      </p>

                      <p className="text-2xl font-extrabold text-[#0754dc]">
                        {clientReports.length}
                      </p>
                    </div>

                    <div className="text-2xl text-[#07142f]">
                      {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-[#f8fbff] p-6">
                    <div className="mb-6 rounded-[28px] bg-white p-6 shadow-sm">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eafbff] text-xl text-[#0754dc]">
                          <FaPlus />
                        </div>

                        <div>
                          <h4 className="text-2xl font-extrabold text-[#07142f]">
                            Add Patient Report
                          </h4>

                          <p className="text-sm font-bold text-slate-500">
                            Enter patient name and paste PDF report link.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <InputBox
                          label="Patient Name"
                          value={form.patientName}
                          placeholder="Enter patient name"
                          onChange={(value) =>
                            updateForm(client.id, "patientName", value)
                          }
                        />

                       

                    

                        <InputBox
                          label="Reference Number"
                          value={form.referenceNumber}
                          placeholder="Optional, auto generated if blank"
                          onChange={(value) =>
                            updateForm(client.id, "referenceNumber", value)
                          }
                        />

                        <div className="md:col-span-2">
                          <InputBox
                            label="PDF Report Link"
                            value={form.reportUrl}
                            placeholder="Paste PDF report link here"
                            onChange={(value) =>
                              updateForm(client.id, "reportUrl", value)
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveReport(client)}
                        disabled={savingClientId === client.id}
                        className="mt-5 flex items-center gap-3 rounded-xl bg-[#0754dc] px-6 py-4 font-extrabold text-white disabled:bg-slate-300"
                      >
                        <FaSave />
                        {savingClientId === client.id
                          ? "Saving..."
                          : "Save Report"}
                      </button>
                    </div>

                    <div className="rounded-[28px] bg-white p-6 shadow-sm">
                      <h4 className="mb-5 text-2xl font-extrabold text-[#07142f]">
                        Uploaded Reports
                      </h4>

                      {clientReports.length === 0 ? (
                        <div className="rounded-2xl bg-[#f8fbff] p-6 text-center font-bold text-slate-500">
                          No reports uploaded for this client yet.
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {clientReports.map((report) => (
                            <div
                              key={report.id}
                              className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5"
                            >
                              <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                                Ref: {report.reference_number}
                              </p>

                              <h5 className="flex items-center gap-2 text-xl font-extrabold text-[#07142f]">
                                <FaUser className="text-[#0754dc]" />
                                {report.patient_name}
                              </h5>

                              <p className="mt-2 text-sm font-bold text-slate-500">
                                Mobile: {report.patient_mobile || "Not added"}
                              </p>

                              <p className="mt-3 flex items-center gap-2 font-extrabold text-[#07142f]">
                                <FaFileMedical className="text-[#e71935]" />
                                {report.test_name || "Lab Report"}
                              </p>

                              <p className="mt-3 text-sm font-bold text-slate-500">
                                Uploaded: {formatDate(report.report_uploaded_at)}
                              </p>

                              <a
                                href={report.report_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-[#05a832] px-5 py-3 font-extrabold text-white"
                              >
                                <FaDownload />
                                View PDF
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
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

function InputBox({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-extrabold text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white p-4 font-bold text-[#07142f] outline-none focus:border-[#0754dc]"
      />
    </div>
  );
}