import { Icon } from '@iconify/react';

interface StickyActionBarProps {
  onAddToCart?: () => void;
  onBorrow?: () => void;
  addPending?: boolean;
  borrowPending?: boolean;
  disableAdd?: boolean;
  disableBorrow?: boolean;
}

export default function StickyActionBar({
  onAddToCart,
  onBorrow,
  addPending,
  borrowPending,
  disableAdd,
  disableBorrow,
}: StickyActionBarProps) {
  return (
    <div className='sticky bottom-0 left-0 z-40 w-full bg-white border-t border-neutral-200 px-4xl py-md md:hidden'>
      <div className='flex gap-md'>
        <button
          className='flex-1 rounded-full bg-white border border-neutral-300 text-neutral-950 font-bold py-sm disabled:bg-neutral-100 hover:bg-neutral-100'
          onClick={onAddToCart}
          disabled={!!addPending || !!disableAdd}
        >
          {addPending ? 'Adding…' : 'Add to Cart'}
        </button>
        <button
          className='flex-1 rounded-full bg-primary-300 border text-white font-bold py-sm hover:bg-primary-400'
          onClick={onBorrow}
          disabled={!!borrowPending || !!disableBorrow}
        >
          {borrowPending ? 'Borrowing...' : 'Borrow Book'}
        </button>
        <button className='size-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-700'>
          <Icon icon='mdi:share-variant' className='size-5' />
        </button>
      </div>
    </div>
  );
}
