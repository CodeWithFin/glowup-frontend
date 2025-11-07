'use client';

import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { fetchProducts } from '@/lib/api/products';
import { ProductFilters } from '@/types/product';
import { ProductGridCard, ProductGridCardSkeleton } from '@/components/products/product-grid-card';
import { FiltersSidebar } from '@/components/products/filters-sidebar';
import { FiltersSheet } from '@/components/products/filters-sheet';
import { SearchBar } from '@/components/products/search-bar';
import { SortDropdown } from '@/components/products/sort-dropdown';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [filters, setFilters] = useState<ProductFilters>({});

  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['products', searchQuery, sortBy, filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts({
        query: searchQuery,
        sortBy: sortBy as any,
        filters,
        page: pageParam,
        pageSize: 12,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Auto-load more when scrolling into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleResetFilters = () => {
    setFilters({});
  };

  const allProducts = data?.pages.flatMap((page) => page.products) || [];
  const totalProducts = data?.pages[0]?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-4xl font-bold">Shop All Products</h1>
          <p className="mt-2 text-muted-foreground">
            Discover our curated collection of skincare essentials
          </p>
        </div>

        {/* Search & Controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by product, brand, or ingredient..."
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filters */}
            <div className="lg:hidden">
              <FiltersSheet
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            {/* Sort Dropdown */}
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6 text-sm text-muted-foreground">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FiltersSidebar
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main>
            {isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
                <p className="text-destructive">
                  Failed to load products. Please try again.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductGridCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && !isError && allProducts.length === 0 && (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No products found matching your criteria.
                </p>
                {(searchQuery ||
                  Object.values(filters).some(
                    (f) => f && (Array.isArray(f) ? f.length > 0 : true)
                  )) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      handleResetFilters();
                    }}
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {!isLoading && !isError && allProducts.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allProducts.map((product) => (
                    <ProductGridCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="mt-8 flex justify-center">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading more products...</span>
                    </div>
                  )}
                  {!hasNextPage && allProducts.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      You've reached the end
                    </p>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
