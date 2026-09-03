'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Search,
  Eye,
  Check,
  X,
  Car,
  FileCheck2,
  Building2,
  Sparkles,
  Loader2,
  Shield,
  AlertTriangle,
  FileText,
  Upload,
  Camera,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import { getPendingVerifications, verifyVehicleListing } from '@/actions/admin';

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export interface PendingVerificationAsset {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  images: string[];
  dealer: {
    id: string;
    name: string;
    email: string;
  };
  vin?: string;
  submittedAt: string;
  documents?: string[];
  verificationChecklist?: {
    item: string;
    passed: boolean;
    notes?: string;
  }[];
}

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const getDocumentLabel = (type: string): string => {
  const labels: Record<string, string> = {
    PROOF_OF_OWNERSHIP: 'Proof of Ownership',
    VEHICLE_REGISTRATION: 'Vehicle Registration',
    CUSTOMS_CLEARANCE: 'Customs Clearance',
    INSURANCE: 'Insurance',
    SERVICE_HISTORY: 'Service History',
    INSPECTION_REPORT: 'Inspection Report',
    OTHER: 'Other',
  };
  return labels[type] || type;
};

const progressPercentage = (checklist: any[]): number => {
  if (!checklist || checklist.length === 0) return 0;
  const passed = checklist.filter(item => item.passed).length;
  return Math.round((passed / checklist.length) * 100);
};

export default function AdminVerificationPage() {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<PendingVerificationAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerificationAsset | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // SECURE QUEUE FETCH
  // ─────────────────────────────────────────────────────────────
  const loadPendingQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPendingVerifications() as ActionResponse<PendingVerificationAsset[]>;

      if (response?.success && Array.isArray(response.data)) {
        setVehicles(response.data);
      } else {
        setVehicles([]);
        showToast({
          type: 'error',
          title: 'Queue Access Failed',
          message: response?.message || 'Unable to retrieve pending verification assets.',
        });
      }
    } catch (error) {
      console.error('[AdminVerification] Fetch exception:', error);
      setVehicles([]);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to compliance ledger.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const fetchData = async () => {
      await loadPendingQueue();
    };
    fetchData();
  }, [loadPendingQueue]);

  // ─────────────────────────────────────────────────────────────
  // AUDIT DECISION (APPROVE / REJECT)
  // ─────────────────────────────────────────────────────────────
  const handleVerify = async (vehicleId: string, action: 'approve' | 'reject') => {
    setVerifyingId(vehicleId);
    const previous = [...vehicles];

    // Optimistic local state removal
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

    try {
      const response = await verifyVehicleListing(vehicleId, action) as ActionResponse<unknown>;

      if (response?.success) {
        showToast({
          type: action === 'approve' ? 'success' : 'warning',
          title: action === 'approve' ? 'Provenance Cleared' : 'Listing Rejected',
          message:
            action === 'approve'
              ? 'Vehicle has been stamped verified and released to the public showroom.'
              : 'Asset compliance rejected and returned to broker with revision notes.',
        });
      } else {
        setVehicles(previous);
        showToast({
          type: 'error',
          title: 'Protocol Execution Failed',
          message: response?.message || 'Unable to write verification signature.',
        });
      }
    } catch (error) {
      setVehicles(previous);
      console.error('[AdminVerification] Action error:', error);
      showToast({
        type: 'error',
        title: 'Server Exception',
        message: 'An error occurred while updating the ledger.',
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleOpenDetails = (vehicle: PendingVerificationAsset) => {
    setSelectedVerification(vehicle);
    setShowDetailsModal(true);
  };

  const filteredVehicles = useMemo(() => {
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    return safeVehicles.filter((v) => {
      const q = search.toLowerCase();
      return (
        `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(q) ||
        v.dealer.name.toLowerCase().includes(q) ||
        (v.vin && v.vin.toLowerCase().includes(q))
      );
    });
  }, [vehicles, search]);

  // ─────────────────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    return {
      pending: safeVehicles.length,
      approved: 0,
      rejected: 0,
    };
  }, [vehicles]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────── */}
      {/* HEADER                                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold" size="sm">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Compliance & Provenance
              </span>
            </Badge>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-mono text-muted uppercase">Verification Ledger</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
            Asset Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-sans mt-1">
            Audit ownership titles, chassis VIN matching, and customs clearance before public showroom authorization.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian border border-border/60 text-xs font-mono text-gold">
          <Clock className="h-3.5 w-3.5 text-yellow-400" />
          <span>{stats.pending} Pending Audit</span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* STATS CARDS                                               */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-graphite/80 border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted font-sans">Pending</p>
              <p className="text-xl font-serif font-light text-primary">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-graphite/80 border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald/10">
              <CheckCircle2 className="h-5 w-5 text-emerald" />
            </div>
            <div>
              <p className="text-sm text-muted font-sans">Verified</p>
              <p className="text-xl font-serif font-light text-primary">{stats.approved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-graphite/80 border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted font-sans">Rejected</p>
              <p className="text-xl font-serif font-light text-primary">{stats.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* SEARCH FILTER                                             */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          placeholder="Filter by Make, Model, Dealer, or VIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-graphite/60 border border-border/80 text-sm font-sans text-primary placeholder-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
        />
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* QUEUE MATRIX                                              */}
      {/* ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl bg-graphite/50 border border-border/40" />
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card className="py-16 px-6 text-center bg-graphite/40 border-border/60">
          <div className="w-16 h-16 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h3 className="text-xl font-serif font-light text-primary">Provenance Queue Cleared</h3>
          <p className="text-xs text-secondary font-sans max-w-sm mx-auto mt-1">
            All submitted automotive allocations have been audited and authenticated.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => {
            const isProcessing = verifyingId === vehicle.id;
            const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
            const progress = vehicle.verificationChecklist 
              ? progressPercentage(vehicle.verificationChecklist) 
              : 0;

            return (
              <Card
                key={vehicle.id}
                className="p-5 bg-graphite/90 border-border/80 hover:border-gold/30 transition-all duration-300 backdrop-blur-md"
              >
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  {/* Thumbnail & Spec Dossier */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                    <div className="relative w-full sm:w-44 h-32 rounded-lg overflow-hidden bg-obsidian border border-border/80 shrink-0">
                      {vehicle.images?.[0] ? (
                        <Image
                          src={vehicle.images[0]}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 176px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Car className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="font-serif text-lg text-primary hover:text-gold transition-colors tracking-wide truncate"
                        >
                          {title}
                        </Link>
                        <Badge variant="warning" size="sm">
                          Pending Audit
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted font-sans">
                        <span className="text-gold font-semibold font-mono text-sm">
                          {formatCurrency(vehicle.price, vehicle.currency)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gold/80" />
                          <span className="text-secondary">{vehicle.dealer.name}</span>
                        </span>
                        {vehicle.vin && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-muted">VIN: {vehicle.vin}</span>
                          </>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {vehicle.verificationChecklist && (
                        <div className="w-full max-w-xs">
                          <div className="flex items-center justify-between text-[10px] text-muted font-sans mb-0.5">
                            <span>Verification Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-charcoal rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Document Compliance Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(vehicle.documents || ['Proof of Ownership', 'Customs Title', 'Inspection Stamp']).map(
                          (doc, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-obsidian border border-border text-[9px] font-mono text-secondary uppercase tracking-wider"
                            >
                              <FileCheck2 className="h-2.5 w-2.5 text-gold" />
                              <span>{getDocumentLabel(doc)}</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Decision Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/40">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDetails(vehicle)}
                      className="text-xs uppercase font-mono tracking-wider border-border hover:border-gold/30"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>Review</span>
                    </Button>

                    <Button
                      variant="gold"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleVerify(vehicle.id, 'approve')}
                      className="text-xs uppercase font-mono tracking-wider font-semibold"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <Check className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Authorize</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleVerify(vehicle.id, 'reject')}
                      className="text-xs uppercase font-mono tracking-wider text-red-400 hover:text-red-300 hover:border-red-500/30"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      <span>Decline</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* DETAILS MODAL                                             */}
      {/* ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Verification Details"
        size="lg"
      >
        {selectedVerification && (
          <div className="space-y-6">
            {/* Vehicle Info */}
            <div>
              <h4 className="text-sm font-sans font-semibold text-secondary uppercase tracking-wider mb-2">
                Vehicle Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted font-sans">Make</span>
                  <p className="text-primary font-sans">{selectedVerification.make}</p>
                </div>
                <div>
                  <span className="text-muted font-sans">Model</span>
                  <p className="text-primary font-sans">{selectedVerification.model}</p>
                </div>
                <div>
                  <span className="text-muted font-sans">Year</span>
                  <p className="text-primary font-sans">{selectedVerification.year}</p>
                </div>
                <div>
                  <span className="text-muted font-sans">Price</span>
                  <p className="text-primary font-sans">
                    {formatCurrency(selectedVerification.price, selectedVerification.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            {selectedVerification.verificationChecklist && (
              <div>
                <h4 className="text-sm font-sans font-semibold text-secondary uppercase tracking-wider mb-2">
                  Verification Checklist
                </h4>
                <div className="space-y-2">
                  {selectedVerification.verificationChecklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-obsidian rounded-md">
                      {item.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                      )}
                      <span className="text-sm font-sans text-secondary flex-1">{item.item}</span>
                      <Badge variant={item.passed ? 'success' : 'warning'} size="sm">
                        {item.passed ? 'Passed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            <div>
              <h4 className="text-sm font-sans font-semibold text-secondary uppercase tracking-wider mb-2">
                Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedVerification.documents || ['Proof of Ownership', 'Customs Title', 'Inspection Stamp']).map(
                  (doc, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowDocumentModal(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {getDocumentLabel(doc)}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="success"
                className="flex-1 bg-emerald hover:bg-emerald/90"
                onClick={() => {
                  handleVerify(selectedVerification.id, 'approve');
                  setShowDetailsModal(false);
                }}
                disabled={verifyingId === selectedVerification.id}
              >
                {verifyingId === selectedVerification.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Approve
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  handleVerify(selectedVerification.id, 'reject');
                  setShowDetailsModal(false);
                }}
                disabled={verifyingId === selectedVerification.id}
              >
                {verifyingId === selectedVerification.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ───────────────────────────────────────────────────────── */}
      {/* DOCUMENT PREVIEW MODAL                                     */}
      {/* ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title="Document Preview"
        size="lg"
      >
        <div className="flex flex-col items-center justify-center min-h-75 p-8">
          <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-gold" />
          </div>
          <p className="text-secondary font-sans text-center">
            Document preview coming soon.
            <br />
            <span className="text-sm text-muted">
              Document type: {selectedDocument ? getDocumentLabel(selectedDocument) : 'Unknown'}
            </span>
          </p>
        </div>
      </Modal>
    </div>
  );
}