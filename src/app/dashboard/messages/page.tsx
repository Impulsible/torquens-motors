/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { redirect } from 'next/navigation';
import { Loader2, Inbox } from 'lucide-react';
import { EnquiryService } from '@/services/enquiry.service';
// ✅ Fix: Import the client component
import MessagesClient from './MessagesClient';

export const metadata = {
  title: 'Secure Messages | Torquens Private Client Vault',
  description: 'Confidential off-market sourcing negotiations and vehicle escrow correspondence.',
};

// ✅ Define types for serialized conversations
interface SerializedVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
}

interface SerializedConversation {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP';
  enquiryType: 'GENERAL_INQUIRY' | 'PURCHASE_OFFER' | 'PRIVATE_VIEWING' | 'BESPOKE_SOURCING' | 'TRADE_IN_VALUATION';
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';
  hasTradeIn: boolean;
  tradeInDetails: string;
  createdAt: string;
  isRead: boolean;
  vehicle: SerializedVehicle | null;
}

export default async function MessagesPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userEmail = session.user.email;
  const userId = session.user.id || '';
  const userRole = session.user.role || 'CUSTOMER';

  // ✅ Type the conversations array
  let conversations: any[] = [];
  try {
    if (userRole === 'DEALER') {
      conversations = await EnquiryService.getEnquiriesByDealer(userId);
    } else if (userEmail) {
      conversations = await EnquiryService.getEnquiriesByEmail(userEmail);
    }
  } catch (error) {
    console.error('Error loading conversations server-side:', error);
  }

  // ✅ Map backend model records cleanly with proper typing
  const serializedConversations: SerializedConversation[] = conversations.map((c: any) => ({
    id: String(c._id || c.id),
    name: c.name || 'Anonymous Client',
    email: c.email || '',
    phone: c.phone || '',
    message: c.message || '',
    preferredContact: c.preferredContact || 'EMAIL',
    enquiryType: c.enquiryType || 'GENERAL_INQUIRY',
    status: c.status || 'NEW',
    hasTradeIn: Boolean(c.hasTradeIn),
    tradeInDetails: c.tradeInDetails || '',
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    isRead: c.isRead !== undefined ? Boolean(c.isRead) : true,
    vehicle: c.vehicle ? {
      id: String(c.vehicle._id || c.vehicle.id),
      make: c.vehicle.make || 'Bespoke',
      model: c.vehicle.model || 'Allocation',
      year: c.vehicle.year || new Date().getFullYear(),
      price: Number(c.vehicle.price || 0),
      images: Array.isArray(c.vehicle.images) ? c.vehicle.images : [],
    } : null,
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-obsidian text-primary flex flex-col">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-gold animate-spin" />
          </div>
        }
      >
        {serializedConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center bg-graphite mb-6">
              <Inbox className="h-6 w-6 text-gold" />
            </div>
            <h2 className="font-serif text-2xl font-light mb-2">No Active Dossiers</h2>
            <p className="text-sm text-secondary leading-relaxed">
              You do not have any active negotiations or vehicle acquisition files in your private registry inbox yet.
            </p>
          </div>
        ) : (
          <MessagesClient 
            initialConversations={serializedConversations} 
            userRole={userRole as 'CUSTOMER' | 'DEALER' | 'ADMIN'}
            currentUserId={userId}
          />
        )}
      </Suspense>
    </div>
  );
}