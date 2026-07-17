"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/constants/site";
import {
  FaBaby,
  FaBone,
  FaBrain,
  FaCalendarAlt,
  FaClinicMedical,
  FaHeartbeat,
  FaLungs,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRupeeSign,
  FaStethoscope,
  FaTimes,
  FaTint,
  FaUserMd,
  FaWhatsapp,
} from "react-icons/fa";
import type { IconType } from "react-icons";

type Doctor = {
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  clinic: string;
  timing: string;
  fee: string;
  bookingNumber: string;
};

const specialties: { name: string; icon: IconType; packageText: string }[] = [
  {
    name: "General Physician",
    icon: FaStethoscope,
    packageText: "Fever, weakness, cough, sugar, BP and general health concerns",
  },
  {
    name: "Dermatologist",
    icon: FaUserMd,
    packageText: "Skin allergy, acne, hair fall, infection and rashes",
  },
  {
    name: "Urologist",
    icon: FaTint,
    packageText: "Urine infection, kidney stone, urinary problems",
  },
  {
    name: "Orthopedic",
    icon: FaBone,
    packageText: "Joint pain, back pain, knee pain and bone problems",
  },
  {
    name: "Gynecologist",
    icon: FaBaby,
    packageText: "Pregnancy, PCOD, periods, women health concerns",
  },
  {
    name: "Pediatrician",
    icon: FaUserMd,
    packageText: "Child fever, growth, vaccination and child health",
  },
  {
    name: "Pulmonologist",
    icon: FaLungs,
    packageText: "Breathing issues, cough, asthma, chest infection and lung-related concern",
  },
  {
    name: "Psychatrist/Neuro",
    icon: FaBrain,
    packageText: "Headache, migraine, nerve pain and neurological concern",
  },
];

const doctors: Doctor[] = [
  {
    name: "Dr. Amit Kumar Singh",
    specialty: "General Physician",
    qualification: "MBBS, MD, DH, SITC-G",
    experience: "12+ years",
    clinic: "Cytocare Path Lab, Sakchi, Jamshedpur",
    timing: "Mon-Sat, 3 PM - 5 PM",
    fee: "₹300",
    bookingNumber: "6203572424",
  },
  {
    name: "Dr.Deep Anurag",
    specialty: "Dermatologist",
    qualification: "MBBS, MD Dermatology",
    experience: "9+ years",
    clinic: "Bistupur, Jamshedpur",
    timing: "Mon-Fri, 5 PM - 8 PM",
    fee: "₹500",
    bookingNumber: "6203572424",
  },
  {
  name: "Dr. Sanjay Jouhary",
  specialty: "Urologist",
  qualification: "MBBS, MS, DNB Urology",
  experience: "9+ years",
  clinic: "Sakchi, Jamshedpur",
  timing: "All day 9 AM - 5 PM",
  fee: "₹700",
  bookingNumber: "6203572424",
},
  {
    name: "Dr. Rohit Kumar",
    specialty: "Orthopedic",
    qualification: "MBBS, MS Ortho, MRCS (UK)",
    experience: "11+ years",
    clinic: "Mango, Jamshedpur",
    timing: "Mon-Sat, 6 PM - 8:30 PM",
    fee: "₹500",
    bookingNumber: "6203572424",
  },
  {
    name: "Dr. Swati Singhal",
    specialty: "Gynecologist",
    qualification: "MBBS, MS Obstetrics & Gynecology",
    experience: "10+ years",
    clinic: "Bistupur, Jamshedpur",
    timing: "Mon-Sat, 4 PM - 7 PM",
    fee: "₹500",
    bookingNumber: "6203572424",
  },
  {
    name: "Dr. Renuka Kumar",
    specialty: "Gynecologist",
    qualification: "MBBS, MS Obstetrics & Gynecology",
    experience: "10+ years",
    clinic: "Sunshine Medicare Opposite Bank Of India, Golmuri, Jamshedpur",
    timing: "Mon-Sat, 11 AM - 2 PM",
    fee: "₹1000",
    bookingNumber: "6203572424",
  },
  {
    name: "Dr. Unmesh Luktuke",
    specialty: "Pediatrician",
    qualification: "MBBS, MD Pediatrics",
    experience: "13+ years",
    clinic: "Thakur Bari Road SNP area Sakchi, Jamshedpur",
    timing: "Mon-Sat, 5 PM - 8 PM",
    fee: "₹500",
    bookingNumber: "6203572424",
  },
  {
    name: "Dr. Ehteshamul Hassan",
    specialty: "Pediatrician",
    qualification: "MBBS, MD Pediatrics, New Born & Child Specialist",
    experience: "10+ years",
    clinic: "Road No.6, In Front Of SK Diagnostics, Jawaharnagar, Mango, Jamshedpur",
    timing: "Mon-Sat, 10:30 AM - 12 PM",
    fee: "₹400",
    bookingNumber: "6203572424",
  },
  {
    name: "Dr. A.k Prusty",
    specialty: "Pulmonologist",
    qualification: "MBBS, MD, DM Cardiology",
    experience: "15+ years",
    clinic: "Kadma main road, Near Surabhi Xerox Uliyan, Jamshedpur",
    timing: "Wed & Sat, 6 PM - 8 PM",
    fee: "₹500",
    bookingNumber: "6203572424",
  },
  {
  name: "Dr. Swati Singh",
  specialty: "Psychatrist/Neuro",
  qualification: "MBBS, DPM,  Neurology",
  experience: "12+ years",
  clinic: "Avni Mindcare, Tiwari Sadan, Baradwari, Jamshedpur",
  timing: "Mon-Sat, 6 PM - 8 PM",
  fee: "₹500",
  bookingNumber: "6203572424",
},
];

export default function DoctorConsultation({
  userEmail,
  onRequireLogin,
  isEliteMember = false,
}: {
  userEmail: string;
  onRequireLogin: () => void;
  isEliteMember?: boolean;
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("General Physician");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    phone: "",
    age: "",
    health_concern: "",
    consultation_mode: "Clinic Visit",
    preferred_date: "",
    preferred_time: "",
  });

  const today = new Date().toISOString().split("T")[0];
  function getNumericFee(fee: string) {
  return Number(fee.replace(/[₹,\s]/g, "")) || 0;
}

function getConsultationPricing(fee: string) {
  const originalFee = getNumericFee(fee);
  const eliteDiscount = isEliteMember ? 50 : 0;
  const finalFee = Math.max(originalFee - eliteDiscount, 0);

  return {
    originalFee,
    eliteDiscount,
    finalFee,
  };
}

  const filteredDoctors = doctors.filter(
    (doctor) => doctor.specialty === selectedSpecialty
  );

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitConsultation(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedDoctor) {
      alert("Please select a doctor.");
      return;
    }

    if (form.patient_name.trim().length < 2) {
      alert("Please enter a valid patient name.");
      return;
    }
if (
  !form.patient_email.includes("@") ||
  !form.patient_email.includes(".")
) {
  alert("Please enter a valid email address.");
  return;
}
    if (form.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

const pricing = getConsultationPricing(selectedDoctor.fee);

const { error } = await supabase.from("doctor_consultations").insert([
      {
        patient_name: form.patient_name.trim(),
        patient_email: form.patient_email.trim(),
        phone: form.phone,
        age: Number(form.age),
        specialty: selectedDoctor.specialty,
        doctor_name: selectedDoctor.name,
        doctor_qualification: selectedDoctor.qualification,
        doctor_clinic: selectedDoctor.clinic,
        doctor_timing: selectedDoctor.timing,
        doctor_booking_number: selectedDoctor.bookingNumber,
        consultation_fee: `₹${pricing.finalFee}`,
original_consultation_fee: pricing.originalFee,
elite_discount: pricing.eliteDiscount,
final_consultation_fee: pricing.finalFee,
elite_discount_applied: pricing.eliteDiscount > 0,
health_concern: form.health_concern,
        consultation_mode: form.consultation_mode,
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Doctor consultation error:", error);
      alert(error.message);
      return;
    }

    const whatsappMessage = `
Hello CytoCare Path Lab,

I want to request doctor consultation.

Doctor Details:
Doctor: ${selectedDoctor.name}
Specialty: ${selectedDoctor.specialty}
Qualification: ${selectedDoctor.qualification}
Clinic: ${selectedDoctor.clinic}
Timing: ${selectedDoctor.timing}
Original Fee: ₹${pricing.originalFee}
Elite Discount: -₹${pricing.eliteDiscount}
Final Payable: ₹${pricing.finalFee}
Booking Number: ${selectedDoctor.bookingNumber}

Patient Details:
Name: ${form.patient_name}
Email: ${form.patient_email}
Phone: ${form.phone}
Age: ${form.age}
Concern: ${form.health_concern}
Preferred Date: ${form.preferred_date}
Preferred Time: ${form.preferred_time}
Mode: ${form.consultation_mode}
`;

    alert("Consultation request submitted successfully!");

    window.open(
      `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        whatsappMessage
      )}`,
      "_blank"
    );

    setForm({
      patient_name: "",
      patient_email: "",
      phone: "",
      age: "",
      health_concern: "",
      consultation_mode: "Clinic Visit",
      preferred_date: "",
      preferred_time: "",
    });

    setSelectedDoctor(null);
  }

  return (
    <section id="doctor-consultation" className="bg-white px-8 py-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 text-center">
          <p className="font-bold text-[#0754dc]">DOCTOR CONSULTATION</p>

          <h2 className="mt-3 text-4xl font-extrabold text-[#07142f] md:text-5xl">
            Consult Trusted Doctors
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-xl leading-8 text-slate-600">
            Select a specialty, choose a doctor, and request consultation.
            Our team will confirm your appointment details.
          </p>
        </div>

        {/* SPECIALTY CARDS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {specialties.map((item) => {
            const Icon = item.icon;
            const active = selectedSpecialty === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedSpecialty(item.name)}
                className={`rounded-3xl p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                  active
                    ? "bg-[#0754dc] text-white"
                    : "bg-[#f5f9ff] text-[#07142f]"
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                    active ? "bg-white/20 text-white" : "bg-white text-[#0754dc]"
                  }`}
                >
                  <Icon />
                </div>

                <h3 className="mt-5 text-2xl font-extrabold">{item.name}</h3>

                <p
                  className={`mt-3 leading-7 ${
                    active ? "text-blue-100" : "text-slate-600"
                  }`}
                >
                  {item.packageText}
                </p>
              </button>
            );
          })}
        </div>

        {/* DOCTOR LIST */}
        <div className="mt-14">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#0754dc]">AVAILABLE DOCTORS</p>
              <h3 className="mt-2 text-3xl font-extrabold text-[#07142f]">
                {selectedSpecialty}
              </h3>
            </div>

            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl bg-[#05a832] px-6 py-4 font-bold text-white"
            >
              <FaWhatsapp />
              Ask on WhatsApp
            </a>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.name}
                className="rounded-3xl bg-[#f5f9ff] p-7 shadow-lg"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl text-[#0754dc] shadow-sm">
                    <FaUserMd />
                  </div>

                  <div>
                    <h4 className="text-2xl font-extrabold text-[#07142f]">
                      {doctor.name}
                    </h4>

                    <p className="mt-1 font-semibold text-[#e71935]">
                      {doctor.specialty}
                    </p>

                    <p className="mt-1 text-slate-600">
                      {doctor.qualification}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-slate-700">
                  <p className="flex items-center gap-3">
                    <FaClinicMedical className="text-[#0754dc]" />
                    {doctor.experience} experience
                  </p>

                  <p className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-[#e71935]" />
                    {doctor.clinic}
                  </p>

                  <p className="flex items-center gap-3">
                    <FaCalendarAlt className="text-[#0754dc]" />
                    {doctor.timing}
                  </p>

                  <p className="flex items-center gap-3">
                    <FaPhoneAlt className="text-[#05a832]" />
                    Appointment: {doctor.bookingNumber}
                  </p>

                  {(() => {
  const pricing = getConsultationPricing(doctor.fee);

  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="flex items-center gap-3 font-bold text-[#07142f]">
        <FaRupeeSign className="text-[#0754dc]" />
        Consultation Fee: ₹{pricing.finalFee}
      </p>

      {pricing.eliteDiscount > 0 && (
        <div className="mt-2">
          <p className="text-sm font-semibold text-slate-500 line-through">
            Original Fee: ₹{pricing.originalFee}
          </p>

          <p className="text-sm font-bold text-[#05a832]">
            Elite Discount Applied: -₹{pricing.eliteDiscount}
          </p>
        </div>
      )}
    </div>
  );
})()}
                </div>

                <button
                  type="button"
                  onClick={() => {
  if (!userEmail) {
    onRequireLogin();
    return;
  }

  setForm((prev) => ({
    ...prev,
    patient_email: userEmail,
  }));

  setSelectedDoctor(doctor);
}}
                  className="mt-7 w-full rounded-xl bg-[#0754dc] py-4 text-lg font-bold text-white"
                >
                  Request Consultation
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONSULTATION MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-bold text-[#0754dc]">
                  Consultation Request
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-[#07142f]">
                  {selectedDoctor.name}
                </h2>

                <p className="mt-1 text-slate-600">
                  {selectedDoctor.specialty} • {selectedDoctor.qualification}
                </p>
              </div>

              <button
                onClick={() => setSelectedDoctor(null)}
                className="rounded-full bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#f5f9ff] p-5 text-slate-700">
              <p>
                <b>Clinic:</b> {selectedDoctor.clinic}
              </p>
              <p className="mt-2">
                <b>Timing:</b> {selectedDoctor.timing}
              </p>
              {(() => {
  const pricing = getConsultationPricing(selectedDoctor.fee);

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <p className="flex items-center justify-between">
        <b>Original Fee:</b>
        <span>₹{pricing.originalFee}</span>
      </p>

      {pricing.eliteDiscount > 0 && (
        <p className="mt-2 flex items-center justify-between text-[#05a832]">
          <b>Elite Discount:</b>
          <span>-₹{pricing.eliteDiscount}</span>
        </p>
      )}

      <p className="mt-2 flex items-center justify-between border-t pt-2 text-lg font-extrabold text-[#0754dc]">
        <span>Final Payable:</span>
        <span>₹{pricing.finalFee}</span>
      </p>
    </div>
  );
})()}
              <p className="mt-2">
                <b>Appointment Number:</b> {selectedDoctor.bookingNumber}
              </p>
            </div>

            <form onSubmit={submitConsultation} className="mt-6 space-y-4">
              <input
                value={form.patient_name}
            
                onChange={(e) => updateField("patient_name", e.target.value)}
                placeholder="Patient Name"
                className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              />
              <input
  type="email"
  value={form.patient_email}
  
  onChange={(e) => updateField("patient_email", e.target.value)}
  placeholder="Email Address"
  className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
  required
/>
              

              <input
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10 Digit Phone Number"
                className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              />

              <input
                type="number"
                min="1"
                max="120"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="Patient Age"
                className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              />

              <textarea
                value={form.health_concern}
                onChange={(e) => updateField("health_concern", e.target.value)}
                placeholder="Health Concern / Problem"
                className="min-h-[110px] w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              />

              <select
                value={form.consultation_mode}
                onChange={(e) =>
                  updateField("consultation_mode", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                required
              >
                <option value="Clinic Visit">Clinic Visit</option>
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp Call">WhatsApp Call</option>
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  min={today}
                  value={form.preferred_date}
                  onChange={(e) =>
                    updateField("preferred_date", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                  required
                />

                <input
                  type="time"
                  value={form.preferred_time}
                  onChange={(e) =>
                    updateField("preferred_time", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 p-4 text-lg outline-none focus:border-[#0754dc]"
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-[#0754dc] py-4 text-xl font-bold text-white hover:bg-[#0647c9] disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Consultation Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}