/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { CarQueryService } from '@/services/carquery.service';
import { Vehicle } from '@/models/Vehicle';
import DatabaseService from '@/services/database';

const carQuery: any = CarQueryService;

// Instead of APIClientService, we'll use CarQueryService directly
// since it's a free API with no authentication needed

export async function POST(request: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to import vehicles' },
        { status: 401 }
      );
    }

    // 2. Role-Based Access Control
    const userRole = (session.user as { role?: string }).role?.toUpperCase();
    if (!userRole || !['DEALER', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden - Only verified dealers and admins can import vehicles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { make, model, year, bodyType, count = 10 } = body;

    // 3. Fetch vehicles from CarQuery API
    let vehicles: any[] = [];
    if (typeof carQuery.searchVehicles === 'function') {
      vehicles = await carQuery.searchVehicles({
        make: make || undefined,
        model: model || undefined,
        year: year ? parseInt(year, 10) : undefined,
        bodyType: bodyType || undefined,
      });
    } else if (typeof carQuery.getLuxuryVehicles === 'function') {
      vehicles = await carQuery.getLuxuryVehicles({
        make: make || undefined,
        model: model || undefined,
        limit: count,
      });
    }

    // Limit the number of vehicles to import
    const limitedVehicles = Array.isArray(vehicles) ? vehicles.slice(0, count) : [];

    // 4. Import vehicles to database
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const vehicle of limitedVehicles) {
      try {
        // Check if vehicle already exists
        const existing = await DatabaseService.findOne(Vehicle as any, {
          $or: [
            { externalId: vehicle.id },
            { vin: vehicle.vin },
            { slug: vehicle.slug },
          ],
        });

        if (!existing) {
          // Create new vehicle
          await (Vehicle as any).create({
            ...vehicle,
            dealer: (session.user as any).id,
            status: 'PENDING_REVIEW',
            verified: 'PENDING',
            externalSource: 'carquery-api',
            importedAt: new Date(),
          });
          imported++;
        } else {
          // Update existing vehicle
          await DatabaseService.update(
            Vehicle as any,
            { _id: (existing as any)._id },
            {
              ...vehicle,
              updatedAt: new Date(),
              lastSyncAt: new Date(),
            }
          );
          // Count as imported since it was updated
          imported++;
        }
      } catch (error) {
        failed++;
        errors.push(`Failed to import ${vehicle.make} ${vehicle.model}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      errors,
      total: limitedVehicles.length,
      message: `Successfully imported ${imported} vehicles from CarQuery API`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'info';

    switch (action) {
      case 'makes': {
        // Get all available makes from CarQuery
        const makes = typeof carQuery.getMakes === 'function' ? await carQuery.getMakes() : [];
        return NextResponse.json({ makes });
      }

      case 'models': {
        const make = searchParams.get('make');
        if (!make) {
          return NextResponse.json(
            { error: 'Make parameter is required for models' },
            { status: 400 }
          );
        }
        const models = typeof carQuery.getModels === 'function' ? await carQuery.getModels(make) : [];
        return NextResponse.json({ models });
      }

      case 'search': {
        const make = searchParams.get('make') || '';
        const model = searchParams.get('model') || '';
        const year = searchParams.get('year');
        
        let vehicles: any[] = [];
        if (typeof carQuery.searchVehicles === 'function') {
          vehicles = await carQuery.searchVehicles({
            make: make || undefined,
            model: model || undefined,
            year: year ? parseInt(year, 10) : undefined,
          });
        } else if (typeof carQuery.getLuxuryVehicles === 'function') {
          vehicles = await carQuery.getLuxuryVehicles({
            make: make || undefined,
            model: model || undefined,
            limit: 50,
          });
        }

        return NextResponse.json({ vehicles, total: (vehicles || []).length });
      }

      case 'popular': {
        const limit = parseInt(searchParams.get('limit') || '6', 10);
        let vehicles: any[] = [];
        if (typeof carQuery.getPopularVehicles === 'function') {
          vehicles = await carQuery.getPopularVehicles(limit);
        } else if (typeof carQuery.getFeaturedLuxuryVehicles === 'function') {
          vehicles = await carQuery.getFeaturedLuxuryVehicles(limit);
        }
        return NextResponse.json({ vehicles });
      }

      case 'status': {
        // Check if CarQuery API is available
        const isAvailable = typeof carQuery.getMakes === 'function' ? await carQuery.getMakes() : [];
        return NextResponse.json({
          api: 'CarQuery API',
          status: isAvailable && isAvailable.length > 0 ? 'connected' : 'disconnected',
          makesCount: isAvailable?.length || 0,
        });
      }

      default:
        // Return API info
        return NextResponse.json({
          api: 'CarQuery API',
          description: 'Free vehicle data API',
          endpoints: {
            makes: '/api/vehicles/import?action=makes',
            models: '/api/vehicles/import?action=models&make=PORSCHE',
            search: '/api/vehicles/import?action=search&make=PORSCHE',
            popular: '/api/vehicles/import?action=popular&limit=6',
            status: '/api/vehicles/import?action=status',
          },
          note: 'All data is from the free CarQuery API - no authentication required',
        });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    );
  }
}