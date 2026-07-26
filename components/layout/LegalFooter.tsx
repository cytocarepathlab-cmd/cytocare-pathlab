import Link from "next/link";

export default function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#07142f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-xl font-extrabold">Cytocare Pathlab</p>

            <p className="mt-2 text-sm text-slate-300">
              Reliable diagnostic services and home sample collection.
            </p>
          </div>

          <nav
            aria-label="Legal links"
            className="flex flex-wrap items-center justify-center gap-5 text-sm font-semibold"
          >
            <Link
              href="/privacy-policy"
              className="text-slate-200 transition hover:text-white hover:underline"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms-and-conditions"
              className="text-slate-200 transition hover:text-white hover:underline"
            >
              Terms and Conditions
            </Link>

            <a
              href="mailto:cytocarepathlab@gmail.com"
              className="text-slate-200 transition hover:text-white hover:underline"
            >
              Contact Us
            </a>
          </nav>
        </div>

        <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Cytocare Pathlab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}