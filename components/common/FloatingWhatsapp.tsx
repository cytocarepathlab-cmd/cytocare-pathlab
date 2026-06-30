import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/constants/site";

export default function FloatingWhatsapp() {
  return (
    <a
      href={`https://wa.me/${siteConfig.whatsapp}`}
      target="_blank"
      className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#05a832] text-4xl text-white shadow-2xl"
    >
      <FaWhatsapp />
    </a>
  );
}