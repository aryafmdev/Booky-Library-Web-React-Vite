import { Input } from "./ui/input";
import { Icon } from '@iconify/react';

interface BookFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategories: string[];
  onToggleCategory: (name: string) => void;
}

const statuses = ["All", "Available", "Borrowed", "Returned", "Damaged"];
const fixedCategories = [
  "Fiction",
  "Non-Fiction",
  "Self-Growth",
  "Finance",
  "Science",
  "Education",
];

export default function BookFilter({ 
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategories,
  onToggleCategory,
}: BookFilterProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Search book" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {fixedCategories.map((cat) => {
          const active = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${active ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-300'}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <button 
            key={status} 
            onClick={() => onStatusChange(status)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedStatus === status ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 border border-gray-300'}`}>
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}