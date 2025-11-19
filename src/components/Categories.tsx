import { Card } from "./ui/card";

interface Category {
  label: string;
  image: string;
}

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <section className="mt-3xl">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-md">
        {categories.map((c) => (
          <Card key={c.label} className="flex flex-col items-center gap-sm p-md border-neutral-200 shadow-sm">
            <img src={c.image} alt={c.label} className="w-full h-14 md:h-16 object-cover rounded-md" />
            <span className="text-xs self-start lg:text-sm font-semibold text-neutral-950">{c.label}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
