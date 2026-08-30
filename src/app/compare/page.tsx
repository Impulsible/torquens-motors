import type { Metadata } from 'next';
import ComparePageContent from './ComparePageContent';

export const metadata: Metadata = {
  title: 'Comparative Telemetry | TORQUENS MOTORS',
  description:
    'Side-by-side comparative analysis of world-class luxury vehicles, hypercars, and bespoke allocations.',
  keywords: 'compare luxury cars, vehicle comparison, supercar specs, TORQUENS',
};

export default function ComparePage() {
  return <ComparePageContent />;
}