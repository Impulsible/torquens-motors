/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Convert file Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary via promise stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'torquens_avatars',
          transformation: [{ width: 250, height: 250, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = uploadResult.secure_url;

    await connectToDatabase();
    
    // Update both standard "image" and custom "avatar" fields
    await User.updateOne(
      { email: session.user.email },
      { $set: { avatar: imageUrl, image: imageUrl } }
    );

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded and updated successfully.',
      url: imageUrl,
    });
  } catch (error: any) {
    console.error('❌ Cloudinary Avatar Upload Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}