import { type Book } from '../lib/api';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

interface BookListItemProps {
  book: Book;
  onDelete: (bookId: number) => void;
}

export default function BookListItem({ book, onDelete }: BookListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-4">
        <img src={book.cover_image} alt={book.title} className="w-16 h-24 object-cover rounded-md" />
        <div>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{book.category.name}</span>
          <h3 className="text-md font-bold mt-1">{book.title}</h3>
          <p className="text-sm text-gray-500">{book.author.name}</p>
          <div className="flex items-center mt-1">
            <Icon icon="lucide:star" className="text-yellow-500" />
            <span className="ml-1 text-sm font-semibold">4.9</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
                <Link to={`/books/${book.id}`} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Preview</Link>
                <Link to={`/books/${book.id}/edit`} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Edit</Link>
                <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this book?')) {
              onDelete(book.id);
            }
          }}
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-gray-300 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}