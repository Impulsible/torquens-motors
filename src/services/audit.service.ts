/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export class AuditService {
  /**
   * Log an action for audit purposes
   */
  static async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    // In production, store in a separate collection
    console.log('AUDIT:', {
      ...entry,
      timestamp: new Date().toISOString(),
    });
    
    // For now, we'll store in memory
    // In production, use a dedicated audit collection
  }

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(_userId: string): Promise<any[]> {
    // In production, query the audit collection
    return [];
  }

  /**
   * Log user login
   */
  static async logLogin(userId: string, ip?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: 'LOGIN',
      resource: 'user',
      resourceId: userId,
      details: { method: 'credentials' },
      ip,
      userAgent,
    });
  }

  /**
   * Log user logout
   */
  static async logLogout(userId: string): Promise<void> {
    await this.log({
      userId,
      action: 'LOGOUT',
      resource: 'user',
      resourceId: userId,
    });
  }

  /**
   * Log vehicle creation
   */
  static async logVehicleCreation(userId: string, vehicleId: string, details: any): Promise<void> {
    await this.log({
      userId,
      action: 'CREATE',
      resource: 'vehicle',
      resourceId: vehicleId,
      details,
    });
  }

  /**
   * Log vehicle update
   */
  static async logVehicleUpdate(userId: string, vehicleId: string, changes: any): Promise<void> {
    await this.log({
      userId,
      action: 'UPDATE',
      resource: 'vehicle',
      resourceId: vehicleId,
      details: { changes },
    });
  }

  /**
   * Log vehicle deletion
   */
  static async logVehicleDeletion(userId: string, vehicleId: string): Promise<void> {
    await this.log({
      userId,
      action: 'DELETE',
      resource: 'vehicle',
      resourceId: vehicleId,
    });
  }

  /**
   * Log payment
   */
  static async logPayment(userId: string, paymentId: string, amount: number): Promise<void> {
    await this.log({
      userId,
      action: 'PAYMENT',
      resource: 'payment',
      resourceId: paymentId,
      details: { amount },
    });
  }

  /**
   * Log admin action
   */
  static async logAdminAction(
    adminId: string,
    action: string,
    target: string,
    targetId: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: `ADMIN_${action}`,
      resource: target,
      resourceId: targetId,
      details,
    });
  }
}

export default AuditService;