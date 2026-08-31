/* eslint-disable @typescript-eslint/no-explicit-any */
import { Enquiry } from '@/models/Enquiry';
import { Vehicle } from '@/models/Vehicle';
// ✅ Import database functions
import { findMany, create, update, aggregate, findById } from './database';
import type { IEnquiry } from '@/types';

// ✅ Define EnquiryWithDetails interface without extending IEnquiry
export interface EnquiryWithDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId: string;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP';
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED';
  dealerResponded: boolean;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    currency: string;
    images: string[];
    mileage: number;
    transmission: string;
    fuelType: string;
    location: string;
    status: string;
    dealer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface CreateEnquiryData {
  enquiryType?: string;
  hasTradeIn?: boolean;
  tradeInDetails?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId: string;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP';
}

// ✅ Helper function to convert Mongoose document to IEnquiry
function toIEnquiry(doc: any): IEnquiry {
  return {
    id: doc._id?.toString() || doc.id || '',
    name: doc.name || '',
    email: doc.email || '',
    phone: doc.phone || '',
    message: doc.message || '',
    vehicle: doc.vehicle?.toString() || doc.vehicle || '',
    preferredContact: doc.preferredContact || 'EMAIL',
    enquiryType: doc.enquiryType || 'GENERAL_INQUIRY',
    hasTradeIn: doc.hasTradeIn || false,
    tradeInDetails: doc.tradeInDetails || '',
    status: doc.status || 'NEW',
    dealerResponded: doc.dealerResponded || false,
    respondedAt: doc.respondedAt || null,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  } as IEnquiry;
}

// ✅ Helper function to convert vehicle document to vehicle object
function toVehicleObject(doc: any) {
  return {
    id: doc._id?.toString() || doc.id || '',
    make: doc.make || '',
    model: doc.model || '',
    year: doc.year || 0,
    price: doc.price || 0,
    currency: doc.currency || 'NGN',
    images: doc.images || [],
    mileage: doc.mileage || 0,
    transmission: doc.transmission || 'Automatic',
    fuelType: doc.fuelType || 'Petrol',
    location: doc.location || 'Lagos',
    status: doc.status || 'AVAILABLE',
    dealer: {
      id: doc.dealer?._id?.toString() || doc.dealer?.id || '',
      name: doc.dealer?.name || 'Dealer',
      email: doc.dealer?.email || '',
      phone: doc.dealer?.phone || '',
    },
  };
}

export class EnquiryService {
  /**
   * Create a new enquiry
   */
  static async createEnquiry(data: CreateEnquiryData): Promise<IEnquiry> {
    const enquiry = await create(Enquiry, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      vehicle: data.vehicleId,
      preferredContact: data.preferredContact,
      enquiryType: data.enquiryType || 'GENERAL_INQUIRY',
      hasTradeIn: data.hasTradeIn || false,
      tradeInDetails: data.tradeInDetails || '',
      status: 'NEW',
      dealerResponded: false,
    });

    // Increment enquiry count on vehicle
    await update(
      Vehicle,
      { _id: data.vehicleId },
      { $inc: { enquiryCount: 1 } }
    );

    return toIEnquiry(enquiry);
  }

  /**
   * Get enquiry by ID
   */
  static async getEnquiry(id: string): Promise<EnquiryWithDetails | null> {
    const enquiry = await findById(
      Enquiry,
      id,
      undefined,
      { lean: true }
    );

    if (!enquiry) return null;

    // Get vehicle details separately
    const vehicle = await findById(
      Vehicle,
      (enquiry as any).vehicle,
      undefined,
      { lean: true }
    );

    if (!vehicle) return null;

    return {
      id: (enquiry as any)._id?.toString() || (enquiry as any).id,
      name: (enquiry as any).name,
      email: (enquiry as any).email,
      phone: (enquiry as any).phone,
      message: (enquiry as any).message,
      vehicleId: (enquiry as any).vehicleId || (enquiry as any).vehicle?.toString() || '',
      preferredContact: (enquiry as any).preferredContact,
      status: (enquiry as any).status,
      dealerResponded: (enquiry as any).dealerResponded,
      respondedAt: (enquiry as any).respondedAt,
      createdAt: (enquiry as any).createdAt,
      updatedAt: (enquiry as any).updatedAt,
      vehicle: toVehicleObject(vehicle),
    };
  }

  /**
   * Get enquiries for a user by email
   */
  static async getEnquiriesByEmail(email: string): Promise<EnquiryWithDetails[]> {
    const enquiries = await findMany(
      Enquiry,
      { email },
      undefined,
      { lean: true, sort: { createdAt: -1 } }
    );

    const results: EnquiryWithDetails[] = [];
    
    for (const enquiry of enquiries as any[]) {
      const vehicle = await findById(
        Vehicle,
        enquiry.vehicle,
        undefined,
        { lean: true }
      );
      
      if (vehicle) {
        results.push({
          id: enquiry._id?.toString() || enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          message: enquiry.message,
          vehicleId: enquiry.vehicleId || enquiry.vehicle?.toString() || '',
          preferredContact: enquiry.preferredContact,
          status: enquiry.status,
          dealerResponded: enquiry.dealerResponded,
          respondedAt: enquiry.respondedAt,
          createdAt: enquiry.createdAt,
          updatedAt: enquiry.updatedAt,
          vehicle: toVehicleObject(vehicle),
        });
      }
    }

    return results;
  }

  /**
   * Get enquiries for a dealer (by vehicle dealer)
   */
  static async getEnquiriesByDealer(dealerId: string): Promise<EnquiryWithDetails[]> {
    // First find all vehicles by this dealer
    const vehicles = await findMany(
      Vehicle,
      { dealer: dealerId },
      undefined,
      { lean: true }
    );

    const vehicleIds = vehicles.map((v: any) => v._id);

    if (vehicleIds.length === 0) {
      return [];
    }

    const enquiries = await findMany(
      Enquiry,
      { vehicle: { $in: vehicleIds } },
      undefined,
      { lean: true, sort: { createdAt: -1 } }
    );

    const results: EnquiryWithDetails[] = [];
    
    for (const enquiry of enquiries as any[]) {
      const vehicle = await findById(
        Vehicle,
        enquiry.vehicle,
        undefined,
        { lean: true }
      );
      
      if (vehicle) {
        results.push({
          id: enquiry._id?.toString() || enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          message: enquiry.message,
          vehicleId: enquiry.vehicleId || enquiry.vehicle?.toString() || '',
          preferredContact: enquiry.preferredContact,
          status: enquiry.status,
          dealerResponded: enquiry.dealerResponded,
          respondedAt: enquiry.respondedAt,
          createdAt: enquiry.createdAt,
          updatedAt: enquiry.updatedAt,
          vehicle: toVehicleObject(vehicle),
        });
      }
    }

    return results;
  }

  /**
   * Update enquiry status
   */
  static async updateStatus(
    enquiryId: string,
    status: 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'CANCELLED'
  ): Promise<IEnquiry | null> {
    const result = await update(
      Enquiry,
      { _id: enquiryId },
      { 
        status,
        ...(status === 'CONTACTED' ? { dealerResponded: true, respondedAt: new Date() } : {}),
      }
    );
    
    return result ? toIEnquiry(result) : null;
  }

  /**
   * Mark enquiry as read by dealer
   */
  static async markAsRead(enquiryId: string): Promise<IEnquiry | null> {
    const result = await update(
      Enquiry,
      { _id: enquiryId },
      { dealerResponded: true, respondedAt: new Date() }
    );
    
    return result ? toIEnquiry(result) : null;
  }

  /**
   * Get enquiry statistics for a dealer
   */
  static async getDealerStats(dealerId: string): Promise<{
    total: number;
    new: number;
    contacted: number;
    negotiating: number;
    closed: number;
    cancelled: number;
  }> {
    // First find all vehicles by this dealer
    const vehicles = await findMany(
      Vehicle,
      { dealer: dealerId },
      undefined,
      { lean: true }
    );

    const vehicleIds = vehicles.map((v: any) => v._id);

    if (vehicleIds.length === 0) {
      return {
        total: 0,
        new: 0,
        contacted: 0,
        negotiating: 0,
        closed: 0,
        cancelled: 0,
      };
    }

    const stats = await aggregate(Enquiry as any, [
      { $match: { vehicle: { $in: vehicleIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      new: 0,
      contacted: 0,
      negotiating: 0,
      closed: 0,
      cancelled: 0,
    };

    stats.forEach((stat: any) => {
      const key = stat._id.toLowerCase();
      if (key in result) {
        (result as any)[key] = stat.count;
        result.total += stat.count;
      }
    });

    return result;
  }

  /**
   * Delete an enquiry (soft delete)
   */
  static async deleteEnquiry(enquiryId: string): Promise<boolean> {
    try {
      // First get the enquiry to find the vehicle
      const enquiry = await findById(Enquiry, enquiryId, undefined, { lean: true });
      
      if (!enquiry) {
        return false;
      }

      // Soft delete the enquiry
      await update(
        Enquiry,
        { _id: enquiryId },
        { isDeleted: true, deletedAt: new Date() }
      );
      
      // Decrement enquiry count on vehicle
      if ((enquiry as any).vehicle) {
        await update(
          Vehicle,
          { _id: (enquiry as any).vehicle },
          { $inc: { enquiryCount: -1 } }
        );
      }

      return true;
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      return false;
    }
  }
}

export default EnquiryService;