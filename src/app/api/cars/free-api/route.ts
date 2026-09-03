import { NextRequest, NextResponse } from 'next/server';
import { CarQueryService } from '@/services/carquery.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'search';
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let result;

    switch (action) {
      case 'makes':
        // Get all luxury makes
        result = await CarQueryService.getLuxuryMakes();
        break;

      case 'models':
        if (!make) {
          return NextResponse.json(
            { error: 'Make parameter is required for models' },
            { status: 400 }
          );
        }
        result = await CarQueryService.getLuxuryModels(make);
        break;

      case 'popular':
        // Get featured/popular vehicles
        result = await CarQueryService.getFeaturedLuxuryVehicles(limit);
        break;

      case 'search':
      default:
        // Search for vehicles
        const vehicles = await CarQueryService.getLuxuryVehicles({
          make: make || undefined,
          model: model || undefined,
          year: year ? parseInt(year, 10) : undefined,
          limit,
        });
        
        // Filter by year range if provided
        let filteredVehicles = vehicles;
        if (minYear) {
          filteredVehicles = filteredVehicles.filter((v: { year: number; }) => v.year >= parseInt(minYear, 10));
        }
        if (maxYear) {
          filteredVehicles = filteredVehicles.filter((v: { year: number; }) => v.year <= parseInt(maxYear, 10));
        }
        
        result = {
          vehicles: filteredVehicles,
          total: filteredVehicles.length,
          limit,
        };
        break;
    }

    // Ensure we always return an array for makes
    if (action === 'makes' && !Array.isArray(result)) {
      result = [];
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('CarQuery API error:', error);
    
    // Return appropriate fallback based on action
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'search';
    
    let fallbackResult;
    switch (action) {
      case 'makes':
        fallbackResult = ['Porsche', 'Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Volvo', 'Land Rover', 'Jaguar'];
        break;
      case 'popular':
        fallbackResult = [];
        break;
      default:
        fallbackResult = { vehicles: [], total: 0 };
        break;
    }
    
    return NextResponse.json(fallbackResult, {
      status: 200, // Return 200 with fallback data instead of error
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}