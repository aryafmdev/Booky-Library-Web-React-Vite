import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import BookCard from '../components/BookCard';
import { apiGetCategoryById, apiGetCategories, apiGetBooksPaged, type Category, type Book } from '../lib/api';
import { useMemo, useState } from 'react';

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectedIds, setSelectedIds] = useState<string[]>(categoryId ? [categoryId] : []);

  const { data: category } = useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: () => apiGetCategoryById(categoryId!),
    enabled: !!categoryId,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: apiGetCategories,
  });

  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ['books', 'category', categoryId],
    queryFn: () => apiGetBooksPaged({ category_id: Number(categoryId), limit: 20 }),
    enabled: !!categoryId,
  });

  const filtered = useMemo(() => {
    return books || [];
  }, [books]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
                {categories?.map((c) => (
                  <label key={c.id} className="flex items-center gap-sm text-sm text-neutral-900">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(String(c.id))}
                      onChange={() => toggleCategory(String(c.id))}
                    />
                    <span>{c.name}</span>
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