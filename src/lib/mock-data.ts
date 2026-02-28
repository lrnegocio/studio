
import { VideoContent, SubscriptionPlan } from './types';

export const INITIAL_CONTENT: VideoContent[] = [
  {
    id: '1',
    title: 'Ação Explosiva',
    type: 'movie',
    genre: 'Ação',
    description: 'Um filme de tirar o fôlego com cenas de ação intensas.',
    posterUrl: 'https://picsum.photos/seed/leo2/400/600',
    bannerUrl: 'https://picsum.photos/seed/leo1/1200/600',
    sourceUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Mistérios da Noite',
    type: 'series',
    genre: 'Mistério',
    description: 'Uma série envolvente onde cada episódio revela um novo segredo.',
    posterUrl: 'https://picsum.photos/seed/leo5/400/600',
    bannerUrl: 'https://picsum.photos/seed/leo5/1200/600',
    seasons: [
      {
        number: 1,
        episodes: [
          { id: 'e1', title: 'O Começo', number: 1, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
          { id: 'e2', title: 'A Pista', number: 2, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Globo AO VIVO',
    type: 'channel',
    genre: 'Notícias',
    description: 'Acompanhe a programação da maior emissora do país.',
    posterUrl: 'https://picsum.photos/seed/leo4/400/600',
    sourceUrl: 'https://globoplay.globo.com/tv-globo/ao-vivo/6120663/'
  }
];

export const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: 'p1', name: 'Teste Grátis 2h', type: 'trial', durationValue: 2, durationUnit: 'hours', price: 0 },
  { id: 'p2', name: 'Plano Mensal', type: 'paid', durationValue: 30, durationUnit: 'days', price: 29.90 },
  { id: 'p3', name: 'Vitalício', type: 'lifetime', durationValue: 0, durationUnit: 'lifetime', price: 199.90 }
];
