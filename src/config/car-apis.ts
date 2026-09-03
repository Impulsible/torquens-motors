import { CarAPIConfig } from '@/services/car-api.service';
import { isServer } from '@/lib/server-helpers';

// Only access environment variables on the server
const getEnv = (key: string): string | undefined => {
  if (isServer()) {
    return process.env[key];
  }
  return undefined;
};

export const carAPIs: CarAPIConfig[] = [
  {
    id: 'torquens-london-desk',
    name: 'Mayfair Portfolio Register',
    baseUrl: getEnv('CAR_API_URL') || 'https://api.example.com/london/vehicles',
    apiKey: getEnv('CAR_API_KEY'),
    enabled: getEnv('CAR_API_ENABLED') === 'true',
    syncInterval: 60,
    mappings: {
      make: 'brand',
      model: 'vehicleModel',
      year: 'modelYear',
      price: 'askingPrice',
      mileage: 'odometer',
      transmission: 'gearbox',
      fuelType: 'fuel',
      engine: 'engineSize',
      horsepower: 'power',
      drivetrain: 'driveType',
      bodyType: 'category',
      location: 'city',
      images: 'photos',
      description: 'notes',
      vin: 'chassisNumber',
      externalId: 'id',
    },
  },
  {
    id: 'geneva-vault-registry',
    name: 'Geneva FreePort Vault Custody',
    baseUrl: 'https://api.example.com/ch/vaults',
    apiKey: getEnv('CAR_API_KEY'),
    enabled: false, // Disabled by default
    syncInterval: 120,
    mappings: {
      make: 'make',
      model: 'model',
      year: 'year',
      price: 'price',
      vin: 'chassis_serial_number',
    }
  },
  // Add more APIs as needed
];

/**
 * Get enabled APIs only
 */
export function getEnabledAPIs(): CarAPIConfig[] {
  return carAPIs.filter(api => api.enabled);
}

/**
 * Get a specific API by ID
 */
export function getAPIById(id: string): CarAPIConfig | undefined {
  return carAPIs.find(api => api.id === id);
}

/**
 * Check if any APIs are configured
 */
export function hasAPIs(): boolean {
  return carAPIs.length > 0;
}

/**
 * Get the count of enabled APIs
 */
export function getEnabledAPICount(): number {
  return getEnabledAPIs().length;
}

/**
 * Get API configuration for a specific ID with fallback
 */
export function getAPIOrThrow(id: string): CarAPIConfig {
  const api = getAPIById(id);
  if (!api) {
    throw new Error(`API with ID "${id}" not found`);
  }
  return api;
}

/**
 * Validate all API configurations
 */
export function validateAPIs(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  carAPIs.forEach(api => {
    if (!api.id) {
      errors.push(`API "${api.name}" is missing an ID`);
    }
    if (!api.name) {
      errors.push(`API with ID "${api.id}" is missing a name`);
    }
    if (api.enabled && (!api.baseUrl || api.baseUrl.includes('example.com'))) {
      errors.push(`API "${api.name}" is enabled but has an invalid baseUrl`);
    }
    if (api.enabled && !api.mappings) {
      errors.push(`API "${api.name}" is enabled but has no field mappings`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log API configuration status (for debugging)
 */
export function logAPIStatus(): void {
  console.log(`📡 API Configuration Status:`);
  console.log(`   Total APIs: ${carAPIs.length}`);
  console.log(`   Enabled APIs: ${getEnabledAPICount()}`);
  console.log(`   Disabled APIs: ${carAPIs.length - getEnabledAPICount()}`);
  
  const validation = validateAPIs();
  if (!validation.valid) {
    console.error(`   ❌ Validation errors:`, validation.errors);
  } else {
    console.log(`   ✅ All APIs validated successfully`);
  }
  
  carAPIs.forEach(api => {
    const status = api.enabled ? '✅' : '❌';
    console.log(`   ${status} ${api.name} (${api.id})`);
    if (api.enabled) {
      console.log(`      🔗 ${api.baseUrl}`);
      console.log(`      📋 ${Object.keys(api.mappings || {}).length} field mappings`);
    }
  });
}