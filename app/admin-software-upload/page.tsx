"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { FaFileExcel, FaUpload, FaCheckCircle } from "react-icons/fa";

type SoftwarePatientRow = {
  bill_date: string | null;
  accession_number: string;
  patient_name: string;
  sample_by: string;
  referred_by: string;
  total_amount: number;
  discount_amount: number;
  net_amount: number;
  paid_amount: number;
  balance_amount: number;
  source_file_name: string;
};

function normalizeHeader(value: string) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function getValue(row: Record<string, any>, possibleNames: string[]) {
  const keys = Object.keys(row);

  for (const name of possibleNames) {
    const foundKey = keys.find(
      (key) => normalizeHeader(key) === normalizeHeader(name)
    );

    if (foundKey) {
      return row[foundKey];
    }
  }

  return "";
}

function toNumber(value: any) {
  const clean = String(value ?? "")
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .trim();

  const number = Number(clean);
  return Number.isFinite(number) ? number : 0;
}

function toDate(value: any) {
  if (!value) return null;

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;

    const year = parsed.y;
    const month = String(parsed.m).padStart(2, "0");
    const day = String(parsed.d).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const text = String(value).trim();

  if (text.includes(".")) {
    const [day, month, year] = text.split(".");
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  if (text.includes("/")) {
    const [day, month, year] = text.split("/");
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

export default function AdminSoftwareUploadPage() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<SoftwarePatientRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileUpload(file: File) {
    setMessage("");
    setFileName(file.name);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
  defval: "",
  range: 1,
});
    const mappedRows: SoftwarePatientRow[] = jsonRows
      .map((row) => {
        const pcode = String(
          getValue(row, ["PCode", "PatientCode", "AccessionNo", "AccessionNumber"])
        ).trim();

        const pname = String(getValue(row, ["PName", "PatientName", "Name"])).trim();

        return {
          bill_date: toDate(getValue(row, ["BillDate", "Date"])),
          accession_number: pcode,
          patient_name: pname,
          sample_by: String(getValue(row, ["SampleBy"])).trim(),
          referred_by: String(getValue(row, ["RefByName", "RefBy", "Doctor"])).trim(),
          total_amount: toNumber(getValue(row, ["TotalAmt", "Total"])),
          discount_amount: toNumber(getValue(row, ["TotDisAmt", "Discount"])),
          net_amount: toNumber(getValue(row, ["NetAmt", "NetAmount"])),
          paid_amount: toNumber(getValue(row, ["Paid", "PaidAmt"])),
          balance_amount: toNumber(getValue(row, ["Balance", "BalAmt"])),
          source_file_name: file.name,
        };
      })
      .filter((row) => row.accession_number && row.patient_name);

    setRows(mappedRows);

    if (mappedRows.length === 0) {
      setMessage("No valid rows found. Please check if Excel has PCode and PName columns.");
    } else {
      setMessage(`${mappedRows.length} patient rows ready to import.`);
    }
  }

  async function saveToSupabase() {
    if (rows.length === 0) {
      alert("Please upload Excel file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const { error } = await supabase.from("cytocare_software_patients").upsert(
      rows.map((row) => ({
        ...row,
        updated_at: new Date().toISOString(),
      })),
      {
        onConflict: "accession_number",
      }
    );

    setUploading(false);

    if (error) {
      setMessage(error.message);
      alert(error.message);
      return;
    }

    setMessage(`Successfully imported ${rows.length} patient rows.`);
    alert(`Successfully imported ${rows.length} patient rows.`);
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl text-green-700">
              <FaFileExcel />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-[#07142f]">
                Upload Software Excel
              </h1>
              <p className="mt-1 text-slate-600">
                Import old lab software billing data using PCode as accession number.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-6">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
              <FaUpload className="text-3xl text-[#0754dc]" />
              <p className="text-lg font-bold text-[#07142f]">
                Select Excel File
              </p>
              <p className="text-sm text-slate-600">
                Accepted: .xls, .xlsx, .csv
              </p>

              <input
                type="file"
                accept=".xls,.xlsx,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </div>

          {fileName && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
              Selected file: {fileName}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-[#0754dc]">
              {message}
            </div>
          )}

          {rows.length > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#07142f]">
                  Preview: {rows.length} rows
                </h2>

                <button
                  type="button"
                  onClick={saveToSupabase}
                  disabled={uploading}
                  className="rounded-2xl bg-[#0754dc] px-6 py-3 font-extrabold text-white disabled:opacity-60"
                >
                  {uploading ? "Importing..." : "Import to Website"}
                </button>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3">Bill Date</th>
                      <th className="p-3">PCode / Accession</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">SampleBy</th>
                      <th className="p-3">RefBy</th>
                      <th className="p-3">Net</th>
                      <th className="p-3">Paid</th>
                      <th className="p-3">Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.slice(0, 20).map((row) => (
                      <tr key={row.accession_number} className="border-t">
                        <td className="p-3">{row.bill_date || "-"}</td>
                        <td className="p-3 font-bold text-[#0754dc]">
                          {row.accession_number}
                        </td>
                        <td className="p-3">{row.patient_name}</td>
                        <td className="p-3">{row.sample_by}</td>
                        <td className="p-3">{row.referred_by}</td>
                        <td className="p-3">₹{row.net_amount}</td>
                        <td className="p-3">₹{row.paid_amount}</td>
                        <td className="p-3">₹{row.balance_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 20 && (
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Showing first 20 rows only. All {rows.length} rows will be imported.
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-green-700">
                <FaCheckCircle />
                <p className="text-sm font-bold">
                  PCode will be saved as accession_number for report matching.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}