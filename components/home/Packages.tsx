"use client";

import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

type PackageItem = {
  name: string;
  price: string;
  tests: string[];
  reporting: string;
  highlight: boolean;
  badge?: string;
};

export default function Packages({
  onBookClick,
}: {
  onBookClick: (packageName: string) => void;
}) {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  const packages: PackageItem[] = [
    {
      name: "Basic Metabolic Panel",
      price: "₹599",
      tests: [
        "CBC",
        "Bilirubin",
        "ALT",
        "Cholesterol",
        "Creatinine",
        "TSH",
        "Urine Routine",
        "FBS / Random",
      ],
      reporting: "Same day",
      highlight: false,
      badge: "Basic Health Package",
    },
    {
      name: "Fitness Plus - Whole Body Checkup",
      price: "₹2,999",
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
        "Total Protein",
        "Albumin",
        "HBsAg",
        "RA",
        "CRP",
        "Urine R/E",
      ],
      reporting: "Same day",
      highlight: true,
    },
    {
      name: "CARE PLUS - Advance Health Checkup",
      price: "₹1,499",
      tests: [
        "CBC",
        "LFT",
        "Lipid Profile",
        "KFT",
        "Sugar F/R",
        "HbA1c",
        "T3 T4 TSH",
      ],
      reporting: "Same day",
      highlight: false,
    },
    
    {
      name: "Diabetics Monitor",
      price: "₹1,499",
      tests: [
        "Fasting Sugar",
        "HbA1c",
        "Urine R/E",
        "Urine Microalbumin",
        "Creatinine Ratio",
        "eGFR",
        "Lipid Profile",
        "Creatinine",
        "BUN",
        "Uric Acid",
      ],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "Diabetics Monitor Plus",
      price: "₹3,699",
      tests: [
        "Fasting Sugar",
        "PP Sugar",
        "HbA1c",
        "Urine R/E",
        "Urine Microalbumin",
        "Creatinine Ratio",
        "eGFR",
        "Lipid Profile",
        "Creatinine",
        "BUN",
        "Uric Acid",
        "TSH",
        "HOMA IR",
        "Insulin Resistance Index",
      ],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "Iron Profile",
      price: "₹1,599",
      tests: [
        "Iron",
        "Ferritin",
        "Total Iron Binding Capacity",
        "Transferrin Saturation",
        "Hemoglobin",
      ],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "Fever Panel",
      price: "₹899",
      tests: ["CBC", "ESR", "MP", "Widal", "Bilirubin", "Urine R/E"],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "Anaemia Profile - 1",
      price: "₹1,599",
      tests: [
        "CBC",
        "Peripheral Blood Smear",
        "Retic Count",
        "CRP",
        "Iron Profile",
      ],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "Anaemia Profile - 2",
      price: "₹3,999",
      tests: [
        "CBC",
        "Peripheral Blood Smear",
        "Retic Count",
        "CRP",
        "Iron Profile",
        "HB Electrophoresis / Variant",
      ],
      reporting: "Next day",
      highlight: false,
    },
    {
      name: "Arthritis Panel - 1",
      price: "₹1,499",
      tests: ["CBC", "ESR", "CRP", "Uric Acid", "ASO", "RF", "Calcium"],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "Arthritis Panel - 2",
      price: "₹2,499",
      tests: [
        "CBC",
        "ESR",
        "CRP",
        "Uric Acid",
        "ASO",
        "RF",
        "Calcium",
        "ANA",
        "Anti CCP",
      ],
      reporting: "Same day",
      highlight: false,
    },
    {
      name: "ANC Profile - Antenatal Profile",
      price: "₹1,299",
      tests: [
        "CBC",
        "ABO",
        "Sugar",
        "VDRL",
        "HIV",
        "HBsAg",
        "HCV",
        "TSH",
        "Urine R/E",
      ],
      reporting: "Same day",
      highlight: false,
    },
  ];

  function togglePackage(packageName: string) {
    setExpandedPackage((current) =>
      current === packageName ? null : packageName
    );
  }

  return (
    <section id="packages" className="bg-white px-8 py-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="text-center">
          <p className="font-bold text-[#0754dc]">CYTOCARE PROFILES & PANELS</p>

          <h2 className="mt-3 text-5xl font-extrabold text-[#07142f]">
            Affordable Health Packages
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-600">
            Choose from Cytocare&apos;s health checkup profiles and diagnostic
            panels with affordable pricing and fast reporting.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => {
            const isExpanded = expandedPackage === item.name;
            const visibleTests = isExpanded
              ? item.tests
              : item.tests.slice(0, 7);
            const hiddenTestsCount = item.tests.length - 7;

            return (
              <div
                key={item.name}
                className={`rounded-3xl p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl ${
                  item.highlight
                    ? "bg-[#0754dc] text-white"
                    : "bg-[#f5f9ff] text-[#07142f]"
                }`}
              >
                {(item.highlight || item.badge) && (
                  <p
                    className={`mb-5 inline-block rounded-full px-4 py-2 text-sm font-bold ${
                      item.highlight
                        ? "bg-white text-[#0754dc]"
                        : "bg-blue-50 text-[#0754dc]"
                    }`}
                  >
                    {item.badge || "Whole Body Checkup"}
                  </p>
                )}

                <h3 className="min-h-[72px] text-2xl font-extrabold leading-tight">
                  {item.name}
                </h3>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <p
                    className={`text-4xl font-extrabold ${
                      item.highlight ? "text-white" : "text-[#0754dc]"
                    }`}
                  >
                    {item.price}
                  </p>

                  <p
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      item.highlight
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 text-[#0754dc]"
                    }`}
                  >
                    {item.reporting}
                  </p>
                </div>

                <div className="mt-7 space-y-3">
                  {visibleTests.map((test) => (
                    <div key={test} className="flex items-start gap-3">
                      <FaCheckCircle
                        className={`mt-1 shrink-0 ${
                          item.highlight ? "text-white" : "text-[#05a832]"
                        }`}
                      />

                      <span className="text-base leading-6">{test}</span>
                    </div>
                  ))}

                  {hiddenTestsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => togglePackage(item.name)}
                      className={`pt-2 text-left text-sm font-bold underline-offset-4 hover:underline ${
                        item.highlight ? "text-blue-100" : "text-[#0754dc]"
                      }`}
                    >
                      {isExpanded
                        ? "Show less"
                        : `+ ${hiddenTestsCount} more tests included`}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onBookClick(item.name)}
                  className={`mt-8 w-full rounded-xl py-4 text-lg font-bold ${
                    item.highlight
                      ? "bg-white text-[#0754dc]"
                      : "bg-[#e71935] text-white"
                  }`}
                >
                  Book Package
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}