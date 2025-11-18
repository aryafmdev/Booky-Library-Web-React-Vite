interface Book {
  id: number;
  title: string;
  author: string;
  rating: string;
  cover: string;
}

export default function Recommendation({ books }: { books: Book[] }) {
  return (
    <section className="mt-4xl">
      <h2 className="text-display-lg font-bold text-neutral-950">Recommendation</h2>
      <div className="mt-xl grid grid-cols-2 md:grid-cols-5 gap-2xl">
        {books.map((b) => (
          <div key={b.id} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="aspect-[2/3] bg-neutral-100">
              <img src={b.cover} alt={b.title} className="h-full w-full object-cover" />
            </div>
            <div className="px-md py-sm">
              <div className="text-sm md:text-lg font-bold text-neutral-900">{b.title}</div>
              <div className="text-sm md:text-md font-medium text-neutral-700">{b.author}</div>
              <div className="mt-xs text-sm md:text-md font-semibold text-neutral-900 inline-flex items-center gap-xxs">
                <span>⭐</span><span>{b.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3xl flex items-center justify-center">
        <button className="rounded-full text-neutral-950 border border-neutral-200 bg-white px-xl py-sm text-sm md:text-md font-bold">
          Load More
        </button>
      </div>
    </section>
  );
}
