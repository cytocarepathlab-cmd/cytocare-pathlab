import {
  FaHome,
  FaFileMedicalAlt,
  FaUserNurse,
  FaRupeeSign,
} from "react-icons/fa";

export default function WhyChooseUs() {
  const items = [
    {
      icon: <FaHome />,
      title: "Home Sample Collection",
      text: "Book from home and get your sample collected at your doorstep.",
    },
    {
      icon: <FaFileMedicalAlt />,
      title: "Fast Digital Reports",
      text: "Reports can be shared digitally through WhatsApp or email.",
    },
    {
      icon: <FaUserNurse />,
      title: "Trained Staff",
      text: "Professional sample collection and careful sample handling.",
    },
    {
      icon: <FaRupeeSign />,
      title: "Affordable Pricing",
      text: "Clear and affordable pricing for routine tests and packages.",
    },
  ];

  return (
    <section id="about" className="mx-auto max-w-[1500px] px-8 py-20">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="font-bold text-[#0754dc]">WHY CHOOSE US</p>
          <h2 className="mt-3 text-5xl font-extrabold leading-tight text-[#07142f]">
            Reliable Pathology Services in Jamshedpur
          </h2>
          <p className="mt-6 text-xl leading-9 text-slate-600">
            CytoCare Path Lab focuses on accurate diagnostic testing, home
            sample collection, affordable packages and fast digital reports.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-7 shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-[#0754dc]">
                {item.icon}
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-[#07142f]">
                {item.title}
              </h3>

              <p className="mt-3 text-lg leading-7 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}