import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import BookCard from '../components/BookCard';
import { apiGetAuthorById, apiGetBooks, type Author, type Book } from '../lib/api';

export default function AuthorDetail() {
  const { authorId } = useParams<{ authorId: string }>();

  const { data: author, isLoading: isLoadingAuthor, error: errorAuthor } = useQuery<Author>({
    queryKey: ['author', authorId],
    queryFn: () => apiGetAuthorById(authorId!),
    enabled: !!authorId,
  });

  const { data: books, isLoading: isLoadingBooks, error: errorBooks } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: apiGetBooks,
  });

  const authorBooks = (books || []).filter((b) => String(b.author.id) === String(authorId));

  return (
    <>
      <Header />
      <main className="pb-[96px] pt-4 px-4xl">
        <div className="mb-4">
          {isLoadingAuthor ? (
            <div className="text-sm text-neutral-700">Loading author…</div>
          ) : errorAuthor ? (
            <div className="text-sm text-red-500">Gagal memuat author.</div>
          ) : author ? (
            <Card className="p-md flex items-center gap-md border-neutral-200 bg-white">
              {author.avatar && (
                <img src={author.avatar} alt={author.name} className="h-12 w-12 rounded-full object-cover" />
              )}
              <div>
                <div className="text-sm text-neutral-950 font-semibold">{author.name}</div>
                <div className="flex items-center gap-xxs text-xs text-neutral-700">
                  <span className="inline-block rounded-full border border-neutral-300 px-sm py-xxs">{authorBooks.length} books</span>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        <h2 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-3">Book List</h2>
        {isLoadingBooks ? (
          <div>Loading books…</div>
        ) : errorBooks ? (
          <div className="text-red-500">Gagal memuat buku.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {authorBooks.map((b) => (
              <BookCard key={b.id} title={b.title} author={b.author.name} rating={"4.9"} cover={b.cover_image} variant="related" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}