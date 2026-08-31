/* eslint-disable @typescript-eslint/no-explicit-any */
// src/actions/admin.ts
'use server';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { redirect } from 'next/navigation';

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats() {
  const session = await getServerSession(authConfig);

  // Verify admin access
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  try {
    // Import models and database functions
    const { Vehicle } = await import('@/models/Vehicle');
    const { User } = await import('@/models/User');
    const { Enquiry } = await import('@/models/Enquiry');
    const { count, aggregate } = await import('@/services/database');

    // Use type assertion for models
    const VehicleModel = Vehicle as any;
    const UserModel = User as any;
    const EnquiryModel = Enquiry as any;

    // Get vehicle stats
    const [totalVehicles, verifiedVehicles, pendingVerification] = await Promise.all([
      count(VehicleModel, {}),
      count(VehicleModel, { verified: 'VERIFIED' }),
      count(VehicleModel, { verified: 'PENDING' }),
    ]);

    // Get dealer stats
    const [totalDealers, verifiedDealers] = await Promise.all([
      count(UserModel, { role: 'DEALER' }),
      count(UserModel, { role: 'DEALER', verified: true }),
    ]);

    // Get user stats
    const totalUsers = await count(UserModel, {});

    // Get enquiry stats
    const [totalEnquiries, newEnquiries] = await Promise.all([
      count(EnquiryModel, {}),
      count(EnquiryModel, { status: 'NEW' }),
    ]);

    // Get gross market volume with proper typing
    const volumeResult = await aggregate<any>(VehicleModel, [
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const grossMarketVolume = volumeResult && volumeResult.length > 0 ? (volumeResult[0] as any).total || 0 : 0;

    // Use findMany with proper imports
    const { findMany } = await import('@/services/database');

    // Get recent vehicles
    const recentVehicles = await findMany<any>(
      VehicleModel,
      {},
      undefined,
      { lean: true, sort: { createdAt: -1 }, limit: 5 }
    );

    // Get recent dealers
    const recentDealers = await findMany<any>(
      UserModel,
      { role: 'DEALER' },
      undefined,
      { lean: true, sort: { createdAt: -1 }, limit: 5 }
    );

    return {
      success: true,
      data: {
        stats: {
          totalVehicles,
          verifiedVehicles,
          pendingVerification,
          totalDealers,
          verifiedDealers,
          totalUsers,
          totalEnquiries,
          newEnquiries,
          grossMarketVolume,
        },
        recentVehicles: recentVehicles.map((v: any) => ({
          id: v._id?.toString() || v.id || '',
          make: v.make || '',
          model: v.model || '',
          year: v.year || 0,
          status: v.status || 'PENDING',
          verified: v.verified || 'PENDING',
          dealer: v.dealer?.name || 'Unknown',
          createdAt: v.createdAt || new Date().toISOString(),
        })),
        recentDealers: recentDealers.map((d: any) => ({
          id: d._id?.toString() || d.id || '',
          name: d.name || '',
          email: d.email || '',
          verified: d.verified || false,
          vehiclesCount: d.vehiclesCount || 0,
          joinedAt: d.createdAt || new Date().toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      success: false,
      message: 'Failed to fetch admin dashboard data',
    };
  }
}

/**
 * Get pending vehicle verifications
 */
export async function getPendingVerifications() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');
    const { findMany } = await import('@/services/database');

    const pendingVehicles = await findMany<any>(
      Vehicle as any,
      { verified: 'PENDING' },
      undefined,
      { lean: true, sort: { createdAt: -1 } }
    );

    return {
      success: true,
      data: pendingVehicles.map((v: any) => ({
        id: v._id?.toString() || v.id || '',
        make: v.make || '',
        model: v.model || '',
        year: v.year || 0,
        price: v.price || 0,
        currency: v.currency || 'NGN',
        images: v.images || [],
        dealer: {
          id: v.dealer?._id?.toString() || v.dealer?.id || '',
          name: v.dealer?.name || 'Unknown Dealer',
          email: v.dealer?.email || '',
        },
        vin: v.vin || '',
        submittedAt: v.createdAt || new Date().toISOString(),
        documents: v.documents || ['Proof of Ownership', 'Customs Title', 'Inspection Stamp'],
      })),
    };
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return { success: false, message: 'Failed to fetch pending verifications', data: [] };
  }
}

/**
 * Verify or reject a vehicle listing
 */
export async function verifyVehicleListing(vehicleId: string, action: 'approve' | 'reject') {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');
    const { update } = await import('@/services/database');
    const { revalidatePath } = await import('next/cache');

    const status = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    const vehicleStatus = action === 'approve' ? 'PUBLISHED' : 'ARCHIVED';

    await update(
      Vehicle as any,
      { _id: vehicleId },
      { 
        verified: status,
        status: vehicleStatus,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      }
    );

    revalidatePath('/admin/verification');
    revalidatePath('/vehicles');
    revalidatePath(`/vehicles/${vehicleId}`);

    return { success: true, message: `Vehicle ${action === 'approve' ? 'verified' : 'rejected'} successfully` };
  } catch (error) {
    console.error('Error verifying vehicle:', error);
    return { success: false, message: 'Failed to verify vehicle' };
  }
}

/**
 * Get all dealers for admin panel
 */
export async function getAdminDealers() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const { User } = await import('@/models/User');
    const { findMany } = await import('@/services/database');

    const dealers = await findMany<any>(
      User as any,
      { role: 'DEALER' },
      undefined,
      { lean: true, sort: { createdAt: -1 } }
    );

    return {
      success: true,
      data: dealers.map((d: any) => ({
        id: d._id?.toString() || d.id || '',
        name: d.name || '',
        email: d.email || '',
        phone: d.phone || '',
        location: d.location || '',
        verified: d.verified || false,
        vehiclesCount: d.vehiclesCount || 0,
        activeEnquiriesCount: d.activeEnquiriesCount || 0,
        rating: d.rating || 0,
        totalReviews: d.totalReviews || 0,
        joinedAt: d.createdAt || new Date().toISOString(),
        licenseNumber: d.licenseNumber || '',
      })),
    };
  } catch (error) {
    console.error('Error fetching dealers:', error);
    return { success: false, message: 'Failed to fetch dealers', data: [] };
  }
}

/**
 * Toggle dealer verification status
 */
export async function toggleDealerVerification(dealerId: string, verified: boolean) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { User } = await import('@/models/User');
    const { update } = await import('@/services/database');
    const { revalidatePath } = await import('next/cache');

    await update(
      User as any,
      { _id: dealerId },
      { 
        verified: verified,
        verifiedBy: session.user.id,
        verifiedAt: verified ? new Date() : null,
      }
    );

    revalidatePath('/admin/dealers');
    revalidatePath('/dealer');
    revalidatePath('/vehicles');

    return { 
      success: true, 
      message: verified 
        ? 'Dealer verified successfully' 
        : 'Dealer verification revoked' 
    };
  } catch (error) {
    console.error('Error toggling dealer verification:', error);
    return { success: false, message: 'Failed to update dealer status' };
  }
}

/**
 * Get single dealer details for admin
 */
export async function getAdminDealerById(dealerId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized', data: null };
  }

  try {
    const { User } = await import('@/models/User');
    const { findById } = await import('@/services/database');

    const dealer = await findById<any>(
      User as any,
      dealerId,
      undefined,
      { lean: true }
    );

    if (!dealer) {
      return { success: false, message: 'Dealer not found', data: null };
    }

    return {
      success: true,
      data: {
        id: dealer._id?.toString() || dealer.id || '',
        name: dealer.name || '',
        email: dealer.email || '',
        phone: dealer.phone || '',
        location: dealer.location || '',
        verified: dealer.verified || false,
        vehiclesCount: dealer.vehiclesCount || 0,
        activeEnquiriesCount: dealer.activeEnquiriesCount || 0,
        rating: dealer.rating || 0,
        totalReviews: dealer.totalReviews || 0,
        joinedAt: dealer.createdAt || new Date().toISOString(),
        licenseNumber: dealer.licenseNumber || '',
        description: dealer.description || '',
        logo: dealer.logo || '',
        coverImage: dealer.coverImage || '',
        socialLinks: dealer.socialLinks || {},
      },
    };
  } catch (error) {
    console.error('Error fetching dealer:', error);
    return { success: false, message: 'Failed to fetch dealer', data: null };
  }
}

/**
 * Update dealer details
 */
export async function updateAdminDealer(dealerId: string, data: Record<string, any>) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const { User } = await import('@/models/User');
    const { update } = await import('@/services/database');
    const { revalidatePath } = await import('next/cache');

    const updated = await update(
      User as any,
      { _id: dealerId },
      data
    );

    revalidatePath('/admin/dealers');
    revalidatePath(`/admin/dealers/${dealerId}`);

    return { 
      success: true, 
      data: updated,
      message: 'Dealer updated successfully' 
    };
  } catch (error) {
    console.error('Error updating dealer:', error);
    return { success: false, message: 'Failed to update dealer' };
  }
}

/**
 * Get vehicle for admin inspection
 */
export async function getAdminVehicle(vehicleId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized', data: null };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');
    const { findById } = await import('@/services/database');

    const vehicle = await findById<any>(
      Vehicle as any,
      vehicleId,
      undefined,
      { lean: true }
    );

    if (!vehicle) {
      return { success: false, message: 'Vehicle not found', data: null };
    }

    return {
      success: true,
      data: {
        id: vehicle._id?.toString() || vehicle.id || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || 0,
        price: vehicle.price || 0,
        currency: vehicle.currency || 'NGN',
        mileage: vehicle.mileage || 0,
        vin: vehicle.vin || '',
        images: vehicle.images || [],
        transmission: vehicle.transmission || '',
        fuelType: vehicle.fuelType || '',
        bodyType: vehicle.bodyType || '',
        location: vehicle.location || '',
        description: vehicle.description || '',
        status: vehicle.status || 'PENDING',
        verified: vehicle.verified || 'PENDING',
        dealer: vehicle.dealer || '',
        createdAt: vehicle.createdAt || new Date().toISOString(),
        updatedAt: vehicle.updatedAt || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return { success: false, message: 'Failed to fetch vehicle', data: null };
  }
}

/**
 * Get all vehicles for admin
 */
export async function getAdminVehicles() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, message: 'Unauthorized', data: [] };
  }

  try {
    const { Vehicle } = await import('@/models/Vehicle');
    const { findMany } = await import('@/services/database');

    const vehicles = await findMany<any>(
      Vehicle as any,
      {},
      undefined,
      { lean: true, sort: { createdAt: -1 } }
    );

    return {
      success: true,
      data: vehicles.map((v: any) => ({
        id: v._id?.toString() || v.id || '',
        make: v.make || '',
        model: v.model || '',
        year: v.year || 0,
        price: v.price || 0,
        currency: v.currency || 'NGN',
        mileage: v.mileage || 0,
        vin: v.vin || '',
        images: v.images || [],
        transmission: v.transmission || '',
        fuelType: v.fuelType || '',
        bodyType: v.bodyType || '',
        location: v.location || '',
        status: v.status || 'PENDING',
        verified: v.verified || 'PENDING',
        dealer: v.dealer?.name || 'Unknown',
        createdAt: v.createdAt || new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return { success: false, message: 'Failed to fetch vehicles', data: [] };
  }
}