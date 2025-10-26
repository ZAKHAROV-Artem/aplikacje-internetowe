// No-op dispatcher for internal system
class AnalyticsDispatcherRegistry {
  async dispatch(_event: any, _context: any): Promise<void> {
    // No-op: tracking removed for internal system
  }
}

const analyticsDispatcher = new AnalyticsDispatcherRegistry();

export { analyticsDispatcher };
