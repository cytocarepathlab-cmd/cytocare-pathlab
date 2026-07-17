"use client";

import { useState } from "react";
import {
  FaBars,
  FaCalendarAlt,
  
  FaClipboardList,
  FaCrown,
  FaFileMedical,
  FaFlask,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaTimes,
  FaUser,
  FaUserMd,
  FaShoppingCart,
} from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function Navbar({
  onBookClick,
  userEmail = "",
  patientName = "",
  isPremiumMember = false,
  membershipPlan = "",
  onLoginClick = () => {},
  onLogoutClick = () => {},
  cartCount = 0,
  onCartClick = () => {},
}: {
  onBookClick: () => void;
  userEmail?: string;
  patientName?: string;
  isPremiumMember?: boolean;
  membershipPlan?: string;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  cartCount?: number;
  onCartClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  function goToPatientDashboard(tab?: string) {
    if (!userEmail) {
      onLoginClick();
      return;
    }

    if (tab === "reports") {
      window.location.href = "/patient-dashboard?tab=reports";
      return;
    }

    window.location.href = "/patient-dashboard";
  }

  const menuLinks = [
    {
      name: "Tests",
      href: "#tests",
      icon: FaFlask,
    },
    {
      name: "Packages",
      href: "#packages",
      icon: FaClipboardList,
    },
    {
      name: "Doctor Consultation",
      href: "#doctor-consultation",
      icon: FaUserMd,
    },
    {
      name: "About Cytocare",
      href: "#about",
      icon: FaFileMedical,
    },
    {
      name: "Contact Us",
      href: "#contact",
      icon: FaPhoneAlt,
    },
    {
      name: "Lab Centres",
      href: "#lab-centres",
      icon: FaMapMarkerAlt,
    },
    {
      name: "Reviews",
      href: "#reviews",
      icon: FaStar,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* TOP NAVBAR */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-3 md:px-8">
          
          
          {/* LOGO */}
          <a href="/" className="block shrink-0">
            <img
              src="/cytocare-logo.png"
              alt="CytoCare Path Lab"
              className="h-[70px] w-auto md:h-[90px]"
            />
          </a>

          {/* TOP RIGHT BUTTONS */}
<div className="ml-auto hidden min-w-0 items-center gap-3 lg:flex">
  <button
    type="button"
    onClick={onCartClick}
    className="relative flex h-[58px] w-[145px] shrink-0 items-center justify-center gap-3 rounded-[14px] border border-slate-200 bg-white text-base font-extrabold text-[#07142f] shadow-sm hover:border-[#0754dc] hover:text-[#0754dc]"
  >
    <FaShoppingCart className="text-lg" />
    Cart

    {cartCount > 0 && (
      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#e71935] text-sm font-bold text-white">
        {cartCount}
      </span>
    )}
  </button>

  <button
    type="button"
    onClick={onBookClick}
    className="flex h-[58px] w-[210px] shrink-0 items-center justify-center gap-3 rounded-[14px] bg-[#0754dc] text-base font-extrabold text-white shadow-md transition hover:bg-[#0647c9]"
  >
    <FaCalendarAlt className="text-lg" />
    Book Test
  </button>

  <a
    href="#doctor-consultation"
    className="flex h-[58px] w-[250px] shrink-0 items-center justify-center gap-3 rounded-[14px] bg-[#e71935] text-base font-extrabold text-white shadow-md transition hover:bg-[#d9142e]"
  >
    <FaUserMd className="text-lg" />
    Book Appointment
  </a>

  {userEmail ? (
  <div
    className={`flex h-[58px] w-[390px] shrink-0 items-center gap-3 rounded-2xl px-4 shadow-sm transition ${
      isPremiumMember
        ? "border border-[#d4af37]/70 bg-gradient-to-r from-[#050505] via-[#111111] to-[#1b1405] text-white shadow-[0_0_28px_rgba(212,175,55,0.28)]"
        : "border border-slate-200 bg-white text-[#07142f]"
    }`}
  >
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        isPremiumMember
          ? "bg-gradient-to-br from-[#fff6c7] via-[#d4af37] to-[#9b6b12] text-[#111111] shadow-[0_0_18px_rgba(212,175,55,0.45)]"
          : "bg-transparent text-[#07142f]"
      }`}
    >
      {isPremiumMember ? (
        <FaCrown className="text-lg" />
      ) : (
        <FaUser className="text-xl" />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <p
        className={`text-xs font-semibold ${
          isPremiumMember ? "text-[#f7d774]" : "text-slate-500"
        }`}
      >
        {isPremiumMember ? "Elite Member" : "Welcome"}
      </p>

      <p
        className={`text-sm font-extrabold leading-tight ${
          isPremiumMember ? "text-white" : "text-[#07142f]"
        }`}
      >
        Hello {patientName || "Patient"}
      </p>

      {isPremiumMember && membershipPlan && (
        <p className="truncate text-[11px] font-semibold text-[#d4af37]">
          {membershipPlan}
        </p>
      )}
    </div>

    <button
      type="button"
      onClick={onLogoutClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
        isPremiumMember
          ? "bg-[#d4af37] text-[#111111] hover:bg-[#f7d774]"
          : "bg-[#e71935] text-white"
      }`}
    >
      Logout
    </button>
  </div>
) : (
    <button
      type="button"
      onClick={onLoginClick}
      className="flex h-[58px] w-[190px] shrink-0 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-base font-extrabold text-[#07142f] shadow-sm hover:border-[#0754dc] hover:text-[#0754dc]"
    >
      Patient Login
      <FaUser className="text-lg" />
    </button>
  )}
</div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0754dc] text-xl text-white lg:hidden"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* SECOND NAVBAR */}
      <div className="hidden bg-white lg:block">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-4">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-4 text-xl font-bold text-[#07142f]"
          >
            <FaBars />
            Menu
          </button>

          <nav className="flex items-center gap-20 text-xl font-bold text-[#07142f]">
            <a
              href="/"
              className="flex items-center gap-3 text-[#e71935]"
            >
              <FaHome />
              Home
            </a>

            <button
              type="button"
              onClick={() => goToPatientDashboard("bookings")}
              className="flex items-center gap-3 hover:text-[#0754dc]"
            >
              <a
  href="/tests"
  className="rounded-xl px-4 py-2 text-sm font-bold text-[#07142f] transition hover:bg-[#eef5ff] hover:text-[#0754dc]"
>
  All Tests
</a>
              <FaCalendarAlt />
              My Bookings
            </button>

            <button
              type="button"
              onClick={() => goToPatientDashboard("reports")}
              className="flex items-center gap-3 hover:text-[#0754dc]"
            >
              <FaFileMedical />
              My Reports
            </button>
          </nav>

          <a
            href={`tel:${siteConfig.phone}`}
            className="flex items-center gap-3 text-xl font-extrabold text-[#07142f]"
          >
            <FaPhoneAlt className="text-[#0754dc]" />
            {siteConfig.phone}
          </a>
        </div>
      </div>

      {/* MENU DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-[#07142f]">
                  Menu
                </h2>
                <p className="mt-1 text-slate-500">
                  Explore Cytocare Path Lab services
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* LOGIN AREA IN MENU */}
            {userEmail ? (
              <div className="mb-6 rounded-2xl bg-[#f5f9ff] p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Logged in as
                </p>
                <p className="mt-1 break-all text-lg font-extrabold text-[#07142f]">
                  {userEmail}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogoutClick();
                  }}
                  className="mt-4 rounded-xl bg-[#e71935] px-5 py-3 font-bold text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLoginClick();
                }}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#07142f] px-5 py-4 text-lg font-bold text-white"
              >
                Patient Login
                <FaUser />
              </button>
            )}

            {/* QUICK ACTIONS */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onBookClick();
                }}
                className="rounded-2xl bg-[#0754dc] px-4 py-4 font-bold text-white"
              >
                Book Test
              </button>

              <a
                href="#doctor-consultation"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-[#e71935] px-4 py-4 text-center font-bold text-white"
              >
                Appointment
              </a>
            </div>

            {/* MENU LINKS */}
            <div className="space-y-3">
              {menuLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-lg font-bold text-[#07142f] shadow-sm hover:bg-[#f5f9ff] hover:text-[#0754dc]"
                  >
                    <Icon className="text-[#0754dc]" />
                    {item.name}
                  </a>
                );
              })}
            </div>

            {/* PATIENT LINKS */}
            <div className="mt-6 rounded-2xl bg-[#f5f9ff] p-5">
              <h3 className="mb-4 text-xl font-extrabold text-[#07142f]">
                Patient Area
              </h3>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  goToPatientDashboard("bookings");
                }}
                className="mb-3 flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold text-[#07142f]"
              >
                <FaCalendarAlt className="text-[#0754dc]" />
                My Bookings
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  goToPatientDashboard("reports");
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold text-[#07142f]"
              >
                <FaFileMedical className="text-[#0754dc]" />
                My Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}