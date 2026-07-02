// Category definitions shared across the storefront and admin.
// `key` matches product.category and the i18n `categories.<key>` label.
export const CATEGORIES = [
  {
    key: 'skincare',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
  },
  {
    key: 'makeup',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  },
  {
    key: 'haircare',
    image:
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&q=80',
  },
  {
    key: 'fragrance',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
  },
  {
    key: 'bodycare',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  },
  {
    key: 'tools',
    image:
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80',
  },
]

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key)
