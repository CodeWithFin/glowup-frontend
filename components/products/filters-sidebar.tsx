'use client';

import { ProductFilters, SKIN_TYPES, SKIN_CONCERNS, POPULAR_BRANDS } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FiltersSidebarProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onReset: () => void;
  className?: string;
}

export function FiltersSidebar({
  filters,
  onChange,
  onReset,
  className,
}: FiltersSidebarProps) {
  const handleSkinTypeToggle = (skinType: string) => {
    const current = filters.skinTypes || [];
    const updated = current.includes(skinType)
      ? current.filter((st) => st !== skinType)
      : [...current, skinType];
    onChange({ ...filters, skinTypes: updated });
  };

  const handleConcernToggle = (concern: string) => {
    const current = filters.concerns || [];
    const updated = current.includes(concern)
      ? current.filter((c) => c !== concern)
      : [...current, concern];
    onChange({ ...filters, concerns: updated });
  };

  const handleBrandToggle = (brand: string) => {
    const current = filters.brands || [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onChange({ ...filters, brands: updated });
  };

  const handlePriceChange = (values: number[]) => {
    onChange({
      ...filters,
      priceMin: values[0],
      priceMax: values[1],
    });
  };

  const handleInStockToggle = () => {
    onChange({ ...filters, inStock: !filters.inStock });
  };

  const priceMin = filters.priceMin ?? 0;
  const priceMax = filters.priceMax ?? 10000;

  const hasActiveFilters =
    (filters.skinTypes && filters.skinTypes.length > 0) ||
    (filters.concerns && filters.concerns.length > 0) ||
    (filters.brands && filters.brands.length > 0) ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.inStock;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <h3 className="font-medium">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock || false}
            onCheckedChange={handleInStockToggle}
          />
          <Label htmlFor="in-stock" className="cursor-pointer font-normal">
            In Stock Only
          </Label>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-medium">Price Range</h3>
        <div className="space-y-4 px-2 pt-2">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={[priceMin, priceMax]}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>KES {priceMin.toLocaleString()}</span>
            <span>KES {priceMax.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Skin Type */}
      <div className="space-y-3">
        <h3 className="font-medium">Skin Type</h3>
        <div className="space-y-2">
          {SKIN_TYPES.map((skinType) => (
            <div key={skinType} className="flex items-center space-x-2">
              <Checkbox
                id={`skin-${skinType}`}
                checked={filters.skinTypes?.includes(skinType) || false}
                onCheckedChange={() => handleSkinTypeToggle(skinType)}
              />
              <Label
                htmlFor={`skin-${skinType}`}
                className="cursor-pointer font-normal"
              >
                {skinType}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Skin Concerns */}
      <div className="space-y-3">
        <h3 className="font-medium">Skin Concerns</h3>
        <div className="space-y-2">
          {SKIN_CONCERNS.map((concern) => (
            <div key={concern} className="flex items-center space-x-2">
              <Checkbox
                id={`concern-${concern}`}
                checked={filters.concerns?.includes(concern) || false}
                onCheckedChange={() => handleConcernToggle(concern)}
              />
              <Label
                htmlFor={`concern-${concern}`}
                className="cursor-pointer font-normal"
              >
                {concern}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="font-medium">Brands</h3>
        <div className="space-y-2">
          {POPULAR_BRANDS.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands?.includes(brand) || false}
                onCheckedChange={() => handleBrandToggle(brand)}
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="cursor-pointer font-normal"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
