"use client";

import { useState } from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaPhoneAlt,
  FaTimes,
} from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function Navbar({
  onBookClick,
}: {
  onBookClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 md:px-8 md:py-4">
        <a href="/" className="block">
          <img
            src="/cytocare-logo.png"
            alt="CytoCare Path Lab"
            className="h-[75px] w-auto md:h-[105px]"
          />
        </a>

        <nav className="hidden items-center gap-12 text-[18px] font-semibold text-[#07142f] lg:flex">
          {siteConfig.navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              className={
                index === 0
                  ? "border-b-2 border-[#e71935] pb-7 text-[#e71935]"
                  : "pb-7"
              }
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex items-center gap-4 rounded-full border border-[#0b50d6] px-8 py-4 text-[20px] font-semibold text-[#0b50d6]"
          >
            <FaPhoneAlt />
            {siteConfig.phone}
          </a>

          <button
            onClick={onBookClick}
            className="flex items-center gap-4 rounded-full bg-[#0647c9] px-9 py-4 text-[20px] font-semibold text-white shadow-lg"
          >
            <FaCalendarAlt />
            Book Test
          </button>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0647c9] text-xl text-white md:hidden"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t bg-white px-5 py-5 md:hidden">
          <div className="space-y-4 text-lg font-semibold text-[#07142f]">
            {siteConfig.navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block"
              >
                {link.name}
              </a>
            ))}

            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-center gap-3 rounded-xl border border-[#0b50d6] px-5 py-4 text-[#0b50d6]"
            >
              <FaPhoneAlt />
              {siteConfig.phone}
            </a>

            <button
              onClick={() => {
                setMenuOpen(false);
                onBookClick();
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0647c9] px-5 py-4 text-white"
            >
              <FaCalendarAlt />
              Book Test
            </button>
          </div>
        </div>
      )}
    </header>
  );
}