import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import BookCard from '../components/BookCard';
import { apiGetCategoryById, apiGetBooks, type Category, type Book } from '../lib/api';
import { useMemo, useState } from 'react';

const fixedCategories = [
  "Fiction",
  "Non-Fiction",
  "Self-Growth",
  "Finance",
  "Science",
  "Education",
];

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectionOverride, setSelectionOverride] = useState<{ key: string; value: string[] } | null>(null);

  const { data: category } = useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: () => apiGetCategoryById(categoryId!),
    enabled: !!categoryId,
  });

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

  const paramCategoryName = useMemo(() => {
    if (!categoryId) return undefined;
    const match = fixedCategories.find((c) => normalize(c) === normalize(categoryId));
    return match;
  }, [categoryId]);

  const selectedCategories = useMemo(() => {
    return selectionOverride?.key === (categoryId ?? '')
      ? selectionOverride.value
      : (category ? [category.name] : (paramCategoryName ? [paramCategoryName] : []));
  }, [selectionOverride, categoryId, category, paramCategoryName]);

  

  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: apiGetBooks,
  });

  const filtered = useMemo(() => {
    if (!books) return [];
    if (selectedCategories.length === 0) return books;
    return books.filter((b) => selectedCategories.includes(b.category.name));
  }, [books, selectedCategories]);

  const toggleCategory = (name: string) => {
    const current = selectionOverride?.key === (categoryId ?? '')
      ? selectionOverride.value
      : (category ? [category.name] : (paramCategoryName ? [paramCategoryName] : []));
    const set = new Set(current);
    if (set.has(name)) {
      set.delete(name);
    } else {
      set.add(name);
    }
    setSelectionOverride({ key: categoryId ?? '', value: Array.from(set) });
  };

  return (
    <>
      <Header />
      <main className="pb-[96px] pt-4 px-4xl">
        <h1 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4">Book List</h1>
        {category && (
          <div className="mb-3">
            <Card className="p-md border-neutral-200 bg-white">
              <div className="text-sm font-semibold text-neutral-950">{category.name}</div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
          <div>
            <Card className="p-md border-neutral-200 bg-white">
              <div className="text-sm font-bold text-neutral-950 mb-sm">FILTER</div>
              <div className="text-xs font-semibold text-neutral-950 mb-2">Category</div>
              <div className="space-y-sm">
                {fixedCategories.map((c) => (
                  <label key={c} className="flex items-center gap-sm text-sm text-neutral-900">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(c)}
                      onChange={() => toggleCategory(c)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              <div className="mt-lg text-xs font-semibold text-neutral-950">Rating</div>
              <div className="mt-sm space-y-xxs text-sm text-neutral-900">
                {[5,4,3,2,1].map((r) => (
                  <div key={r} className="flex items-center gap-sm">
                    <input type="checkbox" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">Gagal memuat data.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {filtered.map((b) => (
                  <BookCard key={b.id} title={b.title} author={b.author.name} rating={"4.9"} cover={b.cover_image} variant="related" />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}