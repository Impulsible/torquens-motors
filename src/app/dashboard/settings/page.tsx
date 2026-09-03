/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, Suspense, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Palette,
  Lock,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  ChevronRight,
  Save,
  Trash2,
  Download,
  Upload,
  Camera,
  Monitor,
  Building2,
  FileText,
  LogOut,
  Fingerprint,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ProfileData {
  givenName: string;
  surname: string;
  primaryEmail: string;
  secondaryEmail: string;
  mobile: string;
  directLine: string;
  clientType: string;
  entityName: string;
  taxResidency: string;
  avatarUrl: string | null;
}

interface NotificationPref {
  id: string;
  title: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface QuietHours {
  from: string;
  until: string;
  timezone: string;
}

interface EscrowPrefs {
  currency: string;
  fxHedging: string;
  statementFrequency: string;
}

interface RegionalPrefs {
  language: string;
  timezone: string;
  currency: string;
  units: string;
  theme: string;
  density: string;
}

interface PrivacyPrefs {
  marketContribution: boolean;
  directIntroductions: boolean;
  eventRoster: boolean;
}

// ─────────────────────────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────────────────────────
const ToastContext = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = React.useContext(ToastContext);

  const iconMap = {
    success: <CheckCircle2 className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
  };

  const colorMap = {
    success: 'border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-400',
    error: 'border-red-500/40 bg-red-500/[0.06] text-red-400',
    info: 'border-gold/40 bg-gold/[0.06] text-gold',
    warning: 'border-amber-500/40 bg-amber-500/[0.06] text-amber-400',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="animate-slide-in-right pointer-events-auto"
        >
          <div className="rounded-xl border bg-graphite/95 backdrop-blur-md shadow-dropdown p-4 border-border/70">
            <div className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${colorMap[toast.type]}`}
              >
                {iconMap[toast.type]}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="text-sm font-serif text-primary">{toast.title}</div>
                {toast.description && (
                  <div className="text-xs text-secondary font-sans leading-relaxed">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-primary transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

function useToast() {
  return React.useContext(ToastContext);
}

// ─────────────────────────────────────────────────────────────
// LOCALSTORAGE HOOK
// ─────────────────────────────────────────────────────────────
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (isHydrated) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isHydrated]
  );

  return [storedValue, setValue];
}

// ─────────────────────────────────────────────────────────────
// DATA CONFIGURATION
// ─────────────────────────────────────────────────────────────
const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Personal & contact particulars' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Authentication & access' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & correspondence' },
  { id: 'billing', label: 'Billing & Escrow', icon: CreditCard, description: 'Payment & escrow' },
  { id: 'preferences', label: 'Preferences', icon: Palette, description: 'Display & regional' },
  { id: 'privacy', label: 'Privacy & Data', icon: Lock, description: 'Data control' },
];

const DEFAULT_PROFILE: ProfileData = {
  givenName: 'Henrik',
  surname: 'von Bernstorff',
  primaryEmail: 'h.bernstorff@example.ch',
  secondaryEmail: '',
  mobile: '+41 79 000 00 00',
  directLine: '',
  clientType: 'individual',
  entityName: '',
  taxResidency: 'Switzerland',
  avatarUrl: null,
};

const DEFAULT_NOTIFICATIONS: NotificationPref[] = [
  {
    id: 'allocations',
    title: 'New Allocations',
    description: 'When a vehicle matching your registered interests enters the registry.',
    email: true,
    sms: true,
    push: false,
  },
  {
    id: 'bids',
    title: 'Bid & Offer Activity',
    description: 'Updates on active offers, counter-offers, and reserve movements.',
    email: true,
    sms: true,
    push: true,
  },
  {
    id: 'escrow',
    title: 'Escrow Milestones',
    description: 'Funds cleared, inspection sign-off, and settlement confirmations.',
    email: true,
    sms: true,
    push: true,
  },
  {
    id: 'concierge',
    title: 'Concierge Correspondence',
    description: 'Direct messages from your assigned senior director.',
    email: true,
    sms: false,
    push: true,
  },
  {
    id: 'market',
    title: 'Market Intelligence',
    description: 'Quarterly desk reports and marque-specific market notes.',
    email: true,
    sms: false,
    push: false,
  },
  {
    id: 'events',
    title: 'Private Events',
    description: 'Invitations to Concours previews, factory tours, and desk gatherings.',
    email: true,
    sms: false,
    push: false,
  },
];

const DEFAULT_QUIET_HOURS: QuietHours = {
  from: '22:00',
  until: '07:00',
  timezone: 'cet',
};

const DEFAULT_ESCROW: EscrowPrefs = {
  currency: 'chf',
  fxHedging: 'opt-in',
  statementFrequency: 'quarterly',
};

const DEFAULT_REGIONAL: RegionalPrefs = {
  language: 'en-gb',
  timezone: 'cet',
  currency: 'chf',
  units: 'metric',
  theme: 'obsidian',
  density: 'editorial',
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  marketContribution: true,
  directIntroductions: false,
  eventRoster: true,
};

const ACTIVE_SESSIONS = [
  {
    id: 'session-1',
    device: 'MacBook Pro · Safari 17',
    location: 'Geneva, Switzerland',
    ip: '85.218.**.**',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 15 Pro · Safari',
    location: 'Zurich, Switzerland',
    ip: '85.218.**.**',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 'session-3',
    device: 'iPad Pro · Safari',
    location: 'London, United Kingdom',
    ip: '92.14.**.**',
    lastActive: '3 days ago',
    current: false,
  },
];

const PAYMENT_METHODS = [
  {
    id: 'wire-1',
    label: 'UBS Geneva · Primary',
    detail: 'CH•• •••• •••• •••• 4821',
    currency: 'CHF · EUR · USD',
    verified: true,
    default: true,
  },
  {
    id: 'wire-2',
    label: 'HSBC Private · London',
    detail: 'GB•• HSBC •••• •••• 9102',
    currency: 'GBP · USD',
    verified: true,
    default: false,
  },
];

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────

// Simulate async save operation
async function saveToServer<T>(data: T, delayMs = 800): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 3% network failure for realism
      if (Math.random() < 0.03) {
        reject(new Error('Network error'));
      } else {
        resolve(data);
      }
    }, delayMs);
  });
}

// Convert file to base64 data URL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Validate image file
function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, or WebP images are accepted.' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image must be under 5MB.' };
  }
  return { valid: true };
}

// Derive initials from name
function getInitials(givenName: string, surname: string): string {
  return `${givenName?.[0] || ''}${surname?.[0] || ''}`.toUpperCase() || '—';
}

// Validate email
function isValidEmail(email: string): boolean {
  if (!email) return true; // empty is allowed for optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2 pb-6 border-b border-border/40">
      {eyebrow && (
        <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
          {eyebrow}
        </span>
      )}
      <h2 className="text-xl sm:text-2xl font-serif font-light text-primary tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-secondary font-sans leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-red-400 font-sans leading-relaxed flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted font-sans leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-obsidian/60 border rounded-lg px-4 py-2.5 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        error
          ? 'border-red-500/50 focus:border-red-500'
          : 'border-border/70 focus:border-gold/50'
      }`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
  disabled = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-2.5 text-sm font-sans text-primary focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2 focus:ring-offset-obsidian disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? 'bg-gold' : 'bg-border/70'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-obsidian transition-transform ${
          checked ? 'translate-x-4.75' : 'translate-x-0.75'
        }`}
      />
    </button>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  description,
  action,
  meta,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/30 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-obsidian border border-border/70 flex items-center justify-center text-gold shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-serif text-primary">{title}</span>
            {meta}
          </div>
          {description && (
            <p className="text-xs text-secondary font-sans leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AVATAR UPLOADER
// ─────────────────────────────────────────────────────────────
function AvatarUploader({
  avatarUrl,
  initials,
  onChange,
  onRemove,
}: {
  avatarUrl: string | null;
  initials: string;
  onChange: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      addToast({
        type: 'error',
        title: 'Upload rejected',
        description: validation.error,
      });
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      // Simulate async upload
      await new Promise((r) => setTimeout(r, 600));
      onChange(dataUrl);
      addToast({
        type: 'success',
        title: 'Image uploaded',
        description: 'Your profile monogram has been updated.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        description: 'Unable to process image. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border/30">
      <div
        className={`relative shrink-0 transition-transform ${dragActive ? 'scale-105' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div
          className={`h-24 w-24 rounded-full overflow-hidden bg-graphite border flex items-center justify-center transition-colors ${
            dragActive ? 'border-gold' : 'border-gold/30'
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-gold animate-spin" />
          ) : avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile monogram"
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-gold font-serif text-3xl">{initials}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-obsidian border border-gold/40 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
          aria-label="Change profile image"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="sr-only"
        />
      </div>

      <div className="space-y-2 flex-1">
        <div className="text-sm font-serif text-primary">Profile Monogram</div>
        <p className="text-xs text-secondary font-sans leading-relaxed max-w-md">
          Displayed within the client portal only. TORQUENS never uses client imagery in external
          correspondence. JPEG, PNG, or WebP · max 5MB. Drag & drop supported.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-[10px] uppercase tracking-widest"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1.5" />
                Upload Image
              </>
            )}
          </Button>
          {avatarUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isUploading}
              className="text-[10px] uppercase tracking-widest text-muted"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SAVE BAR (Sticky footer for unsaved changes)
// ─────────────────────────────────────────────────────────────
function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  hint,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  hint?: string;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t transition-all ${
        dirty ? 'border-gold/30' : 'border-border/30'
      }`}
    >
      <p className="text-[11px] font-sans transition-colors">
        {dirty ? (
          <span className="text-gold inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Unsaved changes
          </span>
        ) : (
          <span className="text-muted">{hint || 'All changes saved'}</span>
        )}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={onDiscard}
          disabled={!dirty || saving}
          className="text-xs uppercase tracking-widest disabled:opacity-40"
        >
          Discard
        </Button>
        <Button
          variant="gold"
          size="md"
          onClick={onSave}
          disabled={!dirty || saving}
          leftIcon={
            saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )
          }
          className="text-xs uppercase tracking-widest font-semibold disabled:opacity-40"
        >
          {saving ? 'Saving' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────
function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  requireTyping,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  requireTyping?: string;
}) {
  const [typedValue, setTypedValue] = useState('');

  useEffect(() => {
    if (!open) setTypedValue('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  const canConfirm = requireTyping ? typedValue === requireTyping : true;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="max-w-md w-full bg-graphite border border-border/70 rounded-2xl shadow-dropdown p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`h-10 w-10 rounded-lg border flex items-center justify-center shrink-0 ${
              destructive
                ? 'bg-red-500/6 border-red-500/40 text-red-400'
                : 'bg-gold/6 border-gold/40 text-gold'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 id="modal-title" className="text-lg font-serif text-primary">
              {title}
            </h3>
            <p className="text-xs text-secondary font-sans leading-relaxed">{description}</p>
          </div>
        </div>

        {requireTyping && (
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted block">
              Type{' '}
              <span className="text-gold font-semibold">&quot;{requireTyping}&quot;</span> to
              confirm
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-2.5 text-sm font-sans text-primary focus:outline-none focus:border-gold/50 transition-colors"
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-[10px] uppercase tracking-widest"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'secondary' : 'gold'}
            size="sm"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`text-[10px] uppercase tracking-widest font-semibold disabled:opacity-40 ${
              destructive ? 'border-red-500/40 text-red-400 hover:border-red-500/70' : ''
            }`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROFILE PANEL
// ─────────────────────────────────────────────────────────────
function ProfilePanel() {
  const { addToast } = useToast();
  const [savedProfile, setSavedProfile] = useLocalStorage<ProfileData>(
    'torquens:profile',
    DEFAULT_PROFILE
  );
  const [draft, setDraft] = useState<ProfileData>(savedProfile);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  // Sync draft when saved profile hydrates from localStorage
  useEffect(() => {
    setDraft(savedProfile);
  }, [savedProfile]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(savedProfile);

  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    if (!draft.primaryEmail) {
      newErrors.primaryEmail = 'Primary email is required';
    } else if (!isValidEmail(draft.primaryEmail)) {
      newErrors.primaryEmail = 'Invalid email format';
    }
    if (draft.secondaryEmail && !isValidEmail(draft.secondaryEmail)) {
      newErrors.secondaryEmail = 'Invalid email format';
    }
    if (!draft.mobile) {
      newErrors.mobile = 'Mobile number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      addToast({
        type: 'error',
        title: 'Validation failed',
        description: 'Please correct the highlighted fields.',
      });
      return;
    }
    setSaving(true);
    try {
      await saveToServer(draft);
      setSavedProfile(draft);
      addToast({
        type: 'success',
        title: 'Profile updated',
        description: 'Your changes have been synced across all desks.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: 'Unable to reach the desk. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setDraft(savedProfile);
    setErrors({});
    addToast({
      type: 'info',
      title: 'Changes discarded',
    });
  };

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Client Identity"
        title="Profile & Contact Particulars"
        description="Maintained on record with the TORQUENS Private Client Desk. Changes to legal name require re-verification."
      />

      <AvatarUploader
        avatarUrl={draft.avatarUrl}
        initials={getInitials(draft.givenName, draft.surname)}
        onChange={(url) => updateField('avatarUrl', url)}
        onRemove={() => updateField('avatarUrl', null)}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-primary">Legal Identity</h3>
          <Badge variant="gold" size="sm">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> KYC Verified
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Given Name">
            <TextInput value={draft.givenName} disabled />
          </FormField>
          <FormField label="Surname">
            <TextInput value={draft.surname} disabled />
          </FormField>
        </div>

        <p className="text-[11px] text-muted font-sans">
          Legal name is locked following KYC verification. To amend, submit a request via your
          senior director with supporting documentation.
        </p>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Contact Channels</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Primary Email"
            hint="Used for escrow & mandate correspondence."
            error={errors.primaryEmail}
          >
            <TextInput
              type="email"
              value={draft.primaryEmail}
              onChange={(v) => updateField('primaryEmail', v)}
              error={!!errors.primaryEmail}
            />
          </FormField>
          <FormField
            label="Secondary Email"
            hint="For dispatched market intelligence only."
            error={errors.secondaryEmail}
          >
            <TextInput
              type="email"
              value={draft.secondaryEmail}
              onChange={(v) => updateField('secondaryEmail', v)}
              placeholder="Optional"
              error={!!errors.secondaryEmail}
            />
          </FormField>
          <FormField label="Mobile · Encrypted Channel" error={errors.mobile}>
            <TextInput
              type="tel"
              value={draft.mobile}
              onChange={(v) => updateField('mobile', v)}
              error={!!errors.mobile}
            />
          </FormField>
          <FormField label="Direct Line">
            <TextInput
              type="tel"
              value={draft.directLine}
              onChange={(v) => updateField('directLine', v)}
              placeholder="Optional"
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Acting Capacity</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Client Type">
            <SelectInput
              value={draft.clientType}
              onChange={(v) => updateField('clientType', v)}
            >
              <option value="individual">Individual Collector</option>
              <option value="family-office">Family Office</option>
              <option value="trust">Trust / Estate</option>
              <option value="corporate">Corporate Vehicle</option>
              <option value="museum">Museum / Institution</option>
            </SelectInput>
          </FormField>
          <FormField label="Entity Name" hint="If acting on behalf of an entity.">
            <TextInput
              value={draft.entityName}
              onChange={(v) => updateField('entityName', v)}
              placeholder="Optional"
            />
          </FormField>
          <FormField label="Tax Residency Jurisdiction">
            <TextInput
              value={draft.taxResidency}
              onChange={(v) => updateField('taxResidency', v)}
            />
          </FormField>
          <FormField label="Assigned Senior Director">
            <TextInput value="Geneva Desk · Principal" disabled />
          </FormField>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
        hint="Changes are logged and reviewed by the desk before propagation."
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECURITY PANEL
// ─────────────────────────────────────────────────────────────
function SecurityPanel() {
  const { addToast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useLocalStorage('torquens:2fa', true);
  const [biometric, setBiometric] = useLocalStorage('torquens:biometric', true);
  const [loginAlerts, setLoginAlerts] = useLocalStorage('torquens:loginAlerts', true);
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);
  const [revokeConfirm, setRevokeConfirm] = useState<{ open: boolean; sessionId?: string; all?: boolean }>({
    open: false,
  });

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast({
        type: 'error',
        title: 'Missing fields',
        description: 'All password fields are required.',
      });
      return;
    }
    if (newPassword.length < 14) {
      addToast({
        type: 'error',
        title: 'Password too short',
        description: 'Minimum 14 characters required.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords do not match',
        description: 'Please re-enter your new password.',
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      await saveToServer({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        type: 'success',
        title: 'Password updated',
        description: 'Your password has been rotated successfully.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: 'Unable to update password. Please try again.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await saveToServer({ sessionId }, 400);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      addToast({
        type: 'success',
        title: 'Session revoked',
        description: 'The device has been signed out.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Revoke failed',
      });
    }
    setRevokeConfirm({ open: false });
  };

  const handleRevokeAll = async () => {
    try {
      await saveToServer({ all: true }, 600);
      setSessions((prev) => prev.filter((s) => s.current));
      addToast({
        type: 'success',
        title: 'All other sessions revoked',
        description: 'Only your current session remains active.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Revoke failed',
      });
    }
    setRevokeConfirm({ open: false });
  };

  const handleDownloadBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    const content = `TORQUENS MOTORS — Backup Recovery Codes\nGenerated: ${new Date().toISOString()}\n\nStore these codes in a secure location. Each code may only be used once.\n\n${codes.join('\n')}\n\nContact your senior director if you exhaust these codes.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `torquens-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Backup codes downloaded',
      description: 'Store the file in a secure location.',
    });
  };

  const handleToggle2FA = (value: boolean) => {
    setTwoFactor(value);
    addToast({
      type: value ? 'success' : 'warning',
      title: value ? '2FA enabled' : '2FA disabled',
      description: value
        ? 'Your account is now protected by two-factor authentication.'
        : 'Two-factor authentication has been disabled.',
    });
  };

  const handleToggleBiometric = (value: boolean) => {
    setBiometric(value);
    addToast({
      type: 'info',
      title: value ? 'Biometric enabled' : 'Biometric disabled',
    });
  };

  const handleToggleLoginAlerts = (value: boolean) => {
    setLoginAlerts(value);
    addToast({
      type: 'info',
      title: value ? 'Login alerts enabled' : 'Login alerts disabled',
    });
  };

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Access Control"
        title="Security & Authentication"
        description="Multi-factor authentication and session monitoring for your client portal."
      />

      <div className="p-5 rounded-xl bg-graphite/60 border border-gold/30 flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-obsidian border border-gold/40 flex items-center justify-center text-gold shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-serif text-primary">Security Posture: Strong</span>
            <Badge variant="gold" size="sm">
              Level {[twoFactor, biometric, loginAlerts].filter(Boolean).length} of 3
            </Badge>
          </div>
          <p className="text-xs text-secondary font-sans leading-relaxed">
            {[twoFactor, biometric, loginAlerts].filter(Boolean).length === 3
              ? 'All recommended safeguards are enabled. Your account is fully protected.'
              : 'Some recommended safeguards are disabled. Consider enabling all for maximum security.'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-serif text-primary">Password</h3>

        <div className="grid grid-cols-1 gap-4">
          <FormField label="Current Password">
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-obsidian/60 border border-border/70 rounded-lg px-4 py-2.5 pr-12 text-sm font-sans text-primary placeholder:text-muted/60 focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="New Password"
              hint={
                newPassword && newPassword.length < 14
                  ? `${14 - newPassword.length} more characters required`
                  : 'Minimum 14 characters, mixed case & symbols.'
              }
            >
              <TextInput
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••••••••"
              />
            </FormField>
            <FormField
              label="Confirm New Password"
              error={
                confirmPassword && newPassword !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
            >
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••••••••"
                error={!!(confirmPassword && newPassword !== confirmPassword)}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-muted font-sans">Last changed 47 days ago</p>
            <Button
              variant="gold"
              size="sm"
              onClick={handlePasswordUpdate}
              disabled={updatingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="text-[10px] uppercase tracking-widest disabled:opacity-40"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Updating
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Multi-Factor Authentication</h3>

        <SettingsRow
          icon={Smartphone}
          title="Authenticator Application"
          description="TOTP codes via Authy, 1Password, or Google Authenticator."
          meta={
            twoFactor ? (
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3" /> Active
                </span>
              </Badge>
            ) : undefined
          }
          action={<Toggle checked={twoFactor} onChange={handleToggle2FA} label="Toggle 2FA" />}
        />

        <SettingsRow
          icon={Fingerprint}
          title="Biometric Authentication"
          description="Touch ID / Face ID for supported devices."
          action={
            <Toggle checked={biometric} onChange={handleToggleBiometric} label="Toggle biometric" />
          }
        />

        <SettingsRow
          icon={Key}
          title="Hardware Security Key"
          description="YubiKey or equivalent FIDO2 device."
          meta={
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Recommended
            </span>
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Hardware key registration',
                  description: 'Insert your FIDO2 device and follow the browser prompt.',
                })
              }
              className="text-[10px] uppercase tracking-widest"
            >
              Register Key
            </Button>
          }
        />

        <SettingsRow
          icon={Mail}
          title="Backup Codes"
          description="Ten single-use recovery codes. Store in a secure location."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadBackupCodes}
              className="text-[10px] uppercase tracking-widest"
            >
              <Download className="h-3 w-3 mr-1.5" />
              Download
            </Button>
          }
        />
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Session Alerts</h3>

        <SettingsRow
          icon={Bell}
          title="Notify on New Sign-in"
          description="Email alert when your account is accessed from a new device or location."
          action={
            <Toggle
              checked={loginAlerts}
              onChange={handleToggleLoginAlerts}
              label="Toggle login alerts"
            />
          }
        />
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-primary">Active Sessions</h3>
          {sessions.filter((s) => !s.current).length > 0 && (
            <button
              onClick={() => setRevokeConfirm({ open: true, all: true })}
              className="text-[10px] font-mono uppercase tracking-widest text-gold hover:text-gold/80 transition-colors"
            >
              Revoke All Others
            </button>
          )}
        </div>

        <div className="rounded-xl border border-border/70 bg-graphite/50 overflow-hidden divide-y divide-border/40">
          {sessions.map((s) => (
            <div key={s.id} className="p-4 sm:p-5 flex items-start gap-4">
              <div className="h-9 w-9 rounded-lg bg-obsidian border border-border/70 flex items-center justify-center text-gold shrink-0">
                <Monitor className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-serif text-primary">{s.device}</span>
                  {s.current && <Badge variant="gold" size="sm">Current</Badge>}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-muted flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.location}
                  </span>
                  <span>·</span>
                  <span>{s.ip}</span>
                  <span>·</span>
                  <span className={s.current ? 'text-emerald-400' : ''}>{s.lastActive}</span>
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() => setRevokeConfirm({ open: true, sessionId: s.id })}
                  className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-red-400 transition-colors shrink-0"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={revokeConfirm.open}
        title={revokeConfirm.all ? 'Revoke all other sessions?' : 'Revoke this session?'}
        description={
          revokeConfirm.all
            ? 'All other devices will be signed out immediately. You will remain signed in on this device.'
            : 'This device will be signed out immediately and require re-authentication to access your account.'
        }
        confirmLabel="Revoke"
        destructive
        onConfirm={() =>
          revokeConfirm.all
            ? handleRevokeAll()
            : revokeConfirm.sessionId && handleRevokeSession(revokeConfirm.sessionId)
        }
        onCancel={() => setRevokeConfirm({ open: false })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS PANEL
// ─────────────────────────────────────────────────────────────
function NotificationsPanel() {
  const { addToast } = useToast();
  const [savedPrefs, setSavedPrefs] = useLocalStorage<NotificationPref[]>(
    'torquens:notifications',
    DEFAULT_NOTIFICATIONS
  );
  const [savedQuietHours, setSavedQuietHours] = useLocalStorage<QuietHours>(
    'torquens:quietHours',
    DEFAULT_QUIET_HOURS
  );
  const [prefs, setPrefs] = useState(savedPrefs);
  const [quietHours, setQuietHours] = useState(savedQuietHours);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(savedPrefs);
  }, [savedPrefs]);

  useEffect(() => {
    setQuietHours(savedQuietHours);
  }, [savedQuietHours]);

  const dirty =
    JSON.stringify(prefs) !== JSON.stringify(savedPrefs) ||
    JSON.stringify(quietHours) !== JSON.stringify(savedQuietHours);

  const updateChannel = (id: string, channel: 'email' | 'sms' | 'push', value: boolean) => {
    setPrefs((p) => p.map((c) => (c.id === id ? { ...c, [channel]: value } : c)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToServer({ prefs, quietHours });
      setSavedPrefs(prefs);
      setSavedQuietHours(quietHours);
      addToast({
        type: 'success',
        title: 'Notification preferences saved',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setPrefs(savedPrefs);
    setQuietHours(savedQuietHours);
    addToast({ type: 'info', title: 'Changes discarded' });
  };

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Correspondence"
        title="Notification Preferences"
        description="Control the correspondence channels TORQUENS uses to reach you. Escrow milestones cannot be fully silenced."
      />

      <div className="rounded-xl border border-border/70 bg-graphite/50 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/40 bg-obsidian/40">
          <div className="col-span-6 text-[10px] font-mono uppercase tracking-widest text-muted">
            Category
          </div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted text-center">
            Email
          </div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted text-center">
            SMS
          </div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted text-center">
            Push
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {prefs.map((c) => (
            <div key={c.id} className="px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center">
              <div className="md:col-span-6 space-y-1">
                <div className="text-sm font-serif text-primary">{c.title}</div>
                <p className="text-xs text-secondary font-sans leading-relaxed">{c.description}</p>
              </div>
              {(['email', 'sms', 'push'] as const).map((channel) => (
                <div
                  key={channel}
                  className="md:col-span-2 flex items-center justify-start md:justify-center gap-2"
                >
                  <span className="md:hidden text-[10px] font-mono uppercase tracking-widest text-muted w-12">
                    {channel === 'email' ? 'Email' : channel === 'sms' ? 'SMS' : 'Push'}
                  </span>
                  <Toggle
                    checked={c[channel]}
                    onChange={(v) => updateChannel(c.id, channel, v)}
                    label={`${c.title} ${channel}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Quiet Hours</h3>
        <p className="text-xs text-secondary font-sans leading-relaxed max-w-2xl">
          Non-urgent notifications are held during quiet hours. Escrow-critical alerts always
          deliver in real time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="From">
            <TextInput
              type="time"
              value={quietHours.from}
              onChange={(v) => setQuietHours({ ...quietHours, from: v })}
            />
          </FormField>
          <FormField label="Until">
            <TextInput
              type="time"
              value={quietHours.until}
              onChange={(v) => setQuietHours({ ...quietHours, until: v })}
            />
          </FormField>
          <FormField label="Time Zone">
            <SelectInput
              value={quietHours.timezone}
              onChange={(v) => setQuietHours({ ...quietHours, timezone: v })}
            >
              <option value="cet">Europe / Zurich (CET)</option>
              <option value="gmt">Europe / London (GMT)</option>
              <option value="gst">Asia / Dubai (GST)</option>
              <option value="est">America / New York (EST)</option>
            </SelectInput>
          </FormField>
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BILLING PANEL
// ─────────────────────────────────────────────────────────────
function BillingPanel() {
  const { addToast } = useToast();
  const [savedEscrow, setSavedEscrow] = useLocalStorage<EscrowPrefs>(
    'torquens:escrow',
    DEFAULT_ESCROW
  );
  const [escrow, setEscrow] = useState(savedEscrow);
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState(PAYMENT_METHODS);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  useEffect(() => {
    setEscrow(savedEscrow);
  }, [savedEscrow]);

  const dirty = JSON.stringify(escrow) !== JSON.stringify(savedEscrow);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToServer(escrow);
      setSavedEscrow(escrow);
      addToast({
        type: 'success',
        title: 'Escrow preferences saved',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, default: m.id === id })));
    addToast({
      type: 'success',
      title: 'Default wire updated',
    });
  };

  const handleRemove = (id: string) => {
    const method = methods.find((m) => m.id === id);
    if (method?.default) {
      addToast({
        type: 'error',
        title: 'Cannot remove default',
        description: 'Set another wire as default first.',
      });
      return;
    }
    setMethods((prev) => prev.filter((m) => m.id !== id));
    addToast({
      type: 'success',
      title: 'Wire account removed',
    });
    setDeleteConfirm({ open: false });
  };

  const handleDownloadDocument = (docLabel: string) => {
    // Simulate PDF download
    const content = `TORQUENS MOTORS\n${docLabel}\nGenerated: ${new Date().toISOString()}\n\nThis is a placeholder document.`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docLabel.toLowerCase().replace(/[^\w]+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Document downloaded',
      description: docLabel,
    });
  };

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Settlement"
        title="Billing & Escrow Accounts"
        description="Registered payment channels for escrow instructions, mandate fees, and settlement disbursements."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-primary">Registered Bank Wires</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              addToast({
                type: 'info',
                title: 'Wire registration',
                description: 'Please contact your senior director to register additional wires.',
              })
            }
            className="text-[10px] uppercase tracking-widest"
          >
            Add Wire Account
          </Button>
        </div>

        <div className="space-y-3">
          {methods.map((m) => (
            <Card
              key={m.id}
              className="p-5 bg-graphite/70 border-border/70 hover:border-gold/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="h-11 w-11 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-serif text-primary">{m.label}</span>
                      {m.default && <Badge variant="gold" size="sm">Default</Badge>}
                      {m.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-secondary">{m.detail}</div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-muted">
                      {m.currency}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!m.default && (
                    <button
                      onClick={() => handleSetDefault(m.id)}
                      className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-gold transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: m.id })}
                    className="p-2 rounded-lg hover:bg-obsidian/60 text-muted hover:text-red-400 transition-colors disabled:opacity-40"
                    disabled={m.default}
                    aria-label="Remove wire"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Escrow Preferences</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Default Settlement Currency">
            <SelectInput
              value={escrow.currency}
              onChange={(v) => setEscrow({ ...escrow, currency: v })}
            >
              <option value="chf">CHF · Swiss Franc</option>
              <option value="eur">EUR · Euro</option>
              <option value="usd">USD · US Dollar</option>
              <option value="gbp">GBP · British Pound</option>
            </SelectInput>
          </FormField>
          <FormField label="Escrow Agent" hint="Contact your director to change.">
            <TextInput value="Geneva Bonded Escrow SA" disabled />
          </FormField>
          <FormField label="FX Hedging">
            <SelectInput
              value={escrow.fxHedging}
              onChange={(v) => setEscrow({ ...escrow, fxHedging: v })}
            >
              <option value="opt-in">Opt-in per transaction</option>
              <option value="always">Always hedge</option>
              <option value="never">Never hedge</option>
            </SelectInput>
          </FormField>
          <FormField label="Statement Frequency">
            <SelectInput
              value={escrow.statementFrequency}
              onChange={(v) => setEscrow({ ...escrow, statementFrequency: v })}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </SelectInput>
          </FormField>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-primary">Billing Documents</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              addToast({ type: 'info', title: 'Full history', description: 'Loading archive...' })
            }
            className="text-[10px] uppercase tracking-widest"
          >
            <ExternalLink className="h-3 w-3 mr-1.5" />
            Full History
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-graphite/50 divide-y divide-border/40">
          {[
            { date: 'Q3 · 2024', label: 'Quarterly Statement', size: '2.4 MB' },
            { date: 'Aug · 2024', label: 'Mandate Fee · Ferrari 275 GTB/4', size: '186 KB' },
            { date: 'Jul · 2024', label: 'Escrow Settlement Receipt', size: '312 KB' },
          ].map((d, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-obsidian border border-border/70 flex items-center justify-center text-gold shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-serif text-primary truncate">{d.label}</div>
                  <div className="text-[11px] font-mono text-muted">
                    {d.date} · PDF · {d.size}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownloadDocument(d.label)}
                className="p-2 rounded-lg hover:bg-obsidian/60 text-muted hover:text-gold transition-colors"
                aria-label="Download document"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={() => setEscrow(savedEscrow)} />

      <ConfirmModal
        open={deleteConfirm.open}
        title="Remove wire account?"
        description="This wire account will be removed from your registered payment channels. You can re-register it at any time via your senior director."
        confirmLabel="Remove"
        destructive
        onConfirm={() => deleteConfirm.id && handleRemove(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PREFERENCES PANEL
// ─────────────────────────────────────────────────────────────
function PreferencesPanel() {
  const { addToast } = useToast();
  const [savedPrefs, setSavedPrefs] = useLocalStorage<RegionalPrefs>(
    'torquens:regional',
    DEFAULT_REGIONAL
  );
  const [prefs, setPrefs] = useState(savedPrefs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(savedPrefs);
  }, [savedPrefs]);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToServer(prefs);
      setSavedPrefs(prefs);
      addToast({
        type: 'success',
        title: 'Preferences saved',
        description: 'Interface preferences will apply on next reload.',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'obsidian', label: 'Obsidian', description: 'Default · dark' },
    { id: 'graphite', label: 'Graphite', description: 'Softer contrast' },
    { id: 'auto', label: 'System', description: 'Match device' },
  ];

  const densities = [
    { id: 'comfortable', label: 'Comfortable', hint: 'Increased spacing' },
    { id: 'compact', label: 'Compact', hint: 'Denser rows for data' },
    { id: 'editorial', label: 'Editorial', hint: 'Balanced · default' },
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Portal Configuration"
        title="Display & Regional Preferences"
        description="Tailor the client portal to your regional and visual preferences."
      />

      <div className="space-y-6">
        <h3 className="text-sm font-serif text-primary">Regional Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Interface Language">
            <SelectInput value={prefs.language} onChange={(v) => setPrefs({ ...prefs, language: v })}>
              <option value="en-gb">English (United Kingdom)</option>
              <option value="en-us">English (United States)</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="ar">العربية</option>
            </SelectInput>
          </FormField>

          <FormField label="Time Zone">
            <SelectInput value={prefs.timezone} onChange={(v) => setPrefs({ ...prefs, timezone: v })}>
              <option value="cet">Europe / Zurich (CET)</option>
              <option value="gmt">Europe / London (GMT)</option>
              <option value="gst">Asia / Dubai (GST)</option>
              <option value="est">America / New York (EST)</option>
            </SelectInput>
          </FormField>

          <FormField label="Display Currency">
            <SelectInput value={prefs.currency} onChange={(v) => setPrefs({ ...prefs, currency: v })}>
              <option value="chf">CHF · Swiss Franc</option>
              <option value="eur">EUR · Euro</option>
              <option value="usd">USD · US Dollar</option>
              <option value="gbp">GBP · British Pound</option>
            </SelectInput>
          </FormField>

          <FormField label="Unit System">
            <SelectInput value={prefs.units} onChange={(v) => setPrefs({ ...prefs, units: v })}>
              <option value="metric">Metric (km / kW / L)</option>
              <option value="imperial">Imperial (mi / hp / gal)</option>
            </SelectInput>
          </FormField>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Appearance</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => {
            const isActive = prefs.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPrefs({ ...prefs, theme: t.id })}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  isActive
                    ? 'border-gold/40 bg-gold/5'
                    : 'border-border/70 bg-graphite/50 hover:border-gold/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-obsidian border border-border/70 flex items-center justify-center text-gold">
                    <Palette className="h-4 w-4" />
                  </div>
                  {isActive && <CheckCircle2 className="h-4 w-4 text-gold" />}
                </div>
                <div className="mt-3 text-sm font-serif text-primary">{t.label}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1">
                  {t.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Interface Density</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {densities.map((d) => {
            const isActive = prefs.density === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setPrefs({ ...prefs, density: d.id })}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  isActive
                    ? 'border-gold/40 bg-gold/5'
                    : 'border-border/70 bg-graphite/50 hover:border-gold/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-serif text-primary">{d.label}</div>
                  {isActive && <CheckCircle2 className="h-4 w-4 text-gold" />}
                </div>
                <div className="text-[11px] font-mono text-muted mt-1">{d.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={() => setPrefs(savedPrefs)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRIVACY PANEL
// ─────────────────────────────────────────────────────────────
function PrivacyPanel() {
  const { addToast } = useToast();
  const [privacy, setPrivacy] = useLocalStorage<PrivacyPrefs>('torquens:privacy', DEFAULT_PRIVACY);
  const [exportRequesting, setExportRequesting] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);

  const handleToggle = (key: keyof PrivacyPrefs) => (value: boolean) => {
    setPrivacy({ ...privacy, [key]: value });
    addToast({
      type: 'success',
      title: 'Preference updated',
    });
  };

  const handleExportRequest = async () => {
    setExportRequesting(true);
    try {
      await saveToServer({ type: 'export' }, 1200);
      addToast({
        type: 'success',
        title: 'Export requested',
        description: 'Your archive will be delivered within 7 days to your primary email.',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Request failed' });
    } finally {
      setExportRequesting(false);
    }
  };

  const handleSignOutAll = async () => {
    try {
      await saveToServer({ type: 'signOutAll' });
      addToast({
        type: 'success',
        title: 'All sessions terminated',
        description: 'You will be redirected to sign in.',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Sign out failed' });
    }
    setSignOutConfirm(false);
  };

  const handleDeactivate = async () => {
    try {
      await saveToServer({ type: 'deactivate' }, 1000);
      addToast({
        type: 'warning',
        title: 'Deactivation request submitted',
        description: 'Your senior director will contact you within 24 hours.',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Request failed' });
    }
    setDeactivateConfirm(false);
  };

  const handleClose = async () => {
    try {
      await saveToServer({ type: 'close' }, 1000);
      addToast({
        type: 'warning',
        title: 'Closure request submitted',
        description: 'A director will confirm your request via encrypted correspondence.',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Request failed' });
    }
    setCloseConfirm(false);
  };

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Client Confidentiality"
        title="Privacy & Data Controls"
        description="Manage disclosure preferences, request data exports, and control account lifecycle."
      />

      <div className="space-y-4">
        <h3 className="text-sm font-serif text-primary">Disclosure Preferences</h3>

        <SettingsRow
          icon={Eye}
          title="Anonymized Market Contribution"
          description="Allow anonymized transaction data to inform desk market intelligence. Never identifies you individually."
          action={
            <Toggle
              checked={privacy.marketContribution}
              onChange={handleToggle('marketContribution')}
              label="Toggle market contribution"
            />
          }
        />
        <SettingsRow
          icon={Bell}
          title="Direct Introductions"
          description="Permit senior directors to introduce your identity to prospective counterparties, subject to your case-by-case consent."
          action={
            <Toggle
              checked={privacy.directIntroductions}
              onChange={handleToggle('directIntroductions')}
              label="Toggle introductions"
            />
          }
        />
        <SettingsRow
          icon={Sparkles}
          title="Concours & Event Roster"
          description="Include your name on private event guest lists (Villa d'Este, Pebble Beach, factory previews)."
          action={
            <Toggle
              checked={privacy.eventRoster}
              onChange={handleToggle('eventRoster')}
              label="Toggle event roster"
            />
          }
        />
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Your Data</h3>

        <SettingsRow
          icon={Download}
          title="Request Data Export"
          description="Receive a complete archive of your account data, transaction history, and correspondence within 7 days."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportRequest}
              disabled={exportRequesting}
              className="text-[10px] uppercase tracking-widest"
            >
              {exportRequesting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Requesting
                </>
              ) : (
                'Request Export'
              )}
            </Button>
          }
        />

        <SettingsRow
          icon={FileText}
          title="Data Processing Agreement"
          description="Review the TORQUENS Client Confidentiality Framework and GDPR processing terms."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Opening document',
                  description: 'Data Processing Agreement (PDF)',
                })
              }
              className="text-[10px] uppercase tracking-widest"
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              View Document
            </Button>
          }
        />
      </div>

      <div className="space-y-4 pt-6 border-t border-border/30">
        <h3 className="text-sm font-serif text-primary">Account Lifecycle</h3>

        <SettingsRow
          icon={LogOut}
          title="Sign Out of All Sessions"
          description="Immediately terminate every active session across all devices."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSignOutConfirm(true)}
              className="text-[10px] uppercase tracking-widest"
            >
              Sign Out All
            </Button>
          }
        />
      </div>

      <div className="rounded-xl border border-red-500/30 bg-red-500/3 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-obsidian border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-serif text-primary">Restricted Actions</h3>
            <p className="text-xs text-secondary font-sans leading-relaxed max-w-2xl">
              Deactivation and closure require senior director countersignature and settlement of
              any outstanding mandates. These actions are not reversible.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-obsidian/40 border border-border/40">
            <div className="space-y-0.5">
              <div className="text-sm font-serif text-primary">Deactivate Account</div>
              <p className="text-[11px] text-muted font-sans">
                Temporarily suspend portal access. Existing mandates remain in force.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeactivateConfirm(true)}
              className="text-[10px] uppercase tracking-widest border-red-500/30 hover:border-red-500/60 text-red-400"
            >
              Deactivate
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-obsidian/40 border border-border/40">
            <div className="space-y-0.5">
              <div className="text-sm font-serif text-primary">Close Account Permanently</div>
              <p className="text-[11px] text-muted font-sans">
                Requires zero open mandates. Data retained per statutory obligations only.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCloseConfirm(true)}
              className="text-[10px] uppercase tracking-widest border-red-500/30 hover:border-red-500/60 text-red-400"
              leftIcon={<Trash2 className="h-3 w-3" />}
            >
              Close Account
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={signOutConfirm}
        title="Sign out of all sessions?"
        description="You will be signed out of every device including this one. You will need to re-authenticate to access your account."
        confirmLabel="Sign Out All"
        destructive
        onConfirm={handleSignOutAll}
        onCancel={() => setSignOutConfirm(false)}
      />

      <ConfirmModal
        open={deactivateConfirm}
        title="Deactivate account?"
        description="Portal access will be suspended pending senior director countersignature. Existing mandates and escrow instructions remain in force during deactivation."
        confirmLabel="Request Deactivation"
        destructive
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateConfirm(false)}
      />

      <ConfirmModal
        open={closeConfirm}
        title="Close account permanently?"
        description="This action requires zero open mandates and cannot be reversed. A senior director will confirm your request via encrypted correspondence."
        confirmLabel="Request Closure"
        destructive
        requireTyping="CLOSE ACCOUNT"
        onConfirm={handleClose}
        onCancel={() => setCloseConfirm(false)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS WRAPPER
// ─────────────────────────────────────────────────────────────
function SettingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'profile';
  const activeTabMeta = SETTINGS_TABS.find((t) => t.id === activeTab) || SETTINGS_TABS[0];

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePanel />;
      case 'security':
        return <SecurityPanel />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'billing':
        return <BillingPanel />;
      case 'preferences':
        return <PreferencesPanel />;
      case 'privacy':
        return <PrivacyPanel />;
      default:
        return <ProfilePanel />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted"
        >
          <Link href="/dashboard" className="hover:text-gold transition-colors">
            Vault
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">Settings</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-secondary font-sans max-w-2xl leading-relaxed">
              Manage your identity, security posture, correspondence, and portal preferences —
              synchronized across TORQUENS desks in Geneva, London, and Dubai.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-graphite/60 border border-border/70 self-start sm:self-auto">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">
              All changes synced
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <div className="lg:hidden -mx-4 px-4 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-serif transition-colors ${
                        isActive
                          ? 'bg-gold/10 border-gold/40 text-gold'
                          : 'bg-graphite/60 border-border/70 text-secondary hover:border-gold/30'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <nav className="hidden lg:block space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all group ${
                      isActive
                        ? 'bg-gold/6 border-gold/40'
                        : 'bg-transparent border-transparent hover:bg-graphite/40 hover:border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-obsidian border-gold/40 text-gold'
                            : 'bg-obsidian/60 border-border/60 text-muted group-hover:text-gold'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-serif transition-colors ${
                            isActive ? 'text-gold' : 'text-primary'
                          }`}
                        >
                          {tab.label}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted truncate mt-0.5">
                          {tab.description}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-gold shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="hidden lg:block mt-6 p-4 rounded-xl bg-graphite/60 border border-border/70 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
                  Concierge Access
                </span>
              </div>
              <p className="text-[11px] text-secondary font-sans leading-relaxed">
                Need assistance with a setting? Reach your senior director directly.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gold hover:gap-2.5 transition-all"
              >
                Message Desk
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          <Card className="p-6 sm:p-8 lg:p-10 bg-graphite/60 border-border/70 backdrop-blur-md">
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-border/40">
              <div className="h-10 w-10 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
                <activeTabMeta.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  Section
                </div>
                <div className="text-sm font-serif text-primary">{activeTabMeta.label}</div>
              </div>
            </div>

            {renderPanel()}
          </Card>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted">
                Loading secure environment
              </p>
            </div>
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </ToastProvider>
  );
}