import { Card } from "./ui/card";
import { Link } from "react-router-dom";

interface CategoryItem {
  id: number | string;
  name: string;
  image?: string;
}

export default function Categories({ categories }: { categories: CategoryItem[] }) {
  return (
    <section className="mt-3xl">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-md">
        {categories.map((c) => (
          <Link to={`/categories/${c.id}`} key={String(c.id)}>
            <Card className="flex flex-col items-center gap-sm p-md border-neutral-200 shadow-sm">
              {c.image && (
                <img src={c.image} alt={c.name} className="w-full h-14 md:h-16 object-cover rounded-md" />
              )}
              <span className="text-xs self-start lg:text-sm font-semibold text-neutral-950">{c.name}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
