import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetBookById,
  apiCreateLoan,
  apiAddCartItem,
  apiGetReviewsByBook,
  type Book,
  type CartItem,
  type Review,
} from '../lib/api';
import { addItem } from '../features/cart/cartSlice.ts';
import type { RootState } from '../app/store';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StickyActionBar from '../components/StickyActionBar';
import ReviewCard from '../components/ReviewCard';
import RelatedBooks from '../components/RelatedBooks';
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
import bookDetailImg from '../assets/images/book-detail.png';
import { Icon } from '@iconify/react';

export default function BookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const fromReco = (
    location.state as {
      fromReco?: {
        id?: number;
        title?: string;
        author?: string;
        cover?: string;
      };
    } | null
  )?.fromReco;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const storageKey = `cart_items:${user?.id ?? 'guest'}`;
  const isValidId = !!bookId && /^[0-9]+$/.test(bookId);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    } catch {
      void 0;
    }
  }, [bookId]);

  useQuery<Book>({
    queryKey: ['book', bookId],
    queryFn: () => apiGetBookById(bookId!),
    enabled: false,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', 'book', bookId],
    queryFn: () => apiGetReviewsByBook(Number(bookId)),
    enabled: false,
  });

  const mobileReviews = (reviews || []).slice(0, 3);
  const desktopReviews = (reviews || []).slice(0, 6);

  const borrowMutation = useMutation({
    mutationFn: apiCreateLoan,
    onMutate: async (bookIdToBorrow) => {
      // Batalkan query yang sedang berjalan untuk data buku ini
      await queryClient.cancelQueries({ queryKey: ['book', bookId] });

      // Simpan data sebelumnya
      const previousBook = queryClient.getQueryData<Book>(['book', bookId]);

      // Update data secara optimis hanya jika ID-nya cocok
      if (previousBook && previousBook.id === bookIdToBorrow) {
        queryClient.setQueryData<Book>(['book', bookId], {
          ...previousBook,
          stock_available: previousBook.stock_available - 1,
        });
      }

      return { previousBook };
    },
    onError: (_err, _newTodo, context) => {
      // Jika gagal, kembalikan ke data sebelumnya
      if (context?.previousBook) {
        queryClient.setQueryData<Book>(['book', bookId], context.previousBook);
      }
      // Tampilkan pesan error (misalnya dengan toast)
      alert('Gagal meminjam buku. Stok mungkin habis.');
    },
    onSettled: () => {
      // Refresh data setelah mutasi selesai (baik sukses maupun gagal)
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (bookId: number) => apiAddCartItem(bookId),
    onMutate: async (newBookId: number) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], (old) => {
        const arr = old ?? [];
        const countSame = arr.filter((it) => it.book.id === newBookId).length;
        const optimisticItem: CartItem | null =
          displayBook && displayBook.id === newBookId
            ? {
                id: -(newBookId * 100000 + countSame + 1),
                book: displayBook,
                qty: 1,
              }
            : null;
        const next = optimisticItem ? [...arr, optimisticItem] : arr;
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(next));
          }
        } catch (e) {
          void e;
        }
        return next;
      });
      dispatch(addItem(String(newBookId)));
      return { previousCart };
    },
    onError: () => {
      // keep optimistic cart and badge for demo/non-auth flows
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const idNum = Number(bookId);
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
  const catName = idToCategory[(((idNum - 1) % 10) + 10) % 10 + 1] ?? 'Fiction';
  const fallbackBook: Book = {
    id: idNum,
    title: fromReco?.title ?? (isValidId ? `Book Name ${idNum}` : 'Book Name'),
    author: { id: 0, name: fromReco?.author ?? 'Author Name' },
    isbn: '0000000000',
    category: {
      id: 0,
      name: catName,
    },
    description:
      'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim.',
    stock_available: 0,
    published_year: 2020,
    cover_image:
      fromReco?.cover ??
      images[(((idNum - 1) % images.length) + images.length) % images.length],
    status: 'Available',
  };
  const displayBook = fallbackBook;

  const relatedBooks = (() => {
    const total = 10;
    return Array.from({ length: 5 }, (_, i) => {
      const targetId = ((idNum + (i + 1) - 1) % total) + 1;
      return {
        id: targetId,
        title: `Book Name ${targetId}`,
        author: 'Author Name',
        rating: '4.9' as const,
        cover: images[(targetId - 1) % images.length],
      };
    });
  })();
  return (
    <>
      <Header />

      <main className='relative pb-[96px] pt-4 px-4xl '>
        {/* Breadcrumb */}
        <nav className='text-xs text-neutral-500 mb-3 md:mb-5'>
          Home &gt; {displayBook.category?.name ?? ''} &gt; {displayBook.title}
        </nav>

        {/* Book Info */}
        <section className='flex flex-col md:flex-row gap-5 md:gap-10'>
          <img
            src={displayBook.cover_image || bookDetailImg}
            alt={displayBook.title}
            className='w-full md:w-[337px] rounded-xl shadow-sm object-cover'
          />

          <div className='space-y-2 md:space-y-3'>
            <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
              {displayBook.category?.name ?? ''}
            </span>

            <h1 className='text-xl md:text-2xl font-bold text-neutral-950 leading-tight'>
              {displayBook.title}
            </h1>

            <p className='text-sm text-neutral-700'>
              {displayBook.author?.name ?? ''}
            </p>

            <div className='inline-flex items-center gap-xxs text-sm font-semibold text-neutral-900'>
              <Icon icon='mdi:star' className='size-4 text-yellow-500' />
              <span>4.9</span>
            </div>

            <div className='mt-sm flex gap-2xl text-neutral-950'>
              {[
                { label: 'Pages', value: '320' },
                { label: 'Rating', value: '212' },
                { label: 'Reviews', value: '179' },
              ].map((item, i) => (
                <div key={i} className='flex flex-col items-start'>
                  <span className='text-lg font-bold'>{item.value}</span>
                  <span className='text-xs text-neutral-500'>{item.label}</span>
                </div>
              ))}
            </div>

            <div className='my-sm h-px bg-neutral-200' />

            <p className='text-sm font-bold text-neutral-950'>Description</p>
            <p className='text-sm leading-normal text-neutral-700'>
              {displayBook.description}
            </p>

            {/* Desktop Buttons */}
            <div className='hidden md:flex gap-3 pt-3 items-center'>
              <button
                className='px-lg py-sm rounded-full bg-white text-neutral-950 font-bold border border-neutral-200 hover:bg-neutral-100'
                onClick={() => {
                  if (isValidId && displayBook.id) {
                    addToCartMutation.mutate(displayBook.id);
                  }
                }}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? 'Adding…' : 'Add to Cart'}
              </button>
              <button
                className='px-lg py-sm rounded-full bg-primary-300 text-white font-bold hover:bg-primary-400'
                onClick={() =>
                  navigate('/checkout', {
                    state: { borrowBooks: [displayBook] },
                  })
                }
                disabled={borrowMutation.isPending}
              >
                {borrowMutation.isPending ? 'Borrowing...' : 'Borrow Book'}
              </button>
              <button className='size-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-700'>
                <Icon icon='mdi:share-variant' className='size-5' />
              </button>
            </div>
          </div>
        </section>

        <section className='mt-8 md:mt-12'>
          <h2 className='text-base md:text-lg font-bold text-neutral-950 mb-3'>
            Review
          </h2>
          <div className='md:hidden grid grid-cols-1 gap-4'>
            {mobileReviews.length > 0
              ? mobileReviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    name={r.book?.author?.name ?? ''}
                    rating={r.rating}
                    text={r.comment || ''}
                    date={
                      r.created_at
                        ? new Date(r.created_at).toLocaleString('en-GB')
                        : undefined
                    }
                  />
                ))
              : Array.from({ length: 3 }).map((_, i) => <ReviewCard key={i} />)}
          </div>
          <div className='hidden md:grid grid-cols-2 gap-4'>
            {desktopReviews.length > 0
              ? desktopReviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    name={r.book?.author?.name ?? ''}
                    rating={r.rating}
                    text={r.comment || ''}
                    date={
                      r.created_at
                        ? new Date(r.created_at).toLocaleString('en-GB')
                        : undefined
                    }
                  />
                ))
              : Array.from({ length: 6 }).map((_, i) => <ReviewCard key={i} />)}
          </div>
          <div className='mt-4 flex justify-center'>
            <button className='rounded-full text-neutral-950 border border-neutral-200 bg-white px-lg py-sm text-sm font-bold'>
              Load More
            </button>
          </div>
        </section>

        {/* Related Books */}
        <RelatedBooks books={relatedBooks} />
        {/* ✅ wrapper section dipanggil, styling tetap sama */}
      </main>

      <Footer />
      <StickyActionBar
        onAddToCart={() => {
          if (isValidId && displayBook.id) {
            addToCartMutation.mutate(displayBook.id);
          }
        }}
        onBorrow={() =>
          navigate('/checkout', { state: { borrowBooks: [displayBook] } })
        }
        addPending={addToCartMutation.isPending}
        borrowPending={borrowMutation.isPending}
        disableBorrow={false}
      />
    </>
  );
}
