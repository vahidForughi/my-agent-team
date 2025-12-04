export interface Category {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  path: string;
  imageUrl?: string;
}

export const categories: Category[] = [
  {
    id: 'laptops',
    name: 'Laptops',
    nameVi: 'Laptop',
    icon: '💻',
    path: '/store?cat=laptops',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'phones',
    name: 'Smartphones',
    nameVi: 'Điện thoại',
    icon: '📱',
    path: '/store?cat=phones',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tablets',
    name: 'Tablets',
    nameVi: 'Máy tính bảng',
    icon: '📱',
    path: '/store?cat=tablets',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'audio',
    name: 'Audio',
    nameVi: 'Âm thanh',
    icon: '🎧',
    path: '/store?cat=audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameVi: 'Phụ kiện',
    icon: '⌨️',
    path: '/store?cat=accessories',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    nameVi: 'Gaming',
    icon: '🎮',
    path: '/store?cat=gaming',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'wearables',
    name: 'Wearables',
    nameVi: 'Đồng hồ thông minh',
    icon: '⌚',
    path: '/store?cat=wearables',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cameras',
    name: 'Cameras',
    nameVi: 'Máy ảnh',
    icon: '📷',
    path: '/store?cat=cameras',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];




