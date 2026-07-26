import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Cytocare Pathlab",
  description:
    "Read how Cytocare Pathlab collects, uses, stores and protects patient information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-extrabold text-[#0754dc] sm:text-2xl"
          >
            Cytocare Pathlab
          </Link>

          <Link
            href="/"
            className="rounded-xl bg-[#0754dc] px-5 py-3 font-bold text-white transition hover:bg-[#0648bd]"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="border-b border-slate-200 pb-7">
            <p className="mb-3 font-bold uppercase tracking-wider text-[#0754dc]">
              Cytocare Pathlab
            </p>

            <h1 className="text-3xl font-extrabold text-[#07142f] sm:text-4xl">
              Privacy Policy
            </h1>

            <p className="mt-4 text-slate-500">
              Last updated: 26 July 2026
            </p>
          </div>

          <div className="mt-8 space-y-9 leading-7 text-slate-700">
            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                1. Introduction
              </h2>

              <p className="mt-3">
                Cytocare Pathlab respects your privacy and is committed to
                protecting the personal information you provide while using our
                website, booking diagnostic services, requesting home sample
                collection, consulting doctors or accessing laboratory reports.
              </p>

              <p className="mt-3">
                This Privacy Policy explains what information we may collect,
                why we collect it, how it may be used and shared, and the
                choices available to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                2. Information we may collect
              </h2>

              <p className="mt-3">
                Depending on the services you use, we may collect:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Your full name, email address, phone number and account
                  information.
                </li>

                <li>
                  Your address and location information required for home sample
                  collection.
                </li>

                <li>
                  Patient details such as age, date of birth, gender and family
                  member information.
                </li>

                <li>
                  Diagnostic-test bookings, appointment details and selected
                  packages.
                </li>

                <li>
                  Prescriptions, test requests, sample-collection information,
                  reports and other health-related information you voluntarily
                  provide.
                </li>

                <li>
                  Payment status, invoices and transaction references when
                  online or digital payment services are used.
                </li>

                <li>
                  Messages, enquiries, feedback and communications sent to
                  Cytocare Pathlab.
                </li>

                <li>
                  Technical information such as browser type, device type, IP
                  address, cookies and website usage information.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                3. How we use your information
              </h2>

              <p className="mt-3">We may use your information to:</p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Create and manage your patient account.</li>

                <li>
                  Confirm diagnostic-test bookings, appointments and home sample
                  collections.
                </li>

                <li>
                  Coordinate with laboratories, doctors, phlebotomists and
                  authorised service providers.
                </li>

                <li>
                  Generate, process, store and deliver laboratory reports.
                </li>

                <li>
                  Contact you about appointments, sample collection, payments,
                  reports and service updates.
                </li>

                <li>
                  Remember your saved details to make future bookings easier.
                </li>

                <li>
                  Detect misuse, protect accounts and maintain website security.
                </li>

                <li>
                  Improve our website, services and patient experience.
                </li>

                <li>
                  Meet legal, regulatory, accounting or medical-record
                  requirements that apply to our services.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                4. Google account login
              </h2>

              <p className="mt-3">
                When you choose “Continue with Google,” Google and our
                authentication provider may provide basic account information
                such as your name, email address, profile picture and a unique
                account identifier.
              </p>

              <p className="mt-3">
                Cytocare Pathlab does not receive or store your Google password.
                Information received through Google login is used to create,
                identify and secure your Cytocare patient account.
              </p>

              <p className="mt-3">
                Google login does not normally provide the phone number required
                for home collection or patient communication. We may therefore
                ask you to provide and verify your phone number separately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                5. How information may be shared
              </h2>

              <p className="mt-3">
                We do not sell patient personal information. Information may be
                shared only when reasonably necessary with:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Cytocare Pathlab staff and authorised representatives.
                </li>

                <li>
                  Partner laboratories, doctors, sample collectors and
                  healthcare service providers involved in delivering the
                  requested service.
                </li>

                <li>
                  Technology providers that support authentication, hosting,
                  database storage, communication, analytics or report delivery.
                </li>

                <li>
                  Payment providers when a patient chooses an online-payment
                  facility.
                </li>

                <li>
                  Government authorities, courts or regulators when disclosure
                  is required by applicable law.
                </li>
              </ul>

              <p className="mt-3">
                Service providers are expected to use the information only for
                the authorised purpose and protect it appropriately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                6. Storage and security
              </h2>

              <p className="mt-3">
                We use reasonable administrative, technical and organisational
                measures intended to protect personal information against
                unauthorised access, alteration, disclosure, loss or misuse.
              </p>

              <p className="mt-3">
                These measures may include access controls, authenticated
                accounts, restricted administrative access, secure hosting and
                other appropriate security practices.
              </p>

              <p className="mt-3">
                No website, internet transmission or electronic-storage system
                can be guaranteed to be completely secure. Patients should keep
                their passwords and devices protected and contact us immediately
                if they suspect unauthorised account access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                7. Cookies and similar technologies
              </h2>

              <p className="mt-3">
                Our website may use cookies or similar technologies to maintain
                login sessions, remember preferences, protect accounts,
                understand website usage and improve performance.
              </p>

              <p className="mt-3">
                You may restrict cookies through your browser settings, but
                certain website functions, including login, may not operate
                correctly after cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                8. Data retention
              </h2>

              <p className="mt-3">
                We retain personal information only for as long as reasonably
                necessary to provide requested services, maintain patient and
                transaction records, resolve disputes, protect against misuse
                and comply with applicable legal or regulatory obligations.
              </p>

              <p className="mt-3">
                Retention periods may differ depending on the type of
                information and the purpose for which it was collected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                9. Your choices and requests
              </h2>

              <p className="mt-3">
                Subject to applicable law and legitimate record-retention
                requirements, you may contact us to:
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Request access to your personal information.</li>

                <li>Request correction of inaccurate information.</li>

                <li>Update your patient profile and contact details.</li>

                <li>
                  Withdraw consent for optional communications or processing.
                </li>

                <li>
                  Request deletion or closure of your website account where
                  legally permitted.
                </li>

                <li>
                  Raise a concern regarding the handling of your information.
                </li>
              </ul>

              <p className="mt-3">
                We may ask for reasonable identity verification before acting on
                a request so that another person cannot access or alter your
                patient information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                10. Children and minor patients
              </h2>

              <p className="mt-3">
                Services for patients under 18 years of age should be booked and
                managed by a parent or lawful guardian. The parent or guardian
                should provide the required details and consent on behalf of the
                minor patient.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                11. Third-party websites and services
              </h2>

              <p className="mt-3">
                Our website may contain links to third-party websites or use
                third-party services. Their privacy practices are governed by
                their own policies. Cytocare Pathlab is not responsible for the
                content or privacy practices of independent third-party
                websites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                12. Changes to this policy
              </h2>

              <p className="mt-3">
                We may update this Privacy Policy when our services, technology
                or legal obligations change. The updated version will be posted
                on this page with a revised “Last updated” date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                13. Contact us
              </h2>

              <p className="mt-3">
                For privacy questions, correction requests, account-deletion
                requests or complaints, contact:
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="font-extrabold text-[#07142f]">
                  Cytocare Pathlab
                </p>

                <p className="mt-2">Jamshedpur, Jharkhand, India</p>

                <p className="mt-2">
                  Email:{" "}
                  <a
                    href="mailto:cytocarepathlab@gmail.com"
                    className="font-bold text-[#0754dc] hover:underline"
                  >
                    cytocarepathlab@gmail.com
                  </a>
                </p>

                <p className="mt-2">
                  Phone:{" "}
                  <a
  href="tel:+916203572424"
  className="font-bold text-[#0754dc] hover:underline"
>
  +91 62035 72424
</a>
                </p>
              </div>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}