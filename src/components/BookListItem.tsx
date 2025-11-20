import { type Book } from '../lib/api';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

interface BookListItemProps {
  book: Book;
  onDelete: (bookId: number) => void;
}

export default function BookListItem({ book, onDelete }: BookListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl bg-white">
      <div className="flex items-center gap-md">
        <img src={book.cover_image} alt={book.title} className="w-16 h-24 object-cover rounded-md" />
        <div>
          <span className="inline-block rounded-full border border-neutral-300 px-sm py-xxs text-xs font-semibold text-neutral-700">{book.category.name}</span>
          <h3 className="text-md font-bold mt-xxs text-neutral-950">{book.title}</h3>
          <p className="text-xs text-neutral-700">{book.author.name}</p>
          <div className="inline-flex items-center gap-xxs mt-xxs text-sm font-semibold text-neutral-900">
            <Icon icon="mdi:star" className="size-4 text-yellow-500" />
            <span>4.9</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-sm">
        <Link to={`/books/${book.id}`} className="px-md py-xxs text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-full">Preview</Link>
        <Link to={`/books/${book.id}/edit`} className="px-md py-xxs text-sm font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-full">Edit</Link>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this book?')) {
              onDelete(book.id);
            }
          }}
          className="px-md py-xxs text-sm font-semibold text-red-600 bg-white border border-neutral-200 rounded-full"
        >
          Delete
        </button>
      </div>
    </div>
  );
}