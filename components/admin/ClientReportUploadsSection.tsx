"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaBuilding,
  FaFilePdf,
  FaSearch,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
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

type ReportCount = {
  client_id: string;
};

export default function ClientReportUploadsSection() {
  const [clients, setClients] =
    useState<Client[]>([]);

  const [reportCounts, setReportCounts] =
    useState<Record<string, number>>({});

  const [search, setSearch] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState<Record<string, File[]>>({});

  const [uploadingClientId, setUploadingClientId] =
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

    const { data: reportData } = await supabase
      .from("cytocare_client_uploaded_reports")
      .select("client_id");

    const counts: Record<string, number> = {};

    ((reportData ?? []) as ReportCount[]).forEach(
      (report) => {
        counts[report.client_id] =
          (counts[report.client_id] ?? 0) + 1;
      }
    );

    setReportCounts(counts);
  }

  const filteredClients = useMemo(() => {
    const q =
      search.toLowerCase().trim();

    if (!q) return clients;

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
    if (!files) return;

    const pdfFiles =
      Array.from(files).filter(
        (file) =>
          file.type === "application/pdf" ||
          file.name
            .toLowerCase()
            .endsWith(".pdf")
      );

    if (!pdfFiles.length) {
      setUploadMessages((prev) => ({
        ...prev,

        [clientId]: {
          type: "error",
          text: "Please select PDF reports only.",
        },
      }));

      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [clientId]: pdfFiles,
    }));

    setUploadMessages((prev) => {
      const next = { ...prev };
      delete next[clientId];
      return next;
    });
  }

  async function uploadReports(
    client: Client
  ) {
    const files =
      selectedFiles[client.id] ?? [];

    if (!files.length) {
      alert(
        "Please select one or more PDF reports."
      );

      return;
    }

    setUploadingClientId(client.id);

    setUploadMessages((prev) => ({
      ...prev,

      [client.id]: {
        type: "success",
        text: `Uploading ${files.length} report(s)...`,
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

      const formData = new FormData();

      formData.append(
        "clientId",
        client.id
      );

      files.forEach((file) => {
        formData.append(
          "files",
          file
        );
      });

      const response = await fetch(
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

      if (inputRefs.current[client.id]) {
        inputRefs.current[
          client.id
        ]!.value = "";
      }

      await loadClients();
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

    setUploadingClientId("");
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
            Select a client and upload multiple
            PDF reports directly from your
            computer.
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
              setSearch(e.target.value)
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
                          {client.client_name}
                        </h3>

                        <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
                          {client.client_code}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                            client.status ===
                            "active"
                              ? "bg-[#eafff0] text-[#05a832]"
                              : "bg-[#fff0f3] text-[#e71935]"
                          }`}
                        >
                          {client.status}
                        </span>

                      </div>

                      <div className="mt-3 space-y-1 text-sm font-semibold text-slate-500">

                        {client.whatsapp && (
                          <p>
                            WhatsApp:{" "}
                            {client.whatsapp}
                          </p>
                        )}

                        {client.email && (
                          <p>
                            Email:{" "}
                            {client.email}
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
                      {reportCounts[
                        client.id
                      ] ?? 0}
                    </p>

                  </div>

                </div>

                {/* FILE UPLOAD */}

                <div className="mt-6 border-t border-slate-100 pt-6">

                  <input
                    ref={(element) => {
                      inputRefs.current[
                        client.id
                      ] = element;
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
                      disabled={uploading}
                      className="flex items-center gap-3 rounded-xl border-2 border-[#0754dc] px-6 py-3 font-extrabold text-[#0754dc]"
                    >
                      <FaFilePdf />

                      Select PDF Reports
                    </button>

                    {files.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          uploadReports(
                            client
                          )
                        }
                        disabled={uploading}
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

                  {files.length > 0 && (
                    <div className="mt-5 rounded-2xl bg-[#f8fbff] p-5">

                      <p className="mb-3 font-extrabold">
                        {files.length} PDF
                        {files.length > 1
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
                                {file.name}
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

                      {message.text}

                    </div>
                  )}

                </div>

              </div>
            );
          }
        )}

        {filteredClients.length === 0 && (
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