/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
// ✅ Change: Use server-only wrapper
import { findById, update } from '@/lib/database.server';
import { Vehicle } from '@/models/Vehicle';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only dealers and admins can update
    if (!['DEALER', 'ADMIN'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // First verify the vehicle exists and the user has permission
    const vehicle = await findById(Vehicle as any, id, undefined, { lean: true });
    
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if dealer owns this vehicle (if not admin)
    if (session.user?.role !== 'ADMIN' && (vehicle as any).dealer !== session.user?.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this vehicle' },
        { status: 403 }
      );
    }

    // Update vehicle images
    const updated = await update(
      Vehicle as any,
      { _id: id },
      { images }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      images: (updated as any).images || [],
    });
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update images' },
      { status: 500 }
    );
  }
}

// OPTIONAL: DELETE endpoint to remove an image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only dealers and admins can update
    if (!['DEALER', 'ADMIN'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('image');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // First verify the vehicle exists and the user has permission
    const vehicle = await findById(Vehicle as any, id, undefined, { lean: true });
    
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if dealer owns this vehicle (if not admin)
    if (session.user?.role !== 'ADMIN' && (vehicle as any).dealer !== session.user?.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this vehicle' },
        { status: 403 }
      );
    }

    // Remove the image from the array
    const currentImages = (vehicle as any).images || [];
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

    // Update vehicle images
    const updated = await update(
      Vehicle as any,
      { _id: id },
      { images: updatedImages }
    );

    return NextResponse.json({
      success: true,
      images: (updated as any).images || [],
    });
  } catch (error) {
    console.error('Error removing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove image' },
      { status: 500 }
    );
  }
}

// OPTIONAL: POST endpoint to reorder images
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only dealers and admins can update
    if (!['DEALER', 'ADMIN'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // First verify the vehicle exists and the user has permission
    const vehicle = await findById(Vehicle as any, id, undefined, { lean: true });
    
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if dealer owns this vehicle (if not admin)
    if (session.user?.role !== 'ADMIN' && (vehicle as any).dealer !== session.user?.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this vehicle' },
        { status: 403 }
      );
    }

    // Update vehicle images with new order
    const updated = await update(
      Vehicle as any,
      { _id: id },
      { images }
    );

    return NextResponse.json({
      success: true,
      images: (updated as any).images || [],
    });
  } catch (error) {
    console.error('Error reordering images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reorder images' },
      { status: 500 }
    );
  }
}