import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { inventoryFetch } from '../lib/inventoryFetch';
import CustomSelect from './CustomSelect';

const fetchOptions = async (url: string) => {
  const res = await inventoryFetch(url);
  if (!res.ok) throw new Error('Failed to fetch options');
  return res.json();
};

const FilterPanel: React.FC = () => {
  const { selectedFilters, setFilters, setCurrentPage } = useInventoryStore();
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const statusOptions = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  useEffect(() => {
    fetchOptions('/api/v1/inventory/warehouses').then(setWarehouses).catch(() => {});
    fetchOptions('/api/v1/inventory/categories').then(setCategories).catch(() => {});
    fetchOptions('/api/v1/inventory/suppliers').then(setSuppliers).catch(() => {});
  }, []);

  const handleChange = (key: string, value: string) => {
    setFilters({ [key]: value === '' ? undefined : value });
    setCurrentPage(1);
  };

  return (
    <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:items-center sm:w-auto">
      <CustomSelect
        value={selectedFilters.warehouseId ?? ''}
        onChange={(v) => handleChange('warehouseId', v)}
        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
        placeholder="Warehouse"
      />
      <CustomSelect
        value={selectedFilters.categoryId ?? ''}
        onChange={(v) => handleChange('categoryId', v)}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Category"
      />
      <CustomSelect
        value={selectedFilters.supplierId ?? ''}
        onChange={(v) => handleChange('supplierId', v)}
        options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
        placeholder="Supplier"
      />
      <CustomSelect
        value={selectedFilters.status ?? ''}
        onChange={(v) => handleChange('status', v)}
        options={statusOptions}
        placeholder="Status"
        className="min-w-[160px]"
      />
    </div>
  );
};

export default FilterPanel;
