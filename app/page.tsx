"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import PopularTests from "@/components/home/PopularTests";
import Packages from "@/components/home/Packages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/layout/Footer";
import FloatingWhatsapp from "@/components/common/FloatingWhatsapp";
import BookingModal from "@/components/common/BookingModal";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState("Book Test");

  function openBooking(type: string) {
    setBookingType(type);
    setIsBookingOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <Navbar onBookClick={() => openBooking("Book Test")} />

      <Hero
        onBookClick={() => openBooking("Book Test")}
        onHomeCollectionClick={() => openBooking("Home Collection")}
      />

      <Stats />

      <PopularTests onBookClick={() => openBooking("Book Test")} />

      <Packages onBookClick={() => openBooking("Health Package")} />

      <WhyChooseUs />

      <FAQ />

      <Footer />

      <FloatingWhatsapp />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        bookingType={bookingType}
      />
    </main>
  );
}