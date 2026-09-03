import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import * as SavedVehicleService from '@/services/saved-vehicle.service';

// GET /api/saved-vehicles - Get all saved vehicles for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const result = await SavedVehicleService.getSavedVehiclesPaginated(
      session.user.id,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching saved vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/saved-vehicles - Toggle save status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { vehicleId } = body;

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    const result = await SavedVehicleService.toggleSave(session.user.id, vehicleId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling save:', error);
    return NextResponse.json(
      { error: 'Failed to toggle save' },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-vehicles - Remove a saved vehicle
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    await SavedVehicleService.removeSavedVehicle(session.user.id, vehicleId);

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle removed from saved' 
    });
  } catch (error) {
    console.error('Error removing saved vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved vehicle' },
      { status: 500 }
    );
  }
}