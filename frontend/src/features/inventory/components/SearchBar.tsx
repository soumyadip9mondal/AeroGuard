import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  const { setSearchText, searchText, setCurrentPage } = useInventoryStore();
  const [local, setLocal] = useState(searchText || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(local);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [local, setSearchText, setCurrentPage]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
      <input
        placeholder="Search parts..."
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="w-full rounded-md border border-border-subtle bg-elevated pl-8 pr-3 py-1.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
      />
    </div>
  );
};

export default SearchBar;
