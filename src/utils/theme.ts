export type ThemeId = 'emerald' | 'obsidian' | 'violet' | 'amber' | 'nordic' | 'emerald_light';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  category: 'dark' | 'light';
  previewColor: string;
  accentColor: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'emerald_light',
    name: 'Mint Light',
    description: 'Fresh light financial aesthetic with vibrant mint & emerald accents',
    category: 'light',
    previewColor: '#F0FDF4',
    accentColor: '#059669',
  },
  {
    id: 'nordic',
    name: 'Nordic Light',
    description: 'Crisp, high-contrast light theme with slate & sky blue accents',
    category: 'light',
    previewColor: '#F8FAFC',
    accentColor: '#0284C7',
  },
  {
    id: 'emerald',
    name: 'Emerald Dark',
    description: 'Classic dark palette with crisp emerald financial accents',
    category: 'dark',
    previewColor: '#020617',
    accentColor: '#10B981',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Blue',
    description: 'Deep navy midnight layout with vibrant blue accents',
    category: 'dark',
    previewColor: '#090D16',
    accentColor: '#3B82F6',
  },
  {
    id: 'violet',
    name: 'Violet Night',
    description: 'Luxury purple atmosphere with rich amethyst highlights',
    category: 'dark',
    previewColor: '#0F0728',
    accentColor: '#8B5CF6',
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    description: 'Warm obsidian background with rich golden accents',
    category: 'dark',
    previewColor: '#140D07',
    accentColor: '#F59E0B',
  },
];

const STORAGE_KEY = 'daily_finance_theme_v1';

export const getStoredTheme = (): ThemeId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved as ThemeId;
    }
  } catch {
    /* ignore localStorage error */
  }
  return 'emerald_light';
};

export const applyTheme = (themeId: ThemeId): void => {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    /* ignore */
  }
  document.documentElement.setAttribute('data-theme', themeId);
  
  const theme = THEMES.find((t) => t.id === themeId);
  if (theme?.category === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
