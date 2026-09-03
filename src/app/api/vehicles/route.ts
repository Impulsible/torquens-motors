/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/api-security';
import { Vehicle } from '@/models/Vehicle';
import { paginate } from '@/services/database';
import { ShowroomService } from '@/services/showroom.service';
import { CarQueryService } from '@/services/carquery.service';

const carQuery: any = CarQueryService;

export async function GET(req: NextRequest) {
  return withSecurity(req, async (request) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '12', 10);
      const search = searchParams.get('search') || '';
      const make = searchParams.get('make') || '';
      const model = searchParams.get('model') || '';
      const bodyType = searchParams.get('bodyType') || '';
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');

      // Build filters
      const filters: any = {};
      if (make) filters.make = make;
      if (model) filters.model = model;
      if (bodyType) filters.bodyType = bodyType;
      if (minPrice) filters.minPrice = parseInt(minPrice, 10);
      if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);
      if (search) filters.search = search;

      // Get vehicles from the showroom (combines DB + Free API)
      const result = await ShowroomService.getShowroomVehicles(filters, page, limit);

      return NextResponse.json({
        data: result.vehicles,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      
      // Fallback: Try to get from CarQuery API directly
      try {
        const searchParams = request.nextUrl.searchParams;
        const make = searchParams.get('make') || '';
        const model = searchParams.get('model') || '';
        
        let vehicles: any[] = [];
        if (typeof carQuery.searchVehicles === 'function') {
          vehicles = await carQuery.searchVehicles({
            make: make || undefined,
            model: model || undefined,
            year: undefined,
            bodyType: undefined,
          });
        } else if (typeof carQuery.getLuxuryVehicles === 'function') {
          vehicles = await carQuery.getLuxuryVehicles({
            make: make || undefined,
            model: model || undefined,
            limit: 12,
          });
        }

        const vehiclesList = Array.isArray(vehicles) ? vehicles : [];
        
        return NextResponse.json({
          data: vehiclesList,
          pagination: {
            total: vehiclesList.length,
            page: 1,
            limit: vehiclesList.length || 12,
            totalPages: 1,
          },
        });
      } catch (fallbackError) {
        return NextResponse.json(
          { error: 'Failed to fetch vehicles' },
          { status: 500 }
        );
      }
    }
  });
}

export async function POST(req: NextRequest) {
  return withSecurity(req, async (request, session) => {
    const userRole = (session?.user as any)?.role;
    // Only dealers and admins can create vehicles
    if (!userRole || !['DEALER', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      
      const vehicle = await (Vehicle as any).create({
        ...body,
        dealer: (session?.user as any)?.id,
        status: 'DRAFT',
        // Set as verified if admin created
        verified: userRole === 'ADMIN' ? 'VERIFIED' : 'PENDING',
      });

      return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return NextResponse.json(
        { error: 'Failed to create vehicle' },
        { status: 500 }
      );
    }
  });
}