
export type ContentType = 'movie' | 'series' | 'channel';

export interface Episode {
  id: string;
  title: string;
  number: number;
  url: string;
  duration?: string;
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface VideoContent {
  id: string;
  title: string;
  type: ContentType;
  category: string; // Renamed from genre
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  sourceUrl?: string; // For movies/channels
  seasons?: Season[]; // For series
  isFeatured?: boolean;
}

export type SubscriptionType = 'trial' | 'paid' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionType;
  durationValue: number; 
  durationUnit: 'hours' | 'days' | 'lifetime';
  price: number;
}

export interface AccessKey {
  id: string;
  key: string;
  planId: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  usedAt?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  subscriptionId?: string;
  subscriptionExpiresAt?: string;
}
