import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | Cytocare Pathlab",
  description:
    "Terms governing the use of Cytocare Pathlab's website and diagnostic services.",
};

export default function TermsAndConditionsPage() {
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
              Terms and Conditions
            </h1>

            <p className="mt-4 text-slate-500">
              Last updated: 26 July 2026
            </p>
          </div>

          <div className="mt-8 space-y-9 leading-7 text-slate-700">
            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                1. Acceptance of these terms
              </h2>

              <p className="mt-3">
                These Terms and Conditions govern your access to and use of the
                Cytocare Pathlab website, patient account, diagnostic-test
                booking facilities, home sample collection, doctor consultation
                features, reports and related services.
              </p>

              <p className="mt-3">
                By accessing the website, creating an account or booking a
                service, you agree to these Terms and Conditions and our Privacy
                Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                2. About Cytocare Pathlab services
              </h2>

              <p className="mt-3">
                Cytocare Pathlab provides or facilitates diagnostic-testing
                services, sample collection, health packages, laboratory
                reports, doctor appointments and other healthcare-related
                services displayed on the website.
              </p>

              <p className="mt-3">
                Certain tests or services may be performed by authorised
                partner laboratories, doctors, collection personnel or other
                healthcare service providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                3. Patient accounts
              </h2>

              <p className="mt-3">
                You must provide accurate, current and complete information when
                creating or updating an account.
              </p>

              <p className="mt-3">
                You are responsible for protecting your password, Google account
                access and the device used to access your patient account. You
                must notify Cytocare Pathlab promptly if you suspect
                unauthorised use.
              </p>

              <p className="mt-3">
                A patient may not impersonate another person or use another
                person’s health information without lawful authority or
                permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                4. Google sign-in
              </h2>

              <p className="mt-3">
                When you use Google sign-in, your access is also subject to the
                applicable Google account terms and policies. Cytocare Pathlab
                does not control the availability or security of your Google
                account.
              </p>

              <p className="mt-3">
                You remain responsible for providing any additional patient
                information, such as a phone number, address, age or booking
                details, that is not received through Google sign-in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                5. Bookings and appointments
              </h2>

              <p className="mt-3">
                A booking request is subject to availability, service-area
                coverage, required preparation, prescription requirements,
                laboratory capacity and confirmation by Cytocare Pathlab.
              </p>

              <p className="mt-3">
                You must provide correct patient, test, address and contact
                details. Cytocare Pathlab is not responsible for delays caused
                by incomplete or incorrect information supplied by the patient.
              </p>

              <p className="mt-3">
                Selected collection times are preferred time slots and may
                change due to traffic, weather, staff availability, emergencies
                or circumstances beyond reasonable control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                6. Test preparation and sample collection
              </h2>

              <p className="mt-3">
                Some tests may require fasting, medication-related precautions,
                specific timing or other preparation. Patients are responsible
                for following the instructions provided by Cytocare Pathlab,
                their treating doctor or the relevant laboratory.
              </p>

              <p className="mt-3">
                Failure to follow the required preparation may affect the
                accuracy of results or require recollection of the sample.
              </p>

              <p className="mt-3">
                The patient must provide a safe and reasonably accessible
                location for home sample collection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                7. Laboratory reports
              </h2>

              <p className="mt-3">
                Report-delivery times displayed on the website are estimates.
                Reports may be delayed when a sample requires additional
                processing, confirmation, recollection, referral testing or
                quality review.
              </p>

              <p className="mt-3">
                Reports are prepared using the information and samples provided
                for the identified patient. Patients should verify that the
                information shown on the report is correct.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                8. Medical disclaimer
              </h2>

              <p className="mt-3">
                Website content, test descriptions, package information and
                automated messages are provided for general information and
                service-facilitation purposes. They are not a substitute for
                individual medical advice, diagnosis or treatment.
              </p>

              <p className="mt-3">
                Laboratory results should be interpreted by a qualified medical
                professional in the context of symptoms, medical history,
                physical examination and other relevant information.
              </p>

              <p className="mt-3">
                Cytocare Pathlab’s website is not an emergency service. In a
                medical emergency, contact the appropriate emergency service or
                visit the nearest hospital immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                9. Fees and payments
              </h2>

              <p className="mt-3">
                Prices displayed on the website may be updated from time to
                time. The applicable amount, discounts, membership benefits,
                home-collection charges and taxes will be shown or communicated
                before payment or booking confirmation.
              </p>

              <p className="mt-3">
                A booking may remain pending until the required payment or
                confirmation has been completed.
              </p>

              <p className="mt-3">
                Online payments, when available, may be processed by a
                third-party payment provider and may also be subject to that
                provider’s terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                10. Cancellations, rescheduling and refunds
              </h2>

              <p className="mt-3">
                Cancellation, rescheduling and refund eligibility may depend on
                whether sample collection has started, whether testing has
                commenced, whether a collection professional has travelled to
                the address and whether costs have already been incurred.
              </p>

              <p className="mt-3">
                Approved refunds will be processed using the available payment
                method and may require a reasonable processing period.
              </p>

              <p className="mt-3">
                Cytocare Pathlab may cancel or reschedule a service because of
                operational issues, safety concerns, incorrect bookings,
                unavailable tests or circumstances beyond reasonable control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                11. Membership benefits
              </h2>

              <p className="mt-3">
                Membership benefits, discounts, validity periods, family-member
                limits and home-collection conditions are governed by the plan
                details displayed at the time of purchase.
              </p>

              <p className="mt-3">
                Membership benefits are personal, non-transferable except for
                eligible registered family members, and cannot be exchanged for
                cash.
              </p>

              <p className="mt-3">
                Benefits expire at the end of the applicable membership period
                unless renewed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                12. User responsibilities
              </h2>

              <p className="mt-3">You agree not to:</p>

              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Provide false patient or booking information.</li>

                <li>
                  Access another person’s account, reports or private
                  information without authority.
                </li>

                <li>
                  Upload harmful software, unlawful material or misleading
                  prescriptions.
                </li>

                <li>
                  Interfere with the website, authentication system, database or
                  security controls.
                </li>

                <li>
                  Copy, scrape, resell or commercially exploit website content
                  without permission.
                </li>

                <li>
                  Threaten, abuse or harass staff, doctors, collection personnel
                  or other service providers.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                13. Third-party providers
              </h2>

              <p className="mt-3">
                Certain services may depend on independent laboratories,
                doctors, payment providers, communication services, hosting
                providers or other third parties.
              </p>

              <p className="mt-3">
                Cytocare Pathlab will take reasonable steps to coordinate
                services but cannot guarantee the uninterrupted availability of
                every third-party system or service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                14. Intellectual property
              </h2>

              <p className="mt-3">
                The Cytocare Pathlab name, logo, website design, graphics,
                original content and related materials are owned by or licensed
                to Cytocare Pathlab and may not be reproduced or used without
                written permission.
              </p>

              <p className="mt-3">
                Patient laboratory reports and personal medical documents
                remain available for the patient’s authorised personal and
                medical use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                15. Website availability
              </h2>

              <p className="mt-3">
                We aim to keep the website available and accurate, but access
                may occasionally be interrupted for maintenance, updates,
                security measures, network failures or events beyond our
                reasonable control.
              </p>

              <p className="mt-3">
                We may modify, suspend or discontinue a website feature when
                reasonably necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                16. Limitation of responsibility
              </h2>

              <p className="mt-3">
                To the extent permitted by applicable law, Cytocare Pathlab will
                not be responsible for indirect or consequential loss arising
                from website interruptions, unauthorised user conduct, incorrect
                information supplied by a patient or events outside reasonable
                control.
              </p>

              <p className="mt-3">
                Nothing in these Terms excludes responsibilities that cannot
                lawfully be excluded.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                17. Privacy
              </h2>

              <p className="mt-3">
                Our collection and handling of personal information is explained
                in our{" "}
                <Link
                  href="/privacy-policy"
                  className="font-bold text-[#0754dc] hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                18. Changes to these terms
              </h2>

              <p className="mt-3">
                We may update these Terms and Conditions to reflect changes in
                our services, prices, technology or applicable requirements.
                Updated terms will be posted on this page with the revised “Last
                updated” date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                19. Governing law and disputes
              </h2>

              <p className="mt-3">
                These Terms and Conditions are governed by the laws applicable
                in India. Subject to applicable consumer-protection and other
                mandatory legal rights, disputes will fall under the
                jurisdiction of the competent courts serving Jamshedpur,
                Jharkhand.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#07142f]">
                20. Contact us
              </h2>

              <p className="mt-3">
                For booking, payment, service or terms-related questions,
                contact:
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