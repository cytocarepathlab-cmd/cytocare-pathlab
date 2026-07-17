"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaDownload,
  FaFileMedical,
  FaHome,
  FaSearch,
  FaWhatsapp,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type SelfReport = {
  report_id: string;
  patient_name: string;
  reference_number: string;
  report_url: string;
  report_status: string;
  report_uploaded_at: string | null;
};

export default function WalkInReportPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [report, setReport] = useState<SelfReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

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

  async function searchReport() {
    const cleanReference = referenceNumber.trim();

    if (!cleanReference) {
      alert("Please enter your reference number.");
      return;
    }

    setLoading(true);
    setSearched(false);
    setReport(null);

    const { data, error } = await supabase.rpc(
      "public_get_self_report_by_reference",
      {
        p_reference_number: cleanReference,
      }
    );

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const foundReport = Array.isArray(data) ? data[0] : data;

    setReport((foundReport ?? null) as SelfReport | null);
    setSearched(true);
    setLoading(false);
  }

  function sendReportOnWhatsapp() {
    if (!report) return;

    const number = cleanWhatsappNumber(whatsappNumber);

    if (number.length < 10) {
      alert("Please enter a valid WhatsApp mobile number.");
      return;
    }

    const message = encodeURIComponent(
      `Hello,\n\nYour Cytocare report is ready.\n\nPatient: ${report.patient_name}\nReference No: ${report.reference_number}\n\nDownload Report:\n${report.report_url}\n\nRegards,\nCytocare Path Lab`
    );

    window.open(
      `https://wa.me/${number}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 font-bold text-[#0754dc]">
            <FaHome />
            Back to Home
          </Link>

          <p className="font-extrabold text-[#0754dc]">
            CYTOCARE REPORTS
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-14">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#eafbff] text-4xl text-[#0754dc]">
            <FaFileMedical />
          </div>

          <h1 className="text-5xl font-extrabold text-[#07142f]">
            Download Your Report
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold text-slate-500">
            Enter the reference number printed on your bill or receipt to view
            your walk-in lab report.
          </p>
        </div>

        <div className="rounded-[34px] bg-white p-7 shadow-md">
          <label className="mb-3 block text-lg font-extrabold text-[#07142f]">
            Reference Number
          </label>

          <div className="flex flex-col gap-4 md:flex-row">
            <input
              value={referenceNumber}
              onChange={(event) =>
                setReferenceNumber(event.target.value.toUpperCase())
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchReport();
                }
              }}
              placeholder="Example: CYT26071201"
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] p-5 text-xl font-extrabold uppercase outline-none focus:border-[#0754dc]"
            />

            <button
              type="button"
              onClick={searchReport}
              disabled={loading}
              className="flex items-center justify-center gap-3 rounded-2xl bg-[#0754dc] px-8 py-5 text-lg font-extrabold text-white disabled:bg-slate-300"
            >
              <FaSearch />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            Example format: CYT26071201
          </p>
        </div>

        {searched && !report && (
          <div className="mt-8 rounded-[30px] bg-white p-10 text-center shadow-md">
            <FaFileMedical className="mx-auto text-6xl text-slate-300" />

            <h2 className="mt-5 text-3xl font-extrabold text-[#07142f]">
              No report found
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Please check your reference number. If your sample was given
              recently, your report may still be under processing.
            </p>
          </div>
        )}

        {report && (
          <div className="mt-8 rounded-[34px] bg-white p-7 shadow-md">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="inline-flex rounded-full bg-[#eafbff] px-4 py-2 text-sm font-extrabold text-[#0754dc]">
                  Report Ready
                </p>

                <h2 className="mt-4 text-4xl font-extrabold text-[#07142f]">
                  {report.patient_name}
                </h2>

                <p className="mt-2 text-lg font-bold text-slate-500">
                  Reference No: {report.reference_number}
                </p>
              </div>

              <p className="rounded-2xl bg-[#f8fbff] px-5 py-4 text-sm font-bold text-slate-500">
                Uploaded: {formatDate(report.report_uploaded_at)}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <a
                href={report.report_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#0754dc] px-6 py-5 text-lg font-extrabold text-white"
              >
                <FaDownload />
                Download PDF Report
              </a>

              <div className="rounded-2xl bg-[#f8fbff] p-4">
                <label className="mb-2 block text-sm font-extrabold text-slate-500">
                  Send report on WhatsApp
                </label>

                <input
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="Enter WhatsApp mobile number"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 font-bold outline-none focus:border-[#05a832]"
                />

                <button
                  type="button"
                  onClick={sendReportOnWhatsapp}
                  className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-[#05a832] px-5 py-3 font-extrabold text-white"
                >
                  <FaWhatsapp />
                  Send on WhatsApp
                </button>
              </div>
            </div>

            <p className="mt-5 rounded-2xl bg-[#fff8df] p-4 text-sm font-bold text-[#7a4f00]">
              Keep your reference number private. Anyone with this reference
              number may be able to access this report.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
