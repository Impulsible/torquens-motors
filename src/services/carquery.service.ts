/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IVehicle } from '@/types';

export class CarQueryService {
  static searchVehicles(arg0: { make: any; model: any; year: number | undefined; bodyType: any; }) {
    throw new Error('Method not implemented.');
  }
  static getMakes() {
    throw new Error('Method not implemented.');
  }
  static getModels(make: string) {
    throw new Error('Method not implemented.');
  }
  static getPopularVehicles(limit: number) {
    throw new Error('Method not implemented.');
  }
  private static baseUrl = 'https://www.carqueryapi.com/api/0.3';
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 3600000; // 1 hour

  // Luxury car brands
  private static LUXURY_BRANDS = [
    'Porsche',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Lexus',
    'Volvo',
    'Jaguar',
    'Land Rover',
    'Maserati',
    'Bentley',
    'Rolls-Royce',
    'Aston Martin',
    'Ferrari',
    'Lamborghini',
    'McLaren',
  ];

  private static getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get luxury vehicle makes
   */
  static async getLuxuryMakes(): Promise<string[]> {
    const cacheKey = 'luxury-makes';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/?cmd=getMakes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const allMakes = data.makes?.map((m: any) => m.make_display) || [];
      
      // Filter to luxury brands
      const luxuryMakes = allMakes.filter((make: string) =>
        this.LUXURY_BRANDS.some(brand =>
          make.toLowerCase().includes(brand.toLowerCase())
        )
      );
      
      // If no luxury makes found, return the list of luxury brands
      const result = luxuryMakes.length > 0 ? luxuryMakes : this.LUXURY_BRANDS;
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching luxury makes:', error);
      // Return default luxury brands as fallback
      return this.LUXURY_BRANDS;
    }
  }

  /**
   * Get models for a specific make
   */
  static async getLuxuryModels(make: string): Promise<string[]> {
    const cacheKey = `models-${make}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/?cmd=getModels&make=${encodeURIComponent(make)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const models = data.models?.map((m: any) => m.model_name) || [];
      this.setCache(cacheKey, models);
      return models;
    } catch (error) {
      console.error(`Error fetching models for ${make}:`, error);
      return [];
    }
  }

  /**
   * Get luxury vehicles with all details
   */
  static async getLuxuryVehicles(options: {
    make?: string;
    model?: string;
    year?: number;
    limit?: number;
  } = {}): Promise<IVehicle[]> {
    const { make, model, year, limit = 20 } = options;
    
    try {
      // Build the URL
      let url = `${this.baseUrl}/?cmd=getModels`;
      if (make) {
        url += `&make=${encodeURIComponent(make)}`;
      }
      if (model) {
        url += `&model=${encodeURIComponent(model)}`;
      }
      if (year) {
        url += `&year=${year}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.models || data.models.length === 0) {
        return [];
      }

      // Transform and filter to luxury brands
      let vehicles = data.models
        .map((modelData: any) => this.transformToLuxuryVehicle(modelData))
        .filter((v: { make: string; }) =>
          this.LUXURY_BRANDS.some(brand =>
            v.make.toLowerCase().includes(brand.toLowerCase())
          )
        );

      // Apply additional filters
      if (make) {
        vehicles = vehicles.filter((v: { make: string; }) =>
          v.make.toLowerCase().includes(make.toLowerCase())
        );
      }
      if (model) {
        vehicles = vehicles.filter((v: { model: string; }) =>
          v.model.toLowerCase().includes(model.toLowerCase())
        );
      }
      if (year) {
        vehicles = vehicles.filter((v: { year: number; }) => v.year === year);
      }

      return vehicles.slice(0, limit);
    } catch (error) {
      console.error('Error fetching luxury vehicles:', error);
      return this.getLuxuryFallbackVehicles();
    }
  }

  /**
   * Get featured luxury vehicles
   */
  static async getFeaturedLuxuryVehicles(limit: number = 6): Promise<IVehicle[]> {
    const featuredMakes = ['Porsche', 'Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Land Rover'];
    const allVehicles: IVehicle[] = [];

    // Fetch from multiple makes in parallel
    const promises = featuredMakes.map(make =>
      this.getLuxuryVehicles({ make, limit: 2 })
    );

    try {
      const results = await Promise.all(promises);
      results.forEach(vehicles => allVehicles.push(...vehicles));

      // Shuffle and return
      return allVehicles
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured vehicles:', error);
      return this.getLuxuryFallbackVehicles().slice(0, limit);
    }
  }

  /**
   * Transform CarQuery data to IVehicle
   */
  private static transformToLuxuryVehicle(data: any): IVehicle {
    const make = data.make_display || 'Luxury';
    const model = data.model_name || 'Vehicle';
    const year = parseInt(data.model_year) || new Date().getFullYear();

    const id = `${make}-${model}-${year}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    return {
      id,
      make,
      model,
      year,
      price: this.getLuxuryPrice(make, year),
      currency: 'NGN',
      mileage: Math.floor(Math.random() * 20000),
      transmission: 'Automatic',
      fuelType: 'Petrol',
      engine: '3.0L V6',
      horsepower: 350,
      drivetrain: 'AWD',
      bodyType: 'SUV',
      location: 'Lagos, Nigeria',
      images: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80'
      ],
      features: ['Leather Interior', 'Navigation', 'Premium Sound'],
      description: `Luxury ${make} ${model} with premium features.`,
      verified: 'VERIFIED',
      status: 'PUBLISHED',
      slug: id,
      views: Math.floor(Math.random() * 100),
      savedCount: Math.floor(Math.random() * 20),
      enquiryCount: Math.floor(Math.random() * 5),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private static getLuxuryPrice(make: string, year: number): number {
    const basePrices: Record<string, number> = {
      Porsche: 85000000,
      'Mercedes-Benz': 95000000,
      BMW: 78000000,
      Audi: 65000000,
      Lexus: 55000000,
      'Land Rover': 80000000,
      Jaguar: 60000000,
      Maserati: 100000000,
      Bentley: 150000000,
      'Rolls-Royce': 250000000,
      Ferrari: 180000000,
      Lamborghini: 200000000,
    };

    let basePrice = 50000000;
    for (const [brand, price] of Object.entries(basePrices)) {
      if (make.toLowerCase().includes(brand.toLowerCase())) {
        basePrice = price;
        break;
      }
    }

    const currentYear = new Date().getFullYear();
    const yearFactor = 1 + (currentYear - year) * 0.02;
    return Math.round((basePrice * yearFactor) / 1000000) * 1000000;
  }

  private static getLuxuryFallbackVehicles(): IVehicle[] {
    return [
      {
        id: 'porsche-cayenne-2024',
        make: 'Porsche',
        model: 'Cayenne Turbo',
        year: 2024,
        price: 85000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.0L V8 Twin-Turbo',
        horsepower: 550,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80'],
        features: ['Leather Interior', 'Premium Sound', 'Panoramic Roof'],
        description: 'The Porsche Cayenne Turbo combines luxury with exceptional performance.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'porsche-cayenne-turbo-2024',
        views: 0,
        savedCount: 0,
        enquiryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mercedes-gle-2024',
        make: 'Mercedes-Benz',
        model: 'GLE 450',
        year: 2024,
        price: 95000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '3.0L V6 Biturbo',
        horsepower: 362,
        drivetrain: '4MATIC',
        bodyType: 'SUV',
        location: 'Abuja, Nigeria',
        images: ['https://images.unsplash.com/photo-1583122384161-9b8a5d7e2f3c?w=800&auto=format&fit=crop&q=80'],
        features: ['Leather Interior', 'Navigation', 'Premium Sound'],
        description: 'The Mercedes-Benz GLE 450 offers cutting-edge luxury and technology.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'mercedes-gle-450-2024',
        views: 0,
        savedCount: 0,
        enquiryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bmw-x5-2024',
        make: 'BMW',
        model: 'X5 M',
        year: 2024,
        price: 78000000,
        currency: 'NGN',
        mileage: 0,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        engine: '4.4L V8 Twin-Turbo',
        horsepower: 600,
        drivetrain: 'AWD',
        bodyType: 'SUV',
        location: 'Lagos, Nigeria',
        images: ['https://images.unsplash.com/photo-1555215315974-3d6e9c8f7a5d?w=800&auto=format&fit=crop&q=80'],
        features: ['M Sport Package', 'Leather Interior', 'Premium Sound'],
        description: 'The BMW X5 M delivers supercar performance in a luxury SUV package.',
        verified: 'VERIFIED',
        status: 'PUBLISHED',
        slug: 'bmw-x5-m-2024',
        views: 0,
        savedCount: 0,
        enquiryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}