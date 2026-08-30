import { NextRequest, NextResponse } from 'next/server';
import { APIClientService } from '@/services/api-client.service';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';

// External API Configuration
const YOUR_CAR_API = {
  id: 'my-car-api',
  name: 'My Car API',
  baseUrl: process.env.CAR_API_URL || 'https://api.example.com',
  apiKey: process.env.CAR_API_KEY,
  enabled: true,
};

// Register the API on server initialization
if (typeof window === 'undefined') {
  APIClientService.registerAPI(YOUR_CAR_API);
}

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
    const { dealerId, syncAll = false } = body;

    const targetDealerId = dealerId || (session.user as { id?: string }).id;

    if (!targetDealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    let result;
    if (syncAll) {
      result = await APIClientService.syncVehicles(targetDealerId);
    } else {
      const apis = APIClientService.getAPIs();
      const api = apis.find((a) => a.enabled);
      if (!api) {
        return NextResponse.json(
          { error: 'No enabled external API configured' },
          { status: 404 }
        );
      }
      result = await APIClientService.importVehiclesFromAPI(api, targetDealerId);
    }

    return NextResponse.json(result);
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
    const vin = searchParams.get('vin');

    if (vin) {
      const vehicle = await APIClientService.getVehicleByVIN(vin);
      if (!vehicle) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(vehicle);
    }

    const apis = APIClientService.getAPIs();
    return NextResponse.json({ apis });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    );
  }
}