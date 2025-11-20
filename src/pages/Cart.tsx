import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  apiGetCart,
  apiCheckoutCart,
  apiDeleteCartItem,
  type CartItem,
} from '../lib/api';
import { removeItem, clearCart, addItem } from '../features/cart/cartSlice.ts';

export default function Cart() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { data: items = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: apiGetCart,
  });

  const [selected, setSelected] = useState<number[]>([]);

  const allIds = useMemo(() => items.map((it) => it.book.id), [items]);
  const isAllSelected =
    selected.length > 0 && selected.length === allIds.length;

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const removeMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: number; bookId: number }) =>
      apiDeleteCartItem(itemId),
    onMutate: async ({
      itemId,
      bookId,
    }: {
      itemId: number;
      bookId: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], (old) =>
        (old ?? []).filter((it) => it.id !== itemId)
      );
      setSelected((prev) => prev.filter((x) => x !== bookId));
      dispatch(removeItem(String(bookId)));
      return { previousCart };
    },
    onError: (_err, vars: { itemId: number; bookId: number }, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartItem[]>(['cart'], context.previousCart);
        // rollback badge quantity
        dispatch(addItem(String(vars.bookId)));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: apiCheckoutCart,
    onMutate: async (_bookIds: number[]) => {
      void _bookIds.length;
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], []);
      setSelected([]);
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
      // keep invalidation; UI already cleared optimistically
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const totalItems = selected.length;

  return (
    <>
      <Header />
      <main className='pb-[96px] pt-4 px-4xl'>
        <h1 className='text-display-xs md:text-display-lg font-bold text-neutral-950 mb-4'>
          My Cart
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6'>
          <section>
            <label className='flex items-center gap-sm text-sm text-neutral-900 mb-md'>
              <input
                type='checkbox'
                checked={isAllSelected}
                onChange={toggleAll}
              />
              <span>Select All</span>
            </label>

            {isLoading ? (
              <div>Loading cart…</div>
            ) : items.length === 0 ? (
              <div className='text-sm text-neutral-700'>Cart is empty.</div>
            ) : (
              <ul className='space-y-md'>
                {items.map((it) => (
                  <li
                    key={it.book.id}
                    className='pb-md border-b border-neutral-200'
                  >
                    <div className='flex items-start gap-md'>
                      <input
                        type='checkbox'
                        checked={selected.includes(it.book.id)}
                        onChange={() => toggleSelect(it.book.id)}
                      />

                      <img
                        src={it.book.cover_image}
                        alt={it.book.title}
                        className='w-20 h-28 rounded-md object-cover'
                      />

                      <div className='flex-1'>
                        <span className='inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700'>
                          {it.book.category.name}
                        </span>
                        <div className='mt-xxs text-neutral-950 font-bold text-md'>
                          {it.book.title}
                        </div>
                        <div className='text-xs text-neutral-700'>
                          {it.book.author.name}
                        </div>
                      </div>

                      <Button
                        variant='outline'
                        className='rounded-full'
                        onClick={() =>
                          removeMutation.mutate({
                            itemId: it.id,
                            bookId: it.book.id,
                          })
                        }
                        disabled={removeMutation.isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className='hidden md:block'>
            <Card className='p-md border-neutral-200 bg-white'>
              <div className='text-sm font-bold text-neutral-950'>
                Loan Summary
              </div>
              <div className='mt-sm flex justify-between text-sm text-neutral-900'>
                <span>Total Book</span>
                <span>{totalItems} Items</span>
              </div>
              <Button
                className='mt-md w-full rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300'
                onClick={() => checkoutMutation.mutate(selected)}
                disabled={checkoutMutation.isPending || selected.length === 0}
              >
                {checkoutMutation.isPending ? 'Borrowing…' : 'Borrow Book'}
              </Button>
            </Card>
          </aside>
        </div>

        <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-md flex items-center justify-between'>
          <div className='text-sm'>
            <div className='text-neutral-700'>Total Book</div>
            <div className='text-neutral-950 font-bold'>{totalItems} Items</div>
          </div>
          <Button
            className='rounded-full bg-primary-300 text-white font-bold disabled:bg-neutral-300'
            onClick={() => checkoutMutation.mutate(selected)}
            disabled={checkoutMutation.isPending || selected.length === 0}
          >
            {checkoutMutation.isPending ? 'Borrowing…' : 'Borrow Book'}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
