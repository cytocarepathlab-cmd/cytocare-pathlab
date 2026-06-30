import {
  FaFileAlt,
  FaFlask,
  FaShieldAlt,
  FaUsers,
  FaVial,
} from "react-icons/fa";

export default function Stats() {
  return (
    <section className="mx-auto max-w-[1500px] px-8 pt-4 pb-16">
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<FaVial />}
          number="500+"
          title="Tests"
          subtitle="Available"
          color="blue"
        />

        <StatCard
          icon={<FaUsers />}
          number="1000+"
          title="Patients"
          subtitle="Served"
          color="red"
        />

        <StatCard
          icon={<FaShieldAlt />}
          number="100%"
          title="Trusted"
          subtitle="Accuracy"
          color="blue"
        />

        <StatCard
  icon={<FaFlask />}
  number="Advanced"
  title="Technology"
  subtitle="& Equipment"
  color="red"
  compact
/>

        <StatCard
          icon={<FaFileAlt />}
          number="Fast"
          title="Digital"
          subtitle="Reports"
          color="green"
        />
      </div>
    </section>
  );
}

function StatCard({
  icon,
  number,
  title,
  subtitle,
  color,
  compact,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  subtitle: string;
  color: "blue" | "red" | "green";
  compact?: boolean;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-[#0754dc]",
    red: "bg-red-50 text-[#e71935]",
    green: "bg-green-50 text-[#05a832]",
  };

  const numberColor = {
    blue: "text-[#0754dc]",
    red: "text-[#e71935]",
    green: "text-[#05a832]",
  };

  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-lg">
      <div
        className={`flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full text-4xl ${colorClasses[color]}`}
      >
        {icon}
      </div>

      <div>
      <div
  className={`font-extrabold leading-tight ${numberColor[color]} ${
    compact ? "text-[24px]" : "text-[30px]"
  }`}
>
  {number}
</div>
        <div className="text-[18px] font-semibold text-slate-700">{title}</div>
        <div className="text-[18px] font-semibold text-slate-700">
          {subtitle}
        </div>
      </div>
    </div>
  );
}