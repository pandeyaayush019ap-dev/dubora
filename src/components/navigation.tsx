'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  FolderKanban,
  Download,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
  Key,
  CreditCard,
  User,
  Sliders,
  AudioWaveform,
} from 'lucide-react';

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-heather-700/60 bg-heather-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-heather-500 to-duskyPink text-feather shadow-md shadow-heather-950/50 group-hover:scale-105 transition-transform">
            <AudioWaveform className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-feather text-lg">DUBORA</span>
            <span className="text-[10px] tracking-widest uppercase text-quartz/70 -mt-1 font-mono">STUDIO</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-quartz">
          <Link href="/features" className={`hover:text-feather transition-colors ${pathname === '/features' ? 'text-feather font-semibold' : ''}`}>
            Features
          </Link>
          <Link href="/pricing" className={`hover:text-feather transition-colors ${pathname === '/pricing' ? 'text-feather font-semibold' : ''}`}>
            Pricing
          </Link>
          <Link href="/security" className={`hover:text-feather transition-colors ${pathname === '/security' ? 'text-feather font-semibold' : ''}`}>
            Security
          </Link>
          <Link href="/app" className="hover:text-feather transition-colors">
            Workspace
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium text-quartz hover:text-feather px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/app/projects/new"
            className="flex items-center gap-2 rounded-lg bg-duskyPink px-4 py-2 text-sm font-semibold text-heather-950 hover:bg-duskyPink-light shadow-lg shadow-duskyPink/20 hover:shadow-duskyPink/30 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Start Dubbing</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Projects', href: '/app', icon: FolderKanban },
    { name: 'Exports', href: '/app/exports', icon: Download },
    { name: 'Usage & Quotas', href: '/app/usage', icon: BarChart3 },
    { name: 'API & Providers', href: '/app/settings/api', icon: Key },
    { name: 'Billing', href: '/app/settings/billing', icon: CreditCard },
  ];

  return (
    <aside className="w-64 border-r border-heather-700/60 bg-heather-900 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-heather-700/60">
          <Link href="/app" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-heather-500 to-duskyPink text-feather">
              <AudioWaveform className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-wider text-feather text-base">DUBORA</span>
              <span className="text-[9px] tracking-widest uppercase text-quartz/60 -mt-1 font-mono">STUDIO SAAS</span>
            </div>
          </Link>
        </div>

        {/* Workspace pill */}
        <div className="p-4">
          <div className="flex items-center justify-between rounded-lg bg-heather-850 p-2.5 border border-heather-700/50">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded bg-fern/30 flex items-center justify-center text-fern-light font-bold text-xs">
                W
              </div>
              <div className="text-xs">
                <p className="font-semibold text-feather">Creator Workspace</p>
                <p className="text-[10px] text-eucalyptus">Pro Plan (Active)</p>
              </div>
            </div>
            <span className="inline-block h-2 w-2 rounded-full bg-fern-light" title="Active"></span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-heather-800 text-feather border border-heather-600/50 shadow-sm'
                    : 'text-quartz hover:bg-heather-850 hover:text-feather'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-duskyPink' : 'text-quartz/70'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Quick New Button */}
      <div className="p-4 border-t border-heather-700/60 space-y-3">
        <Link
          href="/app/projects/new"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-duskyPink py-2 px-3 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all shadow-md shadow-duskyPink/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>New Dub Project</span>
        </Link>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-heather-600 flex items-center justify-center text-feather text-xs font-bold">
              DC
            </div>
            <div className="text-xs">
              <p className="font-medium text-feather leading-tight">Dubora Creator</p>
              <p className="text-[10px] text-quartz/60">creator@dubora.ai</p>
            </div>
          </div>
          <Link href="/app/settings/profile" className="text-quartz hover:text-feather">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
