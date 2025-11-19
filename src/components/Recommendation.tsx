import BookCard from "./BookCard";

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
          <BookCard
            key={b.id}
            title={b.title}
            author={b.author}
            rating={b.rating}
            cover={b.cover}
            variant="recommendation"
          />
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
