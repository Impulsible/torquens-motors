import { CarAPIConfig } from '@/services/car-api.service';

export const carAPIs: CarAPIConfig[] = [
  {
    id: 'torquens-london-desk',
    name: 'Mayfair Portfolio Register',
    baseUrl: process.env.CAR_API_URL || 'https://api.example.com/london/vehicles',
    apiKey: process.env.CAR_API_KEY,
    enabled: process.env.CAR_API_ENABLED === 'true',
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
    apiKey: process.env.CAR_API_KEY,
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