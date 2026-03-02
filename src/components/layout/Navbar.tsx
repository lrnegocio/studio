
"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Tv, LayoutDashboard, Film, Users, LogOut, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('leo_tv_session');
    setIsAdmin(session === 'admin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('leo_tv_session');
    router.push('/login');
  };

  return (
    <nav className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 md:px-8 justify-between">
      <div className="flex items-center gap-8">
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 group">
          <Tv className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl font-headline hidden sm:inline">Léo Tv & Stream</span>
        </Link>
        
        {isAdmin && (
          <div className="hidden md:flex items-center gap-1">
            <Link href="/admin">
              <Button variant={pathname === '/admin' ? 'secondary' : 'ghost'} className="gap-2">
                <LayoutDashboard className="w-4 h-4" /> Painel
              </Button>
            </Link>
            <Link href="/admin/content">
              <Button variant={pathname === '/admin/content' ? 'secondary' : 'ghost'} className="gap-2">
                <Film className="w-4 h-4" /> Conteúdo
              </Button>
            </Link>
            <Link href="/admin/subscriptions">
              <Button variant={pathname === '/admin/subscriptions' ? 'secondary' : 'ghost'} className="gap-2">
                <Users className="w-4 h-4" /> Planos
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant={pathname === '/admin/settings' ? 'secondary' : 'ghost'} className="gap-2">
                <Settings className="w-4 h-4" /> Configurações
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-accent">
          <LogOut className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </nav>
  );
}
