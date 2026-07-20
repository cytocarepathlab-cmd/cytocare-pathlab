"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaFileMedical, FaUpload } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type PatientProfile = {
  full_name: string;
  phone: string;
  email: string;
};

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export default function UploadPrescriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPatient() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      setUser(data.user);

      const { data: profileData } = await supabase
        .from("patient_profiles")
        .select("full_name, phone, email")
        .eq("id", data.user.id)
        .maybeSingle();

      setProfile({
        full_name:
          profileData?.full_name ||
          data.user.user_metadata?.full_name ||
          "Patient",
        phone: profileData?.phone || data.user.user_metadata?.phone || "",
        email: profileData?.email || data.user.email || "",
      });

      setLoading(false);
    }

    loadPatient();
  }, []);

  function handleFileChange(file: File | null) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setErrorMessage("Only PDF, JPG, JPEG and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setErrorMessage("Prescription file must be less than 2 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function uploadPrescription() {
    if (!user || !profile) {
      setErrorMessage("Please login again.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select a prescription file.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user.id);
    formData.append("patientName", profile.full_name);
    formData.append("patientEmail", profile.email);
    formData.append("patientPhone", profile.phone || "");
    formData.append("notes", notes);

    const response = await fetch("/api/upload-prescription", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setUploading(false);

    if (!response.ok || !result.success) {
      setErrorMessage(result.message || "Prescription upload failed.");
      return;
    }

    setSelectedFile(null);
    setNotes("");
    setSuccessMessage(result.message);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f9ff] px-4 py-10 text-[#07142f]">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-md">
          Loading prescription upload page...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] px-4 py-10 text-[#07142f]">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="mb-6 flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#07142f] shadow-sm"
        >
          <FaArrowLeft />
          Back to Home
        </button>

        <div className="overflow-hidden rounded-[34px] bg-white shadow-xl">
          <div className="bg-gradient-to-r from-[#0754dc] to-[#07142f] p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                <FaFileMedical />
              </div>

              <div>
                <h1 className="text-4xl font-extrabold">
                  Upload Prescription
                </h1>
                <p className="mt-2 text-white/80">
                  Upload your prescription. Our team will review it and guide
                  you for the required tests.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-[#f8fbff] p-8 text-center">
                <FaUpload className="mx-auto text-5xl text-[#0754dc]" />

                <h2 className="mt-5 text-2xl font-extrabold">
                  Select prescription file
                </h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  Accepted formats: PDF, JPG, JPEG, PNG. Maximum size:{" "}
                  {MAX_FILE_SIZE_MB} MB.
                </p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                  className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-4 font-bold"
                />

                {selectedFile && (
                  <div className="mt-5 rounded-2xl bg-white p-4 text-left shadow-sm">
                    <p className="font-extrabold text-[#07142f]">
                      Selected file
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-500">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="mb-2 block font-extrabold">
                  Notes for lab team optional
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Example: Doctor has suggested thyroid test and sugar test..."
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 font-semibold outline-none focus:border-[#0754dc]"
                />
              </div>

              {errorMessage && (
                <div className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-600">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mt-5 flex gap-3 rounded-2xl bg-green-50 p-4 font-bold text-green-700">
                  <FaCheckCircle className="mt-1 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={uploadPrescription}
                disabled={uploading}
                className="mt-6 w-full rounded-2xl bg-[#0754dc] px-6 py-5 text-xl font-extrabold text-white shadow-md transition hover:bg-[#0648bd] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {uploading ? "Uploading..." : "Upload Prescription"}
              </button>
            </div>

            <div className="rounded-3xl bg-[#f8fbff] p-6">
              <h3 className="text-2xl font-extrabold">What happens next?</h3>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-extrabold">1. Prescription uploaded</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Your uploaded prescription is saved securely.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-extrabold">2. Lab team reviews</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Cytocare team checks the prescription and required tests.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-extrabold">3. Patient guidance</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Our team will call/WhatsApp you and guide you for booking.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-extrabold">4. Stored for 1 year</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Prescription will be available in My Prescriptions for 1
                    year.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Logged in patient
                </p>

                <p className="mt-2 font-extrabold">{profile?.full_name}</p>
                <p className="text-sm font-semibold text-slate-500">
                  {profile?.phone || "Phone not saved"}
                </p>
                <p className="break-all text-sm font-semibold text-slate-500">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}