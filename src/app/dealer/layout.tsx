import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/auth/config';
import { DealerSidebar } from '@/components/dealer/DealerSidebar';
import { DealerHeader } from '@/components/dealer/DealerHeader';

export const metadata: Metadata = {
  title: 'Dealer Portal | TORQUENS MOTORS',
  description: 'Manage your inventory, enquiries, and dealer profile.',
};

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/login');
  }

  // Only dealers and admins can access
  if (!['DEALER', 'ADMIN'].includes(session.user?.role || '')) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen pt-16 bg-obsidian">
      <DealerHeader user={session.user} />
      <div className="flex">
        <DealerSidebar user={session.user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}