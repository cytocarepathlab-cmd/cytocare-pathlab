"use client";

import { FaVial, FaHeartbeat, FaFlask, FaTint } from "react-icons/fa";

export default function PopularTests({
  onBookClick,
}: {
  onBookClick: (testName: string) => void;
}) {
  const tests = [
    {
      name: "Complete Blood Count",
      short: "CBC",
      price: "₹299",
      icon: <FaVial />,
      details: "Hemoglobin, WBC, RBC, Platelets",
    },
    {
      name: "Thyroid Profile",
      short: "T3, T4, TSH",
      price: "₹499",
      icon: <FaHeartbeat />,
      details: "Complete thyroid health screening",
    },
    {
      name: "Diabetes Profile",
      short: "Sugar + HbA1c",
      price: "₹599",
      icon: <FaTint />,
      details: "Fasting sugar, PP sugar, HbA1c",
    },
    {
      name: "Liver Function Test",
      short: "LFT",
      price: "₹599",
      icon: <FaFlask />,
      details: "SGOT, SGPT, Bilirubin, Protein",
    },
  ];

  return (
    <section id="tests" className="mx-auto max-w-[1500px] px-8 py-20">
      <div className="text-center">
        <p className="font-bold text-[#0754dc]">POPULAR TESTS</p>
        <h2 className="mt-3 text-5xl font-extrabold text-[#07142f]">
          Book Blood Tests Easily
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">
          Choose from commonly booked diagnostic tests with home sample
          collection and fast digital reports.
        </p>
      </div>

      <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
        {tests.map((test) => (
          <div
            key={test.name}
            className="rounded-3xl bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-[#0754dc]">
              {test.icon}
            </div>

            <h3 className="mt-6 text-2xl font-extrabold text-[#07142f]">
              {test.name}
            </h3>

            <p className="mt-2 font-semibold text-[#e71935]">{test.short}</p>

            <p className="mt-3 min-h-[48px] text-slate-600">{test.details}</p>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-3xl font-extrabold text-[#0754dc]">
                {test.price}
              </p>

              <button
  onClick={() => onBookClick(test.name)}
                className="rounded-xl bg-[#0754dc] px-5 py-3 font-bold text-white"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}