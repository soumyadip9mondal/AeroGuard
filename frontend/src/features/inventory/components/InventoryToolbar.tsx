import React from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { RefreshCw } from 'lucide-react';

const InventoryToolbar: React.FC = () => {
  const { reset, setCurrentPage, setSortOrder } = useInventoryStore();

  const handleRefresh = () => {
    setCurrentPage(1);
    setSortOrder(useInventoryStore.getState().sortOrder);
  };

  const handleReset = () => {
    reset();
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-3 sm:p-4 rounded-[16px] border border-border-subtle bg-surface shadow-sm mb-4">
      <div className="w-full xl:w-auto xl:flex-1">
        <SearchBar />
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
        <FilterPanel />
        <button onClick={handleReset} className="rounded-md border border-border-subtle px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors whitespace-nowrap bg-transparent">
          Reset Filters
        </button>
        <button onClick={handleRefresh} className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors whitespace-nowrap bg-transparent">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default InventoryToolbar;
