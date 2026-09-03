/* eslint-disable @typescript-eslint/no-explicit-any */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Car, Sparkles, Grid } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { SEOHead } from '@/components/seo/SEOHead';
import { StructuredData } from '@/components/seo/StructuredData';
import { 
  generateCollectionSEO, 
  generateCollectionStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData
} from '@/lib/seo';
import { CollectionService } from '@/services/collection.service';

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function mapVehicleToCardProps(vehicle: any) {
  let verified: boolean | 'UNVERIFIED' | 'VERIFIED' | 'PENDING' = 'UNVERIFIED';
  
  if (vehicle.verified === 'VERIFIED' || vehicle.verified === true) {
    verified = 'VERIFIED';
  } else if (vehicle.verified === 'PENDING' || vehicle.verified === 'pending') {
    verified = 'PENDING';
  } else if (vehicle.verified === 'UNVERIFIED' || vehicle.verified === false) {
    verified = 'UNVERIFIED';
  }

  const parsedPower = typeof vehicle.power === 'number' 
    ? vehicle.power 
    : typeof vehicle.horsepower === 'number' 
    ? vehicle.horsepower 
    : parseInt(vehicle.power || vehicle.horsepower, 10) || 300;

  return {
    id: vehicle.id || vehicle._id?.toString() || '',
    slug: vehicle.slug || vehicle.id || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year || 0,
    price: vehicle.price || 0,
    currency: vehicle.currency || 'NGN',
    mileage: vehicle.mileage || 0,
    images: vehicle.images || [],
    transmission: vehicle.transmission || 'Automatic',
    fuelType: vehicle.fuelType || 'Petrol',
    verified: verified,
    status: vehicle.status || 'PUBLISHED',
    location: vehicle.location || 'Lagos, Nigeria',
    power: parsedPower,
  };
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const collection = await CollectionService.getCollectionBySlug(slug);

    if (!collection) {
      return {
        title: 'Collection Not Found | TORQUENS MOTORS',
        description: 'The requested collection is not available.',
      };
    }

    const collectionData = collection as any;
    
    return {
      title: `${collectionData.name} | TORQUENS MOTORS`,
      description: collectionData.description || 'A curated collection of exceptional vehicles.',
      keywords: `${collectionData.name}, luxury vehicles, curated collection, TORQUENS MOTORS`,
      openGraph: {
        title: `${collectionData.name} | TORQUENS MOTORS`,
        description: collectionData.description || 'A curated collection of exceptional vehicles.',
        images: collectionData.image ? [{ url: collectionData.image }] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching collection for metadata:', error);
    return {
      title: 'Collection | TORQUENS MOTORS',
      description: 'A curated collection of exceptional vehicles.',
    };
  }
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  
  let collection: any = null;
  let vehicles: any[] = [];
  
  try {
    collection = await CollectionService.getCollectionBySlug(slug);
    
    if (collection) {
      const collectionData = collection as any;
      if (collectionData.vehicles && collectionData.vehicles.length > 0) {
        vehicles = collectionData.vehicles;
      }
    }
  } catch (error) {
    console.error('Error fetching collection:', error);
  }

  if (!collection) {
    notFound();
  }

  const collectionData = collection as any;
  const vehicleCount = vehicles.length || collectionData.vehicleCount || 0;

  const seoMetadata = generateCollectionSEO(collectionData);
  const structuredData = generateCollectionStructuredData(collectionData);
  const organizationData = generateOrganizationStructuredData();
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: collectionData.name, url: `/collections/${collectionData.slug}` },
  ]);

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <StructuredData data={structuredData} />
      <StructuredData data={breadcrumbData} />
      <StructuredData data={organizationData} />

      <main className="min-h-screen pt-20 pb-12 bg-obsidian text-primary">
        {/* Collection Header */}
        <section className="relative py-12 md:py-20 overflow-hidden bg-graphite border-b border-border">
          <div className="absolute inset-0 opacity-15">
            {collectionData.bannerImage && (
              <Image
                src={collectionData.bannerImage}
                alt={collectionData.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-graphite via-graphite/90 to-transparent" />
          
          <Container className="relative z-10">
            <div className="max-w-3xl space-y-4">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-secondary hover:text-gold transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-sm font-sans">Back to Collections</span>
              </Link>
              
              <div>
                <Badge variant="gold" size="md" className="mb-3">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Curated Collection
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-serif font-light text-primary">
                  {collectionData.name}
                </h1>
              </div>

              <p className="text-secondary font-sans text-sm md:text-base max-w-2xl leading-relaxed">
                {collectionData.description || 'A curated collection of exceptional vehicles.'}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <span className="flex items-center gap-2 text-sm text-gold font-mono font-semibold">
                  <Car className="h-4 w-4" />
                  {vehicleCount} Allocated Units
                </span>
              </div>
            </div>
          </Container>
        </section>

        {/* Vehicle Grid */}
        <Container className="py-12">
          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, idx) => (
                <div key={vehicle.id || vehicle._id?.toString() || idx}>
                  <VehicleCard 
                    vehicle={mapVehicleToCardProps(vehicle)} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center mx-auto mb-4 border border-border">
                <Grid className="h-8 w-8 text-muted" />
              </div>
              <h3 className="text-xl font-serif font-light text-primary mb-2">
                No Vehicles Currently in Collection
              </h3>
              <p className="text-secondary font-sans text-sm max-w-md mx-auto">
                This collection is currently being curated. Check back soon for exceptional vehicles.
              </p>
            </div>
          )}
        </Container>
      </main>
    </>
  );
}