/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Verification } from '@/models/Verification';
import { Vehicle } from '@/models/Vehicle';
import { User } from '@/models/User';
import { 
  findOne,
  findById,
  findMany,
  paginate,
  create,
  update,
  deleteOne,
  aggregate,
} from './database';
import type { IVerificationDocument } from '@/models/Verification';

export interface VerificationDocument {
  type: 'PROOF_OF_OWNERSHIP' | 'VEHICLE_REGISTRATION' | 'CUSTOMS_CLEARANCE' | 
         'INSURANCE' | 'SERVICE_HISTORY' | 'INSPECTION_REPORT' | 'OTHER';
  url: string;
  notes?: string;
}

export interface VerificationChecklistItem {
  item: string;
  passed: boolean;
  notes?: string;
}

export class VerificationService {
  /**
   * Create a new verification request
   */
  static async createVerification(
    vehicleId: string,
    dealerId?: string,
    documents: VerificationDocument[] = []
  ): Promise<IVerificationDocument> {
    // Check if verification already exists
    const existing = await findOne<any>(Verification as any, { vehicle: vehicleId });
    if (existing) {
      // Update existing verification
      return await update(
        Verification as any,
        { _id: existing._id },
        { 
          documents: [...existing.documents, ...documents],
          status: 'PENDING',
          updatedAt: new Date(),
        },
        { new: true, lean: true }
      ) as IVerificationDocument;
    }

    // Create new verification
    const verification = await create<any>(Verification as any, {
      vehicle: vehicleId,
      dealer: dealerId,
      status: 'PENDING',
      documents: documents.map(doc => ({
        ...doc,
        uploadedAt: new Date(),
        verified: false,
      })),
      verificationChecklist: [
        { item: 'Vehicle Exists', passed: false },
        { item: 'VIN Matches Documentation', passed: false },
        { item: 'Customs Clearance Verified', passed: false },
        { item: 'Title / Ownership Verified', passed: false },
        { item: 'Vehicle Inspection Passed', passed: false },
      ],
      metadata: {
        vinChecked: false,
        titleChecked: false,
        customsChecked: false,
        inspectionPassed: false,
      },
    });

    // Update vehicle status
    await update(
      Vehicle as any,
      { _id: vehicleId },
      { verified: 'PENDING' }
    );

    return verification as IVerificationDocument;
  }

  /**
   * Get verification by vehicle ID
   */
  static async getVerificationByVehicle(vehicleId: string): Promise<IVerificationDocument | null> {
    const result = await findOne<any>(Verification as any, { vehicle: vehicleId });
    return result as IVerificationDocument | null;
  }

  /**
   * Get verification by ID
   */
  static async getVerificationById(id: string): Promise<IVerificationDocument | null> {
    const result = await findById<any>(Verification as any, id);
    return result as IVerificationDocument | null;
  }

  /**
   * Get all pending verifications
   */
  static async getPendingVerifications(page: number = 1, limit: number = 20) {
    const result = await paginate<any>(
      Verification as any,
      { status: 'PENDING' },
      { page, limit, sort: { createdAt: 1 } }
    );

    // Populate vehicle and dealer
    const populated = await Promise.all(
      result.data.map(async (v: any) => {
        const doc = await findById<any>(Verification as any, v._id);
        return doc;
      })
    );

    return {
      data: populated,
      pagination: result.pagination,
    };
  }

  /**
   * Update verification status
   */
  static async updateStatus(
    verificationId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEWING',
    reviewedBy: string,
    notes?: string
  ): Promise<IVerificationDocument | null> {
    const verification = await update(
      Verification as any,
      { _id: verificationId },
      {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        notes: notes || null,
      },
      { new: true, lean: true }
    ) as IVerificationDocument | null;

    if (verification) {
      // Update vehicle verification status
      const vehicleStatus = status === 'APPROVED' ? 'VERIFIED' : 
                           status === 'REJECTED' ? 'REJECTED' : 'PENDING';
      await update(
        Vehicle as any,
        { _id: (verification as any).vehicle },
        { verified: vehicleStatus }
      );

      // Update dealer verification if dealer exists and status is APPROVED
      if ((verification as any).dealer && status === 'APPROVED') {
        await update(
          User as any,
          { _id: (verification as any).dealer },
          { verified: true }
        );
      }
    }

    return verification;
  }

  /**
   * Add document to verification
   */
  static async addDocument(
    verificationId: string,
    document: VerificationDocument
  ): Promise<IVerificationDocument | null> {
    const verification = await findById<any>(Verification as any, verificationId);
    if (!verification) return null;

    const updated = await update(
      Verification as any,
      { _id: verificationId },
      {
        $push: {
          documents: {
            ...document,
            uploadedAt: new Date(),
            verified: false,
          },
        },
      },
      { new: true, lean: true }
    );

    return updated as IVerificationDocument | null;
  }

  /**
   * Update checklist item
   */
  static async updateChecklistItem(
    verificationId: string,
    itemIndex: number,
    passed: boolean,
    notes?: string
  ): Promise<IVerificationDocument | null> {
    const verification = await findById<any>(Verification as any, verificationId);
    if (!verification) return null;

    const checklist = verification.verificationChecklist || [];
    if (itemIndex < 0 || itemIndex >= checklist.length) {
      throw new Error('Invalid checklist item');
    }

    checklist[itemIndex].passed = passed;
    if (notes) checklist[itemIndex].notes = notes;

    // Check if all items are passed
    const allPassed = checklist.every((item: any) => item.passed);

    const updated = await update(
      Verification as any,
      { _id: verificationId },
      {
        verificationChecklist: checklist,
        status: allPassed ? 'APPROVED' : 'REVIEWING',
        ...(allPassed ? { 
          reviewedAt: new Date(),
          metadata: {
            ...verification.metadata,
            inspectionPassed: true,
          },
        } : {}),
      },
      { new: true, lean: true }
    );

    if (allPassed && updated) {
      // Auto-approve if all checklist items passed
      await this.updateStatus(
        verificationId,
        'APPROVED',
        verification.reviewedBy?.toString() || 'system',
        'All verification checks passed'
      );
    }

    return updated as IVerificationDocument | null;
  }

  /**
   * Get verification statistics
   */
  static async getVerificationStats() {
    return await aggregate<any>(
      Verification as any,
      [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]
    );
  }

  /**
   * Get verification history for a vehicle
   */
  static async getVehicleVerificationHistory(vehicleId: string): Promise<IVerificationDocument[]> {
    const result = await findMany<any>(
      Verification as any,
      { vehicle: vehicleId },
      undefined,
      { sort: { createdAt: -1 } }
    );
    return result as IVerificationDocument[];
  }

  /**
   * Verify VIN with external service
   */
  static async verifyVIN(vin: string): Promise<{
    valid: boolean;
    details?: {
      make?: string;
      model?: string;
      year?: number;
      country?: string;
      manufacturer?: string;
    };
  }> {
    // This would integrate with an external VIN verification API
    // For now, return mock data
    return {
      valid: true,
      details: {
        make: 'Porsche',
        model: '911',
        year: 2024,
        country: 'Germany',
        manufacturer: 'Porsche AG',
      },
    };
  }

  /**
   * Verify title with external service
   */
  static async verifyTitle(titleNumber: string): Promise<{
    valid: boolean;
    details?: {
      owner?: string;
      status?: string;
      issueDate?: Date;
    };
  }> {
    // This would integrate with an external title verification API
    return {
      valid: true,
      details: {
        owner: 'John Doe',
        status: 'Clear',
        issueDate: new Date(),
      },
    };
  }

  /**
   * Delete a verification record
   */
  static async deleteVerification(verificationId: string): Promise<boolean> {
    const result = await deleteOne(Verification as any, { _id: verificationId });
    return !!result;
  }

  /**
   * Get verification count by status
   */
  static async getVerificationCount(status?: string): Promise<number> {
    const query = status ? { status } : {};
    const result = await findMany<any>(Verification as any, query);
    return result.length;
  }
}

export default VerificationService;