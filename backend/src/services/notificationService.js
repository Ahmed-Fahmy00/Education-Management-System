const AuditLog = require("../models/AuditLog");

/**
 * Senior Notification & Audit Service
 * Structured for scalability and asynchronous operations.
 */
class NotificationService {
  /**
   * Notify staff member (Asynchronous pattern)
   */
  async notifyLeaveStatus(staffId, status, leaveRequestId) {
    const timestamp = new Date().toLocaleString();
    
    // In a real senior-level system, this would push to a message broker (RabbitMQ/Kafka)
    // or a task queue (BullMQ/Sidekiq) to avoid blocking the main request cycle.
    
    setImmediate(() => {
      console.log(`[ASYNC-TASK] Processing notification for Staff ${staffId}...`);
      console.log(`[NOTIFICATION] Your Leave Request (${leaveRequestId}) has been ${status.toUpperCase()}.`);
    });

    return true; 
  }

  /**
   * Log an audit action to the dedicated AuditLog collection
   */
  async logAudit(data) {
    try {
      const log = new AuditLog({
        targetId: data.targetId,
        targetModel: data.targetModel,
        action: data.action,
        performedBy: data.performedBy,
        changes: data.changes,
        metadata: data.metadata
      });
      
      // We don't await this if we want it to be non-blocking in the controller,
      // but usually for Audit, we want to ensure it's saved.
      await log.save();
      console.log(`[AUDIT-SAVED] ${data.action} for ${data.targetModel} ${data.targetId}`);
    } catch (err) {
      console.error("[AUDIT-ERROR] Failed to save audit log:", err.message);
    }
  }
}

module.exports = new NotificationService();
