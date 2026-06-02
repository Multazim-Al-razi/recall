import type { Category } from '@/types/subscription';

export interface Provider {
  name: string;
  icon: string;
  category: Category;
  typicalAmount: number;
  billingCycle: 'monthly' | 'yearly';
}

export const PROVIDERS: Provider[] = [
  { name: 'Netflix', icon: 'netflix', category: 'entertainment', typicalAmount: 15.99, billingCycle: 'monthly' },
  { name: 'Spotify', icon: 'spotify', category: 'music', typicalAmount: 9.99, billingCycle: 'monthly' },
  { name: 'Apple TV+', icon: 'appletv', category: 'entertainment', typicalAmount: 9.99, billingCycle: 'monthly' },
  { name: 'YouTube Premium', icon: 'youtubemusic', category: 'entertainment', typicalAmount: 13.99, billingCycle: 'monthly' },
  { name: 'Disney+', icon: 'disneyplus', category: 'entertainment', typicalAmount: 13.99, billingCycle: 'monthly' },
  { name: 'HBO Max', icon: 'hbo', category: 'entertainment', typicalAmount: 15.99, billingCycle: 'monthly' },
  { name: 'Amazon Prime Video', icon: 'amazonprime', category: 'entertainment', typicalAmount: 14.99, billingCycle: 'monthly' },
  { name: 'Hulu', icon: 'hulu', category: 'entertainment', typicalAmount: 9.99, billingCycle: 'monthly' },
  { name: 'Apple Music', icon: 'apple', category: 'music', typicalAmount: 10.99, billingCycle: 'monthly' },
  { name: 'Audible', icon: 'audible', category: 'entertainment', typicalAmount: 14.95, billingCycle: 'monthly' },
  { name: 'Notion', icon: 'notion', category: 'productivity', typicalAmount: 10, billingCycle: 'monthly' },
  { name: 'Figma', icon: 'figma', category: 'productivity', typicalAmount: 15, billingCycle: 'monthly' },
  { name: 'ChatGPT Plus', icon: 'openai', category: 'productivity', typicalAmount: 20, billingCycle: 'monthly' },
  { name: 'GitHub Copilot', icon: 'github', category: 'productivity', typicalAmount: 10, billingCycle: 'monthly' },
  { name: 'Slack', icon: 'slack', category: 'productivity', typicalAmount: 8.75, billingCycle: 'monthly' },
  { name: 'Google One', icon: 'googlecloud', category: 'cloud', typicalAmount: 2.99, billingCycle: 'monthly' },
  { name: 'iCloud+', icon: 'icloud', category: 'cloud', typicalAmount: 2.99, billingCycle: 'monthly' },
  { name: 'Dropbox', icon: 'dropbox', category: 'cloud', typicalAmount: 11.99, billingCycle: 'monthly' },
  { name: 'Peloton', icon: 'peloton', category: 'fitness', typicalAmount: 12.99, billingCycle: 'monthly' },
  { name: 'Headspace', icon: 'headspace', category: 'fitness', typicalAmount: 12.99, billingCycle: 'monthly' },
  { name: 'NYT Cooking', icon: 'newyorktimes', category: 'news', typicalAmount: 5, billingCycle: 'monthly' },
  { name: 'The New York Times', icon: 'newyorktimes', category: 'news', typicalAmount: 4.25, billingCycle: 'monthly' },
  { name: 'HelloFresh', icon: 'hellofresh', category: 'food', typicalAmount: 59.94, billingCycle: 'monthly' },
  { name: 'Medium', icon: 'medium', category: 'news', typicalAmount: 5, billingCycle: 'monthly' },
];

export function findProviders(query: string): Provider[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return PROVIDERS.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 8);
}