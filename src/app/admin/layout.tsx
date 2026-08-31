import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/auth/config';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'Admin Dashboard | TORQUENS MOTORS',
  description: 'Manage users, vehicles, dealers, and marketplace operations.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/login');
  }

  // Only admins can access
  if (session.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen pt-16 bg-obsidian">
      <AdminHeader user={session.user} />
      <div className="flex">
        <AdminSidebar user={session.user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}