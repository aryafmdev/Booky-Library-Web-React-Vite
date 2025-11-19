interface Author {
  id: number;
  name: string;
  icon: string;
  books: number;
  avatar: string;
}

export default function Authors({ authors }: { authors: Author[] }) {
  return (
    <section className="mt-4xl">
      <h2 className="text-display-xs md:text-display-lg font-bold text-neutral-950">Popular Authors</h2>
      <div className="mt-xl grid grid-cols-1 md:grid-cols-4 gap-xl">
        {authors.map((a) => (
          <div key={a.id} className="rounded-lg border border-neutral-200 bg-white p-md flex items-center gap-md">
            <img src={a.avatar} alt={a.name} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <div className="text-sm text-neutral-950 font-semibold">{a.name}</div>
              <div className="flex items-center gap-xxs text-xs text-neutral-700">
                <img src={a.icon} alt="book icon" className="w-4 h-4" />
                {a.books} books
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
