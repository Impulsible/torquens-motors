import Head from 'next/head';
import type { SEOMetadata } from '@/lib/seo';

interface SEOHeadProps {
  metadata: SEOMetadata;
  children?: React.ReactNode;
}

export function SEOHead({ metadata, children }: SEOHeadProps) {
  const {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noIndex = false,
    noFollow = false,
    author,
    publishedTime,
    modifiedTime,
  } = metadata;

  const canonical = canonicalUrl ? `${process.env.APP_URL}${canonicalUrl}` : undefined;
  const imageUrl = ogImage ? (ogImage.startsWith('http') ? ogImage : `${process.env.APP_URL}${ogImage}`) : undefined;

  return (
    <Head>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex" />}
      {noFollow && <meta name="robots" content="nofollow" />}
      {noIndex && noFollow && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:width" content="1200" />}
      {imageUrl && <meta property="og:image:height" content="630" />}
      <meta property="og:site_name" content="TORQUENS MOTORS" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* Article Meta */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {children}
    </Head>
  );
}