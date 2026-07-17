"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaClock,
  FaFlask,
  FaSearch,
  FaShoppingCart,
  FaTags,
  FaVial,
} from "react-icons/fa";
import { cytocareCategories, cytocareTests } from "@/lib/cytocareTests";

const CART_KEY = "cytocare_cart";

export default function AllTestsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTests = useMemo(() => {
    const q = search.toLowerCase().trim();

    return cytocareTests.filter((test) => {
      const matchesCategory =
        selectedCategory === "All" || test.category === selectedCategory;

      const matchesSearch =
        !q ||
        [
          test.name,
          test.category,
          test.vial,
          test.reportingTime,
          String(test.price),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  function getSavedCart() {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  }

  function addToCart(testName: string) {
    const currentCart = getSavedCart();

    if (currentCart.includes(testName)) {
      alert("This test is already in your cart.");
      return;
    }

    const updatedCart = [...currentCart, testName];
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    alert(`${testName} added to cart.`);
  }

  function bookNow(testName: string) {
    const currentCart = getSavedCart();
    const updatedCart = currentCart.includes(testName)
      ? currentCart
      : [...currentCart, testName];

    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    window.location.href = "/cart";
  }

  function formatPrice(price: number) {
    return price.toLocaleString("en-IN");
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl bg-[#eef5ff] px-5 py-3 font-extrabold text-[#0754dc]"
          >
            <FaArrowLeft />
            Back to Home
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center gap-3 rounded-xl bg-[#0754dc] px-5 py-3 font-extrabold text-white"
          >
            <FaShoppingCart />
            Go to Cart
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-10 md:px-6">
        <div className="rounded-[32px] bg-gradient-to-br from-[#07142f] via-[#0b2b62] to-[#0754dc] p-7 text-white shadow-xl md:p-10">
          <p className="font-extrabold uppercase tracking-[0.2em] text-[#b9d2ff]">
            Cytocare Test Menu
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">
            All Lab Tests & Packages
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100">
            Search and book from Cytocare&apos;s complete test menu. Elite
            members get 10% discount on all Cytocare tests and free home sample
            collection above ₹699.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoBox
              icon={<FaFlask />}
              title={`${cytocareTests.length}+`}
              text="Tests & profiles"
            />
            <InfoBox
              icon={<FaTags />}
              title="10%"
              text="Elite discount"
            />
            <InfoBox
              icon={<FaShoppingCart />}
              title="₹699+"
              text="Free home collection for Elite members"
            />
          </div>
        </div>

        <div className="sticky top-0 z-20 mt-8 rounded-3xl bg-white p-4 shadow-md">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CBC, LFT, TSH, Vitamin D, Fever Panel..."
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fbff] py-4 pl-14 pr-5 text-lg font-semibold outline-none focus:border-[#0754dc]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4 text-lg font-extrabold outline-none focus:border-[#0754dc]"
            >
              <option value="All">All Categories</option>
              {cytocareCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-extrabold ${
                selectedCategory === "All"
                  ? "bg-[#0754dc] text-white"
                  : "bg-[#eef5ff] text-[#0754dc]"
              }`}
            >
              All ({cytocareTests.length})
            </button>

            {cytocareCategories.map((category) => {
              const count = cytocareTests.filter(
                (test) => test.category === category
              ).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full px-5 py-3 text-sm font-extrabold ${
                    selectedCategory === category
                      ? "bg-[#0754dc] text-white"
                      : "bg-[#eef5ff] text-[#0754dc]"
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold">
            {filteredTests.length} tests found
          </h2>

          <p className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-500 shadow-sm">
            Prices shown are MRP
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTests.map((test) => (
            <article
              key={test.id}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-xs font-extrabold text-[#0754dc]">
                  {test.category}
                </span>

                <span className="rounded-full bg-[#eafff0] px-4 py-2 text-xs font-extrabold text-[#05a832]">
                  ₹{formatPrice(test.price)}
                </span>
              </div>

              <h3 className="min-h-[64px] text-xl font-extrabold leading-snug">
                {test.name}
              </h3>

              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <FaVial className="text-[#0754dc]" />
                  <span>{test.vial || "As advised by lab"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FaClock className="text-[#0754dc]" />
                  <span>{test.reportingTime || "Contact lab"}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(test.name)}
                  className="rounded-2xl border border-[#0754dc] px-4 py-3 font-extrabold text-[#0754dc]"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => bookNow(test.name)}
                  className="rounded-2xl bg-[#0754dc] px-4 py-3 font-extrabold text-white"
                >
                  Book Now
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-3xl font-extrabold">No test found</h2>
            <p className="mt-3 text-slate-500">
              Try searching with another test name, category, or price.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl">
        {icon}
      </div>

      <h3 className="text-3xl font-extrabold">{title}</h3>
      <p className="mt-1 font-semibold text-blue-100">{text}</p>
    </div>
  );
}
