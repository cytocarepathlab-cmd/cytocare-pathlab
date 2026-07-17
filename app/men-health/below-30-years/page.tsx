"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCall from "@/components/common/FloatingCall";
import FloatingWhatsapp from "@/components/common/FloatingWhatsapp";
import BookingModal from "@/components/common/BookingModal";
import {
  FaCheckCircle,
  FaFilter,
  FaHome,
  FaRupeeSign,
  FaSearch,
  FaShieldAlt,
  FaVial,
  FaWhatsapp,
} from "react-icons/fa";
import { siteConfig } from "@/constants/site";

const packages = [
  {
    name: "CARE PLUS - Advance Health Checkup",
    price: "₹1,500",
    mrp: "₹2,200",
    discount: "32% OFF",
    parameters: "45+ Parameters",
    reporting: "Same Day",
    tag: "Recommended",
    tests: ["CBC", "LFT", "Lipid Profile", "KFT", "Sugar F/R", "HbA1c", "T3 T4 TSH"],
  },
  {
    name: "Fitness Plus - Whole Body Checkup",
    price: "₹3,000",
    mrp: "₹4,500",
    discount: "33% OFF",
    parameters: "70+ Parameters",
    reporting: "Same Day",
    tag: "Most Popular",
    tests: [
      "CBC",
      "ESR",
      "Glucose F/R",
      "HbA1c",
      "LFT",
      "Creatinine",
      "Urea",
      "Electrolyte",
      "Calcium",
      "Uric Acid",
      "Lipid Profile",
      "Thyroid Profile",
      "Vitamin D",
      "Vitamin B12",
    ],
  },
  {
    name: "Fever Panel",
    price: "₹900",
    mrp: "₹1,300",
    discount: "31% OFF",
    parameters: "25+ Parameters",
    reporting: "Same Day",
    tag: "Fast Report",
    tests: ["CBC", "ESR", "MP", "Widal", "Bilirubin", "Urine R/E"],
  },
  {
    name: "Iron Profile",
    price: "₹1,600",
    mrp: "₹2,100",
    discount: "24% OFF",
    parameters: "20+ Parameters",
    reporting: "Same Day",
    tag: "Health Profile",
    tests: [
      "Iron",
      "Ferritin",
      "Total Iron Binding Capacity",
      "Transferrin Saturation",
      "Hemoglobin",
    ],
  },
];

export default function MenBelow30Page() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState("");
  const [search, setSearch] = useState("");

  const filteredPackages = packages.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function openBooking(packageName = "") {
    setSelectedTest(packageName);
    setIsBookingOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <Navbar onBookClick={() => openBooking()} />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#eaf3ff] via-white to-[#f5f9ff] px-6 py-12 md:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0754dc] shadow-sm">
              <FaShieldAlt />
              Men Health Checkup
            </p>

            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-[#07142f] md:text-6xl">
              Health Checkup Packages for Men Below 30 Years
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Preventive health checkups for young men to track blood health,
              sugar, liver, kidney, thyroid, vitamins and overall wellness.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => openBooking("CARE PLUS - Advance Health Checkup")}
                className="rounded-xl bg-[#0754dc] px-8 py-4 text-lg font-bold text-white shadow-lg"
              >
                Book Recommended Package
              </button>

              <a
                href="#packages-list"
                className="rounded-xl border border-[#0754dc] bg-white px-8 py-4 text-lg font-bold text-[#0754dc]"
              >
                View Packages
              </a>

              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                className="flex items-center gap-3 rounded-xl bg-[#05a832] px-8 py-4 text-lg font-bold text-white"
              >
                <FaWhatsapp />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-xl md:p-8">
            <div className="relative mx-auto h-[420px] max-w-[360px] overflow-hidden rounded-[28px] bg-[#f3dff6]">
              <Image
                src="/checkups/men-under-30.png"
                alt="Men Below 30 Health Checkup"
                fill
                className="object-contain object-bottom p-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto grid max-w-[1500px] gap-6 px-6 py-10 md:grid-cols-4 md:px-8">
        {[
          {
            icon: <FaHome />,
            title: "Home Collection",
            text: "Sample collection at your doorstep.",
          },
          {
            icon: <FaVial />,
            title: "Preventive Tests",
            text: "CBC, sugar, liver, kidney and thyroid.",
          },
          {
            icon: <FaRupeeSign />,
            title: "Affordable Pricing",
            text: "Packages starting from ₹900.",
          },
          {
            icon: <FaCheckCircle />,
            title: "Fast Reports",
            text: "Same-day digital reports.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#0754dc]">
              {item.icon}
            </div>

            <h3 className="mt-4 text-xl font-extrabold">{item.title}</h3>

            <p className="mt-2 text-slate-600">{item.text}</p>
          </div>
        ))}
      </section>

      {/* PACKAGE LIST */}
      <section id="packages-list" className="mx-auto max-w-[1500px] px-6 py-10 md:px-8">
        <div className="mb-8">
          <p className="font-bold text-[#0754dc]">TOP SELLING PACKAGES</p>

          <h2 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Men Below 30 Health Packages
          </h2>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600 md:text-xl">
            Choose a suitable package and book online. Our team will confirm your
            slot for sample collection.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* FILTER SIDEBAR */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3 text-2xl font-extrabold">
              <FaFilter className="text-[#0754dc]" />
              Filters
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="font-bold">Age</h3>
              <label className="mt-3 flex items-center gap-3 text-slate-600">
                <input type="checkbox" checked readOnly />
                Below 30 Years
              </label>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="font-bold">Gender</h3>
              <label className="mt-3 flex items-center gap-3 text-slate-600">
                <input type="checkbox" checked readOnly />
                Men
              </label>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="font-bold">Price Range</h3>
              <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-[#0754dc]">
                ₹900 - ₹3,000
              </div>
            </div>

            <button
              onClick={() => openBooking("CARE PLUS - Advance Health Checkup")}
              className="mt-7 w-full rounded-xl bg-[#0754dc] py-4 font-bold text-white"
            >
              Need Help? Book Now
            </button>
          </aside>

          {/* RIGHT SIDE CONTENT */}
          <div>
            {/* SEARCH */}
            <div className="mb-6 flex items-center rounded-2xl bg-white p-4 shadow-md">
              <FaSearch className="ml-2 text-xl text-slate-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search package"
                className="flex-1 bg-transparent px-4 text-lg outline-none"
              />
            </div>

            {/* PACKAGE CARDS */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPackages.map((item) => (
                <div
                  key={item.name}
                  className="rounded-3xl bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                      {item.tag}
                    </p>

                    <p className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-[#e71935]">
                      {item.discount}
                    </p>
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold text-[#07142f]">
                    {item.name}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#0754dc]">
                      {item.parameters}
                    </span>

                    <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-[#e71935]">
                      {item.reporting}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {item.tests.slice(0, 6).map((test) => (
                      <p
                        key={test}
                        className="flex items-start gap-3 text-slate-600"
                      >
                        <FaCheckCircle className="mt-1 shrink-0 text-[#05a832]" />
                        {test}
                      </p>
                    ))}

                    {item.tests.length > 6 && (
                      <p className="font-semibold text-[#0754dc]">
                        + {item.tests.length - 6} more tests included
                      </p>
                    )}
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 line-through">
                        {item.mrp}
                      </p>

                      <p className="text-4xl font-extrabold text-[#0754dc]">
                        {item.price}
                      </p>
                    </div>

                    <button
                      onClick={() => openBooking(item.name)}
                      className="rounded-xl bg-[#0754dc] px-7 py-4 text-lg font-bold text-white"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPackages.length === 0 && (
              <div className="rounded-3xl bg-white p-10 text-center shadow-md">
                <h3 className="text-2xl font-extrabold">No package found</h3>
                <p className="mt-2 text-slate-600">
                  Try searching CARE PLUS, Fitness Plus, Fever Panel or Iron Profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INFORMATION SECTION */}
      <section className="mx-auto max-w-[1500px] px-6 py-16 md:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-lg md:p-12">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Why should men below 30 book regular health checkups?
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Men below 30 often feel healthy, but routine screening helps detect
            early signs of lifestyle-related concerns such as vitamin deficiency,
            thyroid imbalance, sugar changes, liver stress, kidney issues and
            cholesterol imbalance. Preventive testing helps you take action early.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              "Good for working professionals",
              "Useful for gym and fitness-focused people",
              "Helps track early lifestyle health risks",
            ].map((text) => (
              <div key={text} className="rounded-2xl bg-[#f5f9ff] p-6 font-bold">
                <FaCheckCircle className="mb-3 text-2xl text-[#05a832]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsapp />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        bookingType="Health Package"
        selectedTest={selectedTest}
      />
    </main>
  );
}