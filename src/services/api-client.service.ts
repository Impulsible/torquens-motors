/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';

export interface ExternalVehicleAPI {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
}

export interface IVehicleData {
  _id?: string;
  externalId?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  engine?: string;
  horsepower?: number;
  drivetrain?: string;
  bodyType?: string;
  location?: string;
  images?: string[];
  features?: string[];
  description?: string;
  vin?: string;
  dealer?: string;
  status?: string;
  externalSource?: string;
  importedAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface VehicleImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  vehicles: IVehicleData[];
}

export class APIClientService {
  private static apis: ExternalVehicleAPI[] = [];

  /**
   * Register an external API for vehicle data
   */
  static registerAPI(api: ExternalVehicleAPI): void {
    const exists = this.apis.some((a) => a.id === api.id);
    if (!exists) {
      this.apis.push(api);
    } else {
      const index = this.apis.findIndex((a) => a.id === api.id);
      if (index !== -1) {
        this.apis[index] = api;
      }
    }
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
    dealerId: string
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
          errors: [error instanceof Error ? error.message : 'Unknown error'],
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
    dealerId: string
  ): Promise<VehicleImportResult> {
    const errors: string[] = [];
    const importedVehicles: IVehicleData[] = [];

    try {
      await connectToDatabase();

      const response = await fetch(`${api.baseUrl}/vehicles`, {
        headers: api.apiKey
          ? {
              Authorization: `Bearer ${api.apiKey}`,
              'Content-Type': 'application/json',
            }
          : {},
      });

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const vehicles = this.transformExternalData(data.vehicles || data);

      for (const vehicleData of vehicles) {
        try {
          const queryConditions: any[] = [];
          if (vehicleData.externalId) queryConditions.push({ externalId: vehicleData.externalId });
          if (vehicleData.vin) queryConditions.push({ vin: vehicleData.vin });

          let existing = null;
          if (queryConditions.length > 0) {
            existing = await Vehicle.findOne({ $or: queryConditions });
          }

          if (existing) {
            const updated = await Vehicle.findByIdAndUpdate(
              existing._id,
              {
                $set: {
                  ...vehicleData,
                  dealer: dealerId,
                  status: 'PENDING_REVIEW',
                  updatedAt: new Date(),
                },
              },
              { new: true, runValidators: false }
            ).lean();

            if (updated) {
              importedVehicles.push(updated as unknown as IVehicleData);
            }
          } else {
            const created = await Vehicle.create({
              ...vehicleData,
              dealer: dealerId,
              status: 'PENDING_REVIEW',
              externalSource: api.id,
              importedAt: new Date(),
            });

            if (created) {
              importedVehicles.push(created.toObject() as unknown as IVehicleData);
            }
          }
        } catch (error) {
          errors.push(
            `Failed to import vehicle: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
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
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        vehicles: [],
      };
    }
  }

  /**
   * Transform external API data to our vehicle format
   */
  static transformExternalData(externalVehicles: any[]): IVehicleData[] {
    if (!Array.isArray(externalVehicles)) return [];

    return externalVehicles.map((v) => ({
      externalId: String(v.id || v.vehicleId || v.externalId || ''),
      make: String(v.make || v.brand || v.manufacturer || 'Unknown'),
      model: String(v.model || v.vehicleModel || 'Unknown'),
      year: parseInt(v.year || v.modelYear || v.registrationYear) || new Date().getFullYear(),
      price: parseFloat(v.price || v.askingPrice || v.sellingPrice) || 0,
      currency: String(v.currency || 'NGN'),
      mileage: parseInt(v.mileage || v.odometer || v.kilometers) || 0,
      transmission: this.mapTransmission(v.transmission || v.gearbox || ''),
      fuelType: this.mapFuelType(v.fuelType || v.fuel || v.engineType || ''),
      engine: String(v.engine || v.engineSize || `${v.engineCapacity || ''}L`),
      horsepower: parseInt(v.horsepower || v.power || v.bhp) || 0,
      drivetrain: this.mapDrivetrain(v.drivetrain || v.driveType || ''),
      bodyType: this.mapBodyType(v.bodyType || v.type || v.category || ''),
      location: String(v.location || v.city || v.state || 'Nigeria'),
      images: Array.isArray(v.images) ? v.images : Array.isArray(v.photos) ? v.photos : [],
      features: Array.isArray(v.features) ? v.features : Array.isArray(v.options) ? v.options : [],
      description: String(v.description || v.notes || ''),
      vin: v.vin || v.chassisNumber || v.vehicleIdentificationNumber || undefined,
      externalSource: 'external_api',
    }));
  }

  static mapTransmission(value: string): string {
    const lower = String(value || '').toLowerCase();
    if (lower.includes('auto')) return 'Automatic';
    if (lower.includes('man')) return 'Manual';
    if (lower.includes('semi')) return 'Semi-Automatic';
    return 'Automatic';
  }

  static mapFuelType(value: string): string {
    const lower = String(value || '').toLowerCase();
    if (lower.includes('petrol') || lower.includes('gas')) return 'Petrol';
    if (lower.includes('diesel')) return 'Diesel';
    if (lower.includes('electric')) return 'Electric';
    if (lower.includes('hybrid')) return 'Hybrid';
    return 'Petrol';
  }

  static mapDrivetrain(value: string): string {
    const lower = String(value || '').toLowerCase();
    if (lower.includes('awd') || lower.includes('all wheel')) return 'AWD';
    if (lower.includes('4wd') || lower.includes('4 wheel')) return '4WD';
    if (lower.includes('rwd') || lower.includes('rear')) return 'RWD';
    return 'FWD';
  }

  static mapBodyType(value: string): string {
    const lower = String(value || '').toLowerCase();
    if (lower.includes('suv') || lower.includes('sav')) return 'SUV';
    if (lower.includes('sedan') || lower.includes('saloon')) return 'Sedan';
    if (lower.includes('coupe')) return 'Coupe';
    if (lower.includes('convert') || lower.includes('cabrio')) return 'Convertible';
    if (lower.includes('wagon') || lower.includes('estate')) return 'Wagon';
    if (lower.includes('hatch')) return 'Hatchback';
    return 'SUV';
  }

  static async getVehicleByVIN(vin: string): Promise<any | null> {
    for (const api of this.apis) {
      if (!api.enabled) continue;

      try {
        const response = await fetch(`${api.baseUrl}/vehicles/vin/${vin}`, {
          headers: api.apiKey
            ? { Authorization: `Bearer ${api.apiKey}` }
            : {},
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error(`Failed to fetch VIN from ${api.name}:`, error);
      }
    }

    return null;
  }

  static async syncVehicles(dealerId: string): Promise<VehicleImportResult> {
    const results = await this.importVehiclesFromAllAPIs(dealerId);

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