import BookCard from "../components/BookCard";
import { Link } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  author: string;
  rating: string;
  cover: string;
}

export default function RelatedBooks({ books }: { books: Book[] }) {
  return (
    <section className="mt-10 md:mt-14">
      <h2 className="text-base md:text-lg font-bold text-neutral-950 mb-3">
        Related Books
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {books.map((b) => (
          <Link to={`/books/${b.id}`} key={String(b.id)}>
            <BookCard
              title={b.title}
              author={b.author}
              rating={b.rating}
              cover={b.cover}
              variant="related"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
