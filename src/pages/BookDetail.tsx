import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGetBookById, apiBorrowBook, type Book } from '../lib/api';
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
import { Icon } from '@iconify/react';

export default function BookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const queryClient = useQueryClient();

  const { data: book, isLoading, error } = useQuery<Book>({
    queryKey: ['book', bookId],
    queryFn: () => apiGetBookById(bookId!),
    enabled: !!bookId,
  });

  const borrowMutation = useMutation({
    mutationFn: apiBorrowBook,
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
      alert("Gagal meminjam buku. Stok mungkin habis.");
    },
    onSettled: () => {
      // Refresh data setelah mutasi selesai (baik sukses maupun gagal)
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });

  const handleBorrow = () => {
    if (book && book.stock_available > 0) {
      borrowMutation.mutate(book.id);
    } else {
      alert("Stok buku tidak tersedia.");
    }
  };
  if (isLoading) return <div className="container mx-auto py-8 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">Gagal memuat detail buku.</div>;
  if (!book) return <div className="container mx-auto py-8 text-center">Buku tidak ditemukan.</div>;

  const relatedBooks = [
    {
      id: 1,
      title: 'Book Name',
      author: 'Author Name',
      rating: '4.9',
      cover: image01,
    },
    {
      id: 2,
      title: 'Book Name',
      author: 'Author Name',
      rating: '4.9',
      cover: image02,
    },
    {
      id: 3,
      title: 'Book Name',
      author: 'Author Name',
      rating: '4.9',
      cover: image03,
    },
    {
      id: 4,
      title: 'Book Name',
      author: 'Author Name',
      rating: '4.9',
      cover: image04,
    },
    {
      id: 5,
      title: 'Book Name',
      author: 'Author Name',
      rating: '4.9',
      cover: image05,
    },
  ];
  return (
    <>
      <Header />

      <main className='relative pb-[96px] pt-4 px-4xl '>
        {/* Breadcrumb */}
        <nav className='text-xs text-neutral-500 mb-3 md:mb-5'>
          Home &gt; {book.category.name} &gt; {book.title}
        </nav>

        {/* Book Info */}
        <section className='flex flex-col md:flex-row gap-5 md:gap-10'>
          <img
            src={book.cover_image}
            alt={book.title}
            className='w-full md:w-[337px] rounded-xl shadow-sm object-cover'
          />

          <div className='space-y-2 md:space-y-3'>
            <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
              {book.category.name}
            </span>

            <h1 className='text-xl md:text-2xl font-bold text-neutral-950 leading-tight'>
              {book.title}
            </h1>

            <p className='text-sm text-neutral-700'>{book.author.name}</p>

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
              {book.description}
            </p>

            {/* Desktop Buttons */}
            <div className='hidden md:flex gap-3 pt-3 items-center'>
              <button className='px-lg py-sm rounded-full bg-white text-neutral-950 font-bold border border-neutral-200'>
                Add to Cart
              </button>
              <button 
                className='px-lg py-sm rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300'
                onClick={handleBorrow}
                disabled={borrowMutation.isPending || (book && book.stock_available === 0)}
              >
                {borrowMutation.isPending ? 'Meminjam...' : 'Pinjam Buku'}
              </button>
              <button className='size-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-700'>
                <Icon icon='mdi:share-variant' className='size-5' />
              </button>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className='mt-8 md:mt-12'>
          <h2 className='text-base md:text-lg font-bold text-neutral-950 mb-3'>
            Review
          </h2>
          <h2 className='text-base md:text-lg font-bold text-neutral-950 mb-3'>
            ⭐ 4.9 (24 Ulasan)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <ReviewCard key={i} />
            ))}
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
      <StickyActionBar />
    </>
  );
}
