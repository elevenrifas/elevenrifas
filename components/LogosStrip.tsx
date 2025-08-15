export function LogosStrip() {
  const logos = ["Porsche", "Rolex", "Ferrari", "Lamborghini", "Tag Heuer"];
  return (
    <section className="px-4 sm:px-6 py-6">
      <div className="mx-auto max-w-screen-md">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60 text-xs sm:text-sm">
          {logos.map((l) => (
            <span key={l} className="tracking-wider uppercase">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}




