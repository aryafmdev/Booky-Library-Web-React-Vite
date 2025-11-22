import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../../components/Header';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { apiGetBookById, apiDeleteBook, type Book } from '../../lib/api';
import image01 from '../../assets/images/image01.png';
import image02 from '../../assets/images/image02.png';
import image03 from '../../assets/images/image03.png';
import image04 from '../../assets/images/image04.png';
import image05 from '../../assets/images/image05.png';
import image06 from '../../assets/images/image06.png';
import image07 from '../../assets/images/image07.png';
import image08 from '../../assets/images/image08.png';
import image09 from '../../assets/images/image09.png';
import image10 from '../../assets/images/image10.png';

export default function BookPreview() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = Number(bookId);
  const { data: book } = useQuery<Book | undefined>({
    queryKey: ['admin', 'books', id],
    queryFn: () => apiGetBookById(String(id)),
    enabled: Number.isFinite(id) && id > 0,
  });
  const { mutate: deleteBook, isPending } = useMutation({
    mutationFn: apiDeleteBook,
    onSuccess: () => {
      navigate('/admin?tab=books', { replace: true });
    },
  });

  const fromReco = (location.state as { fromReco?: { id?: number; title?: string; author?: string; cover?: string } } | null)?.fromReco;
  const slotFromState = (location.state as { slot?: number } | null)?.slot;
  const images = [
    image01,
    image02,
    image03,
    image04,
    image05,
    image06,
    image07,
    image08,
    image09,
    image10,
  ];
  const slot = typeof slotFromState === 'number' && slotFromState >= 1 && slotFromState <= 10
    ? slotFromState
    : id > 0
    ? (((id - 1) % 10) + 1)
    : Math.max(1, Math.min(10, Math.round(Math.abs(id) / 1000)));
  const idToCategory: Record<number, string> = {
    1: 'Finance',
    2: 'Education',
    3: 'Self-Growth',
    4: 'Non-Fiction',
    5: 'Fiction',
    6: 'Science',
    7: 'Self-Growth',
    8: 'Fiction',
    9: 'Fiction',
    10: 'Education',
  };
  const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim.';
  const display: Book = {
    id: id,
    title: fromReco?.title ?? (book?.title ?? `Book Name ${slot}`),
    author: { id: book?.author?.id ?? 0, name: fromReco?.author ?? (book?.author?.name ?? 'Author name') },
    isbn: book?.isbn ?? '0000000000',
    category: { id: book?.category?.id ?? 0, name: idToCategory[slot] ?? (book?.category?.name ?? 'Fiction') },
    description: slot <= 5 ? lorem : (book?.description ?? lorem),
    stock_available: book?.stock_available ?? 0,
    published_year: book?.published_year ?? 2020,
    cover_image: fromReco?.cover ?? (book?.cover_image ?? images[(slot - 1) % images.length]),
    status: book?.status ?? 'Available',
  };
  const effective = display;

  return (
    <div className='min-h-screen bg-neutral-25 text-neutral-900'>
      <Header />
      <main className='px-4xl py-3xl'>
        <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4'>Preview Book</h1>
        <div className='mb-md'>
          <Link
            to='/admin?tab=books'
            className='px-md py-xxs text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-full'
          >
            Back
          </Link>
        </div>
        {!effective ? (
          <div>Loading…</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-[320px_1fr] gap-2xl'>
            <Card className='p-md border-neutral-200 bg-white'>
              <img src={effective.cover_image} alt={effective.title} className='w-full h-auto rounded-md object-cover' />
            </Card>
            <div>
              <div className='text-sm font-semibold text-neutral-700'>{effective.category.name}</div>
              <div className='mt-xxs text-neutral-950 font-bold text-display-sm'>{effective.title}</div>
              <div className='text-xs text-neutral-700'>{effective.author.name}</div>
              <div className='mt-lg border-t border-neutral-200' />
              <div className='mt-lg text-md font-bold text-neutral-950'>Description</div>
              <p className='mt-xxs text-sm text-neutral-700'>{effective.description}</p>
              <div className='mt-xl flex items-center gap-sm'>
                <Button
                  className='rounded-full bg-primary-300 text-white font-bold hover:bg-primary-400'
                  onClick={() =>
                    navigate(`/admin/books/${effective.id}/edit`, {
                      state: {
                        fromReco: {
                          id: effective.id,
                          title: effective.title,
                          author: effective.author.name,
                          cover: effective.cover_image,
                          description: effective.description,
                        },
                        slot,
                      },
                    })
                  }
                >
                  Edit
                </Button>
                <Button
                  variant='outline'
                  className='rounded-full text-red-600 border-red-300'
                  disabled={isPending}
                  onClick={() => {
                    if (window.confirm('Delete this book?')) deleteBook(effective.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}