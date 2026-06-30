"use client";

import { useState } from "react";
import {
  FaCalendarAlt,
  FaHome,
  FaSearch,
  FaShieldAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function Hero({
  onBookClick,
  onHomeCollectionClick,
}: {
  onBookClick: () => void;
  onHomeCollectionClick: () => void;
}) {
  const [search, setSearch] = useState("");

  return (
    <section className="mx-auto max-w-[1500px] px-8 pt-16 pb-10">
      <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        {/* LEFT SIDE */}
        <div>
          <div className="mb-9 inline-flex items-center gap-3 rounded-full bg-[#e8f0ff] px-5 py-3 text-[17px] font-medium text-[#0647c9]">
            <FaShieldAlt />
            Trusted Pathology Laboratory in Jamshedpur
          </div>

          <h1 className="text-[70px] font-extrabold leading-[1.05] tracking-tight text-[#07142f] xl:text-[84px]">
            Quality Care
            <br />
            <span className="text-[#1055e8]">Innovation.</span>
          </h1>

          <p className="mt-7 max-w-[650px] text-[21px] leading-[1.7] text-[#4b5567]">
            Accurate diagnostic tests, affordable health packages,
            <br />
            home sample collection and fast digital reports.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-8 flex max-w-[670px] items-center rounded-[24px] bg-white p-3 shadow-sm">
            <FaSearch className="ml-4 text-2xl text-[#4b5567]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Blood Tests (e.g. CBC, Thyroid, Vitamin D)"
              className="flex-1 bg-transparent px-5 text-[17px] outline-none"
            />

            <button className="rounded-[20px] bg-[#0647c9] px-10 py-4 text-[18px] font-semibold text-white">
              Search
            </button>
          </div>

          {/* CTA BUTTONS */}
          <div className="mt-8 flex flex-nowrap gap-6">
            <button
              onClick={onBookClick}
              className="flex w-[180px] items-center justify-center gap-3 rounded-xl bg-[#0754dc] py-5 text-[19px] font-bold text-white shadow-lg"
            >
              <FaCalendarAlt />
              Book Test
            </button>

            <button
              onClick={onHomeCollectionClick}
              className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-[#e71935] py-5 text-[19px] font-bold text-white shadow-lg"
            >
              <FaHome />
              Home Collection
            </button>

            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              className="flex w-[185px] items-center justify-center gap-3 rounded-xl bg-[#05a832] py-5 text-[19px] font-bold text-white shadow-lg"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="overflow-hidden rounded-[22px] shadow-xl">
          <img
            src="/cytocare-hero-lab.jpg"
            alt="CytoCare Path Lab"
            className="h-[515px] w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}