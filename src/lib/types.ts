
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
  category: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  sourceUrl?: string;
  seasons?: Season[];
  isFeatured?: boolean;
  isLocked?: boolean;
}

export interface AppSettings {
  parentalPassword?: string;
}

export type SubscriptionType = 'trial' | 'paid' | 'personalized' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionType;
  durationValue: number; 
  durationUnit: 'hours' | 'days' | 'lifetime';
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  planId: string;
  createdAt: string;
  status: 'active' | 'expired' | 'blocked';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}
