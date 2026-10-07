import type { Category, Menu, Product } from '../lib/types';

// PLACEHOLDER catalogue, shown until the owner enters the real products in the admin page.

const PRODUCTS_PER_CATEGORY = [6, 6, 5, 4, 4, 4, 3, 3];
const PRICES = [990, 1490, 1990, 2490, 2990, 3490, 1290, 890]; // cents

// A few sample tags (by product number) so the Filters panel has something to filter.
const SAMPLE_TAGS: Record<number, string[]> = {
  1: ['Popular'],
  2: ['New'],
  5: ['Special'],
  7: ['Popular', 'Tag 1'],
  9: ['Tag 2'],
  12: ['New', 'Tag 1'],
  16: ['Tag 3'],
  20: ['Special'],
  25: ['Popular'],
};

const categories: Category[] = PRODUCTS_PER_CATEGORY.map((_, i) => ({ id: `c-${i + 1}`, name: `Category ${i + 1}` }));

let productNumber = 0;
const products: Product[] = PRODUCTS_PER_CATEGORY.flatMap((count, c) =>
  Array.from({ length: count }, () => {
    productNumber += 1;
    return {
      id: `p-${productNumber}`,
      categoryId: `c-${c + 1}`,
      name: `Product ${productNumber}`,
      description: 'Short product description',
      price: PRICES[productNumber % PRICES.length],
      image: '',
      tags: SAMPLE_TAGS[productNumber] ?? [],
    };
  }),
);

export const seedMenu: Menu = { categories, products };
