'use client';

import { SlidersHorizontal } from 'lucide-react';
import { ProductFilters } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FiltersSidebar } from './filters-sidebar';

interface FiltersSheetProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onReset: () => void;
}

export function FiltersSheet({ filters, onChange, onReset }: FiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FiltersSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
