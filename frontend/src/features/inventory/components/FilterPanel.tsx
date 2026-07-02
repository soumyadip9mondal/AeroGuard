import React, { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useInventoryStore } from '../store/inventoryStore';

const fetchOptions = async (url: string) => {
  const res = await fetch(url);
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

  const handleChange = (key: string, value: string | null) => {
    setFilters({ [key]: value ?? undefined });
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={selectedFilters.warehouseId ?? undefined} onValueChange={(v) => handleChange('warehouseId', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>
        <SelectContent>
          {warehouses.map((w) => (
            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFilters.categoryId ?? undefined} onValueChange={(v) => handleChange('categoryId', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFilters.supplierId ?? undefined} onValueChange={(v) => handleChange('supplierId', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Supplier" />
        </SelectTrigger>
        <SelectContent>
          {suppliers.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFilters.status ?? undefined} onValueChange={(v) => handleChange('status', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((st) => (
            <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterPanel;
