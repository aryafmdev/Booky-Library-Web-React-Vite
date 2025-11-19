import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { apiGetMeProfile, apiGetCart, apiCheckoutCart, type MeProfile, type CartItem } from '../lib/api';
import { clearCart } from '../features/cart/cartSlice.ts';

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: me } = useQuery<MeProfile>({ queryKey: ['me'], queryFn: apiGetMeProfile });
  const { data: items = [] } = useQuery<CartItem[]>({ queryKey: ['cart'], queryFn: apiGetCart });

  const bookIds = useMemo(() => items.map((it) => it.book.id), [items]);

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
      void _bookIds.length;
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], []);
      dispatch(clearCart());
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
      navigate('/success');
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
                <div className="text-neutral-950 font-bold">{me?.name}</div>
                <div className="text-neutral-700">Email</div>
                <div className="text-neutral-950 font-bold">{me?.email}</div>
                <div className="text-neutral-700">Nomor Handphone</div>
                <div className="text-neutral-950 font-bold">{me?.phone}</div>
              </div>
            </Card>

            <h2 className="mt-4 text-md md:text-lg font-bold text-neutral-950 mb-sm">Book List</h2>
            <Card className="p-lg bg-white border-neutral-200">
              <div className="space-y-md">
                {items.map((it) => (
                  <div key={it.book.id} className="flex items-start gap-md">
                    <img src={it.book.cover_image} alt={it.book.title} className="w-20 h-28 rounded-md object-cover" />
                    <div>
                      <span className="inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700">{it.book.category.name}</span>
                      <div className="mt-xxs text-neutral-950 font-bold text-md">{it.book.title}</div>
                      <div className="text-xs text-neutral-700">{it.book.author.name}</div>
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
                className="mt-md w-full rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300"
                onClick={() => checkoutMutation.mutate(bookIds)}
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