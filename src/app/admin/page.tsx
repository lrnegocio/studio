
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Film, Users, CreditCard, Activity, TrendingUp } from 'lucide-react';
import { useContentStore } from '@/hooks/use-content';

export default function AdminPage() {
  const router = useRouter();
  const { content, plans, isLoaded } = useContentStore();

  useEffect(() => {
    const session = localStorage.getItem('leo_tv_session');
    if (session !== 'admin') router.push('/login');
  }, [router]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-12 px-4 md:px-8 space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold font-headline mb-8">Olá, Léo! 👋</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Film className="text-primary" />} label="Total de Conteúdo" value={content.length.toString()} trend="+3 esta semana" />
          <StatCard icon={<Users className="text-accent" />} label="Assinantes Ativos" value="1,284" trend="+12% que ontem" />
          <StatCard icon={<CreditCard className="text-green-500" />} label="Receita Mensal" value="R$ 12.450" trend="Em crescimento" />
          <StatCard icon={<Activity className="text-blue-500" />} label="Visualizações 24h" value="8.9k" trend="Estável" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-sm">Novo usuário assinou o plano <strong>Vitalício</strong></p>
                    </div>
                    <span className="text-xs text-muted-foreground">Há {i * 10} min</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-headline">Conteúdos Mais Vistos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground/30">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.genre}</p>
                    </div>
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${100 - (idx * 20)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-background border border-border">
            {icon}
          </div>
          <span className="text-xs text-green-500 font-medium">{trend}</span>
        </div>
        <div className="mt-4">
          <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
          <p className="text-3xl font-bold font-headline mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
