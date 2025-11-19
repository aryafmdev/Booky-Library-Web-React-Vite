import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiGetBooks, apiDeleteBook, apiSearchBooks, type Book } from '../lib/api';
import BookFilter from '../components/BookFilter';
import BookListItem from '../components/BookListItem';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BookList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

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
      return matchStatus;
    });
  }, [books, searchBooks, selectedStatus]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Gagal memuat data. Coba lagi nanti.</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 md:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Book List</h1>
          <Link to="/add-book" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Add Book</Link>
        </div>
        <div className="mb-6">
          <BookFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>
        <main>
          <div className="space-y-4">
            {filteredBooks.map((book: Book) => (
              <BookListItem key={book.id} book={book} onDelete={deleteBook} />
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}