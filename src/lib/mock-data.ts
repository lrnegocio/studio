
import { VideoContent, SubscriptionPlan } from './types';

// Removendo os exemplos para o usuário começar do zero
export const INITIAL_CONTENT: VideoContent[] = [];

export const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: 'p1', name: 'Teste Grátis 2h', type: 'trial', durationValue: 2, durationUnit: 'hours', price: 0 },
  { id: 'p2', name: 'Plano Mensal', type: 'paid', durationValue: 30, durationUnit: 'days', price: 29.90 },
  { id: 'p3', name: 'Vitalício', type: 'lifetime', durationValue: 0, durationUnit: 'lifetime', price: 199.90 }
];
