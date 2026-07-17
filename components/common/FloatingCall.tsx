"use client";

import { FaPhoneAlt } from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function FloatingCall() {
  return (
    <a
      href={`tel:${siteConfig.phone}`}
      aria-label="Call Cytocare Path Lab"
      title={`Call ${siteConfig.phone}`}
      className="fixed bottom-28 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#0754dc] text-2xl text-white shadow-2xl transition hover:scale-105 hover:bg-[#0647c9]"
    >
      <FaPhoneAlt />
    </a>
  );
}