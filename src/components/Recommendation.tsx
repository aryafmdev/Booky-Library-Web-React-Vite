import BookCard from "./BookCard";
import { Link } from "react-router-dom";

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
          <Link
            to={`/books/${b.id}`}
            key={String(b.id)}
            state={{ fromReco: { id: b.id, title: b.title, author: b.author, cover: b.cover } }}
          >
            <BookCard
              title={b.title}
              author={b.author}
              rating={b.rating}
              cover={b.cover}
              variant="recommendation"
            />
          </Link>
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
