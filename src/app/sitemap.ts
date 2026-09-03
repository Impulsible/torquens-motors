/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from "next";
import { getVehicles } from "@/services/vehicle.service";
import { CollectionService } from "@/services/collection.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || "https://torquens-motors.vercel.app/";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Vehicle pages
  let vehiclePages: MetadataRoute.Sitemap = [];
  try {
    // ✅ Fix: Use getVehicles instead of VehicleService.getAllPublished
    const result = await getVehicles(
      { status: "PUBLISHED" },
      { page: 1, limit: 1000 },
    );
    const vehicles = result.data || [];

    vehiclePages = vehicles.map((vehicle: any) => ({
      url: `${baseUrl}/vehicles/${vehicle.slug}`,
      lastModified: new Date(vehicle.updatedAt || vehicle.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching vehicles for sitemap:", error);
  }

  // Collection pages
  let collectionPages: MetadataRoute.Sitemap = [];
  try {
    // ✅ Fix: Use getPublishedCollections instead of getAllPublished
    await CollectionService.getPublishedCollections(1, 1000);
    const collections: any[] = [];

    collectionPages = collections.map((collection: any) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: new Date(collection.updatedAt || collection.createdAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching collections for sitemap:", error);
  }

  return [...staticPages, ...vehiclePages, ...collectionPages];
}
