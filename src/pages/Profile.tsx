import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  apiGetMeProfile,
  apiUpdateMeProfile,
  apiGetMyLoansV2,
  apiGetMyReviews,
  apiReturnLoan,
  type MeProfile,
  type Loan,
  type Review,
} from '../lib/api';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import avatarUser from '../assets/images/avatar-user.png';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../app/store';
import { authSuccessUser } from '../features/auth/authSlice';
import type { RootState } from '../app/store';

export default function Profile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab =
    (searchParams.get('tab') as 'profile' | 'loans' | 'reviews') || 'profile';
  const selectedBookId = Number(searchParams.get('book') || 0) || undefined;

  const { data: me } = useQuery<MeProfile>({
    queryKey: ['me'],
    queryFn: apiGetMeProfile,
  });
  const meDisplay: MeProfile | undefined = (() => {
    const src =
      me ??
      (user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
          }
        : undefined);
    const nameBase = (src?.name || '').trim();
    const emailBase = (src?.email || '').trim();
    const cap = (s: string) =>
      s
        .trim()
        .split(/\s+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');
    return {
      id: String(src?.id ?? 'guest'),
      name: nameBase ? cap(nameBase) : 'John Doe',
      email: emailBase || 'johndoe@example.com',
      phone: src?.phone ?? '123456789000',
      avatar: src?.avatar,
    } as MeProfile;
  })();
  const { data: loans = [] } = useQuery<Loan[]>({
    queryKey: ['loans', 'my'],
    queryFn: apiGetMyLoansV2,
  });
  const [localLoans, setLocalLoans] = useState<Loan[]>([]);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user');
        const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
        const key = `loans:${id ?? 'guest'}`;
        const raw = localStorage.getItem(key);
        let parsed = raw ? (JSON.parse(raw) as Loan[]) : [];
        if (!parsed || parsed.length === 0) {
          const altKeys: string[] = [];
          const allKeys = Object.keys(localStorage).filter((k) =>
            k.startsWith('loans:')
          );
          if (!allKeys.includes('loans:guest')) altKeys.push('loans:guest');
          if (!allKeys.includes('loans:0')) altKeys.push('loans:0');
          altKeys.push(...allKeys);
          for (const k of altKeys) {
            try {
              const r = localStorage.getItem(k);
              const p = r ? (JSON.parse(r) as Loan[]) : [];
              if (p && p.length > 0) {
                parsed = p;
                break;
              }
            } catch {
              void 0;
            }
          }
        }
        setLocalLoans(parsed);
      }
    } catch {
      setLocalLoans([]);
    }
  }, [user?.id]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const next = localLoans.map((l) => {
          const overdue = l.due_at
            ? dayjs(l.due_at).isBefore(dayjs(), 'day')
            : false;
          if (l.status !== 'Returned' && overdue)
            return { ...l, status: 'Overdue' } as Loan;
          return l;
        });
        const changed = next.some((n, i) => n.status !== localLoans[i]?.status);
        if (changed) {
          const u = localStorage.getItem('user');
          const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
          const key = `loans:${id ?? 'guest'}`;
          localStorage.setItem(key, JSON.stringify(next));
          setLocalLoans(next);
        }
      }
    } catch (e) {
      void e;
    }
  }, [localLoans]);
  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['me', 'reviews'],
    queryFn: apiGetMyReviews,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [editing, setEditing] = useState(false);

  const updateMutation = useMutation({
    mutationFn: apiUpdateMeProfile,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditing(false);
      const next = {
        id: String((updated as MeProfile)?.id ?? me?.id ?? '0'),
        name: (updated as MeProfile)?.name ?? me?.name ?? '',
        email: (updated as MeProfile)?.email ?? me?.email ?? '',
        phone: (updated as MeProfile)?.phone ?? me?.phone,
        role: undefined,
        avatar: (updated as MeProfile)?.avatar ?? me?.avatar,
      };
      dispatch(authSuccessUser(next));
    },
  });

  const upsertReviewMutation = useMutation({
    mutationFn: (payload: {
      book_id: number;
      rating: number;
      comment?: string;
    }) => import('../lib/api').then((m) => m.apiUpsertReview(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'reviews'] });
      setSearchParams({ tab: 'reviews' });
      setRating(0);
      setComment('');
    },
  });

  const returnLocalLoan = (loanId: number) => {
    try {
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user');
        const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
        const key = `loans:${id ?? 'guest'}`;
        const raw = localStorage.getItem(key);
        const prev = raw ? (JSON.parse(raw) as Loan[]) : [];
        const next = prev.map((l) =>
          l.id === loanId ? { ...l, status: 'Returned' } : l
        );
        localStorage.setItem(key, JSON.stringify(next));
        setLocalLoans(next);
      }
    } catch (e) {
      void e;
    }
  };

  const returnLoanMutation = useMutation({
    mutationFn: apiReturnLoan,
    onMutate: async (loanId: number) => {
      await queryClient.cancelQueries({ queryKey: ['loans', 'my'] });
      const previous = queryClient.getQueryData<Loan[]>(['loans', 'my']);
      queryClient.setQueryData<Loan[]>(['loans', 'my'], (old) =>
        (old || []).map((l) =>
          l.id === loanId ? { ...l, status: 'Returned' } : l
        )
      );
      return { previous };
    },
    onError: (_err, _loanId, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<Loan[]>(['loans', 'my'], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loans', 'my'] });
    },
  });

  const onUpdate = () => {
    updateMutation.mutate({
      name: name || meDisplay?.name,
      phone: phone || meDisplay?.phone,
    });
  };

  return (
    <>
      <Header />
      <main className='pt-4 px-4xl'>
        <div className='grid grid-cols-1 md:grid-cols-1 gap-6'>
          <div className='md:pr-6'>
            <div className='rounded-2xl border border-neutral-200 bg-white p-md'>
              <div className='rounded-lg bg-neutral-100 p-xxs flex gap-xxs'>
                {(['profile', 'loans', 'reviews'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSearchParams({ tab: t })}
                    className={`flex-1 px-md py-xxs rounded-lg border text-sm ${
                      tab === t
                        ? 'bg-white border-neutral-300 shadow-sm font-bold text-neutral-950'
                        : 'border-transparent bg-transparent font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-white'
                    }`}
                  >
                    {t === 'profile'
                      ? 'Profile'
                      : t === 'loans'
                      ? 'Borrowed List'
                      : 'Reviews'}
                  </button>
                ))}
              </div>

              {tab === 'profile' && (
                <section className='mt-md'>
                  <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4'>
                    Profile
                  </h1>
                  <Card className='p-lg bg-white border-neutral-200'>
                    {!editing ? (
                      <>
                        <div className='space-y-md'>
                          <img
                            src={meDisplay?.avatar || avatarUser}
                            alt={meDisplay?.name || 'User'}
                            className='w-12 h-12 md:w-16 md:h-16 rounded-full object-cover'
                          />
                          <div className='grid grid-cols-2 gap-y-sm'>
                            <div className='text-sm text-neutral-700'>Name</div>
                            <div className='w-full text-right text-sm md:text-md font-bold text-neutral-950'>
                              {name || meDisplay?.name || '-'}
                            </div>
                            <div className='text-sm text-neutral-700'>
                              Email
                            </div>
                            <div className='w-full text-right text-sm md:text-md font-bold text-neutral-950'>
                              {meDisplay?.email || '-'}
                            </div>
                            <div className='text-sm text-neutral-700'>
                              Nomor Handphone
                            </div>
                            <div className='w-full text-right text-sm md:text-md font-bold text-neutral-950'>
                              {phone || meDisplay?.phone || '-'}
                            </div>
                          </div>
                        </div>
                        <Button
                          className='mt-md w-full rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300 hover:bg-primary-400'
                          onClick={() => {
                            setName(meDisplay?.name || '');
                            setPhone(meDisplay?.phone || '');
                            setEditing(true);
                          }}
                          disabled={updateMutation.isPending}
                        >
                          Update Profile
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-md items-start'>
                          <div className='space-y-sm'>
                            <div className='text-sm text-neutral-700'>Name</div>
                            <Input
                              value={name || meDisplay?.name || ''}
                              onChange={(e) => setName(e.target.value)}
                            />
                            <div className='text-sm text-neutral-700'>
                              Nomor Handphone
                            </div>
                            <Input
                              value={phone || meDisplay?.phone || ''}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          <div className='space-y-sm'>
                            <div className='text-sm text-neutral-700'>
                              Email
                            </div>
                            <Input value={meDisplay?.email || ''} disabled />
                          </div>
                        </div>
                        <div className='mt-md flex gap-sm'>
                          <Button
                            className='flex-1 rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300 hover:bg-primary-400'
                            onClick={onUpdate}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending
                              ? 'Updating…'
                              : 'Save Profile'}
                          </Button>
                          <Button
                            variant='outline'
                            className='rounded-full text-black'
                            onClick={() => {
                              setEditing(false);
                              setName('');
                              setPhone('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </Card>
                </section>
              )}

              {tab === 'loans' && (
                <section className='mt-md'>
                  <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4'>
                    Borrowed List
                  </h1>

                  <div className='w-full'>
                    <Input
                      placeholder='Search book'
                      className='w-full'
                      onChange={(e) =>
                        setSearchParams({
                          tab: 'loans',
                          q: e.target.value,
                          status: searchParams.get('status') || 'All',
                        })
                      }
                      value={searchParams.get('q') || ''}
                    />
                  </div>

                  <div className='mt-sm flex items-center gap-sm'>
                    {['All', 'Active', 'Returned', 'Overdue'].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setSearchParams({
                            tab: 'loans',
                            q: searchParams.get('q') || '',
                            status: s,
                          })
                        }
                        className={`px-md py-xxs rounded-full border text-sm font-semibold ${
                          (searchParams.get('status') || 'All') === s
                            ? 'bg-primary-100 border-primary-300 text-primary-300'
                            : 'bg-white border-neutral-200 text-neutral-950'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const q = (searchParams.get('q') || '').toLowerCase();
                    const filter = (searchParams.get('status') || 'All') as
                      | 'All'
                      | 'Active'
                      | 'Returned'
                      | 'Overdue';
                    const computed = [...loans, ...localLoans].map((l) => {
                      const isOverdue = l.due_at
                        ? dayjs(l.due_at).isBefore(dayjs(), 'day')
                        : false;
                      const status =
                        l.status === 'Returned'
                          ? 'Returned'
                          : l.status === 'Overdue'
                          ? 'Overdue'
                          : isOverdue
                          ? 'Overdue'
                          : 'Active';
                      const durationDays =
                        l.borrowed_at && l.due_at
                          ? dayjs(l.due_at).diff(dayjs(l.borrowed_at), 'day')
                          : undefined;
                      return { ...l, status, durationDays } as Loan & {
                        status: string;
                        durationDays?: number;
                      };
                    });
                    const filtered = computed.filter((l) => {
                      const bySearch = q
                        ? l.book.title.toLowerCase().includes(q) ||
                          l.book.author.name.toLowerCase().includes(q)
                        : true;
                      const byStatus =
                        filter === 'All' ? true : l.status === filter;
                      return bySearch && byStatus;
                    });

                    return (
                      <div className='mt-md space-y-md'>
                        {filtered.map((l) => {
                          const statusClass =
                            l.status === 'Active'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : l.status === 'Returned'
                              ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                              : 'bg-red-100 text-red-700 border-red-200';
                          const dueLabel = l.due_at
                            ? dayjs(l.due_at).format('DD MMMM YYYY')
                            : '-';
                          const durationText = l.durationDays
                            ? `${l.durationDays} Days`
                            : undefined;
                          return (
                            <Card
                              key={l.id}
                              className='p-md bg-white border-neutral-200'
                            >
                              <div className='flex items-start gap-md'>
                                <img
                                  src={l.book.cover_image}
                                  alt={l.book.title}
                                  className='w-20 h-28 rounded-md object-cover'
                                />
                                <div className='flex-1'>
                                  <div className='flex justify-between items-start'>
                                    <span
                                      className={`inline-flex px-sm py-xxs rounded-full border text-xs font-semibold ${statusClass}`}
                                    >
                                      Status {l.status}
                                    </span>
                                    <span className='inline-flex px-sm py-xxs rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-semibold'>
                                      Due Date{' '}
                                      <span className='ml-xxs font-bold'>
                                        {dueLabel}
                                      </span>
                                    </span>
                                  </div>
                                  <div className='mt-sm flex items-start gap-md'>
                                    <div className='flex-1'>
                                      <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
                                        {l.book.category.name}
                                      </span>
                                      <div className='mt-xxs text-neutral-950 font-bold text-md'>
                                        {l.book.title}
                                      </div>
                                      <div className='text-xs text-neutral-700'>
                                        {l.book.author.name}
                                      </div>
                                      <div className='mt-xxs text-xs text-neutral-700'>
                                        {l.borrowed_at
                                          ? dayjs(l.borrowed_at).format(
                                              'DD MMM YYYY'
                                            )
                                          : '-'}
                                        {durationText
                                          ? ` · Duration ${durationText}`
                                          : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <div className='mt-md flex gap-sm justify-end'>
                                    {(l.status === 'Active' ||
                                      l.status === 'Overdue' ||
                                      !l.status) && (
                                      <Button
                                        variant='outline'
                                        className='rounded-full text-neutral-700'
                                        onClick={() => {
                                          if (l.id < 0) {
                                            returnLocalLoan(l.id);
                                            setSearchParams({
                                              tab: 'loans',
                                              q: searchParams.get('q') || '',
                                              status: 'Returned',
                                            });
                                          } else {
                                            returnLoanMutation.mutate(l.id, {
                                              onSuccess: () =>
                                                setSearchParams({
                                                  tab: 'loans',
                                                  q:
                                                    searchParams.get('q') || '',
                                                  status: 'Returned',
                                                }),
                                            });
                                          }
                                        }}
                                        disabled={returnLoanMutation.isPending}
                                      >
                                        {returnLoanMutation.isPending
                                          ? 'Returning…'
                                          : 'Return Book'}
                                      </Button>
                                    )}
                                    <Button
                                      className='rounded-full bg-primary-300 text-white font-bold hover:bg-primary-400'
                                      onClick={() =>
                                        setSearchParams({
                                          tab: 'reviews',
                                          book: String(l.book.id),
                                        })
                                      }
                                    >
                                      Give Review
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                        {filtered.length === 0 && (
                          <div className='text-sm text-neutral-700'>
                            No loans found.
                          </div>
                        )}
                        <div className='flex justify-center'>
                          <button className='rounded-full text-neutral-950 border border-neutral-200 bg-white px-lg py-sm text-sm font-bold'>
                            Load More
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              )}

              {tab === 'reviews' && (
                <section className='mt-md'>
                  <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4'>
                    Reviews
                  </h1>
                  {selectedBookId ? (
                    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
                      <Card className='p-lg bg-white border-neutral-200 max-w-md w-full'>
                        {(() => {
                          const loan = loans.find(
                            (l) => l.book.id === selectedBookId
                          );
                          return loan ? (
                            <div>
                              <div className='text-md font-bold text-neutral-950 mb-sm'>
                                Give Review
                              </div>
                              <div className='flex items-start gap-md'>
                                <img
                                  src={loan.book.cover_image}
                                  alt={loan.book.title}
                                  className='w-16 h-24 rounded-md object-cover'
                                />
                                <div className='flex-1'>
                                  <div className='text-sm font-bold text-neutral-950'>
                                    {loan.book.title}
                                  </div>
                                  <div className='text-xs text-neutral-700'>
                                    {loan.book.author.name}
                                  </div>
                                </div>
                              </div>
                              <div className='mt-md text-sm font-semibold text-neutral-950'>
                                Give Rating
                              </div>
                              <div className='mt-xxs flex items-center gap-xs justify-center'>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    className='size-8 flex items-center justify-center'
                                    onClick={() => setRating(s)}
                                  >
                                    <Icon
                                      icon='mdi:star'
                                      className={`size-6 ${
                                        rating >= s
                                          ? 'text-yellow-500'
                                          : 'text-neutral-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <div className='mt-sm'>
                                <textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className='w-full min-h-24 rounded-md border border-neutral-300 p-sm text-sm'
                                  placeholder='Please share your thoughts about this book'
                                />
                              </div>
                              <div className='mt-md'>
                                <Button
                                  className='w-full rounded-full bg-primary-300 text-white font-bold'
                                  onClick={() =>
                                    selectedBookId &&
                                    rating > 0 &&
                                    upsertReviewMutation.mutate({
                                      book_id: selectedBookId,
                                      rating,
                                      comment: comment || undefined,
                                    })
                                  }
                                  disabled={
                                    upsertReviewMutation.isPending ||
                                    rating === 0
                                  }
                                >
                                  {upsertReviewMutation.isPending
                                    ? 'Sending…'
                                    : 'Send'}
                                </Button>
                                <div className='mt-sm flex justify-center'>
                                  <button
                                    className='text-sm text-neutral-700'
                                    onClick={() =>
                                      setSearchParams({ tab: 'reviews' })
                                    }
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='text-sm text-neutral-700'>
                              Book not found.
                            </div>
                          );
                        })()}
                      </Card>
                    </div>
                  ) : (
                    <div className='space-y-md'>
                      {reviews?.map((r) => (
                        <Card
                          key={r.id}
                          className='p-md bg-white border-neutral-200'
                        >
                          <div className='text-xs text-neutral-700 mb-sm'>
                            {r.created_at
                              ? dayjs(r.created_at).format(
                                  'DD MMMM YYYY, HH:mm'
                                )
                              : '-'}
                          </div>
                          <div className='flex items-start gap-md'>
                            <img
                              src={r.book.cover_image}
                              alt={r.book.title}
                              className='w-20 h-28 rounded-md object-cover'
                            />
                            <div className='flex-1'>
                              <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
                                {r.book.category.name}
                              </span>
                              <div className='mt-xxs text-neutral-950 font-bold text-md'>
                                {r.book.title}
                              </div>
                              <div className='text-xs text-neutral-700'>
                                {r.book.author.name}
                              </div>
                              <div className='mt-sm flex items-center gap-xxs'>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Icon
                                    key={s}
                                    icon='mdi:star'
                                    className={`size-4 ${
                                      r.rating >= s
                                        ? 'text-yellow-500'
                                        : 'text-neutral-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {r.comment && (
                                <div className='mt-xxs text-xs text-neutral-700'>
                                  {r.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
          <div className='hidden md:block' />
        </div>
      </main>
      <Footer />
    </>
  );
}
