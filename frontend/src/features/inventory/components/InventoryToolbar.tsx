import React from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const InventoryToolbar: React.FC = () => {
  const { reset, setCurrentPage, setSortOrder } = useInventoryStore();

  const handleRefresh = () => {
    setCurrentPage(1);
    // Trigger refetch by toggling sortOrder to same value (causes query key change)
    setSortOrder(useInventoryStore.getState().sortOrder);
  };

  const handleReset = () => {
    reset();
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 bg-blue-500/10 backdrop-blur-md rounded-md dark:bg-blue-900/30">
      <SearchBar />
      <div className="flex items-center gap-2">
        <FilterPanel />
        <Button variant="outline" onClick={handleReset}>Reset Filters</Button>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default InventoryToolbar;
