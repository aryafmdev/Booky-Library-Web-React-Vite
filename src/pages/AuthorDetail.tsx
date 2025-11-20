import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import BookCard from '../components/BookCard';
import { apiGetAuthorById, apiGetBooksByAuthor, type Author, type Book } from '../lib/api';
import authorImg from '../assets/images/author.png';
import bookIcon from '../assets/icons/book-icon.png';
import image01 from '../assets/images/image01.png';
import image02 from '../assets/images/image02.png';
import image03 from '../assets/images/image03.png';
import image04 from '../assets/images/image04.png';
import image05 from '../assets/images/image05.png';
import image06 from '../assets/images/image06.png';
import image07 from '../assets/images/image07.png';
import image08 from '../assets/images/image08.png';
import image09 from '../assets/images/image09.png';
import image10 from '../assets/images/image10.png';

export default function AuthorDetail() {
  const { authorId } = useParams<{ authorId: string }>();
  const hasParam = !!authorId;

  const { data: author, isLoading: isLoadingAuthor, error: errorAuthor } = useQuery<Author>({
    queryKey: ['author', authorId],
    queryFn: () => apiGetAuthorById(authorId!),
    enabled: hasParam,
  });

  const { data: authorBooks = [], isLoading: isLoadingBooks, error: errorBooks } = useQuery<Book[]>({
    queryKey: ['authors', authorId, 'books'],
    queryFn: () => apiGetBooksByAuthor(authorId!),
    enabled: hasParam,
  });

  const images = [image01, image02, image03, image04, image05, image06, image07, image08, image09, image10];
  const placeholderBooks = Array.from({ length: 10 }).map((_, i) => ({
    id: -4000 - i,
    title: 'Book Name',
    author: 'Author name',
    rating: '4.9',
    cover: images[i % images.length],
  }));

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
                  <img src={bookIcon} alt="book icon" className="w-4 h-4" />
                  {authorBooks.length} books
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-md flex items-center gap-md border-neutral-200 bg-white">
              <img src={authorImg} alt="Author name" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <div className="text-sm text-neutral-950 font-semibold">Author name</div>
                <div className="flex items-center gap-xxs text-xs text-neutral-700">
                  <img src={bookIcon} alt="book icon" className="w-4 h-4" />
                  5 books
                </div>
              </div>
            </Card>
          )}
        </div>

        <h2 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-3">Book List</h2>
        {isLoadingBooks ? (
          <div>Loading books…</div>
        ) : errorBooks ? (
          <div className="text-red-500">Gagal memuat buku.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(hasParam && authorBooks.length > 0 ? authorBooks.map((b) => ({
              id: b.id,
              title: b.title,
              author: b.author.name,
              rating: '4.9' as const,
              cover: b.cover_image,
            })) : placeholderBooks).map((b) => (
              <BookCard key={b.id} title={b.title} author={b.author} rating={b.rating} cover={b.cover} variant="related" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}