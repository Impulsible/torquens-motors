/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
// ✅ Fix: date-fns is not installed, use native Date methods
import { 
  Search, MessageSquare, ShieldCheck, Mail, Phone, Car, Clock, Send, 
  ChevronRight, Filter, AlertCircle, FileText, CheckCheck, Loader2, RefreshCw
} from 'lucide-react';
import { updateEnquiryStatus, markEnquiryAsRead, deleteEnquiry } from '@/actions/enquiries';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// ✅ Helper: Format relative time without date-fns
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    images: string[];
  } | null;
}

interface MessagesClientProps {
  initialConversations: SerializedConversation[];
  userRole: 'CUSTOMER' | 'DEALER' | 'ADMIN';
  currentUserId: string;
}

// ✅ Define BadgeVariant type to match your Badge component
// Remove 'outline' as it's not a valid variant in your Badge component
type BadgeVariant = 'gold' | 'success' | 'warning' | 'info' | 'danger' | 'default' | 'verified' | 'featured' | 'reserved' | 'sold' | 'pending';

export default function MessagesClient({ initialConversations, userRole }: MessagesClientProps) {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<SerializedConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string>(initialConversations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const activeThread = conversations.find(c => c.id === activeId);

  // Filter threads
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehicle?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'TRADE_IN') return matchesSearch && c.hasTradeIn;
    return matchesSearch && c.status === filterType;
  });

  const handleSelectThread = async (id: string) => {
    setActiveId(id);
    
    // Auto-mark as read if the recipient is a dealer viewing a "NEW" message
    if (userRole === 'DEALER') {
      try {
        const result = await markEnquiryAsRead(id);
        if (result.success) {
          setConversations(prev => 
            prev.map(c => c.id === id ? { ...c, isRead: true } : c)
          );
        }
      } catch (err) {
        console.error('Failed to mark thread as read:', err);
      }
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeThread) return;
    setIsUpdatingStatus(true);
    try {
      const result = await updateEnquiryStatus(activeThread.id, newStatus);
      if (result.success) {
        setConversations(prev => 
          prev.map(c => c.id === activeThread.id ? { ...c, status: newStatus as any } : c)
        );
        showToast({
          type: 'success',
          title: 'Status Synchronized',
          message: `Dossier #${activeThread.id.slice(-6).toUpperCase()} status updated to ${newStatus}.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registry Sync Error',
        message: err.message || 'Could not update status on digital ledger.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeThread) return;

    setIsSending(true);
    // Simulate high-security system response dispatching
    setTimeout(() => {
      showToast({
        type: 'success',
        title: 'Encrypted Packet Dispatched',
        message: `Your correspondence has been encrypted and sent to ${activeThread.email}`,
      });
      setReplyMessage('');
      setIsSending(false);
    }, 1200);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // ✅ Helper to get badge variant based on status
  const getBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'NEW': return 'warning';
      case 'CONTACTED': return 'info';
      case 'NEGOTIATING': return 'gold';
      case 'CLOSED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden max-h-[calc(100vh-4rem)] bg-obsidian">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SIDEBAR: Dossier Threads List                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-96 border-r border-border/40 flex flex-col bg-obsidian shrink-0">
        
        {/* Search & Global Filter Panel */}
        <div className="p-4 border-b border-border/40 space-y-3 bg-graphite/30">
          <Input
            placeholder="Search dossier reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted" />}
            className="bg-charcoal/80 border-border/60"
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {['ALL', 'NEW', 'NEGOTIATING', 'TRADE_IN', 'CLOSED'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all shrink-0",
                  filterType === type
                    ? "bg-gold text-obsidian border-gold font-bold"
                    : "bg-charcoal/50 text-secondary border-border/60 hover:border-gold/50"
                )}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Threads Loop */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/20">
          {filteredConversations.map((c) => {
            const isActive = c.id === activeId;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectThread(c.id)}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-300 flex flex-col gap-2 relative",
                  isActive 
                    ? "bg-graphite/70 border-l-2 border-gold" 
                    : "hover:bg-charcoal/40 bg-transparent"
                )}
              >
                {!c.isRead && userRole === 'DEALER' && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gold animate-pulse" />
                )}

                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-gold uppercase">
                    Ref: #{c.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-muted font-sans shrink-0">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </div>

                <div className="font-serif text-sm font-light text-primary truncate">
                  {c.name}
                </div>

                {c.vehicle && (
                  <div className="text-xs text-secondary flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-muted" />
                    <span className="truncate font-sans font-medium">
                      {c.vehicle.year} {c.vehicle.make} {c.vehicle.model}
                    </span>
                  </div>
                )}

                <p className="text-xs text-muted font-sans line-clamp-1 italic">
                  &quot;{c.message}&quot;
                </p>

                <div className="flex gap-1.5 mt-1">
                  <Badge variant={getBadgeVariant(c.status)} size="xs">
                    {c.status}
                  </Badge>
                  {c.hasTradeIn && (
                    // ✅ Use 'default' variant instead of 'outline' with custom className
                    <Badge variant="default" size="xs" className="border-gold/30 text-gold bg-gold/5">
                      Trade-In Off
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. CHAT WORKSPACE / CENTRAL CONTENT VIEW                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-obsidian">
        {activeThread ? (
          <>
            {/* Header / Command Ribbon */}
            <div className="h-16 border-b border-border/40 px-6 flex items-center justify-between bg-graphite/45 backdrop-blur-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-md text-primary">{activeThread.name}</h2>
                  <span className="text-[10px] font-mono text-muted">({activeThread.email})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gold font-mono tracking-wider">
                  <ShieldCheck className="h-3 w-3 text-gold" />
                  <span>Verified Escrow Dossier #{activeThread.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              {/* Status Command Block */}
              {userRole === 'DEALER' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider hidden sm:inline">
                    State:
                  </span>
                  <select
                    value={activeThread.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-charcoal text-xs text-primary font-mono tracking-wide border border-border/80 rounded-md py-1 px-2.5 focus:border-gold outline-none"
                  >
                    <option value="NEW">New Allocation</option>
                    <option value="CONTACTED">Active Communication</option>
                    <option value="NEGOTIATING">Price Negotiation</option>
                    <option value="CLOSED">Closed Transaction</option>
                    <option value="CANCELLED">Voided Protocol</option>
                  </select>
                </div>
              )}
            </div>

            {/* Split Grid: Discussion timeline vs Metadata */}
            <div className="flex-1 grid lg:grid-cols-3 overflow-hidden">
              
              {/* Chronology List (Left 2 cols) */}
              <div className="lg:col-span-2 flex flex-col justify-between overflow-hidden border-r border-border/20">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Ledger Event: Initialization */}
                  <div className="flex items-center gap-3 justify-center py-2">
                    <div className="h-px bg-border/40 flex-1" />
                    <span className="text-[9px] font-mono text-muted tracking-[0.25em] uppercase">
                      Vault Record Created: {new Date(activeThread.createdAt).toLocaleDateString()}
                    </span>
                    <div className="h-px bg-border/40 flex-1" />
                  </div>

                  {/* Primary Client Enquiry Message */}
                  <div className="flex gap-4 items-start">
                    <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/30 shrink-0 flex items-center justify-center font-serif text-gold font-bold">
                      {activeThread.name[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="space-y-1 bg-graphite/50 p-4 border border-border/40 rounded-xl max-w-[85%]">
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-xs font-serif font-semibold text-primary">{activeThread.name}</span>
                        <span className="text-[9px] font-mono text-muted">
                          {new Date(activeThread.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed whitespace-pre-line font-sans">
                        {activeThread.message}
                      </p>
                    </div>
                  </div>

                  {/* Simulated Secure Response Logs */}
                  <div className="flex gap-4 items-start justify-end">
                    <div className="space-y-1 bg-gold/5 p-4 border border-gold/20 rounded-xl max-w-[85%] text-right">
                      <div className="flex justify-between items-baseline gap-4 flex-row-reverse">
                        <span className="text-xs font-serif font-semibold text-gold">Security Brokerage Protocol</span>
                        <span className="text-[9px] font-mono text-muted">Automated Log</span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed font-mono text-left">
                        Transmission verified dynamically. Session encrypted and registered into client records via 256-bit protocols. Response tracking enabled.
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gold border border-gold shrink-0 flex items-center justify-center text-obsidian font-serif font-bold">
                      T
                    </div>
                  </div>
                </div>

                {/* Correspondence Dispatch Form */}
                <form onSubmit={handleSendResponse} className="p-4 border-t border-border/40 bg-graphite/20">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={replyMessage}
                      disabled={isSending}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Compile response dispatch (encrypted mode)..."
                      className="w-full bg-charcoal text-xs text-primary border border-border/60 rounded-xl pl-4 pr-16 py-3.5 focus:border-gold outline-none placeholder:text-muted"
                    />
                    <div className="absolute right-2 flex items-center gap-1.5">
                      <button
                        type="submit"
                        disabled={isSending || !replyMessage.trim()}
                        className="p-2 bg-gold hover:bg-gold-hover text-obsidian rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Dossier Meta Cards (Right 1 col) */}
              <div className="hidden lg:flex flex-col overflow-y-auto p-6 bg-graphite/10 space-y-6">
                
                {/* Active Vehicle Card */}
                {activeThread.vehicle && (
                  <div className="border border-border/60 rounded-xl overflow-hidden bg-charcoal/50">
                    {activeThread.vehicle.images[0] && (
                      <div className="relative h-32 w-full bg-obsidian">
                        <img 
                          src={activeThread.vehicle.images[0]} 
                          alt="Asset Visual Dossier" 
                          className="object-cover h-full w-full opacity-80"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-charcoal via-transparent to-transparent" />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[9px] font-mono text-gold tracking-widest uppercase">Target Asset</span>
                        <h4 className="font-serif text-sm font-medium text-primary">
                          {activeThread.vehicle.year} {activeThread.vehicle.make} {activeThread.vehicle.model}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-border/20 flex justify-between items-baseline">
                        <span className="text-xs text-muted font-sans">Valuation:</span>
                        <span className="font-serif text-sm text-gold font-semibold">
                          {formatPrice(activeThread.vehicle.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Profile / Metadata Card */}
                <div className="border border-border/60 rounded-xl p-4 space-y-4 bg-charcoal/30">
                  <h4 className="font-serif text-xs uppercase tracking-widest text-gold border-b border-border/20 pb-2">
                    Client Parameters
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Liaison Name:</span>
                      <span className="text-primary font-medium">{activeThread.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Contact Route:</span>
                      <span className="text-primary font-mono">{activeThread.preferredContact}</span>
                    </div>
                    {activeThread.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted">Secured Line:</span>
                        <span className="text-primary font-mono">{activeThread.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trade-In Collateral Dossier */}
                {activeThread.hasTradeIn && (
                  <div className="border border-gold/30 rounded-xl p-4 bg-gold/5 space-y-2">
                    <div className="flex items-center gap-1.5 text-gold">
                      <Car className="h-4 w-4" />
                      <h4 className="font-serif text-xs uppercase tracking-wider font-semibold">Trade-In Collateral</h4>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed font-sans">
                      {activeThread.tradeInDetails}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-muted mb-4" />
            <h3 className="font-serif text-xl font-light">No File Selected</h3>
            <p className="text-xs text-muted leading-relaxed">
              Select a negotiation dossier from the registry sidebar to access correspondence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}