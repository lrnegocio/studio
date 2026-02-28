
import { VideoContent, SubscriptionPlan } from './types';

export const INITIAL_CONTENT: VideoContent[] = [];

export const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: 'p1', name: 'Teste Grátis 2h', type: 'trial', durationValue: 2, durationUnit: 'hours' },
  { id: 'p2', name: 'Plano Mensal', type: 'paid', durationValue: 30, durationUnit: 'days' },
  { id: 'p3', name: 'Personalizado', type: 'personalized', durationValue: 0, durationUnit: 'lifetime' },
  { id: 'p4', name: 'Vitalício', type: 'lifetime', durationValue: 0, durationUnit: 'lifetime' }
];
