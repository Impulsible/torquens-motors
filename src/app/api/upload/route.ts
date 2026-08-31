import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth/config";
import { CloudinaryService } from "@/services/cloudinary.service";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only dealers and admins can upload
    if (!["DEALER", "ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "torquens/vehicles";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate files
    const invalidFiles = files.filter(
      (f) => !CloudinaryService.validateImage(f).valid,
    );
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid file(s) detected",
          invalidFiles: invalidFiles.map((f) => f.name),
        },
        { status: 400 },
      );
    }

    // Upload files
    const userId = session.user.id ?? "anonymous";
    const results = await CloudinaryService.uploadMultipleImages(files, {
      folder,
      tags: ["vehicle", userId],
    });

    return NextResponse.json({
      success: true,
      files: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only dealers and admins can delete
    if (!["DEALER", "ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 },
      );
    }

    const result = await CloudinaryService.deleteImage(publicId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 },
    );
  }
}
