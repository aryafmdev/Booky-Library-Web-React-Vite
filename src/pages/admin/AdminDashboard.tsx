import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import BookFilter from '../../components/BookFilter';
import BookListItem from '../../components/BookListItem';
import { Card } from '../../components/ui/card';
import { Icon } from '@iconify/react';
import image01 from '../../assets/images/image01.png';
import image02 from '../../assets/images/image02.png';
import image03 from '../../assets/images/image03.png';
import image04 from '../../assets/images/image04.png';
import image05 from '../../assets/images/image05.png';
import image06 from '../../assets/images/image06.png';
import image07 from '../../assets/images/image07.png';
import image08 from '../../assets/images/image08.png';
import image09 from '../../assets/images/image09.png';
import image10 from '../../assets/images/image10.png';
import {
  apiGetBooks,
  apiSearchBooks,
  apiDeleteBook,
  apiAdminGetOverdueLoans,
  type Book,
  type Loan,
} from '../../lib/api';

export default function AdminDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const display = (user?.name || user?.email || 'Admin').trim();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') ?? 'borrowed';
  useEffect(() => {
    if (!params.get('tab')) setParams({ tab: 'borrowed' });
  }, [params, setParams]);

  const [searchUser, setSearchUser] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [searchBorrow, setSearchBorrow] = useState('');
  const [searchTerm, setSearchTerm] = useState(params.get('q') ?? '');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const param = params.get('category');
    return param ? [param] : [];
  });

  const { mutate: deleteBook } = useMutation({
    mutationFn: apiDeleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['books'],
    queryFn: apiGetBooks,
  });
  const { data: searchBooks } = useQuery({
    queryKey: ['books', 'search', searchTerm],
    queryFn: () => apiSearchBooks(searchTerm),
    enabled: !!searchTerm,
  });
  const filteredBooks = useMemo(() => {
    const source = searchBooks ?? books ?? [];
    return source.filter((book: Book) => {
      const matchStatus =
        selectedStatus === 'All' || book.status === selectedStatus;
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const selectedNorm = new Set(selectedCategories.map(norm));
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedNorm.has(norm(book.category.name));
      return matchStatus && matchCategory;
    });
  }, [books, searchBooks, selectedStatus, selectedCategories]);

  const displayBooks = useMemo(() => {
    const covers = [
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
    const replacements = Array.from({ length: 10 }, (_, i) => ({
      title:
        i === 0
          ? 'Book Name 1'
          : i === 1
          ? 'Book Name 2'
          : `Book Name ${i + 1}`,
      author: 'Author name',
      cover: covers[i % covers.length],
    }));
    const categoryMap = [
      'Finance',
      'Education',
      'Self-Growth',
      'Non-Fiction',
      'Fiction',
      'Science',
      'Self-Growth',
      'Fiction',
      'Fiction',
      'Education',
    ];
    const maxCount = 10;
    const base = filteredBooks.map((book, idx) => {
      if (idx < replacements.length) {
        const r = replacements[idx];
        return {
          ...book,
          title: r.title,
          author: { ...book.author, name: r.author },
          cover_image: r.cover,
          category: {
            id: book.category.id,
            name: categoryMap[idx] ?? book.category.name,
          },
        } as Book;
      }
      return book;
    });
    if (base.length < maxCount) {
      for (let i = base.length; i < maxCount; i++) {
        const r = replacements[i];
        base.push({
          id: -(i + 1) * 1000,
          title: r.title,
          author: { id: 0, name: r.author },
          isbn: '0000000000',
          category: { id: 0, name: categoryMap[i] ?? 'Fiction' },
          description: '—',
          stock_available: 0,
          published_year: new Date().getFullYear(),
          cover_image: r.cover,
          status: 'Available',
        } as Book);
      }
    }
    return base;
  }, [filteredBooks]);

  const { data: overdueLoans = [] } = useQuery<Loan[]>({
    queryKey: ['admin', 'loans', 'overdue'],
    queryFn: apiAdminGetOverdueLoans,
  });
  const [borrowedStatus, setBorrowedStatus] = useState<
    'All' | 'Active' | 'Returned' | 'Overdue'
  >('All');
  const [localLoans] = useState<Loan[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage).filter((k) =>
          k.startsWith('loans:')
        );
        const arr: Loan[] = [];
        for (const key of keys) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            for (const it of parsed) {
              const l = it as Loan;
              if (l && l.book && typeof l.book === 'object') arr.push(l);
            }
          }
        }
        return arr;
      }
    } catch (e) {
      void e;
    }
    return [];
  });
  const filteredBorrowed = useMemo(() => {
    const src = [...((overdueLoans ?? []) as Loan[]), ...localLoans];
    const q = searchBorrow.trim().toLowerCase();
    const resolveStatus = (l: Loan): string => {
      const s = String(l.status ?? '').trim();
      if (s) return s;
      const due = l?.due_at ? new Date(l.due_at) : null;
      const now = new Date();
      if (due && now > due) return 'Overdue';
      return 'Active';
    };
    return src.filter((l) => {
      const st = resolveStatus(l);
      const matchStatus = borrowedStatus === 'All' || st === borrowedStatus;
      return (
        matchStatus &&
        (!q ||
          l.book.title.toLowerCase().includes(q) ||
          l.book.author.name.toLowerCase().includes(q))
      );
    });
  }, [overdueLoans, localLoans, searchBorrow, borrowedStatus]);

  const users = useMemo(() => {
    const arr = Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      name: 'John Doe',
      phone: '081234567890',
      email: 'johndoe@email.com',
      created: '28 Aug 2025, 14:00',
    }));
    const q = searchUser.trim().toLowerCase();
    return arr.filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [searchUser]);

  const PAGE_SIZE_USER = 10;
  const totalUsers = users.length;
  const totalPagesUsers = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE_USER));
  const paginatedUsers = useMemo(() => {
    const current = Math.max(1, Math.min(userPage, totalPagesUsers));
    const start = (current - 1) * PAGE_SIZE_USER;
    return users.slice(start, start + PAGE_SIZE_USER);
  }, [users, userPage, totalPagesUsers]);
  const currentUserPage = Math.max(1, Math.min(userPage, totalPagesUsers));

  const pageItems = (total: number, current: number): (number | string)[] => {
    const items: (number | string)[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) items.push(i);
      return items;
    }
    items.push(1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) items.push('…');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 1) items.push('…');
    items.push(total);
    return items;
  };

  return (
    <div className='min-h-screen bg-neutral-25 text-neutral-900'>
      <Header />
      <main className='px-4xl py-3xl'>
        <div className='flex items-center justify-between'>
          <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950'>
            Admin Dashboard
          </h1>
          <div className='text-md font-medium text-neutral-950'>
            Welcome, {display}
          </div>
        </div>

        <div className='mt-lg md:w-1/2'>
          <div className='rounded-2xl border border-neutral-200 bg-white p-md'>
            <div className='rounded-lg bg-neutral-100 p-xxs flex gap-xxs'>
              {(['borrowed', 'users', 'books'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setParams({ tab: t })}
                  className={`flex-1 px-md py-xxs rounded-lg border text-sm ${
                    activeTab === t
                      ? 'bg-white border-neutral-300 shadow-sm font-bold text-neutral-950'
                      : 'border-transparent bg-transparent font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-white'
                  }`}
                >
                  {t === 'borrowed'
                    ? 'Borrowed List'
                    : t === 'users'
                    ? 'User'
                    : 'Book List'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'users' && (
          <section className='mt-3xl'>
            <h2 className='text-display-xs md:text-display-lg font-bold text-neutral-950'>
              User
            </h2>
            <div className='mt-md relative md:w-1/2'>
              <Icon
                icon='lucide:search'
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              />
              <Input
                placeholder='Search user'
                value={searchUser}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchUser(e.target.value);
                  setUserPage(1);
                }}
                className='rounded-full pl-10 w-full border-gray-300'
              />
            </div>
            <div className='mt-lg overflow-x-auto'>
              <table className='min-w-full bg-white rounded-xl border border-neutral-200'>
                <thead>
                  <tr className='text-left text-sm text-neutral-700'>
                    <th className='px-md py-sm'>No</th>
                    <th className='px-md py-sm'>Name</th>
                    <th className='px-md py-sm'>Nomor Handphone</th>
                    <th className='px-md py-sm'>Email</th>
                    <th className='px-md py-sm'>Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u, idx) => (
                    <tr key={u.id} className='border-t border-neutral-200'>
                      <td className='px-md py-sm text-sm'>
                        {(currentUserPage - 1) * PAGE_SIZE_USER + idx + 1}
                      </td>
                      <td className='px-md py-sm text-sm'>{u.name}</td>
                      <td className='px-md py-sm text-sm'>{u.phone}</td>
                      <td className='px-md py-sm text-sm'>{u.email}</td>
                      <td className='px-md py-sm text-sm'>{u.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='text-sm text-neutral-700 mt-sm flex items-center justify-between'>
                <div>
                  {(() => {
                    const start =
                      totalUsers === 0
                        ? 0
                        : (currentUserPage - 1) * PAGE_SIZE_USER + 1;
                    const end =
                      totalUsers === 0
                        ? 0
                        : Math.min(
                            currentUserPage * PAGE_SIZE_USER,
                            totalUsers
                          );
                    return `Showing ${start} to ${end} of ${totalUsers} entries`;
                  })()}
                </div>
                <div className='flex items-center gap-xxs'>
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={currentUserPage <= 1}
                    className='px-md py-xxs rounded-full border border-neutral-300 bg-white text-sm text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    ◀ Previous
                  </button>
                  {pageItems(totalPagesUsers, currentUserPage).map((it, i) =>
                    typeof it === 'number' ? (
                      <button
                        key={`${it}-${i}`}
                        onClick={() => setUserPage(it)}
                        className={`w-9 h-9 inline-flex items-center justify-center rounded-full border text-sm font-semibold ${
                          it === userPage
                            ? 'bg-white border-neutral-300 shadow-sm font-bold text-neutral-950'
                            : 'bg-transparent border-neutral-300 text-neutral-700'
                        }`}
                      >
                        {it}
                      </button>
                    ) : (
                      <span
                        key={`dots-${i}`}
                        className='px-sm text-neutral-700'
                      >
                        …
                      </span>
                    )
                  )}
                  <button
                    onClick={() =>
                      setUserPage((p) => Math.min(totalPagesUsers, p + 1))
                    }
                    disabled={currentUserPage >= totalPagesUsers}
                    className='px-md py-xxs rounded-full border border-neutral-300 bg-white text-sm text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'books' && (
          <section className='mt-3xl'>
            <h2 className='text-display-xs md:text-display-lg font-bold text-neutral-950'>
              Book List
            </h2>
            <div className='mt-md'>
              <Link
                to='/add-book'
                className='px-xl py-sm bg-primary-300 text-white font-bold rounded-full'
              >
                Add Book
              </Link>
            </div>
            <section className='mt-md mb-md'>
              <BookFilter
                searchTerm={searchTerm}
                onSearchChange={(v: string) => {
                  setSearchTerm(v);
                  setParams({ tab: 'books', q: v });
                }}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedCategories={selectedCategories}
                onToggleCategory={(name: string) => {
                  setSelectedCategories((prev) =>
                    prev.includes(name)
                      ? prev.filter((x) => x !== name)
                      : [...prev, name]
                  );
                }}
                showCategories={false}
              />
            </section>
            <section>
              {isLoadingBooks ? (
                <div>Loading…</div>
              ) : (
                <div className='space-y-md'>
                  {displayBooks.map((book: Book, idx: number) => (
                    <BookListItem
                      key={book.id}
                      book={book}
                      onDelete={deleteBook}
                      canEditDelete={true}
                      previewState={{
                        fromReco: {
                          id: book.id,
                          title: book.title,
                          author: book.author?.name,
                          cover: book.cover_image,
                        },
                        slot: idx + 1,
                      }}
                      editState={{
                        fromReco: {
                          id: book.id,
                          title: book.title,
                          author: book.author?.name,
                          cover: book.cover_image,
                          description:
                            'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim.',
                        },
                        slot: idx + 1,
                      }}
                      previewPathPrefix={'/admin/books'}
                    />
                  ))}
                </div>
              )}
            </section>
          </section>
        )}

        {activeTab === 'borrowed' && (
          <section className='mt-3xl'>
            <h2 className='text-display-xs md:text-display-lg font-bold text-neutral-950'>
              Borrowed List
            </h2>
            <div className='mt-md relative md:w-1/2'>
              <Icon
                icon='lucide:search'
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              />
              <Input
                placeholder='Search'
                value={searchBorrow}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchBorrow(e.target.value)
                }
                className='rounded-full pl-10 w-full border-gray-300'
              />
            </div>
            <div className='mt-lg flex items-center gap-sm'>
              {['All', 'Active', 'Returned', 'Overdue'].map((s) => {
                const isSelected =
                  borrowedStatus ===
                  (s as 'All' | 'Active' | 'Returned' | 'Overdue');
                const classes =
                  s === 'Overdue'
                    ? isSelected
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-white text-red-700 border border-red-200'
                    : isSelected
                    ? 'bg-white text-primary-300 border border-primary-300'
                    : 'bg-white text-neutral-900 border border-neutral-300';
                return (
                  <button
                    key={s}
                    onClick={() =>
                      setBorrowedStatus(
                        s as 'All' | 'Active' | 'Returned' | 'Overdue'
                      )
                    }
                    className={`px-md py-xxs rounded-full text-sm font-semibold ${classes}`}
                    aria-pressed={isSelected}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className='mt-lg space-y-md'>
              {filteredBorrowed.map((l) => {
                const dueLabel = l?.due_at
                  ? new Date(l.due_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '';
                const statusLabel = (() => {
                  const s =
                    String(l.status ?? '').trim() ||
                    (l?.due_at && new Date() > new Date(l.due_at)
                      ? 'Overdue'
                      : 'Active');
                  return s || 'Active';
                })();
                const borrowedLabel = l?.borrowed_at
                  ? new Date(l.borrowed_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';
                const durationText = (() => {
                  if (l?.borrowed_at && l?.due_at) {
                    const start = new Date(l.borrowed_at).getTime();
                    const end = new Date(l.due_at).getTime();
                    const days = Math.max(
                      1,
                      Math.round((end - start) / (1000 * 60 * 60 * 24))
                    );
                    return `Duration ${days} Days`;
                  }
                  return '';
                })();
                const borrowerName = 'John Doe';
                return (
                  <Card key={l.id} className='p-md border-neutral-200 bg-white'>
                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-neutral-900 font-semibold flex items-center gap-xxs'>
                        <span>Status</span>
                        {statusLabel === 'Overdue' ? (
                          <span className='inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold bg-red-50 text-red-700 border-red-200'>
                            Overdue
                          </span>
                        ) : statusLabel === 'Active' ? (
                          <span className='inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold bg-green-50 text-green-700 border-green-200'>
                            Active
                          </span>
                        ) : (
                          <span className='inline-flex leading-tight px-sm py-xxs rounded-full border text-xs font-semibold bg-white text-neutral-900 border-neutral-300'>
                            Returned
                          </span>
                        )}
                      </div>
                      {dueLabel && (
                        <div className='flex items-center gap-xxs'>
                          <span className='text-sm font-bold text-neutral-900'>
                            Due Date
                          </span>
                          <span className='inline-flex leading-tight px-sm py-xxs rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-bold'>
                            {dueLabel}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='my-sm h-px bg-neutral-200' />
                    <div className='grid grid-cols-[1fr_auto] gap-md items-start'>
                      <div className='flex items-start gap-md'>
                        <img
                          src={l.book.cover_image}
                          alt={l.book.title}
                          className='w-20 h-28 rounded-md object-cover'
                        />
                        <div className='flex-1'>
                          <div className='flex items-center gap-xxs'>
                            <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
                              {l.book.category.name}
                            </span>
                          </div>
                          <div className='mt-xxs text-neutral-950 font-bold text-md'>
                            {l.book.title}
                          </div>
                          <div className='text-xs text-neutral-700'>
                            {l.book.author.name}
                          </div>
                          <div className='mt-xxs text-xs text-neutral-700'>
                            {borrowedLabel && <span>{borrowedLabel}</span>}
                            {borrowedLabel && durationText ? (
                              <span> · </span>
                            ) : null}
                            {durationText && <span>{durationText}</span>}
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-xs text-neutral-700'>
                          borrower’s name
                        </div>
                        <div className='text-md font-bold text-neutral-950'>
                          {borrowerName}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {filteredBorrowed.length === 0 && (
                <div className='text-sm text-neutral-700'>
                  No overdue loans.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
