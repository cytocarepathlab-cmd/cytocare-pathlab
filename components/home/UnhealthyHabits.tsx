"use client";

import { useState } from "react";
import {
  FaAppleAlt,
  FaBrain,
  FaCartPlus,
  FaChevronRight,
  FaFireAlt,
  FaMoon,
  FaPills,
  FaSmoking,
  FaUtensils,
  FaVial,
  FaWineGlassAlt,
} from "react-icons/fa";

type HabitPackage = {
  id: number;
  category: string;
  title: string;
  reportsIn: string;
  parameters: number;
  tests: string;
  price: number;
  mrp: number;
  discount: string;
};

type UnhealthyHabitsProps = {
  onAddToCart: (testName: string) => void;
};

const categories = [
  { name: "Junk Food", icon: FaUtensils },
  { name: "Smoking", icon: FaSmoking },
  { name: "Alcohol", icon: FaWineGlassAlt },
  { name: "Stress", icon: FaBrain },
  { name: "Sleeplessness", icon: FaMoon },
  { name: "Medicine Overuse", icon: FaPills },
  { name: "Heartburn", icon: FaFireAlt },
  { name: "Poor Nutrition", icon: FaAppleAlt },
];

const habitPackages: HabitPackage[] = [
  {
    id: 1,
    category: "Junk Food",
    title: "Care Junk Food Health Package",
    reportsIn: "12 hours",
    parameters: 64,
    tests: "CBC, ESR, HbA1c, Lipid Profile, LFT, KFT, Vitamin B12",
    price: 1149,
    mrp: 2772,
    discount: "59% Off",
  },
  {
    id: 2,
    category: "Junk Food",
    title: "Care Junk Food Basic Package",
    reportsIn: "11 hours",
    parameters: 51,
    tests: "CBC, ESR, HbA1c, Lipid Profile, Liver Function Test",
    price: 849,
    mrp: 1724,
    discount: "51% Off",
  },
  {
    id: 3,
    category: "Smoking",
    title: "Care Smoking Risk Health Package",
    reportsIn: "12 hours",
    parameters: 46,
    tests: "CBC, LFT, KFT, Lipid Profile, Blood Sugar, CRP",
    price: 899,
    mrp: 1899,
    discount: "53% Off",
  },
  {
    id: 4,
    category: "Alcohol",
    title: "Care Alcohol Health Check Package",
    reportsIn: "12 hours",
    parameters: 42,
    tests: "Liver Function Test, Kidney Function Test, CBC, Lipid Profile, Blood Sugar",
    price: 799,
    mrp: 1699,
    discount: "52% Off",
  },
  {
    id: 5,
    category: "Stress",
    title: "Care Stress & Fatigue Package",
    reportsIn: "12 hours",
    parameters: 50,
    tests: "CBC, Thyroid Profile, Vitamin D, Vitamin B12, Blood Sugar, Lipid Profile",
    price: 999,
    mrp: 2299,
    discount: "57% Off",
  },
  {
    id: 6,
    category: "Sleeplessness",
    title: "Care Sleeplessness Health Package",
    reportsIn: "12 hours",
    parameters: 44,
    tests: "CBC, Thyroid Profile, Vitamin D, Vitamin B12, Blood Sugar",
    price: 899,
    mrp: 1899,
    discount: "53% Off",
  },
  {
    id: 7,
    category: "Medicine Overuse",
    title: "CareMedicine Overuse Safety Package",
    reportsIn: "12 hours",
    parameters: 48,
    tests: "Liver Function Test, Kidney Function Test, CBC, Blood Sugar, Electrolytes",
    price: 949,
    mrp: 1999,
    discount: "52% Off",
  },
  {
    id: 8,
    category: "Heartburn",
    title: "CareHeartburn & Acidity Package",
    reportsIn: "12 hours",
    parameters: 38,
    tests: "CBC, LFT, KFT, Blood Sugar, Vitamin B12, H. Pylori Screening",
    price: 799,
    mrp: 1599,
    discount: "50% Off",
  },
  {
    id: 9,
    category: "Poor Nutrition",
    title: "Care Poor Nutrition Health Package",
    reportsIn: "12 hours",
    parameters: 56,
    tests: "CBC, Iron Profile, Vitamin D, Vitamin B12, Calcium, Thyroid Profile",
    price: 1099,
    mrp: 2399,
    discount: "54% Off",
  },
];

export default function UnhealthyHabits({
  onAddToCart,
}: UnhealthyHabitsProps) {
  const [activeCategory, setActiveCategory] = useState("Junk Food");

  const filteredPackages = habitPackages.filter(
    (item) => item.category === activeCategory
  );

  return (
    <section className="bg-[#eef5ff] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-[1500px] rounded-[28px] bg-[#f7fbff] p-5 shadow-sm md:p-7">
        {/* HEADER */}
        <div className="mb-5">
          <h2 className="text-[30px] font-extrabold leading-tight text-[#0b3e72] md:text-[38px]">
            Unhealthy Habits
          </h2>

          <p className="mt-2 text-[18px] leading-7 text-slate-600">
            Understand how daily habits may be impacting your health.
          </p>
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = activeCategory === category.name;

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => setActiveCategory(category.name)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-5 py-3 text-[15px] font-semibold transition ${
                  active
                    ? "border-[#154a7d] bg-[#154a7d] text-white"
                    : "border-slate-200 bg-white text-[#07142f] hover:border-[#154a7d]"
                }`}
              >
                <Icon className="text-[15px]" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* CARDS */}
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredPackages.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* TOP */}
              <div className="min-h-[100px] px-6 py-4">
                <h3 className="text-[21px] font-extrabold leading-snug text-[#e71935]">
                  {item.title}
                </h3>

                <button
                  type="button"
                  className="mt-2 flex items-center gap-2 text-[14px] font-bold text-[#0b3e72]"
                >
                  View Details
                  <FaChevronRight className="text-[11px]" />
                </button>
              </div>

              {/* REPORTS */}
              <div className="border-y border-slate-100 px-6 py-3">
                <div className="flex flex-wrap items-center gap-3 text-[15px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Reports in</span>
                    <span className="rounded-md bg-[#e8fbff] px-3 py-1 font-extrabold text-[#07142f]">
                      {item.reportsIn}
                    </span>
                  </div>

                  <span>|</span>

                  <div className="flex items-center gap-2">
                    <span>Parameters</span>
                    <span className="rounded-md bg-slate-100 px-3 py-1 font-extrabold text-[#07142f]">
                      {item.parameters}
                    </span>
                  </div>
                </div>
              </div>

              {/* TESTS */}
              <div className="px-6 py-3">
                <p className="line-clamp-1 text-[16px] leading-6 text-[#07142f]">
                  {item.tests}
                </p>
              </div>

              {/* BOTTOM */}
              <div className="flex flex-wrap items-end justify-between gap-3 bg-[#fff7f7] px-6 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[22px] font-extrabold text-[#07142f]">
                      ₹{item.price}
                    </p>

                    <p className="text-[17px] font-semibold text-slate-400 line-through">
                      ₹{item.mrp}
                    </p>

                    <span className="rounded-full bg-[#00b894] px-3 py-1 text-[12px] font-extrabold text-white">
                      {item.discount}
                    </span>
                  </div>

                  <p className="mt-1 text-[15px] font-semibold text-[#07142f]">
                    Extra{" "}
                    <span className="font-extrabold text-[#0754dc]">
                      10% OFF
                    </span>{" "}
                    with Elite
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onAddToCart(item.title)}
                  className="flex items-center gap-2 rounded-xl bg-[#e71935] px-6 py-3 text-[15px] font-extrabold text-white shadow-sm transition hover:bg-[#d9142e]"
                >
                  <FaCartPlus />
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* NOTE */}
        <div className="mt-5 rounded-2xl bg-[#f3f8ff] p-4">
          <p className="flex items-start gap-3 text-[15px] leading-7 text-slate-600">
            <FaVial className="mt-1 shrink-0 text-[#0754dc]" />
            These packages are designed for preventive health awareness and may
            vary based on clinical advice and patient history.
          </p>
        </div>
      </div>
    </section>
  );
}