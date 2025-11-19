import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { apiGetCategories, apiGetBookById, apiUpdateBook, type Category, type UpdateBookPayload, type Book } from '../lib/api';

// Skema validasi Zod untuk pembaruan
const editBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  category_id: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().positive('Category is required')),
  description: z.string().min(1, 'Description is required'),
  stock_available: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().min(0, 'Stock cannot be negative')),
  published_year: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().max(new Date().getFullYear(), 'Year cannot be in the future')),
  cover_image: z.string().url('Must be a valid URL'),
});

function EditBookForm({ book }: { book: Book }) {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: apiGetCategories,
  });

  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author.name,
    isbn: book.isbn,
    category_id: book.category.id,
    description: book.description,
    stock_available: book.stock_available,
    published_year: book.published_year,
    cover_image: book.cover_image,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationFn: (payload: UpdateBookPayload) => apiUpdateBook(Number(bookId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      navigate('/');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = editBookSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        newErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <Input name="title" placeholder="Title" value={formData.title || ''} onChange={handleChange} />
      {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

      <Input name="author" placeholder="Author" value={formData.author || ''} onChange={handleChange} />
      {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}

      <Input name="isbn" placeholder="ISBN" value={formData.isbn || ''} onChange={handleChange} />
      {errors.isbn && <p className="text-red-500 text-sm">{errors.isbn}</p>}

      <select
        name="category_id"
        value={formData.category_id || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg"
      >
        <option value="" disabled>Select a category</option>
        {isLoadingCategories ? (
          <option>Loading categories...</option>
        ) : (
          categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))
        )}
      </select>
      {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg"
        rows={4}
      />
      {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

      <Input name="stock_available" type="number" placeholder="Stock" value={formData.stock_available || 0} onChange={handleChange} />
      {errors.stock_available && <p className="text-red-500 text-sm">{errors.stock_available}</p>}

      <Input name="published_year" type="number" placeholder="Published Year" value={formData.published_year || new Date().getFullYear()} onChange={handleChange} />
      {errors.published_year && <p className="text-red-500 text-sm">{errors.published_year}</p>}

      <Input name="cover_image" placeholder="Cover Image URL" value={formData.cover_image || ''} onChange={handleChange} />
      {errors.cover_image && <p className="text-red-500 text-sm">{errors.cover_image}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Updating Book...' : 'Update Book'}
      </Button>
      {mutationError && <p className="text-red-500 text-sm">{mutationError.message}</p>}
    </form>
  );
}

export default function EditBook() {
  const { bookId } = useParams<{ bookId: string }>();
  const { data: book, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => apiGetBookById(bookId!),
    enabled: !!bookId,
  });

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-6">Edit Book</h1>
        {isLoadingBook ? (
          <div>Loading book data...</div>
        ) : book ? (
          <EditBookForm key={bookId} book={book} />
        ) : (
          <div>Book not found.</div>
        )}
      </div>
      <Footer />
    </>
  );
}