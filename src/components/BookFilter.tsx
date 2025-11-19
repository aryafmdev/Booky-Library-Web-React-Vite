import { Input } from "./ui/input";
import { Icon } from '@iconify/react';

interface BookFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const statuses = ["All", "Available", "Borrowed", "Returned", "Damaged"];

export default function BookFilter({ 
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange 
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