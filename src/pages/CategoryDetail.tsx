import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import BookCard from '../components/BookCard';
import {
  apiGetCategoryById,
  apiGetBooks,
  type Category,
  type Book,
} from '../lib/api';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
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

const fixedCategories = [
  'Fiction',
  'Non-Fiction',
  'Self-Growth',
  'Finance',
  'Science',
  'Education',
];

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

export default function CategoryDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectionOverride, setSelectionOverride] = useState<{
    key: string;
    value: string[];
  } | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSelectedRatings, setMobileSelectedRatings] = useState<number[]>(
    []
  );

  const { data: category } = useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: () => apiGetCategoryById(categoryId!),
    enabled: !!categoryId,
  });

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

  const paramCategoryName = useMemo(() => {
    if (!categoryId) return undefined;
    const match = fixedCategories.find(
      (c) => normalize(c) === normalize(categoryId)
    );
    return match;
  }, [categoryId]);

  const selectedCategories = useMemo(() => {
    return selectionOverride?.key === (categoryId ?? '')
      ? selectionOverride.value
      : category
      ? [category.name]
      : paramCategoryName
      ? [paramCategoryName]
      : [];
  }, [selectionOverride, categoryId, category, paramCategoryName]);

  const {
    data: books,
    isLoading,
    error,
  } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: apiGetBooks,
  });

  const desiredCount = 10;
  const cards = Array.from({ length: desiredCount }, (_, i) => ({
    id: i + 1,
    title: `Book Name ${i + 1}`,
    author: 'Author name',
    rating: '4.9',
    cover: books?.[i]?.cover_image || images[i % images.length],
  }));

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
  const displayedCards =
    selectedCategories.length === 0
      ? cards
      : cards.filter((b) => selectedCategories.includes(idToCategory[b.id]));

  const toggleCategory = (name: string) => {
    const isSelected = selectedCategories.includes(name);
    setSelectionOverride({
      key: categoryId ?? '',
      value: isSelected ? [] : [name],
    });
  };

  return (
    <>
      <Header />
      <main className='pb-[96px] pt-4 px-4xl'>
        <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4'>
          Book List
        </h1>
        {category && (
          <div className='mb-3'>
            <Card className='p-md border-neutral-200 bg-white'>
              <div className='text-sm font-semibold text-neutral-950'>
                {category.name}
              </div>
            </Card>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4'>
          <div className='hidden md:block'>
            <Card className='p-md border-neutral-200 bg-white'>
              <div className='text-sm font-bold text-neutral-950 mb-sm'>
                FILTER
              </div>
              <div className='text-xs font-semibold text-neutral-950 mb-2'>
                Category
              </div>
              <div className='space-y-sm'>
                <label className='flex items-center gap-sm text-sm text-neutral-900'>
                  <input
                    type='checkbox'
                    checked={selectedCategories.length === 0}
                    onChange={() =>
                      setSelectionOverride({ key: categoryId ?? '', value: [] })
                    }
                  />
                  <span>All</span>
                </label>
                {fixedCategories.map((c) => (
                  <label
                    key={c}
                    className='flex items-center gap-sm text-sm text-neutral-900'
                  >
                    <input
                      type='checkbox'
                      checked={selectedCategories.includes(c)}
                      onChange={() => toggleCategory(c)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              <div className='mt-lg text-xs font-semibold text-neutral-950'>
                Rating
              </div>
              <div className='mt-sm space-y-xxs text-sm text-neutral-900'>
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className='flex items-center gap-sm'>
                    <input type='checkbox' />
                    <Icon icon='mdi:star' className='size-4 text-yellow-500' />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className='md:hidden'>
            <Card className='border-neutral-200 bg-white'>
              <button
                className='w-full bg-white flex items-center justify-between px-md py-sm'
                onClick={() => setMobileFilterOpen((v) => !v)}
              >
                <span className='text-sm font-bold text-neutral-950'>
                  Filter
                </span>
                <Icon
                  icon='fluent:filter-16-filled'
                  className='size-5 text-neutral-900'
                />
              </button>
              {mobileFilterOpen && (
                <div className='px-md pb-md'>
                  <div className='text-xs font-semibold text-neutral-950 mb-2'>
                    Category
                  </div>
                  <div className='space-y-sm'>
                    <label className='flex items-center gap-sm text-sm text-neutral-900'>
                      <input
                        type='checkbox'
                        name='mobile-category-all'
                        checked={selectedCategories.length === 0}
                        onChange={() =>
                          setSelectionOverride({
                            key: categoryId ?? '',
                            value: [],
                          })
                        }
                      />
                      <span>All</span>
                    </label>
                    {fixedCategories.map((c) => (
                      <label
                        key={c}
                        className='flex items-center gap-sm text-sm text-neutral-900'
                      >
                        <input
                          type='checkbox'
                          name='mobile-category'
                          checked={selectedCategories.includes(c)}
                          onChange={() => toggleCategory(c)}
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                  <div className='mt-lg text-xs font-semibold text-neutral-950'>
                    Rating
                  </div>
                  <div className='mt-sm space-y-xxs text-sm text-neutral-900'>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <label key={r} className='flex items-center gap-sm'>
                        <input
                          type='checkbox'
                          name='mobile-rating'
                          checked={mobileSelectedRatings.includes(r)}
                          onChange={() => {
                            setMobileSelectedRatings((prev) =>
                              prev.includes(r)
                                ? prev.filter((x) => x !== r)
                                : [...prev, r]
                            );
                          }}
                        />
                        <Icon
                          icon='mdi:star'
                          className='size-4 text-yellow-500'
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className='text-red-500'>Gagal memuat data.</div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                {displayedCards.map((b) => (
                  <Link to={`/books/${b.id}`} key={String(b.id)}>
                    <BookCard
                      title={b.title}
                      author={b.author}
                      rating={b.rating}
                      cover={b.cover}
                      variant='related'
                    />
                  </Link>
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
