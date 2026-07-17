"use client";

import { useState } from "react";
import {
  FaCheckCircle,
  FaChevronRight,
  FaShoppingCart,
  FaTimes,
} from "react-icons/fa";
import {
  healthCategories,
  healthPackagesByCategory,
  type HealthPackage,
} from "@/lib/healthCategoryPackages";

export default function HealthCategories({
  onCategoryClick,
}: {
  onCategoryClick: (packageName: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<HealthPackage | null>(
    null
  );

  const visibleCategories = showAll
    ? healthCategories
    : healthCategories.slice(0, 6);

  const selectedPackages =
    selectedCategory && healthPackagesByCategory[selectedCategory]
      ? healthPackagesByCategory[selectedCategory]
      : [];

  function handleCategoryClick(categoryName: string) {
    const packages = healthPackagesByCategory[categoryName];

    if (packages && packages.length > 0) {
      setSelectedCategory(categoryName);
      setSelectedPackage(null);
      return;
    }

    onCategoryClick(categoryName);
  }

  return (
    <section className="mx-auto max-w-[1500px] px-8 py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0b3e72] md:text-4xl">
            Doctors Curated Health Checkup Packages
          </h2>

          <p className="mt-2 text-lg text-slate-600">
            Browse by condition, concern, or wellness goal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex shrink-0 items-center gap-2 text-lg font-bold text-[#0b3e72] hover:underline"
        >
          {showAll ? "Show Less" : "See All"}
          <FaChevronRight
            className={`text-sm transition ${showAll ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid gap-5 ${
          showAll
            ? "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
            : "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
        }`}
      >
        {visibleCategories.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => handleCategoryClick(category.name)}
            className={`group relative flex min-h-[92px] items-center gap-4 overflow-hidden rounded-2xl bg-white px-6 py-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
              selectedCategory === category.name
                ? "ring-2 ring-[#0754dc]"
                : ""
            }`}
          >
            {category.badge && (
              <span className="absolute right-3 top-2 rounded-full bg-[#ffe8ef] px-3 py-1 text-xs font-bold text-[#e71935]">
                {category.badge}
              </span>
            )}

            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${category.bg}`}
            >
              <div className={`text-2xl ${category.text}`}>
                {category.icon}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#07142f]">
                {category.name}
              </h3>

              <p className="mt-1 text-xs font-medium text-slate-500 opacity-0 transition group-hover:opacity-100">
                {healthPackagesByCategory[category.name]?.length
                  ? "View packages"
                  : "Click to book"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedCategory && selectedPackages.length > 0 && (
        <div className="mt-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#0b3e72] md:text-4xl">
                Top Health Packages for {selectedCategory}
              </h2>

              <p className="mt-2 text-lg font-semibold text-slate-500">
                Select a package and add it to cart.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedPackage(null);
              }}
              className="rounded-full bg-slate-100 px-5 py-3 font-bold text-slate-600"
            >
              Hide Packages
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {selectedPackages.map((item) => (
              <HealthPackageCard
                key={item.packageName}
                item={item}
                onViewDetails={() => setSelectedPackage(item)}
                onAddToCart={() => onCategoryClick(item.packageName)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedPackage && (
        <PackageDetailsModal
          item={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onAddToCart={() => {
            onCategoryClick(selectedPackage.packageName);
            setSelectedPackage(null);
          }}
        />
      )}
    </section>
  );
}

function HealthPackageCard({
  item,
  onViewDetails,
  onAddToCart,
}: {
  item: HealthPackage;
  onViewDetails: () => void;
  onAddToCart: () => void;
}) {
  const tests = item.tests ?? [];
  const originalPrice = item.originalPrice ?? item.price;
  const saving =
    originalPrice > item.price
      ? Math.round(((originalPrice - item.price) / originalPrice) * 100)
      : 0;

  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="min-h-[190px] p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {item.badge && (
            <span className="rounded-full bg-[#ffe8ef] px-3 py-1 text-xs font-extrabold text-[#e71935]">
              {item.badge}
            </span>
          )}

          <span className="rounded-full bg-[#eafbff] px-3 py-1 text-xs font-extrabold text-[#0754dc]">
            {tests.length} Tests
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-[#e71935]">
          {item.title}
        </h3>

        <p className="mt-3 text-base font-semibold leading-7 text-slate-600">
          {item.description}
        </p>

        <button
          type="button"
          onClick={onViewDetails}
          className="mt-4 flex items-center gap-2 font-bold text-[#0b3e72]"
        >
          View Details
          <FaChevronRight className="text-xs" />
        </button>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 text-slate-500">
          <span className="font-semibold">Reports in</span>

          <span className="rounded-md bg-[#eafbff] px-3 py-1 font-bold text-[#07142f]">
            Same day
          </span>

          <span>|</span>

          <span className="font-semibold">Includes</span>

          <span className="rounded-md bg-slate-100 px-3 py-1 font-bold text-[#07142f]">
            {tests.length} tests
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-[#fff7f8] px-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-extrabold text-[#07142f]">
                ₹{item.price.toLocaleString("en-IN")}
              </span>

              {originalPrice > item.price && (
                <span className="text-lg text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}

              {saving > 0 && (
                <span className="rounded-full bg-[#10bfa4] px-3 py-1 text-xs font-bold text-white">
                  {saving}% OFF
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-semibold text-[#07142f]">
              ↪ Extra{" "}
              <span className="font-extrabold text-[#0754dc]">10% OFF</span>{" "}
              with Elite, if eligible
            </p>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            className="flex items-center gap-2 rounded-full bg-[#e71955] px-5 py-3 text-lg font-extrabold text-white"
          >
            <FaShoppingCart />
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageDetailsModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: HealthPackage;
  onClose: () => void;
  onAddToCart: () => void;
}) {
  const details = item.details ?? item.tests ?? [];
  const originalPrice = item.originalPrice ?? item.price;
  const saving =
    originalPrice > item.price
      ? Math.round(((originalPrice - item.price) / originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-[#0754dc]">Health Package</p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#07142f]">
              {item.title}
            </h2>

            <p className="mt-3 text-lg font-semibold text-slate-500">
              Reports in Same day • {details.length} tests included
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-3 text-slate-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="rounded-3xl bg-[#f8fbff] p-6">
          <p className="text-lg font-semibold leading-8 text-slate-600">
            {item.description}
          </p>

          <div className="mt-6 space-y-3">
            {details.map((detail, index) => (
              <div key={`${detail}-${index}`} className="flex items-start gap-3">
                <FaCheckCircle className="mt-1 shrink-0 text-[#05a832]" />
                <p className="font-semibold leading-6 text-[#07142f]">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#fff7f8] p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl font-extrabold text-[#07142f]">
                ₹{item.price.toLocaleString("en-IN")}
              </span>

              {originalPrice > item.price && (
                <span className="text-xl text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}

              {saving > 0 && (
                <span className="rounded-full bg-[#10bfa4] px-3 py-1 text-sm font-bold text-white">
                  {saving}% OFF
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-semibold text-[#07142f]">
              Elite members may get extra 10% discount if eligible.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            className="flex items-center gap-2 rounded-full bg-[#e71955] px-6 py-4 text-lg font-extrabold text-white"
          >
            <FaShoppingCart />
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}