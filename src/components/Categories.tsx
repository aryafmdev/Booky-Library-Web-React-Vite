interface Category {
  label: string;
  image: string;
}

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <section className="mt-3xl">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-md">
        {categories.map((c) => (
          <div key={c.label} className="flex flex-col items-center gap-sm bg-white px-md py-md rounded-xl shadow-sm border border-neutral-200">
            <img src={c.image} alt={c.label} className="w-full h-14 md:h-16 object-cover rounded-md" />
            <span className="text-xs self-start md:text-sm font-semibold text-neutral-950">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
