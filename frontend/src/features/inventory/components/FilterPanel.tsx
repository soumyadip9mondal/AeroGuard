import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { inventoryFetch } from '../lib/inventoryFetch';

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
  const [statusOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ]);

  useEffect(() => {
    fetchOptions('/api/v1/inventory/warehouses').then(setWarehouses).catch(() => {});
    fetchOptions('/api/v1/inventory/categories').then(setCategories).catch(() => {});
    fetchOptions('/api/v1/inventory/suppliers').then(setSuppliers).catch(() => {});
  }, []);

  const handleChange = (key: string, value: string) => {
    setFilters({ [key]: value === '' ? undefined : value });
    setCurrentPage(1);
  };

  const selectClass = "w-full sm:w-auto min-w-[120px] rounded-md border border-border-subtle bg-elevated px-3 py-1.5 text-[13px] text-text-primary outline-none focus:border-accent transition-colors appearance-none cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <select value={selectedFilters.warehouseId ?? ''} onChange={(e) => handleChange('warehouseId', e.target.value)} className={selectClass}>
          <option value="">Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="relative w-full sm:w-auto">
        <select value={selectedFilters.categoryId ?? ''} onChange={(e) => handleChange('categoryId', e.target.value)} className={selectClass}>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="relative w-full sm:w-auto">
        <select value={selectedFilters.supplierId ?? ''} onChange={(e) => handleChange('supplierId', e.target.value)} className={selectClass}>
          <option value="">Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="relative w-full sm:w-auto">
        <select value={selectedFilters.status ?? ''} onChange={(e) => handleChange('status', e.target.value)} className={selectClass}>
          <option value="">Status</option>
          {statusOptions.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
