import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input'; // shadcn/ui Input component
import { useInventoryStore } from '../store/inventoryStore';

const SearchBar: React.FC = () => {
  const { setSearchText, searchText, setCurrentPage } = useInventoryStore();
  const [local, setLocal] = useState(searchText);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(local);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [local, setSearchText, setCurrentPage]);

  return (
    <Input
      placeholder="Search parts..."
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      className="w-full max-w-sm"
    />
  );
};

export default SearchBar;
