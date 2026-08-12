"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaFilePdf,
  FaSearch,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  client_code: string;
  client_name: string;
  whatsapp: string | null;
  email: string | null;
  status: string;
};

type UploadedReport = {
  id: string;
  client_id: string;
  file_name: string;
  report_url: string;
  object_key: string | null;
  file_size: number | null;
  updated_at: string | null;
};

export default function ClientReportUploadsSection() {
  const [clients, setClients] =
    useState<Client[]>([]);

  const [uploadedReports, setUploadedReports] =
    useState<UploadedReport[]>([]);

  const [search, setSearch] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState<Record<string, File[]>>({});

  const [selectedReportDates, setSelectedReportDates] =
    useState<Record<string, string>>({});

  const [uploadingClientId, setUploadingClientId] =
    useState("");

  const [deletingReportId, setDeletingReportId] =
    useState("");

  const [uploadMessages, setUploadMessages] =
    useState<
      Record<
        string,
        {
          type: "success" | "error";
          text: string;
        }
      >
    >({});

  const inputRefs =
    useRef<Record<string, HTMLInputElement | null>>(
      {}
    );

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const { data, error } = await supabase
      .from("cytocare_clients")
      .select(
        "id, client_code, client_name, whatsapp, email, status"
      )
      .order("client_name", {
        ascending: true,
      });

    if (error) {
      alert(error.message);
      return;
    }

    const loadedClients =
      (data ?? []) as Client[];

    setClients(loadedClients);

    const {
      data: reportData,
      error: reportError,
    } = await supabase
      .from("cytocare_client_uploaded_reports")
      .select(
        "id, client_id, file_name, report_url, object_key, file_size, updated_at"
      )
      .order("updated_at", {
        ascending: false,
      });

    if (reportError) {
      console.error(
        "Client uploaded reports error:",
        reportError.message
      );
      setUploadedReports([]);
      return;
    }

    setUploadedReports(
      (reportData ?? []) as UploadedReport[]
    );
  }

  function getClientReports(clientId: string) {
    return uploadedReports.filter(
      (report) => report.client_id === clientId
    );
  }

  function getReportDateKey(
    value: string | null | undefined
  ) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDateOnly(
    dateKey: string
  ) {
    if (!dateKey) {
      return "Select date";
    }

    const [year, month, day] =
      dateKey.split("-").map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(
    value: string | null | undefined
  ) {
    if (!value) {
      return "Date not available";
    }

    return new Date(value).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatFileSize(
    bytes: number | null | undefined
  ) {
    const size = Number(bytes ?? 0);

    if (size <= 0) {
      return "Size not available";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      1024 /
      1024
    ).toFixed(2)} MB`;
  }

  function getClientReportDates(
    clientId: string
  ) {
    const dates = Array.from(
      new Set(
        getClientReports(clientId)
          .map((report) =>
            getReportDateKey(
              report.updated_at
            )
          )
          .filter(Boolean)
      )
    );

    return dates.sort(
      (a, b) =>
        b.localeCompare(a)
    );
  }

  function getReportsForSelectedDate(
    clientId: string
  ) {
    const selectedDate =
      selectedReportDates[
        clientId
      ];

    if (!selectedDate) {
      return [];
    }

    return getClientReports(
      clientId
    ).filter(
      (report) =>
        getReportDateKey(
          report.updated_at
        ) === selectedDate
    );
  }

  function getReportCountForDate(
    clientId: string,
    dateKey: string
  ) {
    return getClientReports(
      clientId
    ).filter(
      (report) =>
        getReportDateKey(
          report.updated_at
        ) === dateKey
    ).length;
  }

  const filteredClients = useMemo(() => {
    const q =
      search.toLowerCase().trim();

    if (!q) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.client_name,
        client.client_code,
        client.whatsapp ?? "",
        client.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, search]);

  function selectFiles(
    clientId: string,
    files: FileList | null
  ) {
    if (!files) {
      return;
    }

    const pdfFiles =
      Array.from(files).filter(
        (file) =>
          file.type ===
            "application/pdf" ||
          file.name
            .toLowerCase()
            .endsWith(".pdf")
      );

    if (!pdfFiles.length) {
      setUploadMessages((prev) => ({
        ...prev,
        [clientId]: {
          type: "error",
          text:
            "Please select PDF reports only.",
        },
      }));

      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [clientId]:
        pdfFiles,
    }));

    setUploadMessages((prev) => {
      const next = {
        ...prev,
      };

      delete next[
        clientId
      ];

      return next;
    });
  }

  async function uploadReports(
    client: Client
  ) {
    const files =
      selectedFiles[
        client.id
      ] ?? [];

    if (!files.length) {
      alert(
        "Please select one or more PDF reports."
      );
      return;
    }

    setUploadingClientId(
      client.id
    );

    setUploadMessages((prev) => ({
      ...prev,
      [client.id]: {
        type: "success",
        text:
          `Uploading ${files.length} report(s)...`,
      },
    }));

    try {
      const {
        data: sessionData,
      } =
        await supabase.auth.getSession();

      const token =
        sessionData.session?.access_token;

      if (!token) {
        throw new Error(
          "Admin session not found."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "clientId",
        client.id
      );

      files.forEach(
        (file) => {
          formData.append(
            "files",
            file
          );
        }
      );

      const response =
        await fetch(
          "/api/upload-client-reports",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Upload failed."
        );
      }

      setUploadMessages((prev) => ({
        ...prev,
        [client.id]: {
          type: "success",
          text:
            `${result.uploaded} report(s) uploaded successfully.`,
        },
      }));

      setSelectedFiles((prev) => ({
        ...prev,
        [client.id]: [],
      }));

      if (
        inputRefs.current[
          client.id
        ]
      ) {
        inputRefs.current[
          client.id
        ]!.value = "";
      }

      await loadClients();

      // Automatically select today's date after upload
      const today =
        getReportDateKey(
          new Date().toISOString()
        );

      setSelectedReportDates(
        (prev) => ({
          ...prev,
          [client.id]:
            today,
        })
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Upload failed.";

      setUploadMessages((prev) => ({
        ...prev,
        [client.id]: {
          type: "error",
          text: message,
        },
      }));
    }

    setUploadingClientId(
      ""
    );
  }

  async function deleteReport(
    client: Client,
    report: UploadedReport
  ) {
    const confirmed =
      window.confirm(
        `Delete "${report.file_name}"?\n\nThis will remove the PDF from the client portal and Cloudflare storage.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingReportId(
      report.id
    );

    try {
      const {
        data: sessionData,
      } =
        await supabase.auth.getSession();

      const token =
        sessionData.session?.access_token;

      if (!token) {
        throw new Error(
          "Admin session not found."
        );
      }

      const response =
        await fetch(
          "/api/delete-client-report",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify(
              {
                reportId:
                  report.id,
              }
            ),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to delete report."
        );
      }

      setUploadedReports(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !==
              report.id
          )
      );

      setUploadMessages((prev) => ({
        ...prev,
        [client.id]: {
          type: "success",
          text:
            `"${report.file_name}" deleted successfully.`,
        },
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete report.";

      setUploadMessages((prev) => ({
        ...prev,
        [client.id]: {
          type: "error",
          text:
            message,
        },
      }));
    }

    setDeletingReportId(
      ""
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-extrabold uppercase text-[#0754dc]">
            Client Reports
          </p>

          <h2 className="mt-1 text-4xl font-extrabold">
            Client Report Uploads
          </h2>

          <p className="mt-2 font-semibold text-slate-500">
            Upload, view and delete PDF reports
            for each client.
          </p>
        </div>

        <button
          type="button"
          onClick={loadClients}
          className="rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white"
        >
          Refresh
        </button>
      </div>

      <div className="mb-8 rounded-3xl bg-white p-6 shadow-md">
        <div className="relative">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0754dc]" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search client name, code, phone or email..."
            className="w-full rounded-2xl border border-slate-200 py-4 pl-14 pr-5 text-lg font-bold outline-none focus:border-[#0754dc]"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredClients.map(
          (client) => {
            const files =
              selectedFiles[
                client.id
              ] ?? [];

            const message =
              uploadMessages[
                client.id
              ];

            const uploading =
              uploadingClientId ===
              client.id;

            const clientReports =
              getClientReports(
                client.id
              );

            const availableDates =
              getClientReportDates(
                client.id
              );

            const reportsForDate =
              getReportsForSelectedDate(
                client.id
              );

            return (
              <div
                key={client.id}
                className="rounded-[30px] bg-white p-7 shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-2xl text-[#0754dc]">
                      <FaBuilding />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-extrabold">
                          {
                            client.client_name
                          }
                        </h3>

                        <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                          {
                            client.client_code
                          }
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                            client.status ===
                            "active"
                              ? "bg-[#eafff0] text-[#05a832]"
                              : "bg-[#fff0f3] text-[#e71935]"
                          }`}
                        >
                          {
                            client.status
                          }
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-sm font-semibold text-slate-500">
                        {client.whatsapp && (
                          <p>
                            WhatsApp:{" "}
                            {
                              client.whatsapp
                            }
                          </p>
                        )}

                        {client.email && (
                          <p>
                            Email:{" "}
                            {
                              client.email
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f8fbff] px-6 py-4 text-center">
                    <p className="text-xs font-extrabold uppercase text-slate-500">
                      Reports
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-[#0754dc]">
                      {
                        clientReports.length
                      }
                    </p>
                  </div>
                </div>

                {/* FILE UPLOAD */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <input
                    ref={(element) => {
                      inputRefs.current[
                        client.id
                      ] =
                        element;
                    }}
                    type="file"
                    accept="application/pdf,.pdf"
                    multiple
                    onChange={(e) =>
                      selectFiles(
                        client.id,
                        e.target.files
                      )
                    }
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        inputRefs.current[
                          client.id
                        ]?.click()
                      }
                      disabled={
                        uploading
                      }
                      className="flex items-center gap-3 rounded-xl border-2 border-[#0754dc] px-6 py-3 font-extrabold text-[#0754dc]"
                    >
                      <FaFilePdf />
                      Select PDF Reports
                    </button>

                    {files.length >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          uploadReports(
                            client
                          )
                        }
                        disabled={
                          uploading
                        }
                        className="flex items-center gap-3 rounded-xl bg-[#0754dc] px-6 py-3 font-extrabold text-white disabled:bg-slate-300"
                      >
                        <FaUpload />

                        {uploading
                          ? "Uploading..."
                          : `Upload ${files.length} Report${
                              files.length >
                              1
                                ? "s"
                                : ""
                            }`}
                      </button>
                    )}
                  </div>

                  {files.length >
                    0 && (
                    <div className="mt-5 rounded-2xl bg-[#f8fbff] p-5">
                      <p className="mb-3 font-extrabold">
                        {files.length} PDF
                        {files.length >
                        1
                          ? "s"
                          : ""}{" "}
                        selected
                      </p>

                      <div className="max-h-[220px] space-y-2 overflow-y-auto">
                        {files.map(
                          (
                            file,
                            index
                          ) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3"
                            >
                              <FaFilePdf className="shrink-0 text-[#e71935]" />

                              <span className="min-w-0 truncate text-sm font-bold">
                                {
                                  file.name
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {message && (
                    <div
                      className={`mt-5 flex items-start gap-3 rounded-2xl p-4 font-bold ${
                        message.type ===
                        "success"
                          ? "bg-[#eafff0] text-[#057a28]"
                          : "bg-[#fff0f3] text-[#e71935]"
                      }`}
                    >
                      {message.type ===
                      "success" ? (
                        <FaCheckCircle className="mt-1 shrink-0" />
                      ) : (
                        <FaExclamationTriangle className="mt-1 shrink-0" />
                      )}

                      {
                        message.text
                      }
                    </div>
                  )}
                </div>

                {/* REPORT HISTORY */}
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                      <h4 className="text-xl font-extrabold text-[#07142f]">
                        Report History
                      </h4>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Select a date to view reports uploaded on that day.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                      {
                        clientReports.length
                      }{" "}
                      Total PDF
                      {clientReports.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  {clientReports.length ===
                  0 ? (
                    <div className="mt-5 rounded-2xl bg-[#fff8df] p-4 text-sm font-bold text-[#7a4f00]">
                      No reports uploaded for this client yet.
                    </div>
                  ) : (
                    <>
                      <div className="mt-5 max-w-md">
                        <label className="mb-2 block text-sm font-extrabold text-slate-500">
                          Select Report Date
                        </label>

                        <select
                          value={
                            selectedReportDates[
                              client.id
                            ] ?? ""
                          }
                          onChange={(e) =>
                            setSelectedReportDates(
                              (prev) => ({
                                ...prev,
                                [client.id]:
                                  e.target.value,
                              })
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white p-4 font-extrabold outline-none focus:border-[#0754dc]"
                        >
                          <option value="">
                            Select date
                          </option>

                          {availableDates.map(
                            (
                              dateKey
                            ) => (
                              <option
                                key={
                                  dateKey
                                }
                                value={
                                  dateKey
                                }
                              >
                                {formatDateOnly(
                                  dateKey
                                )}{" "}
                                —{" "}
                                {getReportCountForDate(
                                  client.id,
                                  dateKey
                                )}{" "}
                                PDF
                                {getReportCountForDate(
                                  client.id,
                                  dateKey
                                ) ===
                                1
                                  ? ""
                                  : "s"}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {!selectedReportDates[
                        client.id
                      ] && (
                        <div className="mt-5 rounded-2xl bg-[#eef5ff] p-5 font-bold text-[#0754dc]">
                          Select a report date to view PDFs.
                        </div>
                      )}

                      {selectedReportDates[
                        client.id
                      ] &&
                        reportsForDate.length ===
                          0 && (
                          <div className="mt-5 rounded-2xl bg-[#fff8df] p-5 font-bold text-[#7a4f00]">
                            No reports found for the selected date.
                          </div>
                        )}

                      {reportsForDate.length >
                        0 && (
                        <div className="mt-5">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h5 className="text-lg font-extrabold">
                              {
                                reportsForDate.length
                              }{" "}
                              Report
                              {reportsForDate.length ===
                              1
                                ? ""
                                : "s"}
                            </h5>

                            <span className="rounded-full bg-[#eafff0] px-4 py-2 text-sm font-extrabold text-[#057a28]">
                              {formatDateOnly(
                                selectedReportDates[
                                  client.id
                                ]
                              )}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {reportsForDate.map(
                              (
                                report
                              ) => {
                                const deleting =
                                  deletingReportId ===
                                  report.id;

                                return (
                                  <div
                                    key={
                                      report.id
                                    }
                                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-[#f8fbff] p-4"
                                  >
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0f3] text-[#e71935]">
                                        <FaFilePdf />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="break-all font-extrabold text-[#07142f]">
                                          {
                                            report.file_name
                                          }
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                          Uploaded:{" "}
                                          {formatDateTime(
                                            report.updated_at
                                          )}
                                          {" • "}
                                          {formatFileSize(
                                            report.file_size
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <a
                                        href={
                                          report.report_url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-xl bg-[#0754dc] px-4 py-3 text-sm font-extrabold text-white"
                                      >
                                        <FaEye />
                                        View PDF
                                      </a>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteReport(
                                            client,
                                            report
                                          )
                                        }
                                        disabled={
                                          deleting
                                        }
                                        className="flex items-center gap-2 rounded-xl bg-[#e71935] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                                      >
                                        <FaTrash />

                                        {deleting
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          }
        )}

        {filteredClients.length ===
          0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-md">
            <h3 className="text-2xl font-extrabold">
              No clients found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}