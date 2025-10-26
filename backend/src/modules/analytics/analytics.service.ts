class AnalyticsService {
  /**
   * Record an analytics event (no-op for internal system)
   */
  async record(
    _event: string,
    _options?: {
      customerId?: string;
      magnoliCustomerId?: string;
      payload?: Record<string, unknown>;
      autoDispatch?: boolean;
    }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    // No-op: tracking removed for internal system
    return { success: true };
  }

  /**
   * Record an analytics event (no-op for internal system)
   */
  async recordEvent(
    _event: string,
    _userId?: string,
    _properties?: Record<string, unknown>
  ): Promise<void> {
    // No-op: tracking removed for internal system
  }

  /**
   * Dispatch analytics event (no-op for internal system)
   */
  async dispatch(_event: any): Promise<void> {
    // No-op: tracking removed for internal system
  }

  /**
   * Process pending events (no-op for internal system)
   */
  async processPending(
    _limit = 50
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    // No-op: tracking removed for internal system
    return { success: true, data: { processed: 0 } };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
