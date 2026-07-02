import { create } from 'zustand';

interface InventoryFilters {
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
}

interface ModalState {
  viewPart: boolean;
  reservePart: boolean;
  partHistory: boolean;
}

interface InventoryUIState {
  selectedPartId: string | null;
  selectedFilters: InventoryFilters;
  searchText: string;
  currentPage: number;
  pageSize: number;
  sortOrder: string;
  modalState: ModalState;
  setSelectedPartId: (id: string | null) => void;
  setFilters: (filters: InventoryFilters) => void;
  setSearchText: (text: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSortOrder: (order: string) => void;
  setModalState: (state: Partial<ModalState>) => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryUIState>((set) => ({
  selectedPartId: null,
  selectedFilters: {},
  searchText: '',
  currentPage: 1,
  pageSize: 20,
  sortOrder: 'name_asc',
  modalState: { viewPart: false, reservePart: false, partHistory: false },
  setSelectedPartId: (id) => set({ selectedPartId: id }),
  setFilters: (filters) => set((state) => ({ selectedFilters: { ...state.selectedFilters, ...filters } })),
  setSearchText: (text) => set({ searchText: text }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setModalState: (partial) => set((state) => ({ modalState: { ...state.modalState, ...partial } })),
  reset: () =>
    set({
      selectedPartId: null,
      selectedFilters: {},
      searchText: '',
      currentPage: 1,
      pageSize: 20,
      sortOrder: 'name_asc',
      modalState: { viewPart: false, reservePart: false, partHistory: false },
    }),
}));
