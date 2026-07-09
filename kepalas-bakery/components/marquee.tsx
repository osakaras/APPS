const items = [
  "Raugo duona",
  "Šokoladinė babka",
  "Aguoninė babka",
  "Migdolinė boba",
  "Cinamono suktinukai",
  "Sviestiniai kruasanai",
  "Medaus tortas",
];

export function Marquee() {
  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden bg-brown-900 py-4">
      <div className="flex w-max animate-marquee gap-0">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-6 pr-6 font-display text-lg font-medium tracking-wide text-sand-200"
          >
            {item}
            <span aria-hidden className="text-caramel-400">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
