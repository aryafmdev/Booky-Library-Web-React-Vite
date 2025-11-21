import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiGetMeProfile, apiGetCart, apiCheckoutCart, apiDeleteCartItem, type MeProfile, type CartItem, type Book } from '../lib/api';
import { removeItem } from '../features/cart/cartSlice.ts';
import type { RootState } from '../app/store';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const { data: me } = useQuery<MeProfile>({
    queryKey: ['me'],
    queryFn: apiGetMeProfile,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
    initialData: (() => {
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('user');
          if (raw) {
            const u = JSON.parse(raw) as { id?: string; name?: string; email?: string; phone?: string; avatar?: string };
            const cap = (s: string) => s.trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '')).join(' ');
            const baseName = (u?.name || '').trim() || (u?.email ? String(u.email).split('@')[0] : '').trim();
            return { id: String(u?.id ?? 'guest'), name: baseName ? cap(baseName) : 'John Doe', email: ((u?.email || '').trim()) || 'johndoe@example.com', phone: u?.phone ?? '123456789000', avatar: u?.avatar } as MeProfile;
          }
        }
      } catch {
        void 0;
      }
      return { id: 'guest', name: 'John Doe', email: 'johndoe@example.com', phone: '123456789000', avatar: undefined } as MeProfile;
    })(),
  });
  const localUser = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) as { id?: string; name?: string; email?: string; phone?: string; avatar?: string } : null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);
  const meDisplay: MeProfile = (() => {
    const srcUser = (() => {
      if (me) {
        return { id: String(me.id ?? 'guest'), name: String(me.name ?? ''), email: String(me.email ?? ''), phone: me.phone, avatar: me.avatar } as MeProfile;
      }
      if (user) {
        return { id: String(user.id ?? 'guest'), name: String(user.name ?? ''), email: String(user.email ?? ''), phone: user.phone, avatar: user.avatar } as unknown as MeProfile;
      }
      if (localUser) {
        return { id: String(localUser.id ?? 'guest'), name: String(localUser.name ?? ''), email: String(localUser.email ?? ''), phone: localUser.phone, avatar: localUser.avatar } as unknown as MeProfile;
      }
      return { id: 'guest', name: '', email: '', phone: undefined, avatar: undefined } as MeProfile;
    })();
    const cap = (s: string) => s.trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '')).join(' ');
    const baseName = (srcUser.name || '').trim() || (srcUser.email ? String(srcUser.email).split('@')[0] : '').trim();
    return {
      id: String(srcUser.id ?? 'guest'),
      name: baseName ? cap(baseName) : 'John Doe',
      email: (srcUser.email || '').trim() || 'johndoe@example.com',
      phone: srcUser.phone ?? '123456789000',
      avatar: srcUser.avatar,
    } as MeProfile;
  })();
  const { data: items = [] } = useQuery<CartItem[]>({ queryKey: ['cart'], queryFn: apiGetCart });
  const routeBorrowBooks = useMemo(() => ((location.state as { borrowBooks?: Book[] } | undefined)?.borrowBooks) ?? [], [location.state]);
  const storedBorrowBooks = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('checkout_borrow_books');
        return raw ? (JSON.parse(raw) as Book[]) : [];
      }
      return [];
    } catch {
      return [];
    }
  }, []);
  useEffect(() => {
    if (routeBorrowBooks.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem('checkout_borrow_books', JSON.stringify(routeBorrowBooks));
      } catch (e) {
        void e;
      }
    }
  }, [routeBorrowBooks]);

  const initialBorrowBooks = routeBorrowBooks.length > 0 ? routeBorrowBooks : storedBorrowBooks;
  const [borrowBooksState, setBorrowBooksState] = useState<Book[]>(initialBorrowBooks);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('checkout_borrow_books', JSON.stringify(borrowBooksState));
      }
    } catch (e) {
      void e;
    }
  }, [borrowBooksState]);
  const useBorrowState = borrowBooksState.length > 0;
  const displayItems: CartItem[] = useBorrowState ? borrowBooksState.map((b) => ({ id: -b.id, book: b, qty: 1 })) : items;
  const bookIds = useMemo(() => (useBorrowState ? borrowBooksState.map((b) => b.id) : items.map((it) => it.book.id)), [useBorrowState, borrowBooksState, items]);
  const removeBorrowBook = (bookId: number) => {
    setBorrowBooksState((prev) => prev.filter((b) => b.id !== bookId));
  };

  const [borrowDate, setBorrowDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState<number>(3);
  const [agreeReturn, setAgreeReturn] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  const returnDate = useMemo(() => {
    const d = new Date(borrowDate);
    d.setDate(d.getDate() + duration);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [borrowDate, duration]);

  const checkoutMutation = useMutation({
    mutationFn: apiCheckoutCart,
    onMutate: async (_bookIds: number[]) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      const next = (previousCart ?? []).filter((it) => !_bookIds.includes(it.book.id));
      queryClient.setQueryData<CartItem[]>(['cart'], next);
      try {
        if (typeof window !== 'undefined') {
          const u = localStorage.getItem('user');
          const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
          const key = `cart_items:${id ?? 'guest'}`;
          localStorage.setItem(key, JSON.stringify(next));
        }
      } catch (e) {
        void e;
      }
      _bookIds.forEach((bid) => dispatch(removeItem(String(bid))));
      return { previousCart };
    },
    onError: (_err, _bookIds, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartItem[]>(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onSuccess: () => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('checkout_borrow_books');
          try {
            const u = localStorage.getItem('user');
            const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
            const key = `loans:${id ?? 'guest'}`;
            const raw = localStorage.getItem(key);
            const prev = raw ? JSON.parse(raw) as unknown[] : [];
            const base = new Date(borrowDate);
            const due = new Date(borrowDate);
            due.setDate(due.getDate() + duration);
            const add = displayItems.map((it, idx) => ({ id: -(Date.now() + idx), book: it.book, borrowed_at: base.toISOString(), due_at: due.toISOString(), status: 'Active' }));
            const next = [...prev, ...add];
            localStorage.setItem(key, JSON.stringify(next));
          } catch (e) {
            void e;
          }
        }
      } catch (e) {
        void e;
      }
      navigate('/success', { state: { borrowDate, duration } });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: number; bookId: number }) => apiDeleteCartItem(itemId),
    onMutate: async ({ itemId, bookId }: { itemId: number; bookId: number }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], (old) => {
        const next = (old ?? []).filter((it) => it.id !== itemId);
        try {
          if (typeof window !== 'undefined') {
            const u = localStorage.getItem('user');
            const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
            const key = `cart_items:${id ?? 'guest'}`;
            localStorage.setItem(key, JSON.stringify(next));
          }
        } catch (e) {
          void e;
        }
        return next;
      });
      dispatch(removeItem(String(bookId)));
      return { previousCart };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousCart) {
        queryClient.setQueryData<CartItem[]>(['cart'], ctx.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const canSubmit = agreeReturn && agreePolicy && bookIds.length > 0;

  return (
    <>
      <Header />
      <main className="pb-[96px] pt-4 px-4xl">
        <h1 className="text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          <section>
            <h2 className="text-md md:text-lg font-bold text-neutral-950 mb-sm">User Information</h2>
            <Card className="p-lg bg-white border-neutral-200">
              <div className="grid grid-cols-2 gap-y-sm text-sm">
                <div className="text-neutral-700">Name</div>
                <div className="text-neutral-950 font-bold">{meDisplay?.name || '-'}</div>
                <div className="text-neutral-700">Email</div>
                <div className="text-neutral-950 font-bold">{meDisplay?.email || '-'}</div>
                <div className="text-neutral-700">Nomor Handphone</div>
                <div className="text-neutral-950 font-bold">{meDisplay?.phone || '-'}</div>
              </div>
            </Card>

            <h2 className="mt-4 text-md md:text-lg font-bold text-neutral-950 mb-sm">Book List</h2>
            <Card className="p-lg bg-white border-neutral-200">
              <div className="space-y-md">
                {displayItems.map((it) => (
                  <div key={it.book.id} className="flex items-start gap-md">
                    <img src={it.book.cover_image} alt={it.book.title} className="w-20 h-28 rounded-md object-cover" />
                    <div className="flex-1">
                      <span className="inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700">{it.book.category.name}</span>
                      <div className="mt-xxs text-neutral-950 font-bold text-md">{it.book.title}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-neutral-700">{it.book.author.name}</div>
                        <Button
                          variant="outline"
                          className="rounded-full text-neutral-500 hover:text-red"
                          onClick={() => (useBorrowState ? removeBorrowBook(it.book.id) : removeMutation.mutate({ itemId: it.id, bookId: it.book.id }))}
                          disabled={!useBorrowState && removeMutation.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <aside>
            <Card className="p-lg bg-white border-neutral-200">
              <div className="text-sm md:text-md font-bold text-neutral-950 mb-sm">Complete Your Borrow Request</div>

              <div className="mb-sm">
                <div className="text-xs font-semibold text-neutral-950 mb-xxs">Borrow Date</div>
                <div className="flex items-center gap-sm">
                  <Input type="date" value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} className="flex-1" />
                </div>
              </div>

              <div className="mb-sm">
                <div className="text-xs font-semibold text-neutral-950 mb-xxs">Borrow Duration</div>
                <div className="space-y-xxs text-sm">
                  {[3,5,10].map((d) => (
                    <label key={d} className="flex items-center gap-sm">
                      <input type="radio" name="duration" checked={duration === d} onChange={() => setDuration(d)} />
                      <span>{d} Days</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-sm">
                <div className="text-xs font-semibold text-neutral-950 mb-xxs">Return Date</div>
                <div className="text-xs text-neutral-700">
                  Please return the book(s) no later than <span className="text-red-600 font-semibold">{returnDate}</span>
                </div>
              </div>

              <div className="space-y-xxs text-sm">
                <label className="flex items-center gap-sm">
                  <input type="checkbox" checked={agreeReturn} onChange={(e) => setAgreeReturn(e.target.checked)} />
                  <span>I agree to return the book(s) before the due date.</span>
                </label>
                <label className="flex items-center gap-sm">
                  <input type="checkbox" checked={agreePolicy} onChange={(e) => setAgreePolicy(e.target.checked)} />
                  <span>I accept the library borrowing policy.</span>
                </label>
              </div>

              <Button
                className="mt-md w-full rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300 hover:bg-primary-400"
                onClick={() => checkoutMutation.mutate(bookIds, {
                  onSettled: () => {
                    try {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('checkout_borrow_books');
                        try {
                          const u = localStorage.getItem('user');
                          const id = u ? (JSON.parse(u)?.id as string | undefined) : undefined;
                          const key = `loans:${id ?? 'guest'}`;
                          const raw = localStorage.getItem(key);
                          const prev = raw ? JSON.parse(raw) as unknown[] : [];
                          const base = new Date(borrowDate);
                          const due = new Date(borrowDate);
                          due.setDate(due.getDate() + duration);
                          const add = displayItems.map((it, idx) => ({ id: -(Date.now() + idx), book: it.book, borrowed_at: base.toISOString(), due_at: due.toISOString(), status: 'Active' }));
                          const next = [...prev, ...add];
                          localStorage.setItem(key, JSON.stringify(next));
                        } catch (e) {
                          void e;
                        }
                      }
                    } catch (e) {
                      void e;
                    }
                    navigate('/success', { state: { borrowDate, duration } });
                  },
                })}
                disabled={!canSubmit || checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? 'Processing…' : 'Confirm & Borrow'}
              </Button>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}