"use client";

import type { ReactNode } from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaCrown,
  FaGem,
  FaHome,
  FaPercent,
  FaPiggyBank,
  FaShieldAlt,
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
      <section className="bg-[#f5f9ff] px-4 py-12 md:px-6">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[34px] bg-gradient-to-br from-[#050505] via-[#101010] to-[#1f1706] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#f7d774]">
                <FaCrown />
                Elite Member Active
              </div>

              <h2 className="max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Welcome Elite Member
                {patientName ? `, ${patientName}` : ""}
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Your Cytocare Elite privileges are active. You will get 10%
                discount on Cytocare tests and free home sample collection on
                orders above ₹699.
              </p>

              <div className="mt-7 rounded-3xl border border-[#d4af37]/30 bg-white/5 p-5">
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

            <div className="rounded-[30px] border border-[#d4af37]/40 bg-gradient-to-br from-[#17120a] via-[#070707] to-[#211706] p-7 shadow-[0_0_40px_rgba(212,175,55,0.18)]">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/60 bg-black text-4xl text-[#f7d774] shadow-[0_0_25px_rgba(212,175,55,0.45)]">
                  <FaGem />
                </div>

                <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.25em] text-[#f7d774]">
                  Your Privileges
                </p>

                <h3 className="mt-3 text-4xl font-extrabold text-white">
                  Elite Benefits Active
                </h3>
              </div>

              <div className="mt-8 space-y-4">
                <PlanPoint text="10% discount on all Cytocare tests" />
                <PlanPoint text="Free home sample collection above ₹699" />
                <PlanPoint text="Savings up to ₹3000 per year" />
                <PlanPoint text="Valid for up to 4 registered family members" />
                <PlanPoint text="Priority booking and report support" />
              </div>

              <div className="mt-8 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-5">
                <p className="text-center text-sm font-bold leading-6 text-[#f7d774]">
                  No need to purchase again while your Elite membership is
                  active.
                  <a
  href="/elite-family"
  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#fff1a8] via-[#d4af37] to-[#9f7415] px-6 py-5 text-lg font-extrabold text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] transition hover:scale-[1.02]"
>
  Manage Elite Family Members
</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f5f9ff] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[34px] bg-gradient-to-br from-[#050505] via-[#101010] to-[#1f1706] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#f7d774]">
              <FaCrown />
              Elite Membership
            </div>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Save more on every test with Cytocare Elite
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Pay only ₹89/year and get free home sample collection plus 10%
              discount on all Cytocare tests for your registered family members.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
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
                icon={<FaUsers />}
                title="50/- waiver on Doctor Consultations"
                text="Patients with active Elite membership will get 50/- waiver on every doctor consultations."
              />

              <BenefitCard
                icon={<FaPiggyBank />}
                title="Savings up to ₹3000/year"
                text="Save more with 10% discount on every eligible test."
              />
            </div>

            <div className="mt-7 rounded-3xl border border-[#d4af37]/30 bg-white/5 p-5">
              <p className="text-sm font-semibold leading-7 text-slate-300">
                <span className="font-extrabold text-[#f7d774]">
                  Elite Membership Benefits:
                </span>{" "}
                This membership plan is valid for 1 year from the date of purchase and covers up to 4 family members. You will get free home sample collection on orders above ₹699 and 10% discount on all Cytocare tests.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#d4af37]/40 bg-gradient-to-br from-[#17120a] via-[#070707] to-[#211706] p-7 shadow-[0_0_40px_rgba(212,175,55,0.18)]">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/60 bg-black text-4xl text-[#f7d774] shadow-[0_0_25px_rgba(212,175,55,0.45)]">
                <FaCrown />
              </div>

              <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.25em] text-[#f7d774]">
                Launch Offer
              </p>

              <h3 className="mt-3 bg-gradient-to-r from-[#fff6c7] via-[#f1c85b] to-[#b88920] bg-clip-text text-7xl font-extrabold text-transparent md:text-8xl">
                ₹89
              </h3>

              <p className="mt-2 text-xl font-bold text-slate-300">
                per year
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-500 line-through">
                ₹699/year
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <PlanPoint text="Free home sample collection above ₹699" />
              <PlanPoint text="10% discount on all Cytocare tests" />
              <PlanPoint text="Save instantly on high-value bookings" />
              <PlanPoint text="Covers up to 4 family members" />
              <PlanPoint text="Priority WhatsApp booking support" />
            </div>

            <button
              type="button"
              onClick={() =>
                onChoosePlan("Cytocare Elite Membership - ₹89/year")
              }
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-[#fff1a8] via-[#d4af37] to-[#9f7415] px-6 py-5 text-lg font-extrabold text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] transition hover:scale-[1.02]"
            >
              Buy Elite Membership
            </button>

            <p className="mt-5 text-center text-xs font-semibold leading-6 text-slate-400">
              Home collection is subject to serviceable location. Special camp,
              corporate, or already negotiated rates may be handled separately.
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-xl text-[#f7d774]">
        {icon}
      </div>

      <h3 className="text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function PlanPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
      <FaCheckCircle className="mt-1 text-[#f7d774]" />
      <p className="font-bold text-slate-200">{text}</p>
    </div>
  );
}