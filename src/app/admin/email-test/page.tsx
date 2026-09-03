/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Eye,
  Code2,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone,
  ShieldCheck,
  RotateCcw,
  Layers,
  Terminal,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// TEMPLATE METADATA & SAMPLE PAYLOADS
// ─────────────────────────────────────────────────────────────
type TemplateId =
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'enquiry-confirmation'
  | 'dealer-enquiry'
  | 'vehicle-verified'
  | 'price-change'
  | 'reservation'
  | 'dealer-registration';

interface TemplateConfig {
  id: TemplateId;
  label: string;
  category: 'Authentication' | 'Inquiries' | 'Transactions' | 'Partners';
  defaultSubject: string;
  samplePayload: Record<string, unknown>;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'welcome',
    label: 'Welcome to Private Registry',
    category: 'Authentication',
    defaultSubject: 'Welcome to TORQUENS Private Client Registry',
    samplePayload: {
      name: 'Harrison Sterling',
    },
  },
  {
    id: 'verification',
    label: 'Email Security Verification',
    category: 'Authentication',
    defaultSubject: 'Verify Vault Access - TORQUENS MOTORS',
    samplePayload: {
      name: 'Harrison Sterling',
      token: 'sec_tok_984f7281a9c3982e01',
    },
  },
  {
    id: 'password-reset',
    label: 'Security Key Reset',
    category: 'Authentication',
    defaultSubject: 'Reset Security Key - TORQUENS MOTORS',
    samplePayload: {
      name: 'Harrison Sterling',
      token: 'rst_tok_493810283910ab',
    },
  },
  {
    id: 'enquiry-confirmation',
    label: 'Client Inquiry Confirmation',
    category: 'Inquiries',
    defaultSubject: 'Inquiry Lodged - Porsche 911 GT3 RS | TORQUENS MOTORS',
    samplePayload: {
      name: 'Harrison Sterling',
      vehicleName: '2024 Porsche 911 GT3 RS (992)',
      enquiryId: 'enq_98472394a82f',
      dealerName: 'Mayfair Concierge Desk',
    },
  },
  {
    id: 'dealer-enquiry',
    label: 'Dealer Allocation Notification',
    category: 'Inquiries',
    defaultSubject: 'New Client Inquiry: Porsche 911 GT3 RS | TORQUENS',
    samplePayload: {
      dealerName: 'Mayfair Concierge Desk',
      customerName: 'Harrison Sterling',
      customerEmail: 'h.sterling@mayfair-holdings.co.uk',
      customerPhone: '+44 20 7946 0991',
      preferredContact: 'EMAIL',
      vehicleName: '2024 Porsche 911 GT3 RS (992)',
      enquiryId: 'enq_98472394a82f',
      message: 'Inquiring regarding chassis provenance and European tax status for this GT3 RS. We require direct delivery to Geneva.',
    },
  },
  {
    id: 'vehicle-verified',
    label: 'Vehicle Provenance Cleared',
    category: 'Partners',
    defaultSubject: 'Provenance Cleared - Porsche 911 GT3 RS | TORQUENS',
    samplePayload: {
      dealerName: 'Mayfair Concierge Desk',
      vehicleName: '2024 Porsche 911 GT3 RS (992)',
      vehicleId: 'veh_gt3rs_992_01',
    },
  },
  {
    id: 'price-change',
    label: 'Market Valuation Adjustment',
    category: 'Transactions',
    defaultSubject: 'Valuation Update - Ferrari Roma Spider | TORQUENS MOTORS',
    samplePayload: {
      name: 'Harrison Sterling',
      vehicleName: '2023 Ferrari Roma Spider',
      vehicleId: 'veh_roma_spider_23',
      oldPrice: 355000000,
      newPrice: 345000000,
      currency: 'NGN',
    },
  },
  {
    id: 'reservation',
    label: 'Escrow Reservation Confirmation',
    category: 'Transactions',
    defaultSubject: 'Allocation Reserved - Aston Martin DB12 | TORQUENS',
    samplePayload: {
      name: 'Harrison Sterling',
      vehicleName: '2024 Aston Martin DB12 Coupe',
      vehicleId: 'veh_db12_coupe',
      reservationId: 'res_84930281a',
      depositAmount: 15000000,
      currency: 'NGN',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    },
  },
  {
    id: 'dealer-registration',
    label: 'Broker Accreditation In Review',
    category: 'Partners',
    defaultSubject: 'Broker Application Received - TORQUENS MOTORS',
    samplePayload: {
      dealerName: 'Mayfair Concierge Desk',
      email: 'broker@mayfair-holdings.co.uk',
    },
  },
];

// Helper to simulate luxury email template HTML in the sandbox preview
function generatePreviewHtml(templateId: TemplateId, payload: Record<string, unknown>, customHtml?: string) {
  if (customHtml?.trim()) {
    return customHtml;
  }

  const name = (payload.name as string) || (payload.dealerName as string) || 'Client';
  const vehicleName = (payload.vehicleName as string) || 'Vehicle Allocation';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background-color: #08090B; color: #9EA5B5; font-size: 14px; line-height: 1.6; }
    .container { max-width: 540px; margin: 0 auto; background-color: #12151B; border-radius: 12px; border: 1px solid #1F242D; padding: 32px 24px; box-sizing: border-box; }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1F242D; }
    .logo { font-size: 24px; font-weight: 300; letter-spacing: 3px; color: #F8F9FA; font-family: Georgia, serif; }
    .logo span { color: #C5A059; }
    .subtitle { margin-top: 6px; font-size: 9px; color: #717A8C; letter-spacing: 2px; text-transform: uppercase; font-family: monospace; }
    .content { padding: 24px 0; }
    .content h1 { color: #F8F9FA; font-size: 20px; font-weight: 300; margin: 0 0 16px 0; font-family: Georgia, serif; }
    .button { display: inline-block; padding: 12px 30px; background-color: #C5A059; color: #08090B; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin: 20px 0; }
    .details { background-color: #1A1E26; padding: 14px; border-radius: 8px; margin: 16px 0; border: 1px solid #282E3A; }
    .details-label { font-size: 10px; color: #717A8C; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; }
    .details-value { color: #F8F9FA; font-weight: 500; font-size: 13px; margin-top: 2px; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #1F242D; font-size: 10px; color: #545B6B; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TORQUENS<span>MOTORS</span></div>
      <div class="subtitle">Private Client Registry · Geneva & Mayfair</div>
    </div>
    <div class="content">
      <h1>Notification Transmission</h1>
      <p>Dear ${name},</p>
      <p>This is a certified dispatch regarding <strong>${vehicleName}</strong>.</p>
      <div class="details">
        <div><span class="details-label">Template ID</span><div class="details-value">${templateId}</div></div>
        <div style="margin-top: 8px;"><span class="details-label">Security Protocol</span><div class="details-value">256-Bit SSL Escrow Ledger</div></div>
      </div>
      <div style="text-align: center;">
        <a href="#" class="button">Access Private Vault</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} TORQUENS MOTORS. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}

export default function EmailTestPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('welcome');
  const [subjectOverride, setSubjectOverride] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'payload' | 'html'>('preview');

  // Find active template metadata
  const currentTemplate = useMemo(() => {
    return TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  }, [selectedTemplate]);

  // Generate live sandbox HTML preview
  const previewHtml = useMemo(() => {
    return generatePreviewHtml(selectedTemplate, currentTemplate.samplePayload, customHtml);
  }, [selectedTemplate, currentTemplate, customHtml]);

  // ─────────────────────────────────────────────────────────────
  // DISPATCH TEST EMAIL
  // ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast({
        type: 'error',
        title: 'Recipient Required',
        message: 'Please provide a valid destination email address for testing.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          template: selectedTemplate,
          subject: subjectOverride || undefined,
          customHtml: customHtml || undefined,
          payload: currentTemplate.samplePayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'SMTP dispatch failed');
      }

      showToast({
        type: 'success',
        title: 'Transmission Dispatched',
        message: `Test email successfully sent to ${trimmedEmail}`,
      });
    } catch (error: unknown) {
      console.error('[EmailTestPage] Send error:', error);
      const errMsg = error instanceof Error ? error.message : 'Failed to dispatch test transmission.';
      showToast({
        type: 'error',
        title: 'SMTP Dispatch Error',
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* ───────────────────────────────────────────────────────── */}
      {/* HEADER SECTION                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                SMTP & Mail Services
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Developer Sandbox</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Email Transmission Studio
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1 max-w-xl">
            Audit luxury HTML email templates, verify SMTP relay handshakes, and test live transmissions across customer lifecycle touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="h-4 w-4" />
          <span>Resend / SMTP Relay Online</span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* WORKSPACE GRID: CONTROLS (LEFT) + SANDBOX (RIGHT)         */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: DISPATCH CONFIGURATION (5 Cols)            */}
        {/* ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-graphite/95 border-border/80 relative overflow-hidden backdrop-blur-md shadow-dropdown">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent" />

            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gold flex items-center gap-2 border-b border-border/40 pb-3 mb-5">
              <Send className="h-3.5 w-3.5" />
              <span>Transmission Parameters</span>
            </h2>

            <div className="space-y-4">
              {/* Recipient Address */}
              <Input
                label="Destination Recipient"
                type="email"
                placeholder="developer@torquens.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-muted" />}
                required
              />

              {/* Template Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans text-secondary">
                  Concierge Email Template <span className="text-gold">*</span>
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as TemplateId)}
                  className="w-full h-10 px-3.5 rounded-md bg-inset border border-border text-xs font-sans text-primary focus:outline-none focus:border-gold cursor-pointer"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Line Override */}
              <Input
                label="Subject Line (Optional Override)"
                placeholder={currentTemplate.defaultSubject}
                value={subjectOverride}
                onChange={(e) => setSubjectOverride(e.target.value)}
              />

              {/* Custom HTML Override */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-sans text-secondary">
                    Raw HTML Injector (Overrides Template)
                  </label>
                  {customHtml && (
                    <button
                      type="button"
                      onClick={() => setCustomHtml('')}
                      className="text-[10px] font-mono text-gold hover:underline"
                    >
                      Clear HTML
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="<p style='color: #fff;'>Custom HTML body content...</p>"
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>

              {/* Submit Trigger */}
              <Button
                type="button"
                variant="gold"
                size="lg"
                fullWidth
                isLoading={loading}
                onClick={handleSend}
                className="mt-2 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] h-12"
              >
                {loading ? (
                  <span>Relaying Transmission...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Dispatch Test Email</span>
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Telemetry Guide Card */}
          <div className="p-4 rounded-xl border border-yellow-500/10 bg-yellow-500/2 flex items-start gap-3">
            <Terminal className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gold block">
                Direct Relay Protocol
              </span>
              <p className="text-[11px] text-secondary font-sans leading-relaxed">
                Test dispatches are relayed using your active environment credentials (<code className="text-primary font-mono">RESEND_API_KEY</code> / SMTP). Ensure recipient inboxes accept transmissions from <code className="text-primary font-mono">concierge@torquens.com</code>.
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: LIVE VISUAL SANDBOX (7 Cols)              */}
        {/* ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sandbox Chrome & Device Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 px-3 rounded-xl bg-graphite/90 border border-border/80 backdrop-blur-md">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
                  activeTab === 'preview'
                    ? 'bg-gold text-obsidian font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                )}
              >
                <Eye size={13} />
                <span>Visual Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payload')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
                  activeTab === 'payload'
                    ? 'bg-gold text-obsidian font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                )}
              >
                <Layers size={13} />
                <span>Sample Payload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
                  activeTab === 'html'
                    ? 'bg-gold text-obsidian font-semibold shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                )}
              >
                <Code2 size={13} />
                <span>Source Code</span>
              </button>
            </div>

            {/* Viewport Width Switcher */}
            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 self-end sm:self-auto bg-obsidian p-1 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('desktop')}
                  className={cn(
                    'p-1.5 rounded text-xs transition-colors',
                    activeViewMode === 'desktop' ? 'bg-graphite text-gold' : 'text-muted hover:text-primary'
                  )}
                  title="Desktop (100% width)"
                >
                  <Laptop size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('mobile')}
                  className={cn(
                    'p-1.5 rounded text-xs transition-colors',
                    activeViewMode === 'mobile' ? 'bg-graphite text-gold' : 'text-muted hover:text-primary'
                  )}
                  title="Mobile Device (375px)"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────── */}
          {/* TAB 1: LIVE VISUAL PREVIEW SANDBOX                    */}
          {/* ───────────────────────────────────────────────────── */}
          {activeTab === 'preview' && (
            <Card className="p-0 overflow-hidden bg-obsidian border-border/80 shadow-2xl relative">
              {/* Simulated Mail Client Header */}
              <div className="p-4 bg-graphite/90 border-b border-border/60 space-y-1.5 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-muted font-mono w-16">Subject:</span>
                  <span className="text-primary font-medium truncate">
                    {subjectOverride || currentTemplate.defaultSubject}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted font-mono w-16">From:</span>
                  <span className="text-secondary font-mono text-[11px]">
                    TORQUENS Concierge &lt;concierge@torquens.com&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted font-mono w-16">To:</span>
                  <span className="text-gold font-mono text-[11px]">
                    {email.trim() || 'developer@torquens.com'}
                  </span>
                </div>
              </div>

              {/* Isolated Iframe Sandbox Container */}
              <div className="p-4 sm:p-6 bg-[#040506] flex items-center justify-center min-h-125">
                <div
                  className={cn(
                    'w-full transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-border/40',
                    activeViewMode === 'mobile' ? 'max-w-95' : 'max-w-145'
                  )}
                >
                  <iframe
                    title="Live Email Template Preview"
                    srcDoc={previewHtml}
                    className="w-full h-130 bg-obsidian border-0 block"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* ───────────────────────────────────────────────────── */}
          {/* TAB 2: SAMPLE PAYLOAD DATA VIEWER                     */}
          {/* ───────────────────────────────────────────────────── */}
          {activeTab === 'payload' && (
            <Card className="p-5 bg-graphite/95 border-border/80">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-gold">
                  Injected Payload Parameters
                </span>
                <Badge variant="gold" size="sm">
                  {selectedTemplate}
                </Badge>
              </div>

              <pre className="p-4 rounded-lg bg-obsidian border border-border/60 font-mono text-xs text-primary overflow-x-auto">
                {JSON.stringify(currentTemplate.samplePayload, null, 2)}
              </pre>
            </Card>
          )}

          {/* ───────────────────────────────────────────────────── */}
          {/* TAB 3: SOURCE HTML VIEWER                             */}
          {/* ───────────────────────────────────────────────────── */}
          {activeTab === 'html' && (
            <Card className="p-5 bg-graphite/95 border-border/80">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-gold">
                  Rendered HTML Markup
                </span>
                <span className="text-[10px] font-mono text-muted">
                  {previewHtml.length} characters
                </span>
              </div>

              <pre className="p-4 rounded-lg bg-obsidian border border-border/60 font-mono text-[11px] text-secondary overflow-x-auto max-h-120">
                {previewHtml}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}