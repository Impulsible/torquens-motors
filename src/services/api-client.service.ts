/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { Vehicle } from "@/models/Vehicle";
import type { IVehicle } from "@/types";
import {
  findOne,
  findMany,
  create,
  update,
  deleteOne,
  type PaginationOptions,
  type PaginatedResult,
} from './database';

export interface ExternalVehicleAPI {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
}

export interface VehicleImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  vehicles: IVehicle[];
}

export class APIClientService {
  private static apis: ExternalVehicleAPI[] = [];

  /**
   * Register an external API for vehicle data
   */
  static registerAPI(api: ExternalVehicleAPI): void {
    this.apis.push(api);
  }

  /**
   * Get all registered APIs
   */
  static getAPIs(): ExternalVehicleAPI[] {
    return this.apis;
  }

  /**
   * Import vehicles from all registered APIs
   */
  static async importVehiclesFromAllAPIs(
    dealerId: string,
  ): Promise<VehicleImportResult[]> {
    const results: VehicleImportResult[] = [];

    for (const api of this.apis) {
      if (!api.enabled) continue;

      try {
        const result = await this.importVehiclesFromAPI(api, dealerId);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          imported: 0,
          failed: 1,
          errors: [error instanceof Error ? error.message : "Unknown error"],
          vehicles: [],
        });
      }
    }

    return results;
  }

  /**
   * Import vehicles from a specific API
   */
  static async importVehiclesFromAPI(
    api: ExternalVehicleAPI,
    dealerId: string,
  ): Promise<VehicleImportResult> {
    const errors: string[] = [];
    const importedVehicles: IVehicle[] = [];

    try {
      // Fetch vehicles from external API
      const response = await fetch(`${api.baseUrl}/vehicles`, {
        headers: api.apiKey
          ? {
              Authorization: `Bearer ${api.apiKey}`,
              "Content-Type": "application/json",
            }
          : {},
      });

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Transform external data to our format
      const vehicles = this.transformExternalData(data.vehicles || data);

      for (const vehicleData of vehicles) {
        try {
          // Check if vehicle already exists by VIN or external ID
          const existing = await findOne(Vehicle as any, {
            $or: [
              { externalId: vehicleData.externalId },
              { vin: vehicleData.vin },
            ],
          });

          if (existing) {
            // Update existing vehicle
            const updated = await update(
              Vehicle as any,
              { _id: (existing as any)._id || (existing as any).id },
              {
                ...vehicleData,
                dealer: dealerId,
                status: "PENDING_REVIEW",
                updatedAt: new Date(),
              },
            );
            if (updated) {
              importedVehicles.push(updated as IVehicle);
            }
          } else {
            // Create new vehicle
            const created = await create(Vehicle as any, {
              ...vehicleData,
              dealer: dealerId,
              status: "PENDING_REVIEW",
              externalSource: api.id,
              importedAt: new Date(),
            });
            importedVehicles.push(created as IVehicle);
          }
        } catch (error) {
          errors.push(
            `Failed to import vehicle: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      return {
        success: errors.length === 0,
        imported: importedVehicles.length,
        failed: errors.length,
        errors,
        vehicles: importedVehicles,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        vehicles: [],
      };
    }
  }

  /**
   * Transform external API data to our vehicle format
   * This mapping will vary based on your specific API
   */
  static transformExternalData(externalVehicles: any[]): any[] {
    return externalVehicles.map((v) => ({
      // Map external fields to our schema
      externalId: v.id || v.vehicleId || v.externalId,
      make: v.make || v.brand || v.manufacturer,
      model: v.model || v.vehicleModel,
      year: parseInt(v.year || v.modelYear || v.registrationYear),
      price: parseFloat(v.price || v.askingPrice || v.sellingPrice),
      currency: v.currency || "NGN",
      mileage: parseInt(v.mileage || v.odometer || v.kilometers),
      transmission: this.mapTransmission(v.transmission || v.gearbox),
      fuelType: this.mapFuelType(v.fuelType || v.fuel || v.engineType),
      engine: v.engine || v.engineSize || `${v.engineCapacity}L`,
      horsepower: parseInt(v.horsepower || v.power || v.bhp),
      drivetrain: this.mapDrivetrain(v.drivetrain || v.driveType),
      bodyType: this.mapBodyType(v.bodyType || v.type || v.category),
      location: v.location || v.city || v.state || "Nigeria",
      images: v.images || v.photos || [],
      features: v.features || v.options || [],
      description: v.description || v.notes || "",
      vin: v.vin || v.chassisNumber || v.vehicleIdentificationNumber,
      externalSource: "external_api",
    }));
  }

  static mapTransmission(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes("auto")) return "Automatic";
    if (lower.includes("man")) return "Manual";
    if (lower.includes("semi")) return "Semi-Automatic";
    return "Automatic";
  }

  static mapFuelType(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes("petrol") || lower.includes("gas")) return "Petrol";
    if (lower.includes("diesel")) return "Diesel";
    if (lower.includes("electric")) return "Electric";
    if (lower.includes("hybrid")) return "Hybrid";
    return "Petrol";
  }

  static mapDrivetrain(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes("awd") || lower.includes("all wheel")) return "AWD";
    if (lower.includes("4wd") || lower.includes("4 wheel")) return "4WD";
    if (lower.includes("rwd") || lower.includes("rear")) return "RWD";
    return "FWD";
  }

  static mapBodyType(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes("suv") || lower.includes("sav")) return "SUV";
    if (lower.includes("sedan") || lower.includes("saloon")) return "Sedan";
    if (lower.includes("coupe")) return "Coupe";
    if (lower.includes("convert") || lower.includes("cabrio"))
      return "Convertible";
    if (lower.includes("wagon") || lower.includes("estate")) return "Wagon";
    if (lower.includes("hatch")) return "Hatchback";
    return "SUV";
  }

  /**
   * Get vehicle details from external API by VIN
   */
  static async getVehicleByVIN(vin: string): Promise<any | null> {
    // Try each registered API
    for (const api of this.apis) {
      if (!api.enabled) continue;

      try {
        const response = await fetch(`${api.baseUrl}/vehicles/vin/${vin}`, {
          headers: api.apiKey
            ? {
                Authorization: `Bearer ${api.apiKey}`,
              }
            : {},
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error(`Failed to fetch VIN from ${api.name}:`, error);
      }
    }

    return null;
  }

  /**
   * Sync vehicles from external API on a schedule
   */
  static async syncVehicles(dealerId: string): Promise<VehicleImportResult> {
    // This would be called by a cron job or background task
    // For now, it's a manual trigger
    const results = await this.importVehiclesFromAllAPIs(dealerId);

    // Aggregate results
    const total = results.reduce((acc, r) => acc + r.imported, 0);
    const failed = results.reduce((acc, r) => acc + r.failed, 0);
    const errors = results.flatMap((r) => r.errors);

    return {
      success: failed === 0,
      imported: total,
      failed,
      errors,
      vehicles: results.flatMap((r) => r.vehicles),
    };
  }
}

export default APIClientService;