import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiGetMeProfile, apiUpdateMeProfile, apiGetMyLoansV2, apiGetMyReviews, apiReturnLoan, type MeProfile, type Loan, type Review } from '../lib/api';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';

export default function Profile() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as 'profile' | 'loans' | 'reviews') || 'profile';
  const selectedBookId = Number(searchParams.get('book') || 0) || undefined;

  const { data: me } = useQuery<MeProfile>({ queryKey: ['me'], queryFn: apiGetMeProfile });
  const { data: loans = [] } = useQuery<Loan[]>({ queryKey: ['loans', 'my'], queryFn: apiGetMyLoansV2 });
  const { data: reviews } = useQuery<Review[]>({ queryKey: ['me', 'reviews'], queryFn: apiGetMyReviews });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const updateMutation = useMutation({
    mutationFn: apiUpdateMeProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const upsertReviewMutation = useMutation({
    mutationFn: (payload: { book_id: number; rating: number; comment?: string }) =>
      import('../lib/api').then((m) => m.apiUpsertReview(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'reviews'] });
      setSearchParams({ tab: 'reviews' });
      setRating(0);
      setComment('');
    },
  });

  const returnLoanMutation = useMutation({
    mutationFn: apiReturnLoan,
    onMutate: async (loanId: number) => {
      await queryClient.cancelQueries({ queryKey: ['loans', 'my'] });
      const previous = queryClient.getQueryData<Loan[]>(['loans', 'my']);
      queryClient.setQueryData<Loan[]>(['loans', 'my'], (old) =>
        (old || []).map((l) => (l.id === loanId ? { ...l, status: 'Returned' } : l))
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
    updateMutation.mutate({ name: name || me?.name, phone: phone || me?.phone });
  };

  return (
    <>
      <Header />
      <main className="pb-[96px] pt-4 px-4xl">
        <div className="flex gap-sm">
          {['profile', 'loans', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setSearchParams({ tab: t })}
              className={`px-md py-xxs rounded-full border ${tab === t ? 'bg-neutral-200 border-neutral-300' : 'bg-white border-neutral-200'} text-sm font-semibold`}
            >
              {t === 'profile' ? 'Profile' : t === 'loans' ? 'Borrowed List' : 'Reviews'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <section className="mt-md">
            <h1 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4">Profile</h1>
            <Card className="p-lg bg-white border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md items-start">
                <div className="space-y-sm">
                  <div className="text-sm text-neutral-700">Name</div>
                  <Input value={name || me?.name || ''} onChange={(e) => setName(e.target.value)} />
                  <div className="text-sm text-neutral-700">Email</div>
                  <Input value={me?.email || ''} disabled />
                  <div className="text-sm text-neutral-700">Nomor Handphone</div>
                  <Input value={phone || me?.phone || ''} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <Button className="mt-md w-full rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300" onClick={onUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating…' : 'Update Profile'}
              </Button>
            </Card>
          </section>
        )}

        {tab === 'loans' && (
          <section className="mt-md">
            <h1 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4">Borrowed List</h1>

            <div className="max-w-xl">
              <Input placeholder="Search book" className="w-full" onChange={(e) => setSearchParams({ tab: 'loans', q: e.target.value, status: searchParams.get('status') || 'All' })} value={searchParams.get('q') || ''} />
            </div>

            <div className="mt-sm flex items-center gap-sm">
              {['All', 'Active', 'Returned', 'Overdue'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchParams({ tab: 'loans', q: searchParams.get('q') || '', status: s })}
                  className={`px-md py-xxs rounded-full border text-sm font-semibold ${
                    (searchParams.get('status') || 'All') === s ? 'bg-neutral-200 border-neutral-300' : 'bg-white border-neutral-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {(() => {
              const q = (searchParams.get('q') || '').toLowerCase();
              const filter = (searchParams.get('status') || 'All') as 'All' | 'Active' | 'Returned' | 'Overdue';
              const computed = loans.map((l) => {
                const isOverdue = l.due_at ? dayjs(l.due_at).isBefore(dayjs(), 'day') : false;
                const status = (l.status as string) || (isOverdue ? 'Overdue' : 'Active');
                const durationDays = l.borrowed_at && l.due_at ? dayjs(l.due_at).diff(dayjs(l.borrowed_at), 'day') : undefined;
                return { ...l, status, durationDays } as Loan & { status: string; durationDays?: number };
              });
              const filtered = computed.filter((l) => {
                const bySearch = q ? l.book.title.toLowerCase().includes(q) || l.book.author.name.toLowerCase().includes(q) : true;
                const byStatus = filter === 'All' ? true : l.status === filter;
                return bySearch && byStatus;
              });

              return (
                <div className="mt-md space-y-md">
                  {filtered.map((l) => {
                    const statusClass =
                      l.status === 'Active'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : l.status === 'Returned'
                        ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        : 'bg-red-100 text-red-700 border-red-200';
                    const dueLabel = l.due_at ? dayjs(l.due_at).format('DD MMMM YYYY') : '-';
                    const durationText = l.durationDays ? `${l.durationDays} Days` : undefined;
                    return (
                      <Card key={l.id} className="p-md bg-white border-neutral-200">
                        <div className="flex items-start gap-md">
                          <img src={l.book.cover_image} alt={l.book.title} className="w-20 h-28 rounded-md object-cover" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className={`inline-flex px-sm py-xxs rounded-full border text-xs font-semibold ${statusClass}`}>Status {l.status}</span>
                              <span className="inline-flex px-sm py-xxs rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">Due Date <span className="ml-xxs font-bold">{dueLabel}</span></span>
                            </div>
                            <div className="mt-sm flex items-start gap-md">
                              <div className="flex-1">
                                <span className="inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700">{l.book.category.name}</span>
                                <div className="mt-xxs text-neutral-950 font-bold text-md">{l.book.title}</div>
                                <div className="text-xs text-neutral-700">{l.book.author.name}</div>
                                <div className="mt-xxs text-xs text-neutral-700">
                                  {l.borrowed_at ? dayjs(l.borrowed_at).format('DD MMM YYYY') : '-'}
                                  {durationText ? ` · Duration ${durationText}` : ''}
                                </div>
                              </div>
                            </div>
                            <div className="mt-md flex gap-sm">
                              <Button className="rounded-full bg-primary-300 text-white font-bold" onClick={() => setSearchParams({ tab: 'reviews', book: String(l.book.id) })}>Give Review</Button>
                              {(l.status === 'Active' || l.status === 'Overdue' || !l.status) && (
                                <Button
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() => returnLoanMutation.mutate(l.id)}
                                  disabled={returnLoanMutation.isPending}
                                >
                                  {returnLoanMutation.isPending ? 'Returning…' : 'Return Book'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="text-sm text-neutral-700">No loans found.</div>
                  )}
                  <div className="flex justify-center">
                    <button className="rounded-full text-neutral-950 border border-neutral-200 bg-white px-lg py-sm text-sm font-bold">Load More</button>
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {tab === 'reviews' && (
          <section className="mt-md">
            <h1 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4">Reviews</h1>
            {selectedBookId ? (
              <Card className="p-lg bg-white border-neutral-200">
                {(() => {
                  const loan = loans.find((l) => l.book.id === selectedBookId);
                  return loan ? (
                    <div className="flex items-start gap-md">
                      <img src={loan.book.cover_image} alt={loan.book.title} className="w-20 h-28 rounded-md object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-neutral-950">{loan.book.title}</div>
                        <div className="text-xs text-neutral-700">{loan.book.author.name}</div>
                        <div className="mt-md flex items-center gap-xs">
                          {[1,2,3,4,5].map((s) => (
                            <button key={s} className="size-8 flex items-center justify-center" onClick={() => setRating(s)}>
                              <Icon icon="mdi:star" className={`size-6 ${rating >= s ? 'text-yellow-500' : 'text-neutral-300'}`} />
                            </button>
                          ))}
                        </div>
                        <div className="mt-sm">
                          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full min-h-24 rounded-md border border-neutral-300 p-sm text-sm" placeholder="Write your review" />
                        </div>
                        <div className="mt-md flex gap-sm">
                          <Button
                            className="rounded-full bg-primary-300 text-white font-bold"
                            onClick={() => selectedBookId && rating > 0 && upsertReviewMutation.mutate({ book_id: selectedBookId, rating, comment: comment || undefined })}
                            disabled={upsertReviewMutation.isPending || rating === 0}
                          >
                            {upsertReviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setSearchParams({ tab: 'reviews' })}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-700">Book not found.</div>
                  );
                })()}
              </Card>
            ) : (
              <div className="space-y-md">
                {reviews?.map((r) => (
                  <Card key={r.id} className="p-md bg-white border-neutral-200">
                    <div className="flex items-start gap-md">
                      <img src={r.book.cover_image} alt={r.book.title} className="w-20 h-28 rounded-md object-cover" />
                      <div>
                        <div className="text-sm font-bold text-neutral-950">{r.book.title}</div>
                        <div className="text-xs text-neutral-700">Rating: {r.rating}</div>
                        {r.comment && <div className="text-xs text-neutral-700">{r.comment}</div>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}