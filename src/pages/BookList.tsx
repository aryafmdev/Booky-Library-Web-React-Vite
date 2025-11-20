import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGetBooks, apiDeleteBook, apiSearchBooks, type Book } from '../lib/api';
import BookFilter from '../components/BookFilter';
import BookListItem from '../components/BookListItem';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BookList() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const param = searchParams.get('category');
    return param ? [param] : [];
  });

  const { mutate: deleteBook } = useMutation({
    mutationFn: apiDeleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err) => {
      alert(`Failed to delete book: ${err.message}`);
    },
  });
  const { data: books, isLoading, error } = useQuery({ 
    queryKey: ['books'], 
    queryFn: apiGetBooks 
  });
  const { data: searchBooks } = useQuery({
    queryKey: ['books', 'search', searchTerm],
    queryFn: () => apiSearchBooks(searchTerm),
    enabled: !!searchTerm,
  });

  

  const filteredBooks = useMemo(() => {
    const source = searchBooks ?? books ?? [];
    return source.filter((book: Book) => {
      const matchStatus = selectedStatus === 'All' || book.status === selectedStatus;
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const selectedNorm = new Set(selectedCategories.map(norm));
      const matchCategory = selectedCategories.length === 0 || selectedNorm.has(norm(book.category.name));
      return matchStatus && matchCategory;
    });
  }, [books, searchBooks, selectedStatus, selectedCategories]);

  if (isLoading) return <div className="container mx-auto py-8 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">Gagal memuat data. Coba lagi nanti.</div>;

  return (
    <>
      <Header />
      <main className="pb-[96px] pt-4 px-4xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-display-xs md:text-display-lg font-bold text-neutral-950">Book List</h1>
          <Link to="/add-book" className="px-xl py-sm bg-primary-300 text-white font-bold rounded-full">Add Book</Link>
        </div>
        <section className="mb-md">
          <BookFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedCategories={selectedCategories}
            onToggleCategory={(name) => {
              setSelectedCategories((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]);
            }}
          />
        </section>
        <section>
          <div className="space-y-md">
            {filteredBooks.map((book: Book) => (
              <BookListItem key={book.id} book={book} onDelete={deleteBook} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}