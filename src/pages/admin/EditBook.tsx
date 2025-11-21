import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { z } from 'zod';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { apiGetCategories, apiGetBookById, apiUpdateBook, type Category, type UpdateBookPayload, type Book } from '../../lib/api';

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

  const fixedCategories = useMemo(() => {
    const desiredCategoryNames = [
      'Fiction',
      'Non-Fiction',
      'Self-Growth',
      'Finance',
      'Science',
      'Education',
    ];
    const byName = new Map((categories ?? []).map((c) => [c.name, c]));
    return desiredCategoryNames.map((name, idx) => {
      const found = byName.get(name);
      return found ? found : ({ id: idx + 1, name } as Category);
    });
  }, [categories]);

  const initialCatId = useMemo(() => {
    const match = fixedCategories.find((c) => c.name === book.category.name);
    return match?.id ?? (fixedCategories[0]?.id ?? book.category.id);
  }, [fixedCategories, book.category.name, book.category.id]);

  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author.name,
    isbn: book.isbn,
    category_id: initialCatId,
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
    <form onSubmit={handleSubmit} className="space-y-4 mx-auto">
      <Input name="title" placeholder="Title" value={formData.title || ''} onChange={handleChange} />
      {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

      <Input name="author" placeholder="Author" value={formData.author || ''} onChange={handleChange} />
      {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}

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
          fixedCategories.map((cat) => (
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

      <Input name="cover_image" placeholder="Cover Image URL" value={formData.cover_image || ''} onChange={handleChange} />
      {errors.cover_image && <p className="text-red-500 text-sm">{errors.cover_image}</p>}

      <Button type="submit" className="w-full bg-primary-300 text-white hover:bg-primary-400 rounded-full" disabled={isPending}>
        {isPending ? 'Updating Book...' : 'Update Book'}
      </Button>
      {mutationError && <p className="text-red-500 text-sm">{mutationError.message}</p>}
    </form>
  );
}

export default function EditBook() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { fromReco?: { id?: number; title?: string; author?: string; cover?: string; description?: string }; slot?: number } | null;
  const slotFromState = state?.slot;
  const slot = typeof slotFromState === 'number' && slotFromState >= 1 && slotFromState <= 10 ? slotFromState : (Number(bookId) > 0 ? (((Number(bookId) - 1) % 10) + 1) : 1);
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
  const { data: book, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => apiGetBookById(bookId!),
    enabled: !!bookId,
  });
  const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim.';

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-6">Edit Book</h1>
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-md py-xxs text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-full"
          >
            Back
          </button>
        </div>
        {isLoadingBook ? (
          <div>Loading book data...</div>
        ) : (book || state?.fromReco) ? (
          <EditBookForm
            key={bookId}
            book={{
              id: Number(bookId),
              title: state?.fromReco?.title ?? (book?.title ?? `Book Name ${slot}`),
              author: { id: book?.author?.id ?? 0, name: state?.fromReco?.author ?? (book?.author?.name ?? 'Author name') },
              isbn: book?.isbn ?? '0000000000',
              category: { id: book?.category?.id ?? 0, name: idToCategory[slot] ?? (book?.category?.name ?? 'Fiction') },
              description: state?.fromReco?.description ?? (book?.description ?? lorem),
              stock_available: book?.stock_available ?? 0,
              published_year: book?.published_year ?? new Date().getFullYear(),
              cover_image: state?.fromReco?.cover ?? (book?.cover_image ?? ''),
              status: book?.status ?? 'Available',
            } as Book}
          />
        ) : (
          <div>Book not found.</div>
        )}
      </div>
      <Footer />
    </>
  );
}
