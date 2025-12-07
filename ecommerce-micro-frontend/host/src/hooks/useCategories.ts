import { useEffect, useState } from 'react';
import { Category } from '../pages/HomePage/data/categories';

// Icon mapping based on category name
const getCategoryIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('laptop')) return '💻';
  if (lowerName.includes('phone') || lowerName.includes('smartphone')) return '📱';
  if (lowerName.includes('tablet')) return '📱';
  if (lowerName.includes('audio') || lowerName.includes('headphone')) return '🎧';
  if (lowerName.includes('keyboard') || lowerName.includes('mouse') || lowerName.includes('mice')) return '⌨️';
  if (lowerName.includes('gaming')) return '🎮';
  if (lowerName.includes('watch') || lowerName.includes('wearable')) return '⌚';
  if (lowerName.includes('camera')) return '📷';
  if (lowerName.includes('monitor') || lowerName.includes('display')) return '🖥️';
  return '📦'; // default icon
};

// Image mapping based on category name
const getCategoryImage = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('laptop'))
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('keyboard'))
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('mouse') || lowerName.includes('mice'))
    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('monitor') || lowerName.includes('display'))
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('gaming'))
    return 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
};

interface ProductType {
  id: string;
  name: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8010/Catalog/GetAllTypes');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const productTypes: ProductType[] = await response.json();

        // Transform API product types to Category format
        const transformedCategories: Category[] = productTypes.map((type) => ({
          id: type.id,
          name: type.name,
          nameVi: type.name, // TODO: Add Vietnamese translations
          icon: getCategoryIcon(type.name),
          path: `/store?typeId=${type.id}`,
          imageUrl: getCategoryImage(type.name),
        }));

        setCategories(transformedCategories);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err as Error);
        // Fallback to default category
        setCategories([
          {
            id: 'laptops',
            name: 'Laptops',
            nameVi: 'Laptop',
            icon: '💻',
            path: '/store?cat=laptops',
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
