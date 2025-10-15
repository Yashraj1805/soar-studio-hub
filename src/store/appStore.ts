import { create } from 'zustand';

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description?: string;
}

interface Profile {
  avatar: string;
  bio: string;
  niche: string;
  links: string[];
}

interface AppState {
  products: Product[];
  profile: Profile;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProfile: (profile: Partial<Profile>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  products: [
    {
      id: '1',
      title: 'Content Strategy Guide',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      description: 'Complete guide to content strategy',
    },
    {
      id: '2',
      title: 'Viral Video Templates',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
      description: 'Ready-to-use video templates',
    },
  ],
  profile: {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
    bio: 'Content creator passionate about helping others grow their brand.',
    niche: 'Tech & Productivity',
    links: ['https://twitter.com', 'https://instagram.com'],
  },
  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        { ...product, id: Date.now().toString() },
      ],
    })),
  updateProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, ...profile },
    })),
}));
