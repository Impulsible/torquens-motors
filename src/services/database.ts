/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, {
  type Model,
  type UpdateQuery,
  type QueryOptions,
  type ProjectionType,
  type PipelineStage,
  type ClientSession,
} from 'mongoose';
import { connectToDatabase } from '../lib/mongodb'; // Changed from default import to named import

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1 | 'asc' | 'desc'> | string;
  lean?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/* -------------------------------------------------------------------------- */
/*                              DATABASE SERVICE                              */
/* -------------------------------------------------------------------------- */

export class DatabaseService {
  /**
   * Finds a single document matching the query.
   * Defaults to `.lean()` for instant Next.js SSR serialization.
   */
  static async findOne<T>(
    model: Model<T>,
    query: Record<string, unknown>,
    projection?: ProjectionType<T>,
    options: QueryOptions<T> = { lean: true }
  ): Promise<T | null> {
    await connectToDatabase();
    return model.findOne(query, projection, options).exec() as Promise<T | null>;
  }

  /**
   * Finds a single document by its ObjectId string.
   */
  static async findById<T>(
    model: Model<T>,
    id: string | mongoose.Types.ObjectId,
    projection?: ProjectionType<T>,
    options: QueryOptions<T> = { lean: true }
  ): Promise<T | null> {
    await connectToDatabase();
    return model.findById(id, projection, options).exec() as Promise<T | null>;
  }

  /**
   * Finds multiple documents matching the query.
   */
  static async findMany<T>(
    model: Model<T>,
    query: Record<string, unknown> = {},
    projection?: ProjectionType<T>,
    options: QueryOptions<T> = { lean: true }
  ): Promise<T[]> {
    await connectToDatabase();
    return model.find(query, projection, options).exec() as Promise<T[]>;
  }

  /**
   * High-Performance Pagination Engine with full metadata calculations.
   */
  static async paginate<T>(
    model: Model<T>,
    query: Record<string, unknown> = {},
    options: PaginationOptions = {},
    projection?: ProjectionType<T>
  ): Promise<PaginatedResult<T>> {
    await connectToDatabase();

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 12));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };
    const lean = options.lean !== false;

    const [data, total] = await Promise.all([
      model
        .find(query, projection, { lean })
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .exec() as Promise<T[]>,
      model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Creates and persists a single document.
   */
  static async create<T>(
    model: Model<T>,
    data: Partial<T> | Record<string, unknown>
  ): Promise<T> {
    await connectToDatabase();
    const created = (await model.create(data as any)) as (T & { toObject?: () => T }) | T;

    if (typeof (created as { toObject?: () => T }).toObject === 'function') {
      return (created as { toObject: () => T }).toObject();
    }

    return created;
  }

  /**
   * Bulk inserts multiple documents.
   */
  static async insertMany<T>(
    model: Model<T>,
    docs: Array<Partial<T> | Record<string, unknown>>
  ): Promise<T[]> {
    await connectToDatabase();
    const result = await model.insertMany(docs);
    return result as unknown as T[];
  }

  /**
   * Updates a single document and returns the updated version.
   */
  static async update<T>(
    model: Model<T>,
    query: Record<string, unknown>,
    data: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true, runValidators: true, lean: true }
  ): Promise<T | null> {
    await connectToDatabase();
    return model
      .findOneAndUpdate(query, data, {
        new: true,
        runValidators: true,
        lean: true,
        ...options,
      })
      .exec() as Promise<T | null>;
  }

  /**
   * Updates a document directly by ID.
   */
  static async findByIdAndUpdate<T>(
    model: Model<T>,
    id: string | mongoose.Types.ObjectId,
    data: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true, runValidators: true, lean: true }
  ): Promise<T | null> {
    await connectToDatabase();
    return model
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        lean: true,
        ...options,
      })
      .exec() as Promise<T | null>;
  }

  /**
   * Deletes a single document.
   */
  static async delete<T>(
    model: Model<T>,
    query: Record<string, unknown>,
    options: QueryOptions<T> = { lean: true }
  ): Promise<T | null> {
    await connectToDatabase();
    return model.findOneAndDelete(query, options).exec() as Promise<T | null>;
  }

  /**
   * Deletes a document by ID.
   */
  static async findByIdAndDelete<T>(
    model: Model<T>,
    id: string | mongoose.Types.ObjectId,
    options: QueryOptions<T> = { lean: true }
  ): Promise<T | null> {
    await connectToDatabase();
    return model.findByIdAndDelete(id, options).exec() as Promise<T | null>;
  }

  /**
   * Batch deletes documents matching the query.
   */
  static async deleteMany<T>(
    model: Model<T>,
    query: Record<string, unknown> = {}
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    await connectToDatabase();
    return model.deleteMany(query).exec();
  }

  /**
   * Counts documents matching the query.
   */
  static async count<T>(
    model: Model<T>,
    query: Record<string, unknown> = {}
  ): Promise<number> {
    await connectToDatabase();
    return model.countDocuments(query).exec();
  }

  /**
   * Fast check to see if a document exists without loading it into memory.
   */
  static async exists<T>(
    model: Model<T>,
    query: Record<string, unknown>
  ): Promise<boolean> {
    await connectToDatabase();
    const result = await model.exists(query).exec();
    return Boolean(result);
  }

  /**
   * Executes a MongoDB aggregation pipeline.
   */
  static async aggregate<R = unknown>(
    model: Model<unknown>,
    pipeline: PipelineStage[]
  ): Promise<R[]> {
    await connectToDatabase();
    return model.aggregate<R>(pipeline).exec();
  }

  /**
   * Atomic Multi-Document Transaction Wrapper.
   * Automatically commits on success and rolls back on failure.
   */
  static async withTransaction<R>(
    callback: (session: ClientSession) => Promise<R>
  ): Promise<R> {
    await connectToDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

// Export individual functions for convenience
export const findOne = DatabaseService.findOne.bind(DatabaseService);
export const findById = DatabaseService.findById.bind(DatabaseService);
export const findMany = DatabaseService.findMany.bind(DatabaseService);
export const paginate = DatabaseService.paginate.bind(DatabaseService);
export const create = DatabaseService.create.bind(DatabaseService);
export const insertMany = DatabaseService.insertMany.bind(DatabaseService);
export const update = DatabaseService.update.bind(DatabaseService);
export const findByIdAndUpdate = DatabaseService.findByIdAndUpdate.bind(DatabaseService);
export const deleteOne = DatabaseService.delete.bind(DatabaseService);
export const findByIdAndDelete = DatabaseService.findByIdAndDelete.bind(DatabaseService);
export const deleteMany = DatabaseService.deleteMany.bind(DatabaseService);
export const count = DatabaseService.count.bind(DatabaseService);
export const exists = DatabaseService.exists.bind(DatabaseService);
export const aggregate = DatabaseService.aggregate.bind(DatabaseService);
export const withTransaction = DatabaseService.withTransaction.bind(DatabaseService);

// Default export
export default DatabaseService;