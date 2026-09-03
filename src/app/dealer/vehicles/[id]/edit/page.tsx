import { notFound } from 'next/navigation';
import { InventoryService } from '@/services/inventory.service';
import EditVehicleForm from './EditVehicleForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params;

  // This runs safely on the server — no client bundle pollution
  const vehicle = await InventoryService.getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  // Serialize MongoDB ObjectIds and Dates into plain JSON for the client
  const serializedVehicle = JSON.parse(JSON.stringify(vehicle));

  return <EditVehicleForm vehicle={serializedVehicle} vehicleId={id} />;
}