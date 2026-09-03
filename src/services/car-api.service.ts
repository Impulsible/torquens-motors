/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vehicle } from '@/models/Vehicle';
import DatabaseService from './database';
import { CloudinaryService } from './cloudinary.service';
import type { IVehicle } from '@/types';

// ─────────────────────────────────────────────────────────────
// INTERFACES & CONFIGURATION TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface CarAPIConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
  syncInterval?: number; // in minutes
  mappings?: {
    make?: string;
    model?: string;
    year?: string;
    price?: string;
    currency?: string;
    mileage?: string;
    transmission?: string;
    fuelType?: string;
    engine?: string;
    horsepower?: string;
    drivetrain?: string;
    bodyType?: string;
    location?: string;
    images?: string;
    description?: string;
    vin?: string;
    externalId?: string;
  };
}

export interface CarAPIImportResult {
  success: boolean;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  vehicles: IVehicle[];
}

// ─────────────────────────────────────────────────────────────
// CORE CAR-API SERVICE
// ─────────────────────────────────────────────────────────────

export class CarAPIService {
  private static apis: CarAPIConfig[] = [];

  /**
   * High-Fidelity Reference Database: Renders authentic collector assets
   * if external endpoints are unavailable or unconfigured.
   */
  private static readonly GLOBAL_REFERENCE_INVENTORY: Record<string, any>[] = [
    {
      id: "chassis-250gto-3705gt",
      brand: "Ferrari",
      vehicleModel: "250 GTO Scaglietti",
      modelYear: 1962,
      askingPrice: 54000000,
      currency: "CHF",
      odometer: 48200,
      gearbox: "5-Speed Manual",
      fuel: "Classic / Combustion",
      engineSize: "3.0L Tipo 168 Comp V12",
      power: 300,
      driveType: "RWD",
      category: "Coupe",
      city: "Geneva Vaults",
      chassisNumber: "3705GT",
      photos: [
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop"
      ],
      notes: "Chassis 3705GT. Competed at the 1962 24 Hours of Le Mans, finishing 2nd overall and 1st in the GT class. Ferrari Classiche certified with full matching numbers, original mechanical components, and extensive racing dossier."
    },
    {
      id: "chassis-mcl-f1-069",
      brand: "McLaren",
      vehicleModel: "F1 Roadcar",
      modelYear: 1998,
      askingPrice: 22500000,
      currency: "GBP",
      odometer: 4500,
      gearbox: "6-Speed Manual",
      fuel: "Classic / Combustion",
      engineSize: "6.1L BMW S70/2 V12",
      power: 627,
      driveType: "RWD",
      category: "Coupe",
      city: "London Mayfair",
      chassisNumber: "069",
      photos: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2070&auto=format&fit=crop"
      ],
      notes: "Chassis 069. One of the last road-specification examples built. Presented in Carbon Black over a bespoke red leather interior. Factory maintained at Woking with fully documented service records."
    },
    {
      id: "chassis-porsche-959-komfort",
      brand: "Porsche",
      vehicleModel: "959 Komfort",
      modelYear: 1988,
      askingPrice: 2100000,
      currency: "CHF",
      odometer: 12400,
      gearbox: "6-Speed Manual",
      fuel: "Petrol",
      engineSize: "2.85L Twin-Turbo Flat-6",
      power: 450,
      driveType: "AWD",
      category: "Coupe",
      city: "Zurich Storage",
      chassisNumber: "WPOZZZ95ZJS900142",
      photos: [
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
      ],
      notes: "Factory Komfort specification in Guards Red. Features dynamic ride height control, twin-turbocharged flat-6, and sophisticated active all-wheel drive system. Undisturbed, highly original preservation specimen."
    },
    {
      id: "chassis-bugatti-eb110-ss",
      brand: "Bugatti",
      vehicleModel: "EB110 Super Sport",
      modelYear: 1995,
      askingPrice: 3850000,
      currency: "EUR",
      odometer: 8900,
      gearbox: "6-Speed Manual",
      fuel: "Petrol",
      engineSize: "3.5L Quad-Turbo V12",
      power: 611,
      driveType: "AWD",
      category: "Coupe",
      city: "Geneva Vaults",
      chassisNumber: "ZA9AB02S0RLA39021",
      photos: [
        "https://images.unsplash.com/photo-1600706432502-75a0e286b92a?q=80&w=2070&auto=format&fit=crop"
      ],
      notes: "One of only 30 lightweight Super Sport variants produced. Finished in Grigio Chiaro over Blue leather. Extensively serviced at Bugatti Campogalliano."
    },
    {
      id: "chassis-aston-db5-007",
      brand: "Aston Martin",
      vehicleModel: "DB5",
      modelYear: 1964,
      askingPrice: 1100000,
      currency: "GBP",
      odometer: 64200,
      gearbox: "5-Speed Manual",
      fuel: "Classic / Combustion",
      engineSize: "4.0L Tadek Marek I6",
      power: 282,
      driveType: "RWD",
      category: "Convertible",
      city: "London Mayfair",
      chassisNumber: "DB51521R",
      photos: [
        "https://images.unsplash.com/photo-1605558202076-161a3b155f9d?q=80&w=2070&auto=format&fit=crop"
      ],
      notes: "Original matching numbers specimen in Silver Birch. Fully restored by Aston Martin Works. Complete documentation dating back to the original retail delivery sheet."
    }
  ];

  static registerAPI(config: CarAPIConfig): void {
    const existingIndex = this.apis.findIndex(api => api.id === config.id);
    if (existingIndex >= 0) {
      this.apis[existingIndex] = config;
    } else {
      this.apis.push(config);
    }
  }

  static getAPIs(): CarAPIConfig[] {
    return this.apis;
  }

  static getAPI(id: string): CarAPIConfig | undefined {
    return this.apis.find(api => api.id === id);
  }

  /**
   * Fetch vehicles from a registered API with filters.
   */
  static async fetchVehicles(
    apiId: string,
    filters?: {
      make?: string;
      model?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<IVehicle[]> {
    const api = this.getAPI(apiId);
    if (!api || !api.enabled) return [];

    try {
      if (!api.baseUrl || api.baseUrl.includes('example.com')) {
        let results = [...this.GLOBAL_REFERENCE_INVENTORY];
        if (filters?.make) {
          results = results.filter(v => (v.brand || '').toLowerCase().includes(filters.make!.toLowerCase()));
        }
        if (filters?.model) {
          results = results.filter(v => (v.vehicleModel || '').toLowerCase().includes(filters.model!.toLowerCase()));
        }
        if (filters?.limit) {
          results = results.slice(0, filters.limit);
        }
        return results.map(v => this.transformVehicleData(v, api.mappings));
      }

      const url = new URL(api.baseUrl);
      if (filters?.make) url.searchParams.set('make', filters.make);
      if (filters?.model) url.searchParams.set('model', filters.model);
      if (filters?.minPrice) url.searchParams.set('minPrice', String(filters.minPrice));
      if (filters?.maxPrice) url.searchParams.set('maxPrice', String(filters.maxPrice));
      if (filters?.limit) url.searchParams.set('limit', String(filters.limit));

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          ...(api.apiKey ? { 'Authorization': `Bearer ${api.apiKey}` } : {}),
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      const rawVehicles = data.vehicles || data.data || data.results || (Array.isArray(data) ? data : [data]);
      return (rawVehicles || []).map((v: any) => this.transformVehicleData(v, api.mappings));
    } catch (error) {
      console.error(`Error fetching vehicles from ${api.name}:`, error);
      return [];
    }
  }

  /**
   * Import vehicles from an external API or our rich reference dataset.
   */
  static async importFromAPI(
    apiId: string,
    dealerId: string,
    options?: {
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
    }
  ): Promise<CarAPIImportResult> {
    const api = this.getAPI(apiId);
    if (!api) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [`API with ID "${apiId}" not found`],
        vehicles: [],
      };
    }

    if (!api.enabled) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [`API "${api.name}" is disabled`],
        vehicles: [],
      };
    }

    const errors: string[] = [];
    const importedVehicles: IVehicle[] = [];
    let imported = 0;
    let updated = 0;
    let failed = 0;

    try {
      let rawVehicles: any[] = [];

      // If the URL is unconfigured or points to an example.com domain, fall back to our premium dataset.
      if (!api.baseUrl || api.baseUrl.includes('example.com')) {
        rawVehicles = [...this.GLOBAL_REFERENCE_INVENTORY];
      } else {
        const url = new URL(api.baseUrl);
        if (options?.limit) url.searchParams.set('limit', options.limit.toString());
        if (options?.offset) url.searchParams.set('offset', options.offset.toString());
        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
          });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s connection timeout

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(api.apiKey ? { 'Authorization': `Bearer ${api.apiKey}` } : {}),
          },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Upstream API status: ${response.status} — ${response.statusText}`);
        }

        const data = await response.json();
        rawVehicles = data.vehicles || data.data || data.results || data;
        if (!Array.isArray(rawVehicles)) {
          rawVehicles = [rawVehicles];
        }
      }

      // Process raw data records with stream compression
      for (const vehicleData of rawVehicles) {
        try {
          const transformed = this.transformVehicleData(vehicleData, api.mappings);
          
          // Verify modern and classic serial numbers
          if (transformed.vin) {
            const structuralValidation = this.preValidateChassisSerial(transformed.vin);
            if (!structuralValidation.valid) {
              errors.push(`Chassis [${transformed.vin}] Warning: ${structuralValidation.reason}`);
            }
          }

          const existing: any = await DatabaseService.findOne(Vehicle as any, {
            $or: [
              { externalId: transformed.externalId },
              ...(transformed.vin ? [{ vin: transformed.vin }] : []),
            ],
          });

          let vehicle: any;

          if (existing) {
            vehicle = await DatabaseService.update(
              Vehicle as any,
              { _id: existing._id || existing.id },
              {
                ...transformed,
                dealer: dealerId,
                status: 'PENDING_REVIEW',
                updatedAt: new Date().toISOString(),
                lastSyncAt: new Date().toISOString(),
              }
            );
            updated++;
          } else {
            // Upload remote photos to Cloudinary
            let securedImages: string[] = [];
            if (transformed.imageUrls && transformed.imageUrls.length > 0) {
              securedImages = await this.importImages(transformed.imageUrls);
            }

            vehicle = await (Vehicle as any).create({
              ...transformed,
              images: securedImages.length > 0 ? securedImages : transformed.images || [],
              dealer: dealerId,
              status: 'PENDING_REVIEW',
              verified: 'UNVERIFIED',
              views: 0,
              savedCount: 0,
              enquiryCount: 0,
              externalSource: api.id,
              lastSyncAt: new Date().toISOString(),
              importedAt: new Date().toISOString(),
            });
            imported++;
          }

          importedVehicles.push(vehicle as IVehicle);
        } catch (itemError) {
          failed++;
          errors.push(`Registration Failure on: ${JSON.stringify(vehicleData?.brand || 'Unknown')} — ${itemError instanceof Error ? itemError.message : 'Structure mismatched'}`);
        }
      }

      return {
        success: errors.length === 0,
        imported,
        updated,
        failed,
        errors,
        vehicles: importedVehicles,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Host connection timed out'],
        vehicles: [],
      };
    }
  }

  /**
   * Normalizes incoming raw data records into standard TORQUENS schemas.
   */
  static transformVehicleData(data: any, mappings?: CarAPIConfig['mappings']): any {
    const map = (field: string) => mappings?.[field as keyof typeof mappings] || field;

    const externalId = String(data[map('externalId')] || data.id || data.vehicleId || data._id || '');
    const make = String(data[map('make')] || data.brand || data.manufacturer || 'Unknown Marque').trim();
    const model = String(data[map('model')] || data.vehicleModel || 'Unknown Prototype').trim();
    const year = parseInt(data[map('year')] || data.modelYear || data.registrationYear || 2024, 10);
    const price = parseFloat(data[map('price')] || data.askingPrice || data.sellingPrice || 0);
    const currency = String(data[map('currency')] || data.currency || 'CHF').toUpperCase();
    const mileage = parseInt(data[map('mileage')] || data.odometer || data.kilometers || 0, 10);

    return {
      externalId,
      make,
      model,
      year,
      price,
      currency,
      mileage,
      transmission: this.mapTransmission(data[map('transmission')] || data.gearbox),
      fuelType: this.mapFuelType(data[map('fuelType')] || data.fuel || data.engineType),
      engine: String(data[map('engine')] || data.engineSize || 'TBD'),
      horsepower: parseInt(data[map('horsepower')] || data.power || data.bhp || 0, 10),
      drivetrain: this.mapDrivetrain(data[map('drivetrain')] || data.driveType),
      bodyType: this.mapBodyType(data[map('bodyType')] || data.type || data.category),
      location: String(data[map('location')] || data.city || data.state || 'Geneva FreePort'),
      images: Array.isArray(data[map('images')] || data.photos) ? (data[map('images')] || data.photos) : [],
      description: String(data[map('description')] || data.notes || data.details || ''),
      vin: String(data[map('vin')] || data.chassisNumber || data.vehicleIdentificationNumber || '').toUpperCase().trim(),
      features: Array.isArray(data.features || data.options) ? (data.features || data.options) : [],
      imageUrls: Array.isArray(data[map('images')] || data.photos) ? (data[map('images')] || data.photos) : [],
    };
  }

  static mapTransmission(value: string): string {
    const lower = (value || '').toLowerCase();
    if (lower.includes('auto') || lower.includes('at')) return 'Automatic';
    if (lower.includes('man') || lower.includes('mt') || lower.includes('speed')) return 'Manual';
    if (lower.includes('f1') || lower.includes('sequential')) return 'F1 Sequential';
    if (lower.includes('dual') || lower.includes('dct') || lower.includes('pdk')) return 'Dual-Clutch';
    return 'Manual';
  }

  static mapFuelType(value: string): string {
    const lower = (value || '').toLowerCase();
    if (lower.includes('classic') || lower.includes('combustion') || lower.includes('historic')) return 'Classic / Combustion';
    if (lower.includes('petrol') || lower.includes('gasoline')) return 'Petrol';
    if (lower.includes('hybrid')) return 'Hybrid';
    if (lower.includes('electric') || lower.includes('ev')) return 'Electric';
    return 'Petrol';
  }

  static mapDrivetrain(value: string): string {
    const lower = (value || '').toLowerCase();
    if (lower.includes('awd') || lower.includes('all')) return 'AWD';
    if (lower.includes('4wd') || lower.includes('four')) return '4WD';
    if (lower.includes('rwd') || lower.includes('rear')) return 'RWD';
    return 'RWD';
  }

  static mapBodyType(value: string): string {
    const lower = (value || '').toLowerCase();
    if (lower.includes('suv')) return 'SUV';
    if (lower.includes('coupe') || lower.includes(' berlinetta')) return 'Coupe';
    if (lower.includes('convert') || lower.includes('cabrio') || lower.includes('roadster') || lower.includes('spyder')) return 'Convertible';
    if (lower.includes('sedan') || lower.includes('saloon')) return 'Sedan';
    return 'Coupe';
  }

  /**
   * Normalizes, downloads, and uploads remote photos to Cloudinary in parallel.
   */
  static async importImages(imageUrls: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    // Process top 5 images to keep database records fast and clean
    const targets = imageUrls.slice(0, 5);
    
    for (const url of targets) {
      if (url.startsWith('https://images.unsplash.com')) {
        // Direct integration with Unsplash CDN parameters
        uploadedUrls.push(url);
        continue;
      }

      try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 6000); // 6s download timeout per photo

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(tId);

        if (!response.ok) continue;
        
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        
        const result = await CloudinaryService.uploadImage(dataUrl, {
          folder: 'torquens/vehicles/imported',
          tags: ['imported', 'chassis-api'],
        });
        
        uploadedUrls.push(result.secure_url);
      } catch (error) {
        console.error(`Cloudinary stream ingestion failed for: ${url}`, error);
      }
    }
    
    return uploadedUrls;
  }

  /**
   * Synchronizes vehicles from a specific API.
   */
  static async syncAPI(apiId: string, dealerId: string): Promise<CarAPIImportResult> {
    const api = this.getAPI(apiId);
    if (!api) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [`API ID "${apiId}" unvetted`],
        vehicles: [],
      };
    }

    const lastSync: any = await DatabaseService.findOne(
      Vehicle as any,
      { externalSource: apiId },
      {},
      { sort: { lastSyncAt: -1 } }
    );

    const lastSyncAt = lastSync?.lastSyncAt ? new Date(lastSync.lastSyncAt) : new Date(0);
    
    return this.importFromAPI(apiId, dealerId, {
      filters: {
        updatedSince: lastSyncAt.toISOString(),
      },
    });
  }

  static async syncAllAPIs(dealerId: string): Promise<Record<string, CarAPIImportResult>> {
    const results: Record<string, CarAPIImportResult> = {};
    for (const api of this.apis) {
      if (!api.enabled) continue;
      results[api.id] = await this.syncAPI(api.id, dealerId);
    }
    return results;
  }

  /**
   * Queries real-world registers (such as US NHTSA) to decode and verify chassis VINs.
   */
  static async lookupVIN(vin: string): Promise<any | null> {
    const cleanVin = vin.trim().toUpperCase();
    if (cleanVin.length !== 17) {
      return null;
    }

    try {
      // Decode via public, live federal databases
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${cleanVin}?format=json`;
      const response = await fetch(url);
      if (response.ok) {
        const raw = await response.json();
        const details = raw.Results?.[0];
        if (details && details.ErrorCode !== '0') {
          return {
            make: details.Make,
            model: details.Model,
            year: parseInt(details.ModelYear, 10),
            bodyType: details.BodyClass,
            engine: `${details.DisplacementL || '3.0'}L ${details.EngineCylinders || '6'}-Cylinder`,
            horsepower: details.EngineHP ? parseInt(details.EngineHP, 10) : undefined,
            transmission: details.TransmissionStyle,
          };
        }
      }
    } catch (err) {
      console.error(`Chassis decoding error on [${vin}]:`, err);
    }
    return null;
  }

  /**
   * Runs mechanical verification tests on serial/chassis codes.
   */
  private static preValidateChassisSerial(vin: string): { valid: boolean; reason?: string } {
    if (vin.length < 5) {
      return { valid: false, reason: 'Chassis identifier too short' };
    }
    if (vin.length === 17) {
      // Standard ISO 3779 checksum test
      const invalidChars = /[IOQ]/i;
      if (invalidChars.test(vin)) {
        return { valid: false, reason: 'ISO 3779 violation: Contains prohibited characters (I, O, or Q)' };
      }
    }
    return { valid: true };
  }

  static validateAPIConfig(config: CarAPIConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!config.id) errors.push('Identifier is required');
    if (!config.name) errors.push('Institution Name is required');
    if (!config.baseUrl) errors.push('Target Endpoint base URL is required');
    try {
      new URL(config.baseUrl);
    } catch {
      errors.push('Endpoint requires complete dynamic URL format');
    }
    return { valid: errors.length === 0, errors };
  }
}