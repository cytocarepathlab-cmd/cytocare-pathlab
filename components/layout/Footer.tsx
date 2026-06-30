import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function Footer() {
  return (
    <footer id="contact" className="bg-white px-8 py-12">
      <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-3">
        <div>
          <img
            src="/cytocare-logo.png"
            alt="CytoCare Path Lab"
            className="h-[95px] w-auto"
          />
          <p className="mt-4 max-w-sm text-slate-600">
            Trusted pathology laboratory in Jamshedpur for diagnostic tests,
            health packages and home sample collection.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-[#07142f]">
            Quick Links
          </h3>
          <div className="mt-5 space-y-3 text-slate-600">
            <p>Home</p>
            <p>Tests</p>
            <p>Packages</p>
            <p>About</p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-[#07142f]">
            Contact
          </h3>

          <div className="mt-5 space-y-4 text-slate-600">
            <p className="flex items-center gap-3">
              <FaPhoneAlt className="text-[#0754dc]" />
              {siteConfig.phone}
            </p>

            <p className="flex items-center gap-3">
              <FaWhatsapp className="text-[#05a832]" />
              WhatsApp Booking Available
            </p>

            <p className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-[#e71935]" />
              Jamshedpur, Jharkhand
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1500px] border-t pt-6 text-center text-slate-500">
        © 2026 CytoCare Path Lab. All rights reserved.
      </div>
    </footer>
  );
}