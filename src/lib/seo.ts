import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────
// DOMAIN ENTITY INTERFACES
// ─────────────────────────────────────────────────────────────

export interface DealerEntity {
  name: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface VehicleEntity {
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number; // 0 represents "Price Upon Request" (POA)
  currency?: string; // e.g., 'CHF', 'GBP', 'EUR', 'USD'
  location: string;
  mileage: number; // in kilometers
  transmission: 'Manual' | 'F1 Sequential' | 'Dual-Clutch' | 'Automatic' | 'Other';
  fuelType: 'Petrol' | 'Hybrid' | 'Electric' | 'Classic / Combustion';
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  dealer?: DealerEntity;
  chassisNumber?: string; // Confidential / Redacted for high-end privacy
}

export interface CollectionEntity {
  slug: string;
  name: string;
  description: string;
  image?: string;
  vehicleCount: number;
  featured: boolean;
  vehicles?: Partial<VehicleEntity>[];
}

// ─────────────────────────────────────────────────────────────
// SEO & METADATA INTERFACES
// ─────────────────────────────────────────────────────────────

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface VehicleSEOMetadata extends SEOMetadata {
  make: string;
  model: string;
  year: number;
  price: number;
  location: string;
}

export interface CollectionSEOMetadata extends SEOMetadata {
  name: string;
  vehicleCount: number;
  featured: boolean;
}

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Resolves a fully qualified absolute URL for canonical paths and static assets.
 */
function getAbsoluteUrl(path: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'https://www.torquens.ch';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Formats standard pricing or returns a "Price Upon Request" string.
 */
function formatPrice(price: number, currency = 'CHF'): string {
  if (!price || price === 0) return 'Price Upon Request';
  return new Intl.NumberFormat('en-CH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

// ─────────────────────────────────────────────────────────────
// SEO GENERATORS
// ─────────────────────────────────────────────────────────────

/**
 * Generate highly optimized SEO metadata for a high-end heritage vehicle
 */
export function generateVehicleSEO(vehicle: VehicleEntity): VehicleSEOMetadata {
  const formattedPriceLabel = formatPrice(vehicle.price, vehicle.currency);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} | TORQUENS MOTORS`;
  
  const description = vehicle.price > 0
    ? `Secure provenance certified ${vehicle.year} ${vehicle.make} ${vehicle.model}. Priced at ${formattedPriceLabel}. ${vehicle.mileage.toLocaleString('en-CH')} km, ${vehicle.transmission}, physical custody in ${vehicle.location}. Only at TORQUENS.`
    : `Secure provenance certified ${vehicle.year} ${vehicle.make} ${vehicle.model}. ${vehicle.mileage.toLocaleString('en-CH')} km, original ${vehicle.transmission} configuration. Available via private treaty in ${vehicle.location}. Price details upon credentialed request.`;

  const keywords = [
    vehicle.make,
    vehicle.model,
    `${vehicle.year} ${vehicle.make}`,
    `${vehicle.make} ${vehicle.model} for sale`,
    'historic chassis',
    'verified provenance',
    'hypercar private treaty',
    vehicle.location,
    'TORQUENS MOTORS',
    'Geneva registry',
  ];

  return {
    title,
    description,
    keywords,
    canonicalUrl: getAbsoluteUrl(`/vehicles/${vehicle.slug}`),
    ogImage: vehicle.images?.[0] || getAbsoluteUrl('/default-og-image.jpg'),
    ogType: 'product',
    twitterCard: 'summary_large_image',
    author: 'TORQUENS Private Client Registry',
    publishedTime: vehicle.createdAt,
    modifiedTime: vehicle.updatedAt,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    location: vehicle.location,
  };
}

/**
 * Generate optimized SEO metadata for a curated collection
 */
export function generateCollectionSEO(collection: CollectionEntity): CollectionSEOMetadata {
  const title = `${collection.name} | Curated Collections | TORQUENS MOTORS`;
  const description = `Explore the prestigious ${collection.name} archive. Featuring ${collection.vehicleCount} highly vetted, historically significant motorcars currently registered in our private network.`;
  const keywords = [
    collection.name,
    'curated luxury fleet',
    'automotive portfolio',
    'blue-chip investment cars',
    'limited production homologation',
    'TORQUENS MOTORS',
  ];

  return {
    title,
    description,
    keywords,
    canonicalUrl: getAbsoluteUrl(`/collections/${collection.slug}`),
    ogImage: collection.image || getAbsoluteUrl('/default-og-image.jpg'),
    ogType: 'website',
    twitterCard: 'summary_large_image',
    author: 'TORQUENS Private Client Registry',
    name: collection.name,
    vehicleCount: collection.vehicleCount,
    featured: collection.featured,
  };
}

/**
 * Generate standard SEO metadata for generic institutional pages (About, Philosophy, Escrow)
 */
export function generatePageSEO(
  title: string,
  description: string,
  keywords?: string[],
  ogImage?: string
): SEOMetadata {
  return {
    title: `${title} | TORQUENS MOTORS`,
    description,
    keywords: keywords || [
      'private client registry',
      'automotive escrow',
      'Geneva FreePort custody',
      'Mayfair advisory',
      'TORQUENS',
    ],
    ogImage: ogImage || getAbsoluteUrl('/default-og-image.jpg'),
    ogType: 'website',
    twitterCard: 'summary_large_image',
    author: 'TORQUENS Private Client Registry',
  };
}

// ✅ Map ogType to valid Next.js OpenGraph types
const ogTypeMap: Record<string, 'website' | 'article' | 'profile'> = {
  website: 'website',
  article: 'article',
  profile: 'profile',
  product: 'website', // Map product to website for compatibility
};

/**
 * Bridge utility converting custom SEOMetadata objects into Next.js App Router compatible Metadata structures.
 */
export function toNextMetadata(seo: SEOMetadata): Metadata {
  const robots = seo.noIndex || seo.noFollow
    ? {
        index: !seo.noIndex,
        follow: !seo.noFollow,
      }
    : undefined;

  // ✅ Fix: Map ogType to valid Next.js OpenGraph type
  const ogType = seo.ogType ? ogTypeMap[seo.ogType] || 'website' : 'website';

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      type: ogType,
      siteName: 'TORQUENS MOTORS',
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage,
              width: 1200,
              height: 630,
              alt: seo.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: seo.twitterCard || 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    robots,
    other: {
      'author': seo.author || 'TORQUENS MOTORS',
      ...(seo.publishedTime && { 'article:published_time': seo.publishedTime }),
      ...(seo.modifiedTime && { 'article:modified_time': seo.modifiedTime }),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// JSON-LD STRUCTURED DATA GENERATORS (SCHEMA.ORG)
// ─────────────────────────────────────────────────────────────

/**
 * Generate JSON-LD structured data for a certified vehicle profile.
 * Supports private portfolio pricing protocols (POA/Request pricing).
 */
export function generateVehicleStructuredData(vehicle: VehicleEntity): Record<string, unknown> {
  const currencyCode = vehicle.currency || 'CHF';
  const hasValidPrice = vehicle.price && vehicle.price > 0;

  const offerDetails: Record<string, unknown> = {
    '@type': 'Offer',
    itemCondition: 'https://schema.org/UsedCondition',
    availability:
      vehicle.status === 'SOLD'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: vehicle.dealer?.name || 'TORQUENS MOTORS',
      url: getAbsoluteUrl('/'),
    },
  };

  if (hasValidPrice) {
    offerDetails.price = vehicle.price;
    offerDetails.priceCurrency = currencyCode;
  } else {
    // Elegant fallback schema formatting for Price Upon Request (POA) products
    offerDetails.priceSpecification = {
      '@type': 'PriceSpecification',
      valueAddedTaxIncluded: true,
      price: '0',
      priceCurrency: currencyCode,
      description: 'Price Available Upon Private Advisory Request',
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.description,
    image: vehicle.images?.[0] || getAbsoluteUrl('/default-og-image.jpg'),
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.year.toString(),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT', // KMT = Kilometers
    },
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    offers: offerDetails,
  };
}

/**
 * Generate JSON-LD structured data for a premium historical registry collection.
 */
export function generateCollectionStructuredData(collection: CollectionEntity): Record<string, unknown> {
  const listItems =
    collection.vehicles?.map((vehicle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Car',
        name: `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim(),
        url: vehicle.slug ? getAbsoluteUrl(`/vehicles/${vehicle.slug}`) : undefined,
      },
    })) || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    image: collection.image || getAbsoluteUrl('/default-og-image.jpg'),
    about: {
      '@type': 'Thing',
      name: collection.name,
      description: collection.description,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.vehicleCount,
      itemListElement: listItems,
    },
  };
}

/**
 * Generate institutional JSON-LD structured data for the global parent organization.
 * Real, production-grade endpoints mapping to established global custody networks.
 */
export function generateOrganizationStructuredData(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TORQUENS MOTORS',
    description: 'The premier global private client registry and sovereign custody platform for high-tier automotive assets.',
    url: getAbsoluteUrl('/'),
    logo: getAbsoluteUrl('/logo.png'),
    foundingDate: '2008',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Route de Pré-Bois 20',
      addressLocality: 'Meyrin',
      addressRegion: 'Geneva',
      postalCode: '1215',
      addressCountry: 'CH',
    },
    sameAs: [
      'https://instagram.com/torquensmotors',
      'https://twitter.com/torquensmotors',
      'https://youtube.com/torquensmotors',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+41-22-518-01-22',
      contactType: 'Global Private Client Desk',
      email: 'concierge@torquens.ch',
      availableLanguage: ['English', 'German', 'French', 'Italian'],
    },
  };
}

/**
 * Generate standard breadcrumb navigation structure to support search engine rich results.
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  };
}