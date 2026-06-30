export default function FAQ() {
  const faqs = [
    {
      q: "Do you provide home sample collection?",
      a: "Yes, CytoCare Path Lab provides home sample collection in selected areas of Jamshedpur.",
    },
    {
      q: "How will I get my report?",
      a: "Reports can be shared digitally through WhatsApp or email.",
    },
    {
      q: "Can I book through WhatsApp?",
      a: "Yes, you can book directly through the WhatsApp button or by submitting the booking form.",
    },
    {
      q: "Is fasting required for all tests?",
      a: "No. Only selected tests require fasting. Our team will guide you after booking.",
    },
  ];

  return (
    <section className="bg-[#07142f] px-8 py-20 text-white">
      <div className="mx-auto max-w-[1500px]">
        <div className="text-center">
          <p className="font-bold text-blue-300">FAQ</p>
          <h2 className="mt-3 text-5xl font-extrabold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-3xl bg-white/10 p-7">
              <h3 className="text-2xl font-bold">{item.q}</h3>
              <p className="mt-3 text-lg leading-7 text-slate-300">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}