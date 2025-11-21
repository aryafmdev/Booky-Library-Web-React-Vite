import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { apiGetCategories, apiAddBook, type Category, type AddBookPayload } from '../../lib/api';

// Skema validasi Zod
const addBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  category_id: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().positive('Category is required')),
  description: z.string().min(1, 'Description is required'),
  stock_available: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().min(0, 'Stock cannot be negative')),
  published_year: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().max(new Date().getFullYear(), 'Year cannot be in the future')),
  cover_image: z.string().url('Must be a valid URL'),
});

export default function AddBook() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<AddBookPayload>>({
    title: '',
    author: '',
    isbn: '',
    category_id: undefined,
    description: '',
    stock_available: 0,
    published_year: new Date().getFullYear(),
    cover_image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationFn: apiAddBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate('/');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addBookSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        newErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    mutate(result.data as AddBookPayload);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-6">Add New Book</h1>
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-md py-xxs text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-full"
          >
            Back
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mx-auto">
          <Input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

          <Input name="author" placeholder="Author" value={formData.author} onChange={handleChange} />
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
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

          <Input name="cover_image" placeholder="Cover Image URL" value={formData.cover_image} onChange={handleChange} />
          {errors.cover_image && <p className="text-red-500 text-sm">{errors.cover_image}</p>}

          <Button type="submit" className="w-full bg-primary-300 text-white hover:bg-primary-400 rounded-full" disabled={isPending}>
            {isPending ? 'Adding Book...' : 'Add Book'}
          </Button>
          {mutationError && <p className="text-red-500 text-sm">{mutationError.message}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}
