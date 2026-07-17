"use client";

import { useState } from "react";
import { FaCheckCircle, FaTimes, FaUserMd } from "react-icons/fa";

type RoutinePackage = {
  cardTitle: string;
  modalTitle: string;
  packageName: string;
  gender: "Men" | "Women";
  ageGroup: string;
  price: number;
  image: string;
  description: string;
  note: string;
  tests: string[];
  addOns: string[];
};

const routinePackages: RoutinePackage[] = [
  {
    cardTitle: "Under 30 yrs",
    modalTitle: "Young Men Wellness",
    packageName: "Men Under 30 Health Package",
    gender: "Men",
    ageGroup: "Under 30",
    price: 1699,
    image: "/checkups/men-under-30.png",
    description:
      "Best for students, young working men, gym lifestyle, stress, irregular food habits and early health screening.",
    note:
      "These are recommended screening tests. Final test selection can be changed based on doctor advice, symptoms, age, medical history and patient requirement.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "CREATININE",
      "UREA",
      "EGFR",
      "ALT",
      "T3 T4 TSH",
      "URINE R/E",
      "VIT D VIT B12",
      "BILIRUBIN",
      "CHOLESTEROL",
    ],
    addOns: ["HbA1c", "CRP", "Uric Acid", "Testosterone Total", "Iron Profile"],
  },
  {
    cardTitle: "30 - 45 yrs",
    modalTitle: "Adult Men Wellness",
    packageName: "Men 30-45 Health Package",
    gender: "Men",
    ageGroup: "30 - 45",
    price: 2499,
    image: "/checkups/men-30-45.png",
    description:
      "Ideal for working professionals, family men, stress lifestyle, weight gain, sugar risk and routine annual screening.",
    note:
      "This package covers common lifestyle, sugar, thyroid, liver, kidney, vitamin and hormone-related health checks.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "CREATININE",
      "UREA",
      "EGFR",
      "ALT",
      "T3 T4 TSH",
      "URINE R/E",
      "VIT D VIT B12",
      "HBA1C",
      "TESTOSTERONE",
      "BILIRUBIN",
      "RA FACTOR",
      "CHOLESTEROL",
    ],
    addOns: ["Lipid Profile", "LFT", "KFT", "Vitamin B12", "PSA"],
  },
  {
    cardTitle: "45 - 60 yrs",
    modalTitle: "Mature Men Wellness",
    packageName: "Men 45-60 Health Package",
    gender: "Men",
    ageGroup: "45 - 60",
    price: 3499,
    image: "/checkups/men-45-60.png",
    description:
      "Recommended for mid-age men for heart, sugar, kidney, liver, thyroid, prostate, immunity and vitamin screening.",
    note:
      "Useful for preventive health screening and monitoring age-related health risks.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "KFT2",
      "LFT",
      "LIPID PROFILE",
      "T3 T4 TSH",
      "VIT D VIT B12",
      "HBA1C",
      "TESTOSTERONE",
      "RA FACTOR",
      "IGE",
      "PSA",
    ],
    addOns: ["Uric Acid", "Electrolytes", "Ferritin", "CRP", "Calcium"],
  },
  {
    cardTitle: "Above 60 yrs",
    modalTitle: "Senior Men Wellness",
    packageName: "Men Above 60 Health Package",
    gender: "Men",
    ageGroup: "Above 60",
    price: 3599,
    image: "/checkups/men-above-60.png",
    description:
      "Complete senior health package for sugar, prostate, thyroid, liver, kidney, heart risk, vitamins and inflammation screening.",
    note:
      "Recommended for senior men requiring regular preventive and chronic health monitoring.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "KFT2",
      "LFT",
      "LIPID PROFILE",
      "PSA",
      "T3 T4 TSH",
      "URINE R/E",
      "VIT D VIT B12",
      "HBA1C",
      "RA FACTOR",
      "IGE Total",
      "CA-125",
    ],
    addOns: ["Electrolytes", "Calcium", "Uric Acid", "Ferritin", "CRP"],
  },
  {
    cardTitle: "Under 30 yrs",
    modalTitle: "Young Women Wellness",
    packageName: "Women Under 30 Health Package",
    gender: "Women",
    ageGroup: "Under 30",
    price: 699,
    image: "/checkups/women-under-30.png",
    description:
      "Basic wellness package for young women covering blood, sugar, liver, kidney, thyroid and urine screening.",
    note:
      "Best for early screening, students, young working women and routine basic checkup.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "CREATININE",
      "BILIRUBIN",
      "ALT",
      "CHOLESTEROL",
      "T3 T4 TSH",
      "URINE R/E",
    ],
    addOns: ["Vitamin D", "Vitamin B12", "Iron", "Ferritin", "HbA1c"],
  },
  {
    cardTitle: "30 - 45 yrs",
    modalTitle: "Adult Women Wellness",
    packageName: "Women 30-45 Health Package",
    gender: "Women",
    ageGroup: "30 - 45",
    price: 1699,
    image: "/checkups/women-30-45.png",
    description:
      "Ideal package for women with busy lifestyle, stress, nutritional deficiency, thyroid, sugar and general health screening.",
    note:
      "Recommended for regular preventive health checkups and lifestyle-related screening.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "CREATININE",
      "UREA",
      "EGFR",
      "ALT",
      "T3 T4 TSH",
      "VIT D VIT B12",
      "BILIRUBIN",
      "CHOLESTEROL",
      "URINE R/E",
    ],
    addOns: ["HbA1c", "Ferritin", "Calcium", "LH FSH PRL", "CA-125"],
  },
  {
    cardTitle: "45 - 60 yrs",
    modalTitle: "Mature Women Wellness",
    packageName: "Women 45-60 Health Package",
    gender: "Women",
    ageGroup: "45 - 60",
    price: 3499,
    image: "/checkups/women-45-60.png",
    description:
      "Comprehensive package for women covering sugar, liver, kidney, lipid, hormones, vitamins, inflammation and cancer marker screening.",
    note:
      "Useful for preventive screening around hormonal changes, lifestyle risks and age-related health concerns.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "KFT2",
      "LFT",
      "LIPID PROFILE",
      "LH FSH PRL",
      "VIT D VIT B12",
      "HBA1C",
      "RA FACTOR",
      "IGE",
      "CA-125",
      "URINE R/E",
    ],
    addOns: ["AMH", "Ferritin", "Calcium", "Uric Acid", "CRP"],
  },
  {
    cardTitle: "Above 60 yrs",
    modalTitle: "Senior Women Wellness",
    packageName: "Women Above 60 Health Package",
    gender: "Women",
    ageGroup: "Above 60",
    price: 3799,
    image: "/checkups/women-above-60.png",
    description:
      "Advanced senior women package for full preventive screening including sugar, liver, kidney, hormones, vitamins, inflammation and pancreas markers.",
    note:
      "Recommended for senior women requiring regular health monitoring and complete preventive screening.",
    tests: [
      "CBC",
      "ESR",
      "FBS",
      "HsCRP",
      "IRON",
      "KFT2",
      "LFT",
      "LIPID PROFILE",
      "LH FSH PRL",
      "VIT D VIT B12",
      "HBA1C",
      "RA FACTOR",
      "IGE",
      "CA-125",
      "AMYLASE",
      "LIPASE",
      "URINE R/E",
    ],
    addOns: ["Calcium", "Uric Acid", "Ferritin", "Electrolytes", "CRP"],
  },
];

export default function RoutineCheckups({
  onCheckupClick,
}: {
  onCheckupClick: (packageName: string) => void;
}) {
  const [selectedPackage, setSelectedPackage] =
    useState<RoutinePackage | null>(null);

  const menPackages = routinePackages.filter((item) => item.gender === "Men");
  const womenPackages = routinePackages.filter(
    (item) => item.gender === "Women"
  );

  function rupees(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  function PackageCard({ item }: { item: RoutinePackage }) {
    return (
      <button
        type="button"
        onClick={() => setSelectedPackage(item)}
        className="group overflow-hidden rounded-[30px] bg-white text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="m-5 h-56 overflow-hidden rounded-[28px] bg-[#f5e0f7]">
          <img
            src={item.image}
            alt={item.cardTitle}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
        </div>

        <div className="px-5 pb-8">
          <h3 className="text-2xl font-extrabold text-[#07142f]">
            {item.cardTitle}
          </h3>

          <p className="mt-2 text-lg font-semibold text-slate-500">
            Click to view packages
          </p>
        </div>
      </button>
    );
  }

  function PackageGrid({
    title,
    packages,
  }: {
    title: string;
    packages: RoutinePackage[];
  }) {
    return (
      <div className="rounded-[34px] bg-[#eef5ff] p-6">
        <h3 className="mb-6 text-3xl font-extrabold text-[#07142f]">
          {title}
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((item) => (
            <PackageCard key={item.packageName} item={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#f5f9ff] px-5 py-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 text-center">
          <p className="font-extrabold uppercase tracking-wide text-[#0754dc]">
            Routine Health Checkups
          </p>

          <h2 className="mt-3 text-4xl font-extrabold text-[#07142f] md:text-5xl">
            Routine Health Checkup for Men & Women
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg font-semibold text-slate-500">
            Choose age-wise wellness packages and add them directly to cart.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <PackageGrid title="Men" packages={menPackages} />
          <PackageGrid title="Women" packages={womenPackages} />
        </div>
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-5">
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[34px] bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPackage(null)}
              className="absolute right-6 top-6 z-10 rounded-full bg-slate-100 p-4 text-xl text-[#07142f]"
            >
              <FaTimes />
            </button>

            <div className="mb-8 pr-16">
              <h3 className="text-5xl font-extrabold text-[#07142f] md:text-6xl">
                {selectedPackage.modalTitle}
              </h3>

              <p className="mt-4 text-xl font-semibold text-slate-500">
                {selectedPackage.gender} health package for{" "}
                {selectedPackage.ageGroup}
              </p>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.1fr_1fr]">
              <div className="rounded-[30px] bg-[#f8fbff] p-7">
                <div className="mb-5 flex items-center gap-4">
                  <FaUserMd className="text-3xl text-[#0754dc]" />

                  <h4 className="text-3xl font-extrabold text-[#07142f]">
                    Recommended Package
                  </h4>
                </div>

                <h5 className="text-4xl font-extrabold leading-tight text-[#0754dc]">
                  {selectedPackage.packageName}
                </h5>

                <p className="mt-6 text-lg font-semibold leading-8 text-slate-700">
                  {selectedPackage.description}
                </p>

                <div className="mt-8 rounded-3xl bg-white p-6">
                  <p className="mb-3 text-lg font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Note
                  </p>

                  <p className="text-base font-semibold leading-8 text-slate-700">
                    {selectedPackage.note}
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] bg-[#07142f] p-7 text-white">
                <h4 className="mb-6 text-3xl font-extrabold">
                  Included Tests
                </h4>

                <div className="space-y-4">
                  {selectedPackage.tests.map((test) => (
                    <div
                      key={test}
                      className="flex items-center gap-4 text-lg font-bold"
                    >
                      <FaCheckCircle className="shrink-0 text-[#05a832]" />
                      {test}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[30px] border border-slate-100 bg-white p-7 shadow-sm">
              <h4 className="mb-5 text-3xl font-extrabold text-[#07142f]">
                Optional Add-ons
              </h4>

              <div className="flex flex-wrap gap-4">
                {selectedPackage.addOns.map((addon) => (
                  <span
                    key={addon}
                    className="rounded-full bg-[#eef5ff] px-6 py-3 text-base font-extrabold text-[#0754dc]"
                  >
                    {addon}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-[30px] bg-[#f8fbff] p-6">
              <div>
                <p className="text-sm font-extrabold uppercase text-slate-500">
                  Package Amount
                </p>

                <p className="mt-1 text-5xl font-extrabold text-[#05a832]">
                  {rupees(selectedPackage.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onCheckupClick(selectedPackage.packageName);
                  setSelectedPackage(null);
                }}
                className="rounded-2xl bg-[#0754dc] px-8 py-5 text-xl font-extrabold text-white shadow-lg"
              >
                Add to Cart - {rupees(selectedPackage.price)}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}