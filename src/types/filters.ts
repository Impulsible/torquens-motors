export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  selected?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'single' | 'multi' | 'range' | 'toggle';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FilterState {
  make: string[];
  model: string[];
  bodyType: string[];
  fuelType: string[];
  transmission: string[];
  drivetrain: string[];
  location: string[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
  verified: boolean | null;
  status: string[];
  search: string;
  sort: string;
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}