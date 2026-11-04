import { useMemo, useState } from 'react';
import type { Product } from '@services';
import { HOME_PAGE_SIZE } from './common.keys';
import { useProductListQuery } from './common.queries';

export type SortOption = 'destacados' | 'asc' | 'desc' | 'nombre';

function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const haystack = `${product.productName} ${product.productTypeName}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'asc':
      return copy.sort((a, b) => minPrice(a) - minPrice(b));
    case 'desc':
      return copy.sort((a, b) => minPrice(b) - minPrice(a));
    case 'nombre':
      return copy.sort((a, b) => a.productName.localeCompare(b.productName, 'es'));
    default:
      return copy;
  }
}

function minPrice(product: Product): number {
  return product.variants.reduce((min, variant) => Math.min(min, variant.price), Infinity);
}

export function useHomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('destacados');

  const { data, isPending, isError, error, refetch } = useProductListQuery({ pageSize: HOME_PAGE_SIZE });

  const products = useMemo(() => data?.items ?? [], [data]);

  const categories = useMemo(() => {
    const byId = new Map<number, string>();
    for (const product of products) {
      byId.set(product.idProductType, product.productTypeName);
    }
    return [...byId.entries()].map(([idProductType, productTypeName]) => ({ idProductType, productTypeName }));
  }, [products]);

  const filtered = useMemo(() => {
    const byCategory =
      category === null ? products : products.filter((product) => product.idProductType === category);
    const bySearch = byCategory.filter((product) => matchesSearch(product, search));
    return sortProducts(bySearch, sort);
  }, [products, category, search, sort]);

  return {
    products: filtered,
    categories,
    category,
    setCategory,
    search,
    setSearch,
    sort,
    setSort,
    isLoading: isPending,
    isError,
    errorMessage: error?.message,
    onRetry: () => void refetch(),
  };
}
