/* eslint-disable @typescript-eslint/no-explicit-any */
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export class Analytics {
  private static instance: Analytics;
  private initialized = false;

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Initialize analytics
   */
  initialize(): void {
    if (this.initialized) return;
    
    // Google Analytics
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      // Load GA script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Initialize GA
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    }

    this.initialized = true;
  }

  /**
   * Track a page view
   */
  trackPageView(url: string): void {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }

  /**
   * Track an event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  }

  /**
   * Track vehicle view
   */
  trackVehicleView(vehicleId: string, vehicleName: string): void {
    this.trackEvent({
      category: 'Vehicle',
      action: 'view',
      label: vehicleName,
      value: parseInt(vehicleId),
    });
  }

  /**
   * Track vehicle enquiry
   */
  trackVehicleEnquiry(vehicleId: string, vehicleName: string): void {
    this.trackEvent({
      category: 'Vehicle',
      action: 'enquiry',
      label: vehicleName,
      value: parseInt(vehicleId),
    });
  }

  /**
   * Track vehicle save
   */
  trackVehicleSave(vehicleId: string, vehicleName: string): void {
    this.trackEvent({
      category: 'Vehicle',
      action: 'save',
      label: vehicleName,
      value: parseInt(vehicleId),
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent({
      category: 'Search',
      action: 'search',
      label: query,
      value: resultsCount,
    });
  }

  /**
   * Track conversion
   */
  trackConversion(type: string, value: number): void {
    this.trackEvent({
      category: 'Conversion',
      action: type,
      value,
    });
  }
}

// Add gtag to window
declare global {
  interface Window {
    dataLayer: any[];
  }
}

function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(args);
  }
}