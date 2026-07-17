"use client";

import { useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaHome,
  FaSearch,
  FaShieldAlt,
  FaShoppingCart,
  FaVial,
  FaWhatsapp,
} from "react-icons/fa";
import { cytocareTests } from "@/lib/cytocareTests";

type HeroProps = {
  onBookClick: () => void;
  onHomeCollectionClick: () => void;
  onSearchSelect: (testName: string) => void;
};

type CytocareTest = (typeof cytocareTests)[number];

export default function Hero({
  onBookClick,
  onHomeCollectionClick,
  onSearchSelect,
}: HeroProps) {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredTests = useMemo<CytocareTest[]>(() => {
    const q = search.toLowerCase().trim();

    if (!q) return [];

    return cytocareTests
      .filter((test: CytocareTest) =>
        [
          test.name,
          test.category,
          test.vial,
          test.reportingTime,
          String(test.price),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 8);
  }, [search]);

  function handleSearchButton() {
    if (!search.trim()) {
      alert("Please type a test name.");
      return;
    }

    if (filteredTests.length > 0) {
      onSearchSelect(filteredTests[0].name);
      setSearch("");
      setShowSuggestions(false);
      return;
    }

    alert("No test found. Please try CBC, TSH, LFT, Vitamin D, Sugar, KFT.");
  }

  function addSelectedTest(testName: string) {
    onSearchSelect(testName);
    setSearch("");
    setShowSuggestions(false);
  }

  function goToWhatsapp() {
    window.open(
      "https://wa.me/916203572424?text=Hello%20Cytocare%2C%20I%20want%20to%20book%20a%20test.",
      "_blank"
    );
  }

  return (
    <section className="bg-[#f5f9ff] px-4 py-12 md:px-6 lg:py-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid items-center gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          {/* LEFT CONTENT */}
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-[#eaf2ff] px-6 py-4 text-lg font-bold text-[#0754dc]">
              <FaShieldAlt />
              Trusted Pathology Laboratory in Jamshedpur
            </div>

            <h1 className="text-6xl font-extrabold leading-[1.05] text-[#07142f] md:text-7xl xl:text-8xl">
              Quality Care.
              <span className="block text-[#0754dc]">Innovation.</span>
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-[1.8] text-slate-600 md:text-2xl">
              Accurate diagnostic tests, affordable health packages, home sample
              collection and fast digital reports.
            </p>

            {/* SEARCH BOX */}
            <div className="relative mt-10 max-w-4xl">
              <div className="flex items-center rounded-[28px] bg-white p-4 shadow-md">
                <div className="flex flex-1 items-center gap-4 px-4">
                  <FaSearch className="text-3xl text-slate-500" />

                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search Blood Tests (e.g. CBC, Thyroid, Vitamin D)"
                    className="w-full bg-transparent text-lg text-[#07142f] outline-none placeholder:text-slate-400 md:text-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearchButton}
                  className="rounded-[22px] bg-[#0754dc] px-8 py-4 text-lg font-extrabold text-white transition hover:bg-[#0648bd] md:px-10 md:py-5 md:text-xl"
                >
                  Search
                </button>
              </div>

              {/* SEARCH SUGGESTIONS */}
              {showSuggestions && search.trim() && (
                <div className="absolute left-0 right-0 top-[105%] z-50 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
                  {filteredTests.length > 0 ? (
                    <div className="max-h-[430px] overflow-y-auto">
                      {filteredTests.map((test: CytocareTest) => (
                        <div
                          key={test.id}
                          className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-b-0 hover:bg-[#f8fbff]"
                        >
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-extrabold text-[#07142f]">
                                {test.name}
                              </h3>

                              <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0754dc]">
                                {test.category}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
                              <span>Vial: {test.vial || "As required"}</span>
                              <span>{"•"}</span>
                              <span>{test.reportingTime || "Ask lab"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-xl font-extrabold text-[#07142f]">
                              ₹{test.price}
                            </p>

                            <button
                              type="button"
                              onClick={() => addSelectedTest(test.name)}
                              className="flex items-center gap-2 rounded-xl bg-[#0754dc] px-4 py-3 text-sm font-extrabold text-white"
                            >
                              <FaShoppingCart />
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-lg font-extrabold text-[#07142f]">
                        No test found
                      </p>

                      <p className="mt-2 text-slate-500">
                        Try CBC, LFT, TSH, Vitamin D, Sugar, KFT, Fever Panel.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between bg-[#f8fbff] p-4">
                    <p className="text-sm font-semibold text-slate-500">
                      Showing top matching tests
                    </p>

                    <a
                      href="/tests"
                      className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-[#0754dc] shadow-sm"
                    >
                      View All Tests
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-9 grid max-w-4xl gap-5 md:grid-cols-3">
              <button
                type="button"
                onClick={onBookClick}
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#0754dc] px-6 py-5 text-xl font-extrabold text-white shadow-md transition hover:bg-[#0648bd] xl:text-2xl"
              >
                <FaCalendarAlt />
                Book Test
              </button>

              <button
                type="button"
                onClick={onHomeCollectionClick}
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#e71935] px-6 py-5 text-xl font-extrabold text-white shadow-md transition hover:bg-[#c9152d] xl:text-2xl"
              >
                <FaHome />
                Home Collection
              </button>

              <button
                type="button"
                onClick={goToWhatsapp}
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#05a832] px-6 py-5 text-xl font-extrabold text-white shadow-md transition hover:bg-[#048d2b] xl:text-2xl"
              >
                <FaWhatsapp />
                WhatsApp
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2">
                <FaVial className="text-[#0754dc]" />
                130+ lab tests available
              </span>

              <span>{"•"}</span>

              <span>Free home collection for Elite members above ₹699</span>

              <span>{"•"}</span>

              <span>10% Elite benefit on Cytocare tests</span>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden xl:block">
            <div className="relative overflow-hidden rounded-[34px] shadow-xl">
              <img
                src="/cytocare-hero-lab.jpg"
                alt="Cytocare lab"
                className="h-[620px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}