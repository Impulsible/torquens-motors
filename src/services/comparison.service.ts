/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types, FilterQuery } from 'mongoose';
import { Comparison } from '@/models/Comparison';
import { Vehicle } from '@/models/Vehicle';
import {
  findById,
  findOne,
  findMany,
  create,
  update,
  deleteOne,
} from './database';
import type { IVehicle } from '@/types';

// -----------------------------------------------------------------------------
// CONSTANTS & ERRORS
// -----------------------------------------------------------------------------

export const MAX_COMPARISON_VEHICLES = 4;

export class ComparisonError extends Error {
  constructor(
    message: string,
    public code:
      | 'NOT_FOUND'
      | 'LIMIT_REACHED'
      | 'INVALID_VEHICLE'
      | 'EMPTY'
      | 'UNAUTHORIZED'
  ) {
    super(message);
    this.name = 'ComparisonError';
  }
}

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface ComparisonData {
  id: string;
  vehicles: IVehicle[];
  vehicleIds: string[];
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonSpecRow {
  label: string;
  key: string;
  values: (string | number | null)[];
  /** True when values differ across the set */
  hasDifference: boolean;
  /** Per-column: true if this cell differs from the first vehicle */
  differences: boolean[];
  /** Hero metrics for gold highlight in UI */
  highlight?: boolean;
  unit?: string;
  format?: 'currency' | 'number' | 'text' | 'boolean';
}

export interface ComparisonRecommendations {
  bestValueId: string | null;
  bestPerformanceId: string | null;
  lowestMileageId: string | null;
  bestVerifiedId: string | null;
  summary: {
    bestValueLabel: string;
    bestPerformanceLabel: string;
    lowestMileageLabel: string;
    bestVerifiedLabel: string;
  };
}

export interface ComparisonOwner {
  userId?: string;
  sessionId?: string;
}

type LeanComparison = {
  _id?: Types.ObjectId;
  id?: string;
  user?: Types.ObjectId | string;
  sessionId?: string;
  vehicles: IVehicle[] | Types.ObjectId[] | string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

const DEALER_SAFE_SELECT =
  'name companyName logo verified rating location slug';

const VEHICLE_POPULATE = {
  path: 'vehicles',
  select:
    'slug make model year price currency mileage images transmission fuelType engine horsePower horsepower drivetrain bodyType location verified status color interiorColor condition featured views savedCount dealer',
  populate: {
    path: 'dealer',
    select: DEALER_SAFE_SELECT,
  },
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function toIdString(id: unknown): string {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (id instanceof Types.ObjectId) return id.toHexString();
  if (typeof id === 'object' && id !== null && 'toString' in id) {
    return String((id as { toString: () => string }).toString());
  }
  return String(id);
}

function assertObjectId(id: string, label = 'ID'): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new ComparisonError(`Invalid ${label}`, 'INVALID_VEHICLE');
  }
  return new Types.ObjectId(id);
}

function mapComparison(doc: LeanComparison | null): ComparisonData | null {
  if (!doc) return null;

  const vehicles = (Array.isArray(doc.vehicles) ? doc.vehicles : []) as IVehicle[];
  const id = toIdString(doc.id || doc._id);

  return {
    id,
    vehicles,
    vehicleIds: vehicles.map((v) => toIdString(v.id || (v as { _id?: unknown })._id)),
    count: vehicles.length,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt?.toString() || new Date().toISOString(),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : doc.updatedAt?.toString() || new Date().toISOString(),
  };
}

function buildOwnerQuery(owner: ComparisonOwner): FilterQuery<any> {
  if (owner.userId && Types.ObjectId.isValid(owner.userId)) {
    return { user: new Types.ObjectId(owner.userId) };
  }
  if (owner.sessionId) {
    return { sessionId: owner.sessionId };
  }
  throw new ComparisonError(
    'A userId or sessionId is required to manage comparisons',
    'UNAUTHORIZED'
  );
}

function vehicleLabel(v: IVehicle): string {
  return `${v.year} ${v.make} ${v.model}`;
}

function readNumeric(vehicle: IVehicle, key: string): number {
  const record = vehicle as unknown as Record<string, unknown>;
  const raw = record[key];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = Number(raw.replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function readString(vehicle: IVehicle, key: string): string | null {
  const record = vehicle as unknown as Record<string, unknown>;
  const raw = record[key];
  if (raw === null || raw === undefined || raw === '') return null;
  return String(raw);
}

// -----------------------------------------------------------------------------
// COMPARISON SERVICE
// -----------------------------------------------------------------------------

export class ComparisonService {
  /**
   * Fetch a comparison tray by its document ID.
   */
  static async getComparison(id: string): Promise<ComparisonData | null> {
    assertObjectId(id, 'comparison id');

    const comparison = await findById<any>(
      Comparison as any,
      id,
      {}, // ✅ Replace null with empty object
      { lean: true, populate: VEHICLE_POPULATE }
    );

    return mapComparison(comparison);
  }

  /**
   * Fetch the active comparison for a user or anonymous session.
   */
  static async getComparisonByOwner(
    owner: ComparisonOwner
  ): Promise<ComparisonData | null> {
    const query = buildOwnerQuery(owner);

    const comparison = await findOne<any>(
      Comparison as any,
      query,
      {}, // ✅ Replace null with empty object
      { lean: true, populate: VEHICLE_POPULATE }
    );

    return mapComparison(comparison);
  }

  /** @deprecated Prefer getComparisonByOwner */
  static async getComparisonByUser(userId: string): Promise<ComparisonData | null> {
    return this.getComparisonByOwner({ userId });
  }

  /**
   * Get or create a comparison tray for the owner.
   */
  static async getOrCreateComparison(
    owner: ComparisonOwner,
    initialVehicleIds: string[] = []
  ): Promise<ComparisonData> {
    const existing = await this.getComparisonByOwner(owner);
    if (existing) return existing;

    return this.createComparison(owner, initialVehicleIds);
  }

  /**
   * Create a new comparison tray.
   */
  static async createComparison(
    owner: ComparisonOwner,
    vehicleIds: string[] = []
  ): Promise<ComparisonData> {
    if (vehicleIds.length > MAX_COMPARISON_VEHICLES) {
      throw new ComparisonError(
        `Maximum ${MAX_COMPARISON_VEHICLES} vehicles can be compared`,
        'LIMIT_REACHED'
      );
    }

    // Validate all vehicle IDs exist & are published
    const uniqueIds = [...new Set(vehicleIds.map((id) => assertObjectId(id, 'vehicle id')))];

    if (uniqueIds.length > 0) {
      const found = await findMany<any>(
        Vehicle as any,
        { _id: { $in: uniqueIds }, status: 'PUBLISHED' },
        '_id',
        { lean: true }
      );

      if (found.length !== uniqueIds.length) {
        throw new ComparisonError(
          'One or more vehicles are invalid or unpublished',
          'INVALID_VEHICLE'
        );
      }
    }

    const payload: any = {
      vehicles: uniqueIds,
    };

    if (owner.userId && Types.ObjectId.isValid(owner.userId)) {
      payload.user = new Types.ObjectId(owner.userId);
    } else if (owner.sessionId) {
      payload.sessionId = owner.sessionId;
    } else {
      throw new ComparisonError(
        'A userId or sessionId is required',
        'UNAUTHORIZED'
      );
    }

    const created = await create(Comparison as any, payload) as any;

    const populated = await findById<any>(
      Comparison as any,
      toIdString(created.id || created._id),
      {}, // ✅ Replace null with empty object
      { lean: true, populate: VEHICLE_POPULATE }
    );

    const mapped = mapComparison(populated);
    if (!mapped) {
      throw new ComparisonError('Failed to create comparison', 'NOT_FOUND');
    }
    return mapped;
  }

  /**
   * Add a vehicle to an existing comparison (atomic, idempotent).
   */
  static async addVehicle(
    comparisonId: string,
    vehicleId: string
  ): Promise<ComparisonData> {
    const cId = assertObjectId(comparisonId, 'comparison id');
    const vId = assertObjectId(vehicleId, 'vehicle id');

    // Ensure vehicle exists and is published
    const vehicle = await findOne(
      Vehicle as any,
      { _id: vId, status: 'PUBLISHED' },
      '_id',
      { lean: true }
    );
    if (!vehicle) {
      throw new ComparisonError('Vehicle not found or unpublished', 'INVALID_VEHICLE');
    }

    const current = await findById<any>(Comparison as any, comparisonId);
    if (!current) {
      throw new ComparisonError('Comparison not found', 'NOT_FOUND');
    }

    const alreadyIn = current.vehicles.some(
      (id: any) => toIdString(id) === vId.toHexString()
    );

    if (alreadyIn) {
      // Idempotent success — return current populated state
      const populated = await this.getComparison(comparisonId);
      if (!populated) throw new ComparisonError('Comparison not found', 'NOT_FOUND');
      return populated;
    }

    if (current.vehicles.length >= MAX_COMPARISON_VEHICLES) {
      throw new ComparisonError(
        `Maximum ${MAX_COMPARISON_VEHICLES} vehicles can be compared. Remove one to add another.`,
        'LIMIT_REACHED'
      );
    }

    await update(
      Comparison as any,
      { _id: cId },
      { $addToSet: { vehicles: vId } }
    );

    const populated = await this.getComparison(comparisonId);
    if (!populated) throw new ComparisonError('Comparison not found', 'NOT_FOUND');
    return populated;
  }

  /** @deprecated Prefer addVehicle */
  static async addVehicleToComparison(
    comparisonId: string,
    vehicleId: string
  ): Promise<ComparisonData> {
    return this.addVehicle(comparisonId, vehicleId);
  }

  /**
   * Remove a vehicle from comparison (atomic).
   */
  static async removeVehicle(
    comparisonId: string,
    vehicleId: string
  ): Promise<ComparisonData> {
    const cId = assertObjectId(comparisonId, 'comparison id');
    const vId = assertObjectId(vehicleId, 'vehicle id');

    const current = await findById(Comparison as any, comparisonId);
    if (!current) {
      throw new ComparisonError('Comparison not found', 'NOT_FOUND');
    }

    await update(
      Comparison as any,
      { _id: cId },
      { $pull: { vehicles: vId } }
    );

    const populated = await this.getComparison(comparisonId);
    if (!populated) throw new ComparisonError('Comparison not found', 'NOT_FOUND');
    return populated;
  }

  /** @deprecated Prefer removeVehicle */
  static async removeVehicleFromComparison(
    comparisonId: string,
    vehicleId: string
  ): Promise<ComparisonData> {
    return this.removeVehicle(comparisonId, vehicleId);
  }

  /**
   * Replace the full vehicle set (e.g. bulk sync from client tray).
   */
  static async setVehicles(
    comparisonId: string,
    vehicleIds: string[]
  ): Promise<ComparisonData> {
    if (vehicleIds.length > MAX_COMPARISON_VEHICLES) {
      throw new ComparisonError(
        `Maximum ${MAX_COMPARISON_VEHICLES} vehicles can be compared`,
        'LIMIT_REACHED'
      );
    }

    const cId = assertObjectId(comparisonId, 'comparison id');
    const uniqueIds = [...new Set(vehicleIds.map((id) => assertObjectId(id, 'vehicle id')))];

    if (uniqueIds.length > 0) {
      const found = await findMany(
        Vehicle as any,
        { _id: { $in: uniqueIds }, status: 'PUBLISHED' },
        '_id',
        { lean: true }
      );
      if (found.length !== uniqueIds.length) {
        throw new ComparisonError(
          'One or more vehicles are invalid or unpublished',
          'INVALID_VEHICLE'
        );
      }
    }

    const updated = await update(
      Comparison as any,
      { _id: cId },
      { $set: { vehicles: uniqueIds } }
    );

    if (!updated) {
      throw new ComparisonError('Comparison not found', 'NOT_FOUND');
    }

    const populated = await this.getComparison(comparisonId);
    if (!populated) throw new ComparisonError('Comparison not found', 'NOT_FOUND');
    return populated;
  }

  /**
   * Clear all vehicles from a comparison without deleting the tray.
   */
  static async clearVehicles(comparisonId: string): Promise<ComparisonData> {
    return this.setVehicles(comparisonId, []);
  }

  /**
   * Permanently delete a comparison document.
   */
  static async deleteComparison(comparisonId: string): Promise<void> {
    assertObjectId(comparisonId, 'comparison id');
    await deleteOne(Comparison as any, { _id: comparisonId });
  }

  /**
   * Check whether a vehicle is already in the owner's comparison tray.
   */
  static async hasVehicle(
    owner: ComparisonOwner,
    vehicleId: string
  ): Promise<boolean> {
    const comparison = await this.getComparisonByOwner(owner);
    if (!comparison) return false;
    return comparison.vehicleIds.includes(vehicleId);
  }

  // ---------------------------------------------------------------------------
  // SPEC MATRIX & DIFF ENGINE (Pure — no DB)
  // ---------------------------------------------------------------------------

  /**
   * Build a display-ready specification matrix for the comparison table UI.
   */
  static getComparisonSpecs(vehicles: IVehicle[]): ComparisonSpecRow[] {
    if (!vehicles.length) return [];

    const rows: Array<{
      label: string;
      key: string;
      highlight?: boolean;
      unit?: string;
      format?: ComparisonSpecRow['format'];
      accessor: (v: IVehicle) => string | number | null;
    }> = [
      { label: 'Make', key: 'make', accessor: (v) => v.make },
      { label: 'Model', key: 'model', accessor: (v) => v.model },
      { label: 'Year', key: 'year', format: 'number', accessor: (v) => v.year },
      {
        label: 'Acquisition Price',
        key: 'price',
        highlight: true,
        format: 'currency',
        accessor: (v) => v.price,
      },
      {
        label: 'Odometer',
        key: 'mileage',
        highlight: true,
        unit: 'km',
        format: 'number',
        accessor: (v) => v.mileage,
      },
      {
        label: 'Power',
        key: 'horsePower',
        highlight: true,
        unit: 'hp',
        format: 'number',
        accessor: (v) =>
          readNumeric(v, 'horsePower') || readNumeric(v, 'horsepower') || null,
      },
      {
        label: 'Engine',
        key: 'engineSize',
        accessor: (v) => readString(v, 'engineSize') || readString(v, 'engine'),
      },
      {
        label: 'Transmission',
        key: 'transmission',
        accessor: (v) => v.transmission,
      },
      {
        label: 'Fuel Type',
        key: 'fuelType',
        accessor: (v) => v.fuelType,
      },
      {
        label: 'Drivetrain',
        key: 'drivetrain',
        accessor: (v) => readString(v, 'drivetrain'),
      },
      {
        label: 'Body Style',
        key: 'bodyType',
        accessor: (v) => readString(v, 'bodyType'),
      },
      {
        label: 'Condition',
        key: 'condition',
        accessor: (v) => readString(v, 'condition'),
      },
      {
        label: 'Exterior Colour',
        key: 'color',
        accessor: (v) => readString(v, 'color'),
      },
      {
        label: 'Location',
        key: 'location',
        accessor: (v) => v.location,
      },
      {
        label: 'Verification',
        key: 'verified',
        format: 'boolean',
        accessor: (v) =>
          v.verified === 'VERIFIED' ? 'TORQUENS Verified' : 'Unverified',
      },
    ];

    return rows.map((row) => {
      const values = vehicles.map((v) => row.accessor(v));
      const first = values[0];
      const differences = values.map((val) => {
        // Normalize for comparison
        if (val === first) return false;
        if (val == null && first == null) return false;
        return String(val) !== String(first);
      });
      const hasDifference = differences.some(Boolean);

      return {
        label: row.label,
        key: row.key,
        values,
        differences,
        hasDifference,
        highlight: row.highlight,
        unit: row.unit,
        format: row.format,
      };
    });
  }

  /**
   * Spec rows that actually differ — ideal for "Show differences only" UI toggle.
   */
  static getComparisonDifferences(vehicles: IVehicle[]): ComparisonSpecRow[] {
    return this.getComparisonSpecs(vehicles).filter((row) => row.hasDifference);
  }

  /**
   * Intelligent picks across the compared set.
   */
  static getRecommendations(vehicles: IVehicle[]): ComparisonRecommendations {
    if (!vehicles.length) {
      return {
        bestValueId: null,
        bestPerformanceId: null,
        lowestMileageId: null,
        bestVerifiedId: null,
        summary: {
          bestValueLabel: '—',
          bestPerformanceLabel: '—',
          lowestMileageLabel: '—',
          bestVerifiedLabel: '—',
        },
      };
    }

    let bestValue = vehicles[0];
    let bestPerformance = vehicles[0];
    let lowestMileage = vehicles[0];
    let bestVerified: IVehicle | null = null;

    for (const vehicle of vehicles) {
      if (vehicle.price < bestValue.price) bestValue = vehicle;

      const power =
        readNumeric(vehicle, 'horsePower') || readNumeric(vehicle, 'horsepower');
      const bestPower =
        readNumeric(bestPerformance, 'horsePower') ||
        readNumeric(bestPerformance, 'horsepower');
      if (power > bestPower) bestPerformance = vehicle;

      if (vehicle.mileage < lowestMileage.mileage) lowestMileage = vehicle;

      const isVerified = vehicle.verified === 'VERIFIED';
      if (isVerified) {
        if (!bestVerified || vehicle.price < bestVerified.price) {
          bestVerified = vehicle;
        }
      }
    }

    return {
      bestValueId: toIdString(bestValue.id),
      bestPerformanceId: toIdString(bestPerformance.id),
      lowestMileageId: toIdString(lowestMileage.id),
      bestVerifiedId: bestVerified ? toIdString(bestVerified.id) : null,
      summary: {
        bestValueLabel: vehicleLabel(bestValue),
        bestPerformanceLabel: vehicleLabel(bestPerformance),
        lowestMileageLabel: vehicleLabel(lowestMileage),
        bestVerifiedLabel: bestVerified ? vehicleLabel(bestVerified) : 'None verified',
      },
    };
  }

  /**
   * Merge guest session comparison into a user account on login.
   */
  static async mergeSessionIntoUser(
    sessionId: string,
    userId: string
  ): Promise<ComparisonData | null> {
    if (!sessionId || !Types.ObjectId.isValid(userId)) return null;

    const [sessionComp, userComp] = await Promise.all([
      this.getComparisonByOwner({ sessionId }),
      this.getComparisonByOwner({ userId }),
    ]);

    if (!sessionComp) return userComp;

    if (!userComp) {
      // Attach session tray to user
      await update(
        Comparison as any,
        { _id: sessionComp.id },
        {
          $set: { user: new Types.ObjectId(userId) },
          $unset: { sessionId: 1 },
        }
      );
      return this.getComparison(sessionComp.id);
    }

    // Merge vehicle IDs (cap at MAX)
    const merged = [
      ...new Set([...userComp.vehicleIds, ...sessionComp.vehicleIds]),
    ].slice(0, MAX_COMPARISON_VEHICLES);

    await this.setVehicles(userComp.id, merged);
    await this.deleteComparison(sessionComp.id);

    return this.getComparison(userComp.id);
  }
}

export default ComparisonService;