import { ShowroomService } from '@/services/showroom.service';
import { carAPIs } from '@/config/car-apis';

let initialized = false;

/**
 * Initialize all configured APIs
 * Call this once during app startup (server-side only)
 */
export function initializeAPIs(): void {
  // Only run on server
  if (typeof window !== 'undefined') {
    console.log('⚠️ [TORQUENS] API initialization skipped (client-side)');
    return;
  }

  if (initialized) {
    console.log('⚠️ [TORQUENS] APIs already initialized');
    return;
  }

  try {
    // Check if CarAPIs are configured
    const apis = carAPIs || [];
    if (apis.length === 0) {
      console.warn('⚠️ [TORQUENS] No APIs configured in car-apis.ts');
      return;
    }

    // Register each API
    ShowroomService.initializeAPIs(apis);
    
    initialized = true;
    console.log(`✅ [TORQUENS] ${apis.length} APIs initialized successfully`);
    
    // Log API status
    apis.forEach(api => {
      console.log(`  📡 ${api.name}: ${api.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      if (api.enabled) {
        console.log(`     🔗 ${api.baseUrl}`);
        console.log(`     📋 ${Object.keys(api.mappings || {}).length} field mappings`);
      }
    });
  } catch (error) {
    console.error('❌ [TORQUENS] Failed to initialize APIs:', error);
  }
}

/**
 * Get API initialization status
 */
export function isAPIsInitialized(): boolean {
  return initialized;
}

/**
 * Re-initialize APIs (useful for development)
 */
export function reinitializeAPIs(): void {
  initialized = false;
  initializeAPIs();
}