import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/auth/config';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileProvider } from '@/contexts/ProfileContext';

export const metadata: Metadata = {
  title: {
    template: '%s | TORQUENS Private Client',
    default: 'Private Client Vault | TORQUENS MOTORS',
  },
  description:
    'Manage your verified automotive portfolio, private vault allocations, active acquisitions, and bespoke concierge inquiries.',
  robots: {
    index: false,
    follow: false,
  },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  const role = (session.user as { role?: string }).role?.toUpperCase();

  if (role === 'DEALER') redirect('/dealer');
  if (role === 'ADMIN') redirect('/admin');

  return (
    <ProfileProvider>
      <div className="relative min-h-screen bg-obsidian text-primary selection:bg-gold/30 selection:text-gold flex flex-col antialiased">
        <a
          href="#dashboard-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-gold focus:text-obsidian focus:font-medium focus:text-xs focus:tracking-wide focus:rounded-md focus:shadow-dropdown focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          Skip to main content
        </a>

        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-15%] right-0 rounded-full bg-gold/[0.035] blur-[140px]" style={{ width: '550px', height: '550px' }} />
          <div className="absolute bottom-[-10%] left-[-5%] rounded-full bg-blue-950/5 blur-[160px]" style={{ width: '600px', height: '600px' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-graphite/15 via-transparent to-transparent" />
        </div>

        <DashboardHeader />

        <div className="relative z-10 flex-1 flex w-full max-w-[1920px] mx-auto">
          <DashboardSidebar />

          <main
            id="dashboard-main-content"
            tabIndex={-1}
            className="flex-1 min-w-0 flex flex-col focus:outline-none"
          >
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10 animate-fade-in">
              {children}
            </div>

            <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted font-mono">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span>TORQUENS VAULT PROTOCOL v4.2 • SECURE CONNECTION</span>
              </div>
              <span>
                CLIENT ID: {(session.user as { id?: string }).id ? String((session.user as { id?: string }).id).slice(0, 8).toUpperCase() : 'VERIFIED'}
              </span>
            </footer>
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}