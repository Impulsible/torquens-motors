/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Vehicle } from '@/models/Vehicle';
import DatabaseService from './database';
import { CarAPIService } from './car-api.service';
import type { IVehicle } from '@/types';

// Dynamically import CarQueryService
let CarQueryServiceInstance: any = null;
let carQueryServiceLoaded = false;

async function getCarQueryService() {
  if (carQueryServiceLoaded && CarQueryServiceInstance) {
    return CarQueryServiceInstance;
  }

  try {
    // @ts-ignore
    const imported = await import('./carquery.service');
    CarQueryServiceInstance = imported.CarQueryService;
    carQueryServiceLoaded = true;
    return CarQueryServiceInstance;
  } catch (error) {
    console.error('CarQueryService not available:', error);
    return null;
  }
}

export interface ShowroomFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  verified?: boolean;
  search?: string;
  sort?: string;
  useExternalAPI?: boolean;
  source?: 'database' | 'carquery' | 'apis' | 'all';
}

export interface ShowroomResponse {
  vehicles: IVehicle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    makes: string[];
    models: string[];
    bodyTypes: string[];
    fuelTypes: string[];
    transmissions: string[];
    drivetrains: string[];
    priceRange: { min: number; max: number };
    yearRange: { min: number; max: number };
  };
  sources?: {
    database: number;
    carquery: number;
    apis: number;
  };
}

export class ShowroomService {
  /**
   * Initialize and register CarAPIs
   */
  static initializeAPIs(apiConfigs: any[]): void {
    for (const config of apiConfigs) {
      const validation = CarAPIService.validateAPIConfig(config);
      if (validation.valid) {
        CarAPIService.registerAPI(config);
        console.log(`✅ [TORQUENS Sync] API Active: ${config.name}`);
      } else {
        console.error(`❌ [TORQUENS Sync] Configuration Failed for ${config.name}:`, validation.errors);
      }
    }
  }

  /**
   * Get showroom vehicles from all configured sources
   */
  static async getShowroomVehicles(
    filters: ShowroomFilters = {},
    page: number = 1,
    limit: number = 12
  ): Promise<ShowroomResponse> {
    const source = filters.source || 'all';
    let dbVehicles: IVehicle[] = [];
    let carQueryVehicles: IVehicle[] = [];
    let apiVehicles: IVehicle[] = [];
    const sources = { database: 0, carquery: 0, apis: 0 };

    // 1. Get from Database
    if (source === 'all' || source === 'database') {
      try {
        const dbResult = await this.getDBVehicles(filters, page, limit);
        dbVehicles = dbResult.data ? dbResult.data.map((doc: any) => doc.toObject ? doc.toObject() : doc) : [];
        sources.database = dbVehicles.length;
      } catch (error) {
        console.error('Database fetch failed:', error);
      }
    }

    // 2. Get from CarQuery API
    if (source === 'all' || source === 'carquery') {
      try {
        const carQueryService = await getCarQueryService();
        if (carQueryService && typeof carQueryService.getLuxuryVehicles === 'function') {
          carQueryVehicles = await carQueryService.getLuxuryVehicles({
            make: filters.make,
            model: filters.model,
            limit: 50,
          });
          sources.carquery = carQueryVehicles.length;
        }
      } catch (error) {
        console.error('CarQuery API error:', error);
      }
    }

    // 3. Get from configured CarAPIs
    if (source === 'all' || source === 'apis') {
      try {
        const apis = CarAPIService.getAPIs();
        const apiPromises = apis
          .filter(api => api.enabled)
          .map(async (api) => {
            try {
              const vehicles = await (CarAPIService as any).fetchVehicles(api.id, {
                make: filters.make,
                model: filters.model,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                limit: 20,
              });
              return vehicles;
            } catch (error) {
              console.error(`Error fetching from ${api.name}:`, error);
              return [];
            }
          });

        const apiResults = await Promise.all(apiPromises);
        apiVehicles = apiResults.flat();
        sources.apis = apiVehicles.length;
      } catch (error) {
        console.error('CarAPIs error:', error);
      }
    }

    // 4. Merge primary sources
    let allVehicles: IVehicle[] = [];
    allVehicles = this.mergeVehicles(dbVehicles, carQueryVehicles);
    allVehicles = this.mergeVehicles(allVehicles, apiVehicles);

    // 5. Fallback Reference Dataset
    const allFallbacks = this.getAllFallbackVehicles();
    const matchingFallbacks = this.filterReferenceVehicles(allFallbacks, filters);
    allVehicles = this.mergeVehicles(allVehicles, matchingFallbacks);

    // 6. Apply sorting
    if (filters.sort) {
      this.sortVehicles(allVehicles, filters.sort);
    }

    // 7. Apply pagination
    const start = (page - 1) * limit;
    const paginatedVehicles = allVehicles.slice(start, start + limit);

    // 8. Generate filter options
    const filterOptions = await this.getFilterOptions(this.mergeVehicles(allVehicles, allFallbacks));

    return {
      vehicles: paginatedVehicles,
      pagination: {
        total: allVehicles.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(allVehicles.length / limit)),
      },
      filters: filterOptions,
      sources,
    };
  }

  static async getDBVehicles(
    filters: ShowroomFilters = {},
    page: number = 1,
    limit: number = 12
  ) {
    const query: any = { status: { $ne: 'DELETED' } };

    if (filters.make) query.make = { $regex: new RegExp(filters.make, 'i') };
    if (filters.model) query.model = { $regex: new RegExp(filters.model, 'i') };
    if (filters.bodyType) query.bodyType = { $regex: new RegExp(filters.bodyType, 'i') };
    if (filters.fuelType) query.fuelType = { $regex: new RegExp(filters.fuelType, 'i') };
    if (filters.transmission) query.transmission = { $regex: new RegExp(filters.transmission, 'i') };
    if (filters.drivetrain) query.drivetrain = { $regex: new RegExp(filters.drivetrain, 'i') };
    if (filters.verified) query.verified = 'VERIFIED';
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { make: searchRegex },
        { model: searchRegex },
        { description: searchRegex }
      ];
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    return DatabaseService.paginate(Vehicle as any, query, {
      page,
      limit,
      sort: { createdAt: -1 }
    });
  }

  static mergeVehicles(sourceVehicles: IVehicle[], newVehicles: IVehicle[]): IVehicle[] {
    const vehicleMap = new Map<string, IVehicle>();

    sourceVehicles.forEach(v => {
      const key = this.generateVehicleKey(v);
      vehicleMap.set(key, v);
    });

    newVehicles.forEach(v => {
      const key = this.generateVehicleKey(v);
      if (!vehicleMap.has(key)) {
        vehicleMap.set(key, v);
      }
    });

    return Array.from(vehicleMap.values());
  }

  private static generateVehicleKey(vehicle: IVehicle): string {
    if (vehicle.id) {
      return vehicle.id.toLowerCase().replace(/\s+/g, '');
    }
    if (vehicle.slug) {
      return vehicle.slug.toLowerCase().replace(/\s+/g, '');
    }
    return `${vehicle.make}-${vehicle.model}-${vehicle.year}`.toLowerCase().replace(/\s+/g, '');
  }

  private static sortVehicles(vehicles: IVehicle[], sortOption?: string) {
    if (!sortOption) return;

    vehicles.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'year-desc':
          return (b.year || 0) - (a.year || 0);
        case 'year-asc':
          return (a.year || 0) - (b.year || 0);
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
  }

  static filterReferenceVehicles(vehicles: IVehicle[], filters: ShowroomFilters): IVehicle[] {
    return vehicles.filter(v => {
      if (filters.make && !v.make.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.model && !v.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (filters.bodyType && v.bodyType && !v.bodyType.toLowerCase().includes(filters.bodyType.toLowerCase())) return false;
      if (filters.fuelType && v.fuelType && !v.fuelType.toLowerCase().includes(filters.fuelType.toLowerCase())) return false;
      if (filters.transmission && v.transmission && !v.transmission.toLowerCase().includes(filters.transmission.toLowerCase())) return false;
      if (filters.minPrice && v.price && v.price < filters.minPrice) return false;
      if (filters.maxPrice && v.price && v.price > filters.maxPrice) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const match =
          v.make.toLowerCase().includes(s) ||
          v.model.toLowerCase().includes(s) ||
          (v.description && v.description.toLowerCase().includes(s)) ||
          (v.bodyType && v.bodyType.toLowerCase().includes(s));
        if (!match) return false;
      }
      return true;
    });
  }

  static async getFilterOptions(vehicles: IVehicle[]): Promise<ShowroomResponse['filters']> {
    const makes = new Set<string>();
    const models = new Set<string>();
    const bodyTypes = new Set<string>();
    const fuelTypes = new Set<string>();
    const transmissions = new Set<string>();
    const drivetrains = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;
    let minYear = Infinity;
    let maxYear = 0;

    vehicles.forEach(v => {
      if (v.make) makes.add(v.make);
      if (v.model) models.add(v.model);
      if (v.bodyType) bodyTypes.add(v.bodyType);
      if (v.fuelType) fuelTypes.add(v.fuelType);
      if (v.transmission) transmissions.add(v.transmission);
      if (v.drivetrain) drivetrains.add(v.drivetrain);
      if (v.price) {
        minPrice = Math.min(minPrice, v.price);
        maxPrice = Math.max(maxPrice, v.price);
      }
      if (v.year) {
        minYear = Math.min(minYear, v.year);
        maxYear = Math.max(maxYear, v.year);
      }
    });

    return {
      makes: Array.from(makes).sort(),
      models: Array.from(models).sort(),
      bodyTypes: Array.from(bodyTypes).sort(),
      fuelTypes: Array.from(fuelTypes).sort(),
      transmissions: Array.from(transmissions).sort(),
      drivetrains: Array.from(drivetrains).sort(),
      priceRange: {
        min: minPrice === Infinity ? 0 : Math.floor(minPrice / 1000000) * 1000000,
        max: maxPrice === 0 ? 1500000000 : Math.ceil(maxPrice / 1000000) * 1000000
      },
      yearRange: {
        min: minYear === Infinity ? 2015 : minYear,
        max: maxYear === 0 ? new Date().getFullYear() : maxYear
      },
    };
  }

  static async getFeaturedVehicles(limit: number = 6): Promise<IVehicle[]> {
    try {
      const dbFeatured = await DatabaseService.findMany(
        Vehicle as any,
        { status: { $ne: 'DELETED' } },
        {},
        { sort: { views: -1 }, limit }
      );

      let dbVehicles: IVehicle[] = [];
      if (dbFeatured && dbFeatured.length > 0) {
        dbVehicles = dbFeatured.map((doc: any) => doc.toObject ? doc.toObject() : doc);
      }

      if (dbVehicles.length >= limit) return dbVehicles.slice(0, limit);

      const fallbacks = this.getAllFallbackVehicles();
      const merged = this.mergeVehicles(dbVehicles, fallbacks);
      return merged.slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured vehicles:', error);
      return this.getAllFallbackVehicles().slice(0, limit);
    }
  }

  static async getShowroomStats(): Promise<{
    total: number;
    verified: number;
    byMake: Record<string, number>;
    byBodyType: Record<string, number>;
    priceRange: { min: number; max: number; average: number };
  }> {
    try {
      const dbStats = await DatabaseService.aggregate(Vehicle as any, [
        { $match: { status: { $ne: 'DELETED' } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: { $sum: { $cond: [{ $eq: ['$verified', 'VERIFIED'] }, 1, 0] } },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
          },
        },
      ]);

      const makeDistribution = await DatabaseService.aggregate(Vehicle as any, [
        { $match: { status: { $ne: 'DELETED' } } },
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const byMake: Record<string, number> = {};
      makeDistribution.forEach((item: any) => {
        if (item._id) byMake[item._id] = item.count;
      });

      const bodyDistribution = await DatabaseService.aggregate(Vehicle as any, [
        { $match: { status: { $ne: 'DELETED' } } },
        { $group: { _id: '$bodyType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const byBodyType: Record<string, number> = {};
      bodyDistribution.forEach((item: any) => {
        if (item._id) byBodyType[item._id] = item.count;
      });

      const statsData = dbStats && dbStats.length > 0 ? dbStats[0] : null;
      const stats = statsData as any || {
        total: 45,
        verified: 45,
        avgPrice: 320000000,
        minPrice: 58000000,
        maxPrice: 1650000000,
      };

      return {
        total: stats.total || 45,
        verified: stats.verified || 45,
        byMake,
        byBodyType,
        priceRange: {
          min: stats.minPrice || 58000000,
          max: stats.maxPrice || 1650000000,
          average: stats.avgPrice || 320000000,
        },
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total: 45,
        verified: 45,
        byMake: { Porsche: 6, Ferrari: 6, Lamborghini: 5, 'Mercedes-Benz': 6, BMW: 5, 'Rolls-Royce': 4, Bentley: 3, McLaren: 3, 'Aston Martin': 3, Bugatti: 2, 'Range Rover': 2 },
        byBodyType: { SUV: 14, Coupe: 18, Sedan: 9, Convertible: 4 },
        priceRange: { min: 58000000, max: 1650000000, average: 320000000 },
      };
    }
  }

  /**
   * Master Multi-Marque Reference Inventory (45+ Curated Allocations)
   */
  public static getAllFallbackVehicles(): IVehicle[] {
    return [
      // ============= PORSCHE =============
      {
        id: 'porsche-911-gt3rs-2024',
        make: 'Porsche',
        model: '911 GT3 RS',
        year: 2024,
        price: 210000000,
        currency: 'NGN',
        mileage: 120,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '4.0L Naturally Aspirated Flat-6',
        horsepower: 518,
        power: 518,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Weissach Package', 'Carbon Ceramic Brakes', 'DRS Active Aero', 'ClubSport Package'],
        description: 'Pure motorsport technology adapted for the road. Ultimate aerodynamic precision and track dominance.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'porsche-911-gt3-rs-2024',
        views: 450,
        savedCount: 68,
        enquiryCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'porsche-cayenne-turbo-gt-2024',
        make: 'Porsche',
        model: 'Cayenne Turbo GT',
        year: 2024,
        price: 165000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L V8 Twin-Turbo',
        horsepower: 650,
        power: 650,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Titanium Exhaust', 'PCCB Carbon Brakes', 'Sport Chrono Package', '22-inch GT Wheels'],
        description: 'The fastest SUV on the Nürburgring. Combines supercar acceleration with everyday versatility.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'porsche-cayenne-turbo-gt-2024',
        views: 210,
        savedCount: 32,
        enquiryCount: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'porsche-taycan-turbo-s-2024',
        make: 'Porsche',
        model: 'Taycan Turbo S',
        year: 2024,
        price: 145000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Electric',
        engine: 'Dual Permanent Magnet Synchronous',
        horsepower: 750,
        power: 750,
        drivetrain: 'AWD',
        bodyType: 'Sedan',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541348263662-e082662d82da?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['800V Architecture', 'Sport Chrono Package', 'Burmester High-End Audio', 'Rear-Axle Steering'],
        description: 'Instant electric launch velocity meets unmistakable Porsche DNA.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'porsche-taycan-turbo-s-2024',
        views: 310,
        savedCount: 45,
        enquiryCount: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'porsche-panamera-gts-2023',
        make: 'Porsche',
        model: 'Panamera GTS',
        year: 2023,
        price: 110000000,
        currency: 'NGN',
        mileage: 4500,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '4.0L V8 Twin-Turbo',
        horsepower: 473,
        power: 473,
        drivetrain: 'AWD',
        bodyType: 'Sedan',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1614200183149-302a049eeb9d?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['SportDesign Package', 'Adaptive Air Suspension', 'Alcantara Sport Seats'],
        description: 'Four-door saloon elegance imbued with pure GT touring performance.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'porsche-panamera-gts-2023',
        views: 180,
        savedCount: 21,
        enquiryCount: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'porsche-911-carrera-4s-2024',
        make: 'Porsche',
        model: '911 Carrera 4S',
        year: 2024,
        price: 185000000,
        currency: 'NGN',
        mileage: 1500,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '3.0L Twin-Turbo Flat-6',
        horsepower: 443,
        power: 443,
        drivetrain: 'AWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Sport Chrono Package', 'Sports Exhaust System', 'BOSE Surround Sound'],
        description: 'Timeless silhouette equipped with active all-wheel traction for all-weather performance.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'porsche-911-carrera-4s-2024',
        views: 380,
        savedCount: 42,
        enquiryCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= FERRARI =============
      {
        id: 'ferrari-sf90-2023',
        make: 'Ferrari',
        model: 'SF90 Stradale',
        year: 2023,
        price: 450000000,
        currency: 'NGN',
        mileage: 850,
        transmission: 'Dual-Clutch',
        fuelType: 'Hybrid',
        engine: '4.0L Twin-Turbo V8 + 3 Electric Motors',
        horsepower: 986,
        power: 986,
        drivetrain: 'AWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Assetto Fiorano Package', 'Carbon Fiber Wheels', 'Titanium Exhaust', 'Telemetry System'],
        description: 'Maranello’s plug-in hybrid hypercar delivering unmatched lap times and digital cockpit technology.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'ferrari-sf90-stradale-2023',
        views: 890,
        savedCount: 140,
        enquiryCount: 22,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ferrari-296-gtb-2024',
        make: 'Ferrari',
        model: '296 GTB Assetto Fiorano',
        year: 2024,
        price: 320000000,
        currency: 'NGN',
        mileage: 150,
        transmission: 'Dual-Clutch',
        fuelType: 'Hybrid',
        engine: '3.0L Turbo V6 Hybrid',
        horsepower: 819,
        power: 819,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Assetto Fiorano Aerodynamic Package', 'Carbon Fiber Racing Seats', 'Lexan Engine Screen'],
        description: 'The evolution of Ferrari mid-rear engined 2-seater sports berlinetta concepts.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'ferrari-296-gtb-2024',
        views: 540,
        savedCount: 88,
        enquiryCount: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ferrari-purosangue-2024',
        make: 'Ferrari',
        model: 'Purosangue V12',
        year: 2024,
        price: 680000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '6.5L Naturally Aspirated V12',
        horsepower: 715,
        power: 715,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Welcome Suicide Doors', 'Multimatic Active Suspension', 'Carbon Ceramic Brakes'],
        description: 'The first ever four-door, four-seater Ferrari driven by a roaring 6.5L V12 engine.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'ferrari-purosangue-v12-2024',
        views: 1200,
        savedCount: 210,
        enquiryCount: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ferrari-f8-tributo-2022',
        make: 'Ferrari',
        model: 'F8 Tributo Spider',
        year: 2022,
        price: 280000000,
        currency: 'NGN',
        mileage: 2100,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '3.9L Twin-Turbo V8',
        horsepower: 710,
        power: 710,
        drivetrain: 'RWD',
        bodyType: 'Convertible',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1597687210367-a4915552d886?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Retractable Hard Top', 'Carbon Fiber Front Spoiler', 'Passenger Display Screen'],
        description: 'An homage to the most powerful V8 engine in Ferrari history.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'ferrari-f8-tributo-spider-2022',
        views: 410,
        savedCount: 62,
        enquiryCount: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ferrari-laferrari-2015',
        make: 'Ferrari',
        model: 'LaFerrari Aperta',
        year: 2015,
        price: 1650000000,
        currency: 'NGN',
        mileage: 1800,
        transmission: 'Dual-Clutch',
        fuelType: 'Hybrid',
        engine: '6.3L V12 + KERS Hybrid',
        horsepower: 950,
        power: 950,
        drivetrain: 'RWD',
        bodyType: 'Convertible',
        location: 'Geneva Freeport',
        images: [
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Limited Holy Trinity Collector Unit', 'HY-KERS System', 'Full Ferrari Classiche Dossier'],
        description: 'The pinnacle collector hypercar of the 21st century.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'ferrari-laferrari-aperta-2015',
        views: 2900,
        savedCount: 640,
        enquiryCount: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= LAMBORGHINI =============
      {
        id: 'lamborghini-urus-2024',
        make: 'Lamborghini',
        model: 'Urus Performante',
        year: 2024,
        price: 290000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L Twin-Turbo V8',
        horsepower: 657,
        power: 657,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600712242805-5f786abee1c0?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Akrapovič Titanium Exhaust', 'Carbon Bonnet', 'Rally Mode', '23-inch Forged Wheels'],
        description: 'The Super SUV redefined with lightweight carbon aero components and track-focused suspension.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'lamborghini-urus-performante-2024',
        views: 610,
        savedCount: 110,
        enquiryCount: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lamborghini-revuelto-2024',
        make: 'Lamborghini',
        model: 'Revuelto V12 HPEV',
        year: 2024,
        price: 850000000,
        currency: 'NGN',
        mileage: 50,
        transmission: 'Dual-Clutch',
        fuelType: 'Hybrid',
        engine: '6.5L V12 + 3 Electric Motors',
        horsepower: 1001,
        power: 1001,
        drivetrain: 'AWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600706432502-75a0e286b92a?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Monofuselage Carbon Chassis', 'Y-Shaped LED DRLs', 'Scissor Doors', 'LDVI 2.0 Logic'],
        description: 'The first High Performance Electrified Vehicle (HPEV) hybrid super sports car from Sant’Agata Bolognese.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'lamborghini-revuelto-v12-2024',
        views: 1400,
        savedCount: 310,
        enquiryCount: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lamborghini-huracan-sto-2023',
        make: 'Lamborghini',
        model: 'Huracán STO',
        year: 2023,
        price: 340000000,
        currency: 'NGN',
        mileage: 1100,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '5.2L Naturally Aspirated V10',
        horsepower: 631,
        power: 631,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Cofango Carbon Front Body', 'CCMR Braking System', 'Adjustable Rear Wing'],
        description: 'Road-homologated super sports car inspired by the Squadra Corse race heritage.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'lamborghini-huracan-sto-2023',
        views: 720,
        savedCount: 130,
        enquiryCount: 19,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lamborghini-aventador-svj-2021',
        make: 'Lamborghini',
        model: 'Aventador SVJ Roadster',
        year: 2021,
        price: 580000000,
        currency: 'NGN',
        mileage: 1900,
        transmission: 'Semi-Automatic',
        fuelType: 'Petrol',
        engine: '6.5L Naturally Aspirated V12',
        horsepower: 759,
        power: 759,
        drivetrain: 'AWD',
        bodyType: 'Convertible',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['ALA 2.0 Active Aerodynamics', 'Removable Carbon Hardtop', 'Carbon Skin Interior'],
        description: 'Naturally aspirated V12 fury with active aerodynamic vectoring.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'lamborghini-aventador-svj-roadster-2021',
        views: 980,
        savedCount: 195,
        enquiryCount: 29,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= ROLLS-ROYCE =============
      {
        id: 'rolls-royce-phantom-2024',
        make: 'Rolls-Royce',
        model: 'Phantom VIII Extended',
        year: 2024,
        price: 750000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '6.75L Twin-Turbo V12',
        horsepower: 563,
        power: 563,
        drivetrain: 'RWD',
        bodyType: 'Sedan',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Starlight Headliner', 'Serenity Reclining Seats', 'The Gallery Glass Dashboard', 'Champagne Cooler'],
        description: 'The pinnacle of bespoke luxury. Whispering quietness and uncompromised presence.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'rolls-royce-phantom-viii-2024',
        views: 950,
        savedCount: 180,
        enquiryCount: 28,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rolls-royce-cullinan-black-badge-2024',
        make: 'Rolls-Royce',
        model: 'Cullinan Black Badge',
        year: 2024,
        price: 620000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '6.75L Twin-Turbo V12',
        horsepower: 592,
        power: 592,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Dark Chrome Spirit of Ecstasy', 'Technical Carbon Veneer', 'Viewing Suite Tailgate Seats'],
        description: 'The alter ego of luxury. Darker in aesthetic, boosted in torque, ultimate in luxury cruising.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'rolls-royce-cullinan-black-badge-2024',
        views: 1120,
        savedCount: 220,
        enquiryCount: 38,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rolls-royce-spectre-2024',
        make: 'Rolls-Royce',
        model: 'Spectre Ultra-Luxury EV',
        year: 2024,
        price: 710000000,
        currency: 'NGN',
        mileage: 100,
        transmission: 'Automatic',
        fuelType: 'Electric',
        engine: 'Dual Motor All-Electric Powertrain',
        horsepower: 577,
        power: 577,
        drivetrain: 'AWD',
        bodyType: 'Coupe',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Illuminated Grille', 'Starlight Doors', 'Planar Suspension Architecture'],
        description: 'The world’s first ultra-luxury electric super coupe.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'rolls-royce-spectre-ev-2024',
        views: 1350,
        savedCount: 280,
        enquiryCount: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rolls-royce-ghost-extended-2023',
        make: 'Rolls-Royce',
        model: 'Ghost Extended',
        year: 2023,
        price: 490000000,
        currency: 'NGN',
        mileage: 1200,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '6.75L Twin-Turbo V12',
        horsepower: 563,
        power: 563,
        drivetrain: 'AWD',
        bodyType: 'Sedan',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Planar Suspension System', 'Effortless Power Doors', 'Shooting Star Headliner'],
        description: 'Minimalist post-opulent aesthetic hiding supreme technical quietness.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'rolls-royce-ghost-extended-2023',
        views: 510,
        savedCount: 78,
        enquiryCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= BENTLEY =============
      {
        id: 'bentley-continental-gt-speed-2024',
        make: 'Bentley',
        model: 'Continental GT Speed W12',
        year: 2024,
        price: 360000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '6.0L Twin-Turbo W12',
        horsepower: 650,
        power: 650,
        drivetrain: 'AWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Bentley Rotating Display', 'Mulliner Driving Specification', 'Electronic All-Wheel Steering'],
        description: 'The definitive grand tourer delivering effortless power and tailored British craftsmanship.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bentley-continental-gt-speed-2024',
        views: 420,
        savedCount: 65,
        enquiryCount: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bentley-bentayga-ewb-2024',
        make: 'Bentley',
        model: 'Bentayga EWB Azure',
        year: 2024,
        price: 310000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L Twin-Turbo V8',
        horsepower: 542,
        power: 542,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Airline Seat Specification', 'Bentley Diamond Illumination', 'Naim for Bentley Audio'],
        description: 'Extended wheelbase SUV focused on rear passenger wellness and effortless grand touring.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bentley-bentayga-ewb-azure-2024',
        views: 380,
        savedCount: 52,
        enquiryCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bentley-flying-spur-mulliner-2023',
        make: 'Bentley',
        model: 'Flying Spur Mulliner W12',
        year: 2023,
        price: 390000000,
        currency: 'NGN',
        mileage: 2100,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '6.0L Twin-Turbo W12',
        horsepower: 626,
        power: 626,
        drivetrain: 'AWD',
        bodyType: 'Sedan',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Double Diamond Front Grille', 'Electric Deployable Flying B', 'Mulliner Quilting'],
        description: 'Bespoke grand touring saloon delivering effortless 200 mph cruising capability.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bentley-flying-spur-mulliner-2023',
        views: 290,
        savedCount: 41,
        enquiryCount: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= MERCEDES-BENZ / MAYBACH =============
      {
        id: 'mercedes-maybach-s680-2024',
        make: 'Mercedes-Benz',
        model: 'Maybach S 680 V12',
        year: 2024,
        price: 380000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '6.0L Biturbo V12',
        horsepower: 621,
        power: 621,
        drivetrain: '4MATIC',
        bodyType: 'Sedan',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Two-Tone Paintwork', 'Executive Rear Seats with Calf Massage', 'Burmester 4D Sound'],
        description: 'The ultimate luxury flagship combining Maybach heritage with handcrafted V12 performance.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mercedes-maybach-s680-v12-2024',
        views: 680,
        savedCount: 115,
        enquiryCount: 21,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mercedes-g63-amg-2024',
        make: 'Mercedes-Benz',
        model: 'AMG G 63 Grand Edition',
        year: 2024,
        price: 240000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L V8 Biturbo',
        horsepower: 577,
        power: 577,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583122384161-9b8a5d7e2f3c?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Kalahari Gold Accents', 'AMG Night Package', 'Designo Nappa Leather', 'AMG Performance Exhaust'],
        description: 'The iconic Geländewagen delivering unbeatable power and luxury road presence.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mercedes-amg-g-63-2024',
        views: 520,
        savedCount: 95,
        enquiryCount: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mercedes-gle-2024',
        make: 'Mercedes-Benz',
        model: 'GLE 450 4MATIC',
        year: 2024,
        price: 95000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '3.0L Inline-6 Turbo with EQ Boost',
        horsepower: 362,
        power: 362,
        drivetrain: '4MATIC',
        bodyType: 'SUV',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['MBUX Hyperscreen', 'Air Body Control', 'Panoramic Sunroof'],
        description: 'Intelligence meets luxury in the flagship executive SUV.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mercedes-gle-450-2024',
        views: 180,
        savedCount: 25,
        enquiryCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mercedes-amg-gt-black-series-2021',
        make: 'Mercedes-Benz',
        model: 'AMG GT Black Series',
        year: 2021,
        price: 490000000,
        currency: 'NGN',
        mileage: 650,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '4.0L Flat-Plane Crank V8 Biturbo',
        horsepower: 720,
        power: 720,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583122384161-9b8a5d7e2f3c?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Carbon Fiber Adjustable Wing', 'Coilover Suspension', 'Magnesium Wheels'],
        description: 'Direct track-to-road technology representing the zenith of AMG motorsport prowess.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mercedes-amg-gt-black-series-2021',
        views: 780,
        savedCount: 142,
        enquiryCount: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mercedes-sl63-amg-2023',
        make: 'Mercedes-Benz',
        model: 'AMG SL 63 Roadster',
        year: 2023,
        price: 210000000,
        currency: 'NGN',
        mileage: 1800,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L Biturbo V8',
        horsepower: 577,
        power: 577,
        drivetrain: '4MATIC',
        bodyType: 'Convertible',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Z-Fold Soft Top', 'AMG Active Ride Control Suspension', 'Rear-Axle Steering'],
        description: 'Reinvention of the iconic roadster legend with 2+2 seating and 4MATIC power.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mercedes-amg-sl-63-roadster-2023',
        views: 340,
        savedCount: 51,
        enquiryCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= BMW =============
      {
        id: 'bmw-m5-competition-2024',
        make: 'BMW',
        model: 'M5 Competition',
        year: 2024,
        price: 115000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.4L V8 Twin-Turbo',
        horsepower: 617,
        power: 617,
        drivetrain: 'AWD',
        bodyType: 'Sedan',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['M xDrive with 2WD Mode', 'Carbon Fiber Roof', 'Bowers & Wilkins Diamond Surround'],
        description: 'The ultimate executive performance saloon offering supercar acceleration with 5-seat practicality.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bmw-m5-competition-2024',
        views: 310,
        savedCount: 48,
        enquiryCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bmw-x5m-2024',
        make: 'BMW',
        model: 'X5 M Competition',
        year: 2024,
        price: 88000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.4L V8 Twin-Turbo with 48V Mild Hybrid',
        horsepower: 617,
        power: 617,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555215315974-3d6e9c8f7a5d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['M Sport Exhaust System', 'BMW Curved Display', 'Merino Leather Interior'],
        description: 'Commanding high-performance SUV built for explosive dynamic handling.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bmw-x5-m-competition-2024',
        views: 240,
        savedCount: 35,
        enquiryCount: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bmw-xm-label-red-2024',
        make: 'BMW',
        model: 'XM Label Red',
        year: 2024,
        price: 210000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Hybrid',
        engine: '4.4L V8 Plug-In Hybrid',
        horsepower: 738,
        power: 738,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555215315974-3d6e9c8f7a5d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Toronto Red Exterior Accents', 'M Lounge Rear Seating', 'Sculptured 3D Headliner'],
        description: 'The most powerful BMW M road car ever produced. Bold, electric-assisted, and unapologetic.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bmw-xm-label-red-2024',
        views: 480,
        savedCount: 72,
        enquiryCount: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bmw-m4-csl-2023',
        make: 'BMW',
        model: 'M4 CSL Lightweight',
        year: 2023,
        price: 175000000,
        currency: 'NGN',
        mileage: 800,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '3.0L Twin-Turbo Inline-6',
        horsepower: 543,
        power: 543,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555215315974-3d6e9c8f7a5d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Carbon Bucket Full Racing Seats', 'Yellow Motorsport Laserlights', 'Titanium Silencer'],
        description: 'Competition Sport Lightweight track special limited to 1,000 units globally.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bmw-m4-csl-lightweight-2023',
        views: 590,
        savedCount: 105,
        enquiryCount: 17,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= ASTON MARTIN =============
      {
        id: 'aston-martin-dbs-2023',
        make: 'Aston Martin',
        model: 'DBS Superleggera',
        year: 2023,
        price: 320000000,
        currency: 'NGN',
        mileage: 1200,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '5.2L Twin-Turbo V12',
        horsepower: 715,
        power: 715,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1605558202076-161a3b155f9d?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Carbon Fiber Body Panels', 'Bang & Olufsen BeoSound', 'Quad Exhaust Tips'],
        description: 'A flagship super GT clad in carbon fiber panels with brute V12 muscularity.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'aston-martin-dbs-superleggera-2023',
        views: 390,
        savedCount: 58,
        enquiryCount: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'aston-martin-dbx707-2024',
        make: 'Aston Martin',
        model: 'DBX707',
        year: 2024,
        price: 260000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L Twin-Turbo V8',
        horsepower: 697,
        power: 697,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1605558202076-161a3b155f9d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Wet-Clutch 9-Speed Transmission', 'Carbon Ceramic Brakes', 'Soft-Close Doors'],
        description: 'The world’s most powerful luxury SUV blending sports car dynamics with interior luxury.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'aston-martin-dbx707-2024',
        views: 310,
        savedCount: 44,
        enquiryCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'aston-martin-valkyrie-2023',
        make: 'Aston Martin',
        model: 'Valkyrie Cosworth V12',
        year: 2023,
        price: 1850000000,
        currency: 'NGN',
        mileage: 120,
        transmission: 'Semi-Automatic',
        fuelType: 'Hybrid',
        engine: '6.5L Cosworth V12 Hybrid',
        horsepower: 1160,
        power: 1160,
        drivetrain: 'RWD',
        bodyType: 'Hypercar',
        location: 'Geneva Freeport',
        images: [
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1605558202076-161a3b155f9d?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Formula 1 Aerodynamics', '11,100 RPM Rev Limit', 'Custom Bucket Fitted Seat'],
        description: 'F1 technology brought to the road without compromise.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'aston-martin-valkyrie-2023',
        views: 3200,
        savedCount: 710,
        enquiryCount: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= MCLAREN =============
      {
        id: 'mclaren-750s-2024',
        make: 'McLaren',
        model: '750S Spider',
        year: 2024,
        price: 390000000,
        currency: 'NGN',
        mileage: 100,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '4.0L Twin-Turbo V8',
        horsepower: 740,
        power: 740,
        drivetrain: 'RWD',
        bodyType: 'Convertible',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Carbon Fibre MonoCell II', 'Proactive Chassis Control III', 'Retractable Hardtop'],
        description: 'Lighter, more powerful, and extraordinarily precise supercar engineering.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mclaren-750s-spider-2024',
        views: 620,
        savedCount: 95,
        enquiryCount: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mclaren-artura-2024',
        make: 'McLaren',
        model: 'Artura Hybrid',
        year: 2024,
        price: 240000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Dual-Clutch',
        fuelType: 'Hybrid',
        engine: '3.0L Twin-Turbo V6 Hybrid',
        horsepower: 671,
        power: 671,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Abuja, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['McLaren Carbon Lightweight Architecture (MCLA)', 'E-Differential', 'ClubSport Seats'],
        description: 'Next-generation high-performance hybrid supercar with razor-sharp steering.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mclaren-artura-2024',
        views: 410,
        savedCount: 60,
        enquiryCount: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= RANGE ROVER =============
      {
        id: 'range-rover-sv-2024',
        make: 'Range Rover',
        model: 'SV Long Wheelbase V8',
        year: 2024,
        price: 340000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.4L Twin-Turbo V8',
        horsepower: 606,
        power: 606,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['SV Signature Suite with Electrically Deployable Club Table', 'Ceramic Controls', 'Executive Class Comfort Plus Seats'],
        description: 'Unrivaled luxury and off-road refinement handcrafted by Special Vehicle Operations.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'range-rover-sv-lwb-2024',
        views: 890,
        savedCount: 160,
        enquiryCount: 26,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'range-rover-sport-sv-2024',
        make: 'Range Rover',
        model: 'Sport SV Edition One',
        year: 2024,
        price: 250000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.4L Twin-Turbo Mild-Hybrid V8',
        horsepower: 626,
        power: 626,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['6D Dynamics Interlinked Air Suspension', 'Carbon Fiber Bonnet', 'Body Soul Seats (BASS)'],
        description: 'The most powerful and dynamic Range Rover Sport ever made.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'range-rover-sport-sv-edition-one-2024',
        views: 650,
        savedCount: 112,
        enquiryCount: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= BUGATTI =============
      {
        id: 'bugatti-chiron-super-sport-2022',
        make: 'Bugatti',
        model: 'Chiron Super Sport 300+',
        year: 2022,
        price: 1450000000,
        currency: 'NGN',
        mileage: 420,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '8.0L Quad-Turbo W16',
        horsepower: 1578,
        power: 1578,
        drivetrain: 'AWD',
        bodyType: 'Hypercar',
        location: 'Geneva Freeport',
        images: [
          'https://images.unsplash.com/photo-1600706432502-75a0e286b92a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Longtail Aerodynamic Bodywork', 'Exposed Carbon Fibre Finish', 'Magnesium Wheels'],
        description: 'The ultimate pinnacle of automotive engineering capable of breaching 300 mph.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bugatti-chiron-super-sport-300-2022',
        views: 2500,
        savedCount: 520,
        enquiryCount: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= AUDI =============
      {
        id: 'audi-rs6-avant-2024',
        make: 'Audi',
        model: 'RS 6 Avant Performance',
        year: 2024,
        price: 98000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L Twin-Turbo V8',
        horsepower: 621,
        power: 621,
        drivetrain: 'AWD',
        bodyType: 'Wagon',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Quattro Sport Differential', 'RS Dynamic Package Plus', 'Valcona Leather RS Sport Seats'],
        description: 'Vicious twin-turbo performance disguised in the ultimate high-speed family wagon.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'audi-rs6-avant-performance-2024',
        views: 290,
        savedCount: 42,
        enquiryCount: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'audi-r8-v10-gt-2023',
        make: 'Audi',
        model: 'R8 V10 GT RWD',
        year: 2023,
        price: 185000000,
        currency: 'NGN',
        mileage: 350,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '5.2L Naturally Aspirated V10',
        horsepower: 612,
        power: 612,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Carbon Aero Kit', 'Torque Rear Mode', 'Bucket Seats', 'Numbered Limited Edition Badge'],
        description: 'The final farewell to Audi’s legendary naturally aspirated V10 supercar.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'audi-r8-v10-gt-rwd-2023',
        views: 510,
        savedCount: 88,
        enquiryCount: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= LEXUS =============
      {
        id: 'lexus-lx600-ultra-luxury-2024',
        make: 'Lexus',
        model: 'LX 600 Ultra Luxury',
        year: 2024,
        price: 160000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '3.5L Twin-Turbo V6',
        horsepower: 409,
        power: 409,
        drivetrain: '4WD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Four-Seat Executive Layout', 'Rear Reclining Ottoman Seat', 'Mark Levinson 25-Speaker Audio'],
        description: 'Uncompromising off-road capability combined with Japanese VIP rear-seat luxury.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'lexus-lx600-ultra-luxury-2024',
        views: 740,
        savedCount: 130,
        enquiryCount: 22,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lexus-lfa-nurburgring-2012',
        make: 'Lexus',
        model: 'LFA Nürburgring Package',
        year: 2012,
        price: 950000000,
        currency: 'NGN',
        mileage: 1200,
        transmission: 'Semi-Automatic',
        fuelType: 'Petrol',
        engine: '4.8L Naturally Aspirated V10',
        horsepower: 563,
        power: 563,
        drivetrain: 'RWD',
        bodyType: 'Coupe',
        location: 'Geneva Freeport',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Yamaha-Tuned Acoustics V10', 'Fixed Carbon Wing', 'CFRP Monocoque'],
        description: 'The highest expression of Japanese acoustic engineering and carbon craftsmanship.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'lexus-lfa-nurburgring-edition-2012',
        views: 3100,
        savedCount: 820,
        enquiryCount: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ============= KOENIGSEGG & MASERATI =============
      {
        id: 'koenigsegg-jesko-2024',
        make: 'Koenigsegg',
        model: 'Jesko Attack',
        year: 2024,
        price: 1650000000,
        currency: 'NGN',
        mileage: 50,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '5.0L Twin-Turbo Flat-Plane V8',
        horsepower: 1600,
        power: 1600,
        drivetrain: 'RWD',
        bodyType: 'Hypercar',
        location: 'Geneva Freeport',
        images: [
          'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600706432502-75a0e286b92a?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['9-Speed Light Speed Transmission (LST)', 'Triplex Suspension', 'Active Rear Steering'],
        description: 'Swedish megacar engineering producing over 1,400 kg of extreme downforce.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'koenigsegg-jesko-attack-2024',
        views: 4200,
        savedCount: 1100,
        enquiryCount: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'maserati-mc20-cielo-2024',
        make: 'Maserati',
        model: 'MC20 Cielo Spyder',
        year: 2024,
        price: 280000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Dual-Clutch',
        fuelType: 'Petrol',
        engine: '3.0L Nettuno Twin-Turbo V6',
        horsepower: 621,
        power: 621,
        drivetrain: 'RWD',
        bodyType: 'Convertible',
        location: 'Lagos, Nigeria',
        images: [
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&auto=format&fit=crop&q=80',
        ],
        features: ['Smart Electrochromic Glass Roof', 'Butterfly Doors', 'Sonus Faber Audio'],
        description: 'Italian open-top elegance powered by F1 twin-spark ignition tech.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'maserati-mc20-cielo-spyder-2024',
        views: 520,
        savedCount: 88,
        enquiryCount: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}

export default ShowroomService;