"use client";

import type { ReactNode } from "react";
import {
  FaCheckCircle,
  FaCrown,
  FaGem,
  FaHome,
  FaPercent,
  FaPiggyBank,
  FaShieldAlt,
  FaStethoscope,
  FaUsers,
} from "react-icons/fa";

type MembershipPlansProps = {
  onChoosePlan: (planName: string) => void;
  isEliteMember?: boolean;
  patientName?: string;
  membershipPlan?: string;
  membershipExpiresAt?: string | null;
};

export default function MembershipPlans({
  onChoosePlan,
  isEliteMember = false,
  patientName = "",
  membershipPlan = "",
  membershipExpiresAt = null,
}: MembershipPlansProps) {
  if (isEliteMember) {
    return (
      <section className="bg-[#f5f9ff] px-3 py-6 md:px-6 md:py-12">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#050505] via-[#101010] to-[#1f1706] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:rounded-[34px] md:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.8fr] lg:gap-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#f7d774] md:text-sm">
                <FaCrown />
                Elite Member Active
              </div>

              <h2 className="max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-6xl">
                Welcome Elite Member
                {patientName ? `, ${patientName}` : ""}
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-lg md:leading-8">
                Your Cytocare Elite privileges are active. You will get 10%
                discount on Cytocare tests and free home sample collection on
                orders above ₹699.
              </p>

              <div className="mt-5 rounded-3xl border border-[#d4af37]/30 bg-white/5 p-4 md:mt-7 md:p-5">
                <p className="text-sm font-semibold leading-7 text-slate-300">
                  <span className="font-extrabold text-[#f7d774]">
                    Active Plan:
                  </span>{" "}
                  {membershipPlan || "Cytocare Elite Membership"}
                </p>

                {membershipExpiresAt && (
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">
                    <span className="font-extrabold text-[#f7d774]">
                      Valid Till:
                    </span>{" "}
                    {new Date(membershipExpiresAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[26px] border border-[#d4af37]/40 bg-gradient-to-br from-[#17120a] via-[#070707] to-[#211706] p-5 shadow-[0_0_40px_rgba(212,175,55,0.18)] md:rounded-[30px] md:p-7">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/60 bg-black text-3xl text-[#f7d774] shadow-[0_0_25px_rgba(212,175,55,0.45)] md:h-20 md:w-20 md:text-4xl">
                  <FaGem />
                </div>

                <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.22em] text-[#f7d774] md:text-sm">
                  Your Privileges
                </p>

                <h3 className="mt-3 text-2xl font-extrabold text-white md:text-4xl">
                  Elite Benefits Active
                </h3>
              </div>

              <div className="mt-6 space-y-3 md:mt-8 md:space-y-4">
                <PlanPoint text="10% discount on all Cytocare tests" />
                <PlanPoint text="Free home sample collection above ₹699" />
                <PlanPoint text="Covers up to 4 registered family members" />
                <PlanPoint text="Priority booking and report support" />
              </div>

              <a
                href="/elite-family"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#fff7c2] via-[#f5c842] to-[#d4af37] px-5 py-4 text-base font-extrabold text-black shadow-[0_0_28px_rgba(245,200,66,0.45)] transition hover:scale-[1.02] md:px-6 md:py-5 md:text-lg"
              >
                Manage Elite Family Members
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f5f9ff] px-3 py-6 md:px-6 md:py-12">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#050505] via-[#101010] to-[#1f1706] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:rounded-[34px] md:p-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.85fr] lg:gap-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#f7d774] md:mb-5 md:px-5 md:py-3 md:text-sm md:tracking-[0.2em]">
              <FaCrown />
              Elite Membership
            </div>

            <h2 className="max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-6xl">
              Save more on every test with Cytocare Elite
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:mt-5 md:text-lg md:leading-8">
              Pay only ₹89/year and get free home sample collection plus 10%
              discount on all Cytocare tests for your registered family members.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-8 md:gap-4">
              <BenefitCard
                icon={<FaHome />}
                title="Free Home Collection"
                text="No ₹200 home collection charge on orders above ₹699."
              />

              <BenefitCard
                icon={<FaPercent />}
                title="10% Test Discount"
                text="Get 10% benefit on all Cytocare tests."
              />

              <BenefitCard
                icon={<FaStethoscope />}
                title="₹50 Consultation Waiver"
                text="Elite members get ₹50 waiver on doctor consultations."
              />

              <BenefitCard
                icon={<FaPiggyBank />}
                title="More Yearly Savings"
                text="Save more on eligible high-value bookings."
              />
            </div>

            <div className="mt-5 rounded-3xl border border-[#d4af37]/30 bg-white/5 p-4 md:mt-7 md:p-5">
              <p className="text-sm font-semibold leading-7 text-slate-300">
                <span className="font-extrabold text-[#f7d774]">
                  Elite Benefits:
                </span>{" "}
                Valid for 1 year, covers up to 4 family members, gives 10%
                discount on Cytocare tests, and free home sample collection on
                orders above ₹699.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#d4af37]/40 bg-gradient-to-br from-[#17120a] via-[#070707] to-[#211706] p-5 shadow-[0_0_40px_rgba(212,175,55,0.18)] md:rounded-[30px] md:p-7">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/60 bg-black text-3xl text-[#f7d774] shadow-[0_0_25px_rgba(212,175,55,0.45)] md:h-20 md:w-20 md:text-4xl">
                <FaCrown />
              </div>

              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.22em] text-[#f7d774] md:mt-5 md:text-sm md:tracking-[0.25em]">
                Launch Offer
              </p>

              <h3 className="mt-2 bg-gradient-to-r from-[#fff6c7] via-[#f1c85b] to-[#b88920] bg-clip-text text-6xl font-extrabold text-transparent md:mt-3 md:text-8xl">
                ₹89
              </h3>

              <p className="mt-1 text-lg font-bold text-slate-300 md:mt-2 md:text-xl">
                per year
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500 line-through md:mt-2 md:text-sm">
                ₹699/year
              </p>
            </div>

            <div className="mt-6 space-y-3 md:mt-8 md:space-y-4">
              <PlanPoint text="Free home sample collection above ₹699" />
              <PlanPoint text="10% discount on all Cytocare tests" />
              <PlanPoint text="Covers up to 4 family members" />
              <PlanPoint text="Priority WhatsApp booking support" />
            </div>

            <button
  type="button"
  onClick={() =>
    onChoosePlan("Cytocare Elite Membership - ₹89/year")
  }
  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#fff7c2] via-[#f5c842] to-[#d4af37] px-5 py-4 text-base font-extrabold text-black shadow-[0_0_28px_rgba(245,200,66,0.45)] transition hover:scale-[1.02] md:mt-8 md:px-6 md:py-5 md:text-lg"
>
  Buy Elite Membership
</button>

            <p className="mt-4 text-center text-xs font-semibold leading-6 text-slate-400 md:mt-5">
              Home collection is subject to serviceable location.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:rounded-3xl md:p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-lg text-[#f7d774] md:mb-4 md:h-12 md:w-12 md:text-xl">
        {icon}
      </div>

      <h3 className="text-base font-extrabold text-white md:text-xl">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-300 md:text-sm md:leading-6">
        {text}
      </p>
    </div>
  );
}

function PlanPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 md:p-4">
      <FaCheckCircle className="mt-1 shrink-0 text-sm text-[#f7d774] md:text-base" />
      <p className="text-sm font-bold leading-6 text-slate-200 md:text-base">
        {text}
      </p>
    </div>
  );
}